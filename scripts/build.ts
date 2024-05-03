import type { FSWatcher } from 'chokidar'
import type { BuildContext, BuildOptions, Message } from 'esbuild'

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
import { getDirs, getOptionEntries } from './libs/constants'
import { clean, style } from './libs/plugins'
import { colorize, getCurrentTime, hasDir, isProd, print } from './libs/utils'

if (!process.env.ELECTRON_CMD) main()

export async function main() {
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

async function build(contexts: BuildContext[]) {
  const startTime = getCurrentTime()
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

function getOptions(options: {
  cleanDisabled?: boolean
  entry: BuildEntries
  isConfig?: boolean
  platform: Platform
}): BuildOptions {
  const { cleanDisabled, entry, isConfig, platform } = options
  const { electron } = getDirs()
  return {
    bundle: !isConfig,
    entryPoints: entry,
    external: !isConfig ? ['electron'] : undefined,
    format: 'cjs',
    jsx: 'transform',
    legalComments: 'none',
    loader: { '.html': 'copy', '.json': 'copy' },
    logLevel: 'silent',
    minify: isProd(),
    outdir: electron,
    platform,
    plugins: [clean(cleanDisabled), style()],
    sourcemap: !isProd(),
    target: 'es2016',
    treeShaking: true,
  }
}

function watch(watcher: FSWatcher, contexts: BuildContext[]) {
  const { electron } = getDirs()
  if (hasDir(electron)) {
    const cp = spawn(`electron-forge start ${electron}`, { shell: true })
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

function applyPackageJSON() {
  const { electron } = getDirs()
  const devDeps = {
    '@electron-forge/cli': devDependencies['@electron-forge/cli'],
    '@electron-forge/maker-deb': devDependencies['@electron-forge/maker-deb'],
    '@electron-forge/maker-rpm': devDependencies['@electron-forge/maker-rpm'],
    '@electron-forge/maker-squirrel': devDependencies['@electron-forge/maker-squirrel'],
    '@electron-forge/maker-zip': devDependencies['@electron-forge/maker-zip'],
    '@electron-forge/plugin-auto-unpack-natives': devDependencies['@electron-forge/plugin-auto-unpack-natives'],
    '@electron-forge/plugin-fuses': devDependencies['@electron-forge/plugin-fuses'],
    '@electron/fuses': devDependencies['@electron/fuses'],
    'electron': devDependencies['electron'],
  }
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
  writeFileSync(resolve(electron, 'package.json'), packageJSON, { encoding: 'utf-8', flag: 'w' })
}

async function getContexts() {
  const entries = ['node', 'browser'].map((platform) => ({
    paths: getOptionEntries(<Platform>platform),
    platform: <Platform>platform,
  }))
  const configEntries: typeof entries = [
    {
      paths: [{ in: <'.entry.'>'forge.config.ts', out: 'forge.config' }],
      platform: 'node',
    },
  ]
  const contexts = await Promise.all(
    configEntries
      .concat(entries)
      .map(({ paths, platform }, index) =>
        esbuild.context(
          getOptions({ cleanDisabled: [1, 2].includes(index), entry: paths, isConfig: index === 0, platform }),
        ),
      ),
  )
  return contexts
}
