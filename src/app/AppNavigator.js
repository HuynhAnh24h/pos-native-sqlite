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
import RoomCheckInScreen from '../screens/admin/RoomCheckinScreen';
import RoomDetailScreen from '../screens/admin/RoomDetailScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        await SessionStore.init();
        const session = SessionStore.get();
        setIsLoggedIn(!!(session && (session.token || session.userId)));
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setIsLoggedIn(false);
      } finally {
        setIsReady(true);
      }
    }

    initializeApp();
  }, []);

  useEffect(() => {
    const checkAuthInterval = setInterval(() => {
      const session = SessionStore.get();
      const hasValidToken = !!(session && (session.token || session.userId));
      
      if (hasValidToken !== isLoggedIn) {
        setIsLoggedIn(hasValidToken);
      }
    }, 500);
    
    return () => clearInterval(checkAuthInterval);
  }, [isLoggedIn]);

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
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ gestureEnabled: false }}
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
              name="RoomCheckIn" 
              component={RoomCheckInScreen}
            />
            <Stack.Screen 
              name="RoomDetail" 
              component={RoomDetailScreen}
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