const drizzleConfig = {
  schema: './db/schema/*.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL || '',
  },
  // Neon Postgres is fully compatible with the existing Drizzle/Postgres schema.
};

export default drizzleConfig;
