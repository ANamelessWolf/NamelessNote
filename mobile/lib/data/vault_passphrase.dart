/// SQLCipher passphrase used to open the bundled, backend-generated
/// database (see `backend/src/scripts/db_dump_sqlite.ts`).
///
/// This MUST match `MOBILE_DB_ENCRYPTION_KEY` in the backend's `.env` at the
/// time the .sqlite export was produced — whoever generates the export and
/// whoever builds the app need to agree on the same value.
///
/// Passed in at build time with `--dart-define=VAULT_PASSPHRASE=...` so the
/// real key never has to be committed to source control (unlike the
/// database file itself, this .dart file IS tracked by git). See
/// mobile/README.md for the exact build command. The fallback below is only
/// used by `flutter analyze`/`flutter test` and by an accidental build that
/// forgot the flag — it intentionally will not open a real export.
const String vaultPassphrase = String.fromEnvironment(
  'VAULT_PASSPHRASE',
  defaultValue: 'CHANGE_ME_SAME_AS_BACKEND_MOBILE_DB_ENCRYPTION_KEY',
);

/// IMPORTANT — realistic threat model, read before relying on this:
///
/// VERIFIED: the passphrase ends up as a plain string inside
/// `lib/<abi>/libapp.so` in the release APK (a simple byte search finds it),
/// and `--obfuscate` only renames identifiers — it does NOT hide string
/// literals. So anyone who unzips the APK can recover the key and open the
/// bundled .sqlite. This layer only stops "open the extracted .sqlite in a
/// generic SQLite viewer" without any effort; it is not a real secret.
///
/// Real fix: do not ship the key in the app. Derive the DB key from a
/// master passphrase the user types on first launch (KDF) and keep it in
/// Android Keystore-backed storage gated by biometrics. See
/// docs/security-review.md.
///
/// The backend's encryption-at-rest (DATA_ENCRYPTION_KEY) is unaffected: that
/// key never reaches the device.
