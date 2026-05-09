import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/theme';

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h1, { color: Colors.text }]}>Tasks</Text>
      <Text style={[Typography.body, { color: Colors.muted, marginTop: 8 }]}>
        Manage your daily productivity tasks here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
