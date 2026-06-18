// 现代教育科教育管理系统 - Cloudflare Worker
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').trim();
const fmtDate = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

// ====== 默认数据 ======
const DEFAULTS = {
  staff: [
    { id:'mq1vfn5k', name:'刘龙', title:'现代教育科', phone:'18085920560', email:'', department:'现代教育科' },
    { id:'mq1vrp0w', name:'李璐', title:'现代教育科', phone:'18286692524', email:'', department:'现代教育科' },
    { id:'mq1vsjv4', name:'鲍明月', title:'现代教育科', phone:'18797022653', email:'', department:'现代教育科' },
    { id:'mq1vvsuh', name:'严浩城', title:'现代教育科', phone:'19387471283', email:'', department:'现代教育科' },
    { id:'mq1vz6xt', name:'刘宇涛', title:'现代教育科', phone:'18997169080', email:'', department:'现代教育科' },
    { id:'mq1w0809', name:'杨向东', title:'现代教育科', phone:'15818995826', email:'', department:'现代教育科' },
    { id:'mq1wlkn6', name:'杨云轩', title:'现代教育科', phone:'17385913590', email:'', department:'现代教育科' },
    { id:'mq1wma3e', name:'孟月源', title:'现代教育科', phone:'18308669655', email:'', department:'现代教育科' },
    { id:'mq1xnwvs', name:'黄银银', title:'现代教育科', phone:'18386011208', email:'', department:'现代教育科' },
    { id:'mq1xoj2u', name:'王灿', title:'现代教育科', phone:'15876631836', email:'', department:'现代教育科' },
    { id:'mq1xpnny', name:'刘时清钦', title:'现代教育科', phone:'19078797373', email:'', department:'现代教育科' },
    { id:'mq1xr712', name:'李庆国', title:'现代教育科 管理人', phone:'18666913905', email:'', department:'现代教育科' },
  ],
  hall: () => ({
    [fmtDate(0)]: [
      { id:'a', date:fmtDate(0), timeSlot:'08:00-10:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'b', date:fmtDate(0), timeSlot:'10:00-12:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'c', date:fmtDate(0), timeSlot:'14:00-16:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'d', date:fmtDate(0), timeSlot:'16:00-18:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'e', date:fmtDate(0), timeSlot:'18:00-21:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
    ],
  }),
  schedule: { title:'课程表', days:{ monday:[], tuesday:[], wednesday:[], thursday:[], friday:[] } },
  auditorium: () => ({
    [fmtDate(0)]: [
      { id:'a1', date:fmtDate(0), timeSlot:'08:00-10:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'b1', date:fmtDate(0), timeSlot:'10:00-12:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'c1', date:fmtDate(0), timeSlot:'14:00-16:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'d1', date:fmtDate(0), timeSlot:'16:00-18:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'e1', date:fmtDate(0), timeSlot:'18:00-21:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
    ],
  }),
};

// ====== KV 读写辅助 ======
async function kvGet(env, key, fallback) {
  const raw = await env.SCHEDULE_KV.get(key);
  if (raw !== null) { try { return JSON.parse(raw); } catch { return raw; } }
  if (typeof fallback === 'function') return fallback();
  return fallback;
}
async function kvPut(env, key, data) {
  await env.SCHEDULE_KV.put(key, JSON.stringify(data));
}

function checkPassword(env, body) {
  const pw = env.ADMIN_PASSWORD || 'admin123';
  return body && body.password === pw;
}

// ====== 钥匙抓取 ======
async function fetchKeysFromRemote(env) {
  // Cookie 优先从 KV 读取，否则从环境变量
  let cookie = await env.SCHEDULE_KV.get('key_system_cookie');
  if (!cookie) cookie = env.KEY_COOKIE;
  if (!cookie) { console.log('[钥匙] 未配置 Cookie'); return false; }

  const BASE = 'https://key2020.qianmingyun.com';
  const headers = {
    Cookie: cookie,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: BASE + '/',
  };

  async function post(url, body) {
    const res = await fetch(url, { method: 'POST', headers, body: body.toString() });
    const text = await res.text();
    try { const j = JSON.parse(text); if (j.Code === 200) return j.Data || []; } catch {}
    return null;
  }

  try {
    // 钥匙列表
    const kp = new URLSearchParams();
    kp.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Device.KeyVMs.KeyListVM, CoreKey.ViewModel');
    kp.append('_DONOT_USE_CS', 'default'); kp.append('SearcherMode', '0');
    kp.append('Page', '1'); kp.append('Limit', '200');
    const rawKeys = await post(BASE + '/Device/Key/Search', kp);
    if (!rawKeys) { await env.SCHEDULE_KV.put('key_fetch_status', 'cookie_expired'); return false; }

    const keyList = rawKeys.map((k) => ({
      id: k.ID, name: k.Name, location: k.Box_view, department: k.Organize_view,
      status: stripHtml(k.Status), keyType: stripHtml(k.KeyType),
    }));

    // 今日记录
    const today = fmtDate(0);
    const rp = new URLSearchParams();
    rp.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Logs.OpenLogVMs.OpenLogListVM, CoreKey.ViewModel');
    rp.append('_DONOT_USE_CS', 'default'); rp.append('SearcherMode', '0');
    rp.append('Page', '1'); rp.append('Limit', '500');
    rp.append('Searcher.StartTime', today + ' 00:00:00');
    rp.append('Searcher.EndTime', today + ' 23:59:59');
    const rawRecords = await post(BASE + '/Logs/OpenLog/Search', rp);
    const records = (rawRecords || []).filter((r) => (r.OpenDate || '').startsWith(today)).map((r) => ({
      id: r.ID, userName: r.User_view, action: stripHtml(r.OpenType),
      keyName: r.Key_view, location: r.Box_view, time: r.OpenDate, remark: r.Remark,
    }));

    const data = {
      fetchedAt: new Date().toISOString(),
      keys: {
        total: keyList.length,
        putIn: keyList.filter((k) => k.status === '存入').length,
        takeOut: keyList.filter((k) => k.status === '取出').length,
        error: keyList.filter((k) => k.status === '归还错误').length,
        list: keyList,
      },
      todayRecords: records,
    };
    // 对比上次数据，无变化则跳过写入（节省 KV 写入次数）
    const oldKeys = await env.SCHEDULE_KV.get('keys', 'json');
    const oldHash = oldKeys ? JSON.stringify(oldKeys.keys).length + '_' + (oldKeys.todayRecords || []).length : '';
    const newHash = JSON.stringify(data.keys).length + '_' + (data.todayRecords || []).length;
    if (oldHash !== newHash) {
      await kvPut(env, 'keys', data);
      console.log(`[钥匙] 更新成功: ${keyList.length} 把, ${records.length} 条记录`);
    }
    await env.SCHEDULE_KV.put('key_fetch_status', `ok_${Date.now()}`);

    // 追加日志：对比之前见过的记录，新记录写入日志
    const seenIds = JSON.parse(await env.SCHEDULE_KV.get('seen_record_ids') || '[]');
    const newLogs = [];
    for (const r of records) {
      if (!seenIds.includes(r.id)) {
        newLogs.push({
          id: r.id,
          time: r.time,
          keyName: r.keyName,
          userName: r.userName,
          action: r.action === '取出' ? 'borrow' : 'return',
          location: r.location,
          remark: r.remark,
        });
        seenIds.push(r.id);
      }
    }
    if (newLogs.length > 0) {
      const existingLogs = JSON.parse(await env.SCHEDULE_KV.get('key_logs') || '[]');
      const allLogs = [...newLogs, ...existingLogs].slice(0, 500); // 保留最新 500 条
      await env.SCHEDULE_KV.put('key_logs', JSON.stringify(allLogs));
      await env.SCHEDULE_KV.put('seen_record_ids', JSON.stringify(seenIds.slice(-500)));
      console.log(`[日志] 新增 ${newLogs.length} 条，共 ${allLogs.length} 条`);
    }

    // 同步刷新用户列表
    await fetchUsers(env);
    return true;
  } catch (e) {
    console.error('[钥匙] 抓取异常:', e.message);
    return false;
  }
}

// ====== 邮件发送（Resend） ======
async function sendEmail(env, to, subject, body) {
  console.log(`[邮件发送] To:${to} 主题:${subject} 正文时间:${body.match(/时间：(.+)/)?.[1] || '?'}`);
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) { console.error('[邮件] 未配置 RESEND_API_KEY'); return; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '现代教育科 <noreply@xdjyk.online>',
        to: [to],
        subject,
        text: body,
      }),
    });
    if (res.ok) console.log(`[邮件] 已发送至 ${to}`);
    else console.error(`[邮件] 发送失败 ${res.status}:`, await res.text());
  } catch (e) {
    console.error('[邮件] 异常:', e.message);
  }
}

async function sendEventEmails(env, hallData, staffList, location) {
  location = location || '报告厅';
  console.log('[邮件] 开始检查活动，共', Object.keys(hallData || {}).length, '个日期');
  let changed = false;
  const sent = new Set();
  for (const [date, events] of Object.entries(hallData || {})) {
    for (const evt of events) {
      if (evt.status !== 'occupied' || !evt.contactPerson) continue;
      if (evt._notified) continue;
      const names = evt.contactPerson.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
      for (const name of names) {
        const staff = staffList.find((s) => s.name === name);
        console.log('[邮件]', date, evt.eventName, '→', name, '→', staff ? `email=${staff.email || '(空)'}` : '人员未找到');
        if (!staff || !staff.email) continue;
        if (sent.has(staff.email + evt.id)) continue;
        sent.add(staff.email + evt.id);
        console.log('[邮件调试] 发送:', date, evt.timeSlot, '->', staff.email);
        await sendEmail(env, staff.email,
          `【${location}】活动安排通知 - ${evt.eventName}`,
          `活动名称：${evt.eventName}\n时间：${date} ${evt.timeSlot}\n地点：${location}\n负责人：${evt.contactPerson} ${evt.contactPhone || ''}\n主办单位：${evt.organizer || '无'}\n\n此邮件由系统自动发送，请勿回复。`
        );
        await new Promise((r) => setTimeout(r, 600));
      }
      evt._notified = true;
      changed = true;
    }
  }
  console.log('[邮件] 完成，发送', sent.size, '封');
  if (changed) await kvPut(env, location === '大礼堂' ? 'auditorium' : 'hall', hallData);
}

// ====== 用户列表抓取 ======
async function fetchUsers(env) {
  let cookie = await env.SCHEDULE_KV.get('key_system_cookie');
  if (!cookie) cookie = env.KEY_COOKIE;
  if (!cookie) return;
  try {
    const params = new URLSearchParams();
    params.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Users.FrameworkUserVMs.FrameworkUserListVM, CoreKey.ViewModel');
    params.append('_DONOT_USE_CS', 'default');
    params.append('SearcherMode', '0');
    params.append('Page', '1');
    params.append('Limit', '5000');
    const res = await fetch('https://key2020.qianmingyun.com/Users/FrameworkUser/Search', {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: 'https://key2020.qianmingyun.com/',
      },
      body: params.toString(),
    });
    const text = await res.text();
    const json = JSON.parse(text);
    if (json.Code === 200 && json.Data) {
      const map = {};
      for (const u of json.Data) {
        const name = (u.Name || '').trim();
        const phone = (u.CellPhone || '').trim();
        if (name && phone) map[name] = phone;
      }
      await env.SCHEDULE_KV.put('user_phones', JSON.stringify(map));
      console.log(`[用户] 更新成功: ${Object.keys(map).length} 人`);
    }
  } catch (e) { console.error('[用户] 抓取异常:', e.message); }
}

// ====== 主 Worker ======
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ====== API 路由 ======

    // 人员
    if (path === '/api/staff') {
      if (method === 'GET') {
        const data = await kvGet(env, 'staff', DEFAULTS.staff);
        return Response.json(data);
      }
      if (method === 'PUT') {
        const body = await request.json();
        if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
        const staffData = body.data !== undefined ? body.data : body;
        await kvPut(env, 'staff', staffData);
        return Response.json({ ok: true });
      }
    }

    // 教室 → 合并到钥匙数据
    // 钥匙
    if (path === '/api/keys') {
      if (method === 'GET') {
        const data = await kvGet(env, 'keys', null);
        return Response.json(data);
      }
    }

    // 报告厅
    if (path === '/api/hall') {
      if (method === 'GET') {
        const data = await kvGet(env, 'hall', DEFAULTS.hall);
        return Response.json(data);
      }
      if (method === 'PUT') {
        const body = await request.json();
        if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
        const rawHallData = body.data !== undefined ? body.data : body;
        // 从已保存数据恢复 _notified 标记（前端不会带这个标记）
        const savedHall = await kvGet(env, 'hall', null);
        const notifMap = {};
        if (savedHall) {
          for (const [d, evts] of Object.entries(savedHall)) {
            for (const e of evts) { if (e._notified) notifMap[e.id] = true; }
          }
        }
        // 合并：前端数据 + 已保存的 _notified 标记
        const hallData = {};
        for (const [d, evts] of Object.entries(rawHallData || {})) {
          hallData[d] = evts.map((e) => ({ ...e, _notified: notifMap[e.id] || false }));
        }
        await kvPut(env, 'hall', hallData);
        const staffList = await kvGet(env, 'staff', DEFAULTS.staff);
        await sendEventEmails(env, hallData, staffList, '报告厅');
        return Response.json({ ok: true });
      }
    }

    // 人员2
    if (path === '/api/staff2') {
      if (method === 'GET') {
        const data = await kvGet(env, 'staff2', DEFAULTS.staff);
        return Response.json(data);
      }
      if (method === 'PUT') {
        const body = await request.json();
        if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
        const sd = body.data !== undefined ? body.data : body;
        await kvPut(env, 'staff2', sd);
        return Response.json({ ok: true });
      }
    }

    // 大礼堂
    if (path === '/api/auditorium') {
      if (method === 'GET') {
        const data = await kvGet(env, 'auditorium', DEFAULTS.auditorium);
        return Response.json(data);
      }
      if (method === 'PUT') {
        const body = await request.json();
        if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
        const audData = body.data !== undefined ? body.data : body;
        await kvPut(env, 'auditorium', audData);
        const staffList = await kvGet(env, 'staff2', DEFAULTS.staff);
        await sendEventEmails(env, audData, staffList, '大礼堂');
        return Response.json({ ok: true });
      }
    }

    // 课程表
    if (path === '/api/schedule') {
      if (method === 'GET') return Response.json({ exists: true, schedule: await kvGet(env, 'schedule', DEFAULTS.schedule) });
      if (method === 'PUT') {
        const body = await request.json();
        if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
        await kvPut(env, 'schedule', body.schedule || body);
        return Response.json({ ok: true });
      }
    }

    // Cookie 管理
    if (path === '/api/config') {
      if (method === 'GET') {
        const status = await env.SCHEDULE_KV.get('key_fetch_status') || 'unknown';
        const hasCookie = !!(await env.SCHEDULE_KV.get('key_system_cookie') || env.KEY_COOKIE);
        return Response.json({ cookieConfigured: hasCookie, fetchStatus: status });
      }
      if (method === 'PUT') {
        const body = await request.json();
        if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
        if (!body.cookie) return Response.json({ error: 'Cookie 不能为空' }, { status: 400 });
        await env.SCHEDULE_KV.put('key_system_cookie', body.cookie.trim());
        // 立即用新 Cookie 抓取一次
        const ok = await fetchKeysFromRemote(env);
        return Response.json({ ok, message: ok ? 'Cookie 已更新，抓取成功' : 'Cookie 已保存，但抓取失败（可能过期）' });
      }
    }

    // 用户电话簿
    if (path === '/api/users') {
      let raw = await env.SCHEDULE_KV.get('user_phones');
      if (!raw) { await fetchUsers(env); raw = await env.SCHEDULE_KV.get('user_phones'); }
      return Response.json(raw ? JSON.parse(raw) : {});
    }

    // 日志
    if (path === '/api/logs') {
      const raw = await env.SCHEDULE_KV.get('key_logs');
      const logs = raw ? JSON.parse(raw) : [];
      const limit = parseInt(url.searchParams.get('limit') || '100');
      return Response.json(logs.slice(0, limit));
    }

    // 数据看板统计
    if (path === '/api/stats') {
      const keyData = await kvGet(env, 'keys', null);
      const records = (keyData && keyData.todayRecords) || [];
      const auditoriumData = await kvGet(env, 'auditorium', null);
      const hallData = await kvGet(env, 'hall', null);
      const today = fmtDate(0);

      // 通用配对函数
      function pairRecords(recs) {
        const sorted = [...recs].sort((a, b) => a.time.localeCompare(b.time));
        function classify(r) { if (r.action === 'borrow' || r.action === '取出') return 'borrow'; if (r.action === 'return' || r.action === '归还') return 'return'; return null; }
        function day(r) { return r.time.slice(0, 10); }

        // 按日期分组，跨天不配对（钥匙应在当天归还）
        const pairs = [];
        const byDay = {};
        for (const r of sorted) {
          const d = day(r);
          if (!byDay[d]) byDay[d] = [];
          byDay[d].push(r);
        }
        for (const [date, dayRecs] of Object.entries(byDay)) {
          // 第一轮：同人配对
          const userStacks = {};
          const leftovers = [];
          for (const r of dayRecs) {
            const act = classify(r);
            if (!act) continue;
            const uk = `${r.keyName}_${r.userName}`;
            if (!userStacks[uk]) userStacks[uk] = [];
            if (act === 'borrow') { userStacks[uk].push(r); }
            else if (act === 'return' && userStacks[uk].length > 0) {
              const b = userStacks[uk].shift();
              pairs.push({ keyName: r.keyName, borrowTime: b.time, returnTime: r.time, duration: Math.round((new Date(r.time)-new Date(b.time))/60000), borrower: r.userName, date });
            } else { leftovers.push(r); }
          }
          // 第二轮：同一天内同钥匙 FIFO
          const keyStacks = {};
          for (const r of leftovers) {
            const act = classify(r);
            if (!keyStacks[r.keyName]) keyStacks[r.keyName] = [];
            if (act === 'borrow') { keyStacks[r.keyName].push(r); }
            else if (act === 'return' && keyStacks[r.keyName].length > 0) {
              const b = keyStacks[r.keyName].shift();
              pairs.push({ keyName: r.keyName, borrowTime: b.time, returnTime: r.time, duration: Math.round((new Date(r.time)-new Date(b.time))/60000), borrower: b.userName, date });
            }
          }
        }
        return pairs;
      }

      // 今天的 Gantt 数据（所有钥匙）
      const todayPairs = pairRecords(records);
      const ganttMap = {};
      for (const p of todayPairs) {
        if (!ganttMap[p.keyName]) ganttMap[p.keyName] = [];
        ganttMap[p.keyName].push({ borrowTime: p.borrowTime, returnTime: p.returnTime, duration: p.duration, borrower: p.borrower });
      }
      const ganttKeys = Object.entries(ganttMap).map(([keyName, sessions]) => ({ keyName, sessions }));

      // 匹配 3101 活动
      for (const gk of ganttKeys) {
        if (gk.keyName !== '报3101') continue;
        for (const s of gk.sessions) {
          const d = s.borrowTime.slice(0, 10);
          const h = parseInt(s.borrowTime.slice(11, 13));
          const dayHall = (hallData && hallData[d]) || [];
          const match = dayHall.filter((e) => e.status === 'occupied').find((e) => {
            const [sh] = e.timeSlot.split('-').map((t) => parseInt(t.split(':')[0]));
            return Math.abs(h - sh) <= 2;
          });
          if (match) { s.eventName = match.eventName; s.organizer = match.organizer; }
        }
      }

      // 钥匙时长排行
      const durMap = {};
      for (const p of todayPairs) {
        durMap[p.keyName] = (durMap[p.keyName] || 0) + p.duration;
      }
      const keyDurations = Object.entries(durMap).map(([keyName, totalDuration]) => ({ keyName, totalDuration })).sort((a, b) => b.totalDuration - a.totalDuration);

      // 本周 3101 数据
      const now = new Date();
      const dow = now.getDay();
      const monday = new Date(now); monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1)); monday.setHours(0,0,0,0);
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
      const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
      const sundayStr = `${sunday.getFullYear()}-${String(sunday.getMonth()+1).padStart(2,'0')}-${String(sunday.getDate()).padStart(2,'0')}`;

      const logsRaw = await env.SCHEDULE_KV.get('key_logs');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      const weekLogs = logs.filter((l) => l.keyName === '报3101' && l.time >= mondayStr + ' 00:00:00' && l.time <= sundayStr + ' 23:59:59');
      const weekPairs = pairRecords(weekLogs);

      // 按日期分组
      const weekly3101 = [];
      const dateSet = [...new Set(weekPairs.map((p) => p.date))].sort();
      for (const d of dateSet) {
        const dayPairs = weekPairs.filter((p) => p.date === d);
        // 匹配活动
        for (const p of dayPairs) {
          const h = parseInt(p.borrowTime.slice(11, 13));
          const dayHall = (hallData && hallData[d]) || [];
          const match = dayHall.filter((e) => e.status === 'occupied').find((e) => {
            const [sh] = e.timeSlot.split('-').map((t) => parseInt(t.split(':')[0]));
            return Math.abs(h - sh) <= 2;
          });
          if (match) { p.eventName = match.eventName; p.organizer = match.organizer; }
        }
        weekly3101.push({ date: d, pairs: dayPairs, totalDuration: dayPairs.reduce((s, p) => s + p.duration, 0) });
      }

      return Response.json({ ganttKeys, weekly3101, keyDurations });
    }

    // 手动触发抓取
    if (path === '/api/fetch-keys') {
      const body = method === 'POST' ? await request.json().catch(() => ({})) : {};
      if (!checkPassword(env, body)) return Response.json({ error: '密码错误' }, { status: 403 });
      const ok = await fetchKeysFromRemote(env);
      return Response.json({ ok, message: ok ? '抓取成功' : '抓取失败' });
    }

    // 静态资源 → 走 Assets
    return env.ASSETS.fetch(request);
  },

  // 定时任务：每 5 分钟抓取钥匙
  async scheduled(event, env) {
    console.log('[定时] 刷新钥匙数据...');
    await fetchKeysFromRemote(env);
  },
};
