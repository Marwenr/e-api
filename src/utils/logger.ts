import { env } from '../config/env';

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (env.nodeEnv !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
};

