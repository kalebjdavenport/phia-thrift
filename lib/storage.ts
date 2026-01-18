import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageKeys } from "./types";

export async function getStorageItem<K extends keyof StorageKeys>(
  key: K
): Promise<StorageKeys[K] | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function setStorageItem<K extends keyof StorageKeys>(
  key: K,
  value: StorageKeys[K]
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail - storage errors shouldn't crash the app
  }
}

export async function removeStorageItem<K extends keyof StorageKeys>(
  key: K
): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
