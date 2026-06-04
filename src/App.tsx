import { useState } from 'react';
import { useSchedule } from './hooks/useSchedule';
import type { Schedule } from './types';
import ScheduleView from './components/ScheduleView';
import ScheduleEdit from './components/ScheduleEdit';
import AdminGate from './components/AdminGate';

export default function App() {
  const { schedule, loading, error, reload } = useSchedule();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showGate, setShowGate] = useState(false);
  const [password, setPassword] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="text-red-500 text-sm">加载失败: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-500 underline"
        >
          重试
        </button>
      </div>
    );
  }

  if (!schedule) return null;

  const handleUnlock = (pw: string) => {
    setPassword(pw);
    setShowGate(false);
    setMode('edit');
  };

  const handleSaved = (_saved: Schedule) => {
    reload();
  };

  const handleExitEdit = () => {
    setMode('view');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {mode === 'view' ? (
        <ScheduleView
          schedule={schedule}
          onLongPressTitle={() => setShowGate(true)}
        />
      ) : (
        <ScheduleEdit
          schedule={schedule}
          password={password}
          onExit={handleExitEdit}
          onSaved={handleSaved}
        />
      )}

      {showGate && <AdminGate onUnlock={handleUnlock} />}
    </div>
  );
}
