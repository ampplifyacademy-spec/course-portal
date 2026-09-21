/**
 * Class video proxy.
 *
 * The browser never talks to Google Drive, so which Google account the student
 * happens to be signed into stops mattering. The Worker checks that the caller
 * is an approved student of our own portal, then streams the file out of Drive
 * with the course account's own credentials.
 *
 *   GET /v/<fileId>?token=<firebase id token>
 *
 * Range requests are passed straight through, so seeking in the player works.
 */

const DRIVE_FILE = 'https://www.googleapis.com/drive/v3/files/';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), env, origin);
    if (request.method !== 'GET' && request.method !== 'HEAD') return err(405, 'Method not allowed', env, origin);

    const match = url.pathname.match(/^\/v\/([\w-]{10,})$/);
    if (!match) return err(404, 'Not found', env, origin);
    const fileId = match[1];

    const idToken = url.searchParams.get('token') || bearer(request);
    if (!idToken) return err(401, 'No token', env, origin);

    const student = await approvedStudent(idToken, env);
    if (!student.ok) return err(403, student.error, env, origin);

    const upstream = await fetchFromDrive(fileId, request, env, ctx);
    if (!upstream) return err(404, 'File not in any course folder', env, origin);
    return cors(upstream, env, origin);
  }
};

function bearer(request) {
  const h = request.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

/**
 * Two checks: the token really is one of ours (Identity Toolkit verifies the
 * signature for us), and that account is approved in Firestore. The Firestore
 * read is made with the student's own token, so our existing rules apply.
 */
async function approvedStudent(idToken, env) {
  const lookup = await fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + env.FIREBASE_API_KEY,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: idToken }) }
  );
  if (!lookup.ok) return { ok: false, error: 'Sign in again' };
  const users = (await lookup.json()).users || [];
  if (!users.length) return { ok: false, error: 'Unknown account' };
  const uid = users[0].localId;

  const doc = await fetch(
    'https://firestore.googleapis.com/v1/projects/' + env.FIREBASE_PROJECT_ID +
      '/databases/(default)/documents/users/' + uid,
    { headers: { Authorization: 'Bearer ' + idToken } }
  );
  if (!doc.ok) return { ok: false, error: 'No student record' };
  const status = (((await doc.json()).fields || {}).status || {}).stringValue;
  if (status !== 'approved') return { ok: false, error: 'Account not approved yet' };
  return { ok: true, uid: uid };
}

/** Access tokens live an hour; keep them in module scope between requests. */
const tokenCache = new Map();

async function accessToken(refreshToken, env) {
  const cached = tokenCache.get(refreshToken);
  if (cached && cached.expires > Date.now() + 60000) return cached.value;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  if (!res.ok) throw new Error('Token refresh failed: ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  tokenCache.set(refreshToken, {
    value: data.access_token,
    expires: Date.now() + (data.expires_in || 3600) * 1000
  });
  return data.access_token;
}

function refreshTokens(env) {
  return [env.REFRESH_TOKEN_1, env.REFRESH_TOKEN_2, env.REFRESH_TOKEN_3].filter(Boolean);
}

/**
 * A file lives in exactly one of the course accounts, so the accounts are tried
 * in turn and the winner is remembered - after the first play, every later
 * request goes straight to the right account.
 */
async function fetchFromDrive(fileId, request, env, ctx) {
  const cache = caches.default;
  const ownerKey = new Request('https://owner.invalid/' + fileId);
  const known = await cache.match(ownerKey);
  const tokens = refreshTokens(env);
  const order = [];
  if (known) order.push(Number(await known.text()));
  tokens.forEach(function (_, i) { if (order.indexOf(i) === -1) order.push(i); });

  for (const i of order) {
    const token = await accessToken(tokens[i], env);
    const headers = { Authorization: 'Bearer ' + token };
    const range = request.headers.get('Range');
    if (range) headers.Range = range;

    const res = await fetch(DRIVE_FILE + fileId + '?alt=media&supportsAllDrives=true', {
      method: request.method,
      headers: headers
    });
    if (res.status === 404 || res.status === 403) continue;

    ctx.waitUntil(cache.put(ownerKey, new Response(String(i), {
      headers: { 'Cache-Control': 'max-age=86400' }
    })));

    const out = new Headers();
    ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']
      .forEach(function (h) { const v = res.headers.get(h); if (v) out.set(h, v); });
    if (!out.has('accept-ranges')) out.set('accept-ranges', 'bytes');
    // Private: a shared cache must not keep a student's video around.
    out.set('Cache-Control', 'private, max-age=600');
    out.set('Content-Disposition', 'inline');
    return new Response(res.body, { status: res.status, headers: out });
  }
  return null;
}

function cors(response, env, origin) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const headers = new Headers(response.headers);
  if (allowed.indexOf(origin) !== -1) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Headers', 'Range, Authorization');
    headers.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
  }
  return new Response(response.body, { status: response.status, headers: headers });
}

function err(status, message, env, origin) {
  return cors(new Response(JSON.stringify({ error: message }), {
    status: status, headers: { 'Content-Type': 'application/json' }
  }), env, origin);
}
