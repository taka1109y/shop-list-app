import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
    visible: boolean;
    onClose: () => void;
    notificationEnabled: boolean;
    notificationTime: Date;
    onChangeEnabled: (val: boolean) => void;
    onChangeTime: (date: Date) => void;
};

export default function NotificationSettingsModal({
    visible,
    onClose,
    notificationEnabled,
    notificationTime,
    onChangeEnabled,
    onChangeTime,
}: Props) {
    // ← pickerVisibleのuseState追加
    const [pickerVisible, setPickerVisible] = useState(false);

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>通知設定</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 16, marginRight: 12 }}>通知ON</Text>
                        <Switch
                            value={notificationEnabled}
                            onValueChange={onChangeEnabled}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => setPickerVisible(true)}
                        style={styles.timeButton}
                        disabled={!notificationEnabled}
                    >
                        <Text style={{ fontSize: 16 }}>
                            通知時刻：{notificationTime.getHours().toString().padStart(2, '0')}
                            :{notificationTime.getMinutes().toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                    {pickerVisible && (
                        <DateTimePicker
                            value={notificationTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(e, date) => {
                                setPickerVisible(false);
                                if (date) onChangeTime(date);
                            }}
                        />
                    )}
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
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '80%'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 20
    },
    closeButton: {
        marginTop: 16,
        alignItems: 'center'
    },
    timeButton: {
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 8,
        marginBottom: 8
    }
});
