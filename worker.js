// 现代教育科教育管理系统 - Cloudflare Worker
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').trim();
const fmtDate = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.toISOString().slice(0, 10); };

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
    ],
  }),
  schedule: { title:'课程表', days:{ monday:[], tuesday:[], wednesday:[], thursday:[], friday:[] } },
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
    await kvPut(env, 'keys', data);
    await env.SCHEDULE_KV.put('key_fetch_status', `ok_${Date.now()}`);
    console.log(`[钥匙] 更新成功: ${keyList.length} 把, ${records.length} 条记录`);
    return true;
  } catch (e) {
    console.error('[钥匙] 抓取异常:', e.message);
    return false;
  }
}

// ====== 邮件发送（MailChannels） ======
async function sendEmail(env, to, subject, body) {
  const from = env.MAIL_FROM || 'noreply@xdjyk.online';
  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: '现代教育科' },
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    });
    if (res.ok) console.log(`[邮件] 已发送至 ${to}`);
    else console.error(`[邮件] 发送失败 ${res.status}:`, await res.text());
  } catch (e) {
    console.error('[邮件] 异常:', e.message);
  }
}

async function sendEventEmails(env, hallData, staffList) {
  const sent = new Set();
  for (const [date, events] of Object.entries(hallData || {})) {
    for (const evt of events) {
      if (evt.status !== 'occupied' || !evt.contactPerson) continue;
      const staff = staffList.find((s) => s.name === evt.contactPerson);
      if (!staff || !staff.email) continue;
      if (sent.has(staff.email + evt.id)) continue;
      sent.add(staff.email + evt.id);
      await sendEmail(env, staff.email,
        `【报告厅】活动安排通知 - ${evt.eventName}`,
        `活动名称：${evt.eventName}\n时间：${date} ${evt.timeSlot}\n地点：报告厅\n负责人：${evt.contactPerson} ${evt.contactPhone || ''}\n主办单位：${evt.organizer || '无'}\n\n此邮件由系统自动发送，请勿回复。`
      );
    }
  }
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
        const hallData = body.data !== undefined ? body.data : body;
        await kvPut(env, 'hall', hallData);
        // 发送邮件通知
        const staffList = await kvGet(env, 'staff', DEFAULTS.staff);
        sendEventEmails(env, hallData, staffList);
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
