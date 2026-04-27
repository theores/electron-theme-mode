const { app, BrowserWindow } = require('electron')
const { initTheme } = require('electron-theme-mode/main')
const path = require('path')

// 初始化主题管理器
initTheme()

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegrationInSubFrames: true
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))

  // 开发时自动打开 DevTools
  win.webContents.openDevTools()
})

app.on('window-all-closed', () => {
  app.quit()
})
