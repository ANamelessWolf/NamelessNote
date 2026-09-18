#!/usr/bin/env node
// Builds the Android APK end-to-end:
//   1. Regenerates mobile/assets/db/namelessnote.sqlite from Mongo, SQLCipher-encrypted
//      (unless --skip-dump is passed).
//   2. Runs `flutter build apk --release`, passing the same passphrase used to encrypt
//      the export via --dart-define, so it never has to be hardcoded/committed in
//      mobile/lib/data/vault_passphrase.dart.
//
// Reads MOBILE_DB_ENCRYPTION_KEY from backend/.env so both steps always agree on the
// same key without the developer having to copy/paste it by hand.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const skipDump = process.argv.includes('--skip-dump');

// Minimal .env parser (KEY=VALUE per line, '#' comments) so this script has
// no dependency on `dotenv` being installed at the repo root.
function readEnvValue(envPath, key) {
  if (!fs.existsSync(envPath)) return '';
  const line = fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
}

const key = readEnvValue(path.join(repoRoot, 'backend', '.env'), 'MOBILE_DB_ENCRYPTION_KEY');
if (!key) {
  console.error(
    'MOBILE_DB_ENCRYPTION_KEY is not set in backend/.env. Generate one, e.g.:\n' +
      "  node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"\n" +
      'and add it as MOBILE_DB_ENCRYPTION_KEY=... in backend/.env.'
  );
  process.exit(1);
}

// Optional second factor asked by the app after the biometric/PIN unlock.
// Only a salted PBKDF2 hash is passed to the app, never the password itself.
// ITERATIONS must match `accessPasswordIterations` in
// mobile/lib/security/access_password.dart.
const ITERATIONS = 50000;
const accessPassword = readEnvValue(
  path.join(repoRoot, 'backend', '.env'),
  'MOBILE_ACCESS_PASSWORD'
);
const accessPasswordDefines = [];
if (accessPassword) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(accessPassword, salt, ITERATIONS, 32, 'sha256');
  accessPasswordDefines.push(
    `--dart-define=ACCESS_PASSWORD_SALT=${salt.toString('hex')}`,
    `--dart-define=ACCESS_PASSWORD_HASH=${hash.toString('hex')}`
  );
  console.log('Access password: enabled (MOBILE_ACCESS_PASSWORD found in backend/.env).');
} else {
  console.log('Access password: disabled (set MOBILE_ACCESS_PASSWORD in backend/.env to enable).');
}

function run(command, args, cwd) {
  console.log(`\n> ${command} ${args.join(' ')}  (cwd: ${cwd})`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!skipDump) {
  run('npm', ['run', 'db_dump_sqlite:mobile'], path.join(repoRoot, 'backend'));
} else {
  console.log('Skipping db_dump_sqlite (--skip-dump passed); using the existing .sqlite file.');
}

run(
  'flutter',
  [
    'build',
    'apk',
    '--release',
    `--dart-define=VAULT_PASSPHRASE=${key}`,
    ...accessPasswordDefines
  ],
  path.join(repoRoot, 'mobile')
);

console.log('\nAPK ready at mobile/build/app/outputs/flutter-apk/app-release.apk');
