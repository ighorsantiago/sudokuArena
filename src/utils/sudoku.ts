export type Board = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Helpers ────────────────────────────────────────────────────────────────

function emptyBoard(): Board {
    return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function isValid(board: Board, row: number, col: number, num: number): boolean {
    // Verifica linha
    if (board[row].includes(num)) return false;

    // Verifica coluna
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }

    // Verifica bloco 3x3
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (board[r][c] === num) return false;
        }
    }

    return true;
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ─── Geração ─────────────────────────────────────────────────────────────────

function fillBoard(board: Board): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === null) {
                const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = null;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function countSolutions(board: Board, limit = 2): number {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === null) {
                let count = 0;
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        count += countSolutions(board, limit - count);
                        board[row][col] = null;
                        if (count >= limit) return count;
                    }
                }
                return count;
            }
        }
    }
    return 1;
}

const CLUES: Record<Difficulty, number> = {
    easy: 38,
    medium: 30,
    hard: 24,
};

export function generatePuzzle(difficulty: Difficulty): {
    puzzle: Board;
    solution: Board;
} {
    const solution = emptyBoard();
    fillBoard(solution);

    const puzzle: Board = solution.map(row => [...row]);

    const cells = shuffle(
        Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
    );

    let clues = 81;
    const target = CLUES[difficulty];

    for (const { row, col } of cells) {
        if (clues <= target) break;

        const backup = puzzle[row][col];
        puzzle[row][col] = null;

        const copy: Board = puzzle.map(r => [...r]);
        if (countSolutions(copy) !== 1) {
            puzzle[row][col] = backup;
        } else {
            clues--;
        }
    }

    return { puzzle, solution };
}

// ─── Validação ───────────────────────────────────────────────────────────────

export function isCellValid(
    board: Board,
    row: number,
    col: number,
    value: number
): boolean {
    const copy: Board = board.map(r => [...r]);
    copy[row][col] = null;
    return isValid(copy, row, col, value);
}

export function isBoardComplete(board: Board, solution: Board): boolean {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== solution[r][c]) return false;
        }
    }
    return true;
}

export function getRelatedCells(
    row: number,
    col: number
): { row: number; col: number }[] {
    const related: { row: number; col: number }[] = [];
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
        if (i !== col) related.push({ row, col: i });
        if (i !== row) related.push({ row: i, col });
    }

    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (r !== row || c !== col) {
                if (!related.find(cell => cell.row === r && cell.col === c)) {
                    related.push({ row: r, col: c });
                }
            }
        }
    }

    return related;
}
