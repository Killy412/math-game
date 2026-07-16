# 🎮 数学小游戏合集

一个基于纯 HTML/CSS/JavaScript 的数学小游戏合集，无需安装，直接在浏览器中运行。

## 🎯 游戏列表

| 游戏 | 格子大小 | 简介 |
|------|----------|------|
| 🧩 数独 (Sudoku) | 9×9 | 经典数独，每行每列数字 1-9 不重复 |
| ➕ 加减法练习 | 5×5 | 算式填空，适合儿童数学训练 |
| 🔢 KenKen 肯肯数独 | 12×12 | 区域运算游戏，加减乘除全都有 |
| ✏️ Crossmath 数学填字 | 5×5~9×9 | 横向纵向算式交叉，填字游戏风格 |

## 🚀 快速开始

直接打开 `home.html` 选择游戏：

```bash
open home.html
```

或直接打开某个游戏：
- `index.html` - 数独
- `math.html` - 加减法练习
- `kenken.html` - KenKen
- `crossmath.html` - Crossmath

## ✨ 功能特性

- ✅ 三种难度选择
- ✅ 计时功能
- ✅ 提示功能
- ✅ 错误检查
- ✅ 键盘支持（数字键、方向键、退格键）
- ✅ 响应式设计，支持手机浏览

## 🎮 游戏说明

### 数独 Sudoku

在 9×9 的格子中填入数字 1-9，使得每行、每列、每个 3×3 宫格内的数字都不重复。

### 加减法练习

5×5 格子，每格一道加减法算式（如 `3 + ? = 8`），填入正确答案即可。

### KenKen 肯肯数独

12×12 格子，被分成若干区域（粗线框），每个区域有运算目标（如 `24×` 表示区域内数字之积为 24）。数字 1-12 在每行每列不重复。

**运算规则：**
- `+` 加法：区域内所有数字之和
- `−` 减法：最大数减最小数
- `×` 乘法：区域内所有数字之积
- `÷` 除法：较大数除较小数

### Crossmath 数学填字

类似填字游戏，横向和纵向都有算式，数字在交叉位置被共享。点击提示可高亮对应算式格子。

## 🛠️ 技术栈

- 纯 HTML5 + CSS3 + JavaScript
- 无框架、无构建工具
- 可直接部署到静态网站托管

## 📁 项目结构

```
math-game/
├── home.html           # 游戏汇总主页
├── index.html          # 数独游戏
├── math.html           # 加减法练习
├── kenken.html         # KenKen 游戏
├── crossmath.html      # Crossmath 游戏
├── css/
│   ├── style.css       # 数独样式
│   ├── math.css        # 加减法样式
│   ├── kenken.css      # KenKen 样式
│   └── crossmath.css   # Crossmath 样式
├── js/
│   ├── sudoku.js       # 数独算法
│   ├── game.js         # 数独交互
│   ├── math.js         # 加减法逻辑
│   ├── kenken.js       # KenKen 逻辑
│   └── crossmath.js    # Crossmath 逻辑
├── CLAUDE.md           # 项目说明
└── README.md           # 本文件
```

## 🌐 在线访问

将项目部署到 GitHub Pages、Netlify 或 Vercel 等静态托管平台即可在线访问。

## 📝 开发

本项目使用 Claude Code 开发。

## 📄 许可证

MIT License