# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个小游戏合集项目，包含四个基于 Web 的数学游戏，使用纯 HTML/CSS/JavaScript 实现，无需构建工具。

## 游戏列表

### 1. 数独游戏 (index.html)
经典 9x9 数独，支持三种难度、计时、提示功能。

### 2. 加减法填空练习 (math.html)
5x5 网格的加减法算式填空练习，适合儿童数学训练。

### 3. KenKen 肯肯数独 (kenken.html)
12x12 格子的数字填充游戏，格子分成若干区域，每个区域有运算目标和运算符（+、-、×、÷），数字在行/列中不能重复。

### 4. Crossmath 数学填字 (crossmath.html)
类似填字游戏的数学谜题，横向和纵向都有算式，数字在交叉位置共享，可选择 5x5/7x7/9x9 三种大小。

## 运行方式

打开主页选择游戏：
```
open index.html
```

或直接打开某个游戏：
- 数独游戏：`open sudoku.html`
- 加减法练习：`open math.html`
- KenKen：`open kenken.html`
- Crossmath：`open crossmath.html`

## 项目结构

```
shudu/
├── index.html          # 游戏汇总主页 ⭐
├── sudoku.html         # 数独游戏
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
└── CLAUDE.md           # 本文件
```

## 核心模块

### 数独游戏
- `sudoku.js` - 数独生成和验证算法
- `game.js` - 用户交互和 UI 更新

### 加减法游戏
- `math.js` - 算式生成、答案验证

### KenKen 游戏
- `kenken.js` - 拉丁方阵生成、区域划分、运算验证

### Crossmath 游戏
- `crossmath.js` - 交叉算式生成、横向/纵向验证

## 开发说明

- 数独样式：`css/style.css`
- 数独算法：`js/sudoku.js`
- 数独交互：`js/game.js`
- 加减法样式：`css/math.css`
- 加减法逻辑：`js/math.js`
- KenKen 样式：`css/kenken.css`
- KenKen 逻辑：`js/kenken.js`

## 功能特性

**数独游戏：**
- 三种难度、计时、错误检查、提示功能
- 键盘支持（数字键 1-9、方向键、退格键）

**加减法练习：**
- 三种难度（数字范围不同）
- 5x5 网格 25 道题、自动跳转、实时计分
- 键盘支持

**KenKen 游戏：**
- 12x12 格子，数字 1-12
- 区域划分（粗线框），运算目标
- 冲突检测、三种难度
- 提示、计时、键盘支持

**Crossmath 游戏：**
- 三种网格大小（5x5/7x7/9x9）
- 横向和纵向算式交叉
- 黑色格子分隔、算式提示显示
- 实时验证、提示、计时
- 键盘支持