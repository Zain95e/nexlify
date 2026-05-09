import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../theme';

interface AppUsage {
  name: string;
  duration: string;
  percentage: number;
  color: string;
}

interface AppUsageChartProps {
  data: AppUsage[];
}

export const AppUsageChart: React.FC<AppUsageChartProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.barWrapper}>
          <View style={styles.labelRow}>
            <Text style={styles.appName}>{item.name}</Text>
            <Text style={styles.duration}>{item.duration}</Text>
          </View>
          <View style={styles.backgroundBar}>
            <View 
              style={[
                styles.filledBar, 
                { width: `${item.percentage}%`, backgroundColor: item.color }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  barWrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'DM Sans',
  },
  duration: {
    fontSize: 11,
    color: Colors.muted,
    fontFamily: 'DM Sans',
  },
  backgroundBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filledBar: {
    height: '100%',
    borderRadius: 4,
  },
});
