import { resolve } from 'path'

export function getWorkerPaths() {
  return {
    hotReloadWatcher: resolve('./node/workers/hot-reload-watcher.js'),
  } as const
}
