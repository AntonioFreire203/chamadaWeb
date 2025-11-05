import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

// Legacy-style mapping for places expecting UPPER_SNAKE env object
export const env = {
  PORT: config.port,
  API_PREFIX: config.apiPrefix,
  NODE_ENV: config.nodeEnv,
  DATABASE_URL: config.databaseUrl,
  JWT_SECRET: config.jwtSecret,
};
