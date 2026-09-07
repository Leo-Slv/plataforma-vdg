/**
 * Positional mapping between the mockup's 4 swatches (in the order drawn)
 * and the backend's `AreaAccentColor` enum — the enum's member names
 * don't match the swatches' actual hues (see
 * Docs/specs/admin/area-form.md, "Open decisions"), so this maps by
 * position, not by trying to make the names line up.
 */
const ACCENT_COLOR_OPTIONS = [
	{ value: 'Blue', oklch: 'oklch(.62 .1 248)' },
	{ value: 'Orange', oklch: 'oklch(.65 .14 30)' },
	{ value: 'Green', oklch: 'oklch(.7 .13 145)' },
	{ value: 'Purple', oklch: 'oklch(.75 .13 85)' },
] as const;

type AccentColorValue = (typeof ACCENT_COLOR_OPTIONS)[number]['value'];

const DEFAULT_ACCENT_COLOR: AccentColorValue = 'Blue';

export { ACCENT_COLOR_OPTIONS, DEFAULT_ACCENT_COLOR };
export type { AccentColorValue };
