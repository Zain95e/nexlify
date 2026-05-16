// Type declarations for react-native-keep-awake
// Covers the static API used in usePomodoroTimer.ts
declare module 'react-native-keep-awake' {
  const KeepAwake: {
    activate(): void;
    deactivate(): void;
  };
  export default KeepAwake;
}
