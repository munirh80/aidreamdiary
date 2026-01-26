import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import StarryBackground from '@/src/components/StarryBackground';
import LoadingSpinner from '@/src/components/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <StarryBackground>
        <View style={styles.container}>
          <LoadingSpinner message="Loading Dream Vault..." />
        </View>
      </StarryBackground>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
