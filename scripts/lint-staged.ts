/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import micromatch from 'micromatch'

import { generateBinCmdsDTS } from './libs/utils'

generateBinCmdsDTS()

const config: import('lint-staged').ConfigFn = async (files) => {
  const tsFiles = match(files, 'ts', 'tsx')
  const assortedFiles = match(files, 'html', 'css', 'json')
  const typecheck = createCommand('tsc')
  const eslint = createCommand('eslint', '--fix $0', tsFiles.join(' '))
  const prettier = createCommand('prettier', '--write $0', [...assortedFiles, ...tsFiles].join(' '))
  return [applyCommand(typecheck, tsFiles), applyCommand(prettier, assortedFiles), applyCommand(eslint, tsFiles)].flat()
}

function applyCommand(cmd: string, files: string[]) {
  return files.length ? [cmd] : []
}

function match(files: string[], ...extensions: string[]) {
  return micromatch(
    files,
    extensions.map((ext) => ext.replace('.', '')).map((ext) => `**/*.${ext}`),
  )
}

function createCommand(binCmd: BinCmds, args?: string, ...interpolates: string[]) {
  const prefix = 'node_modules/.bin/'
  let command = prefix + binCmd + (args ? ' ' + args : '')
  for (let i = 0; i < interpolates.length; i++) command = command.replace(new RegExp(`\\$\{?${i}}?`), interpolates[i])
  return command
}

module.exports = config
