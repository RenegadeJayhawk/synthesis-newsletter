import { describe, it, expect } from 'vitest';
import { parseNewsletter } from './newsletterParser';
import { Newsletter } from './newsletterService';

describe('newsletterParser', () => {
  const baseNewsletter: Newsletter = {
    id: 'test-newsletter-id',
    title: 'AI & GenAI Weekly Summary (June 1, 2026 - June 8, 2026)',
    weekStart: 'June 1, 2026',
    weekEnd: 'June 8, 2026',
    content: '',
    generatedAt: new Date().toISOString(),
    model: 'gemini-2.0-flash-exp',
  };

  it('should parse markdown header format successfully', () => {
    const content = `
# AI & GenAI Weekly: June 1, 2026 - June 8, 2026

## 1. Overview
Welcome to this week's newsletter. We highlight breakthroughs.

## 2. Major Breakthroughs & Research
* **Gemini 2.5 Architecture (Google AI Blog):** DeepMind shares architectural insights on mixture-of-experts model routing protocols.
* **Liquid Neural Networks (MIT Technology Review):** MIT researchers showcase continuous-time neural networks.

## 3. Open Source Developments
* **Llama-edge (GitHub):** Meta releases compressed models optimized specifically for mobile.
    `.trim();

    const result = parseNewsletter({ ...baseNewsletter, content });

    expect(result.id).toBe(baseNewsletter.id);
    expect(result.overview).toBe("Welcome to this week's newsletter. We highlight breakthroughs.");
    expect(result.articles).toHaveLength(3);

    // Article 1
    expect(result.articles[0].title).toBe("Gemini 2.5 Architecture");
    expect(result.articles[0].category).toBe("Major Breakthroughs & Research");
    expect(result.articles[0].author).toBe("Google AI Blog");
    expect(result.articles[0].metadata?.organization).toBe("Google AI Blog");
    expect(result.articles[0].summary).toContain("DeepMind shares architectural insights");

    // Article 3
    expect(result.articles[2].title).toBe("Llama-edge");
    expect(result.articles[2].category).toBe("Open Source Developments");
    expect(result.articles[2].author).toBe("GitHub");
    expect(result.articles[2].metadata?.organization).toBe("GitHub");
    expect(result.articles[2].summary).toContain("Meta releases compressed models");
  });

  it('should parse bold header format successfully', () => {
    const content = `
# AI & GenAI Weekly: June 1, 2026 - June 8, 2026

**1. Overview**
Welcome to this week's newsletter. We highlight breakthroughs.

**2. Major Breakthroughs & Research**
* **Gemini 2.5 Architecture (Google AI Blog):** DeepMind shares architectural insights.

**3. Open Source Developments**
* **Llama-edge (GitHub):** Meta releases compressed models.
    `.trim();

    const result = parseNewsletter({ ...baseNewsletter, content });

    expect(result.id).toBe(baseNewsletter.id);
    expect(result.overview).toBe("Welcome to this week's newsletter. We highlight breakthroughs.");
    expect(result.articles).toHaveLength(2);

    expect(result.articles[0].title).toBe("Gemini 2.5 Architecture");
    expect(result.articles[1].title).toBe("Llama-edge");
  });
});
