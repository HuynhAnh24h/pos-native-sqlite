import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { RoomModel } from '../../models/RoomModel';

export default function InvoiceScreen({ route, navigation }) {
  const {
    room,
    sessionId,
    startTime,
    endTime,
    duration,
    orders,
    roomCharge,
    foodCharge,
    totalAmount,
    customerName,
    customerPhone
  } = route.params;

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h} giờ ${m} phút`;
  };

  const generateQRContent = () => {
    // Format QR cho VietQR
    if (bankName && accountNumber && accountName) {
      return JSON.stringify({
        bankName,
        accountNumber,
        accountName,
        amount: totalAmount,
        description: `Thanh toan phong ${room.name} - ${customerName}`
      });
    }
    return `Thanh toan ${formatPrice(totalAmount)} - Phong ${room.name}`;
  };

  const handleSaveQRSettings = () => {
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setSettingsModalVisible(false);
    Alert.alert('Thành công', 'Đã lưu thông tin thanh toán');
  };

  const handleShowQR = () => {
    if (!bankName || !accountNumber || !accountName) {
      Alert.alert(
        'Thiết lập thanh toán',
        'Bạn cần thiết lập thông tin tài khoản ngân hàng trước',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thiết lập', onPress: () => setSettingsModalVisible(true) }
        ]
      );
      return;
    }
    setQrCode(generateQRContent());
    setQrModalVisible(true);
  };

  const handleConfirmPayment = (paymentMethod = 'cash') => {
    Alert.alert(
      'Xác nhận thanh toán',
      `Xác nhận đã nhận ${formatPrice(totalAmount)} từ khách hàng?`,
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Đã nhận',
          onPress: () => {
            handleCompletePayment(paymentMethod);
          }
        }
      ]
    );
  };

  const handleCompletePayment = (paymentMethod) => {
    Alert.alert(
      'Hoàn tất',
      'Bạn có muốn lưu hóa đơn và trả phòng?',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Hoàn tất',
          onPress: async () => {
            try {
              // Tạo hóa đơn với đầy đủ thông tin
              const invoice = RoomModel.createInvoice({
                sessionId,
                roomId: room.id,
                roomName: room.name,
                customerName: customerName || room.customer_name || 'Khách',
                customerPhone: customerPhone || room.customer_phone || '',
                startTime,
                endTime,
                durationHours: duration,
                roomCharge,
                foodCharge,
                totalAmount,
                paymentMethod: paymentMethod
              });

              console.log('Invoice created:', invoice);

              // Check-out phòng (xóa session_id, reset về available)
              RoomModel.checkOut(room.id);

              Alert.alert(
                'Thành công',
                'Đã lưu hóa đơn và trả phòng thành công',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reset navigation về màn hình Rooms
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Rooms' }],
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Payment error:', error);
              Alert.alert('Lỗi', 'Không thể hoàn tất thanh toán. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const invoiceNumber = `INV${Date.now()}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0A1E42" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Hóa đơn thanh toán</Text>
          <Text style={styles.headerSubtitle}>#{invoiceNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#0A1E42" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Card */}
        <View style={styles.invoiceCard}>
          {/* Logo/Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="musical-note" size={32} color="#fff" />
            </View>
            <Text style={styles.brandName}>Karaoke Management</Text>
            <Text style={styles.brandSlogan}>Hệ thống quản lý chuyên nghiệp</Text>
          </View>

          <View style={styles.divider} />

          {/* Customer Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Thông tin khách hàng</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={18} color="#64748B" />
              <Text style={styles.infoText}>{customerName || room.customer_name || 'Khách'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={18} color="#64748B" />
              <Text style={styles.infoText}>{customerPhone || room.customer_phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="musical-notes" size={18} color="#64748B" />
              <Text style={styles.infoText}>{room.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Time Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Thời gian sử dụng</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Bắt đầu</Text>
                <Text style={styles.timeValue}>{formatDateTime(startTime)}</Text>
              </View>
              <View style={styles.timeArrow}>
                <Ionicons name="arrow-forward" size={20} color="#64748B" />
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Kết thúc</Text>
                <Text style={styles.timeValue}>{formatDateTime(endTime)}</Text>
              </View>
            </View>
            <View style={styles.durationBox}>
              <Ionicons name="time" size={20} color="#10B981" />
              <Text style={styles.durationText}>
                Tổng thời gian: {formatDuration(duration)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Orders */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Chi tiết đơn hàng</Text>
            
            {/* Room Charge */}
            <View style={styles.orderItem}>
              <View style={styles.orderLeft}>
                <Text style={styles.orderName}>Tiền phòng</Text>
                <Text style={styles.orderDetail}>
                  {Math.ceil(duration)} giờ x {formatPrice(room.price_per_hour)}
                </Text>
              </View>
              <Text style={styles.orderPrice}>{formatPrice(roomCharge)}</Text>
            </View>

            {/* Food Orders */}
            {orders.length > 0 && (
              <>
                <View style={styles.foodHeader}>
                  <Ionicons name="restaurant" size={16} color="#64748B" />
                  <Text style={styles.foodHeaderText}>Đồ ăn & Nước uống</Text>
                </View>
                {orders.map((order) => (
                  <View key={order.id} style={styles.orderItem}>
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderName}>{order.menu_item_name}</Text>
                      <Text style={styles.orderDetail}>
                        {order.quantity} x {formatPrice(order.price)}
                      </Text>
                    </View>
                    <Text style={styles.orderPrice}>{formatPrice(order.total)}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          <View style={styles.divider} />

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tiền phòng</Text>
              <Text style={styles.summaryValue}>{formatPrice(roomCharge)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đồ ăn & Nước uống</Text>
              <Text style={styles.summaryValue}>{formatPrice(foodCharge)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleShowQR}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="qr-code" size={24} color="#0A1E42" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Chuyển khoản QR</Text>
              <Text style={styles.paymentDesc}>Quét mã QR để thanh toán</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.orDivider}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>HOẶC</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => handleConfirmPayment('cash')}
          >
            <View style={[styles.paymentIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="cash" size={24} color="#10B981" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Tiền mặt</Text>
              <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#64748B" />
          <Text style={styles.cancelButtonText}>Quay lại</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => handleConfirmPayment('cash')}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.confirmButtonText}>Xác nhận đã thanh toán</Text>
        </TouchableOpacity>
      </View>

      {/* QR Modal */}
      <Modal
        visible={qrModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Quét mã QR để thanh toán</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <QRCode
                value={qrCode || 'PAYMENT_QR_CODE'}
                size={240}
                backgroundColor="white"
                color="#0A1E42"
              />
            </View>

            <View style={styles.qrInfo}>
              <View style={styles.qrInfoRow}>
                <Text style={styles.qrInfoLabel}>Ngân hàng:</Text>
                <Text style={styles.qrInfoValue}>{bankName}</Text>
              </View>
              <View style={styles.qrInfoRow}>
                <Text style={styles.qrInfoLabel}>Số tài khoản:</Text>
                <Text style={styles.qrInfoValue}>{accountNumber}</Text>
              </View>
              <View style={styles.qrInfoRow}>
                <Text style={styles.qrInfoLabel}>Chủ tài khoản:</Text>
                <Text style={styles.qrInfoValue}>{accountName}</Text>
              </View>
              <View style={styles.qrInfoRow}>
                <Text style={styles.qrInfoLabel}>Số tiền:</Text>
                <Text style={[styles.qrInfoValue, styles.qrAmount]}>
                  {formatPrice(totalAmount)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.qrConfirmButton}
              onPress={() => {
                setQrModalVisible(false);
                handleConfirmPayment('transfer');
              }}
            >
              <Text style={styles.qrConfirmButtonText}>Đã nhận tiền</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin thanh toán</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên ngân hàng *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Vietcombank"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số tài khoản *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: 1234567890"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Chủ tài khoản *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: NGUYEN VAN A"
                  value={accountName}
                  onChangeText={setAccountName}
                  autoCapitalize="characters"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveQRSettings}
              >
                <Text style={styles.modalSaveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A1E42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  brandSlogan: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  infoSection: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#0F172A',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  timeArrow: {
    marginHorizontal: 8,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderLeft: {
    flex: 1,
  },
  orderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  orderDetail: {
    fontSize: 13,
    color: '#64748B',
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1E42',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  foodHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  summarySection: {
    marginTop: 8,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
  },
  paymentSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 16,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  paymentDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginHorizontal: 16,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
  },
  qrInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qrInfoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  qrInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  qrAmount: {
    fontSize: 16,
    color: '#EF4444',
  },
  qrConfirmButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
    maxHeight: '70%',
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
    fontSize: 18,
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
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveButton: {
    backgroundColor: '#0A1E42',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});