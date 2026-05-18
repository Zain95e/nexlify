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
import ScreenTimeModule from '../../modules/screen-time/ScreenTimeModule';
import { startDetoxSession } from '../../src/api/detoxApi';
import { router } from 'expo-router';
import { TodaysFocusCard } from '../../src/components/TodaysFocusCard';

export default function HomeScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');

  // Real screen time data states
  const [dailyUsage, setDailyUsage] = useState<any>(null);
  const [weeklyUsage, setWeeklyUsage] = useState<any[]>([]);
  const [monthlyUsage, setMonthlyUsage] = useState<any[]>([]);
  const [appLimits, setAppLimits] = useState<any[]>([]);
  const [hasUsagePermission, setHasUsagePermission] = useState(true);

  const fetchStats = async () => {
    try {
      // 1. Sync native screen time statistics to the backend if on Android and permission is granted
      try {
        const hasPermission = ScreenTimeModule.hasUsagePermission();
        setHasUsagePermission(hasPermission);
        if (hasPermission) {
          const rawStats = await ScreenTimeModule.getUsageStats();
          if (rawStats && rawStats.length > 0) {
            await api.post('/screentime', { records: rawStats });
            console.log('[HomeScreen] Synced native screen time stats with backend');
          }
        }
      } catch (err) {
        console.warn('[HomeScreen] Native stats sync failed:', err);
      }

      // 2. Fetch all synchronized statistics from backend
      const [dailyRes, weeklyRes, monthlyRes, limitsRes, statsRes] = await Promise.all([
        api.get('/screentime/daily').catch(() => null),
        api.get('/screentime/weekly').catch(() => null),
        api.get('/screentime/monthly').catch(() => null),
        api.get('/screentime/limits').catch(() => null),
        api.get('/tasks/stats').catch(() => null),
      ]);

      if (dailyRes?.data?.success) setDailyUsage(dailyRes.data.data);
      if (weeklyRes?.data?.success) setWeeklyUsage(weeklyRes.data.data);
      if (monthlyRes?.data?.success) setMonthlyUsage(monthlyRes.data.data);
      if (limitsRes?.data?.success) setAppLimits(limitsRes.data.data);
      if (statsRes?.data?.success) setStats(statsRes.data.data);
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

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getScreenTimeValue = () => {
    if (timeFrame === 'day') {
      return formatDuration(dailyUsage?.total_minutes || 0);
    } else if (timeFrame === 'week') {
      const totalMins = weeklyUsage.reduce((sum, d) => sum + (d.total_minutes || 0), 0);
      return formatDuration(totalMins);
    } else {
      const totalMins = monthlyUsage.reduce((sum, d) => sum + (d.total_minutes || 0), 0);
      return formatDuration(totalMins);
    }
  };

  const getTrendText = () => {
    if (timeFrame === 'day') {
      return 'based on active daily usage';
    } else if (timeFrame === 'week') {
      return 'past 7 days aggregated';
    } else {
      return 'past 30 days total';
    }
  };

  const getAppChartData = () => {
    if (!dailyUsage?.apps || dailyUsage.apps.length === 0) return undefined;
    return dailyUsage.apps.slice(0, 5).map((app: any) => {
      const limitRecord = appLimits.find((l: any) => l.app_package === app.app_package);
      return {
        value: app.duration_minutes,
        label: app.app_name.length > 5 ? `${app.app_name.slice(0, 4)}.` : app.app_name,
        limit: limitRecord ? limitRecord.daily_limit_minutes : undefined,
      };
    });
  };

  const getCategoryData = () => {
    if (timeFrame === 'day') {
      if (!dailyUsage?.apps || dailyUsage.apps.length === 0) return undefined;
      const cats = { social: 0, productivity: 0, entertainment: 0, other: 0 };
      let totalMins = 0;
      dailyUsage.apps.forEach((app: any) => {
        const cat = app.category || 'other';
        if (cats.hasOwnProperty(cat)) {
          (cats as any)[cat] += app.duration_minutes;
          totalMins += app.duration_minutes;
        }
      });
      return totalMins > 0 ? cats : undefined;
    } else if (timeFrame === 'week') {
      if (!weeklyUsage || weeklyUsage.length === 0) return undefined;
      const cats = { social: 0, productivity: 0, entertainment: 0, other: 0 };
      let totalMins = 0;
      weeklyUsage.forEach((day: any) => {
        cats.social += day.social || 0;
        cats.productivity += day.productivity || 0;
        cats.entertainment += day.entertainment || 0;
        cats.other += day.other || 0;
        totalMins += (day.social || 0) + (day.productivity || 0) + (day.entertainment || 0) + (day.other || 0);
      });
      return totalMins > 0 ? cats : undefined;
    }
    return undefined;
  };

  const getLineChartData = () => {
    if (timeFrame === 'week') {
      return weeklyUsage.map((day: any) => ({
        date: day.date,
        total_minutes: day.total_minutes,
      }));
    } else if (timeFrame === 'month') {
      return monthlyUsage;
    }
    return undefined;
  };

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
          <Text style={styles.screenTimeValue}>{getScreenTimeValue()}</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-down" size={14} color={Colors.success} />
            <Text style={styles.trendText}>{getTrendText()}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <TimeFrameToggle value={timeFrame} onChange={setTimeFrame} />
        </View>

        {!hasUsagePermission && (
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.warning} />
              <Text style={styles.permissionTitle}>Usage Stats Access Required</Text>
            </View>
            <Text style={styles.permissionText}>
              To display and sync your screen time statistics, please enable Usage Access in your Android System Settings.
            </Text>
            <TouchableOpacity 
              style={styles.permissionBtn}
              onPress={() => {
                ScreenTimeModule.requestUsagePermission();
              }}
            >
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
              <Ionicons name="open-outline" size={16} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* App Usage Chart (3.3.2) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top App Usage</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Details</Text>
            </TouchableOpacity>
          </View>
          {getAppChartData() ? (
            <PremiumAppUsageChart data={getAppChartData()} />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="bar-chart-outline" size={32} color={Colors.muted} />
              <Text style={styles.emptyStateText}>No app usage recorded yet</Text>
            </View>
          )}
        </View>

        {/* Category Pie Chart (3.3.3) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {getCategoryData() ? (
            <CategoryPieChart data={getCategoryData()} />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="pie-chart-outline" size={32} color={Colors.muted} />
              <Text style={styles.emptyStateText}>No categories to display</Text>
            </View>
          )}
        </View>

        {/* Monthly Trend (3.3.4) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{timeFrame === 'month' ? '30-Day Trend' : '7-Day Trend'}</Text>
          {getLineChartData() && getLineChartData()!.length > 0 ? (
            <ScreenTimeLineChart data={getLineChartData()} />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="trending-up-outline" size={32} color={Colors.muted} />
              <Text style={styles.emptyStateText}>No trend data available yet</Text>
            </View>
          )}
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

        {/* Today's Focus — Pomodoro stats card (8.3) */}
        <TodaysFocusCard />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Focus Shortcuts</Text>
          <TouchableOpacity onPress={() => router.push('/blocking' as any)}>
            <Text style={styles.viewAll}>App Limits</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.shortcutsGrid}>
          {/* Quick Detox Button (5.3.2) */}
          <TouchableOpacity 
            style={[styles.shortcutBox, { backgroundColor: 'rgba(255, 0, 80, 0.1)', borderColor: 'rgba(255, 0, 80, 0.3)' }]}
            onPress={async () => {
              ScreenTimeModule.startDetox(30, []);
              await startDetoxSession(30);
              alert('Quick Detox started for 30 minutes!');
            }}
          >
            <Ionicons name="flash" size={24} color="#FF0050" />
            <Text style={[styles.shortcutText, { color: '#FF0050' }]}>Quick Detox</Text>
            <Text style={styles.shortcutSub}>30 min block</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.shortcutBox, { backgroundColor: 'rgba(108, 99, 255, 0.1)', borderColor: 'rgba(108, 99, 255, 0.3)' }]}
            onPress={() => router.push('/detox-config' as any)}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.primary} />
            <Text style={[styles.shortcutText, { color: Colors.primary }]}>Detox Config</Text>
            <Text style={styles.shortcutSub}>Custom & Whitelist</Text>
          </TouchableOpacity>
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
  shortcutsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  shortcutBox: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Syne',
    marginTop: 8,
    marginBottom: 4,
  },
  shortcutSub: {
    fontSize: 12,
    fontFamily: 'DM Sans',
    color: Colors.muted,
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    textAlign: 'center',
    marginTop: 12,
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne',
    color: Colors.warning,
    marginLeft: 8,
  },
  permissionText: {
    fontSize: 13,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    lineHeight: 18,
    marginBottom: 16,
  },
  permissionBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.warning,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Syne',
  },
});
