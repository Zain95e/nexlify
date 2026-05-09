import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors } from '../theme';

export const CategoryPieChart = () => {
  const pieData = [
    { value: 45, color: Colors.primary, text: '45%', label: 'Social' },
    { value: 30, color: Colors.tertiary, text: '30%', label: 'Work' },
    { value: 25, color: Colors.secondary, text: '25%', label: 'Fun' },
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
    width: 60,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'DM Sans',
  },
});
