# Google Single-Page Login Workaround and Integration Notes

## Overview

This document summarizes the full Google Sign-In integration that was added to `NamelessNote`, along with the local Docker and TypeScript workarounds required to make the stack run correctly in development.

The work covered three areas:

1. Replacing the placeholder frontend login with Google Sign-In.
2. Adding a real backend authentication flow that validates Google tokens and issues an app-specific JWT.
3. Fixing the local Docker development environment so both frontend and backend containers could actually run the new code.

This write-up is intentionally detailed so the same issues can be avoided or reproduced later without guesswork.

---

## Final Authentication Flow

The final flow is:

1. The user clicks the Google Sign-In button in the SPA.
2. Google returns a `credential`, which is a Google `id_token`.
3. The frontend sends that token to `POST /auth/google`.
4. The backend validates the Google token against `GOOGLE_CLIENT_ID`.
5. If valid, the backend extracts user information such as:
   - `sub`
   - `email`
   - `name`
   - `picture`
6. The backend creates its own JWT for the app session.
7. The frontend stores that app JWT in `localStorage` under `access_token`.
8. Protected API requests include `Authorization: Bearer <token>`.

This is important because the app should trust only its own session token after the backend has verified the Google identity.

---

## Frontend Changes

### 1. Replaced the placeholder login form with Google Sign-In

The original login screen contained email and password fields that did not authenticate against anything real. That was replaced with `GoogleLogin` from `@react-oauth/google`.

File:

- [frontend/src/views/LoginView.jsx](/z:/dev/node/NamelessNote/frontend/src/views/LoginView.jsx)

Relevant implementation:

```jsx
import { GoogleLogin } from '@react-oauth/google'
import { loginWithGoogleCredential } from '../api/auth'

const handleGoogleSuccess = async (response) => {
  const credential = response?.credential
  if (!credential) {
    setErrorMessage(texts.login.googleMissingCredential)
    return
  }

  const payload = JSON.parse(atob(credential.split('.')[1]))
  console.log('Google JWT payload:', payload)

  const session = await loginWithGoogleCredential(credential)
  onLogin(session.accessToken)
}
```

### 2. Added Google OAuth provider at app root

The frontend now wraps the application in `GoogleOAuthProvider`, using `VITE_GOOGLE_CLIENT_ID`.

File:

- [frontend/src/main.jsx](/z:/dev/node/NamelessNote/frontend/src/main.jsx)

Snippet:

```jsx
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  </ThemeProvider>
</GoogleOAuthProvider>
```

### 3. Added frontend API wrapper for Google login

The frontend sends the Google credential to the backend using a dedicated API function.

File:

- [frontend/src/api/auth.js](/z:/dev/node/NamelessNote/frontend/src/api/auth.js)

Snippet:

```js
import { post } from './http'

export async function loginWithGoogleCredential(credential) {
  const json = await post('/auth/google', { credential })
  return json?.data ?? null
}
```

### 4. Added persistent auth session helpers

The login state no longer depends on a temporary `useState(false)` only. The session is now persisted in `localStorage` and validated by checking the JWT payload expiration.

File:

- [frontend/src/utils/authSession.js](/z:/dev/node/NamelessNote/frontend/src/utils/authSession.js)

Key ideas:

- Store the JWT under `access_token`
- Decode the token payload client-side
- Check `exp`
- Broadcast auth changes so route state updates after login/logout

Snippet:

```js
export function hasValidAccessToken(token = readAccessToken()) {
  const payload = decodeAccessToken(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 > Date.now()
}
```

### 5. Updated route auth handling

The route layer now reads the persisted token on startup and uses it to derive `isAuthenticated`.

File:

- [frontend/src/routes.jsx](/z:/dev/node/NamelessNote/frontend/src/routes.jsx)

Snippet:

```jsx
const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidAccessToken())

const authApi = useMemo(
  () => ({
    login: (token) => {
      saveAccessToken(token)
      setIsAuthenticated(true)
    },
    logout: () => {
      clearAccessToken()
      setIsAuthenticated(false)
    }
  }),
  []
)
```

### 6. Cleared auth on 401 responses

The HTTP client now removes the stored token if the backend returns `401`.

File:

- [frontend/src/api/http.js](/z:/dev/node/NamelessNote/frontend/src/api/http.js)

Snippet:

```js
if (status === 401) {
  clearAccessToken()
}
```

---

## Backend Changes

### 1. Added Google token verification and app JWT creation

A new backend auth utility was created to:

- verify the Google `id_token`
- extract the user payload
- create a JWT for the app
- validate that JWT on future requests

File:

- [backend/src/utils/auth.ts](/z:/dev/node/NamelessNote/backend/src/utils/auth.ts)

Core logic:

```ts
const googleClient = new OAuth2Client(config.googleClientId)

export async function verifyGoogleCredential(credential: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId
  })

  const payload = ticket.getPayload()
  // validate sub, email, email_verified, etc.
}
```

JWT creation:

```ts
export function createAccessToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn as any
  })
}
```

### 2. Added `POST /auth/google`

A dedicated auth route and controller were created for Google login.

Files:

- [backend/src/routes/auth.ts](/z:/dev/node/NamelessNote/backend/src/routes/auth.ts)
- [backend/src/controllers/authController.ts](/z:/dev/node/NamelessNote/backend/src/controllers/authController.ts)

Snippet:

```ts
router.post('/google', loginWithGoogle)
```

Controller flow:

```ts
const credential = String(req.body?.credential || '').trim()
const user = await verifyGoogleCredential(credential)
const accessToken = createAccessToken(user)

return res.status(200).json(
  new HttpResponse({
    success: true,
    message: 'Authenticated with Google',
    data: {
      accessToken,
      user
    }
  })
)
```

### 3. Replaced fake auth middleware

Originally, the backend accepted any bearer token and injected a dummy user:

```ts
(req as any).user = { sub: 'dev', email: 'dev@example.com' }
```

That was replaced with real JWT validation.

File:

- [backend/src/middleware/auth.ts](/z:/dev/node/NamelessNote/backend/src/middleware/auth.ts)

Current approach:

```ts
const token = auth.slice('Bearer '.length).trim()

try {
  (req as any).user = verifyAccessToken(token)
  return next()
} catch {
  return res.status(401).json({ error: 'Invalid or expired bearer token' })
}
```

### 4. Protected the API routes

The groups and properties routes are now behind `requireAuth`.

File:

- [backend/src/routes/index.ts](/z:/dev/node/NamelessNote/backend/src/routes/index.ts)

Snippet:

```ts
router.use('/auth', auth)
router.use('/api/groups', requireAuth, groups)
router.use('/api/groups/:groupId/properties', requireAuth, properties)
```

### 5. Added JWT config

The backend config now reads:

- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Files:

- [backend/src/config/index.ts](/z:/dev/node/NamelessNote/backend/src/config/index.ts)
- [backend/.env.example](/z:/dev/node/NamelessNote/backend/.env.example)

---

## Environment Configuration

### Frontend environment

The frontend needed:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_API_BASE_URL=https://localhost:4000
```

Files:

- [frontend/.env](/z:/dev/node/NamelessNote/frontend/.env)
- [frontend/.env.example](/z:/dev/node/NamelessNote/frontend/.env.example)

### Backend environment

The backend needed:

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=8h
```

Files:

- [backend/.env](/z:/dev/node/NamelessNote/backend/.env)
- [backend/.env.example](/z:/dev/node/NamelessNote/backend/.env.example)

---

## Google OAuth `origin_mismatch` Issue

After the frontend implementation was working, Google started rejecting the login with:

```text
Error 400: origin_mismatch
```

### Cause

Google OAuth requires the exact SPA origin to be registered in the Google Cloud Console. The match must be exact for:

- protocol (`http` vs `https`)
- host (`localhost` vs LAN IP)
- port (`3000`)

For example, these are all different origins:

```text
http://localhost:3000
https://localhost:3000
https://192.168.1.235:3000
```

### Fix

Add every actual development origin to the OAuth client in Google Cloud Console under **Authorized JavaScript origins**.

For this project, likely candidates are:

```text
https://localhost:3000
http://localhost:3000
https://192.168.1.235:3000
```

---

## Docker Development Issues

The biggest local blocker was not the auth code itself, but the Docker development setup.

### Problem 1: Dependencies were not installed inside the dev containers

The original dev commands were:

```yaml
command: sh -c "[ -d node_modules ] || npm install; npm run dev"
```

and

```yaml
command: sh -c "[ -d node_modules ] || npm install; npm run dev -- --host 0.0.0.0 --port 3000"
```

### Why this failed

Both frontend and backend mount `/app/node_modules` as a Docker volume:

```yaml
- /app/node_modules
```

That directory can exist even when it is empty. The shell check only verified the directory existed, so `npm install` was skipped even though required packages were missing.

This caused errors such as:

```text
sh: nodemon: not found
```

and:

```text
Failed to resolve import "@react-oauth/google"
```

### Fix applied

The dev commands were changed to always install before starting:

File:

- [docker-compose.dev.yml](/z:/dev/node/NamelessNote/docker-compose.dev.yml)

Snippet:

```yaml
command: sh -c "npm install && npm run dev"
```

and:

```yaml
command: sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000"
```

### Problem 2: Backend inherited production-like container behavior

The backend service in development was still inheriting the production build from the base compose setup. That made the container environment unsuitable for running `nodemon`, `ts-node`, and other dev dependencies.

### Fix applied

The backend dev service was explicitly set to:

```yaml
image: node:20-alpine
working_dir: /app
environment:
  - NODE_ENV=development
```

The frontend was also aligned with `NODE_ENV=development`.

---

## MongoDB Data Loss During Docker Reset

At one point the stack was brought down using:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

### What happened

The `-v` flag removes volumes. Since MongoDB data was stored in the project volume, deleting the volume removed the data associated with this stack.

The effective Compose configuration expected a volume named:

```text
namelessnote_mongo_data
```

When it no longer existed, the original project data was gone and a new empty database would be created on the next startup.

### Recommendation

Avoid using `down -v` unless you intentionally want to delete database data.

Safer alternatives:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

---

## TypeScript Workarounds Needed in Development

### Problem 1: `jsonwebtoken` typings were missing in the backend runtime environment

The backend crashed with:

```text
Could not find a declaration file for module 'jsonwebtoken'
```

Even though the code itself was valid, the local dev runtime under `ts-node` did not have a stable type setup for that dependency.

### Fix applied

Two changes were used to reduce fragility:

1. Added a local fallback declaration:

File:

- [backend/src/types/jsonwebtoken.d.ts](/z:/dev/node/NamelessNote/backend/src/types/jsonwebtoken.d.ts)

Contents:

```ts
declare module 'jsonwebtoken';
```

2. Switched from ESM-style typed import to `require` in the auth helper:

```ts
const jwt = require('jsonwebtoken')
```

This avoids the local dev server depending on external type declarations for startup.

### Problem 2: Express `req.user` type augmentation was not recognized by `ts-node`

The backend then failed with:

```text
Property 'user' does not exist on type 'Request'
```

A declaration file for Express request augmentation had been added, but the runtime type resolution was still not stable enough in this setup.

### Fix applied

The middleware was changed to use:

```ts
(req as any).user = verifyAccessToken(token)
```

This is less elegant than a full request type augmentation, but it is stable and unblocks local development immediately.

---

## Validation Steps Performed

The following checks were performed during the work:

1. Verified the frontend build:

```powershell
npm run build
```

2. Verified the backend build:

```powershell
npm run build
```

3. Performed a backend runtime check for JWT creation and validation.

4. Inspected Docker containers:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

5. Inspected backend and frontend logs:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=200 nameless_note_backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=200 nameless_note_front
```

---

## Current Known State

At the end of the troubleshooting session:

- Google Sign-In was implemented in the frontend.
- Backend Google token verification and JWT session issuance were implemented.
- Protected API routes were using JWT validation.
- The dev Docker setup was adjusted to install dependencies reliably.
- The TypeScript startup blockers in the backend were worked around.
- The server was reported as working again.

---

## Recommended Next Improvements

The current setup works, but these are good follow-up improvements:

1. Properly add `@types/jsonwebtoken` back into `backend/package.json` so the workaround is no longer needed.
2. Replace `(req as any).user` with a clean Express request type augmentation once the dev type loading is stable.
3. Consider using `npm ci` in development containers if deterministic installs are preferred.
4. Consider caching dependencies more deliberately to avoid reinstalling on every boot.
5. Add a dedicated `/auth/me` endpoint if the frontend later needs server-validated session restoration.
6. Add automated tests for:
   - Google login endpoint
   - JWT middleware
   - unauthenticated route rejection

---

## Quick Recovery Commands

### Start the dev stack

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Restart only the backend

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart nameless_note_backend
```

### Tail logs

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f nameless_note_backend nameless_note_front
```

### Stop without deleting data

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Stop and delete data volumes

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

Use the last command only when deleting the local MongoDB data is intentional.
