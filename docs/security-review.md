# Security review

Static review of backend, frontend, mobile and Docker setup (2026-09-18).
Findings are ordered by priority. "Verified" means reproduced against the
actual code/artifacts, not just suspected.

## High

### H1. MongoDB is exposed with no authentication
`docker-compose.yml` publishes `27018:27017` on all interfaces and Mongo runs
without credentials (`MONGO_URI` has none). Anyone on the LAN can read,
modify or delete every collection. Values stay encrypted, but group/property
names, owners and emails are plaintext, and records can be deleted or
swapped (see M4).
**Fix:** bind to loopback (`127.0.0.1:27018:27017`), enable auth
(`MONGO_INITDB_ROOT_USERNAME/PASSWORD` + credentials in `MONGO_URI`), and
drop the port mapping entirely outside dev.

### H2. Mobile passphrase is recoverable from the APK (verified)
The SQLCipher key passed with `--dart-define` is a plain string inside
`lib/<abi>/libapp.so` (byte search finds it in all three ABIs). `--obfuscate`
does not hide string literals. Unzip APK -> read key -> open the bundled DB.
Earlier docs claimed otherwise; they have been corrected.
**Fix (real):** do not ship the key. Encrypt the export with a master
passphrase only you know, ask for it once on first launch, derive the key
(PBKDF2/Argon2) and keep it in Keystore-backed storage gated by biometrics.
Until then, treat the APK like the data itself.

### H3. Stored XSS in the frontend, with the JWT in localStorage (verified in code)
`formatRichText()` (`frontend/src/assets/strings.js`) interpolates
`groupName` into an HTML template that `modals.jsx` renders with
`dangerouslySetInnerHTML`. Group names only have a length check (<=30), so
`<img src=x onerror=...>` (~26 chars) runs when the delete dialog opens. The
script can read `localStorage.access_token` and use the account for up to 8h.
Data can reach a victim via restoring an untrusted `.xlsx`.
**Fix:** HTML-escape interpolated values (or render `groupName` as a React
node), validate `groupName` server-side (allow-list), and prefer an
httpOnly cookie or short-lived token + CSP over localStorage.

## Medium

- **M1. No rate limiting.** `/auth/google` and `/api/*` are unthrottled. Add
  `express-rate-limit` (stricter on `/auth`).
- **M2. Regex injection / ReDoS.** `searchGroups` passes `?search=` straight
  into `$regex`. Scoped by `ownerId`, but an expensive pattern can pin Mongo's
  CPU. Escape the input (or use a text/prefix match) and cap its length.
- **M3. Open registration.** Any verified Google account can log in and store
  data; all users share one `DATA_ENCRYPTION_KEY`. Add an `ALLOWED_EMAILS`
  allow-list if this is a personal vault.
- **M4. GCM has no AAD.** Ciphertext is not bound to
  `ownerId|groupId|propertyNameLower`, so someone with DB write access can
  move a valid ciphertext to another property/user. Pass AAD to
  `setAAD()` (needs a versioned format + migration).
- **M5. No key rotation.** One static key, no key id stored per record.
  Add a `keyVersion` field before you ever need to rotate.
- **M6. HTTPS fails open.** `server.ts` falls back to plain HTTP if the cert
  files are missing while `HTTPS_ENABLED=true`. Exit instead.
- **M7. Permissive CORS in every environment.** Any `192.168.1.x` and any
  `localhost` origin are always allowed, and disallowed origins raise a 500.
  Gate these on `NODE_ENV !== 'production'`. (Bearer tokens, not cookies, so
  impact is limited.)
- **M8. API base URL is user-overridable via localStorage.** `appConfig.js`
  lets `localStorage.app_config.apiBaseUrl` replace the API host, and the axios
  interceptor then sends the Bearer token there. Combined with H3, or a
  social-engineered "set this URL", it exfiltrates the token. Restrict to an
  allow-list or drop the override in production builds.
- **M9. Swagger `/docs` is public** with a CSP allowing `'unsafe-inline'` and
  any `https:` script. Disable or protect it outside development.
- **M10. Mobile app hygiene (verified in manifest):** `allowBackup` is not
  disabled (the DB copy in app storage can be backed up); no `FLAG_SECURE`
  (revealed values appear in screenshots and the recents thumbnail);
  clipboard copies never expire (clear after ~30s and mark as sensitive);
  release is signed with the debug key; the biometric gate is UI-only, not
  bound to the DB key, so a rooted device or Frida can bypass it.

## Low

- `sanitize-html` config allows `style` on every tag and remote `img src`
  (CSS overlays/tracking pixels). Restrict with `allowedStyles` or drop `style`.
- `jwt.verify` does not pin `algorithms: ['HS256']` and tokens carry no
  `iss`/`aud`; no revocation before the 8h expiry.
- `JWT_SECRET`, `DATA_ENCRYPTION_KEY` and `MOBILE_DB_ENCRYPTION_KEY` are not
  validated at startup (length/presence); the server boots and fails later.
- One undecryptable record makes the whole group list return 500.
- Containers run as root with `npm install` on every start (dev setup; do
  not reuse for production).
- Dependency audit: 15 vulnerabilities in backend prod deps (10 high),
  7 in frontend (2 high). `xlsx@0.18.5` has known prototype-pollution/ReDoS
  issues with no npm fix; it is only used by the CLI dump/restore scripts, so
  only restore untrusted `.xlsx` files if you must, or move to `exceljs`.
  Run `npm audit fix` and re-test.
- Group/property names are plaintext in Mongo and in the mobile export by
  design; do not put secrets in names.

## Checked and OK

- Every query is scoped by `ownerId` (Google `sub`), so no cross-user reads or
  deletes; ObjectIds are validated; `email_verified` is enforced.
- Property values: random 96-bit IV per value, GCM tag verified, key length
  validated. Property names validated with a strict regex; body limit 1 MB.
- `.env`, certs, `*.sqlite`, `*.xlsx` are not tracked by git and never were
  (history checked). `helmet` is enabled; errors hide stacks unless `DEBUG=true`
  (**keep `DEBUG=false` in any shared environment**; your local `.env` has it on).

## Suggested order

1. H1 (Mongo auth + loopback) and H3 (escape group names) — small, high impact.
2. M1, M2, M6, M9 — a few lines each in `app.ts`/`server.ts`.
3. H2 — a design change on mobile; decide if the APK will ever leave your phone.
4. M4/M5 together, as one encryption-format migration.
