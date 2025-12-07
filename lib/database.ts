import { Newsletter } from './newsletterService';

// Simple in-memory storage for now (will be replaced with Vercel Postgres)
// This allows the app to work locally and can be easily swapped with real DB
const newsletters: Newsletter[] = [];

/**
 * Save a newsletter to the database
 */
export async function saveNewsletter(newsletter: Newsletter): Promise<Newsletter> {
  // In production, this would be a database insert
  newsletters.push(newsletter);
  return newsletter;
}

/**
 * Get the latest newsletter
 */
export async function getLatestNewsletter(): Promise<Newsletter | null> {
  if (newsletters.length === 0) {
    return null;
  }
  
  // Sort by generatedAt descending and return the first one
  const sorted = [...newsletters].sort((a, b) => 
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  
  return sorted[0];
}

/**
 * Get a newsletter by ID
 */
export async function getNewsletterById(id: string): Promise<Newsletter | null> {
  const newsletter = newsletters.find(n => n.id === id);
  return newsletter || null;
}

/**
 * Get all newsletters
 */
export async function getAllNewsletters(): Promise<Newsletter[]> {
  // Sort by generatedAt descending
  return [...newsletters].sort((a, b) => 
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

/**
 * Delete a newsletter by ID
 */
export async function deleteNewsletter(id: string): Promise<boolean> {
  const index = newsletters.findIndex(n => n.id === id);
  if (index === -1) {
    return false;
  }
  newsletters.splice(index, 1);
  return true;
}

/**
 * Initialize with a default newsletter (for development)
 */
export function initializeWithDefault(newsletter: Newsletter): void {
  if (newsletters.length === 0) {
    newsletters.push(newsletter);
  }
}
