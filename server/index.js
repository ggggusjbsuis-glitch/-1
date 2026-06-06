const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ---- 工具 ----
function fmtDate(o) { const d = new Date(); d.setDate(d.getDate() + o); return d.toISOString().slice(0, 10); }
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').trim();

function loadJSON(filename, fallback) {
  const file = path.join(DATA_DIR, filename);
  try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch (e) { console.error(`读取 ${filename} 失败:`, e.message); }
  if (fallback !== undefined) { fs.writeFileSync(file, JSON.stringify(fallback, null, 2)); }
  return fallback;
}
function saveJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// ====== 默认数据 ======
const DEFAULTS = {
  staff: [
    { id:'1', name:'张建国', title:'科长', phone:'13901234567', email:'zhangjg@zmu.edu.cn', department:'现代教育科' },
    { id:'2', name:'李红梅', title:'副科长', phone:'13801234568', email:'lihm@zmu.edu.cn', department:'现代教育科' },
    { id:'3', name:'王磊', title:'科员', phone:'13701234569', email:'wanglei@zmu.edu.cn', department:'现代教育科' },
    { id:'4', name:'陈芳', title:'科员', phone:'13601234570', email:'chenfang@zmu.edu.cn', department:'现代教育科' },
    { id:'5', name:'刘波', title:'技术员', phone:'13501234571', email:'liubo@zmu.edu.cn', department:'现代教育科' },
  ],
  classrooms: [
    { id:'1', name:'综3104', type:'多媒体教室', capacity:60, status:'available', currentUser:'' },
    { id:'2', name:'综3105', type:'多媒体教室', capacity:60, status:'in_use', currentUser:'23级临床12班' },
    { id:'3', name:'综3106', type:'普通教室', capacity:80, status:'available', currentUser:'' },
    { id:'4', name:'综3107', type:'普通教室', capacity:80, status:'maintenance', currentUser:'' },
    { id:'5', name:'综3201', type:'实验室', capacity:40, status:'available', currentUser:'' },
    { id:'6', name:'综3202', type:'多媒体教室', capacity:60, status:'in_use', currentUser:'24级护理6班' },
    { id:'7', name:'综3203', type:'多媒体教室', capacity:60, status:'available', currentUser:'' },
    { id:'8', name:'报3101', type:'报告厅', capacity:200, status:'in_use', currentUser:'学术讲座' },
  ],
  hall: {
    [fmtDate(0)]: [
      { id:'a', date:fmtDate(0), timeSlot:'08:00-10:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'b', date:fmtDate(0), timeSlot:'10:00-12:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
      { id:'c', date:fmtDate(0), timeSlot:'14:00-16:00', eventName:'', organizer:'', contactPerson:'', contactPhone:'', status:'free' },
    ],
  },
  schedule: { title:'课程表', days:{ monday:[], tuesday:[], wednesday:[], thursday:[], friday:[] } },
};

let db = {
  staff: loadJSON('staff.json', DEFAULTS.staff),
  classrooms: loadJSON('classrooms.json', DEFAULTS.classrooms),
  hall: loadJSON('hall.json', DEFAULTS.hall),
  schedule: loadJSON('schedule.json', DEFAULTS.schedule),
  keys: null,
};

// ====== 钥匙抓取（内嵌） ======
async function fetchKeysFromRemote() {
  const configPath = path.join(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) { console.log('  [钥匙] 未配置 cookie，跳过'); return; }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (!config.cookie) { console.log('  [钥匙] cookie 为空，跳过'); return; }

  const BASE = 'https://key2020.qianmingyun.com';
  const headers = {
    Cookie: config.cookie,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: BASE + '/',
  };

  async function post(url, body) {
    const res = await fetch(url, { method: 'POST', headers, body: body.toString() });
    const text = await res.text();
    try { const j = JSON.parse(text); if (j.Code === 200) return j.Data || []; }
    catch {}
    console.log('  [钥匙] Cookie 可能已过期，返回非 JSON');
    return null;
  }

  try {
    // 1) 钥匙列表
    const kp = new URLSearchParams();
    kp.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Device.KeyVMs.KeyListVM, CoreKey.ViewModel');
    kp.append('_DONOT_USE_CS', 'default');
    kp.append('SearcherMode', '0');
    kp.append('Page', '1');
    kp.append('Limit', '200');
    const rawKeys = await post(BASE + '/Device/Key/Search', kp);
    if (!rawKeys) return;

    const keyList = rawKeys.map((k) => ({
      id: k.ID, name: k.Name, location: k.Box_view, department: k.Organize_view,
      status: stripHtml(k.Status), keyType: stripHtml(k.KeyType),
    }));

    // 2) 今日记录
    const today = fmtDate(0);
    const rp = new URLSearchParams();
    rp.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Logs.OpenLogVMs.OpenLogListVM, CoreKey.ViewModel');
    rp.append('_DONOT_USE_CS', 'default');
    rp.append('SearcherMode', '0');
    rp.append('Page', '1');
    rp.append('Limit', '500');
    rp.append('Searcher.StartTime', today + ' 00:00:00');
    rp.append('Searcher.EndTime', today + ' 23:59:59');
    const rawRecords = await post(BASE + '/Logs/OpenLog/Search', rp) || [];

    const records = rawRecords
      .filter((r) => (r.OpenDate || '').startsWith(today))
      .map((r) => ({ id: r.ID, userName: r.User_view, action: stripHtml(r.OpenType), keyName: r.Key_view, location: r.Box_view, time: r.OpenDate, remark: r.Remark }));

    db.keys = {
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

    saveJSON('keys.json', db.keys);
    console.log(`  [钥匙] 更新成功: ${keyList.length} 把, 今日 ${records.length} 条记录`);
  } catch (e) {
    console.error('  [钥匙] 抓取异常:', e.message);
  }
}

// ====== API 路由 ======
app.get('/api/staff', (_, res) => res.json(db.staff));
app.put('/api/staff', (req, res) => { db.staff = req.body; saveJSON('staff.json', db.staff); res.json({ ok: true }); });

app.get('/api/classrooms', (_, res) => res.json(db.classrooms));
app.put('/api/classrooms', (req, res) => { db.classrooms = req.body; saveJSON('classrooms.json', db.classrooms); res.json({ ok: true }); });

app.get('/api/keys', (_, res) => res.json(db.keys));

app.get('/api/hall', (_, res) => res.json(db.hall));
app.put('/api/hall', (req, res) => { db.hall = req.body; saveJSON('hall.json', db.hall); res.json({ ok: true }); });

app.get('/api/schedule', (_, res) => res.json(db.schedule));
app.put('/api/schedule', (req, res) => { db.schedule = req.body; saveJSON('schedule.json', db.schedule); res.json({ ok: true }); });

app.get('*', (_, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));

// ====== 启动 ======
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

const PORTS = [3000, 3001, 3002];

function tryListen(idx) {
  if (idx >= PORTS.length) { console.error('所有端口都被占用，请关闭其他程序后重试'); process.exit(1); }
  const PORT = PORTS[idx];
  const server = app.listen(PORT, async () => {
    const ip = getLocalIP();
    console.log(`\n========================================`);
    console.log(`  现代教育科教育管理系统`);
    console.log(`  本机: http://localhost:${PORT}`);
    console.log(`  手机: http://${ip}:${PORT}`);
    console.log(`========================================\n`);
    console.log('[启动] 抓取钥匙数据...');
    db.keys = loadJSON('keys.json', null);
    await fetchKeysFromRemote();
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8') || '{}');
    const interval = (config.fetchInterval || 5) * 60 * 1000;
    setInterval(() => { console.log('[定时] 刷新钥匙数据...'); fetchKeysFromRemote(); }, interval);
    console.log(`[定时] 每 ${config.fetchInterval || 5} 分钟自动刷新\n`);
  });
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') { console.log(`端口 ${PORT} 被占用，尝试 ${PORTS[idx+1]}...`); tryListen(idx + 1); }
    else throw e;
  });
}
tryListen(0);

