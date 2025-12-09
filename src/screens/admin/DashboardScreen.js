import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../layouts/AdminLayout';

export default function DashboardScreen({ navigation }) {
  const stats = [
    { 
      id: 1, 
      icon: 'people', 
      label: 'Tổng người dùng', 
      value: '1,234', 
      change: '+12%',
      color: '#3B82F6',
      bgColor: '#EFF6FF'
    },
    { 
      id: 2, 
      icon: 'cart', 
      label: 'Đơn hàng', 
      value: '856', 
      change: '+8%',
      color: '#10B981',
      bgColor: '#ECFDF5'
    },
    { 
      id: 3, 
      icon: 'trending-up', 
      label: 'Doanh thu', 
      value: '₫24.5M', 
      change: '+23%',
      color: '#F59E0B',
      bgColor: '#FFFBEB'
    },
    { 
      id: 4, 
      icon: 'cube', 
      label: 'Sản phẩm', 
      value: '342', 
      change: '+5%',
      color: '#8B5CF6',
      bgColor: '#F5F3FF'
    },
  ];

  const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', action: 'Đặt hàng mới', time: '5 phút trước', icon: 'cart' },
    { id: 2, user: 'Trần Thị B', action: 'Đăng ký tài khoản', time: '12 phút trước', icon: 'person-add' },
    { id: 3, user: 'Lê Văn C', action: 'Cập nhật sản phẩm', time: '1 giờ trước', icon: 'create' },
    { id: 4, user: 'Phạm Thị D', action: 'Thanh toán thành công', time: '2 giờ trước', icon: 'checkmark-circle' },
  ];

  return (
    <AdminLayout navigation={navigation} activeRoute="Dashboard">
      <View style={styles.container}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Dashboard</Text>
            <Text style={styles.pageSubtitle}>Tổng quan hệ thống</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.dateFilter}>
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <Text style={styles.dateText}>Hôm nay</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <View style={styles.statChange}>
                    <Ionicons name="trending-up" size={12} color="#10B981" />
                    <Text style={styles.statChangeText}>{stat.change}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            <Text style={styles.sectionLink}>Xem tất cả</Text>
          </View>
          <View style={styles.card}>
            {recentActivities.map((activity, index) => (
              <View 
                key={activity.id} 
                style={[
                  styles.activityItem,
                  index !== recentActivities.length - 1 && styles.activityItemBorder
                ]}
              >
                <View style={styles.activityIcon}>
                  <Ionicons name={activity.icon} size={20} color="#0A1E42" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityUser}>{activity.user}</Text>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <View style={styles.quickActionCard}>
              <Ionicons name="add-circle" size={32} color="#0A1E42" />
              <Text style={styles.quickActionText}>Thêm sản phẩm</Text>
            </View>
            <View style={styles.quickActionCard}>
              <Ionicons name="person-add" size={32} color="#0A1E42" />
              <Text style={styles.quickActionText}>Thêm người dùng</Text>
            </View>
            <View style={styles.quickActionCard}>
              <Ionicons name="document-text" size={32} color="#0A1E42" />
              <Text style={styles.quickActionText}>Tạo báo cáo</Text>
            </View>
            <View style={styles.quickActionCard}>
              <Ionicons name="settings" size={32} color="#0A1E42" />
              <Text style={styles.quickActionText}>Cài đặt</Text>
            </View>
          </View>
        </View>
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageHeader: {
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1E42',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#0A1E42',
  },
  sectionLink: {
    fontSize: 14,
    color: '#0A1E42',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  activityAction: {
    fontSize: 13,
    color: '#64748B',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionCard: {
    width: '25%',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});