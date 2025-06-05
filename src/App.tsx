import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

import SettingsMenu from './components/SettingsMenu';
import CategoryManager from './components/CategoryManager';
import TemplateManager, { TemplateItem } from './components/TemplateManager';
import NotificationSettingsModal from './components/NotificationSettingsModal';

const STORAGE_KEY = 'SHOPPING_LIST_DATA';

export type Category = {
  name: string;
  color: string;
};

export type Item = {
  key: string;
  label: string;
  category: string;
  quantity: number;
  added: boolean;
};

export default function App() {
  const [data, setData] = useState<Item[]>([]);
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    { name: '食品', color: '#fce4ec' },
    { name: '日用品', color: '#e3f2fd' },
    { name: '飲料', color: '#e8f5e9' },
    { name: 'その他', color: '#f3e5f5' },
  ]);
  const [category, setCategory] = useState<string>('食品');
  const [quantity, setQuantity] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editCategory, setEditCategory] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const handleAddFromTemplate = (template: TemplateItem) => {
      const existing = data.find(
        (item) => item.label === template.label && item.category === template.category && item.added === true
      );
      if (existing) {
        setData((prev) =>
          prev.map((item) =>
            item.key === existing.key
              ? { ...item, quantity: item.quantity + template.defaultQuantity }
              : item
          )
        );
      } else {
        const newItem: Item = {
          key: Date.now().toString(),
          label: template.label,
          category: template.category,
          quantity: template.defaultQuantity,
          added: true,
        };
        setData((prev) => [newItem, ...prev]);
      }
      setTemplateVisible(false);
    };

  useEffect(() => {
    const loadData = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        const saved: Item[] = json ? JSON.parse(json) : [];
        setData(
          saved.length
            ? saved
            : [
                { key: '1', label: '牛乳', category: '食品', quantity: 2, added: true },
                { key: '2', label: '卵', category: '食品', quantity: 1, added: true },
                { key: '3', label: '洗剤', category: '日用品', quantity: 3, added: true },
              ]
        );
      } catch {
        Alert.alert('エラー', 'データ読み込み失敗');
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() =>
        Alert.alert('エラー', '保存失敗')
      );
    }
  }, [data]);

  useEffect(() => {
    if (categories.length > 0) {
      setItems(categories.map((cat) => ({ label: cat.name, value: cat.name })));
      if (!categories.find((c) => c.name === category)) {
        setCategory(categories[0].name);
      }
    }
  }, [categories]);

  const toggleAdded = (key: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, added: !item.added } : item
      )
    );
  };

  const addItem = () => {
    if (!input.trim()) return;
    const newItem: Item = {
      key: Date.now().toString(),
      label: input.trim(),
      category,
      quantity,
      added: true,
    };
    setData((prev) => [newItem, ...prev]);
    setInput('');
    setQuantity(1);
    setCategory(categories[0].name);
    setModalVisible(false);
  };

  const renderCard = ({ item }: { item: Item }) => {
    const color = categories.find((c) => c.name === item.category)?.color || '#fff';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: color, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={() => toggleAdded(item.key)} // ← カード全体タップでエリア移動
        onLongPress={() => {
          Alert.alert(
            '削除しますか？',
            `"${item.label}" を削除しますか？`,
            [
              { text: 'キャンセル', style: 'cancel' },
              {
                text: '削除',
                style: 'destructive',
                onPress: () => {
                  setData((prev) => prev.filter((i) => i.key !== item.key));
                },
              },
            ]
          );
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.cardText}>
          {item.label} × {item.quantity}
        </Text>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // ← これで鉛筆押してもカードonPressは発火しない
            setEditItem(item);
            setEditQuantity(item.quantity);
            setEditCategory(item.category);
          }}
          style={{ paddingLeft: 12, paddingVertical: 6 }}
        >
          <AntDesign name="edit" size={24} color="#555" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };



  const getSectionData = (isAdded: boolean) => {
    return categories.map((cat) => ({
      title: cat.name,
      data: data.filter((item) => item.added === isAdded && item.category === cat.name),
    })).filter((section) => section.data.length > 0);
  };

  if (!isLoaded) {
    return (
      <GestureHandlerRootView style={styles.centered}>
        <Text>読み込み中...</Text>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(true)}>
          <AntDesign name="setting" size={30} color="#333" />
        </TouchableOpacity>

        <SettingsMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onOpenCategoryManager={() => setCategoryModalVisible(true)}
          onClearData={() => {
            setData([]);
            AsyncStorage.removeItem(STORAGE_KEY);
          }}
          onOpenNotificationSettings={() => setNotificationModalVisible(true)}
        />

        <CategoryManager
          visible={categoryModalVisible}
          categories={categories}
          onClose={() => setCategoryModalVisible(false)}
          onChange={(newList: Category[]) => setCategories(newList)}
        />

        <TemplateManager
          visible={templateVisible}
          onClose={() => setTemplateVisible(false)}
          categories={categories}
          onAddToList={handleAddFromTemplate}
        />

        <NotificationSettingsModal
          visible={notificationModalVisible}
          onClose={() => setNotificationModalVisible(false)}
        />

        <Image
          source={require('../assets/logo.png')}
          style={{ width: 200, height: 60, marginBottom: 20, resizeMode: 'contain', alignSelf: 'center', marginVertical: 12 }}
        />
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>候補</Text>
            <SectionList
              sections={getSectionData(true)}
              keyExtractor={(item) => item.key}
              renderItem={renderCard}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>買うもの</Text>
            <SectionList
              sections={getSectionData(false)}
              keyExtractor={(item) => item.key}
              renderItem={renderCard}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>商品を追加</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="商品名を入力"
                placeholderTextColor="#aaa"
                value={input}
                onChangeText={setInput}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: 8 }}>
                  <AntDesign name="minuscircleo" size={24} color="#555" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, marginHorizontal: 16 }}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={{ padding: 8 }}>
                  <AntDesign name="pluscircleo" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <DropDownPicker
                open={open}
                value={category}
                items={items}
                setOpen={setOpen}
                setValue={setCategory}
                setItems={setItems}
                placeholder="カテゴリを選択"
                containerStyle={{ marginBottom: open ? 200 : 16 }}
                zIndex={1000}
              />

              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Text style={styles.addButtonText}>追加する</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          animationType="slide"
          transparent
          visible={!!editItem}
          onRequestClose={() => setEditItem(null)}
        >
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>📝 編集：{editItem?.label}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setEditQuantity(Math.max(1, editQuantity - 1))} style={{ padding: 8 }}>
                  <AntDesign name="minuscircleo" size={24} color="#555" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, marginHorizontal: 16 }}>{editQuantity}</Text>
                <TouchableOpacity onPress={() => setEditQuantity(editQuantity + 1)} style={{ padding: 8 }}>
                  <AntDesign name="pluscircleo" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <DropDownPicker
                open={editOpen}
                value={editCategory}
                items={items}
                setOpen={setEditOpen}
                setValue={setEditCategory}
                setItems={setItems}
                placeholder="カテゴリを選択"
                containerStyle={{ marginBottom: editOpen ? 200 : 16 }}
                zIndex={2000}
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (!editItem) return;
                  setData(prev =>
                    prev.map(item =>
                      item.key === editItem.key
                        ? { ...item, quantity: editQuantity, category: editCategory }
                        : item
                    )
                  );
                  setEditItem(null);
                }}
              >
                <Text style={styles.addButtonText}>更新する</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditItem(null)}>
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>


        <TouchableOpacity
          style={[styles.fab, { right: 96 }]} // FABから少し左に配置
          onPress={() => setTemplateVisible(true)}
        >
          <AntDesign name="profile" size={48} color="#ffb347" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name="pluscircle" size={56} color="#4caf50" />
        </TouchableOpacity>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdfc' },
  columns: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  column: { flex: 1, padding: 5 },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
    color: '#6a6a6a',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f1f1f5',
    color: '#444',
    borderRadius: 6,
    marginHorizontal: 4,
    marginTop: 8,
  },
  card: {
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 14,
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardText: { fontSize: 16, color: '#444' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#e6f4ea',
    borderRadius: 32,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalCard: {
    backgroundColor: '#fffaf9',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#aaa',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    width: '85%',
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fefefe',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { paddingVertical: 10, alignItems: 'center' },
  cancelButtonText: { color: '#888', fontSize: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuIcon: {
    position: 'absolute',
    top: 80,
    right: 30,
    zIndex: 100,
  },
});
