import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { tick, completeSession } from '../store/slices/pomodoroSlice';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { NativeModules, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import api from '../api';

const { PomodoroModule } = NativeModules;

export const usePomodoroTimer = () => {
  const dispatch = useDispatch();
  const { isRunning, timeRemaining, phase, sessionNumber, focusDuration } = useSelector((state: RootState) => state.pomodoro);
  // Using screenTime limits to identify "distracting apps"
  const limits = useSelector((state: RootState) => state.screenTime.limits);
  const intervalRef = useRef<any>(null);
  const startTimeRef = useRef<string | null>(null);

  const displayNotification = async (title: string, body: string) => {
    await notifee.requestPermission();
    const channelId = await notifee.createChannel({
      id: 'pomodoro',
      name: 'Pomodoro Alerts',
      importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
      },
    });
  };

  const logSession = async (wasCompleted: boolean) => {
    if (!startTimeRef.current) return;
    try {
      await api.post('/pomodoro', {
        start_time: startTimeRef.current,
        end_time: new Date().toISOString(),
        duration_minutes: Math.round(focusDuration / 60),
        was_completed: wasCompleted,
      });
    } catch (e) {
      console.error('Failed to log pomodoro session:', e);
    }
    startTimeRef.current = null;
  };

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      if (phase === 'focus') {
        activateKeepAwakeAsync();
        if (!startTimeRef.current) {
          startTimeRef.current = new Date().toISOString();
        }
        if (Platform.OS === 'android' && PomodoroModule) {
          const distractingApps = limits.map(l => l.app_package);
          PomodoroModule.setBlockedApps(distractingApps);
        }
      } else {
        deactivateKeepAwake();
        if (Platform.OS === 'android' && PomodoroModule) {
          PomodoroModule.clearBlockedApps();
        }
      }

      intervalRef.current = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      // Time is up
      deactivateKeepAwake();
      if (Platform.OS === 'android' && PomodoroModule) {
        PomodoroModule.clearBlockedApps();
      }
      
      if (phase === 'focus') {
        logSession(true);
        if (sessionNumber % 4 === 0) {
          displayNotification("🎉 Pomodoro complete!", "You've finished 4 sessions. Take a long break (15-30 min).");
        } else {
          displayNotification("🎉 Pomodoro complete!", "Time for a short break.");
        }
      } else {
        displayNotification("Break is over!", "Time to focus again.");
      }

      dispatch(completeSession());
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      // Paused or stopped manually
      deactivateKeepAwake();
      if (Platform.OS === 'android' && PomodoroModule) {
        PomodoroModule.clearBlockedApps();
      }
      // If it was paused during focus, we could log it as incomplete if stopped, but for now we just clear the list.
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      deactivateKeepAwake();
    };
  }, [isRunning, timeRemaining, phase, dispatch]);
};
