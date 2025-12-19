import { pgTable, text, timestamp, uuid, integer, jsonb } from 'drizzle-orm/pg-core';

/**
 * Newsletters table
 * Stores the main newsletter metadata and content
 */
export const newsletters = pgTable('newsletters', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekStart: text('week_start').notNull(),
  weekEnd: text('week_end').notNull(),
  content: text('content').notNull(), // Raw markdown content
  model: text('model').notNull().default('gemini-2.0-flash-exp'),
  overview: text('overview'), // Extracted overview section
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Articles table
 * Stores individual articles extracted from newsletters
 */
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsletterId: uuid('newsletter_id')
    .notNull()
    .references(() => newsletters.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(), // Full article content
  category: text('category').notNull(), // e.g., "Major Breakthroughs & Research"
  author: text('author'), // Organization or publication
  publication: text('publication'),
  imageUrl: text('image_url'),
  externalLink: text('external_link'),
  position: integer('position').notNull(), // Order within newsletter
  metadata: jsonb('metadata'), // Additional flexible data
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export types for use in application
export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
