import { useState } from 'react';
import { saveSchedule } from '../api';
import type { Schedule, DayKey, CourseItem } from '../types';
import { DAY_KEYS, DAY_LABELS, getTodayDayKey } from '../types';
import DayColumn from './DayColumn';
import DateTabs from './DateTabs';
import DayCard from './DayCard';
import CourseEditModal from './CourseEditModal';

interface Props {
  schedule: Schedule;
  password: string;
  onExit: () => void;
  onSaved: (schedule: Schedule) => void;
}

export default function ScheduleEdit({ schedule, password, onExit, onSaved }: Props) {
  const [data, setData] = useState<Schedule>(structuredClone(schedule));
  const [activeDay, setActiveDay] = useState<DayKey>(getTodayDayKey());
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [editingDay, setEditingDay] = useState<DayKey | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = (day: DayKey) => {
    setEditingDay(day);
    setEditingCourse(null);
  };

  const openEdit = (day: DayKey, course: CourseItem) => {
    setEditingDay(day);
    setEditingCourse(course);
  };

  const handleSave = (course: CourseItem) => {
    if (!editingDay) return;
    setData((prev) => {
      const next = structuredClone(prev);
      const list = next.days[editingDay];
      const idx = list.findIndex((c) => c.id === course.id);
      if (idx >= 0) {
        list[idx] = course;
      } else {
        list.push(course);
      }
      return next;
    });
    setEditingDay(null);
    setEditingCourse(null);
  };

  const handleDelete = (day: DayKey, courseId: string) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next.days[day] = next.days[day].filter((c) => c.id !== courseId);
      return next;
    });
  };

  const saveToCloud = async () => {
    setSaving(true);
    try {
      await saveSchedule(data, password);
      onSaved(data);
      alert('保存成功');
    } catch (e: any) {
      alert('保存失败: ' + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-20">
        <button onClick={onExit} className="text-sm text-gray-500 hover:text-gray-700">
          ← 退出编辑
        </button>
        <span className="text-sm font-medium text-orange-500">编辑模式</span>
        <button
          onClick={saveToCloud}
          disabled={saving}
          className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="hidden md:flex border rounded-lg overflow-hidden bg-white shadow-sm mx-4 mt-4">
        {DAY_KEYS.map((key) => (
          <DayColumn
            key={key}
            label={DAY_LABELS[key]}
            courses={data.days[key]}
            editable
            onEditCourse={(c) => openEdit(key, c)}
            onDeleteCourse={(id) => handleDelete(key, id)}
            onAddCourse={() => openAdd(key)}
          />
        ))}
      </div>

      <div className="md:hidden mt-4">
        <DateTabs activeDay={activeDay} onSelect={setActiveDay} />
        <DayCard
          courses={data.days[activeDay]}
          editable
          onEditCourse={(c) => openEdit(activeDay, c)}
          onDeleteCourse={(id) => handleDelete(activeDay, id)}
          onAddCourse={() => openAdd(activeDay)}
        />
      </div>

      {editingDay !== null && (
        <CourseEditModal
          course={editingCourse}
          onSave={handleSave}
          onClose={() => { setEditingDay(null); setEditingCourse(null); }}
        />
      )}
    </div>
  );
}
