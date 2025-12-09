// src/app/AppNavigator.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionStore } from '../state/SessionStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Admin Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import MenuScreen from '../screens/admin/MenuScreen';
import RoomsScreen from '../screens/admin/RoomsScreen';
import OrdersScreen from '../screens/admin/OrdersScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('🔄 Initializing app...');
        
        // Initialize session
        await SessionStore.init();
        
        // Check if user is logged in
        const session = SessionStore.get();
        const hasValidToken = !!(session && (session.token || session.userId));
        
        console.log('Session status:', hasValidToken ? 'Logged in' : 'Not logged in');
        setIsLoggedIn(hasValidToken);
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setIsLoggedIn(false);
      } finally {
        setIsReady(true);
        console.log('✅ App ready');
      }
    }

    initializeApp();
  }, []);

  // Listener for session changes
  useEffect(() => {
    const checkAuthInterval = setInterval(() => {
      const session = SessionStore.get();
      const hasValidToken = !!(session && (session.token || session.userId));
      
      // Chỉ update state khi thay đổi
      if (hasValidToken !== isLoggedIn) {
        console.log('Auth state changed:', hasValidToken ? 'Logged in' : 'Logged out');
        setIsLoggedIn(hasValidToken);
      }
    }, 500); // Check mỗi 0.5s
    
    return () => clearInterval(checkAuthInterval);
  }, [isLoggedIn]);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A1E42" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade'
        }}
      >
        {!isLoggedIn ? (
          // Authentication Stack
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              gestureEnabled: false
            }}
          />
        ) : (
          // Authenticated Stack
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ 
                gestureEnabled: false
              }}
            />
            <Stack.Screen 
              name="Menu" 
              component={MenuScreen}
            />
            <Stack.Screen 
              name="Rooms" 
              component={RoomsScreen}
            />
            <Stack.Screen 
              name="Orders" 
              component={OrdersScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});