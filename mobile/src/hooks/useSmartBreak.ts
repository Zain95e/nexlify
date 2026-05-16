/**
 * useSmartBreak
 *
 * Reads `showBreakSuggestions` from the pomodoro Redux slice and returns
 * the props needed to wire up <SmartBreakModal>.
 *
 * Usage in the Pomodoro screen:
 *
 *   const { showBreakSuggestions, breakDurationSeconds, isLongBreak,
 *           startBreak, skipBreak } = useSmartBreak();
 *   ...
 *   <SmartBreakModal
 *     visible={showBreakSuggestions}
 *     breakDurationSeconds={breakDurationSeconds}
 *     isLongBreak={isLongBreak}
 *     onStartBreak={startBreak}
 *     onSkipBreak={skipBreak}
 *   />
 */
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { dismissBreakSuggestions, startTimer } from '../store/slices/pomodoroSlice';

export const useSmartBreak = () => {
  const dispatch = useDispatch();
  const { showBreakSuggestions, breakDuration, sessionNumber } = useSelector(
    (state: RootState) => state.pomodoro
  );

  // After every 4th focus session the break is a "long break"
  const isLongBreak = sessionNumber % 4 === 0;

  const startBreak = () => {
    // Dismiss the suggestions card and begin the break countdown
    dispatch(dismissBreakSuggestions());
    dispatch(startTimer());
  };

  const skipBreak = () => {
    // Dismiss the suggestions card; the slice already set phase → 'break'.
    // We just close the modal without starting the break timer.
    dispatch(dismissBreakSuggestions());
  };

  return {
    showBreakSuggestions,
    breakDurationSeconds: breakDuration,
    isLongBreak,
    startBreak,
    skipBreak,
  };
};
