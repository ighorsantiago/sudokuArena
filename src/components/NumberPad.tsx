import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
}

export function NumberPad({ onNumber, onErase, onUndo, isNotesMode, onToggleNotes }: NumberPadProps) {
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
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <Ionicons name="bulb-outline" size={26} color={Colors.textMuted} />
                    <Text style={styles.actionLabel}>Dica</Text>
                </TouchableOpacity>

            </View>

            {/* Números 1–9 */}
            <View style={styles.numbersRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <TouchableOpacity
                        key={num}
                        style={styles.numberButton}
                        onPress={() => onNumber(num)}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.numberText}>{num}</Text>
                    </TouchableOpacity>
                ))}
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

    // Números
    numbersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numberButton: {
        width: NUM_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: Colors.primary,
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
    },
});
