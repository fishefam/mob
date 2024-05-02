import chokidar from 'chokidar'
import { resolve } from 'path'
import { parentPort } from 'worker_threads'

main()

function main() {
  const watcher = chokidar.watch(resolve(''), {
    ignored: ['node_modules', 'forge.config.js', 'package-lock.json', 'package.json'],
    ignoreInitial: true,
  })
  watcher.on('all', (event) => {
    const events = ['change', 'add']
    if (events.includes(event)) parentPort?.postMessage(event)
  })
}
