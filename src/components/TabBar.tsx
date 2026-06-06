import type { TabId } from '../types';
import { TAB_LABELS } from '../types';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: TabId[] = ['staff', 'classroom', 'keys', 'hall'];

export default function TabBar({ active, onChange }: Props) {
  return (
    <div className="flex border-b bg-white sticky top-[52px] z-20">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            active === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
