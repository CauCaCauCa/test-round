import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appSettings } from '../../appsettings';
import * as schema from './schema';

const client = postgres({
  host: appSettings.postgres.host,
  port: appSettings.postgres.port,
  user: appSettings.postgres.user,
  password: appSettings.postgres.password,
  database: appSettings.postgres.database,
});

export const db_client = drizzle(client, { schema });