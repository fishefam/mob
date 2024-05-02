import type { BuildContext, BuildOptions, Message, Platform } from 'esbuild'

import esbuild from 'esbuild'
import { cpSync } from 'fs'
import { resolve } from 'path'

import { getDirs, getOptionEntries } from './libs/constants'
import { isProd } from './libs/utils'

main()

async function main() {
  const entries = ['node', 'browser'].map((platform) => getOptionEntries(<Platform>platform))
  const contexts = await Promise.all(entries.map((entry) => esbuild.context(getOptions(entry))))
  await build(contexts)
  if (isProd()) process.exit()
}

async function build(contexts: BuildContext[]) {
  cpSync(resolve('node_modules'), resolve('.electron', 'node_modules'), {
    filter: (source) => !/mob-core/.test(source),
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

function getOptions(entries: BuildEntries): BuildOptions {
  const { electron } = getDirs()
  const { paths, platform } = entries
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
    plugins: [],
    sourcemap: !isProd(),
    target: 'es2016',
    treeShaking: true,
  }
}
