import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import DreamCard from '@/src/components/DreamCard';
import { useDreamStore } from '@/src/store/dreamStore';

export default function SharedDreamsScreen() {
  const { dreams, fetchDreams } = useDreamStore();
  const publicDreams = dreams.filter((d) => d.is_public);

  useFocusEffect(
    useCallback(() => {
      fetchDreams();
    }, [])
  );

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Shared Dreams</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {publicDreams.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="globe-outline" size={48} color="#64748b" />
              <Text style={styles.emptyTitle}>No shared dreams</Text>
              <Text style={styles.emptyText}>
                When you make a dream public, it will appear here. Share your dreams to inspire others!
              </Text>
            </GlassCard>
          ) : (
            publicDreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onPress={() => router.push(`/dream/${dream.id}`)}
              />
            ))
          )}
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
    lineHeight: 20,
  },
});
