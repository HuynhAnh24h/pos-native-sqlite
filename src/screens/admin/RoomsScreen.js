import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../layouts/AdminLayout';
import { RoomModel } from '../../models/RoomModel';

export default function RoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    pricePerHour: ''
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    try {
      const data = RoomModel.findAll();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng');
    }
  };

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setFormData({ name: '', pricePerHour: '' });
    setModalVisible(true);
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      pricePerHour: room.price_per_hour.toString()
    });
    setModalVisible(true);
  };

  const handleSaveRoom = () => {
    if (!formData.name.trim() || !formData.pricePerHour) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        pricePerHour: parseFloat(formData.pricePerHour)
      };

      if (selectedRoom) {
        RoomModel.update(selectedRoom.id, data);
        Alert.alert('Thành công', 'Đã cập nhật phòng');
      } else {
        RoomModel.create(data);
        Alert.alert('Thành công', 'Đã thêm phòng mới');
      }

      setModalVisible(false);
      loadRooms();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu phòng');
    }
  };

  const handleDeleteRoom = (room) => {
    if (room.status === 'occupied') {
      Alert.alert('Cảnh báo', 'Không thể xóa phòng đang được sử dụng');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa phòng "${room.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            try {
              RoomModel.delete(room.id);
              loadRooms();
              Alert.alert('Thành công', 'Đã xóa phòng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa phòng');
            }
          }
        }
      ]
    );
  };

  const handleRoomClick = (room) => {
    if (room.status === 'available') {
      // Phòng trống -> Cho khách check-in
      navigation.navigate('RoomCheckIn', { room });
    } else {
      // Phòng đang sử dụng -> Xem chi tiết và order
      navigation.navigate('RoomDetail', { room });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    return status === 'available' ? '#10B981' : '#EF4444';
  };

  const getStatusText = (status) => {
    return status === 'available' ? 'Trống' : 'Đang sử dụng';
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.roomCard,
        item.status === 'occupied' && styles.roomCardOccupied
      ]}
      onPress={() => handleRoomClick(item)}
      activeOpacity={0.7}
    >
      {/* Status Indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />

      {/* Room Icon */}
      <View style={[
        styles.roomIcon,
        item.status === 'occupied' && styles.roomIconOccupied
      ]}>
        <Ionicons
          name="musical-notes"
          size={32}
          color={item.status === 'available' ? '#10B981' : '#fff'}
        />
      </View>

      {/* Room Info */}
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomPrice}>{formatPrice(item.price_per_hour)}/giờ</Text>
        
        {item.status === 'occupied' && (
          <View style={styles.customerInfo}>
            <Ionicons name="person" size={14} color="#64748B" />
            <Text style={styles.customerName}>{item.customer_name}</Text>
          </View>
        )}
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      {item.status === 'available' && (
        <View style={styles.roomActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleEditRoom(item);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#0A1E42" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteRoom(item);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;

  return (
    <AdminLayout navigation={navigation} activeRoute="Rooms">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Quản lý phòng hát</Text>
            <Text style={styles.pageSubtitle}>
              {rooms.length} phòng · {availableRooms} trống · {occupiedRooms} đang sử dụng
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Thêm phòng</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{availableRooms}</Text>
              <Text style={styles.statLabel}>Phòng trống</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
            <Ionicons name="musical-note" size={24} color="#EF4444" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{occupiedRooms}</Text>
              <Text style={styles.statLabel}>Đang sử dụng</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#0A1E42' }]}>
            <Ionicons name="albums" size={24} color="#0A1E42" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{rooms.length}</Text>
              <Text style={styles.statLabel}>Tổng phòng</Text>
            </View>
          </View>
        </View>

        {/* Rooms Grid */}
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có phòng nào</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddRoom}>
                <Text style={styles.emptyButtonText}>Thêm phòng đầu tiên</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={renderRoom}
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
                  {selectedRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tên phòng *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Phòng VIP 01"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Giá thuê/giờ (VNĐ) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: 150000"
                    keyboardType="numeric"
                    value={formData.pricePerHour}
                    onChangeText={(text) => setFormData({ ...formData, pricePerHour: text })}
                  />
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
                  onPress={handleSaveRoom}
                >
                  <Text style={styles.saveButtonText}>
                    {selectedRoom ? 'Cập nhật' : 'Thêm'}
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1E42',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  roomCard: {
    width: '31.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: '2.5%',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  roomCardOccupied: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  roomIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  roomIconOccupied: {
    backgroundColor: '#EF4444',
  },
  roomInfo: {
    padding: 16,
    paddingTop: 0,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
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
    maxWidth: 500,
    maxHeight: '80%',
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