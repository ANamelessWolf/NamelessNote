import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectMongo } from '../config/db';
import { Group } from '../models/Group';
import { Property } from '../models/Property';
import { decryptText } from '../utils/crypto';

const XLSX = require('xlsx');

function getOutputPath() {
  const argPath = process.argv[2]?.trim();
  if (argPath) {
    return path.resolve(process.cwd(), argPath);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.resolve(process.cwd(), 'exports', `namelessnote-dump-${timestamp}.xlsx`);
}

async function main() {
  const outputPath = getOutputPath();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await connectMongo();

  const [groups, properties] = await Promise.all([
    Group.find().sort({ ownerEmail: 1, groupName: 1 }).lean(),
    Property.find().sort({ ownerEmail: 1, propertyNameLower: 1 }).lean()
  ]);

  const groupsSheetRows = groups.map((group) => ({
    groupId: String(group._id),
    groupName: group.groupName,
    ownerId: group.ownerId,
    ownerEmail: group.ownerEmail,
    authProvider: group.authProvider,
    createdAt: group.createdAt?.toISOString?.() || '',
    updatedAt: group.updatedAt?.toISOString?.() || ''
  }));

  const propertiesSheetRows = properties.map((property) => ({
    propertyId: String(property._id),
    groupId: String(property.groupId),
    propertyName: property.propertyNameOriginal,
    propertyNameLower: property.propertyNameLower,
    valueHtml: decryptText({
      propertyValueEncrypted: property.propertyValueEncrypted,
      iv: property.iv,
      authTag: property.authTag
    }),
    ownerId: property.ownerId,
    ownerEmail: property.ownerEmail,
    authProvider: property.authProvider,
    createdAt: property.createdAt?.toISOString?.() || '',
    updatedAt: property.updatedAt?.toISOString?.() || ''
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(groupsSheetRows), 'Groups');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(propertiesSheetRows), 'Properties');
  XLSX.writeFile(workbook, outputPath);

  console.log(`Dump created at: ${outputPath}`);
  console.log(`Exported groups: ${groupsSheetRows.length}`);
  console.log(`Exported properties: ${propertiesSheetRows.length}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('db_dump_data failed:', error);
  process.exit(1);
});
