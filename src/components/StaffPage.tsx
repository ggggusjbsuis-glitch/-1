import { useState, useEffect } from 'react';
import type { Staff } from '../types';

const COLORS = ['#2563eb', '#4f8cff', '#059669', '#10b981', '#d97706', '#7c3aed', '#db2777', '#0891b2'];
const TAG_CLASSES: Record<string, string> = { '科长': 'bg-blue-50 text-blue-600', '副科长': 'bg-blue-50 text-blue-600', '科员': 'bg-green-50 text-green-600', '技术员': 'bg-amber-50 text-amber-600' };

interface Props {
  data: Staff[];
  editing: boolean;
  onSave: (list: Staff[]) => void;
}

export default function StaffPage({ data, editing, onSave }: Props) {
  const [list, setList] = useState<Staff[]>([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Staff | null>(null);

  // 同步外部数据到本地列表
  useEffect(() => { setList([...data]); }, [data]);
  const filtered = list.filter((s) => !query || s.name.includes(query) || s.title.includes(query) || s.phone.includes(query) || s.department.includes(query));

  const openAdd = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (s: Staff) => { setEditItem(s); setShowModal(true); };

  const handleSave = (item: Staff) => {
    let next: Staff[];
    if (editItem) {
      next = list.map((s) => (s.id === item.id ? item : s));
    } else {
      next = [...list, item];
    }
    setList(next);
    onSave(next);
  };

  const handleDelete = (id: string) => {
    const next = list.filter((s) => s.id !== id);
    setList(next);
    onSave(next);
  };

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">人员管理</h2>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-gray-400">现代教育科在职人员及联系方式</p>
        {editing && (
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-[10px] text-xs font-semibold hover:bg-blue-700 shadow-[0_2px_6px_rgba(37,99,235,.25)] transition-all">+ 添加人员</button>
        )}
      </div>

      <div className="relative inline-block mb-5">
        <input className="w-full max-w-[360px] pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.08)] transition-all" placeholder="搜索姓名、职务或电话..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">🔍</span>
      </div>

      {/* 移动端 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {filtered.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-all relative group">
            {editing && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(s)} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">编辑</button>
                <button onClick={() => handleDelete(s.id)} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md">删除</button>
              </div>
            )}
            <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ background: COLORS[i % COLORS.length] }}>{s.name[0]}</div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-[15px] text-gray-900">{s.name}</span>
              <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ml-2 ${TAG_CLASSES[s.title] || 'bg-gray-50 text-gray-500'}`}>{s.title}</span>
              <div className="text-xs text-gray-400 mt-1">{s.department}</div>
            </div>
            <div className="flex flex-col gap-0.5 shrink-0 text-xs text-gray-400"><span>📞 {s.phone}</span><span>✉ {s.email}</span></div>
          </div>
        ))}
      </div>

      {/* 桌面端 */}
      <table className="hidden md:table w-full border-separate border-spacing-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <thead><tr>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">姓名</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">职务</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">电话</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">邮箱</th>
          <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">科室</th>
          {editing && <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100 w-[100px]">操作</th>}
        </tr></thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-[#fafcff]">
              <td className="px-[18px] py-3.5 text-sm font-semibold border-b border-gray-50">{s.name}</td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50"><span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${TAG_CLASSES[s.title] || 'bg-gray-50 text-gray-500'}`}>{s.title}</span></td>
              <td className="px-[18px] py-3.5 text-sm font-mono border-b border-gray-50">{s.phone}</td>
              <td className="px-[18px] py-3.5 text-sm text-gray-400 border-b border-gray-50">{s.email}</td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">{s.department}</td>
              {editing && <td className="px-[18px] py-3.5 text-sm border-b border-gray-50"><div className="flex gap-2"><button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline">编辑</button><button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline">删除</button></div></td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 编辑弹窗 */}
      {showModal && <EditModal item={editItem} onSave={handleSave} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ====== 编辑弹窗 ======
function EditModal({ item, onSave, onClose }: { item: Staff | null; onSave: (s: Staff) => void; onClose: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [title, setTitle] = useState(item?.title || '');
  const [phone, setPhone] = useState(item?.phone || '');
  const [email, setEmail] = useState(item?.email || '');
  const [dept, setDept] = useState(item?.department || '现代教育科');

  const save = () => {
    if (!name.trim() || !phone.trim()) return;
    onSave({ id: item?.id || Date.now().toString(36), name: name.trim(), title: title.trim() || '科员', phone: phone.trim(), email: email.trim(), department: dept.trim() || '现代教育科' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl mx-4 w-full max-w-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100"><div className="text-lg font-bold text-gray-900">{item ? '编辑人员' : '添加人员'}</div></div>
        <div className="p-5 space-y-3">
          {[
            { label:'姓名', val:name, set:setName, placeholder:'张建国' },
            { label:'职务', val:title, set:setTitle, placeholder:'科员' },
            { label:'电话', val:phone, set:setPhone, placeholder:'13901234567' },
            { label:'邮箱', val:email, set:setEmail, placeholder:'zhang@zmu.edu.cn' },
            { label:'科室', val:dept, set:setDept, placeholder:'现代教育科' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-gray-400 mb-1 font-medium">{f.label}</label>
              <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} className="w-full border-[1.5px] border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all" />
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 font-medium">取消</button>
          <button onClick={save} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">保存</button>
        </div>
      </div>
    </div>
  );
}
