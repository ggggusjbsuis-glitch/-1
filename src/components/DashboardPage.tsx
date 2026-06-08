import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Pair3101 {
  borrowTime: string; returnTime: string; duration: number; borrower: string;
  eventName?: string; organizer?: string;
}

interface KeyStat { keyName: string; borrowCount: number; returnCount: number; }

interface Stats { key3101: { pairs: Pair3101[] }; allKeys: KeyStat[]; }

function fmtDur(m: number): string {
  if (m < 60) return `${m}min`;
  return `${Math.floor(m / 60)}h${m % 60}min`;
}

function timeToX(t: string): number {
  const h = parseInt(t.slice(11, 13)), mi = parseInt(t.slice(14, 16));
  return h + mi / 60;
}

const PIE_COLORS = ['#ef4444', '#10b981'];
const BAR_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93bbfd', '#bfdbfe', '#dbeafe', '#2563eb', '#3b82f6', '#60a5fa', '#93bbfd', '#bfdbfe', '#dbeafe', '#2563eb', '#3b82f6', '#60a5fa'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      try { const r = await fetch('/api/stats'); if (r.ok) setStats(await r.json()); } catch {}
    };
    load(); const t = setInterval(load, 60000); return () => clearInterval(t);
  }, []);

  if (!stats) return <div className="text-gray-300 text-center py-20">加载中...</div>;

  const { key3101, allKeys } = stats;
  const pairs = key3101?.pairs || [];
  const ks = allKeys?.slice(0, 15) || [];
  const totalBorrow = ks.reduce((s, k) => s + k.borrowCount, 0);
  const totalReturn = ks.reduce((s, k) => s + k.returnCount, 0);

  // 找出最活跃时段
  const hourMap: Record<number, number> = {};
  pairs.forEach(p => { const h = Math.floor(timeToX(p.borrowTime)); hourMap[h] = (hourMap[h] || 0) + 1; });
  const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">数据看板</h2>
      <p className="text-[13px] text-gray-400 mb-6">今日钥匙使用统计</p>

      {/* 概览卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label:'总借出', val:totalBorrow, color:'#ef4444' },{ label:'总归还', val:totalReturn, color:'#10b981' },{ label:'最活跃', val:peakHour ? `${peakHour[0]}:00` : '—', color:'#2563eb' }].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-extrabold" style={{color:c.color}}>{c.val}</div>
            <div className="text-[11px] text-gray-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* 区块 1: 3101 时间轴 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">🏛 报3101 今日使用时间轴</h3>
        {pairs.length === 0 ? (
          <div className="text-gray-300 text-center py-8 text-sm">今日暂无使用记录</div>
        ) : (
          <div className="relative" style={{ paddingLeft: 50, paddingRight: 10 }}>
            {/* X 轴刻度 */}
            <div className="flex justify-between text-[10px] text-gray-400 mb-2" style={{ marginLeft: 50 }}>
              {Array.from({length:15}, (_,i) => i+8).map(h => <span key={h}>{h}:00</span>)}
            </div>
            {/* 网格线 + 条形 */}
            <div className="relative" style={{ minHeight: pairs.length * 52 + 10 }}>
              {/* 竖线 */}
              {Array.from({length:15}, (_,i) => i+8).map(h => (
                <div key={h} className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: `${((h-8)/14)*100}%`, marginLeft: 50 }} />
              ))}
              {/* 条形 */}
              {pairs.map((p, i) => {
                const startX = ((timeToX(p.borrowTime) - 8) / 14) * 100;
                const width = Math.max((p.duration / 60 / 14) * 100, 4);
                return (
                  <div key={i} className="relative flex items-center mb-2" style={{ height: 42 }}>
                    <div className="absolute left-0 text-[11px] text-gray-500 w-[45px] truncate text-right pr-2">
                      {p.eventName ? p.eventName.slice(0, 5) : '使用'}
                    </div>
                    <div style={{ marginLeft: 50, flex: 1, position: 'relative', height: 32 }}>
                      <div
                        className="absolute rounded-lg flex items-center justify-center text-white text-[10px] font-semibold px-1 truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          left: `${startX}%`, width: `${width}%`, top: 0, height: 32,
                          background: p.eventName ? 'linear-gradient(90deg, #2563eb, #60a5fa)' : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                        }}
                      >
                        {fmtDur(p.duration)}
                      </div>
                    </div>
                    <span className="absolute right-1 text-[10px] text-gray-400">{p.borrower.slice(0, 6)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 区块 2: 钥匙排行 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2">📊 钥匙借出排行</h3>
          {ks.length === 0 ? <div className="text-gray-300 text-center py-12 text-sm">暂无数据</div> : (
            <ResponsiveContainer width="100%" height={ks.length * 28 + 30}>
              <BarChart data={ks} layout="vertical" margin={{ left: 42, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="keyName" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [`${v} 次`, '借出']} />
                <Bar dataKey="borrowCount" radius={[0, 6, 6, 0]}>
                  {ks.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 区块 3: 饼图 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2">⭕ 借出/归还比例</h3>
          {totalBorrow + totalReturn === 0 ? <div className="text-gray-300 text-center py-12 text-sm">暂无数据</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[{name:'借出',value:totalBorrow},{name:'归还',value:totalReturn}]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {[{name:'借出',value:totalBorrow},{name:'归还',value:totalReturn}].map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
