import type { TsconfigRaw } from 'esbuild'

import autoprefixer from 'autoprefixer'
import stylePlugin from 'esbuild-plugin-style'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { rimrafSync } from 'rimraf'
import tailwindcss from 'tailwindcss'

import { getDirs, getElectronStaticFiles } from './constants'
import { createOnEndPlugin, createOnStartPlugin } from './utils'

export function clean(enabled = false) {
  return createOnStartPlugin('clean', () => {
    if (!enabled) {
      const { electron, out } = getDirs()
      try {
        rimrafSync([electron, out])
      } catch {
        /* empty */
      }
    }
  })
}

export function style() {
  return stylePlugin({ postcss: { plugins: [autoprefixer(), tailwindcss()] } })
}

export function resolvePaths(disabled = false) {
  return createOnEndPlugin('resolve-paths', () => {
    if (!disabled) {
      const { compilerOptions } = <TsconfigRaw>JSON.parse(readFileSync('tsconfig.json', { encoding: 'utf-8' }))
      const { paths: tsConfigPaths } = compilerOptions ?? {}
      const { electron, nodeModules } = getDirs()
      const ignores = [nodeModules, ...getElectronStaticFiles()]
      const ignoresRegex = ignores.map((value) => value.replace('.', '\\.'))
      const files = readdirSync(electron, { encoding: 'utf-8', recursive: true, withFileTypes: true }).filter(
        (item) => {
          const hasIgnoredName = ignores.some((value) => value === item.name)
          const hasIgnoredPath = ignoresRegex.some((value) => new RegExp(value).test(item.path))
          const key = <keyof typeof item>(<unknown>Object.getOwnPropertySymbols(item)[0])
          const type = parseInt(<string>item[key])
          const isFile = type === 1
          return !hasIgnoredName && !hasIgnoredPath && isFile
        },
      )
      const paths = files.map(({ name, path }) => resolve(path, name))
      paths.forEach((path) => {
        const { source } = getDirs()
        const content = readFileSync(path, { encoding: 'utf-8' })
        for (const [key, value] of Object.entries(tsConfigPaths ?? {})) {
          const matcher = key.replace(/\/\*$/, '')
          const replacement = value[0].replace(/\/\*$/, '').replace(source, '.')
          const newContent = content.replace(matcher, replacement)
          writeFileSync(path, newContent)
        }
      })
    }
  })
}
