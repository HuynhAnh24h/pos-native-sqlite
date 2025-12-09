
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '../../layouts/AuthLayout';
import { AuthController } from '../../controllers/AuthController';
import { SessionStore } from '../../state/SessionStore';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function onLogin() {
    if (loading) return;
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthController.handleLogin({ username, password });
      
      // Lưu session - AppNavigator sẽ tự động chuyển màn hình
      SessionStore.setSession(res);
      
      // KHÔNG cần navigation.replace('Dashboard') nữa!
      // AppNavigator sẽ tự động re-render và chuyển sang Dashboard
      
    } catch (e) {
      console.error('Login error:', e);
      setLoading(false); // Chỉ setLoading(false) khi lỗi
      
      if (e.message === 'INVALID_INPUT') {
        Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không hợp lệ.');
      } else if (e.message === 'USER_NOT_FOUND' || e.message === 'INVALID_CREDENTIALS') {
        Alert.alert('Lỗi', 'Thông tin đăng nhập sai.');
      } else {
        Alert.alert('Lỗi', 'Có lỗi xảy ra: ' + e.message);
      }
    }
    // KHÔNG setLoading(false) ở đây vì sẽ unmount component
  }

  async function onRegister() {
    if (loading) return;
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      await AuthController.handleRegister({ username, password });
      Alert.alert('Thành công', 'Tạo tài khoản thành công!', [
        { text: 'OK', onPress: () => setIsLogin(true) }
      ]);
      setUsername('');
      setPassword('');
    } catch (e) {
      console.error('Register error:', e);
      if (e.message === 'INVALID_INPUT') {
        Alert.alert('Lỗi', 'Tên đăng nhập/mật khẩu không hợp lệ (tối thiểu 3 ký tự username, 6 ký tự password).');
      } else if (e.message === 'USER_EXISTS') {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại.');
      } else {
        Alert.alert('Lỗi', 'Không thể tạo tài khoản: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <View style={styles.formContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Đăng nhập để tiếp tục quản trị' : 'Đăng ký tài khoản mới'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color="#64748B" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#64748B" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember & Forgot */}
          {isLogin && (
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberMe}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLogin ? onLogin : onRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Register */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleLink}>
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="#64748B" />
          <Text style={styles.footerText}>
            Thông tin của bạn được bảo mật an toàn
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A1E42',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
    color: '#64748B',
  },
  forgotText: {
    fontSize: 14,
    color: '#0A1E42',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0A1E42',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A1E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  toggleLink: {
    fontSize: 14,
    color: '#0A1E42',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
  },
});