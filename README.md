# AnkiLearner

[English](#english) | [简体中文](#chinese)

<a id="english"></a>

## English

A modern flashcard learning application focused on spaced repetition and interactive study experiences. Built with React and the latest web technologies.

### Features

- **Spaced Repetition System (SRS)**: Optimized learning algorithm to help you remember efficiently.
- **Interactive Flashcards**:
  - Drag gestures for rating cards (Easy, Good, Hard, Retry).
  - 3D flip animations.
  - Custom card skins (Ocean, Forest, Sunset, etc.).
- **Deck Management**: Import and manage multiple decks (CET-4, CET-6, IELTS, etc.).
- **Rich Data Visualization**: Track your learning progress with detailed statistics.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Offline Capable**: Uses IndexedDB for local data storage.

### Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Jotai](https://jotai.org/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **UI Components**: [Headless UI](https://headlessui.com/) & [Heroicons](https://heroicons.com/)

### Getting Started

#### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yeeerq/AnkiLearner.git
   cd AnkiLearner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run deploy`: Deploy to GitHub Pages

### Deployment

This project is configured for deployment to GitHub Pages.

1. Ensure your `vite.config.ts` has the correct base path set.
2. Run the deployment script:
   ```bash
   npm run deploy
   ```

### License

MIT License

### Acknowledgements

- Inspired by [the original project](https://github.com/Kaiyiwing/qwerty-learner)
- Dictionary data provided by the open-source community

---

<a id="chinese"></a>

## 简体中文

一个专注于间隔重复和交互式学习体验的现代单词卡片学习应用。基于 React 和最新的 Web 技术构建。

### 核心功能

- **间隔重复系统 (SRS)**: 优化的学习算法，助你高效记忆。
- **交互式卡片**:
  - 拖拽手势评分 (Easy, Good, Hard, Retry)。
  - 3D 翻转动画。
  - 自定义卡片皮肤 (海洋, 森林, 日落等)。
- **词库管理**: 导入和管理多个词库 (CET-4, CET-6, IELTS 等)。
- **丰富的数据可视化**: 详细统计追踪你的学习进度。
- **响应式设计**: 针对桌面和移动设备进行了优化。
- **支持离线**: 使用 IndexedDB 进行本地数据存储。

### 技术栈

- **框架**: [React 19](https://react.dev/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **状态管理**: [Jotai](https://jotai.org/)
- **路由**: [React Router 7](https://reactrouter.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **数据库**: [Dexie.js](https://dexie.org/) (IndexedDB 封装)
- **UI 组件**: [Headless UI](https://headlessui.com/) & [Heroicons](https://heroicons.com/)

### 快速开始

#### 前置要求

- Node.js (推荐最新的 LTS 版本)
- npm 或 yarn

#### 安装步骤

1. 克隆仓库:
   ```bash
   git clone https://github.com/yourusername/qwerty-learner-article.git
   cd qwerty-learner-article
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

4. 打开浏览器并访问 `http://localhost:5173`

### 脚本说明

- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产构建
- `npm run lint`: 运行 ESLint 代码检查
- `npm run deploy`: 部署到 GitHub Pages

### 部署指南

本项目已配置为部署到 GitHub Pages。

1. 确保 `vite.config.ts` 中的 base 路径已正确设置。
2. 运行部署脚本:
   ```bash
   npm run deploy
   ```

### 许可证

MIT License

### 致谢

- 灵感来源于 [Qwerty Learner](https://github.com/Kaiyiwing/qwerty-learner)
- 词典数据由开源社区提供
