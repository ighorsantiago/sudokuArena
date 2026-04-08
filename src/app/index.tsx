import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';
import { useStats } from '../hooks/useStats';
import { Difficulty } from '../utils/sudoku';

const DIFFICULTIES: { key: Difficulty; label: string }[][] = [
    [
        { key: 'beginner', label: 'Iniciante' },
        { key: 'easy', label: 'Fácil' },
        { key: 'medium', label: 'Médio' },
    ],
    [
        { key: 'hard', label: 'Difícil' },
        { key: 'expert', label: 'Expert' },
        { key: 'master', label: 'Mestre' },
    ],
];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    beginner: 'Iniciante',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    expert: 'Expert',
    master: 'Mestre',
};

export default function HomeScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<Difficulty>('medium');
    const [showStats, setShowStats] = useState(false);
    const { stats, getWinRate, formatBestTime, resetStats, reloadStats } = useStats();

    useFocusEffect(
        useCallback(() => {
            reloadStats();
        }, [reloadStats])
    );

    function handlePlay() {
        router.push({ pathname: '/game', params: { difficulty: selected } });
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                {/* Logo */}
                <View style={styles.logoArea}>
                    <View style={styles.gridPreview}>
                        {Array.from({ length: 9 }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.previewCell,
                                    [2, 4, 6].includes(i) && styles.previewCellFilled,
                                ]}
                            >
                                {[2, 4, 6].includes(i) && (
                                    <Text style={styles.previewNumber}>
                                        {i === 2 ? '9' : i === 4 ? '5' : '3'}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.titleDivider} />
                    <Text style={styles.titleMain}>SUDOKU</Text>
                    <Text style={styles.titleSub}>ARENA</Text>
                    <View style={styles.titleDivider} />
                </View>

                {/* Seleção de dificuldade */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ESCOLHA A DIFICULDADE</Text>

                    <View style={styles.difficultyGrid}>
                        {DIFFICULTIES.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.difficultyRow}>
                                {row.map(({ key, label }: { key: Difficulty; label: string }) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.difficultyButton,
                                            selected === key && styles.difficultyButtonActive,
                                        ]}
                                        onPress={() => setSelected(key)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.difficultyLabel,
                                            selected === key && styles.difficultyLabelActive,
                                        ]}>
                                            {label}
                                        </Text>
                                        <View style={styles.bestTimeRow}>
                                            <Ionicons
                                                name="trophy-outline"
                                                size={10}
                                                color={selected === key ? Colors.primary : Colors.textDim}
                                            />
                                            <Text style={[
                                                styles.bestTimeText,
                                                selected === key && styles.bestTimeTextActive,
                                            ]}>
                                                {formatBestTime(key)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Botão jogar */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlay}
                    activeOpacity={0.85}
                >
                    <Text style={styles.playButtonText}>JOGAR</Text>
                </TouchableOpacity>

                {/* Botão de estatísticas */}
                <TouchableOpacity
                    style={styles.statsButton}
                    onPress={() => setShowStats(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="bar-chart-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.statsButtonText}>ESTATÍSTICAS</Text>
                </TouchableOpacity>

                {/* Rodapé */}
                <Text style={styles.footer}>ARENA GAMES</Text>

            </View>

            {/* Modal de estatísticas */}
            <Modal visible={showStats} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <Text style={styles.modalTitle}>ESTATÍSTICAS</Text>

                        <ScrollView style={styles.statsScroll} showsVerticalScrollIndicator={false}>
                            {DIFFICULTIES.flat().map(({ key, label }: { key: Difficulty; label: string }) => (
                                <View key={key} style={styles.statsSection}>
                                    <Text style={styles.statsDiffLabel}>{label}</Text>

                                    <View style={styles.statsGrid}>
                                        <StatItem
                                            label="Jogos"
                                            value={String(stats[key].gamesStarted)}
                                        />
                                        <StatItem
                                            label="Vitórias"
                                            value={String(stats[key].gamesWon)}
                                        />
                                        <StatItem
                                            label="Taxa"
                                            value={`${getWinRate(key)}%`}
                                        />
                                        <StatItem
                                            label="Perfeitas"
                                            value={String(stats[key].perfectWins)}
                                            highlight
                                        />
                                        <StatItem
                                            label="Recorde"
                                            value={formatBestTime(key)}
                                            highlight
                                            fullWidth
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalButtonPrimary}
                            onPress={() => setShowStats(false)}
                        >
                            <Text style={styles.modalButtonText}>FECHAR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButtonReset}
                            onPress={resetStats}
                        >
                            <Text style={styles.modalButtonResetText}>ZERAR ESTATÍSTICAS</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function StatItem({
    label,
    value,
    highlight = false,
    fullWidth = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    fullWidth?: boolean;
}) {
    return (
        <View style={[styles.statItem, fullWidth && styles.statItemFull]}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={[styles.statLabel, highlight && styles.statLabelHighlight]}>
                {label}
            </Text>
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },

    // Logo
    logoArea: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    gridPreview: {
        width: 120,
        height: 120,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: Radius.sm,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    previewCell: {
        width: 40,
        height: 40,
        borderWidth: 0.5,
        borderColor: Colors.borderSubtle,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewCellFilled: {
        backgroundColor: Colors.selectedCell,
    },
    previewNumber: {
        color: Colors.secondary,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
    titleDivider: {
        width: 200,
        height: 1,
        backgroundColor: Colors.primary,
        marginVertical: Spacing.xs,
    },
    titleMain: {
        color: Colors.primary,
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        letterSpacing: 6,
        lineHeight: FontSizes.xxxl * 1.1,
    },
    titleSub: {
        color: Colors.secondary,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        letterSpacing: 10,
    },

    // Dificuldade
    section: {
        width: '100%',
        gap: Spacing.md,
        alignItems: 'center',
    },
    sectionLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 2,
    },
    difficultyGrid: {
        width: '100%',
        gap: Spacing.sm,
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        gap: 6,
    },
    difficultyButtonActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.selectedCell,
    },
    difficultyLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    difficultyLabelActive: {
        color: Colors.primary,
    },
    bestTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    bestTimeText: {
        color: Colors.textDim,
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    bestTimeTextActive: {
        color: Colors.primary,
    },

    // Jogar
    playButton: {
        width: '100%',
        height: 56,
        backgroundColor: Colors.primary,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonText: {
        color: Colors.background,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        letterSpacing: 4,
    },

    // Stats button
    statsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statsButtonText: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 2,
    },

    modalButtonReset: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonResetText: {
        color: Colors.error,
        fontSize: FontSizes.xs,
        fontWeight: '600',
        letterSpacing: 1,
    },
    footer: {
        color: Colors.textDim,
        fontSize: FontSizes.xs,
        letterSpacing: 3,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    modalBox: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.primary,
        padding: Spacing.xl,
        gap: Spacing.lg,
        maxHeight: '85%',
    },
    modalTitle: {
        color: Colors.primary,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
    },
    statsScroll: {
        flexGrow: 0,
    },
    statsSection: {
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statsDiffLabel: {
        color: Colors.secondary,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
        paddingBottom: Spacing.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    statItem: {
        flex: 1,
        minWidth: '40%',
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    statItemFull: {
        minWidth: '100%',
    },
    statValue: {
        color: Colors.text,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
    },
    statLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statLabelHighlight: {
        color: Colors.primary,
    },
    modalButtonPrimary: {
        height: 52,
        backgroundColor: Colors.primary,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        color: Colors.background,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});
