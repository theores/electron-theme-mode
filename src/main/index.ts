/**
 * electron-theme-mode - 主进程模块
 * 负责 nativeTheme 控制、IPC 监听、窗口广播及状态持久化
 */

import { nativeTheme, BrowserWindow, ipcMain, app } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { ThemeConfig, ThemeState, InitThemeOptions, StoreAdapter } from '../types'
import {
  IPC_SET_THEME,
  IPC_GET_THEME,
  IPC_THEME_CHANGED,
  IPC_GET_THEME_SYNC,
  IPC_RESET_THEME
} from '../constants'

/** 默认主题配置 */
const DEFAULT_CONFIG: ThemeConfig = { mode: 'light' }

/**
 * 深度合并配置对象（仅合并普通对象，数组直接覆盖）
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key]
    const targetVal = target[key]
    if (
      sourceVal !== undefined &&
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(targetVal as any, sourceVal as any)
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as any
    }
  }
  return result
}

/** 内置 JSON 文件存储 */
class DefaultStore implements StoreAdapter {
  private filePath: string

  constructor() {
    this.filePath = join(app.getPath('userData'), 'electron-theme-mode.json')
  }

  get(): ThemeConfig | null {
    try {
      const data = readFileSync(this.filePath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  set(config: ThemeConfig): void {
    try {
      mkdirSync(dirname(this.filePath), { recursive: true })
      writeFileSync(this.filePath, JSON.stringify(config, null, 2), 'utf-8')
    } catch (err) {
      console.error('[electron-theme-mode] 写入配置失败:', err)
    }
  }
}

/** 合法的模式值 */
const VALID_MODES = ['light', 'dark', 'system'] as const

/** 当前配置 */
let currentConfig: ThemeConfig = { ...DEFAULT_CONFIG }

/** 存储适配器 */
let store: StoreAdapter

/**
 * 校验并应用配置变更（统一入口，防止无效值导致崩溃）
 */
function applyConfig(config: Partial<ThemeConfig>): void {
  // 校验 mode 值
  if (config.mode !== undefined && !VALID_MODES.includes(config.mode as any)) {
    console.warn(`[electron-theme-mode] 无效的 mode 值: "${config.mode}"，已忽略。合法值: ${VALID_MODES.join(', ')}`)
    delete config.mode
  }
  currentConfig = deepMerge(currentConfig, config)
  store.set(currentConfig)
  nativeTheme.themeSource = currentConfig.mode
  broadcastThemeChange()
}

/**
 * 解析当前是否处于暗色模式
 */
function resolveIsDark(): boolean {
  if (currentConfig.mode === 'system') {
    return nativeTheme.shouldUseDarkColors
  }
  return currentConfig.mode === 'dark'
}

/**
 * 获取当前完整主题状态
 */
function getThemeState(): ThemeState {
  return { ...currentConfig, isDark: resolveIsDark() }
}

/**
 * 获取暗色模式的背景色（用于窗口底色）
 */
function getDarkBackgroundColor(): string {
  return currentConfig.darkReader?.darkSchemeBackgroundColor || '#181a1b'
}

/**
 * 递归向指定框架及其所有子框架发送 IPC 消息
 */
function sendToAllFrames(frame: Electron.WebFrameMain, channel: string, ...args: any[]): void {
  try {
    frame.send(channel, ...args)
  } catch {
    // 框架可能已被销毁，忽略
  }
  for (const child of frame.frames) {
    sendToAllFrames(child, channel, ...args)
  }
}

/**
 * 向所有窗口的所有框架广播主题变更，并同步更新窗口底色
 */
function broadcastThemeChange(): void {
  const state = getThemeState()
  const bgColor = state.isDark ? getDarkBackgroundColor() : '#ffffff'
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.setBackgroundColor(bgColor)
      sendToAllFrames(win.webContents.mainFrame, IPC_THEME_CHANGED, state)
    }
  })
}

/**
 * 初始化主题管理器
 * @param options 可选配置项
 */
export function initTheme(options?: InitThemeOptions): void {
  // 初始化存储
  store = options?.store || new DefaultStore()

  // 从存储中恢复配置
  const saved = store.get()
  if (saved) {
    // 启动时校验磁盘配置，防止无效值导致崩溃
    if (saved.mode && !VALID_MODES.includes(saved.mode as any)) {
      console.warn(`[electron-theme-mode] 磁盘配置文件中包含无效的 mode: "${saved.mode}"，已重置为默认值。`)
      saved.mode = DEFAULT_CONFIG.mode
    }
    currentConfig = saved
  }

  // 同步 NativeTheme
  nativeTheme.themeSource = currentConfig.mode

  // 自动为新建窗口设置底色
  app.on('browser-window-created', (_, win) => {
    const isDark = resolveIsDark()
    const bgColor = isDark ? getDarkBackgroundColor() : '#ffffff'
    win.setBackgroundColor(bgColor)
  })

  // IPC：设置主题
  ipcMain.on(IPC_SET_THEME, (_, config: Partial<ThemeConfig>) => {
    applyConfig(config)
  })

  // IPC：重置主题
  ipcMain.on(IPC_RESET_THEME, () => {
    currentConfig = { ...DEFAULT_CONFIG }
    store.set(currentConfig)
    nativeTheme.themeSource = currentConfig.mode
    broadcastThemeChange()
  })

  // IPC：异步获取主题
  ipcMain.handle(IPC_GET_THEME, () => {
    return getThemeState()
  })

  // IPC：同步获取主题（Preload 冷启动用）
  ipcMain.on(IPC_GET_THEME_SYNC, (event) => {
    event.returnValue = getThemeState()
  })

  // 系统主题变化时广播（仅 system 模式生效）
  nativeTheme.on('updated', () => {
    if (currentConfig.mode === 'system') {
      broadcastThemeChange()
    }
  })
}

/**
 * 主进程直接设置主题（无需通过 IPC）
 * @param config 主题配置
 */
export function setTheme(config: Partial<ThemeConfig>): void {
  applyConfig(config)
}

/**
 * 主进程直接获取当前主题状态
 */
export function getTheme(): ThemeState {
  return getThemeState()
}

/**
 * 主进程直接重置主题为默认配置
 */
export function resetTheme(): void {
  currentConfig = { ...DEFAULT_CONFIG }
  store.set(currentConfig)
  nativeTheme.themeSource = currentConfig.mode
  broadcastThemeChange()
}

// 重新导出类型供外部使用
export type {
  ThemeConfig,
  ThemeState,
  ThemeMode,
  DarkReaderTheme,
  DarkReaderFixes,
  InitThemeOptions,
  StoreAdapter
} from '../types'
