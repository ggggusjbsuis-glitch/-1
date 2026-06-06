import type { KeyData } from '../types';

interface Props {
  data: KeyData | null;
}

export default function KeyPage({ data }: Props) {
  if (!data) {
    return (
      <>
        <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">钥匙管理</h2>
        <p className="text-[13px] text-gray-400 mb-6">智能柜钥匙状态追踪</p>
        <div className="text-gray-300 text-center py-20">暂无数据</div>
      </>
    );
  }

  // 过滤未存入的 + 合并同名钥匙
  const validKeys = data.keys.list.filter((k) => k.location !== '未存入');
  const roomMap = new Map<string, { statuses: string[]; location: string; keyType: string }>();
  for (const k of validKeys) {
    const name = (k.name || '').trim();
    if (!roomMap.has(name)) roomMap.set(name, { statuses: [], location: k.location, keyType: k.keyType });
    roomMap.get(name)!.statuses.push(k.status);
  }

  const merged = Array.from(roomMap.entries()).map(([name, entry]) => ({
    id: name,
    name,
    location: entry.location,
    keyType: entry.keyType,
    status: entry.statuses.every((s) => s === '存入') ? '存入' : '取出',
  }));

  const total = merged.length;
  const putIn = merged.filter((k) => k.status === '存入').length;
  const takeOut = merged.filter((k) => k.status === '取出').length;
  const errCount = merged.filter((k) => k.status === '归还错误').length;

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">钥匙管理</h2>
      <p className="text-[13px] text-gray-400 mb-6">智能柜钥匙状态追踪</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        {[
          { icon: '📋', num: total, label: '钥匙总数', color: '#64748b' },
          { icon: '✅', num: putIn, label: '在库', color: '#10b981' },
          { icon: '🔴', num: takeOut, label: '借出', color: '#ef4444' },
          { icon: '⚠️', num: errCount, label: '异常', color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-2xl mb-2.5">{s.icon}</div>
            <div className="text-[32px] font-extrabold tracking-[-1px] leading-none" style={{ color: s.color }}>{s.num}</div>
            <div className="text-xs text-gray-400 mt-1.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 移动端 */}
      <div className="md:hidden space-y-2">
        {merged.map((k) => (
          <div key={k.id} className="bg-white rounded-2xl px-[18px] py-3.5 flex items-center gap-3.5 shadow-sm border border-gray-100">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${k.status === '存入' ? 'bg-green-500 shadow-[0_0_0_3px_rgba(16,185,129,.2)] opacity-25' : 'bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,.2)] opacity-25'}`} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">{k.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.location}</div>
            </div>
            <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-semibold shrink-0 ${k.status === '存入' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {k.status === '存入' ? '在库' : '借出'}
            </span>
          </div>
        ))}
      </div>

      {/* 桌面端 */}
      <table className="hidden md:table w-full border-separate border-spacing-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <thead>
          <tr>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">状态</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">钥匙名</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">位置</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">类型</th>
          </tr>
        </thead>
        <tbody>
          {merged.map((k) => (
            <tr key={k.id} className="hover:bg-[#fafcff]">
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">
                <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-semibold ${k.status === '存入' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {k.status === '存入' ? '在库' : '借出'}
                </span>
              </td>
              <td className="px-[18px] py-3.5 text-sm font-semibold border-b border-gray-50">{k.name}</td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">{k.location}</td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">{k.keyType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
