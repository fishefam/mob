import type { BuildOptions, BuildResult, OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'

import { readdirSync, writeFileSync } from 'fs'

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

export function colorize<T extends string | unknown[] = string>(...inputs: ColorizeInput[]) {
  const bgColors = getBgColors()
  const colors = getFgColors()
  const { reset } = getUtilColors()
  const result = inputs.map(
    ({ bg, color, text }) => (color ? colors[color] : '') + (bg ? bgColors[bg] : '') + text + reset,
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

export function getBinCmds<T extends keyof BinCmds | true>(cmd?: T) {
  const { nodeModules, types } = getDirs()
  const files = readdirSync(resolveRelative(nodeModules, '.bin')).filter((file) => !/\..*$/.test(file))
  writeFileSync(resolveRelative(types, 'bin.d.ts'), `type BinCmds = { ${files.map((file) => `'${file}'`).join(', ')} }`)
  const cmds = <{ [key in keyof BinCmds]: string }>Object.fromEntries(files.map((file) => [file, file]))
  if (cmd) return <T extends true ? BinCmds : string>cmds[<keyof BinCmds>cmd]
  return <T extends true ? BinCmds : string>cmds
}
