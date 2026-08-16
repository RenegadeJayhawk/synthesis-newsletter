import { describe, expect, it } from 'vitest';
import { getCategoryColorClasses } from './categoryStyles';

describe('category styling', () => {
  it('returns recognizable palette classes for the main categories', () => {
    expect(getCategoryColorClasses('AI')).toContain('bg-blue-100');
    expect(getCategoryColorClasses('Machine Learning')).toContain('bg-violet-100');
    expect(getCategoryColorClasses('Robotics')).toContain('bg-emerald-100');
    expect(getCategoryColorClasses('Ethics')).toContain('bg-amber-100');
  });

  it('falls back to a neutral style for unknown categories', () => {
    expect(getCategoryColorClasses('Custom Topic')).toContain('bg-slate-100');
  });
});
