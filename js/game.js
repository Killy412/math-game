/**
 * 数独游戏交互模块
 * 处理用户交互、UI更新、计时器等
 */
(function() {
    'use strict';

    // 游戏状态
    const state = {
        board: null,          // 当前玩家棋盘
        solution: null,       // 正确解答
        difficulty: 'easy',   // 当前难度
        selectedCell: null,   // 当前选中的单元格
        fixedCells: null,     // 固定单元格（题目给定）
        timer: null,          // 计时器
        seconds: 0,           // 已用秒数
        isComplete: false     // 是否已完成
    };

    // DOM 元素缓存
    const elements = {
        board: document.getElementById('board'),
        numberPad: document.getElementById('numberPad'),
        newGameBtn: document.getElementById('newGame'),
        checkBtn: document.getElementById('checkBtn'),
        hintBtn: document.getElementById('hintBtn'),
        timer: document.getElementById('timer'),
        status: document.getElementById('status'),
        difficultyBtns: document.querySelectorAll('.btn-difficulty')
    };

    /**
     * 初始化游戏
     */
    function init() {
        setupEventListeners();
        startNewGame();
    }

    /**
     * 设置事件监听器
     */
    function setupEventListeners() {
        // 新游戏按钮
        elements.newGameBtn.addEventListener('click', startNewGame);

        // 检查答案按钮
        elements.checkBtn.addEventListener('click', checkAnswer);

        // 提示按钮
        elements.hintBtn.addEventListener('click', showHint);

        // 难度选择
        elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.difficultyBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.difficulty = e.target.dataset.difficulty;
                startNewGame();
            });
        });

        // 数字选择面板
        elements.numberPad.addEventListener('click', (e) => {
            if (e.target.classList.contains('num-btn')) {
                const num = parseInt(e.target.dataset.num);
                inputNumber(num);
            }
        });

        // 键盘输入
        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * 开始新游戏
     */
    function startNewGame() {
        // 停止计时器
        if (state.timer) {
            clearInterval(state.timer);
        }

        // 重置状态
        state.seconds = 0;
        state.isComplete = false;
        state.selectedCell = null;
        elements.status.textContent = '';
        elements.timer.textContent = '时间: 00:00';

        // 生成新数独
        const game = Sudoku.generate(state.difficulty);
        state.board = Sudoku.copyBoard(game.puzzle);
        state.solution = game.solution;

        // 记录固定单元格
        state.fixedCells = game.puzzle.map((row, rowIndex) =>
            row.map((cell, colIndex) => cell !== 0)
        );

        // 渲染棋盘
        renderBoard();

        // 启动计时器
        state.timer = setInterval(updateTimer, 1000);
    }

    /**
     * 渲染数独棋盘
     */
    function renderBoard() {
        elements.board.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                const value = state.board[row][col];

                if (value !== 0) {
                    cell.textContent = value;
                    if (state.fixedCells[row][col]) {
                        cell.classList.add('fixed');
                    } else {
                        cell.classList.add('editable');
                    }
                } else {
                    cell.classList.add('editable');
                }

                cell.addEventListener('click', () => selectCell(row, col));
                elements.board.appendChild(cell);
            }
        }
    }

    /**
     * 选中单元格
     * @param {number} row 行索引
     * @param {number} col 列索引
     */
    function selectCell(row, col) {
        // 清除之前的选中状态
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });

        state.selectedCell = { row, col };

        // 高亮当前单元格和相关单元格
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            if (r === row && c === col) {
                cell.classList.add('selected');
            } else if (r === row || c === col) {
                cell.classList.add('highlighted');
            } else if (Math.floor(r / 3) === Math.floor(row / 3) &&
                       Math.floor(c / 3) === Math.floor(col / 3)) {
                cell.classList.add('highlighted');
            }
        });
    }

    /**
     * 输入数字
     * @param {number} num 数字 (0表示清除)
     */
    function inputNumber(num) {
        if (!state.selectedCell || state.isComplete) return;

        const { row, col } = state.selectedCell;

        // 不能修改固定单元格
        if (state.fixedCells[row][col]) return;

        // 更新棋盘数据
        state.board[row][col] = num;

        // 更新UI
        const cellIndex = row * 9 + col;
        const cell = document.querySelectorAll('.cell')[cellIndex];

        if (num === 0) {
            cell.textContent = '';
        } else {
            cell.textContent = num;
        }

        // 清除错误状态
        cell.classList.remove('error');

        // 检查是否完成
        checkCompletion();
    }

    /**
     * 处理键盘输入
     * @param {KeyboardEvent} e 键盘事件
     */
    function handleKeyboard(e) {
        if (state.isComplete) return;

        // 数字键 1-9
        if (e.key >= '1' && e.key <= '9') {
            inputNumber(parseInt(e.key));
            return;
        }

        // 删除/退格键清除
        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            inputNumber(0);
            return;
        }

        // 方向键移动选择
        if (state.selectedCell) {
            let { row, col } = state.selectedCell;

            switch (e.key) {
                case 'ArrowUp':
                    row = Math.max(0, row - 1);
                    break;
                case 'ArrowDown':
                    row = Math.min(8, row + 1);
                    break;
                case 'ArrowLeft':
                    col = Math.max(0, col - 1);
                    break;
                case 'ArrowRight':
                    col = Math.min(8, col + 1);
                    break;
                default:
                    return;
            }

            selectCell(row, col);
        }
    }

    /**
     * 更新计时器显示
     */
    function updateTimer() {
        state.seconds++;
        const minutes = Math.floor(state.seconds / 60);
        const seconds = state.seconds % 60;
        elements.timer.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 检查答案
     */
    function checkAnswer() {
        if (state.isComplete) return;

        const result = Sudoku.checkSolution(state.board, state.solution);

        // 清除之前的错误标记
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('error');
        });

        if (result.correct) {
            state.isComplete = true;
            clearInterval(state.timer);
            elements.status.textContent = '🎉 恭喜你完成了！';
            elements.board.classList.add('celebrate');
        } else if (result.errors.length > 0) {
            elements.status.textContent = `发现 ${result.errors.length} 个错误`;

            // 标记错误单元格
            const cells = document.querySelectorAll('.cell');
            result.errors.forEach(({ row, col }) => {
                cells[row * 9 + col].classList.add('error');
            });
        } else if (!result.complete) {
            elements.status.textContent = '还有空格未填写';
        }
    }

    /**
     * 显示提示
     */
    function showHint() {
        if (state.isComplete) return;

        const hint = Sudoku.getHint(state.board, state.solution);

        if (hint) {
            const { row, col, value } = hint;

            // 更新棋盘
            state.board[row][col] = value;

            // 更新UI
            const cellIndex = row * 9 + col;
            const cell = document.querySelectorAll('.cell')[cellIndex];
            cell.textContent = value;
            cell.classList.remove('error');
            cell.classList.add('editable');

            // 选中有提示的单元格
            selectCell(row, col);

            elements.status.textContent = '已显示一个提示';

            // 检查完成
            checkCompletion();
        } else {
            elements.status.textContent = '没有更多提示了';
        }
    }

    /**
     * 检查是否完成
     */
    function checkCompletion() {
        const result = Sudoku.checkSolution(state.board, state.solution);

        if (result.correct) {
            state.isComplete = true;
            clearInterval(state.timer);
            elements.status.textContent = '🎉 恭喜你完成了！';
            elements.board.classList.add('celebrate');
        }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', init);
})();