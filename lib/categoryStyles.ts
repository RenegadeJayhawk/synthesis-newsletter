export function getCategoryColorClasses(category?: string): string {
  const normalized = (category ?? '').trim().toLowerCase();

  if (!normalized) {
    return 'bg-slate-100 text-slate-700 ring-slate-200';
  }

  if (normalized.includes('ai') || normalized.includes('intelligence') || normalized.includes('research')) {
    return 'bg-blue-100 text-blue-800 ring-blue-200';
  }

  if (normalized.includes('learn') || normalized.includes('model') || normalized.includes('data')) {
    return 'bg-violet-100 text-violet-800 ring-violet-200';
  }

  if (normalized.includes('robot') || normalized.includes('automation')) {
    return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
  }

  if (normalized.includes('ethic') || normalized.includes('societ') || normalized.includes('future')) {
    return 'bg-amber-100 text-amber-800 ring-amber-200';
  }

  if (normalized.includes('tool') || normalized.includes('open') || normalized.includes('dev')) {
    return 'bg-cyan-100 text-cyan-800 ring-cyan-200';
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200';
}
