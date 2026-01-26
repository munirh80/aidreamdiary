import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import { useDreamStore } from '@/src/store/dreamStore';
import { THEMES } from '@/src/config/api';

export default function CreateDreamScreen() {
  const { createDream, isLoading } = useDreamStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [isLucid, setIsLucid] = useState(false);

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme)
        ? prev.filter((t) => t !== theme)
        : [...prev, theme]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a dream title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your dream');
      return;
    }

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const dream = await createDream({
      title: title.trim(),
      description: description.trim(),
      date,
      themes: selectedThemes,
      tags: tagList,
      is_lucid: isLucid,
    });

    if (dream) {
      Alert.alert('Success', 'Dream recorded successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedThemes([]);
      setTags('');
      setIsLucid(false);
    } else {
      Alert.alert('Error', 'Failed to save dream. Please try again.');
    }
  };

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Record Dream</Text>
            <Text style={styles.subtitle}>Capture the essence of your journey</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <GlassCard style={styles.card}>
              <Text style={styles.label}>Dream Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Give your dream a name..."
                placeholderTextColor="#64748b"
                value={title}
                onChangeText={setTitle}
              />
            </GlassCard>

            {/* Description */}
            <GlassCard style={styles.card}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what happened in your dream..."
                placeholderTextColor="#64748b"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </GlassCard>

            {/* Themes */}
            <GlassCard style={styles.card}>
              <Text style={styles.label}>Themes</Text>
              <View style={styles.themesGrid}>
                {THEMES.map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.themeChip,
                      selectedThemes.includes(theme) && styles.themeChipSelected,
                    ]}
                    onPress={() => toggleTheme(theme)}
                  >
                    <Text
                      style={[
                        styles.themeChipText,
                        selectedThemes.includes(theme) && styles.themeChipTextSelected,
                      ]}
                    >
                      {theme}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* Tags */}
            <GlassCard style={styles.card}>
              <Text style={styles.label}>Custom Tags</Text>
              <TextInput
                style={styles.input}
                placeholder="adventure, flying, ocean (comma separated)"
                placeholderTextColor="#64748b"
                value={tags}
                onChangeText={setTags}
              />
            </GlassCard>

            {/* Lucid Toggle */}
            <GlassCard style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Ionicons name="eye" size={24} color="#00ffff" />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleLabel}>Lucid Dream</Text>
                    <Text style={styles.toggleDescription}>
                      Were you aware you were dreaming?
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isLucid}
                  onValueChange={setIsLucid}
                  trackColor={{ false: '#374151', true: 'rgba(0, 255, 255, 0.3)' }}
                  thumbColor={isLucid ? '#00ffff' : '#9ca3af'}
                />
              </View>
            </GlassCard>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Ionicons name="save" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Dream'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
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
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeChipSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#a855f7',
  },
  themeChipText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#94a3b8',
  },
  themeChipTextSelected: {
    color: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
  toggleDescription: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    marginTop: 2,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
});
