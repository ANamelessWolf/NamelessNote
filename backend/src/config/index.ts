import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim()),
  mongoUri: process.env.MONGO_URI || 'mongodb://NamelessNoteDB:27017/namelessnote',
  googleClientId: process.env.GOOGLE_CLIENT_ID || ''
};
