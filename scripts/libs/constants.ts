import type { Dirent } from 'fs'

import { readdirSync } from 'fs'
import { resolve } from 'path'

export function getOptionEntries(platform: Platform): BuildEntries {
  const flagRegex = /\.entry\./
  const workerRegex = /workers/
  const { electron, source } = getDirs()
  const buildFiles = readdirSync(source, { recursive: true, withFileTypes: true }).filter(
    ({ name, path }) => flagRegex.test(name) || workerRegex.test(path),
  )
  const platforms: Platform[] = ['node', 'browser']
  const [nodeFiles, browserFiles] = platforms.map((platform) =>
    buildFiles.filter(({ path }) => new RegExp(platform).test(path)),
  )
  const makeEntries = (files: Dirent[]) =>
    files.map(({ name, path }) => ({
      in: <`${string}.entry.${string}`>resolve(path, name),
      out: resolve(path, name.replace(flagRegex, '.'))
        .replace(new RegExp(source), electron)
        .replace(/(\.[\w\d]+)$/, ''),
    }))
  return makeEntries(platform === 'node' ? nodeFiles : browserFiles)
}

export function getDirs() {
  return {
    assets: 'public',
    electron: '.electron',
    nodeModules: 'node_modules',
    out: 'out',
    source: 'src',
    types: 'types',
  } as const
}

export function getPkgNames() {
  return {
    core: 'mob-core',
    root: 'mob',
  } as const
}

export function getElectronStaticFiles() {
  const extensions = ['js', 'cjs', 'mjs'] as const
  const forgeConfigFiles = extensions.map((ext) => 'forge.config.' + ext)
  return [...forgeConfigFiles, 'package-lock.json', 'package.json'] as const
}
