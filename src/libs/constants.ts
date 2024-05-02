export function getWorkerPaths() {
  return {
    hotReloadWatcher: './node/workers/hot-reload-watcher.js',
  } as const
}
