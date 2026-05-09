import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/theme';
import api from '../../src/api';
import { RootState } from '../../src/store';
import { PremiumAppUsageChart } from '../../src/components/PremiumAppUsageChart';
import { CategoryPieChart } from '../../src/components/CategoryPieChart';
import { ScreenTimeLineChart } from '../../src/components/ScreenTimeLineChart';
import { TimeFrameToggle } from '../../src/components/TimeFrameToggle';

export default function HomeScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');

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

  const dummyAppUsage = [
    { name: 'Instagram', duration: '1h 12m', percentage: 85, color: Colors.secondary },
    { name: 'WhatsApp', duration: '45m', percentage: 60, color: Colors.tertiary },
    { name: 'YouTube', duration: '32m', percentage: 45, color: Colors.warning },
    { name: 'LinkedIn', duration: '12m', percentage: 20, color: Colors.primary },
    { name: 'TikTok', duration: '8m', percentage: 15, color: '#FF0050' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Screen Time Header (3.3.1) */}
        <View style={styles.screenTimeHeader}>
          <Text style={styles.screenTimeLabel}>Today's Screen Time</Text>
          <Text style={styles.screenTimeValue}>{timeFrame === 'day' ? '3h 42m' : timeFrame === 'week' ? '24h 15m' : '92h 40m'}</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-down" size={14} color={Colors.success} />
            <Text style={styles.trendText}>12% less than last {timeFrame}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <TimeFrameToggle value={timeFrame} onChange={setTimeFrame} />
        </View>

        {/* App Usage Chart (3.3.2) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top App Usage</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Details</Text>
            </TouchableOpacity>
          </View>
          <PremiumAppUsageChart />
        </View>

        {/* Category Pie Chart (3.3.3) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <CategoryPieChart />
        </View>

        {/* Monthly Trend (3.3.4) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>30-Day Trend</Text>
          <ScreenTimeLineChart />
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
  screenTimeHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  screenTimeLabel: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    marginBottom: 8,
  },
  screenTimeValue: {
    fontSize: 48,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trendText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
    fontFamily: 'DM Sans',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAll: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Syne',
    fontWeight: '700',
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
