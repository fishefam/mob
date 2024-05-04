import { getDirs } from '@script-libs/constants'
import { colorize, print } from '@script-libs/utils'
import { spawnSync } from 'child_process'
import { rimrafSync } from 'rimraf'

main()

function main() {
  const { electron, nodeModules } = getDirs()
  print(
    colorize({ bg: 'red', text: '[WARNING]' }),
    'PURGING ENTIRE PROJECT NON-GIT ITEMS AND RESET ALL UNCOMMITED CHANGES',
  )
  rimrafSync([nodeModules, electron])
  spawnSync('git reset --hard', { shell: true })
  print(colorize({ bg: 'blue', text: '[INFO]' }), 'Purging complete')
  print(colorize({ bg: 'blue', text: '[INFO]' }), 'Execute `npm install` before running any other commands')
}
