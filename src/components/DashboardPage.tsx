import { useState, useEffect } from 'react';

interface Pair3101 {
  borrowTime: string;
  returnTime: string;
  duration: number;
  borrower: string;
  eventName?: string;
  organizer?: string;
  contactPerson?: string;
}

interface KeyStat {
  keyName: string;
  borrowCount: number;
  returnCount: number;
}

interface Stats {
  key3101: { totalBorrows: number; pairs: Pair3101[] };
  allKeys: KeyStat[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) setStats(await res.json());
      } catch {}
      setLoading(false);
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="text-gray-300 text-center py-20">加载中...</div>;
  if (!stats) return <div className="text-gray-300 text-center py-20">暂无数据</div>;

  const { key3101, allKeys } = stats;

  function fmtDur(min: number): string {
    if (min < 60) return `${min}分钟`;
    return `${Math.floor(min / 60)}小时${min % 60}分钟`;
  }

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">数据看板</h2>
      <p className="text-[13px] text-gray-400 mb-6">今日钥匙使用统计 · {new Date().toLocaleDateString('zh-CN')}</p>

      {/* 3101 专用 */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🏛 报3101（大礼堂）</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-extrabold text-blue-600">{key3101.totalBorrows}</div>
            <div className="text-xs text-gray-400 mt-1">今日借出次数</div>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-extrabold text-emerald-600">{key3101.pairs.length}</div>
            <div className="text-xs text-gray-400 mt-1">已完成使用</div>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-extrabold text-orange-600">
              {key3101.pairs.length > 0 ? fmtDur(key3101.pairs.reduce((s, p) => s + p.duration, 0)) : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">累计使用时长</div>
          </div>
        </div>

        {key3101.pairs.length === 0 ? (
          <div className="text-gray-300 text-center py-6 bg-white rounded-2xl border border-gray-100">今日暂无使用记录</div>
        ) : (
          <div className="space-y-3">
            {key3101.pairs.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">{p.borrowTime.slice(11, 16)}</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-sm font-semibold text-gray-700">{p.returnTime.slice(11, 16)}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{fmtDur(p.duration)}</span>
                </div>
                {p.eventName ? (
                  <div className="bg-blue-50 rounded-xl p-3 space-y-1">
                    <div className="text-sm font-semibold text-blue-700">{p.eventName}</div>
                    <div className="text-xs text-blue-500">
                      {p.organizer && <span>🏛 {p.organizer} · </span>}
                      {p.contactPerson && <span>👤 {p.contactPerson} · </span>}
                      👤 {p.borrower}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                    非活动使用 · {p.borrower}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 全部钥匙排行 */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">📊 今日全部钥匙使用排行</h3>
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100 w-10">#</th>
                <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">钥匙名</th>
                <th className="bg-[#fafbfc] px-[18px] py-3.5 text-right text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">借出</th>
                <th className="bg-[#fafbfc] px-[18px] py-3.5 text-right text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">归还</th>
              </tr>
            </thead>
            <tbody>
              {allKeys.slice(0, 20).map((k, i) => (
                <tr key={k.keyName} className="hover:bg-[#fafcff]">
                  <td className="px-[18px] py-3 text-sm text-gray-400 border-b border-gray-50">{i + 1}</td>
                  <td className="px-[18px] py-3 text-sm font-semibold border-b border-gray-50">{k.keyName}</td>
                  <td className="px-[18px] py-3 text-sm text-right font-semibold text-red-500 border-b border-gray-50">{k.borrowCount}</td>
                  <td className="px-[18px] py-3 text-sm text-right font-semibold text-emerald-500 border-b border-gray-50">{k.returnCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
