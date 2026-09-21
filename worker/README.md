# Class video proxy (Cloudflare Worker)

Streams class videos out of the course Drive folders, so a student only needs to
be signed in to **our** portal. Their Google account is irrelevant — no account
picker, no cookie prompt, no "Unable to load video".

```
student browser → play.html <video> → this Worker → Google Drive
```

The Worker refuses anyone whose Firebase token is missing or invalid, or whose
`users/<uid>.status` is not `approved`.

## How it reaches Drive

A **service account** — `class-video@ampplify-video.iam.gserviceaccount.com` —
is a viewer on all three course folders, added the same way a student is (via
`scripts/drive-access.gs`). The Worker signs a JWT with that account's key and
swaps it for an access token. Nothing expires, no consent screen, no OAuth
playground, and no refresh token to renew every seven days.

When a fourth batch folder is added, share it with the same address.

## Setup

### 1. Google Cloud (done once, in project `ampplify-video`)

1. **Google Drive API** enabled.
2. Service account `class-video` created.
3. **Keys → Add key → Create new key → JSON** → download the file and keep it
   somewhere safe. It is the only copy; Google does not show it again.

### 2. Share the folders with it

From the admin panel, or with the same call the panel makes, grant
`class-video@ampplify-video.iam.gserviceaccount.com` viewer access on every
course folder.

### 3. Deploy

Either paste `src/index.js` into the Cloudflare dashboard editor
(Workers & Pages → Create → Worker), or:

```bash
cd worker
npx wrangler deploy
```

Then set both secrets — dashboard: Worker → Settings → Variables → **Encrypt**;
CLI: `npx wrangler secret put <NAME>`:

| Secret | Value from the key file |
|---|---|
| `SA_CLIENT_EMAIL` | `client_email` |
| `SA_PRIVATE_KEY` | `private_key`, BEGIN/END lines and all |

Finally paste the Worker URL into the admin panel (Google Drive access → Video
proxy URL). `play.html` picks it up from there.

## Checks

```bash
curl -i "https://<worker-url>/v/<fileId>"               # 401 No token
curl -i "https://<worker-url>/v/<fileId>?token=bad"     # 403 Sign in again
```

A signed-in approved student gets `206 Partial Content` with
`Accept-Ranges: bytes` when the player seeks.

## Limits worth knowing

- The file is served at its original size; there is no adaptive quality the way
  Drive's own player has. A big file on a slow line buffers.
- Drive has a per-file daily download quota. Heavy simultaneous viewing of one
  class can hit it; the Worker then returns 404 for that file until it resets.
- The stream URL can be copied out of DevTools while the token is alive (1 hour).
  Screen recording was never preventable either way.
