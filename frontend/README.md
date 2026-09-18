# NamelessNote Frontend

The frontend is a React + Vite single-page application for authenticated note management with Google Sign-In.

## Responsibilities

- Render the login flow with Google OAuth
- Send the Google `id_token` to the backend
- Store the backend JWT in `localStorage`
- Restore auth state after refresh
- Load groups and properties for the authenticated user
- Send `valueHtml` to the backend over HTTPS
- Display decrypted property values returned by the backend

## Stack

- React 18
- Vite
- MUI
- Redux Toolkit
- Axios
- `@react-oauth/google`

## Authentication Flow

1. The login screen uses Google Sign-In.
2. Google returns `response.credential`, which is the Google `id_token`.
3. The frontend sends that credential to `POST /auth/google`.
4. The backend validates the Google token and returns its own app JWT.
5. The frontend stores that JWT as `access_token`.
6. Protected requests include `Authorization: Bearer <token>`.

Files involved:

- [src/views/LoginView.jsx](/z:/dev/node/NamelessNote/frontend/src/views/LoginView.jsx)
- [src/api/auth.js](/z:/dev/node/NamelessNote/frontend/src/api/auth.js)
- [src/utils/authSession.js](/z:/dev/node/NamelessNote/frontend/src/utils/authSession.js)
- [src/routes.jsx](/z:/dev/node/NamelessNote/frontend/src/routes.jsx)

## User Data In The UI

The app JWT includes user data like:

- `sub`
- `email`
- `name`
- `picture`

That data is used in the UI after login.

For example:

- the footer avatar uses the token `picture`
- the footer name uses the token `name`
- the footer email uses the token `email`

File:

- [src/components/common/FooterInfo.jsx](/z:/dev/node/NamelessNote/frontend/src/components/common/FooterInfo.jsx)

## Data Flow For Properties

The frontend sends `valueHtml` in clear text over HTTPS.

It does not perform encryption locally.

The backend:

1. encrypts the value before saving
2. decrypts the value before returning it

This means the frontend still works with:

- `valueHtml`
- `valueText`

without needing to understand encryption internals.

## Environment Variables

Create `frontend/.env` from:

- [frontend/.env.example](/z:/dev/node/NamelessNote/frontend/.env.example)

Required values:

```env
VITE_APP_LANGUAGE=es
VITE_API_BASE_URL=https://localhost:4000
VITE_GOOGLE_CLIENT_ID=PUT_YOUR_GOOGLE_CLIENT_ID
DEV_HTTPS=false
DEV_HTTPS_CERT_FILE=../certs/namelessnote-local.pem
DEV_HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

## Local Development

Install dependencies:

```powershell
cd frontend
npm install
```

Run the dev server:

```powershell
npm run dev
```

Default URL:

- `http://localhost:3000`

If `DEV_HTTPS=true`, Vite serves over:

- `https://localhost:3000`

## Build

```powershell
cd frontend
npm run build
```

## Notes

- Google OAuth requires the exact frontend origin to be authorized in Google Cloud Console
- if the Google profile image returns `429`, the footer avatar now falls back gracefully to initials/local image
- the frontend expects the backend API base URL without adding `/api` to the environment value

## Related Documentation

- [README.md](/z:/dev/node/NamelessNote/README.md)
- [docs/architecture.md](/z:/dev/node/NamelessNote/docs/architecture.md)
- [google-login-workaround.md](/z:/dev/node/NamelessNote/docs/google-login-workaround.md)

The Android app in [mobile/](/z:/dev/node/NamelessNote/mobile) mirrors this
app's property display pattern (masked value, show/hide, copy) — see
[mobile/lib/widgets/property_tile.dart](/z:/dev/node/NamelessNote/mobile/lib/widgets/property_tile.dart)
vs. [src/components/properties/PropertyRow.jsx](/z:/dev/node/NamelessNote/frontend/src/components/properties/PropertyRow.jsx).
