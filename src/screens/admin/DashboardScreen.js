import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../layouts/AdminLayout';
import { RoomModel } from '../../models/RoomModel';
import { MenuModel } from '../../models/MenuModel';
import { UserModel } from '../../models/UserModel';

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    rooms: { total: 0, available: 0, occupied: 0 },
    menu: { total: 0, available: 0 },
    invoices: { today: 0, week: 0, month: 0 },
    revenue: { today: 0, week: 0, month: 0, roomRevenue: 0, foodRevenue: 0 },
    users: { total: 0, admins: 0 }
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load rooms
      const rooms = RoomModel.findAll();
      const availableRooms = rooms.filter(r => r.status === 'available').length;
      const occupiedRooms = rooms.filter(r => r.status === 'occupied');

      // Load menu
      const menuItems = MenuModel.findAll();
      const availableMenu = menuItems.filter(m => m.is_available).length;

      // Load invoices
      const allInvoices = RoomModel.getAllInvoices();
      const now = new Date();
      
      // Filter by date
      const todayInvoices = allInvoices.filter(inv => {
        const invDate = new Date(inv.paid_at);
        return invDate.toDateString() === now.toDateString();
      });

      const weekInvoices = allInvoices.filter(inv => {
        const invDate = new Date(inv.paid_at);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invDate >= weekAgo;
      });

      const monthInvoices = allInvoices.filter(inv => {
        const invDate = new Date(inv.paid_at);
        return invDate.getMonth() === now.getMonth() && 
               invDate.getFullYear() === now.getFullYear();
      });

      // Calculate revenue
      const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const weekRevenue = weekInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const roomRevenue = allInvoices.reduce((sum, inv) => sum + inv.room_charge, 0);
      const foodRevenue = allInvoices.reduce((sum, inv) => sum + inv.food_charge, 0);

      // Load users
      const users = UserModel.findAll();
      const admins = users.filter(u => u.role === 'admin').length;

      // Recent invoices (last 5)
      const recent = allInvoices.slice(0, 5);

      setStats({
        rooms: { total: rooms.length, available: availableRooms, occupied: occupiedRooms.length },
        menu: { total: menuItems.length, available: availableMenu },
        invoices: { 
          today: todayInvoices.length, 
          week: weekInvoices.length, 
          month: monthInvoices.length 
        },
        revenue: { today: todayRevenue, week: weekRevenue, month: monthRevenue, roomRevenue, foodRevenue },
        users: { total: users.length, admins }
      });

      setRecentInvoices(recent);
      setOccupiedRooms(occupiedRooms);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateRoomUsage = () => {
    const { occupied, total } = stats.rooms;
    return total > 0 ? ((occupied / total) * 100).toFixed(0) : 0;
  };

  return (
    <AdminLayout navigation={navigation} activeRoute="Dashboard">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeTitle}>Chào mừng trở lại! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Tổng quan hệ thống Karaoke
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color="#0A1E42" />
          </TouchableOpacity>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          {/* Revenue Today */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.statIconLarge}>
              <Ionicons name="cash" size={32} color="#10B981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Doanh thu hôm nay</Text>
              <Text style={styles.statValueLarge}>{formatPrice(stats.revenue.today)}</Text>
              <View style={styles.statBadge}>
                <Ionicons name="receipt" size={14} color="#64748B" />
                <Text style={styles.statBadgeText}>{stats.invoices.today} hóa đơn</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Rooms Status */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Rooms')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="musical-notes" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.rooms.occupied}/{stats.rooms.total}</Text>
            <Text style={styles.statLabel}>Phòng đang sử dụng</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${calculateRoomUsage()}%` }]} />
            </View>
          </TouchableOpacity>

          {/* Menu Items */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Menu')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="restaurant" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.menu.available}</Text>
            <Text style={styles.statLabel}>Món ăn có sẵn</Text>
            <Text style={styles.statSubtext}>Tổng {stats.menu.total} món</Text>
          </TouchableOpacity>
        </View>

        {/* Revenue Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doanh thu</Text>
          <View style={styles.revenueGrid}>
            <View style={styles.revenueCard}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
              <Text style={styles.revenueLabel}>7 ngày qua</Text>
              <Text style={styles.revenueValue}>{formatPrice(stats.revenue.week)}</Text>
              <Text style={styles.revenueSubtext}>{stats.invoices.week} hóa đơn</Text>
            </View>
            
            <View style={styles.revenueCard}>
              <Ionicons name="calendar" size={20} color="#8B5CF6" />
              <Text style={styles.revenueLabel}>Tháng này</Text>
              <Text style={styles.revenueValue}>{formatPrice(stats.revenue.month)}</Text>
              <Text style={styles.revenueSubtext}>{stats.invoices.month} hóa đơn</Text>
            </View>
          </View>

          {/* Revenue Breakdown */}
          <View style={styles.revenueBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { 
                  width: `${(stats.revenue.roomRevenue / (stats.revenue.roomRevenue + stats.revenue.foodRevenue) * 100) || 0}%`,
                  backgroundColor: '#0A1E42'
                }]} />
              </View>
              <View style={styles.breakdownInfo}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.breakdownDot, { backgroundColor: '#0A1E42' }]} />
                  <Text style={styles.breakdownText}>Phòng hát</Text>
                </View>
                <Text style={styles.breakdownValue}>{formatPrice(stats.revenue.roomRevenue)}</Text>
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { 
                  width: `${(stats.revenue.foodRevenue / (stats.revenue.roomRevenue + stats.revenue.foodRevenue) * 100) || 0}%`,
                  backgroundColor: '#10B981'
                }]} />
              </View>
              <View style={styles.breakdownInfo}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.breakdownDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.breakdownText}>Đồ ăn & Nước</Text>
                </View>
                <Text style={styles.breakdownValue}>{formatPrice(stats.revenue.foodRevenue)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Occupied Rooms */}
        {occupiedRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Phòng đang hoạt động</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Rooms')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.roomsGrid}>
              {occupiedRooms.slice(0, 4).map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.roomCard}
                  onPress={() => navigation.navigate('RoomDetail', { room })}
                >
                  <View style={styles.roomHeader}>
                    <View style={styles.roomIconSmall}>
                      <Ionicons name="musical-note" size={16} color="#fff" />
                    </View>
                    <View style={styles.roomStatusBadge}>
                      <View style={styles.roomStatusDot} />
                    </View>
                  </View>
                  <Text style={styles.roomCardName}>{room.name}</Text>
                  <Text style={styles.roomCardCustomer} numberOfLines={1}>
                    {room.customer_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {recentInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {recentInvoices.map((invoice) => (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.activityItem}
                  onPress={() => navigation.navigate('Orders')}
                >
                  <View style={styles.activityIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {invoice.customer_name} - {invoice.room_name}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {formatDateTime(invoice.paid_at)}
                    </Text>
                  </View>
                  <Text style={styles.activityAmount}>
                    {formatPrice(invoice.total_amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Rooms')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="add-circle" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Check-in khách</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Menu')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="restaurant" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Quản lý menu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Orders')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="document-text" size={28} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Xem hóa đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="analytics" size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Thống kê</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Info */}
        <View style={[styles.section, styles.systemInfo]}>
          <View style={styles.systemItem}>
            <Ionicons name="people" size={20} color="#64748B" />
            <Text style={styles.systemText}>{stats.users.total} người dùng ({stats.users.admins} admin)</Text>
          </View>
          <View style={styles.systemItem}>
            <Ionicons name="server" size={20} color="#64748B" />
            <Text style={styles.systemText}>Hệ thống hoạt động bình thường</Text>
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  refreshButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: 'calc(33.33% - 16px)',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardLarge: {
    width: 'calc(100% - 16px)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBadgeText: {
    fontSize: 13,
    color: '#64748B',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  section: {
    marginBottom: 32,
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1E42',
  },
  revenueGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  revenueCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revenueLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 12,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 4,
  },
  revenueSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  revenueBreakdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownText: {
    fontSize: 14,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1E42',
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  roomCard: {
    width: 'calc(25% - 12px)',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  roomCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1E42',
    marginBottom: 4,
  },
  roomCardCustomer: {
    fontSize: 12,
    color: '#64748B',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyState: {
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
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionCard: {
    width: 'calc(25% - 12px)',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A1E42',
    textAlign: 'center',
  },
  systemInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  systemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  systemText: {
    fontSize: 13,
    color: '#64748B',
  },
});