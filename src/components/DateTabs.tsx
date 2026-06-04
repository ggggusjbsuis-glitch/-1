import { DAY_KEYS, DAY_LABELS, getTodayDayKey, type DayKey } from '../types';

interface Props {
  activeDay: DayKey;
  onSelect: (day: DayKey) => void;
}

export default function DateTabs({ activeDay, onSelect }: Props) {
  const today = getTodayDayKey();

  return (
    <div className="flex overflow-x-auto border-b bg-white sticky top-0 z-10">
      {DAY_KEYS.map((key) => {
        const isToday = key === today;
        const isActive = key === activeDay;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {DAY_LABELS[key]}
            {isToday && (
              <span className={`ml-1 text-xs ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                今天
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
