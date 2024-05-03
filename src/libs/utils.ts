import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { getBgColors, getFgColors, getUtilColors } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function print(...messages: unknown[]) {
  console.log(...messages)
}

export function colorize<T extends string | unknown[] = string>(...inputs: ColorizeInput[]) {
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

export function resolveRelative(...fragments: string[]) {
  const cleanFragments = fragments.map((value) => value.replace(/^(\/|\\)/, ''))
  return cleanFragments.join('/')
}

export function snakeToCamel(value: string) {
  return value
    .split('-')
    .map((word, index) => word.charAt(0)[index === 0 ? 'toLowerCase' : 'toUpperCase']().concat(word.slice(1)))
    .join('')
}
