import { useState, useEffect } from 'react';
import type { HallEvent, Staff } from '../types';

interface Props {
  eventsByDate: Record<string, HallEvent[]>;
  editing: boolean;
  onSave: (data: Record<string, HallEvent[]>) => void;
  staffList: Staff[];
}

const WLABELS = ['日', '一', '二', '三', '四', '五', '六'];
const DEFAULT_SLOTS = [
  { timeSlot: '08:00-10:00' },
  { timeSlot: '10:00-12:00' },
  { timeSlot: '14:00-16:00' },
  { timeSlot: '16:00-18:00' },
  { timeSlot: '18:00-21:00' },
];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fmtISO(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export default function HallPage({ eventsByDate, editing, onSave, staffList }: Props) {
  const [data, setData] = useState<Record<string, HallEvent[]>>({});
  const [editEvent, setEditEvent] = useState<HallEvent | null>(null);
  const [editDate, setEditDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(fmtISO(new Date())); // 选中的查看日期
  const [showDetail, setShowDetail] = useState(false); // 查看模式下的日期详情弹窗

  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const displayMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  const monthDays: Date[] = [];
  const monthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const calStart = new Date(monthStart);
  calStart.setDate(calStart.getDate() - calStart.getDay());
  for (let i = 0; i < 42; i++) {
    const d = new Date(calStart);
    d.setDate(d.getDate() + i);
    monthDays.push(d);
  }

  const today = fmtISO(new Date());

  useEffect(() => { setData({ ...eventsByDate }); }, [eventsByDate]);

  const handleSave = (evt: HallEvent) => {
    const next = { ...data };
    const dayEvents = next[evt.date] || DEFAULT_SLOTS.map((s) => ({ id: genId(), date: evt.date, timeSlot: s.timeSlot, eventName: '', organizer: '', contactPerson: '', contactPhone: '', status: 'free' as const }));
    const idx = dayEvents.findIndex((e) => e.id === evt.id);
    if (idx >= 0) dayEvents[idx] = evt; else dayEvents.push(evt);
    next[evt.date] = dayEvents;
    setData(next);
    onSave(next);
    setEditEvent(null);
    setEditDate('');
  };

  const handleDelete = (evt: HallEvent) => {
    const next = { ...data };
    next[evt.date] = (next[evt.date] || []).filter((e) => e.id !== evt.id);
    setData(next);
    onSave(next);
  };

  // 点击日期：统一弹出当日活动概览
  const handleDateClick = (ds: string) => {
    setSelectedDate(ds);
    setShowDetail(true);
  };

  // 点击活动条目：编辑模式打开编辑，查看模式显示详情
  const handleEventClick = (e: HallEvent) => {
    if (editing) {
      setEditEvent(e);
      setEditDate(e.date);
    } else {
      setSelectedDate(e.date);
      setShowDetail(true);
    }
  };

  const todayEvents = data[today] || [];
  const todayBusy = todayEvents.filter((e) => e.status === 'occupied');

  const monthEventCount = Object.entries(data).filter(([k, v]) => k.startsWith(fmtISO(monthStart).slice(0, 7)) && v.some((e) => e.status === 'occupied')).length;

  // 选中日期的活动
  const selEvents = data[selectedDate] || DEFAULT_SLOTS.map((s) => ({ id: genId(), date: selectedDate, timeSlot: s.timeSlot, eventName: '', organizer: '', contactPerson: '', contactPhone: '', status: 'free' as const }));
  const selDateObj = new Date(selectedDate + 'T00:00:00');

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 tracking-[-.3px]">报告厅</h2>
          <p className="text-[13px] text-gray-400">
            {displayMonth.getFullYear()}年{displayMonth.getMonth() + 1}月 · 本月 {monthEventCount} 场活动
          </p>
        </div>
        {editing && (
          <button onClick={() => { setEditEvent(null); setEditDate(today); }} className="bg-blue-600 text-white px-4 py-2 rounded-[10px] text-xs font-semibold hover:bg-blue-700 transition-all shrink-0">
            + 添加活动
          </button>
        )}
      </div>

      {/* 今日 Hero */}
      <div className={`rounded-[20px] p-8 mb-5 text-white relative overflow-hidden ${todayBusy.length > 0 ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gradient-to-br from-emerald-600 to-emerald-800'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_30%_0%,rgba(255,255,255,.12),transparent_70%)]" />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-[1px] opacity-80">报告厅 · 今日状态</div>
          <div className="text-[34px] font-extrabold my-2.5 tracking-[-1px]">{todayBusy.length > 0 ? '● 占用中' : '○ 空闲'}</div>
          <div className="text-sm opacity-90">{todayBusy.length > 0 ? `${todayBusy[0].timeSlot} · ${todayBusy[0].eventName}` : '今日暂无活动安排'}</div>
        </div>
      </div>

      {/* 月份切换 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonthOffset((o) => o - 1)} className="text-sm text-gray-400 hover:text-gray-600 font-medium px-2">← 上月</button>
        <span className="text-sm font-bold text-gray-700">{displayMonth.getFullYear()}年{displayMonth.getMonth() + 1}月</span>
        <button onClick={() => setMonthOffset((o) => o + 1)} className="text-sm text-gray-400 hover:text-gray-600 font-medium px-2">下月 →</button>
      </div>

      {/* 桌面端月历 */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden text-center text-[11px] font-semibold text-gray-400 bg-gray-100 mb-px">
          {WLABELS.map((l) => <div key={l} className="py-2 bg-gray-50">{l}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
          {monthDays.map((d, i) => {
            const ds = fmtISO(d);
            const isToday = ds === today;
            const isSelected = ds === selectedDate;
            const isThisMonth = d.getMonth() === displayMonth.getMonth();
            const evts = data[ds] || [];
            const busy = evts.filter((e) => e.status === 'occupied');
            return (
              <div
                key={i}
                onClick={() => handleDateClick(ds)}
                className={`bg-white min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-blue-50/30 ${!isThisMonth ? 'opacity-30' : ''} ${isSelected ? 'ring-2 ring-blue-400 ring-inset rounded-md' : ''}`}
              >
                <div className={`text-[11px] font-semibold mb-1 w-6 h-6 flex items-center justify-center mx-auto ${isToday ? 'bg-blue-600 text-white rounded-full' : 'text-gray-500'}`}>
                  {d.getDate()}
                </div>
                <div className="space-y-0.5">
                  {busy.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => { ev.stopPropagation(); handleEventClick(e); }}
                      className={`text-[9px] px-1 py-0.5 rounded-md truncate font-medium ${isToday ? 'bg-blue-50 text-blue-600' : 'bg-blue-50/50 text-blue-500'} hover:bg-blue-100 cursor-pointer`}
                      title={`${e.timeSlot} ${e.eventName} · ${e.contactPerson}`}
                    >
                      {e.eventName}
                    </div>
                  ))}
                  {busy.length > 3 && <div className="text-[9px] text-gray-300 pl-1">+{busy.length - 3} 更多</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 移动端：日期横滑 + 选中日期时间轴 */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto gap-1.5 mb-4 pb-1">
          {(() => {
            const showDays = monthDays.filter((d) => d.getMonth() === displayMonth.getMonth());
            const todayIdx = showDays.findIndex((d) => fmtISO(d) === today);
            const start = Math.max(0, todayIdx >= 0 ? todayIdx - 3 : 0);
            const slice = showDays.slice(start, start + 14);
            return slice.map((d) => {
              const ds = fmtISO(d);
              const isToday = ds === today;
              const isSelected = ds === selectedDate;
              const hasEvent = (data[ds] || []).some((e) => e.status === 'occupied');
              return (
                <button
                  key={ds}
                  onClick={() => { setSelectedDate(ds); if (editing) { setEditDate(ds); setEditEvent(null); } else { setShowDetail(true); } }}
                  className={`shrink-0 w-12 py-2 rounded-xl text-center transition-all border-[1.5px] ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-[0_2px_6px_rgba(37,99,235,.25)]'
                      : 'bg-white border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="text-[10px] font-medium">{isToday ? '今天' : `${d.getMonth() + 1}/${d.getDate()}`}</div>
                  <div className="text-[13px] font-bold">{WLABELS[d.getDay()]}</div>
                  {hasEvent && !isSelected && <div className="w-1 h-1 bg-red-400 rounded-full mx-auto mt-0.5" />}
                </button>
              );
            });
          })()}
        </div>

        {/* 选中日期的时间轴 */}
        <div className="relative pl-9 before:content-[''] before:absolute before:left-3.5 before:top-1 before:bottom-1 before:w-0.5 before:bg-gray-200 before:rounded">
          <div className="text-xs text-gray-400 mb-3 font-medium">
            {selectedDate} {WLABELS[selDateObj.getDay()]}
          </div>
          {selEvents.map((e) => (
            <div key={e.id} className={`relative mb-4 before:content-[''] before:absolute before:-left-[25px] before:top-1.5 before:w-2.5 before:h-2.5 before:rounded-full before:border-2 before:border-white ${e.status === 'free' ? 'before:bg-emerald-500 before:shadow-[0_0_0_2px_#10b981]' : 'before:bg-blue-600 before:shadow-[0_0_0_2px_#2563eb]'}`}>
              <div className="text-xs font-semibold text-blue-600 mb-1.5 flex items-center gap-2">
                {e.timeSlot}
                {editing && e.status === 'occupied' && (
                  <span className="flex gap-1 ml-auto">
                    <button onClick={() => { setEditEvent(e); setEditDate(e.date); }} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">编辑</button>
                    <button onClick={() => handleDelete(e)} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded">删除</button>
                  </span>
                )}
              </div>
              <div className={`rounded-2xl p-4 border shadow-sm ${e.status === 'free' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
                {e.status === 'free' ? (
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[15px] text-emerald-600">○ 空闲</div>
                    {editing && <button onClick={() => { setEditEvent({ ...e, date: selectedDate, id: genId() }); setEditDate(selectedDate); }} className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">添加</button>}
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-[15px] text-gray-900">{e.eventName}</div>
                    <div className="text-[13px] text-gray-400 mt-1.5 flex flex-wrap gap-x-4 gap-y-1"><span>🏛 {e.organizer}</span><span>👤 {e.contactPerson}</span><span>📞 {e.contactPhone}</span></div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 日期详情弹窗（查看+编辑共用） */}
      {showDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl mx-4 w-full max-w-sm shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-gray-900">{selectedDate}</div>
                <div className="text-xs text-gray-400">{WLABELS[selDateObj.getDay()]}曜日</div>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {selEvents.map((e) => (
                <div key={e.id} className="mb-4 last:mb-0">
                  <div className="text-xs font-semibold text-blue-600 mb-1.5">{e.timeSlot}</div>
                  <div className={`rounded-2xl p-4 border ${e.status === 'free' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                    {e.status === 'free' ? (
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-[15px] text-emerald-600">○ 空闲</div>
                        {editing && (
                          <button onClick={() => { setEditEvent({ ...e, date: selectedDate, id: genId() }); setEditDate(selectedDate); setShowDetail(false); }} className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-medium">+ 添加</button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-[15px] text-gray-900">{e.eventName}</div>
                          {editing && (
                            <div className="flex gap-1 shrink-0 ml-2">
                              <button onClick={() => { setEditEvent(e); setEditDate(e.date); setShowDetail(false); }} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">编辑</button>
                              <button onClick={() => handleDelete(e)} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded">删除</button>
                            </div>
                          )}
                        </div>
                        <div className="text-[13px] text-gray-400 flex flex-col gap-1">
                          <span>🏛 {e.organizer}</span>
                          <span>👤 {e.contactPerson}</span>
                          <span>📞 {e.contactPhone}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {editing && (
              <div className="p-5 border-t border-gray-100">
                <button onClick={() => { setEditEvent(null); setEditDate(selectedDate); setShowDetail(false); }} className="w-full py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                  + 添加新活动
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 编辑模式弹窗 */}
      {editDate && (
        <EditEventModal
          key={editEvent?.id || editDate}
          event={editEvent}
          date={editDate}
          staffList={staffList}
          occupiedSlots={(data[editDate] || []).filter(e => e.status === 'occupied' && e.id !== editEvent?.id).map(e => e.timeSlot)}
          onSave={handleSave}
          onClose={() => { setEditEvent(null); setEditDate(''); }}
        />
      )}
    </>
  );
}

// ====== 编辑弹窗（不变） ======
function EditEventModal({
  event, date, staffList, occupiedSlots, onSave, onClose,
}: {
  event: HallEvent | null; date: string; staffList: Staff[];
  occupiedSlots: string[];
  onSave: (e: HallEvent) => void; onClose: () => void;
}) {
  const [timeSlot, setTimeSlot] = useState(event?.timeSlot || '08:00-10:00');
  const [eventName, setEventName] = useState(event?.eventName || '');
  const [organizer, setOrganizer] = useState(event?.organizer || '');
  const [contactPerson, setContactPerson] = useState(event?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(event?.contactPhone || '');

  const selectStaff = (name: string) => {
    const s = staffList.find((p) => p.name === name);
    if (s) { setContactPerson(s.name); setContactPhone(s.phone); }
  };

  const save = () => {
    if (!eventName.trim()) return;
    onSave({ id: event?.id || genId(), date, timeSlot, eventName: eventName.trim(), organizer: organizer.trim(), contactPerson: contactPerson.trim(), contactPhone: contactPhone.trim(), status: 'occupied' });
    onClose();
  };

  const clearToFree = () => {
    if (event) onSave({ ...event, eventName: '', organizer: '', contactPerson: '', contactPhone: '', status: 'free' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl mx-4 w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="text-lg font-bold text-gray-900">{event ? '编辑活动' : '添加活动'}</div>
          <div className="text-xs text-gray-400 mt-0.5">{date}</div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">时间段</label>
            <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
              {DEFAULT_SLOTS.filter((s) => !occupiedSlots.includes(s.timeSlot)).map((s) => <option key={s.timeSlot} value={s.timeSlot}>{s.timeSlot}</option>)}
              {DEFAULT_SLOTS.filter((s) => !occupiedSlots.includes(s.timeSlot)).length === 0 && <option value="">所有时段已满</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">活动名称</label>
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="学术讲座：XXX" className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">主办单位</label>
            <input value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="计算机学院" className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">负责人</label>
            {staffList.length > 0 && (
              <select value={contactPerson} onChange={(e) => selectStaff(e.target.value)} className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white mb-2">
                <option value="">从人员列表选择...</option>
                {staffList.map((s) => <option key={s.id} value={s.name}>{s.name} — {s.phone}</option>)}
              </select>
            )}
            <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="负责人姓名" className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">联系电话</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="13800001111" className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all" />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-between sticky bottom-0 bg-white">
          <div>{event && <button onClick={clearToFree} className="px-4 py-2 text-sm text-red-500 hover:text-red-700 font-medium">清为空闲</button>}</div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 font-medium">取消</button>
            <button onClick={save} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-[0_2px_6px_rgba(37,99,235,.25)]">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
