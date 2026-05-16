import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Modal, TextInput, ScrollView, Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import {
  startTimer, pauseTimer, resetTimer, setDurations,
} from '../../src/store/slices/pomodoroSlice';
import { usePomodoroTimer } from '../../src/hooks/usePomodoroTimer';
import { useSmartBreak } from '../../src/hooks/useSmartBreak';
import { SmartBreakModal } from '../../src/components/SmartBreakModal';
import { Colors } from '../../src/theme';

// ── SVG Arc Timer Ring ───────────────────────────────────────────────────────

const RADIUS = 110;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;

interface TimerRingProps {
  progress: number; // 0→1, where 1 = full (time remaining)
  phase: 'focus' | 'break';
}

const TimerRing: React.FC<TimerRingProps> = ({ progress, phase }) => {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const arcColor = phase === 'focus' ? Colors.primary : Colors.warning;

  return (
    <Svg width={SIZE} height={SIZE}>
      {/* Background track */}
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke={Colors.border}
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      {/* Depleting arc */}
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke={arcColor}
        strokeWidth={STROKE_WIDTH}
        fill="none"
        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${SIZE / 2}, ${SIZE / 2}`}
      />
    </Svg>
  );
};

// ── Settings Modal ────────────────────────────────────────────────────────────

interface SettingsModalProps {
  visible: boolean;
  focusMins: number;
  breakMins: number;
  onSave: (focus: number, brk: number) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible, focusMins, breakMins, onSave, onClose,
}) => {
  const [f, setF] = useState(String(focusMins));
  const [b, setB] = useState(String(breakMins));

  const handleSave = () => {
    const fNum = parseInt(f, 10);
    const bNum = parseInt(b, 10);
    if (isNaN(fNum) || isNaN(bNum) || fNum < 1 || bNum < 1) {
      Alert.alert('Invalid', 'Durations must be positive numbers.');
      return;
    }
    onSave(fNum, bNum);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ss.overlay}>
        <View style={ss.card}>
          <Text style={ss.title}>Timer Settings</Text>

          <Text style={ss.label}>Focus Duration (minutes)</Text>
          <TextInput
            style={ss.input}
            value={f}
            onChangeText={setF}
            keyboardType="numeric"
            selectTextOnFocus
          />

          <Text style={ss.label}>Break Duration (minutes)</Text>
          <TextInput
            style={ss.input}
            value={b}
            onChangeText={setB}
            keyboardType="numeric"
            selectTextOnFocus
          />

          <TouchableOpacity style={ss.saveBtn} onPress={handleSave}>
            <Text style={ss.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={ss.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ss = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 32,
  },
  title: { fontFamily: 'Syne', fontWeight: '800', fontSize: 22, color: Colors.text, marginBottom: 24 },
  label: { fontFamily: 'DM Sans', fontSize: 13, color: Colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    fontSize: 20, fontFamily: 'Syne', fontWeight: '700', color: Colors.text,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20, textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText: { fontFamily: 'Syne', fontWeight: '800', fontSize: 16, color: '#FFF' },
  cancelText: { fontFamily: 'DM Sans', fontSize: 14, color: Colors.muted, textAlign: 'center' },
});

// ── Pomodoro Screen ───────────────────────────────────────────────────────────

const SESSIONS_PER_CYCLE = 4;

export default function PomodoroScreen() {
  const dispatch = useDispatch();
  const {
    timeRemaining, isRunning, sessionNumber, phase,
    focusDuration, breakDuration,
  } = useSelector((s: RootState) => s.pomodoro);

  const [settingsVisible, setSettingsVisible] = useState(false);

  // Activate the countdown + blocking logic
  usePomodoroTimer();

  // Smart break suggestions
  const {
    showBreakSuggestions, breakDurationSeconds, isLongBreak,
    startBreak, skipBreak,
  } = useSmartBreak();

  // Progress: 1.0 = full ring, 0.0 = empty
  const totalDuration = phase === 'focus' ? focusDuration : breakDuration;
  const progress = totalDuration > 0 ? timeRemaining / totalDuration : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSaveSettings = (focusMins: number, breakMins: number) => {
    dispatch(setDurations({ focus: focusMins * 60, break: breakMins * 60 }));
  };

  const phaseLabel = phase === 'focus' ? '🎯 Focus' : '☕ Break';
  const phaseColor = phase === 'focus' ? Colors.primary : Colors.warning;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Pomodoro</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Phase Badge */}
        <View style={[styles.phaseBadge, { borderColor: phaseColor }]}>
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
        </View>

        {/* Circular Timer Ring */}
        <View style={styles.ringWrapper}>
          <TimerRing progress={progress} phase={phase} />
          {/* Overlay: MM:SS + session label */}
          <View style={styles.ringCenter}>
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.sessionText}>
              Session {sessionNumber} of {SESSIONS_PER_CYCLE}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Reset */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => dispatch(resetTimer())}
          >
            <Ionicons name="refresh" size={26} color={Colors.muted} />
          </TouchableOpacity>

          {/* Start / Pause */}
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: phaseColor }]}
            onPress={() => isRunning ? dispatch(pauseTimer()) : dispatch(startTimer())}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isRunning ? 'pause' : 'play'}
              size={36}
              color="#000"
            />
          </TouchableOpacity>

          {/* Settings shortcut (same as header) */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="timer-outline" size={26} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Duration info row */}
        <View style={styles.durationRow}>
          <View style={styles.durationItem}>
            <Text style={styles.durationLabel}>Focus</Text>
            <Text style={styles.durationValue}>{Math.round(focusDuration / 60)} min</Text>
          </View>
          <View style={[styles.durationDivider]} />
          <View style={styles.durationItem}>
            <Text style={styles.durationLabel}>Break</Text>
            <Text style={styles.durationValue}>{Math.round(breakDuration / 60)} min</Text>
          </View>
        </View>

        {/* Session dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: SESSIONS_PER_CYCLE }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < (sessionNumber - 1) && styles.dotDone,
                i === (sessionNumber - 1) && styles.dotActive,
              ]}
            />
          ))}
        </View>

      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        focusMins={Math.round(focusDuration / 60)}
        breakMins={Math.round(breakDuration / 60)}
        onSave={handleSaveSettings}
        onClose={() => setSettingsVisible(false)}
      />

      {/* Smart Break Suggestions */}
      <SmartBreakModal
        visible={showBreakSuggestions}
        breakDurationSeconds={breakDurationSeconds}
        isLongBreak={isLongBreak}
        onStartBreak={startBreak}
        onSkipBreak={skipBreak}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60, alignItems: 'center' },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTitle: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 28,
    color: Colors.text,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phaseBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 32,
  },
  phaseLabel: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ringWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: 'Syne',
    fontWeight: '800',
    fontSize: 52,
    color: Colors.text,
    letterSpacing: 2,
  },
  sessionText: {
    fontFamily: 'DM Sans',
    fontSize: 13,
    color: Colors.muted,
    marginTop: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 36,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  durationRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 28,
  },
  durationItem: { flex: 1, alignItems: 'center' },
  durationLabel: { fontFamily: 'DM Sans', fontSize: 12, color: Colors.muted, marginBottom: 4 },
  durationValue: { fontFamily: 'Syne', fontWeight: '800', fontSize: 22, color: Colors.text },
  durationDivider: { width: 1, backgroundColor: Colors.border },
  dotsRow: { flexDirection: 'row', gap: 10 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  dotDone: { backgroundColor: Colors.success },
  dotActive: { backgroundColor: Colors.primary, transform: [{ scale: 1.3 }] },
});
