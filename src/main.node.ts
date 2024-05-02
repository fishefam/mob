import { getWorkerPaths } from '@libs/constants.node'
import { app, BrowserWindow } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { Worker } from 'worker_threads'

let { appWindow } = globalThis

main()

function main() {
  app.on('ready', launch)
  watch()
}

async function launch() {
  appWindow = new BrowserWindow()
  await installExtension(REACT_DEVELOPER_TOOLS, { loadExtensionOptions: { allowFileAccess: true } })
  await appWindow.loadFile('./index.html')
  appWindow.webContents.openDevTools()
}

function watch() {
  const { hotReloadWatcher } = getWorkerPaths()
  const worker = new Worker(hotReloadWatcher)
  worker.on('message', () => appWindow.reload())
}
