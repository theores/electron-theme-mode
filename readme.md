# electron-theme-mode

`electron-theme-mode` is a professional theme management solution for Electron applications. Powered by [DarkReader](https://github.com/darkreader/darkreader), it provides industrial-grade dark mode conversion and ensures a coherent, consistent visual experience throughout your application's lifecycle.

## 🌟 Key Features

- **🚀 Instant Visual Synchronization**: Applies theme configurations at the earliest stage of page load, ensuring consistent visual style from the very first frame.
- **🎨 Complete DarkReader Interface**: Supports all native parameters including brightness, contrast, grayscale, sepia, text stroke, and custom fonts.
- **🔄 Global Broadcast**: Automatically synchronizes theme changes in real-time across all windows (BrowserWindow) and nested frames (iframes).
- **🖥️ Dual-Process API**: Provides programming interfaces for both Main and Renderer processes, offering flexible theme control from anywhere in your app.
- **📦 Automatic Persistence**: Built-in mechanism to save and restore theme settings, with support for custom adapters to integrate with your existing configuration system.
- **🛠️ Advanced Fixes**: 精细化精细化页面修复功能 including custom CSS injection, ignoring specific stylesheet URLs, and inverting specific selectors.

## 📦 Installation

```bash
npm install electron-theme-mode
# or
yarn add electron-theme-mode
```

## 🚀 Quick Start

### 1. Initialize in Main Process

Enable theme management in your main process entry file.

```javascript
const { initTheme } = require('electron-theme-mode/main');

initTheme();
```

### 2. Expose API in Preload Script

Expose the API using `contextBridge` in your `preload.js`.

```javascript
const { contextBridge } = require('electron');
const { themeMode } = require('electron-theme-mode/preload');

contextBridge.exposeInMainWorld('themeMode', themeMode);
```

### 3. Use in Renderer Process

```javascript
// Set theme configuration
window.themeMode.setTheme({
  mode: 'dark',
  darkReader: {
    brightness: 90,
    contrast: 100
  }
});

// Listen for theme state changes
window.themeMode.onThemeChanged((state) => {
  console.log('Current mode:', state.mode);
  console.log('Is dark:', state.isDark);
});
```

---

## 🛠️ Advanced Usage

### iframe Support
To keep iframes synchronized with the theme, enable this option when creating windows:

```javascript
new BrowserWindow({
  webPreferences: {
    nodeIntegrationInSubFrames: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### Main Process API
```javascript
const { setTheme, getTheme, resetTheme } = require('electron-theme-mode/main');

// Set theme mode
setTheme({ mode: 'system' });

// Reset to default
resetTheme();
```

### Advanced Page Fixes
Use the `fixes` configuration to solve display issues for specific elements:

#### Force Invert
Useful for dark icons or elements that are hard to see on dark backgrounds.
```javascript
window.themeMode.setTheme({
  mode: 'dark',
  fixes: {
    invert: ['.sidebar-icon', '.logo-dark'] // These selectors will be forced to invert
  }
});
```

#### Ignore Conversion
Keep a specific area in its original light appearance (e.g., color pickers or preview zones):
```javascript
window.themeMode.setTheme({
  mode: 'dark',
  fixes: {
    // Option A: Override colors by injecting CSS (Recommended)
    css: `
      .keep-light-zone { 
        background-color: #ffffff !important; 
        color: #333333 !important; 
      }
    `,
    // Option B: Ignore inline style processing for the area
    ignoreInlineStyle: ['.keep-light-zone']
  }
});
```

---

## 📖 API Reference

### `ThemeConfig`
| Property | Type | Description |
| :--- | :--- | :--- |
| `mode` | `'light' \| 'dark' \| 'system'` | Theme mode: light, dark, or follow system |
| `darkReader` | `DarkReaderTheme` | [Optional] DarkReader display parameters |
| `fixes` | `DarkReaderFixes` | [Optional] Page fix settings |

### `DarkReaderTheme` (Common)
| Property | Description | Default |
| :--- | :--- | :--- |
| `brightness` | Brightness (0-200) | `100` |
| `contrast` | Contrast (0-200) | `100` |
| `grayscale` | Grayscale (0-100) | `0` |
| `sepia` | Sepia (0-100) | `0` |
| `fontFamily` | Custom font family | `''` |
| `textStroke` | Text stroke (0-1px) | `0` |
| `scrollbarColor` | Custom scrollbar color | `auto` |
| `selectionColor` | Selection highlight color | `auto` |

---

## 📄 License
MIT License.
