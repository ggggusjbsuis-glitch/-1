import type { CourseItem as CourseItemType } from '../types';

interface Props {
  course: CourseItemType;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CourseItem({ course, editable, onEdit, onDelete }: Props) {
  return (
    <div
      onClick={editable ? onEdit : undefined}
      className={`rounded-lg p-3 text-left ${
        editable
          ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 bg-white shadow-sm'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs text-gray-400 font-mono">{course.time}</span>
        {editable && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-400 hover:text-red-600 text-xs ml-2 shrink-0"
          >
            ✕
          </button>
        )}
      </div>
      <div className="font-medium text-gray-800 mt-0.5">{course.subject}</div>
      <div className="text-xs text-gray-400 mt-1">
        {course.room}{course.teacher ? ` · ${course.teacher}` : ''}
      </div>
    </div>
  );
}
