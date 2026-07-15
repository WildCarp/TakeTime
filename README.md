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

## 网页版部署

### 方式一：本地运行

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

### 方式二：Vercel 部署

1. Fork 本仓库到你的 GitHub 账号
2. 登录 [Vercel](https://vercel.com)，点击 "New Project"
3. 导入你 Fork 的仓库
4. 框架选择 Vite，其他保持默认
5. 点击 Deploy，等待部署完成

### 方式三：GitHub Pages 部署

```bash
# 构建并部署到 gh-pages 分支
npm run deploy
```

> 注意：GitHub Pages 部署时 `vite.config.ts` 中的 `base` 会自动设为 `/TakeTime/`。

---

## 桌面版（Tauri）部署

桌面版基于 [Tauri](https://tauri.app/) 框架，打包体积仅约 1.5MB。

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- Windows 10/11（当前仅支持 Windows x64）

### 构建步骤

```bash
# 1. 在主项目中构建前端（使用相对路径）
cd TakeTime
npm install
npx vite build --base=./

# 2. 进入桌面版项目目录
cd ../TakeTime-Desktop

# 3. 安装依赖
npm install

# 4. 将前端构建产物复制到桌面版目录
#    (Windows PowerShell)
Remove-Item -Recurse -Force dist\*
Copy-Item -Recurse ..\TakeTime\dist\* dist\

# 5. 构建 Tauri 应用
npx tauri build
```

构建完成后，安装包位于：
- `src-tauri/target/release/bundle/nsis/TakeTime_1.0.0_x64-setup.exe`（NSIS 安装程序，推荐）
- `src-tauri/target/release/bundle/msi/TakeTime_1.0.0_x64_en-US.msi`（MSI 安装包）

### 直接使用

如果不需要自行构建，可以直接下载 Release 中的 `TakeTime_1.0.0_x64-setup.exe` 安装使用。

### 桌面版特有功能

- **自定义标题栏**：UI 风格统一的窗口标题栏
- **悬浮模式**：点击悬浮球的 ⬡ 按钮进入，窗口变为置顶小窗，显示今日时间轴
  - 支持滚轮缩放时间轴
  - 支持拖拽平移时间轴
  - 点击 ✕ 退出悬浮模式

---

## 技术栈

- **前端**：React 18 + TypeScript + Vite
- **桌面端**：Tauri v1 (Rust)
- **数据存储**：localStorage（纯前端，无需后端）

## 项目结构

```
TakeTime/              # 主项目（前端源码）
├── src/
│   ├── components/    # React 组件
│   ├── hooks/         # 自定义 Hooks
│   ├── stores/        # 数据管理
│   ├── utils/         # 工具函数
│   ├── types/         # TypeScript 类型
│   └── constants/     # 常量定义
├── dist/              # 构建产物
└── package.json

TakeTime-Desktop/      # 桌面版项目（Tauri 包装）
├── dist/              # 前端构建产物（从主项目复制）
├── src-tauri/
│   ├── src/main.rs    # Rust 入口
│   ├── Cargo.toml     # Rust 依赖
│   ├── tauri.conf.json # Tauri 配置
│   └── icons/         # 应用图标
└── package.json
```
