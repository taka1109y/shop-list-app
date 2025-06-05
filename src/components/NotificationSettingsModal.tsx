// components/NotificationSettingsModal.tsx

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    // 必要ならここに通知のON/OFFや時刻設定などのpropsも追加
};

export default function NotificationSettingsModal({ visible, onClose }: Props) {
    return (
        <Modal
        transparent
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        >
        <View style={styles.overlay}>
            <View style={styles.card}>
            <Text style={styles.title}>通知設定</Text>
            {/* ここに通知ON/OFFスイッチや時間設定UIなどを配置 */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={{ color: '#888', fontSize: 16 }}>閉じる</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center'
    },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%'
    },
    title: {
        fontWeight: 'bold', fontSize: 20, marginBottom: 20
    },
    closeButton: {
        marginTop: 16, alignItems: 'center'
    }
});
