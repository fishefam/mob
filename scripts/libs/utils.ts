import type { BuildOptions, BuildResult, Plugin } from 'esbuild'

import { readdirSync } from 'fs'

export function isProd() {
  return process.env.NODE_ENV === 'production'
}

export function readDirItems(path: string) {
  let result = undefined
  try {
    result = readdirSync(path)
  } catch {
    result = undefined
  }
  return result
}

export function createOnEndPlugin(name: string, callback: (result: BuildResult<BuildOptions>) => void): Plugin {
  return { name, setup: (build) => build.onEnd(callback) }
}

export function createOnStartPlugin(name: string, callback: () => void): Plugin {
  return { name, setup: (build) => build.onStart(callback) }
}

export function resolveRelative(...fragments: string[]) {
  const cleanFragments = fragments.map((value) => value.replace(/^(\/|\\)/, ''))
  return cleanFragments.join('/')
}
