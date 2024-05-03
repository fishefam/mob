import { spawn } from 'child_process'
import { rimrafSync } from 'rimraf'

import { main as build } from './build'
import { getDirs } from './libs/constants'
import { colorize, getCurrentTime, print, toTitleCase } from './libs/utils'

main()

async function main() {
  await build()
  const startTime = getCurrentTime()
  const { ELECTRON_CMD } = process.env
  const printElectron = (...messages: unknown[]) => print(colorize({ bg: 'magenta', text: '[Electron]' }), ...messages)
  printElectron(`${toTitleCase(ELECTRON_CMD ?? '')}...`)
  const { electron } = getDirs()
  const cmd = createCmd()
  const cp = spawn(cmd, { shell: true })
  const electronCmds: (typeof ELECTRON_CMD)[] = ['package', 'make']
  cp.stdout.setEncoding('utf-8')
  cp.stdout.on('data', (data) => print(data.trim()))
  cp.on('exit', () => {
    if (electronCmds.includes(ELECTRON_CMD)) {
      rimrafSync(electron)
      const endTime = getCurrentTime()
      printElectron('Complete in:', `${(endTime - startTime).toFixed(2)}s`)
    }
    printElectron('Exiting...')
    process.exit()
  })
}

function createCmd() {
  const { ELECTRON_CMD } = process.env
  const { electron } = getDirs()
  return `electron-forge ${ELECTRON_CMD} ${electron}`
}
