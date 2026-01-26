import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    const enabled = await AsyncStorage.getItem('notificationsEnabled');
    const time = await AsyncStorage.getItem('reminderTime');
    setNotificationsEnabled(enabled === 'true');
    if (time) setReminderTime(time);
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const toggleNotifications = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive dream reminders.'
        );
        return;
      }
    }

    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', value.toString());

    if (value) {
      await scheduleDailyReminder();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const scheduleDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const [hours, minutes] = reminderTime.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Dream Journal Reminder',
        body: 'Remember to record your dreams from last night!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  };

  const timeOptions = [
    { label: '6:00 AM', value: '06:00' },
    { label: '7:00 AM', value: '07:00' },
    { label: '8:00 AM', value: '08:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
  ];

  const selectTime = async (time: string) => {
    setReminderTime(time);
    await AsyncStorage.setItem('reminderTime', time);
    if (notificationsEnabled) {
      await scheduleDailyReminder();
    }
  };

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Dream Reminders</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassCard style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="notifications" size={24} color="#a855f7" />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleLabel}>Daily Reminders</Text>
                  <Text style={styles.toggleDescription}>
                    Get reminded to record your dreams
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#374151', true: 'rgba(168, 85, 247, 0.3)' }}
                thumbColor={notificationsEnabled ? '#a855f7' : '#9ca3af'}
              />
            </View>
          </GlassCard>

          {notificationsEnabled && (
            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Reminder Time</Text>
              <Text style={styles.sectionDescription}>
                Choose when you want to be reminded
              </Text>
              <View style={styles.timeOptions}>
                {timeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timeOption,
                      reminderTime === option.value && styles.timeOptionSelected,
                    ]}
                    onPress={() => selectTime(option.value)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        reminderTime === option.value && styles.timeOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          )}

          <GlassCard style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#64748b" />
            <Text style={styles.infoText}>
              Recording dreams right after waking up helps you remember more details. We recommend setting your reminder for shortly after your usual wake time.
            </Text>
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    marginBottom: 16,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeOptionSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#a855f7',
  },
  timeOptionText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#94a3b8',
  },
  timeOptionTextSelected: {
    color: '#ffffff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
    lineHeight: 20,
  },
});
