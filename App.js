import React, { useEffect } from 'react';
import AppNavigator from './src/app/AppNavigator';
import { initDatabase } from './src/config/init';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return <AppNavigator />;
}
