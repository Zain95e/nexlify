import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  syncScreenTime,
  fetchDailyUsage,
  fetchWeeklyUsage,
  fetchMonthlyUsage,
  fetchAppLimits,
  updateAppLimits,
  type DailyUsageResponse,
  type DayAggregate,
  type MonthlyDay,
  type AppLimit,
} from '../../api/screenTimeApi';
import ScreenTimeModule from '../../../modules/screen-time/ScreenTimeModule';

// ── State ──────────────────────────────────────────────────────────────────

interface ScreenTimeState {
  daily: DailyUsageResponse | null;
  weekly: DayAggregate[];
  monthly: MonthlyDay[];
  limits: AppLimit[];
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

const initialState: ScreenTimeState = {
  daily: null,
  weekly: [],
  monthly: [],
  limits: [],
  loading: false,
  error: null,
  lastSyncedAt: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────

/**
 * Reads usage stats from the native module and POSTs them to the backend.
 * Typically called on app foreground or by the WorkManager (which calls
 * the backend directly — this thunk is for manual/immediate syncs from JS).
 */
export const syncUsageStats = createAsyncThunk(
  'screenTime/sync',
  async (_, { rejectWithValue }) => {
    try {
      const records = await ScreenTimeModule.getUsageStats();
      if (records.length > 0) {
        await syncScreenTime(records);
      }
      return new Date().toISOString();
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'Sync failed');
    }
  }
);

export const loadDailyUsage = createAsyncThunk(
  'screenTime/loadDaily',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDailyUsage();
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'Failed to load daily usage');
    }
  }
);

export const loadWeeklyUsage = createAsyncThunk(
  'screenTime/loadWeekly',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWeeklyUsage();
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'Failed to load weekly usage');
    }
  }
);

export const loadMonthlyUsage = createAsyncThunk(
  'screenTime/loadMonthly',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMonthlyUsage();
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'Failed to load monthly usage');
    }
  }
);

export const loadAppLimits = createAsyncThunk(
  'screenTime/loadLimits',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAppLimits();
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'Failed to load limits');
    }
  }
);

export const saveAppLimits = createAsyncThunk(
  'screenTime/saveLimits',
  async (
    limits: { app_package: string; daily_limit_minutes: number }[],
    { dispatch, rejectWithValue }
  ) => {
    try {
      await updateAppLimits(limits);
      // Refresh limits from server to get the authoritative IDs
      dispatch(loadAppLimits());
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'Failed to save limits');
    }
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────

const screenTimeSlice = createSlice({
  name: 'screenTime',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── sync ──
    builder
      .addCase(syncUsageStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncUsageStats.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.lastSyncedAt = action.payload;
      })
      .addCase(syncUsageStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── daily ──
    builder
      .addCase(loadDailyUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDailyUsage.fulfilled, (state, action: PayloadAction<DailyUsageResponse>) => {
        state.loading = false;
        state.daily = action.payload;
      })
      .addCase(loadDailyUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── weekly ──
    builder
      .addCase(loadWeeklyUsage.pending, (state) => { state.loading = true; })
      .addCase(loadWeeklyUsage.fulfilled, (state, action: PayloadAction<DayAggregate[]>) => {
        state.loading = false;
        state.weekly = action.payload;
      })
      .addCase(loadWeeklyUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── monthly ──
    builder
      .addCase(loadMonthlyUsage.pending, (state) => { state.loading = true; })
      .addCase(loadMonthlyUsage.fulfilled, (state, action: PayloadAction<MonthlyDay[]>) => {
        state.loading = false;
        state.monthly = action.payload;
      })
      .addCase(loadMonthlyUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── limits ──
    builder
      .addCase(loadAppLimits.pending, (state) => { state.loading = true; })
      .addCase(loadAppLimits.fulfilled, (state, action: PayloadAction<AppLimit[]>) => {
        state.loading = false;
        state.limits = action.payload;
      })
      .addCase(loadAppLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── save limits ──
    builder
      .addCase(saveAppLimits.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = screenTimeSlice.actions;
export default screenTimeSlice.reducer;
