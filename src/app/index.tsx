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
import { AdBanner } from '../components/AdBanner';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';
import { useStats } from '../hooks/useStats';
import { Difficulty } from '../utils/sudoku';

const DIFFICULTIES: { key: Difficulty; label: string; clues: number; emoji: string }[] = [
    { key: 'beginner', label: 'Iniciante', clues: 45, emoji: '🟢' },
    { key: 'easy', label: 'Fácil', clues: 38, emoji: '🔵' },
    { key: 'medium', label: 'Médio', clues: 30, emoji: '🟡' },
    { key: 'hard', label: 'Difícil', clues: 24, emoji: '🟠' },
    { key: 'expert', label: 'Expert', clues: 21, emoji: '🔴' },
    { key: 'master', label: 'Mestre', clues: 18, emoji: '⚫' },
];

export default function HomeScreen() {
    const router = useRouter();
    const [showStats, setShowStats] = useState(false);
    const { stats, getWinRate, formatBestTime, reloadStats } = useStats();

    useFocusEffect(
        useCallback(() => {
            reloadStats();
        }, [reloadStats])
    );

    function handlePlay(difficulty: Difficulty) {
        router.push({ pathname: '/game', params: { difficulty } });
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <View style={styles.logoArea}>
                    <Text style={styles.titleLine1}>SUDOKU</Text>
                    <Text style={styles.titleLine2}>ARENA</Text>
                    <View style={styles.titleDivider} />
                    <Text style={styles.tagline}>LÓGICA  ·  ESTRATÉGIA  ·  DESAFIO</Text>
                </View>

                {/* Dificuldades */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ESCOLHA A DIFICULDADE</Text>
                    {DIFFICULTIES.map(d => (
                        <TouchableOpacity
                            key={d.key}
                            style={styles.diffButton}
                            onPress={() => handlePlay(d.key)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.diffEmoji}>{d.emoji}</Text>
                            <View style={styles.diffInfo}>
                                <Text style={styles.diffLabel}>{d.label}</Text>
                                <Text style={styles.diffClues}>{d.clues} pistas</Text>
                            </View>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Botão stats */}
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

            </ScrollView>

            {/* Banner */}
            <AdBanner />

            {/* Modal de estatísticas */}
            <Modal visible={showStats} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <Text style={styles.modalTitle}>ESTATÍSTICAS</Text>

                        <View style={styles.statsGrid}>
                            {DIFFICULTIES.map(d => {
                                const s = stats[d.key];
                                return (
                                    <View key={d.key} style={styles.statRow}>
                                        <Text style={styles.statDiff}>
                                            {d.emoji} {d.label}
                                        </Text>
                                        <View style={styles.statValues}>
                                            <Text style={styles.statValue}>
                                                {s.gamesWon}/{s.gamesStarted}
                                            </Text>
                                            <Text style={styles.statSub}>
                                                {getWinRate(d.key)}% vitórias
                                            </Text>
                                            {s.bestTime !== null && (
                                                <Text style={styles.statSub}>
                                                    ⏱ {formatBestTime(d.key)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={styles.buttonPrimary}
                            onPress={() => setShowStats(false)}
                        >
                            <Text style={styles.buttonPrimaryText}>FECHAR</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
        gap: Spacing.xl,
    },
    logoArea: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    titleLine1: {
        color: Colors.primary,
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        letterSpacing: 8,
        lineHeight: FontSizes.xxxl,
    },
    titleLine2: {
        color: Colors.secondary,
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        letterSpacing: 10,
        lineHeight: FontSizes.xxl * 1.4,
    },
    titleDivider: {
        width: 220,
        height: 1,
        backgroundColor: Colors.primary,
        marginVertical: Spacing.xs,
    },
    tagline: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 2,
    },
    section: {
        width: '100%',
        gap: Spacing.sm,
    },
    sectionTitle: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 2,
        marginBottom: Spacing.xs,
    },
    diffButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        gap: Spacing.md,
    },
    diffEmoji: {
        fontSize: 22,
    },
    diffInfo: {
        flex: 1,
    },
    diffLabel: {
        color: Colors.text,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    diffClues: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    arrow: {
        color: Colors.textMuted,
        fontSize: 24,
    },
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
    footer: {
        color: Colors.textDim,
        fontSize: FontSizes.xs,
        letterSpacing: 3,
    },
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
        gap: Spacing.md,
    },
    modalTitle: {
        color: Colors.primary,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
    },
    statsGrid: {
        gap: Spacing.sm,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
    },
    statDiff: {
        color: Colors.text,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        flex: 1,
    },
    statValues: {
        alignItems: 'flex-end',
        gap: 2,
    },
    statValue: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
    statSub: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
    },
    buttonPrimary: {
        height: 52,
        backgroundColor: Colors.primary,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimaryText: {
        color: Colors.background,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});
