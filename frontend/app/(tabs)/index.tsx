import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import DreamCard from '@/src/components/DreamCard';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useDreamStore } from '@/src/store/dreamStore';
import { useAuthStore } from '@/src/store/authStore';

export default function DreamsScreen() {
  const { dreams, stats, isLoading, fetchDreams, fetchStats } = useDreamStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([fetchDreams(), fetchStats()]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDreamPress = (dreamId: string) => {
    router.push(`/dream/${dreamId}`);
  };

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Dreamer'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a855f7"
            />
          }
        >
          {/* Stats Overview */}
          {stats && (
            <View style={styles.statsContainer}>
              <GlassCard style={styles.statCard}>
                <Ionicons name="journal" size={24} color="#a855f7" />
                <Text style={styles.statValue}>{stats.total_dreams}</Text>
                <Text style={styles.statLabel}>Total Dreams</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="flame" size={24} color="#f97316" />
                <Text style={styles.statValue}>{stats.current_streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="eye" size={24} color="#00ffff" />
                <Text style={styles.statValue}>{stats.lucid_dreams}</Text>
                <Text style={styles.statLabel}>Lucid</Text>
              </GlassCard>
            </View>
          )}

          {/* Dreams List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Dreams</Text>
            {isLoading && dreams.length === 0 ? (
              <LoadingSpinner message="Loading dreams..." />
            ) : dreams.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="moon-outline" size={48} color="#64748b" />
                <Text style={styles.emptyTitle}>No dreams yet</Text>
                <Text style={styles.emptyText}>
                  Start recording your dreams to unlock insights
                </Text>
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Text style={styles.recordButtonText}>Record Your First Dream</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : (
              dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  onPress={() => handleDreamPress(dream.id)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#ffffff',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  recordButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  recordButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
});
