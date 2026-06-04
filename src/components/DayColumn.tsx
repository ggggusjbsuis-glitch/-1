import type { CourseItem as CourseItemType } from '../types';
import CourseItem from './CourseItem';

interface Props {
  label: string;
  courses: CourseItemType[];
  editable?: boolean;
  onEditCourse?: (course: CourseItemType) => void;
  onDeleteCourse?: (courseId: string) => void;
  onAddCourse?: () => void;
}

export default function DayColumn({ label, courses, editable, onEditCourse, onDeleteCourse, onAddCourse }: Props) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-center font-medium text-gray-500 text-sm py-3 border-b bg-gray-50 rounded-t-lg">
        {label}
      </div>
      <div className="p-2 space-y-2 min-h-[200px]">
        {courses.map((c) => (
          <CourseItem
            key={c.id}
            course={c}
            editable={editable}
            onEdit={() => onEditCourse?.(c)}
            onDelete={() => onDeleteCourse?.(c.id)}
          />
        ))}
        {courses.length === 0 && (
          <div className="text-gray-300 text-sm text-center py-8">暂无课程</div>
        )}
      </div>
      {editable && (
        <div className="px-2 pb-2">
          <button
            onClick={onAddCourse}
            className="w-full py-1.5 text-xs text-blue-500 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
          >
            + 添加课程
          </button>
        </div>
      )}
    </div>
  );
}
