import { spawn } from 'child_process'
import { rimrafSync } from 'rimraf'

import { main as build } from './build'
import { getDirs } from './libs/constants'

main()

async function main() {
  await build()
  const { ELECTRON_CMD } = process.env
  const { electron } = getDirs()
  const cmd = createCmd()
  const cp = spawn(cmd, { shell: true })
  const electronCmds: (typeof ELECTRON_CMD)[] = ['package', 'make']
  cp.stdout.setEncoding('utf-8')
  cp.stdout.on('data', (data) => console.log(data))
  cp.on('exit', () => {
    if (electronCmds.includes(ELECTRON_CMD)) rimrafSync(electron)
    process.exit()
  })
}

function createCmd() {
  const { ELECTRON_CMD } = process.env
  return `electron-forge ${ELECTRON_CMD} .electron`
}
