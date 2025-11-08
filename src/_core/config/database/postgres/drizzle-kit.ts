import { defineConfig } from 'drizzle-kit';
import { appSettings } from '../../appsettings';

export default defineConfig({
  schema: './src/_core/config/database/postgres/schema.ts',
  out: './src/_core/config/database/postgres',
  dialect: 'postgresql',
  dbCredentials: {
    host: appSettings.postgres.host,
    port: appSettings.postgres.port,
    user: appSettings.postgres.user,
    password: appSettings.postgres.password,
    database: appSettings.postgres.database,
  },
  schemaFilter: ['public'],
});