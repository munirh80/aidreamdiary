import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import { useDreamStore } from '@/src/store/dreamStore';

export default function StreakFreezeScreen() {
  const { stats } = useDreamStore();

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Streak Freeze</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassCard style={styles.card}>
            <View style={styles.freezeInfo}>
              <View style={styles.freezeIcon}>
                <Ionicons name="snow" size={48} color="#00ffff" />
              </View>
              <Text style={styles.freezeCount}>{stats?.streak_freezes || 0}</Text>
              <Text style={styles.freezeLabel}>Streak Freezes Available</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#a855f7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How Streak Freeze Works</Text>
              <Text style={styles.infoText}>
                When you miss a day of dream journaling, a streak freeze will automatically protect your streak. You earn freezes by maintaining long streaks.
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Earning Freezes</Text>
            <View style={styles.earnRow}>
              <Ionicons name="flame" size={20} color="#f97316" />
              <Text style={styles.earnText}>7-day streak = 1 freeze</Text>
            </View>
            <View style={styles.earnRow}>
              <Ionicons name="flame" size={20} color="#f97316" />
              <Text style={styles.earnText}>30-day streak = 3 freezes</Text>
            </View>
            <View style={styles.earnRow}>
              <Ionicons name="flame" size={20} color="#f97316" />
              <Text style={styles.earnText}>100-day streak = 5 freezes</Text>
            </View>
          </GlassCard>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  freezeInfo: {
    alignItems: 'center',
    padding: 24,
  },
  freezeIcon: {
    marginBottom: 16,
  },
  freezeCount: {
    fontSize: 48,
    fontFamily: 'Manrope_700Bold',
    color: '#ffffff',
  },
  freezeLabel: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    marginBottom: 16,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  earnText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#e2e8f0',
  },
});
