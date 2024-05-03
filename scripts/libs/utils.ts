import type { BuildOptions, BuildResult, OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'

import { readdirSync } from 'fs'

import { getBgColors, getFgColors, getUtilColors } from './constants'

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

type ColorizeInput = {
  bg?: keyof ReturnType<typeof getBgColors>
  color?: keyof ReturnType<typeof getFgColors>
  text: string
}
export function colorize<T extends string | unknown[] = string>(...inputs: ColorizeInput[]) {
  const bgColors = getBgColors()
  const colors = getFgColors()
  const { reset } = getUtilColors()
  const result =
    inputs instanceof Array
      ? (<ColorizeInput[]>inputs).map(
          ({ bg, color, text }) => (color ? colors[color] : '') + (bg ? bgColors[bg] : '') + text + reset,
        )
      : ((<ColorizeInput>inputs).color ? colors[(<ColorizeInput>inputs).color!] : '') +
        ((<ColorizeInput>inputs).bg ? bgColors[(<ColorizeInput>inputs).bg!] : '') +
        (<ColorizeInput>inputs).text +
        reset
  return <T extends string ? string : string[]>result
}
