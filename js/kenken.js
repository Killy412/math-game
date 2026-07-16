/**
 * KenKen 肯肯数独游戏
 * 12x12 格子，数字 1-12，每行每列不重复
 * 格子分成若干区域，每个区域有运算目标和运算符
 */
(function() {
    'use strict';

    const SIZE = 12;

    // 游戏状态
    const state = {
        solution: null,       // 正确解答
        board: null,          // 玩家棋盘
        cages: null,          // 区域数组
        difficulty: 'easy',   // 当前难度
        selectedCell: null,   // 当前选中的单元格
        timer: null,          // 计时器
        seconds: 0,           // 已用秒数
        isComplete: false,    // 是否已完成
        hintsUsed: 0          // 已使用提示次数
    };

    // 难度配置
    const DIFFICULTY_CONFIG = {
        easy: { maxCageSize: 4, operations: ['+', '×'] },
        medium: { maxCageSize: 5, operations: ['+', '−', '×', '÷'] },
        hard: { maxCageSize: 6, operations: ['+', '−', '×', '÷'] }
    };

    // DOM 元素缓存
    let elements = null;

    /**
     * 初始化游戏
     */
    function init() {
        elements = {
            board: document.getElementById('board'),
            numberPad: document.getElementById('numberPad'),
            newGameBtn: document.getElementById('newGame'),
            checkBtn: document.getElementById('checkBtn'),
            hintBtn: document.getElementById('hintBtn'),
            timer: document.getElementById('timer'),
            progress: document.getElementById('progress'),
            status: document.getElementById('status'),
            difficultyBtns: document.querySelectorAll('.btn-difficulty')
        };

        setupEventListeners();
        startNewGame();
    }

    /**
     * 设置事件监听器
     */
    function setupEventListeners() {
        elements.newGameBtn.addEventListener('click', startNewGame);
        elements.checkBtn.addEventListener('click', checkAnswers);
        elements.hintBtn.addEventListener('click', showHint);

        elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.difficultyBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.difficulty = e.target.dataset.difficulty;
                startNewGame();
            });
        });

        elements.numberPad.addEventListener('click', (e) => {
            if (e.target.classList.contains('num-btn')) {
                const num = parseInt(e.target.dataset.num);
                if (num === 0) {
                    clearCell();
                } else {
                    inputNumber(num);
                }
            }
        });

        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * 打乱数组
     */
    function shuffleArray(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * 生成一个完整的拉丁方阵（解答）
     */
    function generateSolution() {
        const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

        // 使用回溯法填充
        function fill(row) {
            if (row === SIZE) return true;

            const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

            for (const num of nums) {
                if (isValidInRow(board, row, num) && isValidInCol(board, row, num)) {
                    board[row] = fillRow(board[row], num);
                    if (fill(row + 1)) return true;
                    board[row] = Array(SIZE).fill(0);
                }
            }
            return false;
        }

        // 填充一行，返回新行
        function fillRow(row, num) {
            const cols = [];
            for (let c = 0; c < SIZE; c++) {
                if (row[c] === 0 && isValidInCol(board, board.indexOf(row), num, c)) {
                    cols.push(c);
                }
            }
            const col = cols[Math.floor(Math.random() * cols.length)];
            const newRow = [...row];
            newRow[col] = num;
            return newRow;
        }

        // 简化版：使用循环移位生成拉丁方阵
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                board[row][col] = ((row + col) % SIZE) + 1;
            }
        }

        // 随机打乱行和列
        const rowOrder = shuffleArray([...Array(SIZE).keys()]);
        const colOrder = shuffleArray([...Array(SIZE).keys()]);

        const shuffledBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                shuffledBoard[r][c] = board[rowOrder[r]][colOrder[c]];
            }
        }

        return shuffledBoard;
    }

    /**
     * 检查数字是否在行中有效
     */
    function isValidInRow(board, row, num) {
        return !board[row].includes(num);
    }

    /**
     * 检查数字是否在列中有效
     */
    function isValidInCol(board, row, num, col) {
        for (let r = 0; r < SIZE; r++) {
            if (board[r][col] === num) return false;
        }
        return true;
    }

    /**
     * 生成区域划分（Cages）
     */
    function generateCages(board) {
        const config = DIFFICULTY_CONFIG[state.difficulty];
        const cages = [];
        const assigned = Array(SIZE).fill(null).map(() => Array(SIZE).fill(false));

        // 遍历所有格子，创建区域
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (assigned[r][c]) continue;

                // 创建新区域
                const cage = createCage(board, assigned, r, c, config.maxCageSize);
                cages.push(cage);
            }
        }

        // 为每个区域分配运算符和计算目标
        cages.forEach(cage => {
            assignOperation(cage, board, config.operations);
        });

        return cages;
    }

    /**
     * 创建单个区域
     */
    function createCage(board, assigned, startRow, startCol, maxSize) {
        const cage = {
            cells: [],
            target: 0,
            operation: '+'
        };

        const queue = [{ row: startRow, col: startCol }];
        const targetSize = Math.floor(Math.random() * (maxSize - 1)) + 2; // 2 到 maxSize

        while (queue.length > 0 && cage.cells.length < targetSize) {
            const { row, col } = queue.shift();

            if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) continue;
            if (assigned[row][col]) continue;

            assigned[row][col] = true;
            cage.cells.push({ row, col });

            // 随机添加相邻格子
            const neighbors = shuffleArray([
                { row: row - 1, col },
                { row: row + 1, col },
                { row, col: col - 1 },
                { row, col: col + 1 }
            ]);

            for (const n of neighbors) {
                if (n.row >= 0 && n.row < SIZE && n.col >= 0 && n.col < SIZE && !assigned[n.row][n.col]) {
                    if (Math.random() > 0.3) {
                        queue.push(n);
                    }
                }
            }
        }

        return cage;
    }

    /**
     * 为区域分配运算符和计算目标
     */
    function assignOperation(cage, board, operations) {
        const values = cage.cells.map(cell => board[cell.row][cell.col]);

        // 根据区域大小选择合适的运算符
        let validOps = [...operations];

        // 减法和除法只能用于 2 格区域
        if (cage.cells.length > 2) {
            validOps = validOps.filter(op => op === '+' || op === '×');
        }

        // 加法始终可行
        if (!validOps.includes('+')) validOps.push('+');

        // 选择运算符
        const op = validOps[Math.floor(Math.random() * validOps.length)];
        cage.operation = op;

        // 计算目标值
        switch (op) {
            case '+':
                cage.target = values.reduce((a, b) => a + b, 0);
                break;
            case '−':
                cage.target = Math.abs(values[0] - values[1]);
                break;
            case '×':
                cage.target = values.reduce((a, b) => a * b, 1);
                break;
            case '÷':
                cage.target = Math.max(values[0], values[1]) / Math.min(values[0], values[1]);
                cage.target = Math.round(cage.target);
                // 如果不能整除，改用加法
                if (values[0] % values[1] !== 0 && values[1] % values[0] !== 0) {
                    cage.operation = '+';
                    cage.target = values.reduce((a, b) => a + b, 0);
                }
                break;
        }
    }

    /**
     * 获取区域边界信息
     */
    function getCageBorders(cages) {
        const borders = Array(SIZE).fill(null).map(() =>
            Array(SIZE).fill(null).map(() => ({
                top: false, right: false, bottom: false, left: false
            }))
        );

        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                const { row, col } = cell;

                // 检查是否与同区域格子相邻
                const hasTop = cage.cells.some(c => c.row === row - 1 && c.col === col);
                const hasRight = cage.cells.some(c => c.row === row && c.col === col + 1);
                const hasBottom = cage.cells.some(c => c.row === row + 1 && c.col === col);
                const hasLeft = cage.cells.some(c => c.row === row && c.col === col - 1);

                borders[row][col].top = !hasTop;
                borders[row][col].right = !hasRight;
                borders[row][col].bottom = !hasBottom;
                borders[row][col].left = !hasLeft;
            });
        });

        return borders;
    }

    /**
     * 开始新游戏
     */
    function startNewGame() {
        if (state.timer) clearInterval(state.timer);

        state.seconds = 0;
        state.isComplete = false;
        state.selectedCell = null;
        state.hintsUsed = 0;
        elements.status.textContent = '';
        elements.timer.textContent = '时间: 00:00';

        // 生成解答
        state.solution = generateSolution();

        // 生成区域
        state.cages = generateCages(state.solution);

        // 初始化玩家棋盘（空）
        state.board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

        // 渲染棋盘
        renderBoard();

        // 启动计时器
        state.timer = setInterval(updateTimer, 1000);
    }

    /**
     * 渲染棋盘
     */
    function renderBoard() {
        elements.board.innerHTML = '';
        const borders = getCageBorders(state.cages);

        // 找出每个区域左上角的格子
        const cageTargets = new Map();
        state.cages.forEach((cage, cageIndex) => {
            // 找最左上角的格子
            let topLeft = cage.cells[0];
            for (const cell of cage.cells) {
                if (cell.row < topLeft.row || (cell.row === topLeft.row && cell.col < topLeft.col)) {
                    topLeft = cell;
                }
            }
            cageTargets.set(`${topLeft.row}-${topLeft.col}`, {
                target: cage.target,
                operation: cage.operation
            });
        });

        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                // 设置边框
                const b = borders[row][col];
                cell.dataset.borderTop = b.top;
                cell.dataset.borderRight = b.right;
                cell.dataset.borderBottom = b.bottom;
                cell.dataset.borderLeft = b.left;

                // 显示区域目标（仅左上角格子）
                const targetInfo = cageTargets.get(`${row}-${col}`);
                if (targetInfo) {
                    const targetDiv = document.createElement('div');
                    targetDiv.classList.add('cage-target');
                    targetDiv.textContent = `${targetInfo.target}${targetInfo.operation}`;
                    cell.appendChild(targetDiv);
                }

                // 显示数值
                const valueDiv = document.createElement('div');
                valueDiv.classList.add('value');
                valueDiv.id = `value-${row}-${col}`;
                if (state.board[row][col] !== 0) {
                    valueDiv.textContent = state.board[row][col];
                }
                cell.appendChild(valueDiv);

                cell.addEventListener('click', () => selectCell(row, col));
                elements.board.appendChild(cell);
            }
        }

        updateProgress();
    }

    /**
     * 选中单元格
     */
    function selectCell(row, col) {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });

        state.selectedCell = { row, col };

        // 高亮当前行和列
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            if (r === row && c === col) {
                cell.classList.add('selected');
            } else if (r === row || c === col) {
                cell.classList.add('highlighted');
            }
        });
    }

    /**
     * 输入数字
     */
    function inputNumber(num) {
        if (!state.selectedCell || state.isComplete) return;

        const { row, col } = state.selectedCell;
        state.board[row][col] = num;

        // 更新UI
        const valueDiv = document.getElementById(`value-${row}-${col}`);
        valueDiv.textContent = num;

        // 清除之前的状态
        const cellIndex = row * SIZE + col;
        document.querySelectorAll('.cell')[cellIndex].classList.remove('conflict', 'correct');

        // 检查冲突
        checkConflicts();
        updateProgress();
    }

    /**
     * 清除单元格
     */
    function clearCell() {
        if (!state.selectedCell || state.isComplete) return;

        const { row, col } = state.selectedCell;
        state.board[row][col] = 0;

        const valueDiv = document.getElementById(`value-${row}-${col}`);
        valueDiv.textContent = '';

        const cellIndex = row * SIZE + col;
        document.querySelectorAll('.cell')[cellIndex].classList.remove('conflict', 'correct');

        updateProgress();
    }

    /**
     * 处理键盘输入
     */
    function handleKeyboard(e) {
        if (state.isComplete) return;

        // 数字键
        if (e.key >= '1' && e.key <= '9') {
            inputNumber(parseInt(e.key));
            return;
        }

        // 功能键数字（10, 11, 12）
        if (e.key === '0') {
            clearCell();
            return;
        }

        // 删除键
        if (e.key === 'Backspace' || e.key === 'Delete') {
            clearCell();
            return;
        }

        // 方向键
        if (state.selectedCell) {
            let { row, col } = state.selectedCell;

            switch (e.key) {
                case 'ArrowUp': row = Math.max(0, row - 1); break;
                case 'ArrowDown': row = Math.min(SIZE - 1, row + 1); break;
                case 'ArrowLeft': col = Math.max(0, col - 1); break;
                case 'ArrowRight': col = Math.min(SIZE - 1, col + 1); break;
                default: return;
            }

            selectCell(row, col);
        }
    }

    /**
     * 更新计时器
     */
    function updateTimer() {
        state.seconds++;
        const minutes = Math.floor(state.seconds / 60);
        const seconds = state.seconds % 60;
        elements.timer.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 更新进度
     */
    function updateProgress() {
        let filled = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (state.board[r][c] !== 0) filled++;
            }
        }
        elements.progress.textContent = `进度: ${filled}/${SIZE * SIZE}`;
    }

    /**
     * 检查冲突
     */
    function checkConflicts() {
        // 清除所有冲突标记
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('conflict'));

        // 检查行冲突
        for (let r = 0; r < SIZE; r++) {
            const counts = {};
            for (let c = 0; c < SIZE; c++) {
                const val = state.board[r][c];
                if (val !== 0) {
                    counts[val] = counts[val] || [];
                    counts[val].push(c);
                }
            }
            for (const [val, cols] of Object.entries(counts)) {
                if (cols.length > 1) {
                    cols.forEach(c => {
                        const idx = r * SIZE + c;
                        document.querySelectorAll('.cell')[idx].classList.add('conflict');
                    });
                }
            }
        }

        // 检查列冲突
        for (let c = 0; c < SIZE; c++) {
            const counts = {};
            for (let r = 0; r < SIZE; r++) {
                const val = state.board[r][c];
                if (val !== 0) {
                    counts[val] = counts[val] || [];
                    counts[val].push(r);
                }
            }
            for (const [val, rows] of Object.entries(counts)) {
                if (rows.length > 1) {
                    rows.forEach(r => {
                        const idx = r * SIZE + c;
                        document.querySelectorAll('.cell')[idx].classList.add('conflict');
                    });
                }
            }
        }
    }

    /**
     * 检查答案
     */
    function checkAnswers() {
        if (state.isComplete) return;

        // 检查是否全部填写
        let allFilled = true;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (state.board[r][c] === 0) {
                    allFilled = false;
                    break;
                }
            }
        }

        if (!allFilled) {
            elements.status.textContent = '请填写所有格子';
            return;
        }

        // 检查是否正确
        let correct = true;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (state.board[r][c] !== state.solution[r][c]) {
                    correct = false;
                    break;
                }
            }
        }

        if (correct) {
            state.isComplete = true;
            clearInterval(state.timer);
            elements.status.textContent = '🎉 恭喜完成！';
            elements.board.classList.add('celebrate');
        } else {
            elements.status.textContent = '答案有误，请检查';
        }
    }

    /**
     * 显示提示
     */
    function showHint() {
        if (state.isComplete) return;

        // 找一个空格子或错误的格子
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (state.board[r][c] === 0 || state.board[r][c] !== state.solution[r][c]) {
                    state.board[r][c] = state.solution[r][c];

                    const valueDiv = document.getElementById(`value-${r}-${c}`);
                    valueDiv.textContent = state.solution[r][c];

                    const idx = r * SIZE + c;
                    const cell = document.querySelectorAll('.cell')[idx];
                    cell.classList.remove('conflict');
                    cell.classList.add('correct');

                    selectCell(r, c);
                    updateProgress();
                    state.hintsUsed++;

                    elements.status.textContent = `已显示提示 (${state.hintsUsed}次)`;
                    return;
                }
            }
        }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', init);
})();