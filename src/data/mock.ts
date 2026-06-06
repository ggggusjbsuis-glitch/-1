import type { Staff, Classroom, HallEvent, KeyData } from '../types';

export const mockStaff: Staff[] = [
  { id: '1', name: '张建国', title: '科长', phone: '13901234567', email: 'zhangjg@zmu.edu.cn', department: '现代教育科' },
  { id: '2', name: '李红梅', title: '副科长', phone: '13801234568', email: 'lihm@zmu.edu.cn', department: '现代教育科' },
  { id: '3', name: '王磊', title: '科员', phone: '13701234569', email: 'wanglei@zmu.edu.cn', department: '现代教育科' },
  { id: '4', name: '陈芳', title: '科员', phone: '13601234570', email: 'chenfang@zmu.edu.cn', department: '现代教育科' },
  { id: '5', name: '刘波', title: '技术员', phone: '13501234571', email: 'liubo@zmu.edu.cn', department: '现代教育科' },
];

export const mockClassrooms: Classroom[] = [
  { id: '1', name: '综3104', type: '多媒体教室', capacity: 60, status: 'available', currentUser: '' },
  { id: '2', name: '综3105', type: '多媒体教室', capacity: 60, status: 'in_use', currentUser: '23级临床12班' },
  { id: '3', name: '综3106', type: '普通教室', capacity: 80, status: 'available', currentUser: '' },
  { id: '4', name: '综3107', type: '普通教室', capacity: 80, status: 'maintenance', currentUser: '' },
  { id: '5', name: '综3201', type: '实验室', capacity: 40, status: 'available', currentUser: '' },
  { id: '6', name: '综3202', type: '多媒体教室', capacity: 60, status: 'in_use', currentUser: '24级护理6班' },
  { id: '7', name: '综3203', type: '多媒体教室', capacity: 60, status: 'available', currentUser: '' },
  { id: '8', name: '报3101', type: '报告厅', capacity: 200, status: 'in_use', currentUser: '学术讲座' },
];

function today(): string { return new Date().toISOString().slice(0, 10); }
function day(offset: number): string { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }

export const mockHallEvents: Record<string, HallEvent[]> = {
  [day(-2)]: [
    { id: '1', date: day(-2), timeSlot: '08:00-10:00', eventName: '学术讲座：人工智能前沿', organizer: '计算机学院', contactPerson: '李老师', contactPhone: '13800001111', status: 'occupied' },
    { id: '2', date: day(-2), timeSlot: '14:00-16:00', eventName: '教学研讨会', organizer: '教务处', contactPerson: '王老师', contactPhone: '13800002222', status: 'occupied' },
  ],
  [day(-1)]: [
    { id: '3', date: day(-1), timeSlot: '10:00-12:00', eventName: '学生讲座：职业规划', organizer: '学生处', contactPerson: '张老师', contactPhone: '13800003333', status: 'occupied' },
  ],
  [today()]: [
    { id: '4', date: today(), timeSlot: '08:00-10:00', eventName: '科室例会', organizer: '现代教育科', contactPerson: '张建国', contactPhone: '13901234567', status: 'occupied' },
  ],
  [day(1)]: [
    { id: '5', date: day(1), timeSlot: '14:00-17:00', eventName: '学术报告会', organizer: '基础医学院', contactPerson: '陈老师', contactPhone: '13800004444', status: 'occupied' },
  ],
};

export const mockKeyData: KeyData = {
  fetchedAt: new Date().toISOString(),
  keys: {
    total: 31,
    putIn: 29,
    takeOut: 2,
    error: 0,
    list: [
      { id: '1', name: '综3104', location: '综合楼10-02通道', status: '存入', keyType: '长期', department: '现代教育科' },
      { id: '2', name: '综3105', location: '综合楼10-03通道', status: '存入', keyType: '长期', department: '现代教育科' },
      { id: '3', name: '综3403', location: '未存入', status: '取出', keyType: '长期', department: '现代教育科' },
      { id: '4', name: '综3205', location: '综合楼10-10通道', status: '取出', keyType: '长期', department: '现代教育科' },
      { id: '5', name: '报3101', location: '综合楼10-01通道', status: '存入', keyType: '长期', department: '现代教育科' },
      { id: '6', name: '综3201', location: '综合楼10-06通道', status: '存入', keyType: '长期', department: '现代教育科' },
      { id: '7', name: '综3106', location: '综合楼10-04通道', status: '存入', keyType: '长期', department: '现代教育科' },
      { id: '8', name: '综3107', location: '综合楼10-05通道', status: '存入', keyType: '长期', department: '现代教育科' },
    ],
  },
  todayRecords: [
    { id: 'r1', userName: '23级临床12班鲍明月', action: '归还', keyName: '综3401', location: '综合楼20-04通道', time: '2026-06-05 22:27:55', remark: '授权归还' },
    { id: 'r2', userName: '24级护理6班杨向东', action: '取出', keyName: '综3204', location: '综合楼10-09通道', time: '2026-06-05 19:04:37', remark: '授权取出' },
    { id: 'r3', userName: '蓝芳', action: '取出', keyName: '报3101', location: '综合楼10-01通道', time: '2026-06-05 11:49:27', remark: '授权取出' },
  ],
};
