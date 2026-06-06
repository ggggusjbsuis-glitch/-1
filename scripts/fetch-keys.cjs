// 抓取钥匙管理系统数据，存到本地 JSON 文件
// 用法：node scripts/fetch-keys.cjs "你的Cookie值"

const fs = require('fs');
const path = require('path');

const COOKIE = process.env.KEY_SYSTEM_COOKIE || process.argv[2];
if (!COOKIE) {
  console.error('请设置 KEY_SYSTEM_COOKIE 环境变量，或作为参数传入：');
  console.error('  node scripts/fetch-keys.cjs "你的Cookie值"');
  process.exit(1);
}

const BASE = 'https://key2020.qianmingyun.com';
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').trim();

async function fetchPost(url, bodyParams) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Cookie: COOKIE,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `${BASE}/`,
    },
    body: bodyParams.toString(),
  });

  const rawText = await res.text();
  try {
    const json = JSON.parse(rawText);
    if (json.Code === 401 || json.Code === 302) {
      console.error('Cookie 已过期，请重新登录并更新 KEY_SYSTEM_COOKIE');
      process.exit(1);
    }
    if (json.Code && json.Code !== 200) {
      console.error('请求失败:', json.Msg || JSON.stringify(json));
      process.exit(1);
    }
    return json.Data || [];
  } catch {
    console.error('服务器返回的不是 JSON（可能 Cookie 过期）：');
    console.error(rawText.slice(0, 500));
    process.exit(1);
  }
}

async function fetchKeys() {
  const params = new URLSearchParams();
  params.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Device.KeyVMs.KeyListVM, CoreKey.ViewModel');
  params.append('_DONOT_USE_CS', 'default');
  params.append('SearcherMode', '0');
  params.append('Page', '1');
  params.append('Limit', '200');

  const keys = await fetchPost(`${BASE}/Device/Key/Search`, params);
  return keys.map((k) => ({
    id: k.ID,
    name: k.Name,
    location: k.Box_view,
    department: k.Organize_view,
    status: stripHtml(k.Status),
    keyType: stripHtml(k.KeyType),
    typeName1: k.TypeName1,
    typeName2: k.TypeName2,
  }));
}

async function fetchTodayRecords() {
  const today = new Date().toISOString().slice(0, 10); // "2026-06-05"

  const params = new URLSearchParams();
  params.append('_DONOT_USE_VMNAME', 'CoreKey.ViewModel.Logs.OpenLogVMs.OpenLogListVM, CoreKey.ViewModel');
  params.append('_DONOT_USE_CS', 'default');
  params.append('SearcherMode', '0');
  params.append('Page', '1');
  params.append('Limit', '500');
  // 搜索条件：今天
  params.append('Searcher.LogType', '0');
  params.append('Searcher.StartTime', today + ' 00:00:00');
  params.append('Searcher.EndTime', today + ' 23:59:59');

  const records = await fetchPost(`${BASE}/Logs/OpenLog/Search`, params);

  return records.map((r) => ({
    id: r.ID,
    userName: r.User_view,
    action: stripHtml(r.OpenType),
    keyName: r.Key_view,
    location: r.Box_view,
    time: r.OpenDate,
    remark: r.Remark,
    checkType: r.CheckType,
  }));
}

async function main() {
  console.log('正在抓取钥匙列表...');
  const keys = await fetchKeys();
  console.log(`获取到 ${keys.length} 把钥匙`);

  console.log('正在抓取今天的使用记录...');
  const records = await fetchTodayRecords();
  console.log(`获取到 ${records.length} 条记录`);

  // 统计
  const stats = {
    total: keys.length,
    putIn: keys.filter((k) => k.status === '存入').length,
    takeOut: keys.filter((k) => k.status === '取出').length,
    error: keys.filter((k) => k.status === '归还错误').length,
  };

  // 今日记录统计
  const todayStats = {
    total: records.length,
    borrow: records.filter((r) => r.action === '取出').length,
    return_: records.filter((r) => r.action === '归还').length,
    today: new Date().toISOString().slice(0, 10),
  };

  const output = {
    stats: { ...stats, fetchedAt: new Date().toISOString() },
    keys,
    todayStats,
    todayRecords: records,
  };

  const outDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, 'keys-data.json'),
    JSON.stringify(output, null, 2)
  );

  console.log('\n=== 钥匙统计 ===');
  console.log(JSON.stringify(stats, null, 2));
  console.log('\n=== 今日记录统计 ===');
  console.log(JSON.stringify(todayStats, null, 2));
  console.log('\n今日记录详情:');
  records.forEach((r) => {
    console.log(`  ${r.action === '取出' ? '🔴' : '🟢'} ${r.time} | ${r.userName} | ${r.action} | ${r.keyName}`);
  });
  console.log('\n已保存到 public/keys-data.json');
}

main().catch((e) => {
  console.error('抓取失败:', e.message);
  process.exit(1);
});
