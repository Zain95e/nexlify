import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import api from '../api';

// ── Rule Engine ─────────────────────────────────────────────────────────────

type Mood = 'stressed' | 'tired' | 'neutral' | 'happy' | 'excited';

const SUGGESTIONS: Record<string, string[]> = {
  stressed: [
    '🚶 Go for a 5-min walk',
    '🌬️ Do 10 deep breaths',
    '🧘 Stretch your neck and shoulders',
    '💧 Drink a full glass of water',
    '🎵 Listen to a calming song',
  ],
  tired: [
    '🚶 Go for a 5-min walk',
    '🌬️ Do 10 deep breaths',
    '🧘 Stretch your neck and shoulders',
    '😴 Close your eyes for 2 minutes',
    '☕ Make a hot drink',
  ],
  neutral: [
    '💧 Drink water',
    '🧘 Do a quick meditation',
    '🪟 Look out the window for 2 minutes',
    '🤸 Do a quick stretch',
    '📓 Jot down a thought',
  ],
  happy: [
    '💧 Drink water',
    '🧘 Do a quick meditation',
    '🪟 Look out the window for 2 minutes',
    '🎵 Put on your favourite song',
    '🤸 Do a quick stretch',
  ],
  excited: [
    '⚡ Channel that energy — plan your next task!',
    '📋 Write down your top 3 next steps',
    '💧 Drink water to stay sharp',
    '🚶 A quick walk to reset and come back stronger',
  ],
};

const getMoodSuggestions = (mood: string): string[] => {
  const key = mood?.toLowerCase();
  return SUGGESTIONS[key] ?? SUGGESTIONS.neutral;
};

const getMoodEmoji = (mood: string): string => {
  switch (mood?.toLowerCase()) {
    case 'stressed': return '😰';
    case 'tired':    return '😴';
    case 'happy':    return '😊';
    case 'excited':  return '🤩';
    default:         return '😐';
  }
};

// ── Props ────────────────────────────────────────────────────────────────────

interface SmartBreakModalProps {
  visible: boolean;
  breakDurationSeconds: number;     // how long the break lasts (seconds)
  isLongBreak: boolean;             // after 4 sessions
  onStartBreak: () => void;         // begin break countdown
  onSkipBreak: () => void;          // jump straight back to focus
}

// ── Component ────────────────────────────────────────────────────────────────

export const SmartBreakModal: React.FC<SmartBreakModalProps> = ({
  visible,
  breakDurationSeconds,
  isLongBreak,
  onStartBreak,
  onSkipBreak,
}) => {
  const [mood, setMood] = useState<string>('neutral');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pulse animation — purely cosmetic, does NOT drive a timer
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the countdown circle
  useEffect(() => {
    if (!visible) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible]);

  // ── No auto-countdown here ──────────────────────────────────────────────────
  // The Redux break timer is the single source of truth.
  // Showing a drifting visual countdown that started before the user
  // pressed "Start Break" would desync from the actual break duration.
  // Instead we display the break duration as a static label.

  // Fetch latest mood on open
  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setActiveSuggestionIndex(0);

    api.get('/diary?limit=1')
      .then(res => {
        const entries = res.data?.data?.entries ?? res.data?.data ?? [];
        const latestMood: string = entries[0]?.mood ?? 'neutral';
        setMood(latestMood);
        setSuggestions(getMoodSuggestions(latestMood));
      })
      .catch(() => {
        setMood('neutral');
        setSuggestions(getMoodSuggestions('neutral'));
      })
      .finally(() => setLoading(false));
  }, [visible]);

  const handleMoreSuggestions = () => {
    setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    return `${m} min`;
  };

  const breakLabel = isLongBreak ? 'Long Break' : 'Short Break';
  const breakColor = isLongBreak ? Colors.tertiary : Colors.warning;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <View style={styles.fullScreen}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.breakBadge, { borderColor: breakColor }]}>
            <Text style={[styles.breakBadgeText, { color: breakColor }]}>{breakLabel}</Text>
          </View>
        </View>

        {/* Countdown Ring */}
        <Animated.View style={[styles.ring, { transform: [{ scale: pulseAnim }], borderColor: breakColor }]}>
          <Text style={styles.countdownTime}>{formatDuration(breakDurationSeconds)}</Text>
          <Text style={styles.countdownLabel}>break duration</Text>
        </Animated.View>

        {/* Mood Label */}
        {!loading && (
          <View style={styles.moodRow}>
            <Text style={styles.moodLabel}>
              Based on your mood {getMoodEmoji(mood)}
            </Text>
          </View>
        )}

        {/* Suggestion Card */}
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionText}>
            {loading ? 'Loading suggestion…' : (suggestions[activeSuggestionIndex] ?? '')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: breakColor }]}
            onPress={onStartBreak}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={18} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Start Break</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleMoreSuggestions}>
            <Ionicons name="refresh" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>More Suggestions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onSkipBreak}>
            <Text style={styles.skipText}>Skip Break</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  breakBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  breakBadgeText: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ring: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: Colors.surface,
  },
  countdownTime: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 44,
    color: Colors.text,
    letterSpacing: 2,
  },
  countdownLabel: {
    fontFamily: 'DM Sans',
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
  },
  moodRow: {
    marginBottom: 20,
  },
  moodLabel: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
  },
  suggestionCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 100,
    justifyContent: 'center',
  },
  suggestionText: {
    fontFamily: 'DM Sans',
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 16,
    color: '#000',
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Syne',
    fontWeight: '700',
    fontSize: 16,
    color: Colors.primary,
  },
  skipBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: 'DM Sans',
    fontSize: 14,
    color: Colors.muted,
    textDecorationLine: 'underline',
  },
});
