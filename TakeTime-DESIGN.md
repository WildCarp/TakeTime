# TakeTime — 设计规范文档（DESIGN.md）

> 基于 [animal-island-ui](https://github.com/guokaigdg/animal-island-ui) v0.9.5 设计体系 | 动物森友会风格

---

## 1. 设计令牌速查（来自 animal-island-ui）

> animal-island-ui 的设计令牌**编译内嵌在 CSS 中，不对外暴露为 CSS 变量**。以下为开发时需自行声明的硬编码值。

### 1.1 色彩体系

#### 主色调（Mint Teal）
| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | `#19c8b9` | 主色、选中态、交互强调 |
| Primary Hover | `#3dd4c6` | hover 态 |
| Primary Active | `#11a89b` | active 态 |
| Primary BG | `#e6f9f6` | 主色浅背景 |

#### 文字色（暖棕色系，**禁止纯黑 `#000`**）
| 层级 | 色值 | 用途 |
|------|------|------|
| Text Primary | `#794f27` | Header、标题 |
| Text Body | `#725d42` | 组件内正文 |
| Text Secondary | `#9f927d` | 次要文字 |
| Text Muted | `#8a7b66` | 弱化文字 |
| Text Disabled | `#c4b89e` | 禁用态 |

#### 背景色（暖羊皮纸系，**禁止冷灰 `#f5f5f5`**）
| 角色 | 色值 | 用途 |
|------|------|------|
| BG Main | `#f8f8f0` | 主背景 |
| BG Content | `rgb(247, 243, 223)` | 卡片、Modal、Drawer 内部 |
| BG Disabled | `#f0ece2` | 禁用背景 |

#### 边框色
| 角色 | 色值 | 粗细 |
|------|------|------|
| Border Default | `#9f927d` | `2px solid` |
| Border Light | `#c4b89e` | `2.5px`（输入框） |
| Border Hover | `#a89878` | — |

#### 状态色
| 状态 | 色值 | Hover / Active |
|------|------|-----------------|
| Success | `#6fba2c` | `#5a9e1e` |
| Warning | `#f5c31c` | `#dba90e` |
| Error | `#e05a5a` | `#c94444` |

#### 游戏特殊色
| 角色 | 色值 | 用途 |
|------|------|------|
| 焦点黄 | `#ffcc00` | Input/Checkbox 聚焦 |
| 焦点黄深 | `#e0b800` | Input 阴影 |
| Switch On 绿 | `#86d67a` | Switch 开启轨道 |
| Switch Off 灰 | `#d4c9b4` | Switch 关闭轨道 |
| 3D 阴影色 | `#bdaea0` | Primary 按钮底部阴影 |
| 输入框阴影 | `#d4c9b4` | 输入框 3D 阴影 (`shadow={true}`) |
| 焦点环青绿 | `#19c8b9` | Button 聚焦 |

---

### 1.2 字体系统

```css
font-family: Nunito, 'Noto Sans SC', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
```

**Google Fonts（必须在 index.html 引入）：**
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
```

| 用途 | 字重 | 字间距 | 备注 |
|------|------|--------|------|
| 正文 | `500` | `0.01em` | — |
| 按钮 | `600` | `0.02em` | — |
| 标题 | `600–700` | — | — |
| 数字强调 | `900` | `2px` | 时间数字等 |
| Placeholder | `400` | — | **最低不得低于 400** |

---

### 1.3 间距 / 圆角 / 阴影

```
间距: xs=4px  sm=8px  md=12px  lg=16px  xl=24px
圆角: sm=12px  base=18px  lg=24px  pill=999px
```

| 元素 | 圆角 |
|------|------|
| Button（中号） | `50px`（胶囊） |
| Input | `50px`（胶囊） |
| Card / Table 外壳 | `20px` |
| Tag | `999px`（胶囊） |
| Modal | SVG blob clip-path（有机形状） |
| Drawer 面板 | `20px` |
| Notification | `18px` |
| Tooltip | `16px` |
| **最小圆角** | **`12px`（禁止直角）** |

**阴影规则：**
- **Primary 按钮**（游戏按键 3D 感）：`box-shadow: 0 5px 0 0 #bdaea0`（静止）→ hover `0 6px` + `translateY(-1px)` → active `0 1px` + `translateY(2px)`
- **Default 按钮**（柔和提升）：`box-shadow: 0 2px 4px 0 rgba(61,52,40,0.06)`
- **Input**：默认无阴影，`shadow={true}` 可选开启 `0 3px 0 0 #d4c9b4`

---

### 1.4 动效

```css
/* 通用过渡 */
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
/* 快速过渡 */
transition: all 0.15s;
/* Modal 入场 */
animation: animal-zoom-in 0.3s ease;  /* scale(0.92) → scale(1) */
/* 淡入上移 */
animation: ac-fade-up 0.3s ease;      /* translateY(8px) opacity 0 → 1 */
/* Collapse 展开 */
transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

### 1.5 聚焦环

| 组件 | 聚焦样式 |
|------|----------|
| Input / Checkbox | `border-color: #ffcc00; box-shadow: 0 0 0 3px rgba(255,204,0,0.15)` |
| Button | `outline: 2px solid #19c8b9; outline-offset: 2px` |
| Radio | `outline: 2px solid #f5c31c; outline-offset: 2px` |
| Switch | `outline: 2px solid #ffcc00; outline-offset: 2px` |

---

## 2. 组件映射：animal-island-ui → TakeTime

| 库组件 | TakeTime 用途 | 说明 |
|--------|--------------|------|
| **Button** | 功能球、弹窗确定/取消、侧边栏操作按钮、导入/导出按钮 | `type="primary"` 用于强调操作 |
| **Card** | 日历容器背景壳 | `color="default"` 提供羊皮纸背景 |
| **Tag** | 侧边栏标签组标签展示 | `variant="solid"`, `color` 对应标签组颜色 |
| **Modal** | 新建任务、新建/修改标签组、导入选项 | 有机 blob 形状，内置 typewriter 动画（关闭） |
| **Drawer** | 任务详情面板（右侧滑出） | `placement="right"`, `pushBackground={true}` |
| **Input** | 任务名称、标签组名称 | 胶囊形输入框 |
| **Select** | 创建任务时选择标签组 | 纯受控组件 |
| **Form** + **FormItem** + **useForm** | 任务创建/编辑表单 | 24 列 Grid 布局 |
| **Switch** | — | 暂不使用 |
| **Notification** | Toast 提示消息（命令式调用） | `Notification.success()` / `.error()` 等 |
| **Title** | 侧边栏「标签组」「已完成」标题 | 燕尾飘带风格 `size="small"` |
| **Collapse** | 侧边栏标签组展开/收起未完成任务列表 | `question`=标签组标题, `answer`=任务列表 |
| **Icon** | 装饰图标（10 种预设） | 可选用 |
| **Footer** | 页面底部 | `type="tree"`, `seamless={true}` |
| **Divider** | 侧边栏区域分隔 | `type="dashed-brown"` |
| **Tooltip** | 功能球提示、操作按钮提示 | `variant="island"` |
| **Table** | — | 暂不使用 |
| **Checkbox** | — | 任务格子勾选框为**自实现**（需要嵌入格子右上角） |
| **Radio** | — | 暂不使用 |
| **CodeBlock** | — | 暂不使用 |

---

## 3. 自定义组件设计规范

> 以下组件为 animal-island-ui 未提供，需自实现，但**必须严格遵循其设计令牌**。

### 3.1 日程表（Calendar）

#### 整体布局
- 使用 CSS Grid 或绝对定位
- 背景色：`#f8f8f0`
- 横轴时间标签和竖轴日期标签**固定（冻结窗格）**，内容区域滚动

#### 网格线（GridLines）
```css
/* 极淡的辅助线，不作为可交互单元格 */
grid-line {
  stroke: rgba(114, 93, 66, 0.08);  /* 日间模式 */
  stroke-width: 1px;
}
/* 整点线稍明显 */
hour-line {
  stroke: rgba(114, 93, 66, 0.12);
  stroke-width: 1px;
}
```

#### 轴标签（Axis Labels）
- 字体：`Nunito`, `font-weight: 700`, `font-size: 12px`
- 颜色：`#9f927d`
- 始终在视野内，密度随缩放级别变化

---

### 3.2 任务格子（TaskBlock）

#### 尺寸计算
- 宽度：基于时间跨度占当前视图时间范围的比例
- 高度：基于日期跨度占当前视图日期范围的比例
- 跨天任务：跨多行显示

#### 样式
```css
.task-block {
  /* 基础 */
  border-radius: 12px;
  padding: 8px 12px;
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #fff; /* 深色标签组用白色文字 */

  /* 3D 游戏感 — 底部阴影 */
  box-shadow: 0 3px 0 0 rgba(0,0,0,0.15)
            , 0 2px 8px rgba(61,52,40,0.08);

  /* hover 提升 */
  transition: transform 0.15s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.15s cubic-bezier(0.4,0,0.2,1);
  cursor: grab;
}

.task-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 0 0 rgba(0,0,0,0.12),
              0 4px 12px rgba(61,52,40,0.12);
}

.task-block:active {
  cursor: grabbing;
  transform: translateY(1px);
  box-shadow: 0 1px 0 0 rgba(0,0,0,0.1);
}
```

#### 颜色映射（标签组颜色 → 格子颜色）
```css
/* 深色系（紫/蓝/橙/红/棕/蜜桃）→ 白色文字 */
.color-purple            { background: #b77dee; color: #fff; }
.color-app-blue          { background: #889df0; color: #fff; }
.color-app-orange        { background: #e59266; color: #fff; }
.color-app-red           { background: #fc736d; color: #fff; }
.color-brown             { background: #9a835a; color: #fff; }
.color-warm-peach-pink   { background: #e18c6f; color: #fff; }

/* 浅色系（粉/青绿/薄荷/黄绿）→ 白色或深色文字 */
.color-app-pink          { background: #f8a6b2; color: #fff; }
.color-app-teal          { background: #82d5bb; color: #fff; }
.color-app-green         { background: #8ac68a; color: #fff; }
.color-app-yellow        { background: #f7cd67; color: #725d42; }
.color-lime-green        { background: #d1da49; color: #3d5a1a; }
.color-yellow-green      { background: #ecdf52; color: #725d42; }

/* 预设色（与 PRD 10 色对应，映射到 NookPhone 调色板） */
.color-coral     { background: #fc736d; color: #fff; }  /* 珊瑚红 → app-red */
.color-citrus    { background: #e59266; color: #fff; }  /* 柑橘橙 → app-orange */
.color-sun       { background: #f7cd67; color: #725d42; } /* 阳光黄 → app-yellow */
.color-mint      { background: #8ac68a; color: #fff; }  /* 薄荷绿 → app-green */
.color-sky       { background: #889df0; color: #fff; }  /* 天空蓝 → app-blue */
.color-lavender  { background: #b77dee; color: #fff; }  /* 薰衣草紫 → purple */
.color-berry     { background: #da77f2; color: #fff; }  /* 莓果紫 → purple 同系 */
.color-sakura    { background: #f8a6b2; color: #fff; }  /* 樱花粉 → app-pink */
.color-teal      { background: #82d5bb; color: #fff; }  /* 青绿 → app-teal */
.color-stone     { background: #9a835a; color: #fff; }  /* 岩石灰 → brown */
```

#### 已完成状态
```css
.task-block.completed {
  opacity: 0.55;
  filter: saturate(0.4) grayscale(0.3);
  /* 不消失，保留在日程表中 */
}
```

#### 右上角勾选框
```css
.task-block .checkbox {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.15);
  cursor: pointer;
  transition: all 0.15s ease;
  /* 阻止事件冒泡到格子本体 */
}

.task-block .checkbox:hover {
  background: rgba(255,255,255,0.35);
}

.task-block .checkbox.checked {
  background: #19c8b9;
  border-color: #19c8b9;
}

.task-block .checkbox.checked::after {
  content: '✓';
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
```

#### 拖拽边缘手柄
```css
.task-block .resize-handle {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  opacity: 0;
  transition: opacity 0.15s;
}

.task-block .resize-handle.left  { left: 0; }
.task-block .resize-handle.right { right: 0; }

.task-block:hover .resize-handle {
  opacity: 1;
  background: rgba(255,255,255,0.25);
}
```

---

### 3.3 悬浮功能球（FloatingBall）

#### 主球
```css
.floating-ball-main {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #19c8b9;
  box-shadow: 0 4px 0 0 #11a89b, 0 6px 20px rgba(26, 200, 185, 0.35);
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.25s cubic-bezier(0.4,0,0.2,1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  /* 旋转动画：收起时 0deg，展开时 45deg */
}

.floating-ball-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 0 #11a89b, 0 8px 24px rgba(26, 200, 185, 0.4);
}

.floating-ball-main:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 0 #11a89b, 0 2px 8px rgba(26, 200, 185, 0.3);
}
```

#### 子球
```css
.floating-ball-child {
  position: fixed;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transform: scale(0);
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* 展开时子球位置和样式 */
.floating-ball.expanded .floating-ball-child {
  opacity: 1;
  transform: scale(1);
}

.floating-ball-child.add {
  bottom: 104px;  /* 主球上方 48 + 56 */
  right: 32px;
  background: #6fba2c;
  box-shadow: 0 3px 0 0 #5a9e1e, 0 4px 12px rgba(111,186,44,0.3);
}

.floating-ball-child.locate {
  bottom: 70px;
  right: 76px;
  background: #f5c31c;
  box-shadow: 0 3px 0 0 #dba90e, 0 4px 12px rgba(245,195,28,0.3);
}

.floating-ball-child.theme {
  bottom: 32px;
  right: 104px;
  background: #b77dee;
  box-shadow: 0 3px 0 0 #9050d0, 0 4px 12px rgba(183,125,238,0.3);
}

.floating-ball-child:hover {
  transform: scale(1) translateY(-2px);
}
```

---

### 3.4 Toast 提示消息

使用 animal-island-ui `Notification` API（命令式调用）：

```typescript
import { Notification } from 'animal-island-ui';

// 成功
Notification.success({ message: '任务创建成功', duration: 3 });

// 错误
Notification.error({ message: '时间与已有任务冲突，请调整', duration: 3 });

// 警告
Notification.warning({ message: '请填写任务名称', duration: 3 });

// 信息
Notification.info({ message: '导入成功，共导入 5 个标签组、12 个任务', duration: 3 });
```

**Notification 样式（库默认）：**
- 位置：`position="top"`（顶部居中，符合 PRD 要求）
- 自动消失：`duration: 3`（3 秒）
- 样式：`border-radius: 18px; border: 2px solid #c4b89e;` 暖色卡片

---

### 3.5 模态框（Modal）

使用 animal-island-ui `Modal`（**注意关闭 typewriter 动画以提升表单编辑速度**）：

```tsx
import { Modal, Button, Input, Form, FormItem, Select, useForm } from 'animal-island-ui';
import 'animal-island-ui/style';

// 新建任务 Modal
<Modal
  open={taskModalOpen}
  title="新建任务"
  typeSpeed={0}        // 关闭打字机动画
  typewriter={false}   // 不适用于表单场景
  onClose={() => setTaskModalOpen(false)}
  footer={
    <>
      <Button onClick={() => setTaskModalOpen(false)}>取消</Button>
      <Button type="primary" onClick={handleSubmit}>创建</Button>
    </>
  }
>
  {/* Form 内容 */}
</Modal>
```

---

### 3.6 任务详情面板（TaskDetailPanel）

使用 animal-island-ui `Drawer`：

```tsx
import { Drawer, Button, Input, Form, FormItem, Select, useForm } from 'animal-island-ui';

<Drawer
  open={detailOpen}
  title="任务详情"
  placement="right"
  width={378}
  pushBackground={true}   // 背后内容下沉效果
  maskClosable={true}
  onClose={() => setDetailOpen(false)}
>
  {/* 表单内容：标签组 Select、名称 Input、开始时间、结束时间 */}
</Drawer>
```

---

## 4. 日间 / 夜间模式

### 4.1 实现策略

animal-island-ui 的设计令牌**编译内嵌**，不暴露 CSS 变量。夜间模式需要**全局 CSS 覆盖**通过 `[data-theme="dark"]` 选择器实现。

### 4.2 颜色映射

```css
/* 日间模式 — 库默认 */
:root, [data-theme="light"] {
  /* 无需额外声明，库自带 */
}

/* 夜间模式 — 覆盖 */
[data-theme="dark"] {
  /* 全局背景 */
  --tt-bg: #1a1a2e;
  --tt-bg-content: #222240;

  /* 文字 */
  --tt-text: #e0d6c8;
  --tt-text-body: #d4c9b4;
  --tt-text-muted: #a09880;

  /* 网格线 */
  --tt-grid-line: rgba(255,255,255,0.05);
  --tt-grid-hour: rgba(255,255,255,0.08);

  /* 已完成任务格子 */
  --tt-completed-opacity: 0.35;
}

/* 应用夜间模式到自定义区域 */
[data-theme="dark"] .calendar-container {
  background: var(--tt-bg);
}

[data-theme="dark"] .grid-line {
  stroke: var(--tt-grid-line);
}

[data-theme="dark"] .axis-label {
  color: var(--tt-text-muted);
}
```

> animal-island-ui 组件本身**没有内置夜间模式**，因此 Modal、Drawer、Card 等组件在夜间模式下仍显示暖色羊皮纸风格。这是一个可接受的设计取舍——动森风格的温暖感本身就是产品特色。如果后续需要完美夜间模式，可对库组件的内部类名做针对性覆盖。

### 4.3 主题切换实现

```typescript
// useTheme.ts
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => localStorage.getItem('taketime-theme') as 'light' | 'dark' || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taketime-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggle };
};
```

---

## 5. 布局规范

### 5.1 整体结构

```
┌─────────────────────────────────────────────────────┐
│              Notification 区域（顶部，z-index: 2000） │
├────────┬──────────────────────────────────┬──────────┤
│ Sidebar│          Calendar                 │ Drawer   │
│ 240px  │          flex: 1                 │ 378px    │
│        │                                  │ (弹出)   │
│        │                                  │          │
├────────┴──────────────────────────────────┴──────────┤
│              Footer (60px, tree, seamless)           │
└─────────────────────────────────────────────────────┘
        ↑
   FloatingBall (z-index: 1500, fixed)
```

### 5.2 侧边栏

```css
.sidebar {
  width: 240px;
  background: rgb(247, 243, 223);  /* 暖羊皮纸 */
  padding: 24px 16px;
  border-right: 2px solid #e8dcc8;
  overflow-y: auto;
}
```

### 5.3 日程表

```css
.calendar-container {
  flex: 1;
  overflow: hidden;      /* 内部通过 transform 平移 */
  background: #f8f8f0;
  position: relative;
}

/* 内部可平移层 */
.calendar-inner {
  transform-origin: top left;
  transition: transform 0.1s ease-out;  /* 缩放用 transition，拖拽用即时变换 */
}
```

---

## 6. 动画规范

| 动画 | 时长 | 缓动 | 说明 |
|------|------|------|------|
| 视图平移 | 即时（跟随鼠标） | 无 | `transform: translate()` 直接设置 |
| 视图缩放 | `0.2s` | `cubic-bezier(0.4,0,0.2,1)` | 缩放结束后用 transition |
| 功能球展开/收起 | `0.25s` | `cubic-bezier(0.4,0,0.2,1)` | 子球 scale + opacity |
| Modal 弹入 | `0.3s` | `ease` | 库内置 `animal-zoom-in` |
| Drawer 滑入 | `0.3s` | `cubic-bezier(0.4,0,0.2,1)` | 库内置 + 背景下沉 |
| 任务格子 hover | `0.15s` | `cubic-bezier(0.4,0,0.2,1)` | translateY 提升 |
| 勾选框切换 | `0.15s` | `ease` | 填充动画 |
| Collapse 展开 | `0.3s` | `cubic-bezier(0.4,0,0.2,1)` | CSS grid-template-rows |
| Toast 入场 | `0.25s` | — | 库内置 |

---

## 7. 设计约束速查

### ✅ 必须遵守

- 字体：Nunito + Noto Sans SC，正文 weight 500，按钮 weight 600+
- 圆角：任何交互元素 ≥ 12px，按钮/输入框用 50px pill
- 文字：始终暖棕色系，禁止 `#000` / `#111`
- 背景：暖羊皮纸 `#f8f8f0` / `rgb(247,243,223)`，禁止冷灰
- 阴影：暖色 shadow `rgba(61,52,40,0.x)`，禁止冷黑 `rgba(0,0,0,0.x)`
- 聚焦：输入框用 `#ffcc00` 黄，按钮用 `#19c8b9` 青绿

### ❌ 禁止

- 直角矩形交互元素（`border-radius: 0`）
- 纯黑文字、冷灰背景
- 冷蓝色聚焦环
- Flat Design（至少需要软阴影）
- Primary 以外的按钮使用 3D 厚阴影
- style 内联覆盖库组件的圆角/阴影/颜色

---

## 8. 关键组件使用示例

### 8.1 新建标签组 Modal

```tsx
import { Modal, Button, Input, Form, FormItem, Select, useForm, Title } from 'animal-island-ui';

const TAG_COLORS = [
  { key: 'app-red',    label: '🔴 珊瑚红' },
  { key: 'app-orange', label: '🟠 柑橘橙' },
  { key: 'app-yellow', label: '🟡 阳光黄' },
  { key: 'app-green',  label: '🟢 薄荷绿' },
  { key: 'app-blue',   label: '🔵 天空蓝' },
  // ...
];

const PRESET_EMOJIS = ['💼','🏠','🏃','🎮','📚','🍔','🎵','✈️','💻','🛒','🎨','🏥','🎓','✍️','🎂'];

function TagGroupModal({ open, onClose, onSubmit }) {
  const [form] = useForm();

  return (
    <Modal
      open={open}
      title="新建标签组"
      typewriter={false}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>创建</Button>
        </>
      }
    >
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <FormItem name="name" label="名称" rules={[{ required: true }]}>
          <Input placeholder="输入标签组名称" />
        </FormItem>
        <FormItem name="color" label="颜色" rules={[{ required: true }]}>
          <Select options={TAG_COLORS} />
        </FormItem>
        <FormItem name="emoji" label="Emoji" rules={[{ required: true }]}>
          <Select options={PRESET_EMOJIS.map(e => ({ key: e, label: e }))} />
        </FormItem>
      </Form>
    </Modal>
  );
}
```

### 8.2 侧边栏标签组 Collapse

```tsx
import { Collapse, Title, Tag } from 'animal-island-ui';

// 标签组区域标题
<Title size="small" color="app-teal">标签组</Title>

// 每个标签组使用 Collapse 展开
{tagGroups.map(group => (
  <Collapse
    key={group.id}
    question={
      <span>
        <Tag color={group.color} size="small">{group.emoji} {group.name}</Tag>
        <Button type="text" size="small" onClick={() => editGroup(group)}>
          修改
        </Button>
      </span>
    }
    answer={
      <div>
        {tasks.filter(t => t.tagGroupId === group.id && !t.completed).map(task => (
          <div key={task.id} onClick={() => openDetail(task)}>
            {task.name}
          </div>
        ))}
      </div>
    }
  />
))}
```

---

> **文档版本**：v1.0  
> **创建日期**：2026-07-13  
> **基于**：animal-island-ui v0.9.5 设计体系
