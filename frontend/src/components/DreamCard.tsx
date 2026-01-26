import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../store/dreamStore';
import GlassCard from './GlassCard';
import { format } from 'date-fns';

interface DreamCardProps {
  dream: Dream;
  onPress: () => void;
}

const DreamCard: React.FC<DreamCardProps> = ({ dream, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {dream.title}
            </Text>
            {dream.is_lucid && (
              <View style={styles.lucidBadge}>
                <Ionicons name="eye" size={12} color="#00ffff" />
                <Text style={styles.lucidText}>Lucid</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>
            {format(new Date(dream.date), 'MMM d, yyyy')}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {dream.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.themes}>
            {dream.themes.slice(0, 2).map((theme, index) => (
              <View key={index} style={styles.themeBadge}>
                <Text style={styles.themeText}>{theme}</Text>
              </View>
            ))}
            {dream.themes.length > 2 && (
              <Text style={styles.moreThemes}>+{dream.themes.length - 2}</Text>
            )}
          </View>
          
          <View style={styles.indicators}>
            {dream.ai_insight && (
              <Ionicons name="sparkles" size={16} color="#a855f7" />
            )}
            {dream.is_public && (
              <Ionicons name="globe-outline" size={16} color="#64748b" style={styles.icon} />
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  lucidText: {
    fontSize: 10,
    color: '#00ffff',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeText: {
    fontSize: 12,
    color: '#a855f7',
  },
  moreThemes: {
    fontSize: 12,
    color: '#64748b',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 8,
  },
});

export default DreamCard;
