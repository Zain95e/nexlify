import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '../../src/theme';
import { Button } from '../../src/components/Button';

const ONBOARDING_DATA = [
  {
    title: 'Focus Flow',
    description: 'Master your productivity with AI-powered task management and pomodoro timers.',
    icon: '🚀',
    color: Colors.primary,
  },
  {
    title: 'Digital Balance',
    description: 'Track your screen time and block distracting apps to stay in the zone.',
    icon: '⚖️',
    color: Colors.tertiary,
  },
  {
    title: 'Connect & Grow',
    description: 'Share streaks with friends and earn achievements as you reach your goals.',
    icon: '🤝',
    color: Colors.secondary,
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const step = ONBOARDING_DATA[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={[styles.title, { color: step.color }]}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {ONBOARDING_DATA.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === currentStep ? step.color : Colors.border },
                ]}
              />
            ))}
          </View>
          
          <Button
            title={currentStep === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={{ backgroundColor: step.color }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: Colors.muted,
    fontFamily: 'DM Sans',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Syne',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
