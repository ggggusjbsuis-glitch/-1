interface Props {
  onEdit: () => void;
}

export default function TopBar({ onEdit }: Props) {
  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <h1 className="text-base font-bold truncate">现代教育科教育管理系统</h1>
      <button
        onClick={onEdit}
        className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        编辑
      </button>
    </div>
  );
}
