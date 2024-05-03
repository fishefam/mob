/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import { writeFileSync } from 'fs'
import micromatch from 'micromatch'
import { resolve } from 'path'

import { compilerOptions } from '../tsconfig.json'
import { getDirs } from './libs/constants'

const config: import('lint-staged').ConfigFn = async (files) => {
  const { nodeModules } = getDirs()
  const tsFiles = match(files, 'ts', 'tsx')
  const assortedFiles = match(files, 'html', 'css', 'json')
  generateTsconfig(tsFiles)
  const typecheck = createCommand('tsc', `--project ${resolve(nodeModules, 'tsconfig.json')}`)
  const eslint = createCommand('eslint', '--fix $0', tsFiles.join(' '))
  const prettier = createCommand('prettier', '--write $0', [...assortedFiles, ...tsFiles].join(' '))
  return [applyCommand(typecheck, tsFiles), applyCommand(prettier, assortedFiles), applyCommand(eslint, tsFiles)].flat()
}

function applyCommand(cmd: string, files: string[]) {
  return files.length ? [cmd] : []
}

function generateTsconfig(files: string[]) {
  const { nodeModules } = getDirs()
  const configs = JSON.stringify({
    compilerOptions: {
      ...compilerOptions,
      baseUrl: resolve('.'),
    },
    files,
  })
  writeFileSync(resolve(nodeModules, 'tsconfig.json'), configs)
}

function match(files: string[], ...extensions: string[]) {
  return micromatch(
    files,
    extensions.map((ext) => ext.replace('.', '')).map((ext) => `**/*.${ext}`),
  )
}

function createCommand(binCmd: keyof BinCmds, args?: string, ...interpolates: string[]) {
  const prefix = 'node_modules/.bin/'
  let command = prefix + binCmd + ' ' + args
  for (let i = 0; i < interpolates.length; i++) command = command.replace(new RegExp(`\\$\{?${i}}?`), interpolates[i])
  return command
}

module.exports = config
