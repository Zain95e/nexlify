import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/theme';
import ScreenTimeModule, { InstalledApp } from '../modules/screen-time/ScreenTimeModule';
import { fetchAppLimits, updateAppLimits } from '../src/api/screenTimeApi';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppBlockingScreen() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppsAndLimits();
  }, []);

  const loadAppsAndLimits = async () => {
    try {
      const installed = await ScreenTimeModule.getInstalledApps();
      const userLimits = await fetchAppLimits();
      
      const limitMap: Record<string, number> = {};
      userLimits.forEach((l) => {
        limitMap[l.app_package] = l.daily_limit_minutes;
      });
      
      setApps(installed.sort((a, b) => a.appName.localeCompare(b.appName)));
      setLimits(limitMap);
      
      const blockedPackages = Object.keys(limitMap).filter(k => limitMap[k] > 0);
      ScreenTimeModule.setBlockedApps(blockedPackages);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAppLimit = (pkg: string, value: boolean) => {
    const newLimits = { ...limits };
    if (value) {
      newLimits[pkg] = 30; // default 30 mins
    } else {
      delete newLimits[pkg];
    }
    setLimits(newLimits);
    saveLimits(newLimits);
  };

  const updateTime = (pkg: string, mins: string) => {
    const val = parseInt(mins, 10);
    if (isNaN(val)) return;
    
    const newLimits = { ...limits, [pkg]: val };
    setLimits(newLimits);
  };

  const saveLimits = async (newLimits: Record<string, number>) => {
    try {
      const limitsArray = Object.keys(newLimits).map(pkg => ({
        app_package: pkg,
        daily_limit_minutes: newLimits[pkg]
      }));
      await updateAppLimits(limitsArray);
      
      const blockedPackages = Object.keys(newLimits).filter(k => newLimits[k] > 0);
      ScreenTimeModule.setBlockedApps(blockedPackages);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>App Limits</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Blocking Stats (This Week)</Text>
          <View style={styles.barContainer}>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Respected (85%)</Text>
              <View style={[styles.bar, { width: '85%', backgroundColor: Colors.success }]} />
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Overridden (15%)</Text>
              <View style={[styles.bar, { width: '15%', backgroundColor: Colors.error }]} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Installed Apps</Text>
        {apps.map((app) => {
          const isBlocked = limits[app.packageName] !== undefined;
          return (
            <View key={app.packageName} style={styles.appRow}>
              <View style={styles.appInfo}>
                <Text style={styles.appName} numberOfLines={1}>{app.appName}</Text>
                <Text style={styles.appPkg}>{app.packageName}</Text>
              </View>
              
              {isBlocked && (
                <View style={styles.limitInputContainer}>
                  <TextInput
                    style={styles.limitInput}
                    keyboardType="numeric"
                    value={limits[app.packageName].toString()}
                    onChangeText={(txt) => updateTime(app.packageName, txt)}
                    onBlur={() => saveLimits(limits)}
                  />
                  <Text style={styles.minsLabel}>mins</Text>
                </View>
              )}
              
              <Switch
                value={isBlocked}
                onValueChange={(val) => toggleAppLimit(app.packageName, val)}
                trackColor={{ true: Colors.primary, false: Colors.border }}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backBtn: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '800', fontFamily: 'Syne', color: Colors.text },
  statsCard: { backgroundColor: Colors.card, padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Syne', marginBottom: 16, color: Colors.text },
  barContainer: { gap: 12 },
  barRow: { width: '100%' },
  barLabel: { fontSize: 12, color: Colors.muted, marginBottom: 4, fontFamily: 'DM Sans' },
  bar: { height: 12, borderRadius: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Syne', marginBottom: 16, color: Colors.text },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  appInfo: { flex: 1, marginRight: 8 },
  appName: { fontSize: 16, fontWeight: '600', color: Colors.text, fontFamily: 'DM Sans' },
  appPkg: { fontSize: 12, color: Colors.muted, fontFamily: 'DM Sans' },
  limitInputContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  limitInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, width: 50, textAlign: 'center', padding: 4, fontFamily: 'DM Sans', color: Colors.text },
  minsLabel: { fontSize: 12, color: Colors.muted, marginLeft: 4, fontFamily: 'DM Sans' }
});
