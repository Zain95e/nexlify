import api from './index';

export const recordAppOverride = async (app_package: string): Promise<void> => {
  try {
    await api.post('/blocking/overrides', { app_package });
    console.log('[BlockingAPI] Override recorded successfully');
  } catch (error) {
    console.warn('[BlockingAPI] Failed to record override:', error);
  }
};
