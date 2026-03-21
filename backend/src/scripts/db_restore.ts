import 'dotenv/config';
import path from 'path';
import { Types } from 'mongoose';
import { connectMongo } from '../config/db';
import { Group } from '../models/Group';
import { Property } from '../models/Property';
import { encryptText } from '../utils/crypto';
import { normalizePropName } from '../utils/text';

const XLSX = require('xlsx');

type GroupRow = {
  groupId: string;
  groupName: string;
  ownerId: string;
  ownerEmail: string;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
};

type PropertyRow = {
  propertyId: string;
  groupId: string;
  propertyName: string;
  propertyNameLower?: string;
  valueHtml: string;
  ownerId: string;
  ownerEmail: string;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
};

function requireInputPath() {
  const argPath = process.argv[2]?.trim();
  if (!argPath) {
    throw new Error('Missing input file. Usage: npm run db_restore -- ./exports/your-file.xlsx');
  }

  return path.resolve(process.cwd(), argPath);
}

function toDate(value?: string) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function ensureObjectId(value: string, fieldName: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ObjectId for ${fieldName}: ${value}`);
  }

  return new Types.ObjectId(value);
}

async function main() {
  const inputPath = requireInputPath();
  const workbook = XLSX.readFile(inputPath);

  const groups = XLSX.utils.sheet_to_json(workbook.Sheets.Groups || {}, {
    defval: ''
  }) as GroupRow[];
  const properties = XLSX.utils.sheet_to_json(workbook.Sheets.Properties || {}, {
    defval: ''
  }) as PropertyRow[];

  if (!groups.length && !properties.length) {
    throw new Error('Workbook does not contain data in Groups or Properties sheets');
  }

  await connectMongo();

  for (const group of groups) {
    if (!group.groupId || !group.groupName || !group.ownerId || !group.ownerEmail) {
      throw new Error(`Invalid group row: ${JSON.stringify(group)}`);
    }

    await Group.collection.updateOne(
      { _id: ensureObjectId(group.groupId, 'groupId') },
      {
        $set: {
          groupName: group.groupName,
          ownerId: group.ownerId,
          ownerEmail: group.ownerEmail,
          authProvider: group.authProvider || 'google',
          createdAt: toDate(group.createdAt),
          updatedAt: toDate(group.updatedAt)
        }
      },
      { upsert: true }
    );
  }

  for (const property of properties) {
    if (
      !property.propertyId ||
      !property.groupId ||
      !property.propertyName ||
      !property.ownerId ||
      !property.ownerEmail
    ) {
      throw new Error(`Invalid property row: ${JSON.stringify(property)}`);
    }

    const encrypted = encryptText(String(property.valueHtml || ''));

    await Property.collection.updateOne(
      { _id: ensureObjectId(property.propertyId, 'propertyId') },
      {
        $set: {
          groupId: ensureObjectId(property.groupId, 'groupId'),
          ownerId: property.ownerId,
          ownerEmail: property.ownerEmail,
          authProvider: property.authProvider || 'google',
          propertyNameOriginal: property.propertyName,
          propertyNameLower:
            property.propertyNameLower || normalizePropName(property.propertyName),
          propertyValueEncrypted: encrypted.propertyValueEncrypted,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          createdAt: toDate(property.createdAt),
          updatedAt: toDate(property.updatedAt)
        }
      },
      { upsert: true }
    );
  }

  console.log(`Restore completed from: ${inputPath}`);
  console.log(`Restored groups: ${groups.length}`);
  console.log(`Restored properties: ${properties.length}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('db_restore failed:', error);
  process.exit(1);
});
