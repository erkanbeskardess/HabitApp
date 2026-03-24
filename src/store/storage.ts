import { createMMKV, type MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

/**
 * MMKV depolama örneği — uygulamanın tüm verisi burada saklanır.
 * react-native-mmkv v4 createMMKV() factory fonksiyonunu kullanır.
 */
export const storage: MMKV = createMMKV({
  id: 'habit-app-storage',
});

/**
 * Zustand persist middleware için MMKV adaptörü.
 * Zustand'ın `StateStorage` arayüzüne uygun getItem / setItem / removeItem sağlar.
 */
export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};
