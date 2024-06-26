import type { BuildOptions, BuildResult, OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'

import { readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import { getBgColors, getDirs, getFgColors, getUtilColors } from './constants'

export function hasDir(path: string) {
  let result = true
  try {
    readdirSync(path)
  } catch {
    result = false
  }
  return result
}

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

export function createOnResolvePlugin(
  name: string,
  filter: RegExp,
  callback: (args: OnResolveArgs) => null | OnResolveResult | Promise<null | OnResolveResult>,
): Plugin {
  return { name, setup: (build) => build.onResolve({ filter }, callback) }
}

export function resolveRelative(...fragments: string[]) {
  const cleanFragments = fragments.map((value) => value.replace(/^(\/|\\)/, ''))
  return cleanFragments.join('/')
}

export function print(...values: unknown[]) {
  console.log(...values)
}

export function colorize<T extends string | unknown[] = string>(...inputs: ScriptLibs.ColorizeInput[]) {
  const bgColors = getBgColors()
  const colors = getFgColors()
  const { reset } = getUtilColors()
  const result = inputs.map(
    ({ bg, color, text }) =>
      (color ? colors[<keyof typeof colors>color] : '') +
      (bg ? bgColors[<keyof typeof bgColors>bg] : '') +
      text +
      reset,
  )
  return <T extends string ? string : string[]>(inputs.length > 1 ? result : result[0])
}

export function getCurrentTime() {
  const hrTime = process.hrtime()
  return (hrTime[0] * 1000 + hrTime[1] / 1000000) / 1000
}

export function toTitleCase(value: string) {
  return value.slice(0, 1).toUpperCase().concat(value.slice(1).toLocaleLowerCase())
}

export function snakeToCamel(value: string) {
  return value
    .split('-')
    .map((word, index) => word.charAt(0)[index === 0 ? 'toLowerCase' : 'toUpperCase']().concat(word.slice(1)))
    .join('')
}

export function generateWorkerDTS() {
  const { browser, node, source, types, workers } = getDirs()
  const workerDirs = [browser, node].map((env) => resolveRelative(source, env, workers))
  const groupedWorkerNames = workerDirs.map((dir) => {
    try {
      return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(({ name }) => /\.ts(x)?$/g.test(name))
        .map(({ name }) => snakeToCamel(name).replace(/\.ts(x)?$/, ''))
    } catch {
      return ['never']
    }
  })
  const [browserWorkers, nodeWorkers] = groupedWorkerNames.map((workers) =>
    JSON.stringify(workers.map((worker) => `'${worker}'`).join(' | ')),
  )
  const autogeneratedWorkerFiles: AutoGeneratedFile = 'workers.autogenerated.d.ts'
  const dtsFile = resolve(types, autogeneratedWorkerFiles)
  writeFileSync(
    dtsFile,
    `/* This file is autogenerated on postinstall and every build */\ntype NodeWorkerPaths = { [key in ${/never/.test(nodeWorkers) || nodeWorkers.length === 2 ? 'never' : nodeWorkers}]: string }\ntype BrowserWorkerPaths = { [key in ${/never/.test(browserWorkers) || browserWorkers.length === 2 ? 'never' : browserWorkers}]: string }\n`.replace(
      /"/g,
      '',
    ),
  )
}

export function generateBinCmdsDTS() {
  const { nodeModules, types } = getDirs()
  const files = readdirSync(resolveRelative(nodeModules, '.bin')).filter((file) => !/\..*$/.test(file))
  const dtsFile: AutoGeneratedFile = 'bincmds.autogenerated.d.ts'
  writeFileSync(
    resolveRelative(types, dtsFile),
    `/* This file is autogenerated on postinstall and every commit */\ntype BinCmds =\n${files.map((file) => `  | '${file}'`).join('\n')}\n`,
  )
}
