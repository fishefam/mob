/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import { writeFileSync } from 'fs'
import micromatch from 'micromatch'
import { resolve } from 'path'

import { compilerOptions } from '../tsconfig.json'
import { getDirs } from './libs/constants'
import { getBinCmds } from './libs/utils'

const config: import('lint-staged').ConfigFn = async (files) => {
  const { nodeModules } = getDirs()
  const tsFiles = match(files, 'ts', 'tsx')
  const assortedFiles = match(files, 'html', 'css', 'json')
  try {
    generateTsconfig(tsFiles)
  } catch (error) {
    console.log(error)
  }
  const typecheck = createCommand(`tsc --project ${resolve(nodeModules, 'tsconfig.json')}`)
  const eslint = createCommand('eslint $0 --fix', tsFiles.join(' '))
  const prettier = createCommand('prettier $0 --write', [...assortedFiles, ...tsFiles].join(' '))
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
      baseUrl: resolve('..'),
      files,
    },
  })
  const dest = resolve(nodeModules, 'tsconfig.json')
  writeFileSync(dest, configs)
}

function match(files: string[], ...extensions: string[]) {
  return micromatch(
    files,
    extensions.map((ext) => ext.replace('.', '')).map((ext) => `**/*.${ext}`),
  )
}

function createCommand(cmd: string, ...interpolates: string[]) {
  console.log(getBinCmds())
  const prefix = 'node_modules/.bin/'
  let command = prefix + cmd
  for (let i = 0; i < interpolates.length; i++) command = command.replace(new RegExp(`\\$\{?${i}}?`), interpolates[i])
  return command
}

module.exports = config
