const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../node_modules/expo-notifications/build');

const warnFile = path.join(baseDir, 'warnOfExpoGoPushUsage.js');
const autoRegFile = path.join(baseDir, 'DevicePushTokenAutoRegistration.fx.js');
const topicAndroidFile = path.join(baseDir, 'TopicSubscriptionModule.android.js');
const pushTokenFile = path.join(baseDir, 'PushTokenManager.native.js');
const serverRegFile = path.join(baseDir, 'ServerRegistrationModule.native.js');
const bgTasksFile = path.join(baseDir, 'BackgroundNotificationTasksModule.native.js');

try {
  // 0. index.js — silence the Expo Go warning message
  const indexFile = path.join(baseDir, 'index.js');
  if (fs.existsSync(indexFile)) {
    let content = fs.readFileSync(indexFile, 'utf8');
    if (content.includes('console.warn(message);')) {
      content = content.replace('console.warn(message);', '// console.warn(message);');
      fs.writeFileSync(indexFile, content, 'utf8');
      console.log('Successfully patched index.js to silence Expo Go warning banner.');
    }
  }

  // 1. warnOfExpoGoPushUsage.js — replace throw with warning
  if (fs.existsSync(warnFile)) {
    let content = fs.readFileSync(warnFile, 'utf8');
    if (content.includes('throw new Error(message);')) {
      content = content.replace(
        /if\s*\(\s*Platform\.OS\s*===\s*'android'\s*\)\s*\{\s*throw new Error\(message\);\s*\}/g,
        'if (__DEV__) { didWarn = true; console.warn(message); }'
      );
      fs.writeFileSync(warnFile, content, 'utf8');
      console.log('Successfully patched warnOfExpoGoPushUsage.js');
    }
  }

  // 2. DevicePushTokenAutoRegistration.fx.js — skip push token auto-registration in Expo Go
  if (fs.existsSync(autoRegFile)) {
    let content = fs.readFileSync(autoRegFile, 'utf8');
    if (!content.includes('isRunningInExpoGo')) {
      content = "import { isRunningInExpoGo } from 'expo';\n" + content;
      content = content.replace(
        'if (ServerRegistrationModule.getRegistrationInfoAsync) {',
        'if (!isRunningInExpoGo() && ServerRegistrationModule.getRegistrationInfoAsync) {'
      );
    }
    if (!content.includes('if (!isRunningInExpoGo()) { console.warn')) {
      content = content.replace(
        'console.warn(`[expo-notifications] Error encountered while fetching auto-registration state, new tokens will not be automatically registered on server.`, new UnavailabilityError(\'ServerRegistrationModule\', \'getRegistrationInfoAsync\'));',
        'if (!isRunningInExpoGo()) { console.warn(`[expo-notifications] Error encountered while fetching auto-registration state, new tokens will not be automatically registered on server.`, new UnavailabilityError(\'ServerRegistrationModule\', \'getRegistrationInfoAsync\')); }'
      );
    }
    fs.writeFileSync(autoRegFile, content, 'utf8');
    console.log('Successfully patched DevicePushTokenAutoRegistration.fx.js');
  }

  // 3. TopicSubscriptionModule.android.js — safely fallback if ExpoTopicSubscriptionModule missing in Expo Go
  if (fs.existsSync(topicAndroidFile)) {
    const topicPatch = `import { requireOptionalNativeModule } from 'expo-modules-core';
let nativeModule = null;
try {
  nativeModule = requireOptionalNativeModule('ExpoTopicSubscriptionModule');
} catch (e) {}

const fallback = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: () => Promise.resolve(null),
  unsubscribeFromTopicAsync: () => Promise.resolve(null),
};

export default nativeModule || fallback;
`;
    fs.writeFileSync(topicAndroidFile, topicPatch, 'utf8');
    console.log('Successfully patched TopicSubscriptionModule.android.js');
  }

  // 4. PushTokenManager.native.js — safely fallback if ExpoPushTokenManager missing in Expo Go
  if (fs.existsSync(pushTokenFile)) {
    const pushTokenPatch = `import { requireOptionalNativeModule } from 'expo-modules-core';
let nativeModule = null;
try {
  nativeModule = requireOptionalNativeModule('ExpoPushTokenManager');
} catch (e) {}

const fallback = {
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
  removeAllListeners: () => {},
  emit: () => {},
  listenerCount: () => 0,
};

export default nativeModule || fallback;
`;
    fs.writeFileSync(pushTokenFile, pushTokenPatch, 'utf8');
    console.log('Successfully patched PushTokenManager.native.js');
  }

  // 5. ServerRegistrationModule.native.js — safely fallback if NotificationsServerRegistrationModule missing
  if (fs.existsSync(serverRegFile)) {
    const serverRegPatch = `import { requireOptionalNativeModule } from 'expo-modules-core';
let nativeModule = null;
try {
  nativeModule = requireOptionalNativeModule('NotificationsServerRegistrationModule');
} catch (e) {}

const fallback = {
  addListener: () => {},
  removeListeners: () => {},
};

export default nativeModule || fallback;
`;
    fs.writeFileSync(serverRegFile, serverRegPatch, 'utf8');
    console.log('Successfully patched ServerRegistrationModule.native.js');
  }

  // 6. BackgroundNotificationTasksModule.native.js — safely fallback if missing
  if (fs.existsSync(bgTasksFile)) {
    const bgTasksPatch = `import { requireOptionalNativeModule } from 'expo-modules-core';
let nativeModule = null;
try {
  nativeModule = requireOptionalNativeModule('ExpoBackgroundNotificationTasksModule');
} catch (e) {}

const fallback = {
  async registerTaskAsync(taskName) { return null; },
  async unregisterTaskAsync(taskName) { return null; },
};

export default nativeModule || fallback;
`;
    fs.writeFileSync(bgTasksFile, bgTasksPatch, 'utf8');
    console.log('Successfully patched BackgroundNotificationTasksModule.native.js');
  }

} catch (err) {
  console.error('Failed to patch expo-notifications:', err);
}
