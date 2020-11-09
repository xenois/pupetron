import { app, BrowserWindow, ipcMain, MenuItem } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs'
import { BlenderWebsocketClient } from './socket/blender-websocket-client'

const blenderWebsocketClient = new BlenderWebsocketClient()

blenderWebsocketClient.inData.subscribe(data => {
  win?.webContents.send('onSocketDataBus', data)
})

ipcMain.on('onSocketDataBus', (event, packet) => {
  if (packet.type === 'control') {
    if (packet.data.action === 'connect') {
      blenderWebsocketClient.connect(packet.data.port)
    } else if (packet.data.action === 'disconnect') {
      blenderWebsocketClient.disconnect()
    }
  } else if (packet.type === 'data') {
    blenderWebsocketClient.outData.next(packet.data)
  }
})

let win: BrowserWindow | null
function createWindow () {
  win = new BrowserWindow({
    width: 1024, height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  let pathname = path.join(app.getAppPath(), `dist/angular-pupetron/index.html`)
  try {
    fs.statSync(pathname)
  } catch (err) {
    pathname = path.join(app.getAppPath(), `angular-pupetron/index.html`)
  }

  win.loadURL(
    url.format({
      pathname: pathname,
      protocol: 'file:',
      slashes: true
    })
  ).then().catch()

  // win.setAlwaysOnTop(true)

  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
