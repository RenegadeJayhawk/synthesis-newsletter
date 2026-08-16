import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { articles } from '@/lib/data';

const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;

let server: ChildProcess | null = null;

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { method: 'GET' });
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still spinning up.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for Next.js server on ${baseUrl}`);
}

describe('smoke e2e', () => {
  beforeAll(async () => {
    server = spawn(process.execPath, [
      'node_modules/next/dist/bin/next',
      'dev',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(port),
        CI: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout?.on('data', (chunk) => {
      process.stdout.write(chunk);
    });

    server.stderr?.on('data', (chunk) => {
      process.stderr.write(chunk);
    });

    await waitForServer();
  }, 120000);

  afterAll(async () => {
    if (server && !server.killed) {
      server.kill('SIGTERM');
      await delay(1500);
    }
  });

  it('serves the home page', async () => {
    const response = await fetch(`${baseUrl}/`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('The Future of');
    expect(html).toContain('Stay Updated with The Synthesis');
  });

  it('serves an article detail page', async () => {
    const article = articles[0];
    const response = await fetch(`${baseUrl}/${encodeURIComponent(article.slug)}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(article.title);
    expect(html).toContain(article.excerpt);
  });

  it('serves the newsletter page', async () => {
    const response = await fetch(`${baseUrl}/newsletter`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('Newsletter');
  }, 20000);

  it('serves a top-level informational page', async () => {
    const response = await fetch(`${baseUrl}/privacy`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('Privacy');
  });
});
