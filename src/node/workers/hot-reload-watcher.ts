import chokidar from 'chokidar'
import { resolve } from 'path'
import { parentPort } from 'worker_threads'

main()

function main() {
  watchBrowser()
}

function watchBrowser() {
  const watcher = chokidar.watch(resolve(''), {
    ignored: /package(-lock)?\.json|node_modules|forge\.config\.(c|m)?js/,
    ignoreInitial: true,
  })
  watcher.on('all', (event, path) => (event === 'add' && /browser/.test(path) ? parentPort?.postMessage('') : null))
}
