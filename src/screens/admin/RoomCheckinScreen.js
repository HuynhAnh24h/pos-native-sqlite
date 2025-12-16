import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomModel } from '../../models/RoomModel';

export default function RoomCheckInScreen({ route, navigation }) {
  const { room } = route.params;
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckIn = async () => {
    // Validation
    if (!customerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number (basic)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 số)');
      return;
    }

    setLoading(true);

    try {
      // Check-in phòng
      const { sessionId, startTime } = RoomModel.checkIn(room.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim()
      });

      Alert.alert(
        'Thành công',
        `Đã check-in phòng ${room.name} cho khách ${customerName}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Room Detail để order
              navigation.replace('RoomDetail', {
                room: {
                  ...room,
                  status: 'occupied',
                  customer_name: customerName.trim(),
                  customer_phone: customerPhone.trim(),
                  start_time: startTime,
                  session_id: sessionId
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Lỗi', 'Không thể check-in phòng. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy check-in?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={24} color="#0A1E42" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Check-in khách hàng</Text>
            <Text style={styles.headerSubtitle}>Thông tin khách đặt phòng</Text>
          </View>
        </View>

        {/* Room Info Card */}
        <View style={styles.roomCard}>
          <View style={styles.roomIconContainer}>
            <View style={styles.roomIconBg}>
              <Ionicons name="musical-notes" size={40} color="#fff" />
            </View>
          </View>
          
          <View style={styles.roomDetails}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.roomPriceRow}>
              <Ionicons name="time-outline" size={18} color="#10B981" />
              <Text style={styles.roomPrice}>{formatPrice(room.price_per_hour)}/giờ</Text>
            </View>
            
            <View style={styles.roomFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="mic" size={16} color="#64748B" />
                <Text style={styles.featureText}>Hệ thống âm thanh chuyên nghiệp</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="tv" size={16} color="#64748B" />
                <Text style={styles.featureText}>Màn hình LED 55 inch</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="snow" size={16} color="#64748B" />
                <Text style={styles.featureText}>Điều hòa 2 chiều</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          
          {/* Customer Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên khách hàng *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên khách hàng"
                placeholderTextColor="#94A3B8"
                value={customerName}
                onChangeText={setCustomerName}
                editable={!loading}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Customer Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#94A3B8"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                editable={!loading}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Thời gian bắt đầu sẽ được tính từ khi check-in thành công
            </Text>
          </View>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Chi phí dự kiến</Text>
          
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Giá phòng/giờ</Text>
              <Text style={styles.pricingValue}>{formatPrice(room.price_per_hour)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.pricingNote}>
              <Ionicons name="information-circle" size={18} color="#3B82F6" />
              <Text style={styles.pricingNoteText}>
                • Tính tối thiểu 30 phút{'\n'}
                • Từ 30 phút trở lên: Làm tròn lên giờ
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.pricingExamples}>
              <Text style={styles.examplesTitle}>Ví dụ:</Text>
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>• 15 phút:</Text>
                <Text style={styles.exampleValue}>{formatPrice(room.price_per_hour * 0.5)} (tính 30p)</Text>
              </View>
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>• 45 phút:</Text>
                <Text style={styles.exampleValue}>{formatPrice(room.price_per_hour)} (tính 1h)</Text>
              </View>
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>• 1h 30p:</Text>
                <Text style={styles.exampleValue}>{formatPrice(room.price_per_hour * 2)} (tính 2h)</Text>
              </View>
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>• 2h 10p:</Text>
                <Text style={styles.exampleValue}>{formatPrice(room.price_per_hour * 3)} (tính 3h)</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.noteBox}>
              <Ionicons name="receipt-outline" size={16} color="#64748B" />
              <Text style={styles.noteText}>
                Chưa bao gồm chi phí đồ ăn & thức uống
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Ionicons name="close-circle-outline" size={20} color="#64748B" />
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.checkInButton, loading && styles.buttonDisabled]}
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.checkInButtonText}>Đang xử lý...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.checkInButtonText}>Check-in & Bắt đầu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1E42',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  roomCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roomIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A1E42',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A1E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roomDetails: {
    alignItems: 'center',
  },
  roomName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 8,
  },
  roomPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  roomFeatures: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#64748B',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  pricingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1E42',
  },
  pricingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
  },
  pricingNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  pricingExamples: {
    marginBottom: 16,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  exampleLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  exampleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1E42',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
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
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  checkInButton: {
    backgroundColor: '#0A1E42',
    flex: 2,
    shadowColor: '#0A1E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
});