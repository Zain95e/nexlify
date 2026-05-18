import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { tick, completeSession } from '../store/slices/pomodoroSlice';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { NativeModules, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const { PomodoroModule } = NativeModules;

const safeActivateKeepAwake = async () => {
  try {
    await activateKeepAwakeAsync();
  } catch (err) {
    console.warn('[KeepAwake] Failed to activate:', err);
  }
};

const safeDeactivateKeepAwake = () => {
  try {
    deactivateKeepAwake();
  } catch (err) {
    console.warn('[KeepAwake] Failed to deactivate:', err);
  }
};

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

  const blockingActiveRef = useRef(false);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      if (phase === 'focus') {
        safeActivateKeepAwake();
        if (!startTimeRef.current) {
          startTimeRef.current = new Date().toISOString();
        }
        if (Platform.OS === 'android' && PomodoroModule && !blockingActiveRef.current) {
          blockingActiveRef.current = true;
          AsyncStorage.getItem('@pomodoro_app_blocking').then(val => {
            if (val === 'true') {
              AsyncStorage.getItem('@detox_blocked_apps').then(savedStr => {
                const distractingApps = savedStr ? JSON.parse(savedStr) : [];
                PomodoroModule.setBlockedApps(distractingApps);
              });
            }
          });
        }
      } else {
        safeDeactivateKeepAwake();
        if (Platform.OS === 'android' && PomodoroModule && blockingActiveRef.current) {
          blockingActiveRef.current = false;
          PomodoroModule.clearBlockedApps();
        }
      }

      intervalRef.current = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      // Time is up
      safeDeactivateKeepAwake();
      if (Platform.OS === 'android' && PomodoroModule && blockingActiveRef.current) {
        blockingActiveRef.current = false;
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
      safeDeactivateKeepAwake();
      if (Platform.OS === 'android' && PomodoroModule && blockingActiveRef.current) {
        blockingActiveRef.current = false;
        PomodoroModule.clearBlockedApps();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      safeDeactivateKeepAwake();
    };
  }, [isRunning, timeRemaining, phase, dispatch]);
};
