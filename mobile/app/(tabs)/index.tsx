import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/theme';
import api from '../../src/api';
import { RootState } from '../../src/store';

export default function HomeScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {user?.level || 1}</Text>
          </View>
        </View>

        {/* Weekly Summary Card (4.2.6) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Weekly Progress</Text>
            <Text style={styles.summarySubtitle}>
              {stats ? `You've completed ${stats.currentWeek.rate}% this week` : 'Loading progress...'}
            </Text>
            {stats && (
              <View style={styles.comparisonRow}>
                <Ionicons 
                  name={stats.currentWeek.rate >= stats.lastWeek.rate ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={stats.currentWeek.rate >= stats.lastWeek.rate ? Colors.success : Colors.error} 
                />
                <Text style={styles.comparisonText}>
                  vs {stats.lastWeek.rate}% last week
                </Text>
              </View>
            )}
          </View>
          <View style={styles.progressContainer}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <View style={styles.circularProgress}>
                <Text style={styles.progressValue}>{stats?.currentWeek.rate || 0}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>{user?.total_points || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Focus Shortcuts</Text>
        </View>
        
        {/* Placeholder for shortcuts */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Timer and Diary shortcuts coming soon!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: Colors.muted,
    fontFamily: 'DM Sans',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  levelText: {
    color: Colors.primary,
    fontWeight: '700',
    fontFamily: 'Syne',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    lineHeight: 18,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  comparisonText: {
    fontSize: 12,
    color: Colors.muted,
    marginLeft: 4,
    fontFamily: 'DM Sans',
  },
  progressContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  placeholderCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    textAlign: 'center',
  },
});
