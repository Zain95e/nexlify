const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withNotifeeLocalMaven(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('@notifee/react-native/android/libs')) {
      return config;
    }
    config.modResults.contents = config.modResults.contents.replace(
      `maven { url 'https://www.jitpack.io' }`,
      `maven { url 'https://www.jitpack.io' }\n        maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`
    );
    return config;
  });
};
