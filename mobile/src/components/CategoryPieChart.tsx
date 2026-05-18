import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors } from '../theme';

interface Props {
  data?: {
    social?: number;
    productivity?: number;
    entertainment?: number;
    other?: number;
  };
}

export const CategoryPieChart: React.FC<Props> = ({ data }) => {
  const social = data?.social || 0;
  const productivity = data?.productivity || 0;
  const entertainment = data?.entertainment || 0;
  const other = data?.other || 0;
  const total = social + productivity + entertainment + other;

  const pieData = total > 0 ? [
    { value: Math.round((social / total) * 100), color: Colors.primary, label: 'Social' },
    { value: Math.round((productivity / total) * 100), color: Colors.tertiary, label: 'Productivity' },
    { value: Math.round((entertainment / total) * 100), color: Colors.secondary, label: 'Entertainment' },
    { value: Math.round((other / total) * 100), color: Colors.warning, label: 'Other' },
  ].filter(item => item.value > 0) : [
    { value: 45, color: Colors.primary, label: 'Social' },
    { value: 30, color: Colors.tertiary, label: 'Productivity' },
    { value: 25, color: Colors.secondary, label: 'Entertainment' },
  ];

  return (
    <View style={styles.container}>
      <PieChart
        data={pieData}
        donut
        showGradient
        sectionAutoFocus
        radius={70}
        innerRadius={55}
        innerCircleColor={Colors.card}
        centerLabelComponent={() => {
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.centerText}>Usage</Text>
            </View>
          );
        }}
      />
      <View style={styles.legend}>
        {pieData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{item.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    width: '100%',
  },
  centerText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: 'Syne',
  },
  legend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    width: 90,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'DM Sans',
  },
});
