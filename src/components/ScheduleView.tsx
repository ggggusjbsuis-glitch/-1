import { useState } from 'react';
import type { Schedule, DayKey } from '../types';
import { DAY_KEYS, DAY_LABELS, getTodayDayKey } from '../types';
import DayColumn from './DayColumn';
import DateTabs from './DateTabs';
import DayCard from './DayCard';

interface Props {
  schedule: Schedule;
  onLongPressTitle?: () => void;
}

export default function ScheduleView({ schedule, onLongPressTitle }: Props) {
  const [activeDay, setActiveDay] = useState<DayKey>(getTodayDayKey());

  const longPressTimer = { current: 0 as unknown as ReturnType<typeof setTimeout> };

  const handleTitleDown = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPressTitle?.();
    }, 2000);
  };
  const handleTitleUp = () => clearTimeout(longPressTimer.current);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 标题 */}
      <div
        className="text-center py-4 select-none"
        onMouseDown={handleTitleDown}
        onMouseUp={handleTitleUp}
        onMouseLeave={handleTitleUp}
        onTouchStart={handleTitleDown}
        onTouchEnd={handleTitleUp}
      >
        <h1 className="text-xl font-bold text-gray-800">{schedule.title}</h1>
        <p className="text-xs text-gray-400 mt-1">长按标题进入管理</p>
      </div>

      {/* 桌面端：5列格子表 */}
      <div className="hidden md:flex border rounded-lg overflow-hidden bg-white shadow-sm mx-4">
        {DAY_KEYS.map((key) => (
          <DayColumn key={key} label={DAY_LABELS[key]} courses={schedule.days[key]} />
        ))}
      </div>

      {/* 移动端：日期横滑 + 单天卡片 */}
      <div className="md:hidden">
        <DateTabs activeDay={activeDay} onSelect={setActiveDay} />
        <DayCard courses={schedule.days[activeDay]} />
      </div>
    </div>
  );
}
