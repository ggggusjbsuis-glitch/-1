import { useState, useEffect, useCallback } from 'react';

let cachedPhones: Record<string, string> = {};
let loaded = false;
let promise: Promise<void> | null = null;

export function useUsers() {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (loaded) return;
    if (!promise) {
      promise = fetch('/api/users')
        .then((r) => r.json())
        .then((data) => { cachedPhones = data || {}; loaded = true; setTick(1); });
    }
    promise.then(() => setTick(1));
  }, []);

  const getPhone = useCallback((userName: string): string | null => {
    if (!userName) return null;
    const name = userName.trim();
    return cachedPhones[name] || null;
  }, []);

  return { phones: cachedPhones, loaded, getPhone };
}
