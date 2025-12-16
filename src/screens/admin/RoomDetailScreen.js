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
  const [currentSession, setCurrentSession] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Quantity selector modal
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'apps' },
    { id: 'do-an', name: 'Đồ ăn', icon: 'fast-food' },
    { id: 'do-uong', name: 'Đồ uống', icon: 'beer' },
    { id: 'trai-cay', name: 'Trái cây', icon: 'leaf' },
    { id: 'bia-ruou', name: 'Bia rượu', icon: 'wine' },
    { id: 'snack', name: 'Snack', icon: 'pizza' }
  ];

  useEffect(() => {
    initializeSession();
    loadMenu();
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeSession = () => {
    try {
      if (room.session_id) {
        const session = {
          sessionId: room.session_id,
          startTime: room.start_time,
          customerName: room.customer_name,
          customerPhone: room.customer_phone
        };
        setCurrentSession(session);
        loadOrders(room.session_id);
        return;
      }

      const existingSession = RoomModel.getCurrentSession(room.id);
      
      if (existingSession) {
        setCurrentSession(existingSession);
        loadOrders(existingSession.sessionId);
      } else {
        Alert.alert(
          'Lỗi',
          'Không tìm thấy phiên làm việc. Vui lòng check-in lại.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo phiên làm việc');
    }
  };

  const loadOrders = (sessionId) => {
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
    if (!currentSession) {
      return { hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }

    const start = new Date(currentSession.startTime);
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

  // Mở modal chọn số lượng
  const handleSelectMenuItem = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setSelectedQuantity(1);
    setModalVisible(false);
    setQuantityModalVisible(true);
  };

  // Xác nhận thêm order với số lượng
  const handleConfirmAddOrder = () => {
    if (!currentSession || !selectedMenuItem) return;

    try {
      RoomModel.addOrder({
        roomId: room.id,
        sessionId: currentSession.sessionId,
        menuItemId: selectedMenuItem.id,
        menuItemName: selectedMenuItem.name,
        quantity: selectedQuantity,
        price: selectedMenuItem.price
      });
      
      loadOrders(currentSession.sessionId);
      setQuantityModalVisible(false);
      Alert.alert('Thành công', `Đã thêm ${selectedQuantity} ${selectedMenuItem.name}`);
    } catch (error) {
      console.error('Add order error:', error);
      Alert.alert('Lỗi', 'Không thể thêm order');
    }
  };

  // Tăng/giảm số lượng trong order
  const handleUpdateOrderQuantity = (order, change) => {
    const newQuantity = order.quantity + change;
    
    if (newQuantity <= 0) {
      handleDeleteOrder(order);
      return;
    }

    try {
      RoomModel.updateOrderQuantity(order.id, newQuantity);
      loadOrders(currentSession.sessionId);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
    }
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
              loadOrders(currentSession.sessionId);
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
    if (!currentSession) {
      Alert.alert('Lỗi', 'Không có phiên làm việc');
      return;
    }

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
              sessionId: currentSession.sessionId,
              startTime: currentSession.startTime,
              endTime: new Date().toISOString(),
              duration: duration.totalHours,
              orders,
              roomCharge: totals.roomCharge,
              foodCharge: totals.foodCharge,
              totalAmount: totals.total,
              customerName: currentSession.customerName,
              customerPhone: currentSession.customerPhone
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

  if (!currentSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải phiên làm việc...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerSubtitle}>{currentSession.customerName}</Text>
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

      {/* Content - Replace ScrollView with FlatList */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
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
          </View>
        )}
        ListEmptyComponent={() => (
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
        )}
        renderItem={({ item: order }) => (
          <View style={styles.orderItem}>
            <View style={styles.orderIcon}>
              <Ionicons name="restaurant" size={20} color="#10B981" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderName}>{order.menu_item_name}</Text>
              <Text style={styles.orderPrice}>
                {formatPrice(order.price)} x {order.quantity}
              </Text>
            </View>
            
            {/* Quantity Controls */}
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateOrderQuantity(order, -1)}
              >
                <Ionicons name="remove" size={16} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{order.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateOrderQuantity(order, 1)}
              >
                <Ionicons name="add" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteOrder(order)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
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
        )}
      />

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
                  onPress={() => handleSelectMenuItem(item)}
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

      {/* Quantity Modal */}
      <Modal
        visible={quantityModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.quantityModalOverlay}>
          <View style={styles.quantityModalContent}>
            <Text style={styles.quantityModalTitle}>Chọn số lượng</Text>
            
            {selectedMenuItem && (
              <>
                <View style={styles.selectedItemInfo}>
                  <Text style={styles.selectedItemName}>{selectedMenuItem.name}</Text>
                  <Text style={styles.selectedItemPrice}>
                    {formatPrice(selectedMenuItem.price)}
                  </Text>
                </View>

                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantitySelectorButton}
                    onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  >
                    <Ionicons name="remove" size={24} color="#0A1E42" />
                  </TouchableOpacity>
                  
                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityNumber}>{selectedQuantity}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.quantitySelectorButton}
                    onPress={() => setSelectedQuantity(selectedQuantity + 1)}
                  >
                    <Ionicons name="add" size={24} color="#0A1E42" />
                  </TouchableOpacity>
                </View>

                <View style={styles.totalPreview}>
                  <Text style={styles.totalPreviewLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalPreviewValue}>
                    {formatPrice(selectedMenuItem.price * selectedQuantity)}
                  </Text>
                </View>

                <View style={styles.quantityModalActions}>
                  <TouchableOpacity
                    style={[styles.quantityModalButton, styles.cancelModalButton]}
                    onPress={() => setQuantityModalVisible(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.quantityModalButton, styles.confirmModalButton]}
                    onPress={handleConfirmAddOrder}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.confirmModalButtonText}>Thêm vào đơn</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
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
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
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
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 12,
    minWidth: 80,
    textAlign: 'right',
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
  // Quantity Modal Styles
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quantityModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  quantityModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedItemInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectedItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  selectedItemPrice: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quantitySelectorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A1E42',
  },
  quantityDisplay: {
    marginHorizontal: 32,
    minWidth: 60,
    alignItems: 'center',
  },
  quantityNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0A1E42',
  },
  totalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  totalPreviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  totalPreviewValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  quantityModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityModalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelModalButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmModalButton: {
    backgroundColor: '#10B981',
  },
  confirmModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});