import type { CourseItem as CourseItemType } from '../types';
import CourseItem from './CourseItem';

interface Props {
  courses: CourseItemType[];
  editable?: boolean;
  onEditCourse?: (course: CourseItemType) => void;
  onDeleteCourse?: (courseId: string) => void;
  onAddCourse?: () => void;
}

export default function DayCard({ courses, editable, onEditCourse, onDeleteCourse, onAddCourse }: Props) {
  return (
    <div className="p-3 space-y-3">
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
        <div className="text-gray-300 text-sm text-center py-12">暂无课程</div>
      )}
      {editable && (
        <button
          onClick={onAddCourse}
          className="w-full py-2 text-sm text-blue-500 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
        >
          + 添加课程
        </button>
      )}
    </div>
  );
}
