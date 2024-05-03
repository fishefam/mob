import { resolve } from 'path'

export function getWorkerPaths() {
  return {
    hotReloadWatcher: resolve('./resources/app/node/workers/hot-reload-watcher.js'),
  } as const
}
