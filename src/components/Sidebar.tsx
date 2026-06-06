import type { TabId } from '../types';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const items: { id: TabId; icon: string; label: string }[] = [
  { id: 'staff', icon: '👥', label: '人员管理' },
  { id: 'classroom', icon: '🏫', label: '教室管理' },
  { id: 'keys', icon: '🔑', label: '钥匙管理' },
  { id: 'hall', icon: '🎤', label: '报告厅' },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="w-full md:w-[200px] bg-white md:border-r md:sticky md:top-[60px] md:h-[calc(100vh-60px)] overflow-y-auto flex md:block gap-1 p-2 md:p-5 border-b md:border-b-0 flex-shrink-0">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer text-sm font-medium transition-all whitespace-nowrap ${
            active === item.id
              ? 'bg-blue-50 text-blue-600 font-semibold'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <span
            className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0 transition-all ${
              active === item.id ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,.25)]' : 'bg-gray-100'
            }`}
          >
            {item.icon}
          </span>
          <span className="md:inline">{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
