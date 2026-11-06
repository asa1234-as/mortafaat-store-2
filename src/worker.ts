interface Env {
  MEDIA_BUCKET: R2Bucket;
  ASSETS: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov'
};

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const result = new Headers(headers);
  result.set('Content-Type', 'application/json; charset=utf-8');
  result.set('X-Content-Type-Options', 'nosniff');
  return new Response(JSON.stringify(data), { status, headers: result });
}

async function authorizeAdmin(request: Request, env: Env): Promise<{ id: string } | null> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const headers = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: authorization
  };
  const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers });
  if (!userResponse.ok) return null;
  const user = await userResponse.json() as { id?: string };
  if (!user.id) return null;

  const profileResponse = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
    { headers }
  );
  if (!profileResponse.ok) return null;
  const profiles = await profileResponse.json() as Array<{ role?: string }>;
  return profiles.some(profile => profile.role === 'admin' || profile.role === 'owner')
    ? { id: user.id }
    : null;
}

function mediaKeyIsValid(key: string): boolean {
  return /^(products|banners)\/[0-9a-f-]{36}\.(jpg|png|webp|gif|avif|mp4|webm|mov)$/i.test(key);
}

async function handleMedia(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/media/')) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, HEAD' });
    }
    const key = decodeURIComponent(url.pathname.slice('/media/'.length));
    if (!mediaKeyIsValid(key)) return json({ error: 'Invalid media key' }, 400);
    const object = await env.MEDIA_BUCKET.get(key);
    if (!object) return json({ error: 'Media not found' }, 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(request.method === 'HEAD' ? null : object.body, { headers });
  }

  if (url.pathname !== '/api/media') return json({ error: 'Not found' }, 404);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });

  const admin = await authorizeAdmin(request, env).catch(() => null);
  if (!admin) return json({ error: 'غير مصرح. يلزم تسجيل الدخول بحساب مدير المتجر.' }, 401);

  const folder = url.searchParams.get('folder') || 'product-images';
  const folderPrefixes: Record<string, string> = {
    'product-images': 'products',
    'product-videos': 'products',
    'banner-images': 'banners',
    'banner-videos': 'banners'
  };
  const prefix = folderPrefixes[folder];
  if (!prefix) return json({ error: 'مجلد الرفع غير مسموح.' }, 400);

  const contentType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  const extension = MIME_EXTENSIONS[contentType];
  if (!extension) return json({ error: 'نوع الملف غير مدعوم.' }, 415);

  const isVideo = contentType.startsWith('video/');
  const length = Number(request.headers.get('Content-Length'));
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!Number.isFinite(length) || length <= 0) return json({ error: 'تعذر تحديد حجم الملف.' }, 411);
  if (length > limit) return json({ error: isVideo ? 'الحد الأقصى للفيديو 50 ميجابايت.' : 'الحد الأقصى للصورة 15 ميجابايت.' }, 413);
  if (!request.body) return json({ error: 'الملف فارغ.' }, 400);

  const key = `${prefix}/${crypto.randomUUID()}.${extension}`;
  const stored = await env.MEDIA_BUCKET.put(key, request.body, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable'
    },
    customMetadata: { uploadedBy: admin.id }
  });

  return json({
    key: stored.key,
    size: stored.size,
    url: `${url.origin}/media/${key}`
  }, 201);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/media' || url.pathname.startsWith('/media/')) {
      return handleMedia(request, env).catch(() => json({ error: 'تعذر تنفيذ عملية التخزين.' }, 500));
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
