import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const jwt = require('jsonwebtoken');

const googleClient = new OAuth2Client(config.googleClientId);

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};

type GooglePayload = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

export async function verifyGoogleCredential(credential: string): Promise<AuthUser> {
  if (!config.googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId
  });

  const payload = ticket.getPayload() as GooglePayload | undefined;

  if (!payload?.sub || !payload?.email || !payload.email_verified) {
    throw new Error('Google token payload is missing required fields');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || ''
  };
}

export function createAccessToken(user: AuthUser) {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(user, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn as any
  });
}

export function verifyAccessToken(token: string) {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.verify(token, config.jwtSecret) as AuthUser;
}
