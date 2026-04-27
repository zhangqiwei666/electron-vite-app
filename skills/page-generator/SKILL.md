---
name: electron-page-generator
description: 为 Electron 应用生成符合 Smart Workbench 既定设计系统和 UI 风格的页面。
---

# Electron 页面生成器 (Skill)

此 Skill 提供了为 Smart Workbench Electron 应用生成新 UI 页面和组件的指导规范。每当用户要求构建新页面、组件或 UI 功能时，你**必须**严格遵循这些设计规范，以确保与现有的应用程序风格保持高度一致。

## 1. 技术栈规范
- **框架**: Vue 3 (Composition API, `<script setup>`)
- **UI 组件库**: Element Plus
- **图标库**: `@element-plus/icons-vue`
- **路由**: `vue-router`

## 2. 全局设计 Token & 排版
- **字体**: `'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- **全局背景色**: 
  - 深色模式默认页面背景: `var(--el-bg-color-page)`
  - 面板/组件背景: `var(--el-bg-color)`
  - 深邃黑背景 (登录页风格): `#111111`, `#0a0a0a`
- **品牌主色调**: 荧光绿/青柠色 (`#c8ff00`)。主按钮请使用渐变色，如 `linear-gradient(135deg, #c8ff00 0%, #a8e600 100%)`。
- **辅助/操作色**: 危险红 (`var(--el-color-danger)`, `#e74c3c`)，成功绿 (`var(--el-color-success)`)。
- **文本颜色**: 
  - 主要文本: `var(--el-text-color-primary)` 或 `#ffffff`
  - 次要文本: `var(--el-text-color-secondary)`, `rgba(255, 255, 255, 0.6)`
  - 占位符文本: `rgba(255, 255, 255, 0.25)` 或 `var(--el-text-color-placeholder)`
- **圆角 (Border Radius)**: 输入框、按钮和卡片使用 `8px` 或 `10px`，打造现代柔和感。

## 3. Element Plus 组件深度定制 (Overrides)
使用 Element Plus 组件时，应用 `:deep()` 深度覆盖以匹配深色、科技感的视觉美学：

### 输入框 (`el-input`)
- 背景色: `rgba(255, 255, 255, 0.05)` 或 `var(--el-fill-color-light)`
- 边框: `1px solid rgba(255, 255, 255, 0.1)` 或 `var(--el-border-color-light)`
- 圆角: `8px` 或 `10px`
- 聚焦状态 (Focus): 边框颜色变为 `#c8ff00` 或 `var(--el-color-danger)`，并可增加微妙的阴影（例如 `box-shadow: 0 0 0 3px rgba(200, 255, 0, 0.06)`）。

### 按钮 (`el-button`)
- **主操作按钮 (品牌色)**: 
  ```css
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #0a0a0a !important;
  font-weight: 700 !important;
  ```
  悬停效果 (Hover): `transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200, 255, 0, 0.25);`
- **危险操作按钮**: Type 设为 `"danger"`，圆角 (`border-radius: 8px`)。
- **次要/幽灵按钮**: 透明背景，边框 `1px solid rgba(255, 255, 255, 0.12)`，文本颜色 `rgba(255, 255, 255, 0.7)`。

## 4. 布局模式
- **Flexbox**: 大量使用 Flexbox 进行对齐 (`display: flex; align-items: center; justify-content: space-between`)。
- **卡片/容器**: 使用边框 (`1px solid var(--el-border-color-light)`) 来界定边界，而不是使用厚重的投影。 
- **间距**: 使用标准的间距（如 `gap: 8px`, `gap: 12px`, `gap: 16px`）和内边距（如 `padding: 24px 28px`）。

## 5. 视觉修饰 & 特效
- **渐变与发光 (Glows)**: 使用径向渐变作为背景发光 (`radial-gradient(circle, rgba(200, 255, 0, 0.06) 0%, transparent 70%)`)。
- **网格背景**: 使用 `linear-gradient` 组合在背景中创建微妙的科技感网格线。
- **动画过渡**: 为交互元素添加微妙的过渡效果（例如 `transition: all 0.25s`，悬停时的 `transform: scale(1.05)`）。
- **毛玻璃效果 (Glassmorphism)**: 对悬浮元素或特定 UI 面板使用半透明背景并加上边框。

## 6. 开发实施流程
1. **需求分析**: 深入理解新页面所需的数据展示和交互逻辑。
2. **构建模板**: 使用语义化 HTML 和 Element Plus 组件搭建结构。
3. **应用 CSS 样式**: 编写 `<style scoped>` 局部样式，务必使用 `:deep()` 来覆盖 Element Plus 组件内部样式。
4. **注入响应式状态**: 利用 vue 的 `ref`、`computed` 和生命周期钩子处理数据和状态。

每当收到创建新页面的请求时，确认你正在应用 "electron-page-generator" Skill，并输出单一文件格式的 Vue 组件 (Vue SFC)，严格遵循上述规范。
