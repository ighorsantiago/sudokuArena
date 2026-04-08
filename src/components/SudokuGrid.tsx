import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes } from '../constants/theme';
import { CellState, Notes } from '../hooks/useSudoku';
import { Board } from '../utils/sudoku';

const { width } = Dimensions.get('window');
const GRID_SIZE = width - 32;
const CELL_SIZE = GRID_SIZE / 9;

interface SudokuGridProps {
    board: Board;
    notes: Notes;
    selectedCell: { row: number; col: number } | null;
    getCellState: (row: number, col: number) => CellState;
    isRelatedCell: (row: number, col: number) => boolean;
    isSameNumber: (row: number, col: number) => boolean;
    onSelectCell: (row: number, col: number) => void;
}

export function SudokuGrid({
    board,
    notes,
    selectedCell,
    getCellState,
    isRelatedCell,
    isSameNumber,
    onSelectCell,
}: SudokuGridProps) {
    return (
        <View style={styles.grid}>
            {board.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    style={[
                        styles.row,
                        rowIndex === 2 || rowIndex === 5
                            ? styles.rowBorderBlock
                            : styles.rowBorderNormal,
                    ]}
                >
                    {row.map((value, colIndex) => {
                        const cellState = getCellState(rowIndex, colIndex);
                        const isSelected =
                            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                        const isRelated = isRelatedCell(rowIndex, colIndex);
                        const isSame = isSameNumber(rowIndex, colIndex);
                        const cellNotes = notes[rowIndex][colIndex];
                        const hasNotes = cellNotes.size > 0 && value === null;

                        return (
                            <TouchableOpacity
                                key={colIndex}
                                style={[
                                    styles.cell,
                                    colIndex === 2 || colIndex === 5
                                        ? styles.cellBorderBlock
                                        : styles.cellBorderNormal,
                                    getCellBackground(cellState, isSelected, isRelated, isSame),
                                ]}
                                onPress={() => onSelectCell(rowIndex, colIndex)}
                                activeOpacity={0.7}
                            >
                                {hasNotes ? (
                                    <NoteGrid notes={cellNotes} isSelected={isSelected} />
                                ) : (
                                    <Text
                                        style={[
                                            styles.cellText,
                                            getCellTextStyle(cellState, isSelected, isSame),
                                        ]}
                                    >
                                        {value !== null ? value : ''}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

// ─── Mini grade de anotações 3x3 ─────────────────────────────────────────────

function NoteGrid({ notes, isSelected }: { notes: Set<number>; isSelected: boolean }) {
    const rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    return (
        <View style={styles.noteGrid}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.noteRow}>
                    {row.map(n => (
                        <View key={n} style={styles.noteCell}>
                            {notes.has(n) && (
                                <Text style={[styles.noteText, isSelected && styles.noteTextSelected]}>
                                    {n}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

// ─── Estilos dinâmicos ────────────────────────────────────────────────────────

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
    if (cellState === 'hint') return { backgroundColor: Colors.hintCell };
    if (cellState === 'fixed') return { backgroundColor: Colors.fixedCell };
    return { backgroundColor: Colors.surface };
}

function getCellTextStyle(
    cellState: CellState,
    isSelected: boolean,
    isSame: boolean
) {
    if (cellState === 'error') return { color: Colors.error };
    if (cellState === 'hint') return { color: Colors.primary, fontWeight: '700' as const };
    if (cellState === 'fixed') return { color: Colors.text, fontWeight: '700' as const };
    if (isSelected || isSame) return { color: Colors.secondary };
    return { color: Colors.secondary };
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    grid: {
        width: GRID_SIZE,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 4,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
    },
    rowBorderBlock: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
    },
    rowBorderNormal: {
        borderBottomWidth: 1,
        borderBottomColor: '#3A3D55',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellBorderBlock: {
        borderRightWidth: 2,
        borderRightColor: Colors.primary,
    },
    cellBorderNormal: {
        borderRightWidth: 1,
        borderRightColor: '#3A3D55',
    },
    cellText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },

    // Anotações
    noteGrid: {
        width: CELL_SIZE - 2,
        height: CELL_SIZE - 2,
        flexDirection: 'column',
    },
    noteRow: {
        flex: 1,
        flexDirection: 'row',
    },
    noteCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteText: {
        fontSize: 9,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    noteTextSelected: {
        color: Colors.secondary,
    },
});
