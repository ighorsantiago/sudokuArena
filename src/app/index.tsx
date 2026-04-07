import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';

import { Difficulty } from '../utils/sudoku';

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
    { key: 'easy', label: 'Fácil' },
    { key: 'medium', label: 'Médio' },
    { key: 'hard', label: 'Difícil' },
];

export default function HomeScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<Difficulty>('medium');

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

                    <View style={styles.difficultyRow}>
                        {DIFFICULTIES.map(({ key, label }) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.difficultyButton,
                                    selected === key && styles.difficultyButtonActive,
                                ]}
                                onPress={() => setSelected(key)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.difficultyLabel,
                                        selected === key && styles.difficultyLabelActive,
                                    ]}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
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

                {/* Rodapé */}
                <Text style={styles.footer}>ARENA GAMES</Text>

            </View>
        </SafeAreaView>
    );
}

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
    difficultyRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        gap: 4,
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

    // Rodapé
    footer: {
        color: Colors.textDim,
        fontSize: FontSizes.xs,
        letterSpacing: 3,
    },
});
