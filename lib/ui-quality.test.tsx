import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/app/contact/ContactForm';
import SubscribeForm from '@/components/newsletter/SubscribeForm';

function readSource(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), 'utf8');
}

describe('accessibility and quality coverage', () => {
  it('renders the footer with accessible newsletter controls and navigation links', () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('Stay Updated');
    expect(html).toContain('aria-label="Email address"');
    expect(html).toContain('/privacy');
    expect(html).toContain('/terms');
    expect(html).toContain('/contact');
  });

  it('renders the contact form with explicit field labels', () => {
    const html = renderToStaticMarkup(
      <ContactForm initialTopic="Coverage idea" initialEmail="reader@example.com" />
    );

    expect(html).toContain('for="contact-name"');
    expect(html).toContain('for="contact-email"');
    expect(html).toContain('for="contact-topic"');
    expect(html).toContain('for="contact-message"');
    expect(html).toContain('reader@example.com');
    expect(html).toContain('Send message');
  });

  it('renders the subscription form with an accessible email field', () => {
    const html = renderToStaticMarkup(
      <SubscribeForm variant="footer" buttonText="Join now" placeholderText="Enter email" />
    );

    expect(html).toContain('aria-label="Email address"');
    expect(html).toContain('type="email"');
    expect(html).toContain('Join now');
  });

  it('keeps the app shell and search page labeled in source', () => {
    const pageWrapperSource = readSource('components', 'layout', 'PageWrapper', 'index.tsx');
    expect(pageWrapperSource).toContain('href="#main-content"');
    expect(pageWrapperSource).toContain('id="main-content"');
    expect(pageWrapperSource).toContain('Skip to main content');

    const headerSource = readSource('components', 'layout', 'Header', 'index.tsx');
    expect(headerSource).toContain('aria-label="Primary navigation"');
    expect(headerSource).toContain('aria-label="Search articles"');
    expect(headerSource).toContain('aria-label="Open search"');
    expect(headerSource).toContain('aria-label="Toggle dark mode"');
    expect(headerSource).toContain('aria-controls="mobile-nav-menu"');

    const searchSource = readSource('app', 'search', 'page.tsx');
    expect(searchSource).toContain('aria-label="Search articles"');
    expect(searchSource).toContain('Browse newsletter archive');
  });
});
