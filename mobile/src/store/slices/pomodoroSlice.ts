import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PomodoroPhase = 'focus' | 'break';

interface PomodoroState {
  timeRemaining: number;
  isRunning: boolean;
  sessionNumber: number;
  phase: PomodoroPhase;
  focusDuration: number;
  breakDuration: number;
  showBreakSuggestions: boolean;
}

const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const DEFAULT_BREAK_DURATION = 5 * 60;  // 5 minutes in seconds

const initialState: PomodoroState = {
  timeRemaining: DEFAULT_FOCUS_DURATION,
  isRunning: false,
  sessionNumber: 1,
  phase: 'focus',
  focusDuration: DEFAULT_FOCUS_DURATION,
  breakDuration: DEFAULT_BREAK_DURATION,
  showBreakSuggestions: false,
};

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    startTimer(state) {
      state.isRunning = true;
    },
    pauseTimer(state) {
      state.isRunning = false;
    },
    tick(state) {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    setPhase(state, action: PayloadAction<PomodoroPhase>) {
      state.phase = action.payload;
      state.timeRemaining = action.payload === 'focus' ? state.focusDuration : state.breakDuration;
      state.isRunning = false;
    },
    completeSession(state) {
      if (state.phase === 'focus') {
        // Show smart break suggestion screen before starting break
        state.showBreakSuggestions = true;
        state.phase = 'break';
        state.timeRemaining = state.breakDuration;
        state.isRunning = false;
      } else {
        // Just finished break, go back to focus
        state.showBreakSuggestions = false;
        state.phase = 'focus';
        state.sessionNumber += 1;
        state.timeRemaining = state.focusDuration;
        state.isRunning = false;
      }
    },
    dismissBreakSuggestions(state) {
      state.showBreakSuggestions = false;
    },
    resetTimer(state) {
      state.isRunning = false;
      state.phase = 'focus';
      state.sessionNumber = 1;
      state.timeRemaining = state.focusDuration;
      state.showBreakSuggestions = false;
    },
    setDurations(state, action: PayloadAction<{ focus: number; break: number }>) {
      state.focusDuration = action.payload.focus;
      state.breakDuration = action.payload.break;
      if (!state.isRunning) {
        state.timeRemaining = state.phase === 'focus' ? state.focusDuration : state.breakDuration;
      }
    }
  },
});

export const {
  startTimer,
  pauseTimer,
  tick,
  setPhase,
  completeSession,
  resetTimer,
  setDurations,
  dismissBreakSuggestions,
} = pomodoroSlice.actions;

export default pomodoroSlice.reducer;
