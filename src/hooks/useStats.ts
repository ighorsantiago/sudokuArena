import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Difficulty } from '../utils/sudoku';

export interface DifficultyStats {
    gamesStarted: number;
    gamesWon: number;
    perfectWins: number;
    bestTime: number | null;
}

export type Stats = Record<Difficulty, DifficultyStats>;

const STORAGE_KEY = '@sudoku_arena_stats';

const emptyDifficultyStats = (): DifficultyStats => ({
    gamesStarted: 0,
    gamesWon: 0,
    perfectWins: 0,
    bestTime: null,
});

const emptyStats = (): Stats => ({
    beginner: emptyDifficultyStats(),
    easy: emptyDifficultyStats(),
    medium: emptyDifficultyStats(),
    hard: emptyDifficultyStats(),
    expert: emptyDifficultyStats(),
    master: emptyDifficultyStats(),
});

async function loadStats(): Promise<Stats> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<Stats>;
            // Merge com emptyStats para garantir que novas dificuldades existam
            const empty = emptyStats();
            return {
                beginner: { ...empty.beginner, ...parsed.beginner },
                easy: { ...empty.easy, ...parsed.easy },
                medium: { ...empty.medium, ...parsed.medium },
                hard: { ...empty.hard, ...parsed.hard },
                expert: { ...empty.expert, ...parsed.expert },
                master: { ...empty.master, ...parsed.master },
            };
        }
    } catch (e) {
        console.warn('Erro ao carregar stats:', e);
    }
    return emptyStats();
}

async function saveStats(stats: Stats): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        console.log('[Stats] Salvo:', JSON.stringify(stats));
    } catch (e) {
        console.warn('[Stats] Erro ao salvar:', e);
    }
}

export function useStats() {
    const [stats, setStats] = useState<Stats>(emptyStats());
    const [loaded, setLoaded] = useState(false);
    const statsRef = useRef<Stats>(emptyStats());

    // ─── Carregar ────────────────────────────────────────────────────────────────

    useEffect(() => {
        loadStats().then(s => {
            console.log('[Stats] Carregado:', JSON.stringify(s));
            statsRef.current = s;
            setStats(s);
            setLoaded(true);
        });
    }, []);

    const reloadStats = useCallback(async () => {
        const s = await loadStats();
        statsRef.current = s;
        setStats(s);
    }, []);

    // ─── Registrar jogo iniciado ─────────────────────────────────────────────────

    const recordGameStarted = useCallback(async (difficulty: Difficulty) => {
        const current = await loadStats();
        const next: Stats = {
            ...current,
            [difficulty]: {
                ...current[difficulty],
                gamesStarted: current[difficulty].gamesStarted + 1,
            },
        };
        statsRef.current = next;
        setStats(next);
        await saveStats(next);
    }, []);

    // ─── Registrar vitória ───────────────────────────────────────────────────────

    const recordWin = useCallback(async (
        difficulty: Difficulty,
        elapsedSeconds: number,
        errors: number,
    ): Promise<boolean> => {
        const current = await loadStats();
        const isPerfect = errors === 0;
        const isNewBest =
            current[difficulty].bestTime === null ||
            elapsedSeconds < current[difficulty].bestTime!;

        const next: Stats = {
            ...current,
            [difficulty]: {
                ...current[difficulty],
                gamesWon: current[difficulty].gamesWon + 1,
                perfectWins: current[difficulty].perfectWins + (isPerfect ? 1 : 0),
                bestTime: isNewBest ? elapsedSeconds : current[difficulty].bestTime,
            },
        };
        statsRef.current = next;
        setStats(next);
        await saveStats(next);
        return isNewBest;
    }, []);

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    function getWinRate(difficulty: Difficulty): number {
        const { gamesStarted, gamesWon } = statsRef.current[difficulty];
        if (gamesStarted === 0) return 0;
        return Math.round((gamesWon / gamesStarted) * 100);
    }

    function formatBestTime(difficulty: Difficulty): string {
        const { bestTime } = statsRef.current[difficulty];
        if (bestTime === null) return '--:--';
        const m = Math.floor(bestTime / 60).toString().padStart(2, '0');
        const s = (bestTime % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    const resetStats = useCallback(async () => {
        const empty = emptyStats();
        statsRef.current = empty;
        setStats(empty);
        await saveStats(empty);
        console.log('[Stats] Zerado!');
    }, []);

    return {
        stats,
        loaded,
        recordGameStarted,
        recordWin,
        getWinRate,
        formatBestTime,
        resetStats,
        reloadStats,
    };
}
