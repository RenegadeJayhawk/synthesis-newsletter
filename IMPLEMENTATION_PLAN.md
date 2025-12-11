# Newsletter Layout Redesign - Implementation Plan

## Current State Analysis

### Files Involved
1. **`app/newsletter/page.tsx`** - Main newsletter page component
   - Currently renders newsletter content as markdown using ReactMarkdown
   - Displays content in a single prose block (text wall)
   - No article structure or thumbnails

2. **`lib/newsletterService.ts`** - Newsletter generation service
   - Generates markdown content using Gemini API
   - Returns raw markdown string in `content` field
   - No structured article data

3. **`lib/newsletterPrompt.json`** - AI prompt configuration
   - Defines the structure and format for generated newsletters
   - Currently outputs markdown format

### Current Data Flow
```
Gemini API → Markdown String → ReactMarkdown → Prose Block
```

### Target Data Flow
```
Gemini API → Markdown String → Parser → Article Objects → MSNOW-style Components → Rendered List
```

---

## Implementation Plan

### Phase 1: Data Structure & Parsing

**Create new types and interfaces:**

**File:** `types/newsletter.ts`
```typescript
export interface NewsletterArticle {
  id: string;
  title: string;
  summary: string;
  author?: string;
  date?: string;
  category?: string;
  sourceUrl?: string;
  imageUrl?: string;
  content?: string;
}

export interface ParsedNewsletter {
  id: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  overview: string;
  articles: NewsletterArticle[];
  generatedAt: string;
  model: string;
}
```

**Create parser utility:**

**File:** `lib/newsletterParser.ts`
- Parse markdown content into structured article objects
- Extract titles, summaries, and metadata from markdown sections
- Generate unique IDs for each article
- Handle different section formats

### Phase 2: MSNOW-Style Components

**Create article list components:**

**File:** `components/newsletter/NewsletterArticleList.tsx`
- Container component for article list
- Responsive grid layout
- Matches existing site styling

**File:** `components/newsletter/NewsletterArticleItem.tsx`
- Individual article card component
- Title, summary, author, thumbnail layout
- Hover states and interactions
- Responsive behavior (side-by-side on desktop, stacked on mobile)

**File:** `components/newsletter/NewsletterArticleItem.module.css` (or use Tailwind)
- MSNOW-inspired styling
- Consistent spacing and typography
- Dark mode support

### Phase 3: Image Sourcing & Generation

**Create image service:**

**File:** `lib/imageService.ts`
```typescript
export async function getArticleImage(
  title: string,
  summary: string,
  category?: string
): Promise<string>
```

**Implementation approach:**
1. **Search for existing images:**
   - Use Unsplash API or similar free image service
   - Build search query from article title + key terms
   - Filter for appropriate images

2. **Fallback to AI generation:**
   - If no suitable image found, use image generation
   - Generate contextually appropriate thumbnail
   - Use consistent style across generated images

3. **Caching:**
   - Store imageUrl in article data structure
   - Persist to prevent regeneration on re-renders

### Phase 4: Integration

**Update newsletter page:**

**File:** `app/newsletter/page.tsx`
- Import new components
- Parse newsletter content on load
- Pass article array to NewsletterArticleList
- Maintain existing header and refresh functionality

**Update newsletter service:**

**File:** `lib/newsletterService.ts`
- Add parsing step after content generation
- Return both raw content and parsed articles
- Update Newsletter interface

### Phase 5: Styling & Responsiveness

**Ensure consistency:**
- Use existing Tailwind classes and CSS variables
- Match site typography and color scheme
- Implement proper dark mode support
- Test on mobile, tablet, and desktop

**Responsive breakpoints:**
- Mobile (< 640px): Stacked layout
- Tablet (640px - 1024px): Optimized spacing
- Desktop (> 1024px): Full side-by-side layout

### Phase 6: Testing & Documentation

**Testing:**
- Test with existing newsletters
- Test with newly generated newsletters
- Verify image sourcing/generation
- Check responsive behavior
- Verify dark mode

**Documentation:**
- Update PROGRESS.md
- Update TODO.md with follow-up tasks
- Document image service usage
- Add component documentation

---

## File Structure

```
ai-newsletter/
├── app/
│   └── newsletter/
│       └── page.tsx (MODIFY)
├── components/
│   └── newsletter/ (NEW)
│       ├── NewsletterArticleList.tsx
│       ├── NewsletterArticleItem.tsx
│       └── NewsletterOverview.tsx (optional)
├── lib/
│   ├── newsletterService.ts (MODIFY)
│   ├── newsletterParser.ts (NEW)
│   └── imageService.ts (NEW)
├── types/
│   └── newsletter.ts (NEW)
└── docs/
    ├── PROGRESS.md (UPDATE)
    ├── TODO.md (UPDATE)
    └── DECISIONS.md (UPDATE)
```

---

## Technical Decisions

### 1. Parsing Strategy
**Decision:** Parse markdown sections into article objects using regex and markdown parsing libraries
**Rationale:** Newsletter content is already structured in markdown with clear section headers

### 2. Image Service
**Decision:** Use Unsplash API for search, fallback to local generation
**Rationale:** Free, high-quality images with proper licensing; AI generation as backup

### 3. Component Architecture
**Decision:** Separate list and item components
**Rationale:** Reusability, testability, and maintainability

### 4. Styling Approach
**Decision:** Use Tailwind CSS with scoped custom classes
**Rationale:** Matches existing project conventions, maintains consistency

### 5. Data Persistence
**Decision:** Store imageUrl in article data, cache in memory
**Rationale:** Prevents unnecessary API calls and regeneration

---

## Next Steps

1. ✅ Review current implementation
2. ✅ Analyze MSNOW design
3. ✅ Create implementation plan
4. ⏳ Create feature branch
5. ⏳ Implement data structures and parser
6. ⏳ Build MSNOW-style components
7. ⏳ Implement image service
8. ⏳ Integrate with newsletter page
9. ⏳ Test and refine
10. ⏳ Update documentation

---

## Estimated Effort

- **Phase 1:** 30 minutes
- **Phase 2:** 45 minutes
- **Phase 3:** 60 minutes
- **Phase 4:** 30 minutes
- **Phase 5:** 30 minutes
- **Phase 6:** 30 minutes

**Total:** ~3.5 hours
