import api from './index';
import type { UsageRecord } from '../../modules/screen-time/ScreenTimeModule';

/**
 * Screen Time API client  (3.2.x)
 * All functions use the shared Axios instance which injects the JWT automatically.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface DailyUsageResponse {
  date: string;
  total_minutes: number;
  apps: {
    app_name: string;
    app_package: string;
    category: string;
    duration_minutes: number;
    session_date: string;
  }[];
}

export interface DayAggregate {
  date: string;
  total_minutes: number;
  social?: number;
  productivity?: number;
  entertainment?: number;
  other?: number;
}

export interface MonthlyDay {
  date: string;
  total_minutes: number;
}

export interface AppLimit {
  id: string;
  app_package: string;
  daily_limit_minutes: number;
}

// ── API functions ──────────────────────────────────────────────────────────

/**
 * 3.2.1  POST /api/screentime
 * Syncs the device's usage records for today.
 */
export const syncScreenTime = async (records: UsageRecord[]): Promise<void> => {
  await api.post('/screentime', { records });
};

/**
 * 3.2.2  GET /api/screentime/daily
 */
export const fetchDailyUsage = async (): Promise<DailyUsageResponse> => {
  const { data } = await api.get('/screentime/daily');
  return data.data as DailyUsageResponse;
};

/**
 * 3.2.3  GET /api/screentime/weekly
 */
export const fetchWeeklyUsage = async (): Promise<DayAggregate[]> => {
  const { data } = await api.get('/screentime/weekly');
  return data.data as DayAggregate[];
};

/**
 * 3.2.4  GET /api/screentime/monthly
 */
export const fetchMonthlyUsage = async (): Promise<MonthlyDay[]> => {
  const { data } = await api.get('/screentime/monthly');
  return data.data as MonthlyDay[];
};

/**
 * 3.2.5  GET /api/screentime/limits
 */
export const fetchAppLimits = async (): Promise<AppLimit[]> => {
  const { data } = await api.get('/screentime/limits');
  return data.data as AppLimit[];
};

/**
 * 3.2.6  PUT /api/screentime/limits
 */
export const updateAppLimits = async (
  limits: { app_package: string; daily_limit_minutes: number }[]
): Promise<void> => {
  await api.put('/screentime/limits', { limits });
};
