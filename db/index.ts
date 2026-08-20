import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/newsletters';

const connectionString = process.env.POSTGRES_URL?.trim();

// Initialize Drizzle with Neon Postgres only when a database URL is configured.
// When no URL is present, the app keeps its existing in-memory/mock behavior.
export const db = connectionString
  ? drizzle(neon(connectionString), { schema })
  // NewsletterDbService never dereferences this branch: it uses its local mock
  // whenever POSTGRES_URL is absent. `never` avoids an untyped database surface.
  : null as never;

// Export schema for use in queries
export { schema };
