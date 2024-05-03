import type { ConfigFn } from 'lint-staged'

import { readFileSync, writeFileSync } from 'fs'
import micromatch from 'micromatch'
import { resolve } from 'path'

import { compilerOptions } from '../tsconfig.json'
import { getDirs } from './libs/constants'

export const TS_CONFIG_PATH = '.husky/tmp/tsconfig.json'
export const SOURCE_DIR = 'src'
export const EXCLUDES = ['node_modules', 'dist', '.husky']

const config: ConfigFn = async (files) => {
  const tsFiles = match(files, 'ts', 'tsx')
  const assortedFiles = match(files, 'html', 'css', 'scss', 'json')
  generateTsconfig(tsFiles)
  const typecheck = createCommand(`tsc --project ${TS_CONFIG_PATH}`)
  const eslint = createCommand('eslint $0 --fix', tsFiles.join(' '))
  const prettier = createCommand('prettier $0 --write', assortedFiles.join(' '))
  return [
    ...applyCommand(typecheck, tsFiles),
    ...applyCommand(prettier, assortedFiles),
    ...applyCommand(eslint, tsFiles),
  ]
}

function applyCommand(cmd: string, files: string[]) {
  if (files.length) return [cmd]
  return []
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
  writeFileSync(resolve('..', nodeModules, 'tsconfig.json'), configs)
  // cpSync('tsconfig.json', TS_CONFIG_PATH)
  // const setContents = [
  //   { match: /^\{{1}/, text: `{\n\t"files": [${files.map((name) => `"${name}"`).join(', ')}],` },
  //   { match: /^\{{1}/, text: `{\n\t"include": ["${resolve().replace(/\\/g, '/')}"],` },
  //   { match: /"baseUrl":\s?".*"/, text: `"baseUrl": "${resolve(SOURCE_DIR).replace(/\\/g, '/')}"` },
  //   { match: /"exclude":\s?\[.*\]/, text: `"exclude": [${EXCLUDES.map((item) => `"${item}"`).join(', ')}]` },
  // ]
  // return Promise.all(setContents.map(({ match, text }) => setFileContent({ match, path: TS_CONFIG_PATH, text })))
}

async function setFileContent({
  match,
  path,
  processor,
  text,
}: {
  match?: RegExp | string
  path: string
  processor?: (input: string) => Promise<string> | string
  text?: string
}) {
  const absolute = resolve(path)
  const content = readFileSync(absolute, { encoding: 'utf-8' })
  if (typeof text === 'undefined' && typeof match === 'undefined' && !processor) return
  const newContent =
    match && typeof text === 'string' ? content.replace(match, text) : processor ? processor(content) : content
  writeFileSync(absolute, typeof newContent === 'string' ? newContent : await newContent)
}

function match(files: string[], ...extensions: string[]) {
  return micromatch(
    files,
    extensions.map((ext) => ext.replace('.', '')).map((ext) => `**/*.${ext}`),
  )
}

function createCommand(cmd: string, ...interpolates: string[]) {
  const prefix = 'node_modules/.bin/'
  let command = prefix + cmd
  for (let i = 0; i < interpolates.length; i++) command = command.replace(new RegExp(`\\$\{?${i}}?`), interpolates[i])
  return command
}

module.exports = config
