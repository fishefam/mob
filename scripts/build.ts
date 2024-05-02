import type { FSWatcher } from 'chokidar'
import type { BuildContext, BuildOptions, Message, Platform } from 'esbuild'

import { spawn } from 'child_process'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import { cpSync } from 'fs'
import { resolve } from 'path'

import { getDirs, getOptionEntries, getPkgNames } from './libs/constants'
import { clean, style } from './libs/plugins'
import { isProd, readDirItems } from './libs/utils'

main()

async function main() {
  const { assets, source, types } = getDirs()
  const entries = ['node', 'browser'].map((platform) => getOptionEntries(<Platform>platform))
  const contexts = await Promise.all(
    entries.map((entry, index) => esbuild.context(getOptions({ cleanDisabled: index === 1, entry }))),
  )
  const watcher = chokidar.watch([source, assets, types], { ignoreInitial: true })
  await build(contexts)
  if (isProd()) process.exit()
  watch(watcher, contexts)
}

async function build(contexts: BuildContext[]) {
  const { core } = getPkgNames()
  const { electron, nodeModules } = getDirs()
  const { length: lengthA } = readDirItems(resolve(electron, nodeModules)) ?? []
  const { length: lengthB } = readDirItems(resolve(nodeModules)) ?? []
  if (lengthA < lengthB - 1)
    cpSync(resolve(nodeModules), resolve(electron, nodeModules), {
      filter: (source) => !new RegExp(core).test(source),
      recursive: true,
    })
  await Promise.all(
    contexts.map((context) =>
      context.rebuild().catch((error) => {
        const { errors } = <{ [key in 'errors' | 'warnings']: Message[] }>error
        console.log(errors)
      }),
    ),
  )
}

function getOptions(options: { cleanDisabled?: boolean; entry: BuildEntries }): BuildOptions {
  const { cleanDisabled, entry } = options
  const { electron } = getDirs()
  const { paths, platform } = entry
  return {
    bundle: platform === 'browser',
    entryPoints: paths,
    format: 'iife',
    jsx: 'transform',
    legalComments: 'none',
    loader: { '.html': 'copy', '.json': 'copy' },
    logLevel: 'silent',
    minify: false,
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
