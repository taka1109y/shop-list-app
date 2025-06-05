// components/SettingsMenu.tsx
import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    onOpenCategoryManager: () => void;
    onClearData: () => void;
    onOpenNotificationSettings: () => void;
};

const SettingsMenu = ({
    visible,
    onClose,
    onOpenCategoryManager,
    onClearData,
    onOpenNotificationSettings,
    }: Props) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>設定メニュー</Text>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                onOpenCategoryManager();
                onClose();
                }}
            >
                <Text style={styles.menuButtonText}>カテゴリ管理</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                onOpenNotificationSettings();
                onClose();
                }}
            >
                <Text style={styles.menuButtonText}>通知設定</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                onClearData();
                onClose();
                }}
            >
                <Text style={[styles.menuButtonText, { color: '#d32f2f' }]}>全データ削除</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
};

export default SettingsMenu;

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
    menuCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '80%' },
    menuTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
    menuButton: {
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuButtonText: { fontSize: 16, color: '#333' },
    closeButton: { marginTop: 20, alignItems: 'center' },
    closeButtonText: { color: '#888', fontSize: 15 },
});
