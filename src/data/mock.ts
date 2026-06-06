import type { Staff, Classroom, HallEvent, KeyData } from '../types';

export const mockStaff: Staff[] = [
  { id: 'mq1vfn5k', name: '刘龙', title: '现代教育科', phone: '18085920560', email: '', department: '现代教育科' },
  { id: 'mq1vrp0w', name: '李璐', title: '现代教育科', phone: '18286692524', email: '', department: '现代教育科' },
  { id: 'mq1vsjv4', name: '鲍明月', title: '现代教育科', phone: '18797022653', email: '', department: '现代教育科' },
  { id: 'mq1vvsuh', name: '严浩城', title: '现代教育科', phone: '19387471283', email: '', department: '现代教育科' },
  { id: 'mq1vz6xt', name: '刘宇涛', title: '现代教育科', phone: '18997169080', email: '', department: '现代教育科' },
  { id: 'mq1w0809', name: '杨向东', title: '现代教育科', phone: '15818995826', email: '', department: '现代教育科' },
  { id: 'mq1wlkn6', name: '杨云轩', title: '现代教育科', phone: '17385913590', email: '', department: '现代教育科' },
  { id: 'mq1wma3e', name: '孟月源', title: '现代教育科', phone: '18308669655', email: '', department: '现代教育科' },
  { id: 'mq1xnwvs', name: '黄银银', title: '现代教育科', phone: '18386011208', email: '', department: '现代教育科' },
  { id: 'mq1xoj2u', name: '王灿', title: '现代教育科', phone: '15876631836', email: '', department: '现代教育科' },
  { id: 'mq1xpnny', name: '刘时清钦', title: '现代教育科', phone: '19078797373', email: '', department: '现代教育科' },
  { id: 'mq1xr712', name: '李庆国', title: '现代教育科 管理人', phone: '18666913905', email: '', department: '现代教育科' },
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
