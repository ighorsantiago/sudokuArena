import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const NUM_SIZE = (width - 32 - Spacing.sm * 8) / 9;

interface NumberPadProps {
    onNumber: (num: number) => void;
    onErase: () => void;
    onUndo: () => void;
    isNotesMode: boolean;
    onToggleNotes: () => void;
    hintsLeft: number;
    onHint: () => void;
    hintAdAvailable: boolean;
    activeNumber: number | null;
    onToggleActiveNumber: (num: number) => void;
    getNumberCount: (num: number) => number;
}

export function NumberPad({
    onNumber,
    onErase,
    onUndo,
    isNotesMode,
    onToggleNotes,
    hintsLeft,
    onHint,
    hintAdAvailable,
    activeNumber,
    onToggleActiveNumber,
    getNumberCount,
}: NumberPadProps) {

    function handleNumberPress(num: number) {
        onNumber(num);
    }
    return (
        <View style={styles.container}>

            {/* Linha de ações */}
            <View style={styles.actionsRow}>

                {/* Desfazer */}
                <TouchableOpacity style={styles.actionButton} onPress={onUndo} activeOpacity={0.7}>
                    <Ionicons name="arrow-undo-outline" size={26} color={Colors.textMuted} />
                    <Text style={styles.actionLabel}>Desfazer</Text>
                </TouchableOpacity>

                {/* Apagar */}
                <TouchableOpacity style={styles.actionButton} onPress={onErase} activeOpacity={0.7}>
                    <Ionicons name="backspace-outline" size={26} color={Colors.textMuted} />
                    <Text style={styles.actionLabel}>Apagar</Text>
                </TouchableOpacity>

                {/* Anotações */}
                <TouchableOpacity style={styles.actionButton} onPress={onToggleNotes} activeOpacity={0.7}>
                    <View style={styles.iconWithBadge}>
                        <Ionicons
                            name="pencil-outline"
                            size={26}
                            color={isNotesMode ? Colors.secondary : Colors.textMuted}
                        />
                        <View style={[styles.badge, isNotesMode ? styles.badgeOn : styles.badgeOff]}>
                            <Text style={styles.badgeText}>{isNotesMode ? 'ON' : 'OFF'}</Text>
                        </View>
                    </View>
                    <Text style={[styles.actionLabel, isNotesMode && styles.actionLabelActive]}>
                        Anotações
                    </Text>
                </TouchableOpacity>

                {/* Dica */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onHint}
                    activeOpacity={hintsLeft > 0 || hintAdAvailable ? 0.7 : 1}
                    disabled={hintsLeft === 0 && !hintAdAvailable}
                >
                    <View style={styles.iconWithBadge}>
                        <Ionicons
                            name={hintAdAvailable ? 'videocam-outline' : 'bulb-outline'}
                            size={26}
                            color={hintsLeft > 0 || hintAdAvailable ? Colors.textMuted : Colors.textDim}
                        />
                        {hintsLeft > 0 && (
                            <View style={styles.hintBadge}>
                                <Text style={styles.badgeText}>{hintsLeft}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[
                        styles.actionLabel,
                        hintsLeft === 0 && !hintAdAvailable && styles.actionLabelDim,
                    ]}>
                        {hintAdAvailable ? 'Ver anúncio' : 'Dica'}
                    </Text>
                </TouchableOpacity>

            </View>

            {/* Números 1–9 */}
            <View style={styles.numbersRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                    const count = getNumberCount(num);
                    const isComplete = count >= 9;
                    const isActive = activeNumber === num;

                    return (
                        <TouchableOpacity
                            key={num}
                            style={[
                                styles.numberButton,
                                isActive && styles.numberButtonActive,
                                isComplete && styles.numberButtonComplete,
                            ]}
                            onPress={() => {
                                if (isComplete) return;
                                handleNumberPress(num);
                            }}
                            onLongPress={() => {
                                if (isComplete) return;
                                onToggleActiveNumber(num);
                            }}
                            delayLongPress={300}
                            activeOpacity={isComplete ? 1 : 0.6}
                        >
                            <Text style={[
                                styles.numberText,
                                isActive && styles.numberTextActive,
                                isComplete && styles.numberTextComplete,
                            ]}>
                                {num}
                            </Text>
                            {/* Pontinhos indicando quantos já foram usados */}
                            <View style={styles.dotsRow}>
                                {count > 0 && Array.from({ length: Math.min(count, 9) }).map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.dot,
                                            isComplete ? styles.dotComplete : styles.dotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
    },

    // Ações
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    iconWithBadge: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 0.5,
    },
    actionLabelActive: {
        color: Colors.secondary,
    },
    actionLabelDim: {
        color: Colors.textDim,
    },

    // Badge ON/OFF
    badge: {
        position: 'absolute',
        top: -6,
        right: -14,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    badgeOn: {
        backgroundColor: Colors.secondary,
    },
    badgeOff: {
        backgroundColor: Colors.textDim,
    },
    badgeText: {
        color: Colors.text,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    // Badge dica
    hintBadge: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: Colors.primary,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
    },

    // Números
    numbersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numberButton: {
        width: NUM_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    numberButtonActive: {
        backgroundColor: Colors.selectedCell,
        borderRadius: 8,
    },
    numberButtonComplete: {
        opacity: 0.3,
    },
    numberText: {
        color: Colors.primary,
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
    },
    numberTextActive: {
        color: Colors.secondary,
    },
    numberTextComplete: {
        color: Colors.textDim,
    },

    // Pontinhos de contagem
    dotsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        height: 8,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
    },
    dotActive: {
        backgroundColor: Colors.primary,
    },
    dotComplete: {
        backgroundColor: Colors.textDim,
    },
});
