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

// Anotações: matriz 9x9 onde cada célula tem um Set de números candidatos
export type Notes = Set<number>[][];

function emptyNotes(): Notes {
    return Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => new Set<number>())
    );
}

function cloneNotes(notes: Notes): Notes {
    return notes.map(row => row.map(cell => new Set(cell)));
}

export interface GameState {
    board: Board;
    solution: Board;
    initialBoard: Board;
    notes: Notes;
    history: { board: Board; notes: Notes } | null;
    isNotesMode: boolean;
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
        notes: emptyNotes(),
        history: null,
        isNotesMode: false,
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
            notes: emptyNotes(),
            history: null,
            isNotesMode: false,
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

    // ─── Toggle modo anotações ───────────────────────────────────────────────────

    const toggleNotesMode = useCallback(() => {
        setState(prev => ({ ...prev, isNotesMode: !prev.isNotesMode }));
    }, []);

    // ─── Selecionar célula ───────────────────────────────────────────────────────

    const selectCell = useCallback((row: number, col: number) => {
        setState(prev => {
            if (prev.isComplete || prev.isGameOver) return prev;
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

            // Salva snapshot antes de modificar
            const snapshot = {
                board: prev.board.map(r => [...r]),
                notes: cloneNotes(prev.notes),
            };

            // ── Modo anotações ──
            if (prev.isNotesMode) {
                // Só permite anotar em células vazias (sem número definitivo)
                if (prev.board[row][col] !== null) return prev;

                const newNotes = cloneNotes(prev.notes);
                if (newNotes[row][col].has(num)) {
                    newNotes[row][col].delete(num);
                } else {
                    newNotes[row][col].add(num);
                }
                return { ...prev, notes: newNotes, history: snapshot };
            }

            // ── Modo normal ──
            const newBoard: Board = prev.board.map(r => [...r]);
            newBoard[row][col] = num;

            const valid = isCellValid(prev.board, row, col, num);
            const newErrors = valid ? prev.errors : prev.errors + 1;
            const isGameOver = newErrors >= prev.maxErrors;

            // Limpa anotações da célula preenchida e das células relacionadas
            const newNotes = cloneNotes(prev.notes);
            newNotes[row][col] = new Set();

            if (valid) {
                const related = getRelatedCells(row, col);
                for (const { row: rr, col: rc } of related) {
                    newNotes[rr][rc].delete(num);
                }
            }

            if (!valid) {
                return {
                    ...prev,
                    board: newBoard,
                    notes: newNotes,
                    errors: newErrors,
                    isGameOver,
                    isComplete: false,
                    isTimerRunning: !isGameOver,
                    history: snapshot,
                };
            }

            const complete = isBoardComplete(newBoard, prev.solution);
            return {
                ...prev,
                board: newBoard,
                notes: newNotes,
                errors: newErrors,
                isComplete: complete,
                isGameOver: false,
                isTimerRunning: !complete,
                history: snapshot,
            };
        });
    }, []);

    // ─── Apagar célula ───────────────────────────────────────────────────────────

    const eraseCell = useCallback(() => {
        setState(prev => {
            if (!prev.selectedCell) return prev;
            if (prev.isComplete || prev.isGameOver) return prev;

            const { row, col } = prev.selectedCell;
            if (prev.initialBoard[row][col] !== null) return prev;

            const snapshot = {
                board: prev.board.map(r => [...r]),
                notes: cloneNotes(prev.notes),
            };

            const newBoard: Board = prev.board.map(r => [...r]);
            const newNotes = cloneNotes(prev.notes);

            newBoard[row][col] = null;
            newNotes[row][col] = new Set();

            return { ...prev, board: newBoard, notes: newNotes, history: snapshot };
        });
    }, []);

    // ─── Desfazer ────────────────────────────────────────────────────────────────

    const undo = useCallback(() => {
        setState(prev => {
            if (!prev.history) return prev;
            return {
                ...prev,
                board: prev.history.board,
                notes: prev.history.notes,
                history: null,
                isComplete: false,
            };
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
        undo,
        toggleNotesMode,
        getCellState,
        isRelatedCell,
        isSameNumber,
        formatTime,
    };
}
