import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../api';
import { Colors } from '../theme';

interface TodayStats {
  completedSessions: number;
  totalMinutes: number;
}

export const TodaysFocusCard: React.FC = () => {
  const [stats, setStats] = useState<TodayStats>({ completedSessions: 0, totalMinutes: 0 });
  const router = useRouter();

  useEffect(() => {
    // Fetch today's completed pomodoro sessions from backend
    const fetchStats = async () => {
      try {
        const res = await api.get('/pomodoro/today');
        setStats({
          completedSessions: res.data.data.count ?? 0,
          totalMinutes: res.data.data.total_minutes ?? 0,
        });
      } catch {
        // Silently fail — card shows zeros
      }
    };
    fetchStats();
  }, []);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push('/(tabs)/pomodoro' as any)}
    >
      <View style={styles.iconBox}>
        <Ionicons name="timer" size={22} color={Colors.primary} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Today's Focus</Text>
        <Text style={styles.subtitle}>
          {stats.completedSessions} Pomodoro{stats.completedSessions !== 1 ? 's' : ''} · {stats.totalMinutes} min focused
        </Text>
      </View>

      <View style={styles.sessionsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < stats.completedSessions % 4 && styles.dotFilled,
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { flex: 1 },
  title: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: 'DM Sans',
    fontSize: 12,
    color: Colors.muted,
  },
  sessionsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotFilled: { backgroundColor: Colors.primary },
});
