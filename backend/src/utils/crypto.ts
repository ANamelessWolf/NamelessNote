import crypto from 'crypto';
import { config } from '../config';

const IV_LENGTH_BYTES = 12;
const SUPPORTED_ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const rawKey = config.dataEncryptionKey.trim();
  if (!rawKey) {
    throw new Error('DATA_ENCRYPTION_KEY is not configured');
  }

  const isHex = /^[0-9a-fA-F]+$/.test(rawKey) && rawKey.length === 64;
  const key = isHex ? Buffer.from(rawKey, 'hex') : Buffer.from(rawKey, 'base64');

  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes in base64 or hex format');
  }

  return key;
}

function getAlgorithm() {
  if (config.dataEncryptionAlgorithm !== SUPPORTED_ALGORITHM) {
    throw new Error(`Unsupported DATA_ENCRYPTION_ALGORITHM: ${config.dataEncryptionAlgorithm}`);
  }

  return config.dataEncryptionAlgorithm;
}

export type EncryptedValue = {
  propertyValueEncrypted: string;
  iv: string;
  authTag: string;
};

export function encryptText(plaintext: string): EncryptedValue {
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(
    getAlgorithm(),
    getEncryptionKey(),
    iv
  ) as crypto.CipherGCM;
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    propertyValueEncrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

export function decryptText(payload: EncryptedValue) {
  const decipher = crypto.createDecipheriv(
    getAlgorithm(),
    getEncryptionKey(),
    Buffer.from(payload.iv, 'base64')
  ) as crypto.DecipherGCM;
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.propertyValueEncrypted, 'base64')),
    decipher.final()
  ]).toString('utf8');
}
