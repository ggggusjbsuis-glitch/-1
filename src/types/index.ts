export interface CourseItem {
  id: string;
  time: string;
  subject: string;
  room: string;
  teacher: string;
}

export interface DaySlots {
  monday: CourseItem[];
  tuesday: CourseItem[];
  wednesday: CourseItem[];
  thursday: CourseItem[];
  friday: CourseItem[];
}

export interface Schedule {
  title: string;
  days: DaySlots;
}

export type DayKey = keyof DaySlots;

export const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: '周一',
  tuesday: '周二',
  wednesday: '周三',
  thursday: '周四',
  friday: '周五',
};

export function getTodayDayKey(): DayKey {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (day >= 1 && day <= 5) return DAY_KEYS[day - 1];
  return 'monday'; // 周末默认显示周一
}
