import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../layouts/AdminLayout';
import { RoomModel } from '../../models/RoomModel';

export default function HistoryScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    roomRevenue: 0,
    foodRevenue: 0
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchQuery, filterDate, invoices]);

  const loadInvoices = () => {
    try {
      const data = RoomModel.getAllInvoices();
      setInvoices(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const calculateStats = (data) => {
    const totalRevenue = data.reduce((sum, inv) => sum + inv.total_amount, 0);
    const roomRevenue = data.reduce((sum, inv) => sum + inv.room_charge, 0);
    const foodRevenue = data.reduce((sum, inv) => sum + inv.food_charge, 0);
    
    setStats({
      totalRevenue,
      totalInvoices: data.length,
      roomRevenue,
      foodRevenue
    });
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(inv =>
        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_phone?.includes(searchQuery)
      );
    }

    // Filter by date
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.paid_at);
        switch (filterDate) {
          case 'today':
            return invDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return invDate >= weekAgo;
          case 'month':
            return invDate.getMonth() === now.getMonth() && 
                   invDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredInvoices(filtered);
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };

  const getDateFilterLabel = () => {
    switch (filterDate) {
      case 'today': return 'Hôm nay';
      case 'week': return '7 ngày qua';
      case 'month': return 'Tháng này';
      default: return 'Tất cả';
    }
  };

  const renderInvoiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => handleViewInvoice(item)}
      activeOpacity={0.7}
    >
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceIcon}>
          <Ionicons name="receipt" size={24} color="#0A1E42" />
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.roomName}>{item.room_name}</Text>
        </View>
        <View style={styles.invoiceAmount}>
          <Text style={styles.totalAmount}>{formatPrice(item.total_amount)}</Text>
          <Text style={styles.invoiceDate}>{formatDate(item.paid_at)}</Text>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{formatDuration(item.duration_hours)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.customer_phone || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="card-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {item.payment_method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AdminLayout navigation={navigation} activeRoute="Orders">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Lịch sử thanh toán</Text>
            <Text style={styles.pageSubtitle}>
              {filteredInvoices.length} hóa đơn
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Ionicons name="cash" size={24} color="#10B981" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatPrice(stats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Tổng doanh thu</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
            <Ionicons name="receipt" size={24} color="#3B82F6" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.totalInvoices}</Text>
              <Text style={styles.statLabel}>Tổng hóa đơn</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Ionicons name="musical-note" size={24} color="#F59E0B" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatPrice(stats.roomRevenue)}</Text>
              <Text style={styles.statLabel}>Doanh thu phòng</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
            <Ionicons name="restaurant" size={24} color="#8B5CF6" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatPrice(stats.foodRevenue)}</Text>
              <Text style={styles.statLabel}>Doanh thu F&B</Text>
            </View>
          </View>
        </View>

        {/* Search & Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên, phòng, SĐT..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Date Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {['all', 'today', 'week', 'month'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                filterDate === filter && styles.filterChipActive
              ]}
              onPress={() => setFilterDate(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterDate === filter && styles.filterTextActive
                ]}
              >
                {filter === 'all' ? 'Tất cả' :
                 filter === 'today' ? 'Hôm nay' :
                 filter === 'week' ? '7 ngày' : 'Tháng này'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoices List */}
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderInvoiceItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có hóa đơn nào</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        {/* Invoice Detail Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết hóa đơn</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {selectedInvoice && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Invoice Number */}
                  <View style={styles.invoiceNumber}>
                    <Text style={styles.invoiceNumberText}>
                      #{selectedInvoice.id}
                    </Text>
                  </View>

                  {/* Customer Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.modalRow}>
                      <Ionicons name="person" size={18} color="#64748B" />
                      <Text style={styles.modalText}>{selectedInvoice.customer_name}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Ionicons name="call" size={18} color="#64748B" />
                      <Text style={styles.modalText}>
                        {selectedInvoice.customer_phone || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Ionicons name="musical-notes" size={18} color="#64748B" />
                      <Text style={styles.modalText}>{selectedInvoice.room_name}</Text>
                    </View>
                  </View>

                  {/* Time Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thời gian</Text>
                    <View style={styles.timeBox}>
                      <View style={styles.timeColumn}>
                        <Text style={styles.timeLabel}>Bắt đầu</Text>
                        <Text style={styles.timeValue}>
                          {formatDateTime(selectedInvoice.start_time)}
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={20} color="#64748B" />
                      <View style={styles.timeColumn}>
                        <Text style={styles.timeLabel}>Kết thúc</Text>
                        <Text style={styles.timeValue}>
                          {formatDateTime(selectedInvoice.end_time)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.durationBox}>
                      <Ionicons name="time" size={18} color="#10B981" />
                      <Text style={styles.durationText}>
                        Thời gian: {formatDuration(selectedInvoice.duration_hours)}
                      </Text>
                    </View>
                  </View>

                  {/* Payment Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Chi tiết thanh toán</Text>
                    
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Tiền phòng</Text>
                      <Text style={styles.paymentValue}>
                        {formatPrice(selectedInvoice.room_charge)}
                      </Text>
                    </View>
                    
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Đồ ăn & Nước uống</Text>
                      <Text style={styles.paymentValue}>
                        {formatPrice(selectedInvoice.food_charge)}
                      </Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.totalPaymentRow}>
                      <Text style={styles.totalPaymentLabel}>Tổng cộng</Text>
                      <Text style={styles.totalPaymentValue}>
                        {formatPrice(selectedInvoice.total_amount)}
                      </Text>
                    </View>
                  </View>

                  {/* Payment Method */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Phương thức</Text>
                    <View style={styles.paymentMethodBox}>
                      <Ionicons
                        name={selectedInvoice.payment_method === 'transfer' ? 'card' : 'cash'}
                        size={24}
                        color="#0A1E42"
                      />
                      <Text style={styles.paymentMethodText}>
                        {selectedInvoice.payment_method === 'transfer' 
                          ? 'Chuyển khoản' 
                          : 'Tiền mặt'}
                      </Text>
                    </View>
                  </View>

                  {/* Payment Time */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thời gian thanh toán</Text>
                    <Text style={styles.paidAtText}>
                      {formatDateTime(selectedInvoice.paid_at)}
                    </Text>
                  </View>
                </ScrollView>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  searchSection: {
    marginBottom: 16,
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
  filterScroll: {
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0A1E42',
    borderColor: '#0A1E42',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 13,
    color: '#64748B',
  },
  invoiceAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#64748B',
  },
  invoiceDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
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
  invoiceNumber: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#0F172A',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeColumn: {
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
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
  },
  totalPaymentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1E42',
  },
  totalPaymentValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  paymentMethodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  paymentMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  paidAtText: {
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeButton: {
    backgroundColor: '#0A1E42',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});