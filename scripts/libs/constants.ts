import type { Platform } from 'esbuild'

import { readdirSync } from 'fs'
import { resolve } from 'path'

export function getOptionEntries(platform: Platform): BuildEntries {
  const { electron, source } = getDirs()
  const buildFiles = readdirSync(source, { recursive: true, withFileTypes: true }).filter(({ name }) =>
    /\.entry\./.test(name),
  )
  const getPlatformBuildFiles = (platform: Exclude<Platform, 'neutral'>) =>
    buildFiles
      .filter(({ name }) => new RegExp('\\.' + platform).test(name))
      .map(({ name, path }) => ({
        in: resolve(path, name),
        out: resolve(path, name.replace(extPattern, '')).replace(new RegExp(source), electron),
      }))
  if (platform === 'node')
    return {
      paths: getPlatformBuildFiles('node'),
      platform: 'node',
    }
  return {
    paths: getPlatformBuildFiles('browser'),
    platform: 'browser',
  }
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
