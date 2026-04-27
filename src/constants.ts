/**
 * electron-theme-mode
 * IPC 频道名常量，统一使用命名空间前缀避免冲突
 */

/** IPC 频道前缀 */
const PREFIX = 'electron-theme-mode'

/** 渲染进程 → 主进程：设置主题 */
export const IPC_SET_THEME = `${PREFIX}:set`

/** 渲染进程 → 主进程：获取当前主题（异步 invoke） */
export const IPC_GET_THEME = `${PREFIX}:get`

/** 主进程 → 渲染进程：广播主题变更 */
export const IPC_THEME_CHANGED = `${PREFIX}:changed`

/** Preload → 主进程：同步获取初始状态（sendSync） */
export const IPC_GET_THEME_SYNC = `${PREFIX}:get-sync`

/** 渲染进程 → 主进程：重置主题为默认配置 */
export const IPC_RESET_THEME = `${PREFIX}:reset`
