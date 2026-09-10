import AsyncStorage from '@react-native-async-storage/async-storage';

export const LocalStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error saving ${key} to local storage`, e);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error(`Error reading ${key} from local storage`, e);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from local storage`, e);
    }
  },

  // Future helpers for storing complex JSON objects (Inspections, etc.)
  setObject: async <T>(key: string, value: T): Promise<void> => {
    await LocalStorage.setItem(key, JSON.stringify(value));
  },

  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await LocalStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
