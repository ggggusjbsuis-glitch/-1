import type { KeyData } from '../types';

interface DerivedClassroom {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in_use';
  currentUser: string;
  location: string;
}

interface Props {
  keyData: KeyData | null;
}

function deriveClassrooms(kd: KeyData | null): DerivedClassroom[] {
  if (!kd) return [];

  // 从钥匙名推断教室类型
  function getType(name: string): string {
    if (name.startsWith('报')) return '报告厅';
    if (name.startsWith('综3') || name.startsWith('综4') || name.startsWith('综5') || name.startsWith('综6')) return '综合楼教室';
    return '其他';
  }

  // 建立"钥匙名 → 最近借出人"的映射（从所有记录中找，不限于取出动作）
  const lastAction: Record<string, { user: string; action: string; time: string }> = {};
  for (const r of kd.todayRecords) {
    const key = (r.keyName || '').trim();
    if (!key) continue;
    if (!lastAction[key] || r.time > lastAction[key].time) {
      lastAction[key] = { user: r.userName, action: r.action, time: r.time };
    }
  }

  function findBorrower(keyName: string): string {
    const clean = (keyName || '').trim();
    // 精确匹配
    if (lastAction[clean]) {
      const la = lastAction[clean];
      if (la.action === '取出') return la.user;
      // 最近是归还，说明钥匙已还在系统里，但系统显示取出 → 显示最近使用人
      return `${la.user}(已归还)`;
    }
    // 模糊匹配（去空格、去连字符等）
    for (const [k, v] of Object.entries(lastAction)) {
      if (k.replace(/\s/g, '') === clean.replace(/\s/g, '')) {
        return v.action === '取出' ? v.user : `${v.user}(已归还)`;
      }
    }
    return '已借出';
  }

  // 过滤掉位置为"未存入"的无效钥匙
  const validKeys = kd.keys.list.filter((k) => k.location !== '未存入');

  // 合并同名钥匙（同一教室可能有多个钥匙）
  const roomMap = new Map<string, { keys: typeof validKeys; borrowers: Set<string> }>();
  for (const k of validKeys) {
    const name = (k.name || '').trim();
    if (!roomMap.has(name)) roomMap.set(name, { keys: [], borrowers: new Set() });
    const entry = roomMap.get(name)!;
    entry.keys.push(k);
    if (k.status === '取出') {
      const b = findBorrower(name);
      if (b && b !== '已借出') entry.borrowers.add(b);
    }
  }

  return Array.from(roomMap.entries()).map(([name, entry]) => {
    const anyOut = entry.keys.some((k) => k.status === '取出');
    // 位置取第一个非"未存入"的
    const mainKey = entry.keys[0];
    return {
      id: entry.keys[0].id,
      name,
      type: getType(name),
      status: anyOut ? 'in_use' as const : 'available' as const,
      currentUser: anyOut ? (Array.from(entry.borrowers).join('、') || '已借出') : '',
      location: mainKey.location + (entry.keys.length > 1 ? ` (${entry.keys.length}把钥匙)` : ''),
    };
  });
}

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-50 text-green-600',
  in_use: 'bg-red-50 text-red-600',
};

export default function ClassroomPage({ keyData }: Props) {
  const classrooms = deriveClassrooms(keyData);

  if (classrooms.length === 0) {
    return (
      <>
        <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">教室管理</h2>
        <p className="text-[13px] text-gray-400 mb-6">教室使用状态实时查看</p>
        <div className="text-gray-300 text-center py-20">等待钥匙数据...</div>
      </>
    );
  }

  const available = classrooms.filter((c) => c.status === 'available').length;
  const inUse = classrooms.filter((c) => c.status === 'in_use').length;

  return (
    <>
      <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-[-.3px]">教室管理</h2>
      <p className="text-[13px] text-gray-400 mb-6">
        共 {classrooms.length} 间 · 空闲 {available} · 使用中 {inUse}
      </p>

      {/* 移动端 */}
      <div className="md:hidden space-y-2">
        {classrooms.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl px-[18px] py-3.5 flex items-center gap-3.5 shadow-sm border border-gray-100">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.status === 'available' ? 'bg-green-500 shadow-[0_0_0_3px_rgba(16,185,129,.2)] opacity-25' : 'bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,.2)] opacity-25'}`} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">{c.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {c.type} · {c.location}
                {c.currentUser && <span className="text-red-500 ml-1">· {c.currentUser}</span>}
              </div>
            </div>
            <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-semibold shrink-0 ${STATUS_BADGE[c.status]}`}>
              {c.status === 'available' ? '空闲' : '使用中'}
            </span>
          </div>
        ))}
      </div>

      {/* 桌面端 */}
      <table className="hidden md:table w-full border-separate border-spacing-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <thead>
          <tr>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">教室</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">类型</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">状态</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">当前使用者</th>
            <th className="bg-[#fafbfc] px-[18px] py-3.5 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-[.5px] border-b border-gray-100">钥匙位置</th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((c) => (
            <tr key={c.id} className="hover:bg-[#fafcff]">
              <td className="px-[18px] py-3.5 text-sm font-semibold border-b border-gray-50">{c.name}</td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">{c.type}</td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">
                <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-semibold ${STATUS_BADGE[c.status]}`}>
                  {c.status === 'available' ? '空闲' : '使用中'}
                </span>
              </td>
              <td className="px-[18px] py-3.5 text-sm border-b border-gray-50">
                {c.currentUser ? (
                  <span className="text-red-600">{c.currentUser}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-[18px] py-3.5 text-xs text-gray-400 border-b border-gray-50">{c.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
