import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Board,
    Difficulty,
    generatePuzzle,
    getRelatedCells,
    isBoardComplete,
    isCellValid,
} from '../utils/sudoku';

export type CellState = 'fixed' | 'empty' | 'filled' | 'error';

export interface GameState {
    board: Board;
    solution: Board;
    initialBoard: Board;
    selectedCell: { row: number; col: number } | null;
    errors: number;
    maxErrors: number;
    isComplete: boolean;
    isGameOver: boolean;
    difficulty: Difficulty;
    elapsedSeconds: number;
    isTimerRunning: boolean;
}

export function useSudoku() {
    const [state, setState] = useState<GameState>({
        board: Array.from({ length: 9 }, () => Array(9).fill(null)),
        solution: Array.from({ length: 9 }, () => Array(9).fill(null)),
        initialBoard: Array.from({ length: 9 }, () => Array(9).fill(null)),
        selectedCell: null,
        errors: 0,
        maxErrors: 3,
        isComplete: false,
        isGameOver: false,
        difficulty: 'medium',
        elapsedSeconds: 0,
        isTimerRunning: false,
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ─── Timer ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (state.isTimerRunning) {
            timerRef.current = setInterval(() => {
                setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.isTimerRunning]);

    // ─── Iniciar jogo ────────────────────────────────────────────────────────────

    const startGame = useCallback((difficulty: Difficulty = 'medium') => {
        const { puzzle, solution } = generatePuzzle(difficulty);

        setState({
            board: puzzle.map(row => [...row]),
            solution,
            initialBoard: puzzle.map(row => [...row]),
            selectedCell: null,
            errors: 0,
            maxErrors: 3,
            isComplete: false,
            isGameOver: false,
            difficulty,
            elapsedSeconds: 0,
            isTimerRunning: true,
        });
    }, []);

    // ─── Selecionar célula ───────────────────────────────────────────────────────

    const selectCell = useCallback((row: number, col: number) => {
        setState(prev => {
            if (prev.isComplete || prev.isGameOver) return prev;
            if (prev.initialBoard[row][col] !== null) {
                return { ...prev, selectedCell: { row, col } };
            }
            return { ...prev, selectedCell: { row, col } };
        });
    }, []);

    // ─── Inserir número ──────────────────────────────────────────────────────────

    const insertNumber = useCallback((num: number) => {
        setState(prev => {
            if (!prev.selectedCell) return prev;
            if (prev.isComplete || prev.isGameOver) return prev;

            const { row, col } = prev.selectedCell;

            if (prev.initialBoard[row][col] !== null) return prev;

            const newBoard: Board = prev.board.map(r => [...r]);
            newBoard[row][col] = num;

            const valid = isCellValid(prev.board, row, col, num);
            const newErrors = valid ? prev.errors : prev.errors + 1;
            const isGameOver = newErrors >= prev.maxErrors;

            if (!valid) {
                // Marca erro mas mantém o número para o jogador ver
                const complete = false;
                return {
                    ...prev,
                    board: newBoard,
                    errors: newErrors,
                    isGameOver,
                    isComplete: complete,
                    isTimerRunning: !isGameOver,
                };
            }

            const complete = isBoardComplete(newBoard, prev.solution);

            return {
                ...prev,
                board: newBoard,
                errors: newErrors,
                isComplete: complete,
                isGameOver: false,
                isTimerRunning: !complete,
            };
        });
    }, []);

    // ─── Apagar número ───────────────────────────────────────────────────────────

    const eraseCell = useCallback(() => {
        setState(prev => {
            if (!prev.selectedCell) return prev;
            if (prev.isComplete || prev.isGameOver) return prev;

            const { row, col } = prev.selectedCell;
            if (prev.initialBoard[row][col] !== null) return prev;

            const newBoard: Board = prev.board.map(r => [...r]);
            newBoard[row][col] = null;

            return { ...prev, board: newBoard };
        });
    }, []);

    // ─── Utilitários de UI ───────────────────────────────────────────────────────

    const getCellState = useCallback(
        (row: number, col: number): CellState => {
            if (state.initialBoard[row][col] !== null) return 'fixed';
            const value = state.board[row][col];
            if (value === null) return 'empty';
            if (!isCellValid(state.initialBoard, row, col, value)) return 'error';
            return 'filled';
        },
        [state.board, state.initialBoard]
    );

    const isRelatedCell = useCallback(
        (row: number, col: number): boolean => {
            if (!state.selectedCell) return false;
            const related = getRelatedCells(state.selectedCell.row, state.selectedCell.col);
            return related.some(cell => cell.row === row && cell.col === col);
        },
        [state.selectedCell]
    );

    const isSameNumber = useCallback(
        (row: number, col: number): boolean => {
            if (!state.selectedCell) return false;
            const selectedValue = state.board[state.selectedCell.row][state.selectedCell.col];
            const cellValue = state.board[row][col];
            return selectedValue !== null && selectedValue === cellValue;
        },
        [state.board, state.selectedCell]
    );

    const formatTime = useCallback((seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, []);

    return {
        ...state,
        startGame,
        selectCell,
        insertNumber,
        eraseCell,
        getCellState,
        isRelatedCell,
        isSameNumber,
        formatTime,
    };
}
