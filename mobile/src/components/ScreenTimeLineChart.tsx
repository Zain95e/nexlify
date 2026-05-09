import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../theme';

export const ScreenTimeLineChart = () => {
  // Mock 30 days of data
  const lineData = Array.from({ length: 30 }, (_, i) => ({
    value: Math.floor(Math.random() * 200) + 150, // 150-350 minutes
    label: i % 5 === 0 ? `${i + 1}d` : '',
  }));

  return (
    <View style={styles.container}>
      <LineChart
        data={lineData}
        height={160}
        width={Dimensions.get('window').width - 80}
        initialSpacing={10}
        color={Colors.primary}
        thickness={3}
        hideDataPoints
        curved
        areaChart
        startFillColor={Colors.primary}
        endFillColor={Colors.primary}
        startOpacity={0.4}
        endOpacity={0.05}
        noOfSections={3}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{ color: Colors.muted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.muted, fontSize: 9 }}
        rulesColor={Colors.border}
        rulesType="solid"
        hideRules
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
});
