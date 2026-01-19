import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageKeys } from "./types";

export async function getStorageItem<K extends keyof StorageKeys>(
  key: K
): Promise<StorageKeys[K] | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Storage read error for key "${key}":`, error);
    return null;
  }
}

export async function setStorageItem<K extends keyof StorageKeys>(
  key: K,
  value: StorageKeys[K]
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Storage write error for key "${key}":`, error);
  }
}

export async function removeStorageItem<K extends keyof StorageKeys>(
  key: K
): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage remove error for key "${key}":`, error);
  }
}
