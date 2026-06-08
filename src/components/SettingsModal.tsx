import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const [cookie, setCookie] = useState('');
  const [status, setStatus] = useState<{ cookieConfigured?: boolean; fetchStatus?: string } | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setStatus).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!cookie.trim()) { setMessage('请输入 Cookie'); return; }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'admin123', cookie: cookie.trim() }),
      });
      const data = await res.json();
      setMessage(data.message || (data.ok ? '保存成功' : '保存失败'));
      if (data.ok) {
        setCookie('');
        // 刷新状态
        const s = await fetch('/api/config').then(r => r.json());
        setStatus(s);
      }
    } catch {
      setMessage('网络错误');
    }
    setSaving(false);
  };

  const handleFetchNow = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/fetch-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'admin123' }),
      });
      const data = await res.json();
      setMessage(data.message || (data.ok ? '抓取成功' : '抓取失败'));
    } catch {
      setMessage('网络错误');
    }
  };

  const fetchOk = status?.fetchStatus?.startsWith('ok_');
  const fetchTime = status?.fetchStatus?.startsWith('ok_')
    ? new Date(parseInt(status.fetchStatus.split('_')[1])).toLocaleTimeString('zh-CN')
    : '';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl mx-4 w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="text-lg font-bold text-gray-900">系统设置</div>
          <div className="text-xs text-gray-400 mt-0.5">钥匙抓取 Cookie 管理</div>
        </div>

        <div className="p-5 space-y-5">
          {/* 当前状态 */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">当前状态</div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span>Cookie 配置：</span>
                <span className={status?.cookieConfigured ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                  {status?.cookieConfigured ? '已配置' : '未配置'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>最近抓取：</span>
                <span className={fetchOk ? 'text-green-600' : 'text-red-500'}>
                  {fetchOk ? `成功 (${fetchTime})` : status?.fetchStatus === 'cookie_expired' ? 'Cookie 过期' : '等待中'}
                </span>
              </div>
            </div>
          </div>

          {/* 更新 Cookie */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">更新 Cookie</div>
            <textarea
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              rows={4}
              placeholder="从浏览器 F12 → Network → Request Headers → 复制 Cookie: 后面的整行内容..."
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-blue-500 transition-all resize-none"
            />
            <div className="text-[11px] text-gray-400 mt-1">
              如何获取：打开钥匙管理系统 → F12 → 网络(Network) → 点任意请求 → 请求标头(Request Headers) → 找到 Cookie: 那一行，复制完整值
            </div>
          </div>

          {message && (
            <div className={`text-sm px-3 py-2 rounded-xl ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-between sticky bottom-0 bg-white">
          <div className="flex gap-3">
            <button onClick={handleFetchNow} className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium">手动抓取一次</button>
            <button onClick={() => { try { localStorage.removeItem('admin_auth'); } catch {} window.location.reload(); }} className="px-4 py-2 text-sm text-red-400 hover:text-red-600 font-medium">清除登录</button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 font-medium">关闭</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-[0_2px_6px_rgba(37,99,235,.25)] disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存 Cookie'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
