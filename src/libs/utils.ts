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
    ({ bg, color, text }) => (color ? colors[color] : '') + (bg ? bgColors[bg] : '') + text + reset,
  )
  return <T extends string ? string : string[]>(inputs.length > 1 ? result : result[0])
}
