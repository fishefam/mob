import chokidar from 'chokidar'
import { resolve } from 'path'
import { parentPort } from 'worker_threads'

main()

function main() {
  const watcher = chokidar.watch(resolve(''), {
    ignored: /package(-lock)?\.json|node_modules|forge\.config\.(c|m)?js/,
    ignoreInitial: true,
  })
  watcher.on('all', (event) => {
    const events = ['change', 'add']
    if (events.includes(event)) parentPort?.postMessage(event)
  })
}
