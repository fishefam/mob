export function getWorkerPaths() {
  return {
    hotReloadWatcher: './workers/hot-reload-watcher.js',
  } as const
}
