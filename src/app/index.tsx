import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../components/AdBanner';
import { GameHeader } from '../components/GameHeader';
import { NumberPad } from '../components/NumberPad';
import { SudokuGrid } from '../components/SudokuGrid';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';
import { useInterstitialAd, useRewardedAd } from '../hooks/useAdMob';
import { useHaptics } from '../hooks/useHaptics';
import { useStats } from '../hooks/useStats';
import { useSudoku } from '../hooks/useSudoku';
import { Difficulty } from '../utils/sudoku';

export default function GameScreen() {
    const router = useRouter();
    const { difficulty } = useLocalSearchParams<{ difficulty: Difficulty }>();

    const {
        board,
        notes,
        isNotesMode,
        activeNumber,
        hintsLeft,
        pendingHint,
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
        toggleActiveNumber,
        requestHint,
        applyHint,
        dismissHint,
        continueAfterGameOver,
        getCellState,
        isRelatedCell,
        isSameNumber,
        getNumberCount,
        findFirstCellForNumber,
        formatTime,
        difficulty: currentDifficulty,
        isTimerRunning,
    } = useSudoku();

    const { recordGameStarted, recordWin } = useStats();
    const { vibrateError, vibrateSuccess } = useHaptics();
    const [isNewRecord, setIsNewRecord] = useState(false);

    const { onGameStarted } = useInterstitialAd();

    // Rewarded para continuar após game over
    const { showAd: showContinueAd, loaded: continueAdLoaded } = useRewardedAd(
        useCallback(() => {
            continueAfterGameOver();
        }, [continueAfterGameOver])
    );

    // Rewarded para dica extra
    const { showAd: showHintAd, loaded: hintAdLoaded } = useRewardedAd(
        useCallback(() => {
            requestHint();
        }, [requestHint])
    );

    useEffect(() => {
        const diff = difficulty ?? 'medium';
        startGame(diff);
        recordGameStarted(diff);
        onGameStarted();
    }, []);

    useEffect(() => {
        if (errors > 0) vibrateError();
    }, [errors]);

    useEffect(() => {
        console.log('[Game] isComplete mudou:', isComplete, 'errors:', errors, 'difficulty:', currentDifficulty);
        if (isComplete) {
            vibrateSuccess();
            console.log('[Game] Chamando recordWin...');
            recordWin(currentDifficulty, elapsedSeconds, errors).then(newRecord => {
                console.log('[Game] recordWin retornou, isNewRecord:', newRecord);
                setIsNewRecord(newRecord);
            });
        }
    }, [isComplete]);

    useEffect(() => {
        if (isGameOver) vibrateError();
    }, [isGameOver]);

    function handleBack() {
        router.back();
    }

    function handleRestart() {
        setIsNewRecord(false);
        startGame(currentDifficulty);
        onGameStarted();
    }

    function handleNewGame() {
        router.back();
    }

    function handleContinue() {
        if (continueAdLoaded) {
            showContinueAd();
        } else {
            continueAfterGameOver();
        }
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
                    hintsLeft={hintsLeft}
                    onHint={hintsLeft > 0 ? requestHint : showHintAd}
                    hintAdAvailable={hintsLeft === 0 && hintAdLoaded}
                    activeNumber={activeNumber}
                    onToggleActiveNumber={toggleActiveNumber}
                    getNumberCount={getNumberCount}
                />

                {/* Banner */}
                <AdBanner />

            </View>

            {/* Modal de dica */}
            <Modal visible={!!pendingHint} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalEmoji}>💡</Text>
                        <Text style={styles.modalTitle}>DICA</Text>
                        <Text style={styles.hintExplanation}>{pendingHint?.explanation}</Text>
                        <TouchableOpacity
                            style={styles.modalButtonPrimary}
                            onPress={applyHint}
                        >
                            <Text style={styles.modalButtonPrimaryText}>ENTENDIDO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de vitória */}
            <Modal visible={isComplete} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalEmoji}>🏆</Text>
                        <Text style={styles.modalTitle}>PARABÉNS!</Text>
                        {isNewRecord && (
                            <View style={styles.newRecordBadge}>
                                <Ionicons name="trophy-outline" size={14} color={Colors.background} />
                                <Text style={styles.newRecordText}>NOVO RECORDE!</Text>
                            </View>
                        )}
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

                        <TouchableOpacity style={styles.modalButtonContinue} onPress={handleContinue}>
                            <View style={styles.continueButtonContent}>
                                <Ionicons name="play-circle-outline" size={20} color={Colors.background} />
                                <Text style={styles.modalButtonContinueText}>CONTINUAR</Text>
                                <Ionicons name="videocam-outline" size={16} color={Colors.background} />
                            </View>
                            <Text style={styles.continueSubtext}>Assista um anúncio para continuar</Text>
                        </TouchableOpacity>

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
    newRecordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.md,
    },
    newRecordText: {
        color: Colors.background,
        fontSize: FontSizes.xs,
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    hintExplanation: {
        color: Colors.text,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: Spacing.sm,
        marginVertical: Spacing.sm,
    },
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
    modalButtonContinue: {
        width: '100%',
        backgroundColor: Colors.secondary,
        borderRadius: Radius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    continueButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    modalButtonContinueText: {
        color: Colors.background,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    continueSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: FontSizes.xs,
        letterSpacing: 0.5,
    },
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
