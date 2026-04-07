import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import { Difficulty } from '../utils/sudoku';

interface GameHeaderProps {
    difficulty: Difficulty;
    errors: number;
    maxErrors: number;
    elapsedSeconds: number;
    isTimerRunning: boolean;
    formatTime: (seconds: number) => string;
    onBack: () => void;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
};

export function GameHeader({
    difficulty,
    errors,
    maxErrors,
    elapsedSeconds,
    formatTime,
    onBack,
}: GameHeaderProps) {
    return (
        <View style={styles.container}>

            {/* Linha superior: voltar + título */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>SUDOKU ARENA</Text>
                <View style={styles.backButton} />
            </View>

            {/* Linha inferior: stats */}
            <View style={styles.statsRow}>

                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Dificuldade</Text>
                    <Text style={styles.statValue}>{DIFFICULTY_LABEL[difficulty]}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Erros</Text>
                    <Text style={[styles.statValue, errors > 0 && styles.errorText]}>
                        {errors}/{maxErrors}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Tempo</Text>
                    <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
        gap: Spacing.md,
    },

    // Linha superior
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        alignItems: 'center',
    },
    backArrow: {
        color: Colors.primary,
        fontSize: 36,
        lineHeight: 36,
        fontWeight: '300',
    },
    title: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        letterSpacing: 3,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    statLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statValue: {
        color: Colors.text,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
    errorText: {
        color: Colors.error,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.borderSubtle,
        marginHorizontal: Spacing.sm,
    },
});
