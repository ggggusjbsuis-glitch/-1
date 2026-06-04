import { useState } from 'react';

interface Props {
  onUnlock: (password: string) => void;
}

const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export default function AdminGate({ onUnlock }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (input === PASSWORD) {
      onUnlock(input);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => {}}>
      <div className="bg-white rounded-xl mx-4 w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b font-medium text-gray-700">管理登录</div>
        <div className="p-4 space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="请输入管理密码"
            autoFocus
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <div className="text-red-500 text-xs">密码错误</div>}
        </div>
        <div className="p-4 border-t flex gap-3 justify-end">
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
