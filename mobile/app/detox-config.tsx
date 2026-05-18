import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/theme';
import ScreenTimeModule, { InstalledApp } from '../modules/screen-time/ScreenTimeModule';
import { startDetoxSession } from '../src/api/detoxApi';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const POPULAR_DISTRACTIONS = [
  { appName: '📸 Instagram', packageName: 'com.instagram.android' },
  { appName: '🎥 YouTube', packageName: 'com.google.android.youtube' },
  { appName: '🤖 Reddit', packageName: 'com.reddit.frontpage' },
  { appName: '👥 Facebook', packageName: 'com.facebook.katana' },
  { appName: '🎵 TikTok', packageName: 'com.zhiliaoapp.musically' },
  { appName: '🐦 X / Twitter', packageName: 'com.twitter.android' },
  { appName: '👻 Snapchat', packageName: 'com.snapchat.android' },
  { appName: '💬 WhatsApp', packageName: 'com.whatsapp' },
];

export default function DetoxConfigScreen() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  // Automatically select Instagram, YouTube, Reddit, and Facebook to be blocked by default!
  const [blockedApps, setBlockedApps] = useState<string[]>([
    'com.instagram.android',
    'com.google.android.youtube',
    'com.reddit.frontpage',
    'com.facebook.katana',
  ]);
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const installed = await ScreenTimeModule.getInstalledApps();
      
      // Filter out system apps and essentials that should never be blocked
      const filteredInstalled = (installed || []).filter(app => {
        const pkg = app.packageName.toLowerCase();
        return !pkg.includes('dialer') && 
               !pkg.includes('telecom') && 
               !pkg.includes('messaging') && 
               !pkg.includes('mms') &&
               !pkg.includes('settings') &&
               pkg !== 'com.nexlify';
      });

      // Merge with POPULAR_DISTRACTIONS to ensure they always show up
      const mergedList = [...POPULAR_DISTRACTIONS];
      filteredInstalled.forEach(instApp => {
        if (!mergedList.some(item => item.packageName === instApp.packageName)) {
          mergedList.push({
            appName: `📦 ${instApp.appName}`,
            packageName: instApp.packageName,
          });
        }
      });

      setApps(mergedList.sort((a, b) => a.appName.localeCompare(b.appName)));
    } catch (e) {
      console.warn('Native installed apps fetch error:', e);
      // Fallback to our popular distractions list if native call fails
      setApps(POPULAR_DISTRACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlocked = (pkg: string, shouldBlock: boolean) => {
    if (shouldBlock) {
      setBlockedApps([...blockedApps, pkg]);
    } else {
      setBlockedApps(blockedApps.filter(p => p !== pkg));
    }
  };

  const startCustomDetox = async () => {
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert('Error', 'Please enter a valid duration.');
      return;
    }
    
    // Whitelist is all apps that are NOT blocked
    const whitelist = apps
      .map(app => app.packageName)
      .filter(pkg => !blockedApps.includes(pkg));

    try {
      ScreenTimeModule.startDetox(mins, whitelist);
      await startDetoxSession(mins);
      Alert.alert('Success', `Focus session started! Blocked apps are now restricted.`);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', 'Failed to start Focus session.');
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
          <Text style={styles.title}>Detox Config</Text>
        </View>

        <View style={styles.configCard}>
          <Text style={styles.label}>Focus Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 30"
            placeholderTextColor={Colors.muted}
          />
        </View>

        <Text style={styles.sectionTitle}>Distraction App Blocker</Text>
        <Text style={styles.helpText}>Toggle apps to BLOCK them during your focus session. Pre-selected apps are blocked automatically.</Text>
        
        {apps.map((app) => {
          const isBlocked = blockedApps.includes(app.packageName);
          return (
            <View key={app.packageName} style={styles.appRow}>
              <View style={styles.appInfo}>
                <Text style={styles.appName} numberOfLines={1}>{app.appName}</Text>
                <Text style={styles.appPkg}>{app.packageName}</Text>
              </View>
              
              <Switch
                value={isBlocked}
                onValueChange={(val) => toggleBlocked(app.packageName, val)}
                trackColor={{ true: Colors.error, false: Colors.border }}
                thumbColor={isBlocked ? Colors.error : Colors.muted}
              />
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={startCustomDetox}>
          <Text style={styles.startBtnText}>Start Focus Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backBtn: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '800', fontFamily: 'Syne', color: Colors.text },
  configCard: { backgroundColor: Colors.card, padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: Colors.border },
  label: { fontSize: 14, fontWeight: '600', fontFamily: 'DM Sans', marginBottom: 8, color: Colors.text },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, fontFamily: 'DM Sans', color: Colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Syne', color: Colors.text },
  helpText: { fontSize: 12, color: Colors.muted, fontFamily: 'DM Sans', marginBottom: 16, marginTop: 4 },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  appInfo: { flex: 1, marginRight: 8 },
  appName: { fontSize: 16, fontWeight: '600', color: Colors.text, fontFamily: 'DM Sans' },
  appPkg: { fontSize: 12, color: Colors.muted, fontFamily: 'DM Sans' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  startBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: '700', fontFamily: 'Syne' }
});
