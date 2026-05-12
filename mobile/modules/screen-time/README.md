# screen-time — Nexlify Local Expo Module

Native Android module (Phase 3.1) for querying `UsageStatsManager`.

## Files

```
modules/screen-time/
├── expo-module.config.json          # Registers ScreenTimeModule with Expo
├── ScreenTimeModule.ts              # JS/TS bridge (import this from app code)
└── android/
    ├── build.gradle                 # WorkManager + expo-modules-core deps
    └── src/main/java/com/nexlify/screentime/
        ├── ScreenTimeModule.kt      # Expo native module (getUsageStats, schedule...)
        ├── ScreenTimePackage.kt     # Package registration
        ├── UsageStatsHelper.kt      # Shared usage-stats + category-map logic
        ├── ScreenTimeSyncWorker.kt  # WorkManager CoroutineWorker (60-min sync)
        └── ScreenTimeSyncScheduler.kt  # Schedules/cancels the WorkManager job
```

## Android Setup

### 1. AndroidManifest.xml
Add the following **inside** `<manifest>`:

```xml
<!-- Required for UsageStatsManager -->
<uses-permission
    android:name="android.permission.PACKAGE_USAGE_STATS"
    tools:ignore="ProtectedPermissions" />
```

### 2. Register the module with Expo (bare workflow)
After running `expo prebuild`, Expo's autolinking will pick up
`expo-module.config.json` and link `ScreenTimeModule` automatically.

> **Note**: This module uses **Expo Modules API**, not the legacy
> React Native bridge. It requires `expo-modules-core` which is
> already a transitive dependency of Expo SDK 54.

### 3. WorkManager dependency
`build.gradle` already declares:
```
implementation "androidx.work:work-runtime-ktx:2.9.1"
```
Expo autolinking includes this when building the AAR.

### 4. SharedPreferences (written by JS auth layer)
`ScreenTimeSyncWorker` reads two keys from `SharedPreferences("nexlify_prefs")`:

| Key            | Written by                          | Value                        |
|----------------|-------------------------------------|------------------------------|
| `access_token` | authSlice after login               | JWT string                   |
| `api_base_url` | app config / `.env` on build        | e.g. `http://10.0.2.2:5000/api` |

You must write these keys from JS after login. Example:

```ts
import { NativeModules } from 'react-native';
// or use expo-shared-preferences / AsyncStorage bridge pattern
```

A simple approach is to add a `Function("setSharedPref")` to the module if
you prefer not to add another package.

## Usage from JS

```ts
import ScreenTimeModule from '@/modules/screen-time/ScreenTimeModule';

// On app start / after login
ScreenTimeModule.scheduleBackgroundSync();

// Manual sync (foreground)
const stats = await ScreenTimeModule.getUsageStats();
dispatch(syncUsageStats()); // via Redux thunk

// On logout
ScreenTimeModule.cancelBackgroundSync();
```

## Permission Flow (links to Phase 2.3.1)

Before calling `getUsageStats()`, the app must guide the user to grant
**Usage Access** in Android Settings. The Phase 2.3 permission screen
already handles this via `Settings.ACTION_USAGE_ACCESS_SETTINGS`.
