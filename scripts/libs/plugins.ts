import autoprefixer from 'autoprefixer'
import stylePlugin from 'esbuild-plugin-style'
import { rimrafSync } from 'rimraf'
import tailwindcss from 'tailwindcss'

import { getDirs, getElectronStaticFiles } from './constants'
import { createOnStartPlugin } from './utils'

export function clean(disabled = false) {
  return createOnStartPlugin('clean', () => {
    if (!disabled) {
      const { electron } = getDirs()
      const electronFiles = getElectronStaticFiles()
      rimrafSync(electron, {
        filter: (path) => ![...electronFiles, 'node_modules'].some((value) => new RegExp(value).test(path)),
      })
    }
  })
}

export function style() {
  return stylePlugin({ postcss: { plugins: [autoprefixer(), tailwindcss()] } })
}
