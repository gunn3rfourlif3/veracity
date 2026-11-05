import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Scan pipeline.
 *
 * The normalisation step below is REAL and runs on device: every intake source
 * funnels through it, the image is downscaled and stripped to pixels, and only
 * the derived value would ever leave the phone. This is the hash-only retention
 * position — no original image, no face embedding.
 *
 * The provider lookups are FIXTURES. Reverse-image-search and the cross-user
 * corpus need provider accounts and a backend that does not exist yet. They are
 * marked `stub: true` so nothing in the UI can present them as a real finding.
 */

export type CheckStatus = 'clear' | 'caution' | 'unknown';

export type Check = {
  label: string;
  value: string;
  status: CheckStatus;
  stub?: boolean;
};

export type ScanResult = {
  checks: Check[];
  heavilyFiltered: boolean;
  fingerprint: string;
  normalisedAt: number;
};

/** Downscale + greyscale, then discard. The only thing kept is a derived value. */
async function normalise(uri: string) {
  const ctx = ImageManipulator.ImageManipulator.manipulate(uri)
    .resize({ width: 256 });
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });
  return out.base64 ?? '';
}

/**
 * Structure-first fingerprint over the normalised bytes.
 *
 * NOTE: this is a placeholder digest, not a perceptual hash. It is stable for a
 * given image but it is NOT filter-invariant and will not match a re-encoded or
 * cropped copy. A real pHash needs raw pixel access (a native module or a
 * server-side step) — see the Filtered photos section of the plan doc. Keeping a
 * placeholder here means the retention shape is right while the matching maths
 * is still to come.
 */
function digest(b64: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < b64.length; i++) {
    const ch = b64.charCodeAt(i);
    h1 = (h1 ^ ch) * 16777619 >>> 0;
    h2 = (h2 + ch * (i % 31 + 1)) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0'));
}

/**
 * Filtered-photo heuristic.
 *
 * Real version inspects the luma histogram for the clipping and tonal
 * compression that filters leave behind. This stand-in keys off JPEG
 * compressibility, which correlates weakly with heavy smoothing — enough to
 * exercise the UI state, not enough to trust.
 */
function looksHeavilyFiltered(b64: string): boolean {
  return b64.length > 0 && b64.length < 9000;
}

export async function runScan(uri: string): Promise<ScanResult> {
  const b64 = await normalise(uri);
  const fingerprint = digest(b64);
  const heavilyFiltered = looksHeavilyFiltered(b64);

  // Fixture provider results — replace with the real calls once keys exist.
  await new Promise((r) => setTimeout(r, 1400));

  const checks: Check[] = [
    { label: 'Photo found elsewhere online', value: '0 matches', status: 'clear', stub: true },
    { label: 'Known scam-script patterns', value: 'None', status: 'clear', stub: true },
    { label: 'Reports from other users', value: 'None', status: 'clear', stub: true },
  ];

  if (heavilyFiltered) {
    checks.push({ label: 'Image processing', value: 'Heavily filtered', status: 'caution' });
  }

  checks.push({ label: 'Account age', value: 'Unknown', status: 'unknown', stub: true });

  return { checks, heavilyFiltered, fingerprint, normalisedAt: Date.now() };
}

const GESTURES = [
  'Hold up three fingers next to your left ear.',
  'Touch your right eyebrow with your left thumb.',
  'Hold up two fingers under your chin.',
  'Place your palm flat against your left cheek.',
  'Hold up four fingers beside your right temple.',
  'Make a thumbs-down next to your left shoulder.',
];

export function randomGesture(): string {
  return GESTURES[Math.floor(Math.random() * GESTURES.length)];
}
