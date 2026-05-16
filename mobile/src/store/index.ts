import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import diaryReducer from './slices/diarySlice';
import goalReducer from './slices/goalSlice';
import screenTimeReducer from './slices/screenTimeSlice';
import pomodoroReducer from './slices/pomodoroSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    diary: diaryReducer,
    goals: goalReducer,
    screenTime: screenTimeReducer,
    pomodoro: pomodoroReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
