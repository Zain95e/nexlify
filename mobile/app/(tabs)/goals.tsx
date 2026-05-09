import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/theme';

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h1, { color: Colors.text }]}>Goals</Text>
      <Text style={[Typography.body, { color: Colors.muted, marginTop: 8 }]}>
        Track your long-term objectives.
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
