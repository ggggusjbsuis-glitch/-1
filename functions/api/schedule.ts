interface Env {
  SCHEDULE_KV: KVNamespace;
  ADMIN_PASSWORD: string;
}

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const data = await env.SCHEDULE_KV.get('schedule', 'json');
  if (data) {
    return Response.json({ exists: true, schedule: data });
  }
  return Response.json({ exists: false, schedule: null });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const body = (await request.json()) as { schedule: unknown; password: string };
  const adminPassword = env.ADMIN_PASSWORD || 'admin123';

  if (body.password !== adminPassword) {
    return Response.json({ error: '密码错误' }, { status: 403 });
  }

  await env.SCHEDULE_KV.put('schedule', JSON.stringify(body.schedule));
  return Response.json({ success: true });
}
