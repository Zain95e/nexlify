import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography } from '../../src/theme';
import { Button } from '../../src/components/Button';
import { logout } from '../../src/store/slices/authSlice';

export default function MoreScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      dispatch(logout());
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.h1, { color: Colors.text }]}>More</Text>
      <Text style={[Typography.body, { color: Colors.muted, marginTop: 8, marginBottom: 24 }]}>
        Settings, Profile, and Gamification.
      </Text>
      
      <Button 
        title="Logout" 
        onPress={handleLogout} 
        variant="outline"
        style={{ borderColor: Colors.error }}
        textStyle={{ color: Colors.error }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
