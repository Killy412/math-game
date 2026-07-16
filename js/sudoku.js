/**
 * 数独核心逻辑模块
 * 包含数独生成、验证等核心算法
 */
const Sudoku = (function() {
    'use strict';

    /**
     * 创建空的9x9数独棋盘
     * @returns {number[][]} 9x9的二维数组
     */
    function createEmptyBoard() {
        return Array(9).fill(null).map(() => Array(9).fill(0));
    }

    /**
     * 复制棋盘
     * @param {number[][]} board 原始棋盘
     * @returns {number[][]} 复制的棋盘
     */
    function copyBoard(board) {
        return board.map(row => [...row]);
    }

    /**
     * 打乱数组顺序（Fisher-Yates算法）
     * @param {any[]} arr 原始数组
     * @returns {any[]} 打乱后的数组
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
     * 检查在指定位置放入数字是否有效
     * @param {number[][]} board 数独棋盘
     * @param {number} row 行索引 (0-8)
     * @param {number} col 列索引 (0-8)
     * @param {number} num 要放入的数字 (1-9)
     * @returns {boolean} 是否有效
     */
    function isValidMove(board, row, col, num) {
        // 检查行是否有重复
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
        }

        // 检查列是否有重复
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }

        // 检查3x3宫格是否有重复
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    /**
     * 使用回溯法填充数独棋盘
     * @param {number[][]} board 数独棋盘
     * @returns {boolean} 是否成功填充
     */
    function fillBoard(board) {
        // 找到第一个空格
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    // 随机尝试1-9的数字
                    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of numbers) {
                        if (isValidMove(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true; // 棋盘已填满
    }

    /**
     * 生成完整的数独解答
     * @returns {number[][]} 9x9的完整数独棋盘
     */
    function generateSolution() {
        const board = createEmptyBoard();
        fillBoard(board);
        return board;
    }

    /**
     * 根据难度从完整解答生成谜题
     * @param {number[][]} solution 完整解答
     * @param {string} difficulty 难度 ('easy', 'medium', 'hard')
     * @returns {{puzzle: number[][], solution: number[][]}} 谜题和解答
     */
    function generatePuzzle(solution, difficulty) {
        const puzzle = copyBoard(solution);

        // 根据难度确定要挖空的数量
        const holesMap = {
            easy: 30,      // 保留51-52个数字
            medium: 42,    // 保留39个数字
            hard: 54       // 保留27个数字
        };

        const holes = holesMap[difficulty] || holesMap.easy;

        // 随机挖空
        let count = 0;
        const positions = [];
        for (let i = 0; i < 81; i++) {
            positions.push(i);
        }
        const shuffledPositions = shuffleArray(positions);

        for (const pos of shuffledPositions) {
            if (count >= holes) break;

            const row = Math.floor(pos / 9);
            const col = pos % 9;

            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                count++;
            }
        }

        return {
            puzzle: puzzle,
            solution: solution
        };
    }

    /**
     * 生成数独游戏（谜题+解答）
     * @param {string} difficulty 难度
     * @returns {{puzzle: number[][], solution: number[][]}}
     */
    function generate(difficulty = 'medium') {
        const solution = generateSolution();
        return generatePuzzle(solution, difficulty);
    }

    /**
     * 检查玩家当前的解答是否正确
     * @param {number[][]} board 玩家的棋盘
     * @param {number[][]} solution 正确解答
     * @returns {{complete: boolean, correct: boolean, errors: Array}}
     */
    function checkSolution(board, solution) {
        const errors = [];
        let complete = true;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    complete = false;
                } else if (board[row][col] !== solution[row][col]) {
                    errors.push({ row, col });
                }
            }
        }

        return {
            complete,
            correct: complete && errors.length === 0,
            errors
        };
    }

    /**
     * 获取一个提示（显示一个正确答案）
     * @param {number[][]} board 当前棋盘
     * @param {number[][]} solution 解答
     * @returns {{row: number, col: number, value: number}|null} 提示位置和值
     */
    function getHint(board, solution) {
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0 || board[row][col] !== solution[row][col]) {
                    emptyCells.push({ row, col, value: solution[row][col] });
                }
            }
        }

        if (emptyCells.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }

    // 导出公共API
    return {
        generate,
        isValidMove,
        checkSolution,
        getHint,
        copyBoard
    };
})();