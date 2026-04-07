import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader } from '../components/GameHeader';
import { NumberPad } from '../components/NumberPad';
import { SudokuGrid } from '../components/SudokuGrid';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';
import { useSudoku } from '../hooks/useSudoku';
import { Difficulty } from '../utils/sudoku';

export default function GameScreen() {
    const router = useRouter();
    const { difficulty } = useLocalSearchParams<{ difficulty: Difficulty }>();

    const {
        board,
        notes,
        isNotesMode,
        selectedCell,
        errors,
        maxErrors,
        isComplete,
        isGameOver,
        elapsedSeconds,
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
        difficulty: currentDifficulty,
        isTimerRunning,
    } = useSudoku();

    useEffect(() => {
        startGame(difficulty ?? 'medium');
    }, []);

    function handleBack() {
        router.back();
    }

    function handleRestart() {
        startGame(currentDifficulty);
    }

    function handleNewGame() {
        router.back();
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                {/* Header */}
                <GameHeader
                    difficulty={currentDifficulty}
                    errors={errors}
                    maxErrors={maxErrors}
                    elapsedSeconds={elapsedSeconds}
                    isTimerRunning={isTimerRunning}
                    formatTime={formatTime}
                    onBack={handleBack}
                />

                {/* Grid */}
                <View style={styles.gridWrapper}>
                    <SudokuGrid
                        board={board}
                        notes={notes}
                        selectedCell={selectedCell}
                        getCellState={getCellState}
                        isRelatedCell={isRelatedCell}
                        isSameNumber={isSameNumber}
                        onSelectCell={selectCell}
                    />
                </View>

                {/* NumberPad */}
                <NumberPad
                    onNumber={insertNumber}
                    onErase={eraseCell}
                    onUndo={undo}
                    isNotesMode={isNotesMode}
                    onToggleNotes={toggleNotesMode}
                />

            </View>

            {/* Modal de vitória */}
            <Modal visible={isComplete} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalEmoji}>🏆</Text>
                        <Text style={styles.modalTitle}>PARABÉNS!</Text>
                        <Text style={styles.modalSubtitle}>Puzzle concluído</Text>

                        <View style={styles.modalStats}>
                            <View style={styles.modalStatItem}>
                                <Text style={styles.modalStatLabel}>Tempo</Text>
                                <Text style={styles.modalStatValue}>{formatTime(elapsedSeconds)}</Text>
                            </View>
                            <View style={styles.modalDivider} />
                            <View style={styles.modalStatItem}>
                                <Text style={styles.modalStatLabel}>Erros</Text>
                                <Text style={styles.modalStatValue}>{errors}/{maxErrors}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleRestart}>
                            <Text style={styles.modalButtonPrimaryText}>JOGAR NOVAMENTE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButtonSecondary} onPress={handleNewGame}>
                            <Text style={styles.modalButtonSecondaryText}>MENU PRINCIPAL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de game over */}
            <Modal visible={isGameOver} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalEmoji}>💀</Text>
                        <Text style={[styles.modalTitle, styles.modalTitleError]}>GAME OVER</Text>
                        <Text style={styles.modalSubtitle}>Você cometeu {maxErrors} erros</Text>

                        <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleRestart}>
                            <Text style={styles.modalButtonPrimaryText}>TENTAR NOVAMENTE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButtonSecondary} onPress={handleNewGame}>
                            <Text style={styles.modalButtonSecondaryText}>MENU PRINCIPAL</Text>
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
        flex: 1,
        justifyContent: 'space-evenly',
        paddingVertical: Spacing.sm,
    },
    gridWrapper: {
        paddingHorizontal: Spacing.lg,
    },

    // Modal compartilhado
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
        alignItems: 'center',
        gap: Spacing.md,
    },
    modalEmoji: {
        fontSize: 56,
    },
    modalTitle: {
        color: Colors.primary,
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    modalTitleError: {
        color: Colors.error,
    },
    modalSubtitle: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
        letterSpacing: 1,
    },

    // Stats no modal
    modalStats: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
        width: '100%',
        justifyContent: 'center',
        marginVertical: Spacing.sm,
    },
    modalStatItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    modalStatLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    modalStatValue: {
        color: Colors.text,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
    modalDivider: {
        width: 1,
        backgroundColor: Colors.borderSubtle,
        marginHorizontal: Spacing.md,
    },

    // Botões do modal
    modalButtonPrimary: {
        width: '100%',
        height: 52,
        backgroundColor: Colors.primary,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonPrimaryText: {
        color: Colors.background,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    modalButtonSecondary: {
        width: '100%',
        height: 52,
        backgroundColor: 'transparent',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonSecondaryText: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        letterSpacing: 2,
    },
});
