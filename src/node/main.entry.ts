import { getWorkerPaths } from '@libs/constants'
import { BrowserWindow } from 'electron'
import { app } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { resolve } from 'path'
import { Worker } from 'worker_threads'

console.log(resolve(''))

main()

async function main() {
  await app.whenReady()
  const window = new BrowserWindow()
  launch(window)
  watch(window)
}

async function launch(window: BrowserWindow) {
  await installExtension(REACT_DEVELOPER_TOOLS, { loadExtensionOptions: { allowFileAccess: true } })
  await window.loadFile('./browser/index.html')
  window.webContents.openDevTools()
}

function watch(window: BrowserWindow) {
  const { hotReloadWatcher } = getWorkerPaths()
  const worker = new Worker(hotReloadWatcher)
  worker.on('message', () => window.reload())
}
