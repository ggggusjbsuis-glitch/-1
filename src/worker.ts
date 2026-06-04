interface Env {
  SCHEDULE_KV: KVNamespace;
  ADMIN_PASSWORD: string;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/schedule') {
      if (request.method === 'GET') {
        const data = await env.SCHEDULE_KV.get('schedule', 'json');
        return Response.json(data ? { exists: true, schedule: data } : { exists: false, schedule: null });
      }

      if (request.method === 'PUT') {
        const body = (await request.json()) as { schedule: unknown; password: string };
        const adminPassword = env.ADMIN_PASSWORD || 'admin123';
        if (body.password !== adminPassword) {
          return Response.json({ error: '密码错误' }, { status: 403 });
        }
        await env.SCHEDULE_KV.put('schedule', JSON.stringify(body.schedule));
        return Response.json({ success: true });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
