import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const PAD_SIZE = (width - 32 - Spacing.sm * 8) / 9;

interface NumberPadProps {
    onNumber: (num: number) => void;
    onErase: () => void;
}

export function NumberPad({ onNumber, onErase }: NumberPadProps) {
    return (
        <View style={styles.container}>
            {/* Números 1–9 */}
            <View style={styles.numbersRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <TouchableOpacity
                        key={num}
                        style={styles.numberButton}
                        onPress={() => onNumber(num)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.numberText}>{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Botão apagar */}
            <TouchableOpacity
                style={styles.eraseButton}
                onPress={onErase}
                activeOpacity={0.7}
            >
                <Text style={styles.eraseText}>⌫  Apagar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },

    // Números
    numbersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numberButton: {
        width: PAD_SIZE,
        height: PAD_SIZE * 1.3,
        backgroundColor: Colors.surface,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: Colors.primary,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
    },

    // Apagar
    eraseButton: {
        height: 48,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eraseText: {
        color: Colors.textMuted,
        fontSize: FontSizes.md,
        fontWeight: '600',
        letterSpacing: 1,
    },
});
