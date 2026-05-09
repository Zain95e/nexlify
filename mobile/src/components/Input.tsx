import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.errorBorder : styles.normalBorder]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.muted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    marginBottom: 6,
    fontFamily: 'Syne',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  normalBorder: {
    borderColor: Colors.border,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'DM Sans',
  },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
    fontFamily: 'DM Sans',
  },
});
