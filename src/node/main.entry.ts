import { getWorkerPaths } from '@libs/constants'
import { print } from '@libs/utils'
import { BrowserWindow } from 'electron'
import { app } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { Worker } from 'worker_threads'

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
  window.on('close', () => print('Closing...'))
}

function watch(window: BrowserWindow) {
  const { node } = getWorkerPaths()
  window.webContents.executeJavaScript(`console.log(${JSON.stringify(node)})`)
  const worker = new Worker('D:\\Code\\Javascript\\mob\\.electron\\node\\workers\\some\\interval-message.js')
  window.webContents.executeJavaScript(`console.log(${JSON.stringify(worker)})`)
  worker.on('message', (message) => window.webContents.executeJavaScript(`console.log(${JSON.stringify(message)})`))
}
