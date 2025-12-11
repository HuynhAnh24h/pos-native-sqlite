import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SessionStore } from '../state/SessionStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function AdminLayout({ children, navigation, activeRoute: initialRoute = 'Dashboard' }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState(initialRoute);
  const [isTablet, setIsTablet] = useState(Dimensions.get('window').width >= 768)
  useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    setIsTablet(window.width >= 768);
  });

  return () => subscription?.remove();
}, []);

  const menuItems = [
    { id: 'Dashboard', icon: 'grid-outline', label: 'Thống kê', route: 'Dashboard' },
    { id: 'Menu', icon: 'restaurant-outline', label: 'Quản lý Menu', route: 'Menu' },
    { id: 'Rooms', icon: 'musical-notes-outline', label: 'Phòng hát', route: 'Rooms' },
    { id: 'History', icon: 'cart-outline', label: 'Lịch sử giao dịch', route: 'History' },
  ];

  const handleNavigation = (route, id) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(route);
      setActiveRoute(id); // cập nhật tab đang active
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            try {
              SessionStore.clear();
              console.log('Logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          }
        }
      ]
    );
  };

  // Get session info
  const session = SessionStore.get();
  const userName = session?.user?.username || 'Admin';
  const userRole = session?.user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.layout}>
        {/* Sidebar */}
        <View style={[
          styles.sidebar, 
          sidebarCollapsed && styles.sidebarCollapsed,
          !isTablet && styles.sidebarMobile
        ]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="musical-note" size={28} color="#fff" />
            </View>
            {!sidebarCollapsed && (
              <View>
                <Text style={styles.logoText}>Karaoke</Text>
                <Text style={styles.logoSubtext}>Management</Text>
              </View>
            )}
          </View>

          {/* Menu Items */}
          <ScrollView 
            style={styles.menuContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContent}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  activeRoute === item.id && styles.menuItemActive,
                  sidebarCollapsed && styles.menuItemCollapsed
                ]}
                onPress={() => handleNavigation(item.route, item.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.menuIcon,
                  activeRoute === item.id && styles.menuIconActive
                ]}>
                  <Ionicons 
                    name={item.icon} 
                    size={22} 
                    color={activeRoute === item.id ? '#0A1E42' : '#64748B'} 
                  />
                </View>
                {!sidebarCollapsed && (
                  <Text style={[
                    styles.menuLabel,
                    activeRoute === item.id && styles.menuLabelActive
                  ]}>
                    {item.label}
                  </Text>
                )}
                {!sidebarCollapsed && activeRoute === item.id && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Logout Button */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity
              style={[styles.menuItem, sidebarCollapsed && styles.menuItemCollapsed]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              {!sidebarCollapsed && (
                <Text style={[styles.menuLabel, { color: '#EF4444', fontWeight: '600' }]}>
                  Đăng xuất
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Ionicons 
                  name={sidebarCollapsed ? "menu-outline" : "close-outline"} 
                  size={24} 
                  color="#0A1E42" 
                />
              </TouchableOpacity>

              {/* Breadcrumb */}
              <View style={styles.breadcrumb}>
                <Ionicons name="home-outline" size={16} color="#64748B" />
                <Ionicons name="chevron-forward" size={14} color="#CBD5E1" style={{ marginHorizontal: 8 }} />
                <Text style={styles.breadcrumbText}>
                  {menuItems.find(item => item.id === activeRoute)?.label || 'Dashboard'}
                </Text>
              </View>
            </View>

            <View style={styles.topBarRight}>
              {/* User Profile */}
              <TouchableOpacity style={styles.userProfile}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <Text style={styles.userRole}>{userRole}</Text>
                </View>
                <Ionicons name="chevron-down-outline" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Area */}
          <ScrollView 
            style={styles.contentArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentWrapper}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sidebarCollapsed: {
    width: 80,
  },
  sidebarMobile: {
    width: 240,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0A1E42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#0A1E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1E42',
    lineHeight: 22,
  },
  logoSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuContent: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    position: 'relative',
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconActive: {
    backgroundColor: '#DBEAFE',
  },
  menuLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  menuLabelActive: {
    color: '#0A1E42',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#0A1E42',
    borderRadius: 2,
    position: 'absolute',
    right: 0,
  },
  sidebarFooter: {
    paddingHorizontal: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
  },
  mainContent: {
    flex: 1,
  },
  topBar: {
    height: 72,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1E42',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 200,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
    color: '#94A3B8',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0A1E42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 12,
    color: '#64748B',
  },
  contentArea: {
    flex: 1,
  },
  contentWrapper: {
    padding: 24,
    paddingBottom: 40,
  },
});