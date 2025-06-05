// components/SettingsMenu.tsx
import React from 'react';
import {
    Modal,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type Props = {
    visible: boolean;
    onClose: () => void;
    onOpenCategoryManager: () => void;
    onClearData: () => void;
    onOpenNotificationSettings: () => void;
};

export default function SettingsMenu({ visible, onClose, onOpenCategoryManager, onClearData }: Props) {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPressOut={onClose}>
            <View style={styles.card}>
            <Text style={styles.title}><AntDesign name="setting" size={25} color="#333" />設定</Text>

            <TouchableOpacity style={styles.item} onPress={() => {
                onClose();
                onOpenCategoryManager();
            }}>
                <Text style={styles.text}>カテゴリの管理</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={() => {
                onClose();
                onOpenNotificationSettings();
            }}>
                <Text style={styles.text}>通知設定</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={() => {
                Alert.alert('確認', 'すべて削除しますか？', [
                { text: 'キャンセル', style: 'cancel' },
                {
                    text: '削除',
                    style: 'destructive',
                    onPress: () => {
                    onClose();
                    onClearData();
                    },
                },
                ]);
            }}>
                <Text style={[styles.text, { color: 'red' }]}>全データ削除</Text>
            </TouchableOpacity>
            </View>
        </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start', paddingTop:100 },
    card: { backgroundColor: '#fff', padding: 20, marginHorizontal: 20, borderRadius: 12, elevation: 6 },
    title: { fontSize: 25, verticalAlign: 'middle', fontWeight: 'bold', marginBottom: 16 },
    item: { paddingVertical: 10 },
    text: { fontSize: 16, color: '#333' },
});
