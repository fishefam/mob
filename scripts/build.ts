import type { FSWatcher } from 'chokidar'
import type { Message } from 'esbuild'

import { spawn } from 'child_process'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import { writeFileSync } from 'fs'
import { mkdirpSync } from 'mkdirp'
import { resolve } from 'path'

import {
  author,
  dependencies,
  description,
  devDependencies,
  main as jsonMain,
  license,
  name,
  version,
} from '../package.json'
import { getDirs, getNodeVersion, getOptionEntries } from './libs/constants'
import { clean, style } from './libs/plugins'
import { colorize, generateWorkerDTS, getCurrentTime, hasDir, isProd, print } from './libs/utils'

if (!process.env.ELECTRON_CMD) main()

/**
 * Main entry point for the script.
 */
export async function main() {
  const isValidNodeVersion = process.version === getNodeVersion()
  if (!isValidNodeVersion)
    print(
      colorize({ bg: 'red', text: '[Error]' }),
      `Node ${process.version} is not allowed. Supported version v20.11.1`,
    )
  if (isValidNodeVersion) {
    const { ELECTRON_CMD } = process.env
    const { assets, source, types } = getDirs()
    const watcher = chokidar.watch([source, assets, types], { ignoreInitial: true })
    const contexts = await getContexts()
    print(colorize({ bg: 'magenta', text: '[Build]' }), 'Building...')
    await build(contexts)
    applyPackageJSON()
    if (isProd() && ELECTRON_CMD) return
    if (isProd() && !ELECTRON_CMD) process.exit()
    print(colorize({ bg: 'magenta', text: '[Electron]' }), `Starting Electron app...`)
    watch(watcher, contexts)
  }
}

/**
 * Build the Electron application once using esbuild.
 * @param contexts - Array of esbuild build contexts.
 */
async function build(contexts: Build.Context[]) {
  const startTime = getCurrentTime()
  generateWorkerDTS()
  await Promise.all(contexts.map((context) => context.cancel()))
  await Promise.all(
    contexts.map((context) =>
      context.rebuild().catch((error) => {
        const { errors } = <{ [key in 'errors' | 'warnings']: Message[] }>error
        errors.forEach(({ location, pluginName, text }, index) => {
          if (!/The build was canceled/.test(text)) {
            if (index > 0) print()
            const printError = (...message: unknown[]) =>
              print(colorize({ bg: 'red', text: `[Error${index + 1}]` }), ...message)
            printError(text)
            if (pluginName.length) printError(pluginName)
            if (location) printError(location.file, `{ line: ${location.line}, column: ${location.column} }`)
          }
        })
      }),
    ),
  )
  const endTime = getCurrentTime()
  print(colorize({ bg: 'magenta', text: '[Build]' }), 'Complete in:', `${(endTime - startTime).toFixed(2)}s`)
}

/**
 * Get options for building the Electron application.
 * @param args.entry - Entry points for the build.
 * @param args.platform - Platform for the build.
 * @param args.cleanDisabled - [Optional] Indicates if cleaning is disabled.
 * @param args.isConfig - [Optional] Indicates if the configuration is being used.
 * @returns Options for the esbuild build process.
 */
function getOptions(args: {
  cleanEnabled?: boolean
  entry: Build.Entries
  isBundled?: boolean
  platform: Platform
}): Build.Options {
  const { cleanEnabled, entry, isBundled, platform } = args
  const { electron } = getDirs()
  return {
    bundle: isBundled,
    entryPoints: entry,
    external: isBundled ? ['electron'] : undefined,
    format: 'cjs',
    jsx: 'transform',
    legalComments: 'none',
    loader: { '.html': 'copy', '.json': 'copy' },
    logLevel: 'silent',
    minify: isProd(),
    outdir: electron,
    platform,
    plugins: [clean(cleanEnabled), style()],
    sourcemap: !isProd(),
    target: 'es2016',
    treeShaking: true,
  }
}

/**
 * Watch for file changes and rebuild the Electron app accordingly.
 * @param watcher - Chokidar file watcher.
 * @param contexts - Array of esbuild build contexts.
 */
function watch(watcher: FSWatcher, contexts: Build.Context[]) {
  const { electron } = getDirs()
  if (hasDir(electron)) {
    const cp = spawn(`cross-env APP_ENV=development electron-forge start ${electron}`, { shell: true })
    cp.stdout.setEncoding('utf-8')
    cp.stdout.on('close', () => process.exit())
    cp.stdout.on('data', (data) => print(data.trim()))
    const printWatcher = (...messages: unknown[]) => print(...messages)
    watcher
      .on('add', (path) => printWatcher(`File ${path} has been added`))
      .on('addDir', (path) => printWatcher(`Directory ${path} has been added`))
      .on('change', (path) => printWatcher(`File ${path} has been changed`))
      .on('unlink', (path) => printWatcher(`File ${path} has been removed`))
      .on('unlinkDir', (path) => printWatcher(`Directory ${path} has been removed`))
      .on('error', (error) => printWatcher(`Watcher error: ${error}`))
      .on('all', () => {
        print(colorize({ bg: 'magenta', text: '[Watch]' }), 'Rebuilding...')
        build(contexts)
      })
  }
}

/**
 * Generate and apply the updated package.json for Electron build.
 */
function applyPackageJSON() {
  const { electron } = getDirs()
  const devDeps = Object.fromEntries(
    (<const>[
      '@electron-forge/cli',
      '@electron-forge/maker-deb',
      '@electron-forge/maker-rpm',
      '@electron-forge/maker-squirrel',
      '@electron-forge/maker-zip',
      '@electron-forge/plugin-auto-unpack-natives',
      '@electron-forge/plugin-fuses',
      '@electron/fuses',
      'electron',
    ]).map((pkg) => [pkg, devDependencies[pkg]]),
  )
  const packageJSON = JSON.stringify({
    author,
    dependencies: { 'electron-squirrel-startup': dependencies['electron-squirrel-startup'] },
    description,
    devDependencies: devDeps,
    license,
    main: jsonMain,
    name,
    version,
  })
  mkdirpSync(electron)
  writeFileSync(resolve(electron, 'package.json'), packageJSON, { encoding: 'utf-8' })
}

/**
 * Get build contexts for Electron application.
 * @returns Array of esbuild build contexts.
 */
async function getContexts() {
  const entries = (<const>['node', 'browser']).map((platform) => ({
    paths: getOptionEntries(platform),
    platform: platform,
  }))
  const configEntries: typeof entries = [{ paths: [{ in: 'forge.config.ts', out: 'forge.config' }], platform: 'node' }]
  const contexts = await Promise.all(
    configEntries
      .concat(entries)
      .map(({ paths, platform }, index) =>
        esbuild.context(getOptions({ cleanEnabled: index === 0, entry: paths, isBundled: index !== 0, platform })),
      ),
  )
  return contexts
}
