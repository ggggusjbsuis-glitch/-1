// ====== 课程表 ======
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

export const WEEK_DAYS: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<string, string> = {
  monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四',
  friday: '周五', saturday: '周六', sunday: '周日',
};

export function getTodayDayKey(): DayKey {
  const day = new Date().getDay();
  if (day >= 1 && day <= 5) return DAY_KEYS[day - 1];
  return 'monday';
}

export function getTodayWeekKey(): string {
  const day = new Date().getDay();
  if (day === 0) return 'sunday';
  return WEEK_DAYS[day - 1];
}

// ====== 在职人员 ======
export interface Staff {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  department: string;
}

// ====== 教室 ======
export interface Classroom {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance';
  currentUser: string;
}

// ====== 钥匙 ======
export interface KeyInfo {
  id: string;
  name: string;
  location: string;
  status: string; // "存入" | "取出" | "归还错误"
  keyType: string;
  department: string;
}

export interface KeyRecord {
  id: string;
  userName: string;
  action: string; // "取出" | "归还"
  keyName: string;
  location: string;
  time: string;
  remark: string;
}

export interface KeyData {
  fetchedAt: string;
  keys: { total: number; putIn: number; takeOut: number; error: number; list: KeyInfo[] };
  todayRecords: KeyRecord[];
}

// ====== 报告厅 ======
export interface HallEvent {
  id: string;
  date: string;
  timeSlot: string;
  eventName: string;
  organizer: string;
  contactPerson: string;
  contactPhone: string;
  counterpartPhone?: string;
  status: 'occupied' | 'free';
}

// ====== 导航 ======
// ====== 日志 ======
export interface KeyLogEntry {
  id: string;
  time: string;
  keyName: string;
  userName: string;
  action: 'borrow' | 'return';
  location: string;
  remark: string;
}

// ====== 导航 ======
export type TabId = 'staff' | 'staff2' | 'classroom' | 'keys' | 'hall' | 'auditorium' | 'logs' | 'dashboard';

export const TAB_LABELS: Record<TabId, string> = {
  staff: '人员1',
  staff2: '人员2',
  classroom: '教室',
  keys: '钥匙',
  hall: '报告厅',
  auditorium: '大礼堂',
  logs: '日志',
  dashboard: '数据看板',
};
