const { contextBridge } = require('electron')
const { themeMode } = require('electron-theme-mode/preload')

contextBridge.exposeInMainWorld('themeMode', themeMode)
