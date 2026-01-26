import React, { useState, useCallback } from 'react';
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import StarryBackground from '@/src/components/StarryBackground';
import GlassCard from '@/src/components/GlassCard';
import { useDreamStore } from '@/src/store/dreamStore';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { calendarData, fetchCalendar } = useDreamStore();

  useFocusEffect(
    useCallback(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      fetchCalendar(year, month);
    }, [currentDate])
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDreamsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarData?.dreams_by_date?.[dateStr] || [];
  };

  const handleDayPress = (date: Date) => {
    const dreams = getDreamsForDate(date);
    if (dreams.length === 1) {
      router.push(`/dream/${dreams[0].id}`);
    } else if (dreams.length > 1) {
      // Navigate to a filtered list or show a modal
      router.push(`/dream/${dreams[0].id}`);
    }
  };

  return (
    <StarryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Dream Calendar</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassCard style={styles.calendarCard}>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={() => navigateMonth('prev')}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {format(currentDate, 'MMMM yyyy')}
              </Text>
              <TouchableOpacity
                onPress={() => navigateMonth('next')}
                style={styles.navButton}
              >
                <Ionicons name="chevron-forward" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.dayCell} />
              ))}

              {/* Day cells */}
              {days.map((day) => {
                const dreams = getDreamsForDate(day);
                const hasDreams = dreams.length > 0;
                const isCurrentDay = isToday(day);

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isCurrentDay && styles.todayCell,
                    ]}
                    onPress={() => hasDreams && handleDayPress(day)}
                    disabled={!hasDreams}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isCurrentDay && styles.todayNumber,
                        hasDreams && styles.dayWithDream,
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                    {hasDreams && (
                      <View style={styles.dreamIndicator}>
                        {dreams.slice(0, 3).map((_, i) => (
                          <View key={i} style={styles.dreamDot} />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
              <Text style={styles.legendText}>Dream recorded</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00ffff' }]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  calendarCard: {
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: 'Manrope_600SemiBold',
    color: '#ffffff',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#94a3b8',
  },
  todayNumber: {
    color: '#00ffff',
    fontFamily: 'Manrope_700Bold',
  },
  dayWithDream: {
    color: '#ffffff',
  },
  dreamIndicator: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  dreamDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a855f7',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: '#94a3b8',
  },
});
