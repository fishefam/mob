import type { FSWatcher } from 'chokidar'
import type { BuildContext, BuildOptions, Message } from 'esbuild'

import { spawn } from 'child_process'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import { writeFileSync } from 'fs'
import { mkdirpSync } from 'mkdirp'

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
import { isProd, resolveRelative } from './libs/utils'

main()

async function main() {
  const { assets, source, types } = getDirs()
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
  const watcher = chokidar.watch([source, assets, types], { ignoreInitial: true })
  applyPackageJSON()
  await build(contexts)
  if (isProd()) process.exit()
  watch(watcher, contexts)
}

async function build(contexts: BuildContext[]) {
  await Promise.all(
    contexts.map((context) =>
      context.rebuild().catch((error) => {
        const { errors } = <{ [key in 'errors' | 'warnings']: Message[] }>error
        console.log(errors)
      }),
    ),
  )
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
  const cp = spawn('npm run start', { shell: true })
  cp.stdout.setEncoding('utf-8')
  cp.stdout.on('data', (data) => console.log(data.trim()))
  watcher.on('all', () => build(contexts))
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
  writeFileSync(resolveRelative(electron, 'package.json'), packageJSON)
}
