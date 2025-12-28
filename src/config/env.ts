import { config } from 'dotenv';

config();

interface EnvConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  apiPrefix: string;
  mongoUri: string;
  mongoDbName: string;
  corsOrigin: string;
  rateLimitMax: number;
  rateLimitTimeWindow: number;
  jwtSecret: string;
  jwtAccessTokenExpiresIn: string;
  jwtRefreshTokenExpiresIn: string;
}

const validateEnv = (): EnvConfig => {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    apiPrefix: process.env.API_PREFIX || '/api',
    mongoUri: process.env.MONGO_URI!,
    mongoDbName: process.env.MONGO_DB_NAME || 'ecommerce',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitTimeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10),
    jwtSecret: process.env.JWT_SECRET!,
    jwtAccessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    jwtRefreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  };
};

export const env = validateEnv();
