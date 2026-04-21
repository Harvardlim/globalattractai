/**
 * Format selected_options for display.
 * Supports both single object { key: value } and bundle array [{ key: value }, ...]
 */
export function formatSelectedOptions(opts: any): string {
  if (!opts) return '';
  if (Array.isArray(opts)) {
    return opts
      .map((set, i) => `第${i + 1}件: ${Object.entries(set).map(([k, v]) => `${k}: ${v}`).join(' · ')}`)
      .join(' | ');
  }
  if (typeof opts === 'object' && Object.keys(opts).length > 0) {
    return Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(' · ');
  }
  return '';
}

export function hasSelectedOptions(opts: any): boolean {
  if (!opts) return false;
  if (Array.isArray(opts)) return opts.length > 0;
  return typeof opts === 'object' && Object.keys(opts).length > 0;
}
