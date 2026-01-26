import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useDreamStore } from '@/src/store/dreamStore';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { patterns, achievements, stats, fetchPatterns, fetchAchievements, fetchStats } = useDreamStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadData = useCallback(async () => {
    await Promise.all([fetchPatterns(), fetchAchievements(), fetchStats()]);
    setLoading(false);
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

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  if (loading) {
    return (
      <StarryBackground>
        <SafeAreaView style={styles.safeArea}>
          <LoadingSpinner message="Loading insights..." />
        </SafeAreaView>
      </StarryBackground>
    );
  }

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Dream Insights</Text>
          <Text style={styles.subtitle}>Discover patterns in your dreams</Text>
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
          {/* Achievements Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achievementCount}>
                {unlockedAchievements.length}/{achievements.length}
              </Text>
            </View>

            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <View style={styles.achievementsRow}>
                {unlockedAchievements.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementBadge}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Progress on locked */}
            {lockedAchievements.slice(0, 3).map((achievement) => (
              <GlassCard key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementHeader}>
                  <Text style={styles.lockedIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.name}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${(achievement.progress / achievement.target) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {achievement.progress}/{achievement.target}
                </Text>
              </GlassCard>
            ))}
          </View>

          {/* Word Cloud / Common Words */}
          {patterns && patterns.word_frequency && patterns.word_frequency.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cloud" size={24} color="#a855f7" />
                <Text style={styles.sectionTitle}>Dream Words</Text>
              </View>
              <GlassCard style={styles.wordCloudCard}>
                <View style={styles.wordCloud}>
                  {patterns.word_frequency.slice(0, 20).map((item: any, index: number) => (
                    <View
                      key={item.word}
                      style={[
                        styles.wordBadge,
                        { opacity: 1 - index * 0.03 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.wordText,
                          { fontSize: Math.max(12, 18 - index * 0.5) },
                        ]}
                      >
                        {item.word}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>
          )}

          {/* Recurring Themes */}
          {patterns && patterns.recurring_themes && patterns.recurring_themes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="key" size={24} color="#00ffff" />
                <Text style={styles.sectionTitle}>Recurring Themes</Text>
              </View>
              <GlassCard>
                {patterns.recurring_themes.slice(0, 5).map((theme: any) => {
                  const maxCount = patterns.recurring_themes[0]?.count || 1;
                  const percentage = (theme.count / maxCount) * 100;
                  return (
                    <View key={theme.name} style={styles.symbolRow}>
                      <Text style={styles.symbolName}>{theme.name}</Text>
                      <View style={styles.symbolBar}>
                        <View
                          style={[
                            styles.symbolFill,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.symbolPercent}>
                        {theme.count}x
                      </Text>
                    </View>
                  );
                })}
              </GlassCard>
            </View>
          )}

          {/* Monthly Activity */}
          {patterns && patterns.monthly_activity.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bar-chart" size={24} color="#10b981" />
                <Text style={styles.sectionTitle}>Monthly Activity</Text>
              </View>
              <GlassCard>
                <View style={styles.activityChart}>
                  {patterns.monthly_activity.slice(-6).map((month) => (
                    <View key={month.month} style={styles.activityBar}>
                      <View
                        style={[
                          styles.activityFill,
                          {
                            height: `${Math.min(
                              100,
                              (month.count / Math.max(...patterns.monthly_activity.map((m) => m.count))) * 100
                            )}%`,
                          },
                        ]}
                      />
                      <Text style={styles.activityLabel}>
                        {month.month.split('-')[1]}
                      </Text>
                      <Text style={styles.activityCount}>{month.count}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>
          )}

          {/* Empty State */}
          {(!patterns || patterns.total_analyzed === 0) && (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="telescope" size={48} color="#64748b" />
              <Text style={styles.emptyTitle}>No patterns yet</Text>
              <Text style={styles.emptyText}>
                Record more dreams to discover patterns and insights
              </Text>
            </GlassCard>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    flex: 1,
  },
  achievementCount: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#64748b',
  },
  achievementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 70,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 10,
    fontFamily: 'Manrope_500Medium',
    color: '#ffffff',
    textAlign: 'center',
  },
  achievementCard: {
    marginBottom: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  lockedIcon: {
    fontSize: 28,
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
  achievementDesc: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
    color: '#64748b',
    textAlign: 'right',
  },
  wordCloudCard: {
    padding: 16,
  },
  wordCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  wordBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 16,
  },
  wordText: {
    fontFamily: 'Manrope_500Medium',
    color: '#ffffff',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolName: {
    width: 80,
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  symbolBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  symbolFill: {
    height: '100%',
    backgroundColor: '#00ffff',
    borderRadius: 4,
  },
  symbolPercent: {
    width: 40,
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#64748b',
    textAlign: 'right',
  },
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  activityBar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: 40,
  },
  activityFill: {
    width: 24,
    backgroundColor: '#10b981',
    borderRadius: 4,
    minHeight: 4,
  },
  activityLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_500Medium',
    color: '#64748b',
    marginTop: 8,
  },
  activityCount: {
    fontSize: 10,
    fontFamily: 'Manrope_500Medium',
    color: '#ffffff',
    marginTop: 2,
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
});
