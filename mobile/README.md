# NamelessNote Vault (Android)

Offline, biometric-locked viewer for a NamelessNote export. There is **no
network access and no `DATA_ENCRYPTION_KEY` on the device** — the backend
decrypts everything ahead of time and bakes a SQLCipher-encrypted SQLite
file into the APK.

## Quick start: build the APK

From the repo root (recommended — keeps the export and the app's passphrase
in sync automatically):

```bash
npm run mobile:apk
```

This reads `MOBILE_DB_ENCRYPTION_KEY` from `backend/.env`, regenerates
`mobile/assets/db/namelessnote.sqlite`, and builds the release APK passing
that same key in via `--dart-define` (see [scripts/build-mobile-apk.js](../scripts/build-mobile-apk.js)).
Use `npm run mobile:apk:skip-dump` to reuse the existing `.sqlite` and only
rebuild the app (faster when you're iterating on UI, not data).

Output: `mobile/build/app/outputs/flutter-apk/app-release.apk`.

**This file contains decrypted note values (inside an encrypted SQLite —
see below).** Treat it like you would a password manager backup: don't
upload it anywhere, delete local copies once installed on your phone.

## How it works

1. Backend (`../backend`) decrypts every property with the server-side
   `DATA_ENCRYPTION_KEY` (AES-256-GCM) and writes a `groups` / `properties`
   SQLite file, then **re-encrypts the whole file with SQLCipher** using
   `MOBILE_DB_ENCRYPTION_KEY` (`npm run db_dump_sqlite:mobile`, see
   [assets/db/README.md](assets/db/README.md)). A file extracted straight
   from the built APK (it's just a zip) is unreadable without that key —
   `file` reports it as random `data`, not a SQLite database.

2. `flutter build apk --release --dart-define=VAULT_PASSPHRASE=...` bundles
   the encrypted file as a Flutter asset and compiles the same key into the
   app (`lib/data/vault_passphrase.dart`) so it can open it. Building
   without `npm run mobile:apk` (e.g. running `flutter build apk` directly)
   uses a placeholder passphrase and **will not open a real export** — pass
   `--dart-define=VAULT_PASSPHRASE=<value of MOBILE_DB_ENCRYPTION_KEY>`
   yourself if you do this by hand.

3. On every start the app refreshes its copy of the bundled file in the app's
   private documents directory (assets are read-only, and installing a new APK
   over an old one keeps the app's old files, so a one-time copy would keep
   showing stale data) and opens it read-only with
   `sqflite_sqlcipher` (a fork of `sqflite` backed by
   `net.zetetic:sqlcipher-android`), passing the same passphrase.

4. Every launch (and every resume from background) requires the device's
   fingerprint/face unlock or PIN/pattern/password via `local_auth` before
   any data is shown (`lib/screens/lock_screen.dart`).

5. **Access password (optional).** If `MOBILE_ACCESS_PASSWORD` is set in
   `backend/.env`, after the fingerprint/PIN the app shows a prompt with one
   input and one button (`lib/screens/password_screen.dart`). Someone who
   enrolled their own fingerprint on your phone still needs this password.
   - Correct: normal app.
   - Wrong: no error message; the app opens as if it had no content
     ("No hay grupos guardados."), the database is never opened and search is
     disabled. There is no retry until the app process is closed and reopened
     (sending it to the background and coming back is not enough).
   - It is asked again on every unlock after the app goes to the background.
   - Only a salted PBKDF2-SHA256 hash (50,000 iterations) is baked into the
     APK, produced by `scripts/build-mobile-apk.js`; the password itself never
     is. Leave the variable empty to disable the feature. After changing it,
     rebuild the APK. It is a deterrent, not strong protection: the hash lives
     in the APK (see the threat model below).

6. Home screen lists groups; tapping one expands its properties. The search
   bar has two modes — **by group** (`groups.groupName`) and **by property**
   (`properties.propertyNameLower`) — and property search results are shown
   as a flat list of "group + property" rows, per spec.

7. Each property row mirrors the web frontend's `PropertyRow.jsx`: the value
   is masked by default, with a "show/hide" (eye) button and a "copy to
   clipboard" button.

### Threat model — what this protects against, and what it doesn't

SQLCipher stops "copy the `.sqlite` out of the APK and open it in a generic
DB browser". It does **not** protect against anyone who also unzips the APK:
the passphrase is compiled into `libapp.so` as a plain string (verified with
a byte search on the release build; `--obfuscate` renames identifiers but does
not hide string literals). Treat the APK itself as sensitive. The robust fix
(user-typed master passphrase + Keystore) is described in
[../docs/security-review.md](../docs/security-review.md). The real
encryption-at-rest lives in MongoDB (`DATA_ENCRYPTION_KEY`), which never
touches the device.

## Project layout

```
lib/
  auth/biometric_gate.dart      # local_auth wrapper
  data/vault_database.dart      # asset copy + sqflite_sqlcipher queries
  data/vault_passphrase.dart    # SQLCipher key, injected via --dart-define
  models/                       # VaultGroup, VaultProperty
  screens/lock_screen.dart      # biometric gate UI
  screens/password_screen.dart  # optional access-password prompt
  security/access_password.dart # PBKDF2 hash check (matches the build script)
  screens/home_screen.dart      # groups list + search
  widgets/property_tile.dart    # masked value + copy/show
```

## Customizing name, icon and metadata

| What | Where |
|---|---|
| App icon | Replace `assets/icon/icon.png` (1024x1024 PNG), then run `dart run flutter_launcher_icons`. See [assets/icon/README.md](assets/icon/README.md). |
| App name shown under the icon | `android:label` in `android/app/src/main/AndroidManifest.xml` (currently "NamelessNote Vault"). |
| Package/app ID (`applicationId`) | `android/app/build.gradle.kts` → `defaultConfig.applicationId`, and it must match `namespace` in the same file and the Kotlin package folder under `android/app/src/main/kotlin/...`. Changing it after install is treated by Android as a different app. |
| Version shown to users / version code | `version: X.Y.Z+N` in `pubspec.yaml` (`X.Y.Z` = versionName, `N` = versionCode) — or pass `--build-name`/`--build-number` to `flutter build apk`. |
| Description / pub metadata | `description:` in `pubspec.yaml` (not user-facing on Android, but good practice). |

## Known environment notes

- If you build on a machine where the project directory and the
  Gradle/Kotlin caches live on different drive letters/mounts, you may hit
  a Kotlin incremental-compiler crash ("this and base files have different
  roots"). `android/gradle.properties` already disables Kotlin incremental
  compilation (`kotlin.incremental=false`) to avoid it.
- Tested on the `Pixel_9` AVD: the app runs (no crash, `libsqlcipher.so`
  loads, encrypted DB opens correctly) but that particular emulator's
  software-rendered display pipeline (Impeller/GFXSTREAM) shows a black
  screen instead of the UI — a known emulator rendering limitation
  unrelated to this app. **Confirmed working end-to-end (biometric unlock,
  encrypted DB, search, copy/show) on a real Android device.**

## Related Documentation

- [../docs/architecture.md](../docs/architecture.md) — full system diagram and the two encryption layers explained together
- [../README.md](../README.md)
- [../backend/README.md](../backend/README.md)
