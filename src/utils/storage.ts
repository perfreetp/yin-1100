const STORAGE_PREFIX = 'ivf-coordinator-';

export function setStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(STORAGE_PREFIX + key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return defaultValue;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Error removing from localStorage:', e);
  }
}

export function clearAllStorage(): void {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
}

export function exportData(): string {
  const data: Record<string, unknown> = {};
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .forEach(key => {
      const cleanKey = key.replace(STORAGE_PREFIX, '');
      data[cleanKey] = JSON.parse(localStorage.getItem(key) || 'null');
    });
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    Object.entries(data).forEach(([key, value]) => {
      setStorage(key, value);
    });
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}
