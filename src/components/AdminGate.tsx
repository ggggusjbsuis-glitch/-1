import { useState } from 'react';

interface Props {
  onUnlock: () => void;
  onClose: () => void;
}

export default function AdminGate({ onUnlock, onClose }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    // 默认密码，后续可改为从服务器配置读取
    if (input === 'admin123') {
      onUnlock();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl mx-4 w-full max-w-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-bold text-gray-900">管理员登录</div>
          <div className="text-xs text-gray-400 mt-1">请输入管理密码以进入编辑模式</div>
        </div>
        <div className="p-5 space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="请输入管理密码"
            autoFocus
            className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.08)] transition-all"
          />
          {error && <div className="text-red-500 text-xs -mt-2">密码错误，请重试</div>}
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">取消</button>
          <button onClick={handleSubmit} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-[0_2px_6px_rgba(37,99,235,.25)] transition-all">
            确认登录
          </button>
        </div>
      </div>
    </div>
  );
}
