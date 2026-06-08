import { useState, useEffect } from 'react';
import type { KeyLogEntry } from '../types';
import UserName from './UserName';

export default function KeyLogPage() {
  const [logs, setLogs] = useState<KeyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKey, setFilterKey] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/logs?limit=200');
        if (res.ok) setLogs(await res.json());
      } catch {}
      setLoading(false);
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const filtered = logs.filter((l) => {
    if (filterKey && !l.keyName.includes(filterKey)) return false;
    if (filterUser && !l.userName.includes(filterUser)) return false;
    return true;
  });

  const borrowCount = filtered.filter((l) => l.action === 'borrow').length;
  const returnCount = filtered.filter((l) => l.action === 'return').length;
  const now = Date.now();

  if (loading) return <div className="text-gray-300 text-center py-20">加载中...</div>;

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">钥匙日志</h2>
      <p className="text-[13px] text-gray-400 mb-6">
        共 {filtered.length} 条 · 借出 {borrowCount} · 归还 {returnCount}
      </p>

      {/* 搜索 */}
      <div className="flex gap-3 mb-4">
        <input
          value={filterKey}
          onChange={(e) => setFilterKey(e.target.value)}
          placeholder="搜索钥匙名..."
          className="flex-1 border-[1.5px] border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
        />
        <input
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          placeholder="搜索借用人..."
          className="flex-1 border-[1.5px] border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* 移动端时间轴 */}
      <div className="md:hidden relative pl-9 before:content-[''] before:absolute before:left-3.5 before:top-1 before:bottom-1 before:w-0.5 before:bg-gray-200 before:rounded">
        {filtered.slice(0, 50).map((l) => {
          const isFresh = now - new Date(l.time).getTime() < 3600000;
          return (
            <div key={l.id} className={`relative mb-4 before:content-[''] before:absolute before:-left-[25px] before:top-1.5 before:w-2.5 before:h-2.5 before:rounded-full before:border-2 before:border-white ${l.action === 'borrow' ? 'before:bg-red-500 before:shadow-[0_0_0_2px_#ef4444]' : 'before:bg-emerald-500 before:shadow-[0_0_0_2px_#10b981]'}`}>
              <div className="text-[11px] font-semibold text-gray-400 mb-1">{l.time}</div>
              <div className={`rounded-2xl p-4 border shadow-sm ${isFresh ? 'ring-2 ring-blue-200 bg-blue-50/30' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${l.action === 'borrow' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {l.action === 'borrow' ? '借出' : '归还'}
                  </span>
                  <span className="font-semibold text-sm text-gray-900">{l.keyName}</span>
                  {isFresh && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">新</span>}
                </div>
                <div className="text-xs text-gray-400 mt-2"><UserName name={l.userName} /> · {l.location} · {l.remark}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 桌面端表格 */}
      <table className="hidden md:table w-full border-separate border-spacing-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <thead><tr>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">时间</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">动作</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">钥匙</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">借用人</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">位置</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">备注</th>
        </tr></thead>
        <tbody>
          {filtered.slice(0, 100).map((l) => {
            const isFresh = now - new Date(l.time).getTime() < 3600000;
            return (
              <tr key={l.id} className={`hover:bg-[#fafcff] ${isFresh ? 'bg-blue-50/30' : ''}`}>
                <td className="px-[18px] py-3.5 text-sm font-mono text-gray-500 border-b border-gray-50">{l.time}</td>
                <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${l.action === 'borrow' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {l.action === 'borrow' ? '借出' : '归还'}
                  </span>
                </td>
                <td className="px-[18px] py-3.5 text-sm font-semibold border-b border-gray-50">{l.keyName}</td>
                <td className="px-[18px] py-3.5 text-sm border-b border-gray-50"><UserName name={l.userName} /></td>
                <td className="px-[18px] py-3.5 text-xs text-gray-400 border-b border-gray-50">{l.location}</td>
                <td className="px-[18px] py-3.5 text-xs text-gray-400 border-b border-gray-50">{l.remark}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
