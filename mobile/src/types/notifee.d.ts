// Type declarations for @notifee/react-native
// Covers the subset of the API used in usePomodoroTimer.ts
declare module '@notifee/react-native' {
  export enum AndroidImportance {
    NONE = 0,
    MIN = 1,
    LOW = 2,
    DEFAULT = 3,
    HIGH = 4,
  }

  interface Channel {
    id: string;
    name: string;
    importance?: AndroidImportance;
  }

  interface NotificationAndroid {
    channelId: string;
    importance?: AndroidImportance;
  }

  interface Notification {
    title?: string;
    body?: string;
    android?: NotificationAndroid;
  }

  interface NotifeeStatic {
    requestPermission(): Promise<void>;
    createChannel(channel: Channel): Promise<string>;
    displayNotification(notification: Notification): Promise<string>;
  }

  const notifee: NotifeeStatic;
  export default notifee;
}
