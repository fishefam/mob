import { app, BrowserWindow, session } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'

main()

function main() {
  app.on('ready', launch)
}

async function launch() {
  const window = new BrowserWindow()
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, callback) => {
    callback({
      responseHeaders: {
        ...responseHeaders,
        'Content-Security-Policy': [`script-src 'self' 'unsafe-inline'`],
      },
    })
  })
  await window.loadFile('./index.html')
  window.webContents.openDevTools()
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
  return window
}
