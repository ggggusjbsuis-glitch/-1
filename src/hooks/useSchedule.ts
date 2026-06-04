import { useEffect, useState, useCallback } from 'react';
import { fetchSchedule } from '../api';
import type { Schedule } from '../types';

const EMPTY_SCHEDULE: Schedule = {
  title: '课程表',
  days: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] },
};

const POLL_INTERVAL = 10_000; // 学生端每10秒轮询

export function useSchedule() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchSchedule();
      setSchedule(data ?? EMPTY_SCHEDULE);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [load]);

  return { schedule, loading, error, reload: load };
}
