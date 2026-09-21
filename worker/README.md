# Class video proxy (Cloudflare Worker)

Streams class videos out of the three course Drive accounts, so a student only
needs to be signed in to **our** portal. Their Google account is irrelevant —
no account picker, no cookie prompt, no "Unable to load video".

```
student browser → play.html <video> → this Worker → Google Drive (course account)
```

The Worker refuses anyone whose Firebase token is missing, invalid, or whose
`users/<uid>.status` is not `approved`.

## What you set up once

### 1. Google Cloud project (any one of the three course accounts can own it)

1. console.cloud.google.com → new project, e.g. `ampplify-video`.
2. **APIs & Services → Library → Google Drive API → Enable**.
3. **OAuth consent screen** → External → app name, your email → add scope
   `https://www.googleapis.com/auth/drive.readonly` → add all three course
   Drive accounts as **Test users** (a testing app's refresh token expires after
   7 days, so **Publish** the app once it works).
4. **Credentials → Create credentials → OAuth client ID → Web application**.
   Authorised redirect URI: `https://developers.google.com/oauthplayground`.
   Keep the **Client ID** and **Client secret**.

### 2. One refresh token per Drive account

Do this three times — once signed in as each course Drive account:

1. Open <https://developers.google.com/oauthplayground>.
2. Gear icon → tick **Use your own OAuth credentials** → paste the client id and
   secret.
3. Left panel → paste scope `https://www.googleapis.com/auth/drive.readonly` →
   **Authorize APIs** → allow.
4. **Exchange authorization code for tokens** → copy the **Refresh token**.

Keep them out of chat, screenshots and git.

### 3. Deploy

```bash
cd worker
npx wrangler login
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put REFRESH_TOKEN_1
npx wrangler secret put REFRESH_TOKEN_2
npx wrangler secret put REFRESH_TOKEN_3
npx wrangler deploy
```

`deploy` prints the URL — `https://ampplify-class-video.<subdomain>.workers.dev`.
Put that in the admin panel (Google Drive access → Video proxy URL) and
`play.html` starts using it.

## Checks

```bash
curl -i "https://<worker-url>/v/<fileId>"                  # 401 No token
curl -i "https://<worker-url>/v/<fileId>?token=bad"        # 403 Sign in again
```

A signed-in approved student should get `206 Partial Content` with
`Accept-Ranges: bytes` when the player seeks.

## Limits worth knowing

- The file is served at its original size; there is no adaptive quality the way
  Drive's own player has. A big file on a slow line buffers.
- Drive has a per-file daily download quota. Heavy simultaneous viewing of one
  class can hit it; the Worker then returns 404 for that file until it resets.
- The stream URL can be copied out of DevTools while the token is alive (1 hour).
  Screen recording was never preventable either way.
