# electron-theme-mode

`electron-theme-mode` 是一个为 Electron 应用设计的专业主题管理方案。它深度集成 [DarkReader](https://github.com/darkreader/darkreader)，为您的应用提供工业级的暗黑模式转换能力，并确保应用在启动和运行过程中拥有连贯、一致的视觉体验。

## 🌟 核心特性

- **🚀 即时视觉同步**：在页面加载的最早期阶段即应用主题配置，确保应用从启动的第一帧起就保持预设的视觉风格。
- **🎨 完整的 DarkReader 接口**：支持调节亮度、对比度、灰度、褐色、文字描边以及自定义字体等所有 DarkReader 原生参数。
- **🔄 全局自动广播**：主题变更会自动实时同步到应用内的所有窗口（BrowserWindow）以及嵌套的框架（iframe）。
- **🖥️ 双进程 API 支持**：同时提供主进程和渲染进程的编程接口，支持在应用的任何位置灵活控制主题。
- **📦 自动配置持久化**：内置主题设置的保存与恢复机制，并支持通过自定义适配器对接您的现有配置系统。
- **🛠️ 高级修复工具**：提供注入自定义 CSS、忽略特定 URL 样式表、反色指定选择器等精细化页面修复功能。

## 📦 安装

```bash
npm install electron-theme-mode
# 或者
yarn add electron-theme-mode
```

## 🚀 快速上手

### 1. 在主进程中初始化

在主进程（Main Process）的入口文件中启用主题管理。

```javascript
const { initTheme } = require('electron-theme-mode/main');

initTheme();
```

### 2. 在预加载脚本中暴露 API

在 `preload.js` 中使用 `contextBridge` 暴露 API。

```javascript
const { contextBridge } = require('electron');
const { themeMode } = require('electron-theme-mode/preload');

contextBridge.exposeInMainWorld('themeMode', themeMode);
```

### 3. 在渲染进程中使用

```javascript
// 设置主题配置
window.themeMode.setTheme({
  mode: 'dark',
  darkReader: {
    brightness: 90,
    contrast: 100
  }
});

// 监听主题状态变更
window.themeMode.onThemeChanged((state) => {
  console.log('当前模式:', state.mode);
  console.log('暗色状态:', state.isDark);
});
```

---

## 🛠️ 进阶功能

### 嵌套框架 (iframe) 支持
为了让 iframe 也能同步主题，请在创建窗口时开启以下配置：

```javascript
new BrowserWindow({
  webPreferences: {
    nodeIntegrationInSubFrames: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### 主进程编程接口
```javascript
const { setTheme, getTheme, resetTheme } = require('electron-theme-mode/main');

// 设置主题
setTheme({ mode: 'system' });

// 重置为默认
resetTheme();
```

### 自定义存储适配器
```javascript
initTheme({
  store: {
    get: () => myConfig.get('theme'),
    set: (config) => myConfig.set('theme', config)
  }
});
```

---

## 📖 API 参考

### `ThemeConfig` 配置对象
| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `mode` | `'light' \| 'dark' \| 'system'` | 主题模式：亮色、暗色或跟随系统 |
| `darkReader` | `DarkReaderTheme` | [可选] DarkReader 显示参数 |
| `fixes` | `DarkReaderFixes` | [可选] 页面修复设置 |

### `DarkReaderTheme` 常用参数
| 属性 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `brightness` | 亮度 (0-200) | `100` |
| `contrast` | 对比度 (0-200) | `100` |
| `grayscale` | 灰度 (0-100) | `0` |
| `sepia` | 褐色 (0-100) | `0` |
| `fontFamily` | 自定义字体系列 | `''` |
| `textStroke` | 文字描边 (0-1px) | `0` |
| `scrollbarColor` | 滚动条颜色 | `auto` |
| `selectionColor` | 文本选中高亮色 | `auto` |

### `DarkReaderFixes` 修复参数
| 属性 | 说明 |
| :--- | :--- |
| `css` | 注入自定义 CSS 代码 |
| `invert` | 强制反色的 CSS 选择器列表 |
| `ignoreCSSUrl` | 忽略的外部样式表 URL 列表 |
| `ignoreInlineStyle` | 忽略的内联样式选择器列表 |

---

## 📄 开源协议
MIT License.
