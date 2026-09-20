import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { connectMongo } from '../config/db';
import { Group } from '../models/Group';
import { Property } from '../models/Property';
import { decryptText } from '../utils/crypto';

// Loaded lazily and typed loosely on purpose: the package needs Node >= 22 (or a
// native build toolchain), so it is an *optional* dependency. It installs on the
// host, but not inside the node:20-alpine dev container — which must still boot.
function loadSqliteDriver(): any {
  try {
    return require('better-sqlite3-multiple-ciphers');
  } catch {
    throw new Error(
      "better-sqlite3-multiple-ciphers is not installed here. Run db_dump_sqlite on the host " +
        "(Node >= 22, `npm install` in backend/), not inside the Docker container."
    );
  }
}

function requireMobileDbKey() {
  const key = config.mobileDbEncryptionKey.trim();
  if (!key) {
    throw new Error(
      'MOBILE_DB_ENCRYPTION_KEY is not configured. Set it in .env to the same ' +
        'value as vaultPassphrase in mobile/lib/data/vault_passphrase.dart before ' +
        'running this export.'
    );
  }
  return key;
}

function getOutputPath() {
  const argPath = process.argv[2]?.trim();
  if (argPath) {
    return path.resolve(process.cwd(), argPath);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.resolve(process.cwd(), 'exports', `namelessnote-dump-${timestamp}.sqlite`);
}

function toIso(value?: Date | string) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function createSchema(db: any) {
  db.exec(`
    CREATE TABLE groups (
      id TEXT PRIMARY KEY,
      groupName TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      ownerEmail TEXT NOT NULL,
      authProvider TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE properties (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL REFERENCES groups(id),
      propertyNameOriginal TEXT NOT NULL,
      propertyNameLower TEXT NOT NULL,
      valueHtml TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      ownerEmail TEXT NOT NULL,
      authProvider TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX idx_groups_groupName ON groups(groupName);
    CREATE INDEX idx_properties_groupId ON properties(groupId);
    CREATE INDEX idx_properties_propertyNameLower ON properties(propertyNameLower);
  `);
}

async function main() {
  // Fail fast (before touching Mongo or the output file) if the export can't run here.
  const mobileDbKey = requireMobileDbKey();
  const Database = loadSqliteDriver();

  const outputPath = getOutputPath();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  // The SQLite file is generated fresh on every run; remove any previous copy
  // (including WAL/SHM sidecars) so we never mix data from different dumps.
  for (const suffix of ['', '-wal', '-shm']) {
    const target = `${outputPath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target);
  }

  await connectMongo(process.env.MONGO_URI_DUMP || process.env.MONGO_URI);

  const [groups, properties] = await Promise.all([
    Group.find().sort({ ownerEmail: 1, groupName: 1 }).lean(),
    Property.find().sort({ ownerEmail: 1, propertyNameLower: 1 }).lean()
  ]);

  const db = new Database(outputPath);

  try {
    // Encrypt the file with SQLCipher (compatibility mode 4), matching the
    // `net.zetetic:sqlcipher-android` library the Flutter app opens it with
    // (see mobile/lib/data/vault_database.dart). These pragmas must run
    // before any other statement on a brand-new database file.
    db.pragma(`cipher='sqlcipher'`);
    db.pragma(`legacy=4`);
    db.pragma(`key='${mobileDbKey.replace(/'/g, "''")}'`);

    createSchema(db);

    const insertGroup = db.prepare(`
      INSERT INTO groups (id, groupName, ownerId, ownerEmail, authProvider, createdAt, updatedAt)
      VALUES (@id, @groupName, @ownerId, @ownerEmail, @authProvider, @createdAt, @updatedAt)
    `);
    const insertProperty = db.prepare(`
      INSERT INTO properties (
        id, groupId, propertyNameOriginal, propertyNameLower, valueHtml,
        ownerId, ownerEmail, authProvider, createdAt, updatedAt
      )
      VALUES (
        @id, @groupId, @propertyNameOriginal, @propertyNameLower, @valueHtml,
        @ownerId, @ownerEmail, @authProvider, @createdAt, @updatedAt
      )
    `);

    const insertAll = db.transaction(() => {
      for (const group of groups) {
        insertGroup.run({
          id: String(group._id),
          groupName: group.groupName,
          ownerId: group.ownerId,
          ownerEmail: group.ownerEmail,
          authProvider: group.authProvider,
          createdAt: toIso(group.createdAt),
          updatedAt: toIso(group.updatedAt)
        });
      }

      for (const property of properties) {
        const valueHtml = decryptText({
          propertyValueEncrypted: property.propertyValueEncrypted,
          iv: property.iv,
          authTag: property.authTag
        });

        insertProperty.run({
          id: String(property._id),
          groupId: String(property.groupId),
          propertyNameOriginal: property.propertyNameOriginal,
          propertyNameLower: property.propertyNameLower,
          valueHtml,
          ownerId: property.ownerId,
          ownerEmail: property.ownerEmail,
          authProvider: property.authProvider,
          createdAt: toIso(property.createdAt),
          updatedAt: toIso(property.updatedAt)
        });
      }
    });

    insertAll();
  } finally {
    db.close();
  }

  console.log(`SQLite dump created at: ${outputPath}`);
  console.log(`Exported groups: ${groups.length}`);
  console.log(`Exported properties: ${properties.length}`);
  console.log('WARNING: this file contains DECRYPTED property values in plain text. Handle it as sensitive data.');
  process.exit(0);
}

main().catch((error) => {
  console.error('db_dump_sqlite failed:', error);
  process.exit(1);
});
