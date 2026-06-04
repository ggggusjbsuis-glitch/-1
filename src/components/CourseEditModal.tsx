import { useState, useEffect } from 'react';
import type { CourseItem } from '../types';

interface Props {
  course: CourseItem | null; // null = 新建
  onSave: (course: CourseItem) => void;
  onClose: () => void;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function CourseEditModal({ course, onSave, onClose }: Props) {
  const [time, setTime] = useState(course?.time ?? '');
  const [subject, setSubject] = useState(course?.subject ?? '');
  const [room, setRoom] = useState(course?.room ?? '');
  const [teacher, setTeacher] = useState(course?.teacher ?? '');

  useEffect(() => {
    setTime(course?.time ?? '');
    setSubject(course?.subject ?? '');
    setRoom(course?.room ?? '');
    setTeacher(course?.teacher ?? '');
  }, [course]);

  const handleSave = () => {
    if (!time.trim() || !subject.trim()) return;
    onSave({
      id: course?.id ?? genId(),
      time: time.trim(),
      subject: subject.trim(),
      room: room.trim(),
      teacher: teacher.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl mx-4 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b font-medium text-gray-700">
          {course ? '编辑课程' : '添加课程'}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">时间段</label>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="例: 08:00-09:40"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">课程名</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例: 高等数学"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">教室</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="例: A201"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">教师</label>
            <input
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="例: 张老师"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="p-4 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            取消
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
