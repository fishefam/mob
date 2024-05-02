import { getWorkerPaths } from '@libs/constants'
import { app, BrowserWindow } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { Worker } from 'worker_threads'

const WINDOW = new BrowserWindow()

main()

function main() {
  app.on('ready', () => launch(WINDOW))
  watch(WINDOW)
}

async function launch(WINDOW: BrowserWindow) {
  await installExtension(REACT_DEVELOPER_TOOLS, { loadExtensionOptions: { allowFileAccess: true } })
  await WINDOW.loadFile('./index.html')
  WINDOW.webContents.openDevTools()
}

function watch(WINDOW: BrowserWindow) {
  const { hotReloadWatcher } = getWorkerPaths()
  const worker = new Worker(hotReloadWatcher)
  worker.on('message', () => WINDOW.reload())
}
