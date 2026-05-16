import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/theme';
import ScreenTimeModule, { InstalledApp } from '../modules/screen-time/ScreenTimeModule';
import { startDetoxSession } from '../src/api/detoxApi';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DetoxConfigScreen() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [duration, setDuration] = useState('60');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const installed = await ScreenTimeModule.getInstalledApps();
      setApps(installed.sort((a, b) => a.appName.localeCompare(b.appName)));
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWhitelist = (pkg: string, value: boolean) => {
    if (value) {
      setWhitelist([...whitelist, pkg]);
    } else {
      setWhitelist(whitelist.filter(p => p !== pkg));
    }
  };

  const startCustomDetox = async () => {
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0) return alert('Invalid duration');
    
    ScreenTimeModule.startDetox(mins, whitelist);
    await startDetoxSession(mins);
    alert(`Detox started for ${mins} minutes!`);
    router.back();
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
          <Text style={styles.label}>Detox Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <Text style={styles.sectionTitle}>Allowed Apps (Whitelist)</Text>
        <Text style={styles.helpText}>Phone, Messages, and Settings are always allowed natively.</Text>
        
        {apps.map((app) => {
          const isAllowed = whitelist.includes(app.packageName);
          return (
            <View key={app.packageName} style={styles.appRow}>
              <View style={styles.appInfo}>
                <Text style={styles.appName} numberOfLines={1}>{app.appName}</Text>
                <Text style={styles.appPkg}>{app.packageName}</Text>
              </View>
              
              <Switch
                value={isAllowed}
                onValueChange={(val) => toggleWhitelist(app.packageName, val)}
                trackColor={{ true: Colors.success, false: Colors.border }}
              />
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={startCustomDetox}>
          <Text style={styles.startBtnText}>Start Detox</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 100 },
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
