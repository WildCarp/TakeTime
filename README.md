# TakeTime

一款简洁美观的时间管理应用，支持网页版和桌面版（Windows EXE）。

## 功能特性

- 📅 可视化日程表（网格时间轴）
- 🏷️ 标签组分类管理任务
- 🔄 支持周期性重复任务
- 🌙 日间/夜间主题切换
- 💾 数据导入/导出
- 🖥️ 桌面版支持悬浮模式（置顶小窗显示今日日程）

---

## 网页版本地部署

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 桌面版（Tauri）部署

桌面版基于 [Tauri](https://tauri.app/) 框架，打包体积仅约 1.5MB。

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- Windows 10/11（当前仅支持 Windows x64）

### 构建步骤

桌面版代码已合并进本仓库的 `desktop/` 子目录，单一仓库即可完整构建，无需额外 clone 其他项目。

```bash
# 1. 安装网页版依赖并构建前端（产物输出到仓库根目录 dist/）
npm install
npm run build

# 2. 进入桌面版目录，安装依赖
cd desktop
npm install

# 3. （可选）重新生成应用图标（默认使用内置的纯色图标源）
npm run generate-icons

# 4. 构建 Tauri 应用（会自动使用上层 dist/ 作为前端资源）
npm run tauri:build
```

> 也可以使用根目录的一键脚本：`npm run desktop:build`（等价于先 build 网页版再 tauri build）。

构建完成后，安装包位于：
- `desktop/src-tauri/target/release/bundle/nsis/TakeTime_1.0.0_x64-setup.exe`（NSIS 安装程序，推荐）
- `desktop/src-tauri/target/release/bundle/msi/TakeTime_1.0.0_x64_en-US.msi`（MSI 安装包）

构建完成后，安装包位于：
- `src-tauri/target/release/bundle/nsis/TakeTime_1.0.0_x64-setup.exe`（NSIS 安装程序，推荐）
- `src-tauri/target/release/bundle/msi/TakeTime_1.0.0_x64_en-US.msi`（MSI 安装包）

### 直接使用

如果不需要自行构建，可以直接下载 Release 中的 `TakeTime_1.0.0_x64-setup.exe` 安装使用。

### 桌面版特有功能

- **自定义标题栏**：UI 风格统一的窗口标题栏
- **悬浮模式**：点击悬浮球的 ⬡ 按钮进入，窗口变为置顶小窗，显示今日时间轴
  - 滚轮缩放时间轴
  - 右键拖拽平移时间轴
  - 左键拖拽移动任务
  - 点击 ✕ 退出悬浮模式

---

## 技术栈

- **前端**：React 18 + TypeScript + Vite
- **桌面端**：Tauri v1 (Rust)
- **数据存储**：localStorage（纯前端，无需后端）

## 项目结构

```
TakeTime/                 # 单一仓库（网页版 + 桌面版）
├── src/                  # 前端源码（React 组件 / hooks / stores / utils ...）
├── public/
│   └── favicon.svg       # 网页版图标（纯色）
├── dist/                 # 网页版构建产物（桌面版 Tauri 的前端资源）
├── desktop/              # 桌面版项目（Tauri 包装，合并自原 TakeTime-Desktop）
│   ├── generate-icons.js # 图标生成脚本（使用内置纯色图标源，路径自包含）
│   ├── src-tauri/
│   │   ├── src/main.rs   # Rust 入口
│   │   ├── Cargo.toml    # Rust 依赖
│   │   ├── tauri.conf.json # Tauri 配置（distDir 指向上层 dist/）
│   │   └── icons/        # 应用图标（含 icon-source.svg 内置纯色源）
│   └── package.json
└── package.json
```
