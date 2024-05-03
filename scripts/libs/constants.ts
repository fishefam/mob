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
    out: 'dist',
    source: 'src',
    types: 'types',
  } as const
}

export function getElectronStaticFiles() {
  const extensions = ['js', 'cjs', 'mjs'] as const
  const forgeConfigFiles = extensions.map((ext) => 'forge.config.' + ext)
  return [...forgeConfigFiles, 'package-lock.json', 'package.json'] as const
}

export function getBgColors() {
  return {
    black: '\x1b[40m',
    blue: '\x1b[44m',
    cyan: '\x1b[46m',
    gray: '\x1b[100m',
    green: '\x1b[42m',
    magenta: '\x1b[45m',
    red: '\x1b[41m',
    white: '\x1b[47m',
    yellow: '\x1b[43m',
  } as const
}

export function getUtilColors() {
  return {
    hidden: '\x1b[8m',
    reset: '\x1b[0m',
    reverse: '\x1b[7m',
    underscore: '\x1b[4m',
  } as const
}

export function getFgColors() {
  return {
    black: '\x1b[30m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
    red: '\x1b[31m',
    white: '\x1b[37m',
    yellow: '\x1b[33m',
  } as const
}
