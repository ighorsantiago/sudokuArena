import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes } from '../constants/theme';
import { CellState } from '../hooks/useSudoku';
import { Board } from '../utils/sudoku';

const { width } = Dimensions.get('window');
const GRID_SIZE = width - 32;
const CELL_SIZE = GRID_SIZE / 9;

interface SudokuGridProps {
    board: Board;
    selectedCell: { row: number; col: number } | null;
    getCellState: (row: number, col: number) => CellState;
    isRelatedCell: (row: number, col: number) => boolean;
    isSameNumber: (row: number, col: number) => boolean;
    onSelectCell: (row: number, col: number) => void;
}

export function SudokuGrid({
    board,
    selectedCell,
    getCellState,
    isRelatedCell,
    isSameNumber,
    onSelectCell,
}: SudokuGridProps) {
    return (
        <View style={styles.grid}>
            {board.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                    const cellState = getCellState(rowIndex, colIndex);
                    const isSelected =
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const isRelated = isRelatedCell(rowIndex, colIndex);
                    const isSame = isSameNumber(rowIndex, colIndex);

                    return (
                        <TouchableOpacity
                            key={`${rowIndex}-${colIndex}`}
                            style={[
                                styles.cell,
                                getBorderStyles(rowIndex, colIndex),
                                getCellBackground(cellState, isSelected, isRelated, isSame),
                            ]}
                            onPress={() => onSelectCell(rowIndex, colIndex)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.cellText,
                                    getCellTextStyle(cellState, isSelected, isSame),
                                ]}
                            >
                                {value !== null ? value : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })
            )}
        </View>
    );
}

// ─── Estilos dinâmicos ────────────────────────────────────────────────────────

function getBorderStyles(row: number, col: number) {
    return {
        borderRightWidth: (col + 1) % 3 === 0 && col !== 8 ? 2 : 0.5,
        borderBottomWidth: (row + 1) % 3 === 0 && row !== 8 ? 2 : 0.5,
        borderRightColor: (col + 1) % 3 === 0 && col !== 8 ? Colors.primary : Colors.borderSubtle,
        borderBottomColor: (row + 1) % 3 === 0 && row !== 8 ? Colors.primary : Colors.borderSubtle,
    };
}

function getCellBackground(
    cellState: CellState,
    isSelected: boolean,
    isRelated: boolean,
    isSame: boolean
) {
    if (isSelected) return { backgroundColor: Colors.selectedCell };
    if (cellState === 'error') return { backgroundColor: Colors.errorCell };
    if (isSame) return { backgroundColor: Colors.selectedCell };
    if (isRelated) return { backgroundColor: Colors.highlightCell };
    if (cellState === 'fixed') return { backgroundColor: Colors.fixedCell };
    return { backgroundColor: Colors.surface };
}

function getCellTextStyle(
    cellState: CellState,
    isSelected: boolean,
    isSame: boolean
) {
    if (cellState === 'error') return { color: Colors.error };
    if (cellState === 'fixed') return { color: Colors.text, fontWeight: '700' as const };
    if (isSelected || isSame) return { color: Colors.secondary };
    return { color: Colors.secondary };
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    grid: {
        width: GRID_SIZE,
        height: GRID_SIZE,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 4,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    cellText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
});
