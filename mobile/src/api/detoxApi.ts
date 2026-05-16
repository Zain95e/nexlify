import api from './index';

export interface DetoxSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  planned_duration_minutes: number;
  break_count: number;
}

export const startDetoxSession = async (plannedDurationMinutes: number): Promise<DetoxSession | null> => {
  try {
    const { data } = await api.post('/detox', {
      planned_duration_minutes: plannedDurationMinutes,
      started_at: new Date().toISOString()
    });
    return data.data;
  } catch (error) {
    console.warn('[DetoxAPI] Failed to start detox session:', error);
    return null;
  }
};

export const endDetoxSession = async (sessionId: string, breakCount: number): Promise<void> => {
  try {
    await api.patch(`/detox/${sessionId}`, {
      ended_at: new Date().toISOString(),
      break_count: breakCount
    });
  } catch (error) {
    console.warn('[DetoxAPI] Failed to end detox session:', error);
  }
};
