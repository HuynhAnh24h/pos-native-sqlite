// src/screens/admin/OrdersScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AdminLayout from '../../layouts/AdminLayout';

export default function OrdersScreen({ navigation }) {
  return (
    <AdminLayout navigation={navigation} activeRoute="Orders">
      <View style={styles.container}>
        <Text style={styles.text}>Orders Screen - Coming soon</Text>
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#64748B',
  },
});