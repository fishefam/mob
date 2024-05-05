import { getWorkerPaths } from '@libs/constants'
import { isProd } from '@libs/utils'
import { BrowserWindow } from 'electron'
import { app } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { Worker } from 'worker_threads'

main()

async function main() {
  await app.whenReady()
  const window = new BrowserWindow({ title: 'Mobius' })
  launch(window)
  if (!isProd()) watch(window)
}

async function launch(window: BrowserWindow) {
  window.removeMenu()
  await installExtension(REACT_DEVELOPER_TOOLS, { loadExtensionOptions: { allowFileAccess: true } })
  await window.loadURL('./browser/index.html')
  if (!isProd()) window.webContents.openDevTools()
}

function watch(window: BrowserWindow) {
  const { node } = getWorkerPaths()
  const worker = new Worker(node['hotReloadWatcher'])
  worker.on('message', () => window.reload())
}
