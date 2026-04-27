/**
 * electron-theme-mode - 预加载模块
 * 导入即自动初始化 DarkReader + 防闪烁注入 + IPC 监听
 * 导出 themeMode 对象供 contextBridge.exposeInMainWorld 使用
 */

import { ipcRenderer } from 'electron'
import * as DarkReader from 'darkreader'
import type { ThemeConfig, ThemeState, ThemeModeAPI } from '../types'
import {
  IPC_SET_THEME,
  IPC_GET_THEME,
  IPC_THEME_CHANGED,
  IPC_GET_THEME_SYNC,
  IPC_RESET_THEME
} from '../constants'

// ============================================================
// 自动初始化（模块加载时立即执行）
// ============================================================


/** 同步获取主进程中的初始主题状态 */
const initialState: ThemeState = ipcRenderer.sendSync(IPC_GET_THEME_SYNC)

/** 标记 DarkReader 是否已被启用过 */
let darkReaderActive = false

/**
 * 启用 DarkReader
 */
function enableDarkReader(state: ThemeState): void {
  const waitAndEnable = () => {
    if (document.head || document.documentElement) {
      try {
        DarkReader.enable(state.darkReader || {}, state.fixes as any)
        darkReaderActive = true
        // 延迟移除临时防闪烁样式
        setTimeout(() => {
          document.getElementById('__etm-early-style')?.remove()
        }, 1000)
      } catch (err) {
        console.error('[electron-theme-mode] DarkReader 启用失败:', err)
      }
    } else {
      requestAnimationFrame(waitAndEnable)
    }
  }
  waitAndEnable()
}

/**
 * 禁用 DarkReader（仅在 DOM 可用且 DarkReader 已启用时调用）
 */
function disableDarkReader(): void {
  if (!darkReaderActive) return
  try {
    DarkReader.disable()
    darkReaderActive = false
    document.getElementById('__etm-early-style')?.remove()
  } catch (err) {
    console.error('[electron-theme-mode] DarkReader 关闭失败:', err)
  }
}

/**
 * 应用主题状态
 */
function applyTheme(state: ThemeState): void {
  if (state.isDark) {
    // DarkReader.enable() 支持重复调用以更新参数，无需先 disable
    enableDarkReader(state)
  } else {
    disableDarkReader()
  }
}

/**
 * 极速注入防闪烁 CSS（在 DOM 还未完全生成时即锁定背景色）
 */
function injectEarlyStyle(bgColor: string, textColor: string): void {
  const inject = () => {
    if (document.documentElement) {
      const style = document.createElement('style')
      style.id = '__etm-early-style'
      style.textContent = `
        html, body { background-color: ${bgColor} !important; color: ${textColor} !important; }
        iframe { background-color: ${bgColor} !important; }
      `
      document.documentElement.appendChild(style)
    } else {
      setTimeout(inject, 1)
    }
  }
  inject()
}

// 初始化：仅在暗色时注入防闪烁样式并启用 DarkReader
if (initialState?.isDark) {
  const bgColor = initialState.darkReader?.darkSchemeBackgroundColor || '#181a1b'
  const textColor = initialState.darkReader?.darkSchemeTextColor || '#e8e6e3'
  injectEarlyStyle(bgColor, textColor)
  enableDarkReader(initialState)
}

// 监听主进程的主题变更广播（主框架和 iframe 均监听）
ipcRenderer.on(IPC_THEME_CHANGED, (_, state: ThemeState) => {
  applyTheme(state)
})

// ============================================================
// 导出 API 对象
// ============================================================

/**
 * 主题模式 API 对象
 * 供 contextBridge.exposeInMainWorld 使用
 *
 * @example
 * ```typescript
 * import { themeMode } from 'electron-theme-mode/preload'
 * contextBridge.exposeInMainWorld('themeMode', themeMode)
 * ```
 */
export const themeMode: ThemeModeAPI = {
  /**
   * 设置主题（仅传入需要变更的字段）
   */
  setTheme(config: Partial<ThemeConfig>): void {
    ipcRenderer.send(IPC_SET_THEME, config)
  },

  /**
   * 获取当前主题状态
   */
  getTheme(): Promise<ThemeState> {
    return ipcRenderer.invoke(IPC_GET_THEME)
  },

  /**
   * 监听主题变更
   */
  onThemeChanged(callback: (state: ThemeState) => void): void {
    ipcRenderer.on(IPC_THEME_CHANGED, (_, state: ThemeState) => {
      callback(state)
    })
  },

  /**
   * 重置主题为默认配置
   */
  resetTheme(): void {
    ipcRenderer.send(IPC_RESET_THEME)
  }
}

// 重新导出类型供外部使用
export type {
  ThemeConfig,
  ThemeState,
  ThemeMode,
  DarkReaderTheme,
  DarkReaderFixes,
  ThemeModeAPI
} from '../types'
