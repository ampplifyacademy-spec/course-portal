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
const DRIVE_LIST = 'https://www.googleapis.com/drive/v3/files';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), env, origin);
    if (request.method !== 'GET' && request.method !== 'HEAD') return err(405, 'Method not allowed', env, origin);

    const video = url.pathname.match(/^\/v\/([\w-]{10,})$/);
    const listing = url.pathname.match(/^\/classes\/([\w-]{10,})$/);
    if (!video && !listing) return err(404, 'Not found', env, origin);

    const idToken = url.searchParams.get('token') || bearer(request);
    if (!idToken) return err(401, 'No token', env, origin);

    const student = await approvedStudent(idToken, env);
    if (!student.ok) return err(403, student.error, env, origin);

    // The folder itself is the class list: whatever is uploaded shows up, with
    // no link to paste into the admin panel.
    if (listing) {
      const classes = await listFolder(listing[1], env);
      return cors(new Response(JSON.stringify({ classes: classes }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, max-age=60' }
      }), env, origin);
    }

    const upstream = await fetchFromDrive(video[1], request, env);
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

/**
 * One service account is a viewer on all three course folders, so there is a
 * single identity to authenticate as - no refresh tokens that expire, and no
 * consent screen for anybody to keep alive.
 */
let cachedToken = null;

async function accessToken(env) {
  if (cachedToken && cachedToken.expires > Date.now() + 60000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: env.SA_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  };
  const unsigned = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64url(JSON.stringify(claim));
  const key = await importKey(env.SA_PRIVATE_KEY);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = unsigned + '.' + b64url(signature);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  if (!res.ok) throw new Error('Token request failed: ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  cachedToken = { value: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

function b64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  bytes.forEach(function (b) { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * The secret is pasted by hand out of the key file, so it can arrive with
 * escaped newlines, surrounding quotes or a trailing comma. Everything outside
 * the BEGIN/END block is dropped, then anything that is not base64.
 */
async function importKey(pem) {
  const raw = String(pem || '').replace(/\\n/g, '\n');
  const block = raw.match(/-----BEGIN[^-]*-----([\s\S]*?)-----END/);
  const body = (block ? block[1] : raw).replace(/[^A-Za-z0-9+/=]/g, '');
  if (!body) throw new Error('SA_PRIVATE_KEY is empty or not a PEM key');
  const der = Uint8Array.from(atob(body), function (c) { return c.charCodeAt(0); });
  return crypto.subtle.importKey('pkcs8', der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}

/**
 * Every video in a batch folder, and in any sub-folder of it, newest naming
 * order first. The file name is the class title, so uploading a file is the
 * whole job of publishing a class.
 */
async function listFolder(folderId, env, depth) {
  const token = await accessToken(env);
  const out = [];
  let pageToken = '';
  do {
    const q = encodeURIComponent("'" + folderId + "' in parents and trashed = false");
    const res = await fetch(DRIVE_LIST + '?q=' + q + '&pageSize=200&orderBy=name' +
      '&fields=nextPageToken,files(id,name,mimeType,size,createdTime)' +
      (pageToken ? '&pageToken=' + pageToken : ''),
      { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) break;
    const data = await res.json();
    for (const f of data.files || []) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        // One level of sub-folders is enough for how the batches are arranged.
        if ((depth || 0) < 2) {
          const inner = await listFolder(f.id, env, (depth || 0) + 1);
          inner.forEach(function (c) { out.push(Object.assign({ module: f.name }, c)); });
        }
        continue;
      }
      if (!f.mimeType.startsWith('video/')) continue;
      out.push({
        id: f.id,
        title: cleanTitle(f.name),
        sizeMB: f.size ? Math.round(Number(f.size) / 1048576) : null,
        uploadedAt: f.createdTime
      });
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return out;
}

/** "  Class 07 Products Research .mp4 " reads better as "Class 07 Products Research". */
function cleanTitle(name) {
  return String(name).replace(/\.[a-z0-9]{2,4}$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchFromDrive(fileId, request, env) {
  const token = await accessToken(env);
  const headers = { Authorization: 'Bearer ' + token };
  const range = request.headers.get('Range');
  if (range) headers.Range = range;

  const res = await fetch(DRIVE_FILE + fileId + '?alt=media&supportsAllDrives=true', {
    method: request.method,
    headers: headers
  });
  if (res.status === 404 || res.status === 403) return null;

  const out = new Headers();
  ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']
    .forEach(function (h) { const v = res.headers.get(h); if (v) out.set(h, v); });
  if (!out.has('accept-ranges')) out.set('accept-ranges', 'bytes');
  // Private: a shared cache must not keep a student's video around.
  out.set('Cache-Control', 'private, max-age=600');
  out.set('Content-Disposition', 'inline');
  return new Response(res.body, { status: res.status, headers: out });
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
