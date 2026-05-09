import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors } from '../theme';

interface AppUsageData {
  value: number;
  label: string;
  frontColor?: string;
  gradientColor?: string;
  limit?: number; // Added for 3.3.6
}

interface Props {
  data?: AppUsageData[];
}

export const PremiumAppUsageChart: React.FC<Props> = ({ data: externalData }) => {
  const defaultData: AppUsageData[] = [
    { value: 72, label: 'Insta', limit: 60 },
    { value: 45, label: 'WA', limit: 60 },
    { value: 32, label: 'YT', limit: 60 },
    { value: 12, label: 'In', limit: 60 },
    { value: 8, label: 'TT', limit: 60 },
  ];

  const chartData = (externalData || defaultData).map(item => {
    const isOverLimit = item.limit && item.value > item.limit;
    return {
      ...item,
      frontColor: isOverLimit ? Colors.error : Colors.success,
      gradientColor: isOverLimit ? '#FF8E8E' : '#8EFF8E',
    };
  });

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        barWidth={35}
        noOfSections={3}
        barBorderRadius={8}
        frontColor={Colors.primary}
        isAnimated
        animationDuration={1000}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        yAxisTextStyle={{ color: Colors.muted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.muted, fontSize: 10, fontFamily: 'DM Sans' }}
        showGradient
        gradientColor={Colors.secondary}
        backgroundColor={Colors.card}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
