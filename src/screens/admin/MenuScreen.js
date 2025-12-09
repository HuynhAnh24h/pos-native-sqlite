import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../layouts/AdminLayout';
import { MenuModel } from '../../models/MenuModel';
import * as ImagePicker from 'expo-image-picker';

export default function MenuScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    isAvailable: 1
  });

  // Default categories cho karaoke
  const defaultCategories = [
    { id: 'all', name: 'Tất cả', icon: 'apps' },
    { id: 'do-an', name: 'Đồ ăn', icon: 'fast-food' },
    { id: 'do-uong', name: 'Đồ uống', icon: 'beer' },
    { id: 'trai-cay', name: 'Trái cây', icon: 'leaf' },
    { id: 'bia-ruou', name: 'Bia rượu', icon: 'wine' },
    { id: 'snack', name: 'Snack', icon: 'pizza' },
    { id: 'khac', name: 'Khác', icon: 'ellipsis-horizontal' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const items = MenuModel.findAll();
      setMenuItems(items);
      setCategories(defaultCategories);
    } catch (error) {
      console.error('Error loading menu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu menu');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'do-an',
      imageUrl: '',
      isAvailable: 1
    });
    setModalVisible(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.image_url || '',
      isAvailable: item.is_available
    });
    setModalVisible(true);
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            try {
              MenuModel.delete(item.id);
              loadData();
              Alert.alert('Thành công', 'Đã xóa món thành công');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa món');
            }
          }
        }
      ]
    );
  };

  const handleSaveItem = () => {
    if (!formData.name.trim() || !formData.price) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên và giá');
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl,
        isAvailable: formData.isAvailable
      };

      if (editingItem) {
        MenuModel.update(editingItem.id, data);
        Alert.alert('Thành công', 'Đã cập nhật món');
      } else {
        MenuModel.create(data);
        Alert.alert('Thành công', 'Đã thêm món mới');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu món');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, imageUrl: result.assets[0].uri });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <AdminLayout navigation={navigation} activeRoute="Products">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Quản lý Menu</Text>
            <Text style={styles.pageSubtitle}>
              {filteredItems.length} món · {categories.length - 1} danh mục
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Thêm món</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm món..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={18}
                color={selectedCategory === category.id ? '#0A1E42' : '#64748B'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Grid */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có món nào</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddItem}>
                <Text style={styles.emptyButtonText}>Thêm món đầu tiên</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.menuCard}>
              {/* Image */}
              <View style={styles.imageContainer}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.menuImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                  </View>
                )}
                <View style={styles.statusBadge}>
                  <View style={[
                    styles.statusDot,
                    item.is_available ? styles.statusAvailable : styles.statusUnavailable
                  ]} />
                </View>
              </View>

              {/* Info */}
              <View style={styles.menuInfo}>
                <Text style={styles.menuName} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={styles.menuDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <Text style={styles.menuPrice}>{formatPrice(item.price)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.menuActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditItem(item)}
                >
                  <Ionicons name="create-outline" size={18} color="#0A1E42" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteItem(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Add/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? 'Chỉnh sửa món' : 'Thêm món mới'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Image Picker */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {formData.imageUrl ? (
                    <Image source={{ uri: formData.imageUrl }} style={styles.pickedImage} />
                  ) : (
                    <View style={styles.imagePickerEmpty}>
                      <Ionicons name="camera" size={32} color="#64748B" />
                      <Text style={styles.imagePickerText}>Chọn ảnh</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tên món *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nhập tên món"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mô tả</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Nhập mô tả món"
                    multiline
                    numberOfLines={3}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />
                </View>

                {/* Price */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Giá *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nhập giá"
                    keyboardType="numeric"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                  />
                </View>

                {/* Category */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Danh mục *</Text>
                  <View style={styles.categoryGrid}>
                    {defaultCategories.filter(c => c.id !== 'all').map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryOption,
                          formData.category === cat.id && styles.categoryOptionActive
                        ]}
                        onPress={() => setFormData({ ...formData, category: cat.id })}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={20}
                          color={formData.category === cat.id ? '#0A1E42' : '#64748B'}
                        />
                        <Text
                          style={[
                            styles.categoryOptionText,
                            formData.category === cat.id && styles.categoryOptionTextActive
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Availability */}
                <View style={styles.formGroup}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFormData({
                      ...formData,
                      isAvailable: formData.isAvailable ? 0 : 1
                    })}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.isAvailable && styles.checkboxActive
                    ]}>
                      {formData.isAvailable && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Còn hàng</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveItem}
                >
                  <Text style={styles.saveButtonText}>
                    {editingItem ? 'Cập nhật' : 'Thêm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1E42',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0A1E42',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0A1E42',
    fontWeight: '600',
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  menuCard: {
    width: '31.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: '2.5%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
  },
  menuImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusAvailable: {
    backgroundColor: '#10B981',
  },
  statusUnavailable: {
    backgroundColor: '#EF4444',
  },
  menuInfo: {
    padding: 12,
  },
  menuName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
  },
  menuActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0A1E42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1E42',
  },
  modalBody: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryOption: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0A1E42',
  },
  categoryOptionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#0A1E42',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#0A1E42',
    borderColor: '#0A1E42',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: '#0A1E42',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});