import type { Schedule } from './types';

const API_BASE = '/api';

export async function fetchSchedule(): Promise<Schedule | null> {
  const res = await fetch(`${API_BASE}/schedule`);
  if (!res.ok) throw new Error('获取课程表失败');
  const data = await res.json();
  return data.exists ? (data.schedule as Schedule) : null;
}

export async function saveSchedule(schedule: Schedule, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedule, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '保存失败' }));
    throw new Error(err.error || '保存失败');
  }
}
