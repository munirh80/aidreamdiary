import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import { useDreamStore, Dream } from '@/src/store/dreamStore';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dreams, updateDream, deleteDream, generateInsight } = useDreamStore();
  const [dream, setDream] = useState<Dream | null>(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  useEffect(() => {
    const found = dreams.find((d) => d.id === id);
    setDream(found || null);
  }, [id, dreams]);

  const handleGenerateInsight = async () => {
    if (!dream) return;
    setGeneratingInsight(true);
    const insight = await generateInsight(dream.id);
    if (insight) {
      setDream((prev) => prev ? { ...prev, ai_insight: insight } : null);
    } else {
      Alert.alert('Error', 'Failed to generate insight. Please try again.');
    }
    setGeneratingInsight(false);
  };

  const handleTogglePublic = async () => {
    if (!dream) return;
    const updated = await updateDream(dream.id, { is_public: !dream.is_public });
    if (updated) {
      setDream(updated);
    }
  };

  const handleShare = async () => {
    if (!dream) return;
    try {
      await Share.share({
        message: `Check out my dream: "${dream.title}"\n\n${dream.description}`,
        title: dream.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (dream) {
              await deleteDream(dream.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!dream) {
    return (
      <StarryBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a855f7" />
            <Text style={styles.loadingText}>Loading dream...</Text>
          </View>
        </SafeAreaView>
      </StarryBackground>
    );
  }

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{dream.title}</Text>
            <Text style={styles.date}>
              {format(new Date(dream.date), 'EEEE, MMMM d, yyyy')}
            </Text>
            <View style={styles.badges}>
              {dream.is_lucid && (
                <View style={styles.lucidBadge}>
                  <Ionicons name="eye" size={14} color="#00ffff" />
                  <Text style={styles.lucidText}>Lucid Dream</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleTogglePublic}
                style={[styles.publicBadge, dream.is_public && styles.publicBadgeActive]}
              >
                <Ionicons
                  name={dream.is_public ? 'globe' : 'lock-closed'}
                  size={14}
                  color={dream.is_public ? '#10b981' : '#64748b'}
                />
                <Text style={[styles.publicText, dream.is_public && styles.publicTextActive]}>
                  {dream.is_public ? 'Public' : 'Private'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Dream Description</Text>
            <Text style={styles.description}>{dream.description}</Text>
          </GlassCard>

          {/* Themes & Tags */}
          {(dream.themes.length > 0 || dream.tags.length > 0) && (
            <GlassCard style={styles.card}>
              {dream.themes.length > 0 && (
                <View style={styles.tagSection}>
                  <Text style={styles.sectionTitle}>Themes</Text>
                  <View style={styles.tagRow}>
                    {dream.themes.map((theme) => (
                      <View key={theme} style={styles.themeBadge}>
                        <Text style={styles.themeText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {dream.tags.length > 0 && (
                <View style={styles.tagSection}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagRow}>
                    {dream.tags.map((tag) => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </GlassCard>
          )}

          {/* AI Insight */}
          <GlassCard style={styles.card}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles" size={20} color="#a855f7" />
              <Text style={styles.sectionTitle}>AI Dream Insight</Text>
            </View>
            {dream.ai_insight ? (
              <Text style={styles.insightText}>{dream.ai_insight}</Text>
            ) : (
              <View style={styles.noInsight}>
                <Text style={styles.noInsightText}>
                  Unlock the hidden meaning of your dream with AI-powered analysis
                </Text>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateInsight}
                  disabled={generatingInsight}
                >
                  {generatingInsight ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color="#ffffff" />
                      <Text style={styles.generateButtonText}>Generate Insight</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#ffffff',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  lucidText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: '#00ffff',
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  publicBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  publicText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: '#64748b',
  },
  publicTextActive: {
    color: '#10b981',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: '#e2e8f0',
    lineHeight: 24,
  },
  tagSection: {
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#a855f7',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#94a3b8',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    color: '#e2e8f0',
    lineHeight: 24,
  },
  noInsight: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noInsightText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a855f7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
});
