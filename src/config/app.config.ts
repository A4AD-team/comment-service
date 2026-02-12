import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '30', 10),
    window: parseInt(process.env.RATE_LIMIT_WINDOW ?? '60', 10),
  },
}));
