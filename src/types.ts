/**
 * electron-theme-mode
 * 公共类型定义
 */

/** 主题模式 */
export type ThemeMode = 'light' | 'dark' | 'system'

/** DarkReader 主题配置 */
export interface DarkReaderTheme {
  /** 1=暗色, 0=调光模式，默认 1 */
  mode?: 0 | 1
  /** 亮度 (0-100+), 默认 100 */
  brightness?: number
  /** 对比度 (0-100+), 默认 100 */
  contrast?: number
  /** 灰度 (0-100), 默认 0 */
  grayscale?: number
  /** 褐色 (0-100), 默认 0 */
  sepia?: number
  /** 是否使用自定义字体, 默认 false */
  useFont?: boolean
  /** 字体系列 */
  fontFamily?: string
  /** 文字描边 (0-1px), 默认 0 */
  textStroke?: number
  /** 暗色背景色, 默认 #181a1b */
  darkSchemeBackgroundColor?: string
  /** 暗色文字色, 默认 #e8e6e3 */
  darkSchemeTextColor?: string
  /** 亮色背景色, 默认 #dcdad7 */
  lightSchemeBackgroundColor?: string
  /** 亮色文字色, 默认 #181a1b */
  lightSchemeTextColor?: string
  /** 滚动条颜色, 默认 auto */
  scrollbarColor?: string
  /** 选中颜色, 默认 auto */
  selectionColor?: string
  /** 是否应用到系统控件, 默认 true */
  styleSystemControls?: boolean
}

/** DarkReader 修复配置 */
export interface DarkReaderFixes {
  /** 需要反色的 CSS 选择器（通常是图标精灵） */
  invert?: string[]
  /** 额外的 CSS 代码 */
  css?: string
  /** 不分析内联样式的选择器 */
  ignoreInlineStyle?: string[]
  /** 不分析图片的选择器 */
  ignoreImageAnalysis?: string[]
  /** 是否禁用样式表代理 */
  disableStyleSheetsProxy?: boolean
  /** 忽略特定 URL 的样式表 */
  ignoreCSSUrl?: string[]
}

/** 完整的主题配置 */
export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode
  /** DarkReader 主题选项 */
  darkReader?: Partial<DarkReaderTheme>
  /** DarkReader 修复选项 */
  fixes?: Partial<DarkReaderFixes>
}

/** 主进程向渲染进程广播的主题状态 */
export interface ThemeState extends ThemeConfig {
  /** 当前是否实际处于暗色状态（考虑了 system 模式下的实际值） */
  isDark: boolean
}

/** 自定义存储适配器 */
export interface StoreAdapter {
  /** 读取主题配置 */
  get: () => ThemeConfig | null
  /** 写入主题配置 */
  set: (config: ThemeConfig) => void
}

/** 主进程初始化选项 */
export interface InitThemeOptions {
  /** 自定义持久化存储，不传则使用内置 JSON 文件存储 */
  store?: StoreAdapter
}

/** 暴露给渲染进程的 API 接口 */
export interface ThemeModeAPI {
  /** 设置主题模式和选项 */
  setTheme: (config: Partial<ThemeConfig>) => void
  /** 获取当前主题状态 */
  getTheme: () => Promise<ThemeState>
  /** 重置主题为默认配置 */
  resetTheme: () => void
  /** 监听主题变更 */
  onThemeChanged: (callback: (state: ThemeState) => void) => void
}
