import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

const TEMPLATE_KEY = 'TEMPLATE_DATA';

export type TemplateItem = {
    id: string;
    label: string;
    category: string;
    defaultQuantity: number;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    categories: { name: string }[];
    onAddToList: (item: TemplateItem) => void;
};

export default function TemplateManager({ visible, onClose, categories, onAddToList }: Props) {
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [label, setLabel] = useState('');
    const [category, setCategory] = useState(categories[0]?.name || '');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (visible) loadTemplates();
    }, [visible]);

    const loadTemplates = async () => {
        try {
        const json = await AsyncStorage.getItem(TEMPLATE_KEY);
        const saved: TemplateItem[] = json ? JSON.parse(json) : [];
        setTemplates(saved);
        } catch {
        Alert.alert('エラー', 'テンプレートの読み込みに失敗しました');
        }
    };

    const saveTemplates = async (newTemplates: TemplateItem[]) => {
        try {
        await AsyncStorage.setItem(TEMPLATE_KEY, JSON.stringify(newTemplates));
        setTemplates(newTemplates);
        } catch {
        Alert.alert('エラー', 'テンプレートの保存に失敗しました');
        }
    };

    const addTemplate = () => {
        if (!label.trim()) return;
        const newTemplate: TemplateItem = {
        id: Date.now().toString(),
        label: label.trim(),
        category,
        defaultQuantity: quantity,
        };
        const updated = [newTemplate, ...templates];
        saveTemplates(updated);
        setLabel('');
        setQuantity(1);
        setCategory(categories[0]?.name || '');
    };

    const deleteTemplate = (id: string) => {
        Alert.alert('削除しますか？', 'このテンプレートを削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
            text: '削除', style: 'destructive', onPress: () => {
            const updated = templates.filter(t => t.id !== id);
            saveTemplates(updated);
            }
        }
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.card}>
            <Text style={styles.title}>📋 商品テンプレート</Text>

            <View style={styles.inputRow}>
                <TextInput
                placeholder="商品名"
                value={label}
                onChangeText={setLabel}
                style={styles.input}
                />
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}><AntDesign name="minuscircleo" size={20} /></TouchableOpacity>
                <Text style={{ marginHorizontal: 8 }}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}><AntDesign name="pluscircleo" size={20} /></TouchableOpacity>
            </View>

            <View style={styles.categoryRow}>
                {categories.map(cat => (
                <TouchableOpacity
                    key={cat.name}
                    onPress={() => setCategory(cat.name)}
                    style={[styles.catBtn, category === cat.name && styles.catBtnSelected]}
                >
                    <Text style={styles.catText}>{cat.name}</Text>
                </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addTemplate}>
                <Text style={styles.addButtonText}>＋ 登録</Text>
            </TouchableOpacity>

            <FlatList
                data={templates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.templateItem}
                    onPress={() => onAddToList(item)}
                    onLongPress={() => deleteTemplate(item.id)}
                >
                    <Text style={styles.text}>{item.label}（{item.category}）×{item.defaultQuantity}</Text>
                </TouchableOpacity>
                )}
                style={{ marginTop: 10 }}
            />

            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>閉じる</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fffaf9', borderRadius: 16, padding: 20, width: '85%' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#444' },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, marginRight: 8, backgroundColor: '#fff' },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    catBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eee', borderRadius: 8, margin: 4 },
    catBtnSelected: { backgroundColor: '#a8dadc' },
    catText: { fontSize: 14 },
    addButton: { backgroundColor: '#4caf50', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
    addButtonText: { color: '#fff', fontSize: 16 },
    templateItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
    text: { fontSize: 16 },
    cancelButton: { paddingVertical: 10, alignItems: 'center' },
    cancelButtonText: { color: '#888', fontSize: 14 },
});
