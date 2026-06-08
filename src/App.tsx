import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StaffPage from './components/StaffPage';
import ClassroomPage from './components/ClassroomPage';
import KeyPage from './components/KeyPage';
import HallPage from './components/HallPage';
import AuditoriumPage from './components/AuditoriumPage';
import KeyLogPage from './components/KeyLogPage';
import DashboardPage from './components/DashboardPage';
import AdminGate from './components/AdminGate';
import SettingsModal from './components/SettingsModal';
import { mockStaff, mockKeyData, mockHallEvents } from './data/mock';
import type { TabId, Staff, KeyData, HallEvent } from './types';

async function api<T>(method: string, url: string, body?: unknown): Promise<T | null> {
  try {
    const opts: RequestInit = { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined };
    const res = await fetch(url, opts);
    if (res.ok) return res.json();
  } catch {}
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('classroom');
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [keyData, setKeyData] = useState<KeyData | null>(mockKeyData);
  const [hallEvents, setHallEvents] = useState<Record<string, HallEvent[]>>(mockHallEvents);
  const [audEvents, setAudEvents] = useState<Record<string, HallEvent[]>>({});
  const [staff2, setStaff2] = useState<Staff[]>(mockStaff);
  const [isEditing, setIsEditing] = useState(() => { try { return localStorage.getItem('admin_auth') === '1'; } catch { return false; } });
  const [showGate, setShowGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await api<Staff[]>('GET', '/api/staff'); if (s) setStaff(s);
      const s2 = await api<Staff[]>('GET', '/api/staff2'); if (s2) setStaff2(s2);
      const h = await api<Record<string, HallEvent[]>>('GET', '/api/hall'); if (h) setHallEvents(h);
      const a = await api<Record<string, HallEvent[]>>('GET', '/api/auditorium'); if (a) setAudEvents(a);
    })();
  }, []);

  useEffect(() => {
    const load = async () => { const d = await api<KeyData>('GET', '/api/keys'); if (d) setKeyData(d); };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const saveStaff = async (list: Staff[]) => { setStaff(list); await api('PUT', '/api/staff', { password: 'admin123', data: list }); };
  const saveStaff2 = async (list: Staff[]) => { setStaff2(list); await api('PUT', '/api/staff2', { password: 'admin123', data: list }); };
  const saveHall = async (data: Record<string, HallEvent[]>) => { setHallEvents(data); await api('PUT', '/api/hall', { password: 'admin123', data }); };
  const saveAuditorium = async (data: Record<string, HallEvent[]>) => { setAudEvents(data); await api('PUT', '/api/auditorium', { password: 'admin123', data }); };

  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const tick = () => { const n = new Date(); setTimeStr(`${String(n.getMonth() + 1).padStart(2, '0')}/${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`); };
    tick(); const t = setInterval(tick, 10000); return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <header className="bg-white border-b border-gray-200 h-[60px] flex items-center justify-between px-6 sticky top-0 z-50 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-lg shadow-[0_2px_8px_rgba(37,99,235,.25)]">⚡</div>
          <h1 className="text-[17px] font-bold text-gray-900 tracking-[-.2px]">
            现代教育科教育管理系统
            <span className="text-[10px] text-gray-400 font-normal ml-1.5 bg-gray-100 py-0.5 px-2 rounded-md">v1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-gray-400 font-medium">{timeStr}</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-semibold">编辑模式</span>
              <button onClick={() => setShowSettings(true)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-[10px] text-[13px] font-medium hover:bg-gray-200 transition-all">⚙ 设置</button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-[10px] text-[13px] font-semibold hover:bg-gray-200 transition-all">退出</button>
            </div>
          ) : (
            <button onClick={() => setShowGate(true)} className="bg-blue-600 text-white px-5.5 py-2.5 rounded-[10px] text-[13px] font-semibold hover:bg-blue-700 shadow-[0_2px_6px_rgba(37,99,235,.25)] transition-all">登录管理</button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <Sidebar active={activeTab} onChange={setActiveTab} isEditing={isEditing} />
        <main className="flex-1 p-6 max-w-[1100px] min-w-0">
          {activeTab === 'staff' && <StaffPage data={staff} editing={isEditing} onSave={saveStaff} />}
          {activeTab === 'staff2' && <StaffPage data={staff2} editing={isEditing} onSave={saveStaff2} />}
          {activeTab === 'classroom' && <ClassroomPage keyData={keyData} />}
          {activeTab === 'keys' && <KeyPage data={keyData} />}
          {activeTab === 'hall' && <HallPage eventsByDate={hallEvents} editing={isEditing} onSave={saveHall} staffList={staff} />}
          {activeTab === 'auditorium' && <AuditoriumPage eventsByDate={audEvents} editing={isEditing} onSave={saveAuditorium} staffList={staff2} />}
          {activeTab === 'logs' && <KeyLogPage />}
          {activeTab === 'dashboard' && <DashboardPage />}
        </main>
      </div>

      {showGate && <AdminGate onUnlock={() => { setShowGate(false); setIsEditing(true); try { localStorage.setItem('admin_auth', '1'); } catch {} }} onClose={() => setShowGate(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
