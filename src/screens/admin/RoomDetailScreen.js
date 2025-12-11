import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomModel } from '../../models/RoomModel';
import { MenuModel } from '../../models/MenuModel';

export default function RoomDetailScreen({ route, navigation }) {
  const { room } = route.params;
  
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [sessionId, setSessionId] = useState(room.session_id || `SESSION_${Date.now()}_${room.id}`);
  const [startTime] = useState(room.start_time || new Date().toISOString());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'apps' },
    { id: 'do-an', name: 'Đồ ăn', icon: 'fast-food' },
    { id: 'do-uong', name: 'Đồ uống', icon: 'beer' },
    { id: 'trai-cay', name: 'Trái cây', icon: 'leaf' },
    { id: 'bia-ruou', name: 'Bia rượu', icon: 'wine' },
    { id: 'snack', name: 'Snack', icon: 'pizza' }
  ];

  useEffect(() => {
    loadOrders();
    loadMenu();
    
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    try {
      const data = RoomModel.getOrdersBySession(sessionId);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadMenu = () => {
    try {
      const data = MenuModel.findAll();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const calculateDuration = () => {
    const start = new Date(startTime);
    const diff = currentTime - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, totalHours: diff / (1000 * 60 * 60) };
  };

  const calculateTotal = () => {
    const duration = calculateDuration();
    const roomCharge = Math.ceil(duration.totalHours) * room.price_per_hour;
    const foodCharge = orders.reduce((sum, order) => sum + order.total, 0);
    return {
      roomCharge,
      foodCharge,
      total: roomCharge + foodCharge
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (seconds) => {
    return seconds.toString().padStart(2, '0');
  };

  const handleAddOrder = (menuItem) => {
    Alert.alert(
      'Xác nhận order',
      `Thêm "${menuItem.name}" vào phòng ${room.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: () => {
            try {
              RoomModel.addOrder({
                roomId: room.id,
                sessionId,
                menuItemId: menuItem.id,
                menuItemName: menuItem.name,
                quantity: 1,
                price: menuItem.price
              });
              loadOrders();
              Alert.alert('Thành công', `Đã thêm ${menuItem.name}`);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thêm order');
            }
          }
        }
      ]
    );
  };

  const handleDeleteOrder = (order) => {
    Alert.alert(
      'Xác nhận xóa',
      `Xóa "${order.menu_item_name}" khỏi đơn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            try {
              RoomModel.deleteOrder(order.id);
              loadOrders();
              Alert.alert('Thành công', 'Đã xóa order');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa order');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    Alert.alert(
      'Kết thúc và thanh toán',
      'Bạn có chắc muốn kết thúc phiên và tạo hóa đơn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Kết thúc',
          onPress: () => {
            const duration = calculateDuration();
            const totals = calculateTotal();
            
            navigation.navigate('Invoice', {
              room,
              sessionId,
              startTime,
              endTime: new Date().toISOString(),
              duration: duration.totalHours,
              orders,
              roomCharge: totals.roomCharge,
              foodCharge: totals.foodCharge,
              totalAmount: totals.total
            });
          }
        }
      ]
    );
  };

  const filteredMenu = menuItems.filter(item => {
    if (selectedCategory === 'all') return item.is_available;
    return item.category === selectedCategory && item.is_available;
  });

  const duration = calculateDuration();
  const totals = calculateTotal();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{room.name}</Text>
          <Text style={styles.headerSubtitle}>{room.customer_name}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Timer Card */}
      <View style={styles.timerCard}>
        <View style={styles.timerIcon}>
          <Ionicons name="time" size={32} color="#EF4444" />
        </View>
        <View style={styles.timerContent}>
          <Text style={styles.timerLabel}>Thời gian sử dụng</Text>
          <View style={styles.timerDisplay}>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{formatTime(duration.hours)}</Text>
              <Text style={styles.timerUnit}>Giờ</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{formatTime(duration.minutes)}</Text>
              <Text style={styles.timerUnit}>Phút</Text>
            </View>
            <Text style={styles.timerColon}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{formatTime(duration.seconds)}</Text>
              <Text style={styles.timerUnit}>Giây</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn hàng ({orders.length})</Text>
            <TouchableOpacity
              style={styles.addOrderButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle" size={20} color="#0A1E42" />
              <Text style={styles.addOrderText}>Thêm món</Text>
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Ionicons name="fast-food-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có order nào</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.emptyButtonText}>Thêm món đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderIcon}>
                    <Ionicons name="restaurant" size={20} color="#10B981" />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName}>{order.menu_item_name}</Text>
                    <Text style={styles.orderPrice}>
                      {order.quantity} x {formatPrice(order.price)}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteOrder(order)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng cộng</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền phòng ({Math.ceil(duration.totalHours)} giờ)</Text>
            <Text style={styles.summaryValue}>{formatPrice(totals.roomCharge)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đồ ăn & nước ({orders.length} món)</Text>
            <Text style={styles.summaryValue}>{formatPrice(totals.foodCharge)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.checkoutButtonText}>Kết thúc & Thanh toán</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm món</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={selectedCategory === cat.id ? '#0A1E42' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.id && styles.categoryTextActive
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Menu Items */}
            <FlatList
              data={filteredMenu}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyMenu}>
                  <Ionicons name="restaurant-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>Không có món nào</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    handleAddOrder(item);
                    setModalVisible(false);
                  }}
                >
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.menuImage} />
                  ) : (
                    <View style={styles.menuImagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#CBD5E1" />
                    </View>
                  )}
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.menuItemDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={styles.menuItemPrice}>{formatPrice(item.price)}</Text>
                  </View>
                  <Ionicons name="add-circle" size={28} color="#10B981" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1E42',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timerContent: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBox: {
    alignItems: 'center',
  },
  timerNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A1E42',
  },
  timerUnit: {
    fontSize: 11,
    color: '#64748B',
    marginTop: -4,
  },
  timerColon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#CBD5E1',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
  },
  addOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addOrderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1E42',
  },
  emptyOrders: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#0A1E42',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  ordersList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 13,
    color: '#64748B',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 100,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
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
  categoriesScroll: {
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#EFF6FF',
  },
  categoryText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0A1E42',
    fontWeight: '600',
  },
  emptyMenu: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  menuImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});