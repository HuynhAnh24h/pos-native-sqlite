import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../layouts/AdminLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIETNAM_BANKS = [
  { id: 'VCB', name: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
  { id: 'BIDV', name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { id: 'VTB', name: 'Vietinbank', fullName: 'Ngân hàng TMCP Công thương Việt Nam' },
  { id: 'ACB', name: 'ACB', fullName: 'Ngân hàng TMCP Á Châu' },
  { id: 'TCB', name: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  { id: 'MB', name: 'MBBank', fullName: 'Ngân hàng TMCP Quân đội' },
  { id: 'VPB', name: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { id: 'TPB', name: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong' },
  { id: 'STB', name: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { id: 'HDB', name: 'HDBank', fullName: 'Ngân hàng TMCP Phát triển TP.HCM' },
  { id: 'SHB', name: 'SHB', fullName: 'Ngân hàng TMCP Sài Gòn - Hà Nội' },
  { id: 'EIB', name: 'Eximbank', fullName: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam' },
  { id: 'MSB', name: 'MSB', fullName: 'Ngân hàng TMCP Hàng Hải' },
  { id: 'OCB', name: 'OCB', fullName: 'Ngân hàng TMCP Phương Đông' },
  { id: 'VIB', name: 'VIB', fullName: 'Ngân hàng TMCP Quốc tế' },
  { id: 'LPB', name: 'LienVietPostBank', fullName: 'Ngân hàng TMCP Bưu Điện Liên Việt' },
  { id: 'SEA', name: 'SeABank', fullName: 'Ngân hàng TMCP Đông Nam Á' },
  { id: 'VAB', name: 'VietABank', fullName: 'Ngân hàng TMCP Việt Á' },
  { id: 'NAB', name: 'Nam A Bank', fullName: 'Ngân hàng TMCP Nam Á' },
  { id: 'PGB', name: 'PGBank', fullName: 'Ngân hàng TMCP Xăng dầu Petrolimex' },
  { id: 'VCCB', name: 'VietCapital Bank', fullName: 'Ngân hàng TMCP Bản Việt' },
  { id: 'SCB', name: 'SCB', fullName: 'Ngân hàng TMCP Sài Gòn' },
  { id: 'BAB', name: 'BacABank', fullName: 'Ngân hàng TMCP Bắc Á' },
  { id: 'CAKE', name: 'CAKE by VPBank', fullName: 'Ngân hàng số CAKE by VPBank' },
  { id: 'TIMO', name: 'Timo', fullName: 'Ngân hàng số Timo by Ban Viet' },
  { id: 'UBANK', name: 'Ubank', fullName: 'Ngân hàng số Ubank by VPBank' },
  { id: 'ABB', name: 'ABBANK', fullName: 'Ngân hàng TMCP An Bình' },
  { id: 'IVB', name: 'IndovinaBank', fullName: 'Ngân hàng TNHH Indovina' },
  { id: 'SGB', name: 'Saigonbank', fullName: 'Ngân hàng TMCP Sài Gòn Công Thương' },
  { id: 'BAO', name: 'Bao Viet Bank', fullName: 'Ngân hàng TMCP Bảo Việt' },
  { id: 'VBSP', name: 'VBSP', fullName: 'Ngân hàng Chính sách Xã hội Việt Nam' },
  { id: 'AGRI', name: 'Agribank', fullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn' },
  { id: 'COOP', name: 'Co-opBank', fullName: 'Ngân hàng Hợp tác xã Việt Nam' },
  { id: 'OCB', name: 'OCB', fullName: 'Ngân hàng TMCP Phương Đông' },
  { id: 'GPB', name: 'GPBank', fullName: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu' }
];

export default function SettingsScreen({ navigation }) {
  const [bankInfo, setBankInfo] = useState({
    bankId: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBankInfo();
  }, []);

  const loadBankInfo = async () => {
    try {
      const saved = await AsyncStorage.getItem('bank_info');
      if (saved) {
        setBankInfo(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading bank info:', error);
    }
  };

  const saveBankInfo = async () => {
    if (!bankInfo.bankId || !bankInfo.accountNumber.trim() || !bankInfo.accountName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Validate account number (chỉ số)
    if (!/^\d+$/.test(bankInfo.accountNumber)) {
      Alert.alert('Lỗi', 'Số tài khoản chỉ được chứa số');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('bank_info', JSON.stringify(bankInfo));
      Alert.alert('Thành công', 'Đã lưu thông tin ngân hàng');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  const selectBank = (bank) => {
    setBankInfo({
      ...bankInfo,
      bankId: bank.id,
      bankName: bank.name
    });
    setBankModalVisible(false);
    setSearchQuery('');
  };

  const clearBankInfo = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa thông tin ngân hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('bank_info');
              setBankInfo({
                bankId: '',
                bankName: '',
                accountNumber: '',
                accountName: ''
              });
              Alert.alert('Thành công', 'Đã xóa thông tin ngân hàng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa thông tin');
            }
          }
        }
      ]
    );
  };

  const filteredBanks = VIETNAM_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBank = VIETNAM_BANKS.find(b => b.id === bankInfo.bankId);

  return (
    <AdminLayout navigation={navigation} activeRoute="Settings">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Cài đặt hệ thống</Text>
            <Text style={styles.pageSubtitle}>Quản lý cấu hình chung</Text>
          </View>
        </View>

        {/* Bank Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={24} color="#0A1E42" />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
              <Text style={styles.sectionSubtitle}>
                Cấu hình tài khoản ngân hàng cho mã QR thanh toán
              </Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            {/* Bank Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Ngân hàng <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setBankModalVisible(true)}
              >
                <View style={styles.selectContent}>
                  {selectedBank ? (
                    <>
                      <View style={styles.bankIcon}>
                        <Ionicons name="business" size={20} color="#0A1E42" />
                      </View>
                      <View style={styles.bankInfo}>
                        <Text style={styles.bankName}>{selectedBank.name}</Text>
                        <Text style={styles.bankFullName}>{selectedBank.fullName}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color="#64748B" />
                      <Text style={styles.selectPlaceholder}>Chọn ngân hàng</Text>
                    </>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {/* Account Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Số tài khoản <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số tài khoản"
                  placeholderTextColor="#94A3B8"
                  value={bankInfo.accountNumber}
                  onChangeText={(text) => setBankInfo({ ...bankInfo, accountNumber: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Account Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Tên chủ tài khoản <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="VD: NGUYEN VAN A"
                  placeholderTextColor="#94A3B8"
                  value={bankInfo.accountName}
                  onChangeText={(text) => setBankInfo({ ...bankInfo, accountName: text })}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                Thông tin này sẽ được sử dụng để tạo mã QR thanh toán cho tất cả hóa đơn
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              {bankInfo.accountNumber && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearBankInfo}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.clearButtonText}>Xóa</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={saveBankInfo}
                disabled={loading}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preview Section */}
        {bankInfo.bankId && bankInfo.accountNumber && bankInfo.accountName && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="eye" size={24} color="#0A1E42" />
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Xem trước thông tin</Text>
                <Text style={styles.sectionSubtitle}>
                  Thông tin sẽ hiển thị trên hóa đơn
                </Text>
              </View>
            </View>

            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Ngân hàng:</Text>
                <Text style={styles.previewValue}>{selectedBank?.name}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Số tài khoản:</Text>
                <Text style={styles.previewValue}>{bankInfo.accountNumber}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Chủ tài khoản:</Text>
                <Text style={styles.previewValue}>{bankInfo.accountName}</Text>
              </View>
            </View>
          </View>
        )}

        {/* System Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#0A1E42" />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Thông tin hệ thống</Text>
            </View>
          </View>

          <View style={styles.systemCard}>
            <View style={styles.systemRow}>
              <Ionicons name="code-working" size={18} color="#64748B" />
              <Text style={styles.systemText}>Phiên bản: 1.0.0</Text>
            </View>
            <View style={styles.systemRow}>
              <Ionicons name="calendar" size={18} color="#64748B" />
              <Text style={styles.systemText}>Build: 2024.12.12</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal
        visible={bankModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
              <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm ngân hàng..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Banks List */}
            <ScrollView style={styles.banksList} showsVerticalScrollIndicator={false}>
              {filteredBanks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankItem,
                    bankInfo.bankId === bank.id && styles.bankItemActive
                  ]}
                  onPress={() => selectBank(bank)}
                >
                  <View style={styles.bankItemIcon}>
                    <Ionicons name="business" size={24} color="#0A1E42" />
                  </View>
                  <View style={styles.bankItemInfo}>
                    <Text style={styles.bankItemName}>{bank.name}</Text>
                    <Text style={styles.bankItemFullName} numberOfLines={1}>
                      {bank.fullName}
                    </Text>
                  </View>
                  {bankInfo.bankId === bank.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  required: {
    color: '#EF4444',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  bankFullName: {
    fontSize: 12,
    color: '#64748B',
  },
  selectPlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
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
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1E42',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  systemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  systemText: {
    fontSize: 14,
    color: '#64748B',
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    margin: 20,
    marginTop: 16,
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
  banksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  bankItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0A1E42',
  },
  bankItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankItemInfo: {
    flex: 1,
  },
  bankItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  bankItemFullName: {
    fontSize: 12,
    color: '#64748B',
  },
});