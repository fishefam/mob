import { rimrafSync } from 'rimraf'

import { getDirs } from './libs/constants'
import { resolveRelative } from './libs/utils'

main()

function main() {
  const { nodeModules } = getDirs()
  const files = ['lint-staged.config.js'].map((file) => resolveRelative(nodeModules, file))
  for (const file of files) rimrafSync(file)
}
