import { resolve } from 'path'

export function getWorkerPaths() {
  return {
    hotReloadWatcher: resolve('./node/workers/hot-reload-watcher.js'),
  } as const
}

export function getBgColors() {
  return {
    black: '\x1b[40m',
    blue: '\x1b[44m',
    cyan: '\x1b[46m',
    gray: '\x1b[100m',
    green: '\x1b[42m',
    magenta: '\x1b[45m',
    red: '\x1b[41m',
    white: '\x1b[47m',
    yellow: '\x1b[43m',
  } as const
}

export function getUtilColors() {
  return {
    hidden: '\x1b[8m',
    reset: '\x1b[0m',
    reverse: '\x1b[7m',
    underscore: '\x1b[4m',
  } as const
}

export function getFgColors() {
  return {
    black: '\x1b[30m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
    red: '\x1b[31m',
    white: '\x1b[37m',
    yellow: '\x1b[33m',
  } as const
}
