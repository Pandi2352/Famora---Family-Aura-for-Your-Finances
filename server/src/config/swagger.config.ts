import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'Famora API',
  description:
    process.env.SWAGGER_DESCRIPTION || 'Famora — Family Aura Finance API',
  version: process.env.SWAGGER_VERSION || '1.0',
  path: process.env.SWAGGER_PATH || 'api/docs',
}));
