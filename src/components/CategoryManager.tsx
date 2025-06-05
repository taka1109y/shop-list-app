// components/CategoryManager.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { AntDesign } from '@expo/vector-icons';

import type { Category } from '../App';

type Props = {
    visible: boolean;
    categories: Category[];
    onClose: () => void;
    onChange: (newCategories: Category[]) => void;
};

export default function CategoryManager({ visible, categories, onClose, onChange }: Props) {
    const [newCategory, setNewCategory] = useState('');
    const [newColor, setNewColor] = useState('#ffffff');

    const PRESET_COLORS = [
        '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9',
        '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2',
        '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3',
        '#FFF9C4', '#FFECB3', '#FFE0B2'
    ];

    const addCategory = () => {
        if (
            newCategory.trim() &&
            !categories.find((c) => c.name === newCategory.trim())
        ) {
            onChange([...categories, { name: newCategory.trim(), color: newColor }]);
            setNewCategory('');
            setNewColor('#ffffff');
        }
    };

    const removeCategory = (cat: string) => {
        if (categories.length <= 1) return;
        onChange(categories.filter((c) => c.name !== cat));
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<Category>) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                style={[styles.itemRow, isActive && styles.itemRowActive]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.itemText}>{item.name}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => removeCategory(item.name)}
                    disabled={categories.length <= 1}
                >
                    <AntDesign name="delete" size={20} color="red" />
                </TouchableOpacity>
            </TouchableOpacity>
        </ScaleDecorator>
    );

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>カテゴリ管理</Text>

                    <DraggableFlatList
                        data={categories}
                        keyExtractor={(item) => item.name}
                        renderItem={renderItem}
                        onDragEnd={({ data }) => onChange(data)}
                    />

                    <TextInput
                        placeholder="新しいカテゴリ名"
                        value={newCategory}
                        onChangeText={setNewCategory}
                        style={styles.input}
                    />

                    <View style={styles.colorGrid}>
                        {PRESET_COLORS.map((color) => {
                            const isSelected = newColor === color;
                            return (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorCircle, { backgroundColor: color }, isSelected && styles.selectedDot]}
                                    onPress={() => setNewColor(color)}
                                >
                                    {isSelected && (
                                        <AntDesign name="check" size={18} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity onPress={addCategory} style={styles.addButton}>
                        <Text style={styles.addButtonText}>追加</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelText}>閉じる</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        maxHeight: '80%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: '#f9f9f9',
        marginVertical: 4,
        borderRadius: 8,
    },
    itemRowActive: {
        backgroundColor: '#e0f7fa',
    },
    itemText: {
        fontSize: 16,
        marginLeft: 8,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
    },
    addButton: {
        backgroundColor: '#4caf50',
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelText: {
        marginTop: 16,
        textAlign: 'center',
        color: '#777',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 12,
        gap: 10,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        margin: 4,
    },
    selectedDot: {
        borderWidth: 2,
        borderColor: '#000',
    },
});
