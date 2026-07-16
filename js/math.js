/**
 * 加减法填空练习游戏
 */
(function() {
    'use strict';

    // 游戏状态
    const state = {
        problems: [],        // 题目数组
        answers: [],         // 玩家答案
        difficulty: 'easy',  // 当前难度
        selectedIndex: null, // 当前选中的格子索引
        timer: null,         // 计时器
        seconds: 0,          // 已用秒数
        isComplete: false,   // 是否已完成
        correctCount: 0      // 正确数量
    };

    // 难度配置
    const DIFFICULTY_CONFIG = {
        easy: { min: 0, max: 10, name: '简单' },
        medium: { min: 0, max: 20, name: '中等' },
        hard: { min: 0, max: 50, name: '困难' }
    };

    // DOM 元素缓存
    const elements = {
        board: document.getElementById('board'),
        numberPad: document.getElementById('numberPad'),
        newGameBtn: document.getElementById('newGame'),
        checkBtn: document.getElementById('checkBtn'),
        timer: document.getElementById('timer'),
        score: document.getElementById('score'),
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
        elements.checkBtn.addEventListener('click', checkAnswers);

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
                const num = e.target.dataset.num;
                if (num === 'clear') {
                    clearAnswer();
                } else {
                    inputNumber(parseInt(num));
                }
            }
        });

        // 键盘输入
        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * 生成一道算式题
     * @param {string} difficulty 难度
     * @returns {Object} 题目对象 { a, b, c, operator, hiddenIndex, answer, equation }
     */
    function generateProblem(difficulty) {
        const config = DIFFICULTY_CONFIG[difficulty];
        const max = config.max;

        // 随机选择加法或减法
        const isAddition = Math.random() > 0.5;
        let a, b, c, operator;

        if (isAddition) {
            // 加法: a + b = c
            a = randomInt(0, max);
            b = randomInt(0, max - a);  // 确保结果不超过最大值
            c = a + b;
            operator = '+';

            // 随机隐藏 a 或 b
            const hiddenIndex = Math.random() > 0.5 ? 0 : 1;
            return {
                a,
                b,
                c,
                operator,
                hiddenIndex,
                answer: hiddenIndex === 0 ? a : b,
                display: hiddenIndex === 0
                    ? { num1: '?', num2: b, result: c }
                    : { num1: a, num2: '?', result: c }
            };
        } else {
            // 减法: a - b = c，确保 a >= b
            a = randomInt(0, max);
            b = randomInt(0, a);  // 确保 b <= a
            c = a - b;
            operator = '-';

            // 随机隐藏 a, b 或 c
            const hiddenIndex = randomInt(0, 2);
            const answers = [a, b, c];

            return {
                a,
                b,
                c,
                operator,
                hiddenIndex,
                answer: answers[hiddenIndex],
                display: hiddenIndex === 0
                    ? { num1: '?', num2: b, result: c }
                    : hiddenIndex === 1
                        ? { num1: a, num2: '?', result: c }
                        : { num1: a, num2: b, result: '?' }
            };
        }
    }

    /**
     * 生成随机整数
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number}
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 批量生成题目
     * @param {number} count 数量
     * @returns {Array}
     */
    function generateProblems(count) {
        const problems = [];
        for (let i = 0; i < count; i++) {
            problems.push(generateProblem(state.difficulty));
        }
        return problems;
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
        state.selectedIndex = null;
        state.correctCount = 0;
        state.answers = [];
        elements.status.textContent = '';
        elements.timer.textContent = '时间: 00:00';
        elements.score.textContent = '正确: 0/25';

        // 生成新题目
        state.problems = generateProblems(25);

        // 初始化答案数组
        state.answers = state.problems.map(() => null);

        // 渲染棋盘
        renderBoard();

        // 启动计时器
        state.timer = setInterval(updateTimer, 1000);
    }

    /**
     * 渲染题目网格
     */
    function renderBoard() {
        elements.board.innerHTML = '';

        state.problems.forEach((problem, index) => {
            const cell = document.createElement('div');
            cell.classList.add('math-cell');
            cell.dataset.index = index;

            // 算式显示
            const equation = document.createElement('div');
            equation.classList.add('equation');

            // 数字1
            const num1 = document.createElement('span');
            num1.textContent = problem.display.num1;
            if (problem.display.num1 === '?') num1.classList.add('operator');

            // 运算符
            const op = document.createElement('span');
            op.classList.add('operator');
            op.textContent = problem.operator;

            // 数字2
            const num2 = document.createElement('span');
            num2.textContent = problem.display.num2;
            if (problem.display.num2 === '?') num2.classList.add('operator');

            // 等号
            const eq = document.createElement('span');
            eq.classList.add('equals');
            eq.textContent = '=';

            // 结果
            const result = document.createElement('span');
            result.textContent = problem.display.result;
            if (problem.display.result === '?') result.classList.add('operator');

            equation.appendChild(num1);
            equation.appendChild(op);
            equation.appendChild(num2);
            equation.appendChild(eq);
            equation.appendChild(result);

            // 答案框
            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box');
            answerBox.id = `answer-${index}`;
            answerBox.textContent = state.answers[index] !== null ? state.answers[index] : '';

            if (state.answers[index] !== null) {
                answerBox.classList.add('has-value');
            }

            cell.appendChild(equation);
            cell.appendChild(answerBox);

            cell.addEventListener('click', () => selectCell(index));
            elements.board.appendChild(cell);
        });
    }

    /**
     * 选中格子
     * @param {number} index 格子索引
     */
    function selectCell(index) {
        // 清除之前的选中状态
        document.querySelectorAll('.math-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        state.selectedIndex = index;

        // 高亮当前单元格
        const cells = document.querySelectorAll('.math-cell');
        cells[index].classList.add('selected');
    }

    /**
     * 输入数字
     * @param {number} num 数字
     */
    function inputNumber(num) {
        if (state.selectedIndex === null || state.isComplete) return;

        const index = state.selectedIndex;

        // 更新答案
        state.answers[index] = num;

        // 更新UI
        const answerBox = document.getElementById(`answer-${index}`);
        answerBox.textContent = num;
        answerBox.classList.add('has-value');

        // 清除之前的状态
        const cells = document.querySelectorAll('.math-cell');
        cells[index].classList.remove('correct', 'wrong');

        // 自动选中下一个
        const nextEmpty = state.answers.findIndex((a, i) => a === null && i > index);
        if (nextEmpty !== -1) {
            selectCell(nextEmpty);
        } else if (state.answers.every(a => a !== null)) {
            // 所有答案都已填写，自动检查
            checkAnswers();
        }
    }

    /**
     * 清除答案
     */
    function clearAnswer() {
        if (state.selectedIndex === null || state.isComplete) return;

        const index = state.selectedIndex;

        // 清除答案
        state.answers[index] = null;

        // 更新UI
        const answerBox = document.getElementById(`answer-${index}`);
        answerBox.textContent = '';
        answerBox.classList.remove('has-value');

        // 清除状态
        const cells = document.querySelectorAll('.math-cell');
        cells[index].classList.remove('correct', 'wrong');
    }

    /**
     * 处理键盘输入
     * @param {KeyboardEvent} e 键盘事件
     */
    function handleKeyboard(e) {
        if (state.isComplete) return;

        // 数字键 0-9
        if (e.key >= '0' && e.key <= '9') {
            inputNumber(parseInt(e.key));
            return;
        }

        // 删除/退格键清除
        if (e.key === 'Backspace' || e.key === 'Delete') {
            clearAnswer();
            return;
        }

        // 方向键移动选择
        if (state.selectedIndex !== null) {
            let newIndex = state.selectedIndex;

            switch (e.key) {
                case 'ArrowUp':
                    newIndex = Math.max(0, state.selectedIndex - 5);
                    break;
                case 'ArrowDown':
                    newIndex = Math.min(24, state.selectedIndex + 5);
                    break;
                case 'ArrowLeft':
                    newIndex = Math.max(0, state.selectedIndex - 1);
                    break;
                case 'ArrowRight':
                    newIndex = Math.min(24, state.selectedIndex + 1);
                    break;
                default:
                    return;
            }

            if (newIndex !== state.selectedIndex) {
                selectCell(newIndex);
            }
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
    function checkAnswers() {
        if (state.isComplete) return;

        // 检查是否全部填写
        if (state.answers.some(a => a === null)) {
            elements.status.textContent = '请填写所有答案';
            return;
        }

        // 清除之前的状态
        const cells = document.querySelectorAll('.math-cell');
        cells.forEach(cell => cell.classList.remove('correct', 'wrong'));

        // 检查每个答案
        state.correctCount = 0;
        state.problems.forEach((problem, index) => {
            const isCorrect = state.answers[index] === problem.answer;

            if (isCorrect) {
                cells[index].classList.add('correct');
                state.correctCount++;
            } else {
                cells[index].classList.add('wrong');
            }
        });

        // 更新分数
        elements.score.textContent = `正确: ${state.correctCount}/25`;

        // 判断是否全部正确
        if (state.correctCount === 25) {
            state.isComplete = true;
            clearInterval(state.timer);
            elements.status.textContent = '🎉 太棒了！全部正确！';
            elements.board.classList.add('celebrate');
        } else {
            elements.status.textContent = `还有 ${25 - state.correctCount} 题需要修正`;
        }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', init);
})();