/**
 * Crossmath 数学填字游戏
 * 类似填字游戏，但用数学算式
 * 横向和纵向都有算式，数字在交叉位置共享
 */
(function() {
    'use strict';

    // 游戏状态
    const state = {
        size: 5,
        board: null,          // 玩家棋盘
        solution: null,       // 正确解答
        grid: null,           // 网格类型（-1=黑色，其他=白色）
        equations: null,      // 算式数组
        selectedCell: null,   // 当前选中的单元格
        timer: null,
        seconds: 0,
        isComplete: false,
        hintsUsed: 0
    };

    // DOM 元素
    let elements = null;

    /**
     * 初始化
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
            sizeBtns: document.querySelectorAll('.btn-size'),
            acrossClues: document.getElementById('acrossClues'),
            downClues: document.getElementById('downClues')
        };

        setupEventListeners();
        startNewGame();
    }

    /**
     * 设置事件监听
     */
    function setupEventListeners() {
        elements.newGameBtn.addEventListener('click', startNewGame);
        elements.checkBtn.addEventListener('click', checkAnswers);
        elements.hintBtn.addEventListener('click', showHint);

        elements.sizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.sizeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.size = parseInt(e.target.dataset.size);
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
     * 随机整数
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 生成谜题
     */
    function generatePuzzle() {
        const size = state.size;

        // 初始化网格（0=白色可填，-1=黑色）
        state.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        state.solution = Array(size).fill(null).map(() => Array(size).fill(0));
        state.board = Array(size).fill(null).map(() => Array(size).fill(0));

        // 添加一些黑色格子（除了边缘）
        const blockCount = Math.floor(size * size * 0.15);
        let blocks = 0;

        while (blocks < blockCount) {
            const r = randomInt(1, size - 2);
            const c = randomInt(1, size - 2);
            if (state.grid[r][c] === 0) {
                state.grid[r][c] = -1;
                blocks++;
            }
        }

        // 生成算式
        state.equations = generateEquations();

        // 填充解答
        fillSolution();

        // 计算算式目标
        calculateTargets();
    }

    /**
     * 生成算式
     */
    function generateEquations() {
        const equations = [];
        const size = state.size;
        let equationNumber = 1;

        // 扫描横向算式
        for (let r = 0; r < size; r++) {
            let cells = [];
            for (let c = 0; c < size; c++) {
                if (state.grid[r][c] !== -1) {
                    cells.push({ row: r, col: c });
                } else {
                    if (cells.length >= 2) {
                        const ops = generateOperations(cells.length);
                        equations.push({
                            number: equationNumber,
                            direction: 'across',
                            cells: cells,
                            operations: ops,
                            target: 0
                        });
                        cells[0].equationNumber = equationNumber;
                        equationNumber++;
                    }
                    cells = [];
                }
            }
            if (cells.length >= 2) {
                const ops = generateOperations(cells.length);
                equations.push({
                    number: equationNumber,
                    direction: 'across',
                    cells: cells,
                    operations: ops,
                    target: 0
                });
                cells[0].equationNumber = equationNumber;
                equationNumber++;
            }
        }

        // 扫描纵向算式
        for (let c = 0; c < size; c++) {
            let cells = [];
            for (let r = 0; r < size; r++) {
                if (state.grid[r][c] !== -1) {
                    cells.push({ row: r, col: c });
                } else {
                    if (cells.length >= 2) {
                        const ops = generateOperations(cells.length);
                        equations.push({
                            number: equationNumber,
                            direction: 'down',
                            cells: cells,
                            operations: ops,
                            target: 0
                        });
                        cells[0].equationNumber = equationNumber;
                        equationNumber++;
                    }
                    cells = [];
                }
            }
            if (cells.length >= 2) {
                const ops = generateOperations(cells.length);
                equations.push({
                    number: equationNumber,
                    direction: 'down',
                    cells: cells,
                    operations: ops,
                    target: 0
                });
                cells[0].equationNumber = equationNumber;
                equationNumber++;
            }
        }

        return equations;
    }

    /**
     * 生成运算符
     */
    function generateOperations(length) {
        const ops = ['+', '−', '×'];
        const result = [];

        for (let i = 0; i < length - 1; i++) {
            // 简单起见，主要用加法和减法
            if (length <= 3) {
                result.push(ops[randomInt(0, 2)]);
            } else {
                result.push(ops[randomInt(0, 1)]); // 长算式只用加减
            }
        }

        return result;
    }

    /**
     * 填充解答
     */
    function fillSolution() {
        const size = state.size;

        // 简单填充：每个格子填入随机数
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (state.grid[r][c] !== -1) {
                    state.solution[r][c] = randomInt(1, 9);
                }
            }
        }
    }

    /**
     * 计算算式目标
     */
    function calculateTargets() {
        state.equations.forEach(eq => {
            const values = eq.cells.map(cell => state.solution[cell.row][cell.col]);
            eq.target = calculateResult(values, eq.operations);
        });
    }

    /**
     * 计算结果
     */
    function calculateResult(values, ops) {
        let result = values[0];

        for (let i = 0; i < ops.length; i++) {
            const op = ops[i];
            const val = values[i + 1];

            switch (op) {
                case '+': result += val; break;
                case '−': result -= val; break;
                case '×': result *= val; break;
                case '÷': result = Math.floor(result / val); break;
            }
        }

        return result;
    }

    /**
     * 格式化算式显示
     */
    function formatEquation(eq) {
        const values = eq.cells.map(cell => state.solution[cell.row][cell.col]);
        let str = values[0].toString();

        for (let i = 0; i < eq.operations.length; i++) {
            str += ` ${eq.operations[i]} ${values[i + 1]}`;
        }

        return `${str} = ${eq.target}`;
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

        generatePuzzle();
        renderBoard();
        renderClues();

        state.timer = setInterval(updateTimer, 1000);
    }

    /**
     * 渲染棋盘
     */
    function renderBoard() {
        const board = elements.board;
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;

        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (state.grid[r][c] === -1) {
                    cell.classList.add('blocked');
                } else {
                    // 显示算式编号
                    const eq = state.equations.find(e =>
                        e.cells[0].row === r && e.cells[0].col === c
                    );
                    if (eq) {
                        const numDiv = document.createElement('div');
                        numDiv.classList.add('equation-number');
                        numDiv.textContent = eq.number;
                        cell.appendChild(numDiv);
                    }

                    // 显示数值
                    const valueDiv = document.createElement('div');
                    valueDiv.classList.add('value');
                    valueDiv.id = `value-${r}-${c}`;
                    if (state.board[r][c] !== 0) {
                        valueDiv.textContent = state.board[r][c];
                    }
                    cell.appendChild(valueDiv);

                    cell.addEventListener('click', () => selectCell(r, c));
                }

                board.appendChild(cell);
            }
        }

        updateProgress();
    }

    /**
     * 渲染提示
     */
    function renderClues() {
        elements.acrossClues.innerHTML = '';
        elements.downClues.innerHTML = '';

        state.equations.forEach(eq => {
            const clueDiv = document.createElement('div');
            clueDiv.classList.add('clue-item');
            clueDiv.dataset.number = eq.number;
            clueDiv.dataset.direction = eq.direction;

            const opsStr = eq.operations.join(' ');
            clueDiv.innerHTML = `<span class="clue-number">${eq.number}.</span> ${eq.target} ${opsStr}`;

            clueDiv.addEventListener('click', () => highlightEquation(eq));

            if (eq.direction === 'across') {
                elements.acrossClues.appendChild(clueDiv);
            } else {
                elements.downClues.appendChild(clueDiv);
            }
        });
    }

    /**
     * 高亮算式
     */
    function highlightEquation(eq) {
        // 清除之前的高亮
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });
        document.querySelectorAll('.clue-item').forEach(item => {
            item.classList.remove('active');
        });

        // 高亮算式格子
        const cells = document.querySelectorAll('.cell');
        eq.cells.forEach(cell => {
            const idx = cell.row * state.size + cell.col;
            cells[idx].classList.add('highlighted');
        });

        // 高亮提示
        const clueItems = document.querySelectorAll('.clue-item');
        clueItems.forEach(item => {
            if (parseInt(item.dataset.number) === eq.number) {
                item.classList.add('active');
            }
        });

        // 选中第一个格子
        selectCell(eq.cells[0].row, eq.cells[0].col);
    }

    /**
     * 选中单元格
     */
    function selectCell(row, col) {
        if (state.grid[row][col] === -1) return;

        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        state.selectedCell = { row, col };

        const idx = row * state.size + col;
        document.querySelectorAll('.cell')[idx].classList.add('selected');
    }

    /**
     * 输入数字
     */
    function inputNumber(num) {
        if (!state.selectedCell || state.isComplete) return;

        const { row, col } = state.selectedCell;
        if (state.grid[row][col] === -1) return;

        state.board[row][col] = num;

        const valueDiv = document.getElementById(`value-${row}-${col}`);
        valueDiv.textContent = num;

        const idx = row * state.size + col;
        document.querySelectorAll('.cell')[idx].classList.remove('correct', 'error');

        checkEquationsForCell(row, col);
        updateProgress();
    }

    /**
     * 清除单元格
     */
    function clearCell() {
        if (!state.selectedCell || state.isComplete) return;

        const { row, col } = state.selectedCell;
        if (state.grid[row][col] === -1) return;

        state.board[row][col] = 0;

        const valueDiv = document.getElementById(`value-${row}-${col}`);
        valueDiv.textContent = '';

        const idx = row * state.size + col;
        document.querySelectorAll('.cell')[idx].classList.remove('correct', 'error');

        updateProgress();
    }

    /**
     * 检查包含某格子的算式
     */
    function checkEquationsForCell(row, col) {
        // 找到包含此格子的所有算式
        const relatedEqs = state.equations.filter(eq =>
            eq.cells.some(c => c.row === row && c.col === col)
        );

        relatedEqs.forEach(eq => {
            // 检查算式是否完整填写
            const allFilled = eq.cells.every(c => state.board[c.row][c.col] !== 0);

            if (allFilled) {
                const values = eq.cells.map(c => state.board[c.row][c.col]);
                const result = calculateResult(values, eq.operations);
                const isCorrect = result === eq.target;

                // 更新格子状态
                eq.cells.forEach(c => {
                    const idx = c.row * state.size + c.col;
                    const cell = document.querySelectorAll('.cell')[idx];
                    cell.classList.remove('correct', 'error');
                    cell.classList.add(isCorrect ? 'correct' : 'error');
                });

                // 更新提示状态
                document.querySelectorAll('.clue-item').forEach(item => {
                    if (parseInt(item.dataset.number) === eq.number) {
                        item.classList.toggle('solved', isCorrect);
                    }
                });
            }
        });
    }

    /**
     * 键盘处理
     */
    function handleKeyboard(e) {
        if (state.isComplete) return;

        if (e.key >= '1' && e.key <= '9') {
            inputNumber(parseInt(e.key));
            return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            clearCell();
            return;
        }

        if (state.selectedCell) {
            let { row, col } = state.selectedCell;

            switch (e.key) {
                case 'ArrowUp': row = Math.max(0, row - 1); break;
                case 'ArrowDown': row = Math.min(state.size - 1, row + 1); break;
                case 'ArrowLeft': col = Math.max(0, col - 1); break;
                case 'ArrowRight': col = Math.min(state.size - 1, col + 1); break;
                default: return;
            }

            // 跳过黑色格子
            while (state.grid[row][col] === -1) {
                if (e.key === 'ArrowRight') col = Math.min(state.size - 1, col + 1);
                else if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
                else if (e.key === 'ArrowDown') row = Math.min(state.size - 1, row + 1);
                else if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
                if (row < 0 || row >= state.size || col < 0 || col >= state.size) return;
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
        let total = 0;

        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                if (state.grid[r][c] !== -1) {
                    total++;
                    if (state.board[r][c] !== 0) filled++;
                }
            }
        }

        elements.progress.textContent = `进度: ${filled}/${total}`;
    }

    /**
     * 检查答案
     */
    function checkAnswers() {
        if (state.isComplete) return;

        // 检查是否全部填写
        let allFilled = true;
        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                if (state.grid[r][c] !== -1 && state.board[r][c] === 0) {
                    allFilled = false;
                    break;
                }
            }
        }

        if (!allFilled) {
            elements.status.textContent = '请填写所有格子';
            return;
        }

        // 检查每个算式
        let allCorrect = true;
        state.equations.forEach(eq => {
            const playerValues = eq.cells.map(c => state.board[c.row][c.col]);
            const playerResult = calculateResult(playerValues, eq.operations);

            if (playerResult !== eq.target) {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            state.isComplete = true;
            clearInterval(state.timer);
            elements.status.textContent = '🎉 恭喜完成！';
            elements.board.classList.add('celebrate');
        } else {
            elements.status.textContent = '有些算式不正确，请检查';
        }
    }

    /**
     * 显示提示
     */
    function showHint() {
        if (state.isComplete) return;

        // 找一个空格或错误的格子
        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                if (state.grid[r][c] !== -1) {
                    if (state.board[r][c] === 0 || state.board[r][c] !== state.solution[r][c]) {
                        state.board[r][c] = state.solution[r][c];

                        const valueDiv = document.getElementById(`value-${r}-${c}`);
                        valueDiv.textContent = state.solution[r][c];

                        const idx = r * state.size + c;
                        const cell = document.querySelectorAll('.cell')[idx];
                        cell.classList.remove('error');
                        cell.classList.add('correct');

                        selectCell(r, c);
                        checkEquationsForCell(r, c);
                        updateProgress();

                        state.hintsUsed++;
                        elements.status.textContent = `已显示提示 (${state.hintsUsed}次)`;
                        return;
                    }
                }
            }
        }
    }

    // 启动
    document.addEventListener('DOMContentLoaded', init);
})();