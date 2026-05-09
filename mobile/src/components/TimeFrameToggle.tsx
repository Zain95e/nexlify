import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme';

type TimeFrame = 'day' | 'week' | 'month';

interface Props {
  value: TimeFrame;
  onChange: (value: TimeFrame) => void;
}

export const TimeFrameToggle: React.FC<Props> = ({ value, onChange }) => {
  const options: TimeFrame[] = ['day', 'week', 'month'];

  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.option, value === opt && styles.activeOption]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.text, value === opt && styles.activeText]}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeOption: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'DM Sans',
  },
  activeText: {
    color: Colors.text,
  },
});
