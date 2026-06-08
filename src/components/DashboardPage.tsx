import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

interface Session { borrowTime: string; returnTime: string; duration: number; borrower: string; eventName?: string; organizer?: string; }
interface GanttKey { keyName: string; sessions: Session[]; }
interface WeeklyDay { date: string; pairs: Session[]; totalDuration: number; }
interface KeyDur { keyName: string; totalDuration: number; }
interface Stats { ganttKeys: GanttKey[]; weekly3101: WeeklyDay[]; keyDurations: KeyDur[]; }

function fmtDur(m: number): string { return m < 60 ? `${m}min` : `${Math.floor(m/60)}h${m%60}min`; }
function timeToX(t: string): number { return parseInt(t.slice(11,13)) + parseInt(t.slice(14,16))/60; }
const BAR_COLORS = ['#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'];
const WEEKDAYS = ['周日','周一','周二','周三','周四','周五','周六'];
const LEFT_PAD = 55;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { const load = async () => { try { const r = await fetch('/api/stats'); if (r.ok) setStats(await r.json()); } catch {} }; load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  if (!stats) return <div className="text-gray-300 text-center py-20">加载中...</div>;

  const { ganttKeys, weekly3101, keyDurations } = stats;
  const totalTodayMin = ganttKeys.reduce((s, k) => s + k.sessions.reduce((ss, ss2) => ss + ss2.duration, 0), 0);
  const g3101 = ganttKeys.find((k) => k.keyName === '报3101');
  const s3101 = g3101?.sessions || [];

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">数据看板</h2>
      <p className="text-[13px] text-gray-400 mb-6">今日钥匙使用时长统计 · 累计 {fmtDur(totalTodayMin)}</p>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">📊 今日钥匙使用时间轴</h3>
        {ganttKeys.length === 0 ? <div className="text-gray-300 text-center py-8 text-sm">今日暂无使用记录</div> : (
          <div className="overflow-x-auto">
            <div className="relative" style={{ minWidth: 500, paddingLeft: LEFT_PAD, paddingRight: 10 }}>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                {Array.from({length:15},(_,i)=>i+8).map(h=><span key={h}>{h}:00</span>)}
              </div>
              {ganttKeys.slice(0, 20).map((gk) => {
                const keyRows = gk.sessions.map((s, si) => {
                  const l = ((timeToX(s.borrowTime)-8)/14)*100;
                  const w = Math.max((s.duration/60/14)*100, 1);
                  return <div key={si} className="absolute rounded-md flex items-center text-[9px] text-white font-semibold px-1 truncate hover:opacity-80 transition-opacity"
                    style={{ left: `${l}%`, width: `${w}%`, top: 1, height: 16, background: s.duration > 120 ? 'linear-gradient(90deg,#ef4444,#f87171)' : s.duration > 60 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#2563eb,#60a5fa)' }}
                    title={`${s.borrowTime.slice(11)}-${s.returnTime.slice(11)} ${s.borrower} ${fmtDur(s.duration)}`}
                  >{s.duration >= 20 ? fmtDur(s.duration) : ''}</div>;
                });
                return (
                  <div key={gk.keyName} className="flex items-center mb-1.5" style={{ height: 24, marginLeft: -LEFT_PAD }}>
                    <div className="text-[11px] font-semibold text-gray-600 text-right pr-2 shrink-0" style={{ width: LEFT_PAD - 5 }}>{gk.keyName}</div>
                    <div className="flex-1 relative" style={{ height: 18 }}>{keyRows}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2">🏛 报3101 今日活动时长</h3>
          {s3101.length === 0 ? <div className="text-gray-300 text-center py-12 text-sm">今日暂无使用记录</div> : (
            <ResponsiveContainer width="100%" height={Math.max(s3101.length * 36 + 30, 120)}>
              <BarChart data={s3101} layout="vertical" margin={{ left: 80, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtDur} />
                <YAxis type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90}
                  dataKey="eventName" tickFormatter={(v) => (v || '未关联').length > 10 ? (v || '未关联').slice(0,10)+'…' : (v || '未关联')} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(v) => [fmtDur(v as number), '时长']} />
                <Bar dataKey="duration" radius={[0,6,6,0]}>
                  {s3101.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2">⏱ 今日累计使用时长</h3>
          {keyDurations.length === 0 ? <div className="text-gray-300 text-center py-12 text-sm">暂无数据</div> : (
            <ResponsiveContainer width="100%" height={Math.max(keyDurations.slice(0,15).length * 28 + 30, 150)}>
              <BarChart data={keyDurations.slice(0,15)} layout="vertical" margin={{ left: 42, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtDur} />
                <YAxis dataKey="keyName" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [fmtDur(v as number), '累计时长']} />
                <Bar dataKey="totalDuration" radius={[0,6,6,0]}>
                  {keyDurations.slice(0,15).map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-3">🏛 报3101 本周使用记录</h3>
        {weekly3101.length === 0 ? <div className="text-gray-300 text-center py-6 text-sm">本周暂无使用记录</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead><tr>
                <th className="text-left text-[11px] text-gray-400 font-semibold uppercase pb-2 border-b border-gray-100">日期</th>
                <th className="text-left text-[11px] text-gray-400 font-semibold uppercase pb-2 border-b border-gray-100">活动</th>
                <th className="text-left text-[11px] text-gray-400 font-semibold uppercase pb-2 border-b border-gray-100">借出</th>
                <th className="text-left text-[11px] text-gray-400 font-semibold uppercase pb-2 border-b border-gray-100">归还</th>
                <th className="text-right text-[11px] text-gray-400 font-semibold uppercase pb-2 border-b border-gray-100">时长</th>
              </tr></thead>
              <tbody>
                {weekly3101.flatMap((d) => d.pairs.map((p) => (
                  <tr key={p.borrowTime} className="hover:bg-gray-50">
                    <td className="py-2 text-gray-500 border-b border-gray-50">{d.date} {WEEKDAYS[new Date(d.date+'T00:00:00').getDay()]}</td>
                    <td className="py-2 font-medium border-b border-gray-50">{p.eventName || <span className="text-gray-300">未关联活动</span>}</td>
                    <td className="py-2 text-gray-500 font-mono border-b border-gray-50">{p.borrowTime.slice(11,16)}</td>
                    <td className="py-2 text-gray-500 font-mono border-b border-gray-50">{p.returnTime.slice(11,16)}</td>
                    <td className="py-2 text-right font-semibold text-blue-600 border-b border-gray-50">{fmtDur(p.duration)}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
