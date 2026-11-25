// news-image-20261125 entry (Node 22, standard library only).
// Copies entry.png — a front page summing up the world's news of
// Wednesday 25 November 2026 — into the output directory, byte for
// byte, so the grader sees exactly the submitted image.
//
// Usage:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Without MAKEFUN_OUTPUT_DIR the image goes to /output/entry.png.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const source = join(scriptDir, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const target = join(outputDir, 'entry.png');

// The entry must exist and be a real JPEG before anything is copied:
// a JPEG starts with the bytes FF D8 FF. Anything else is a missing or
// corrupt image, and copying it would hand the grader bad bytes.
let header;
try {
  header = readFileSync(source, { flag: 'r' }).subarray(0, 3);
} catch {
  console.error(`error: entry image not found at ${source}`);
  process.exit(1);
}
if (header.length < 3 || header[0] !== 0xff || header[1] !== 0xd8 || header[2] !== 0xff) {
  console.error(`error: ${source} is not a JPEG (expected magic bytes FF D8 FF)`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, target);

// Confirm the copy is byte-identical to the source image.
const original = readFileSync(source);
const copied = readFileSync(target);
if (!original.equals(copied)) {
  throw new Error(`copy mismatch: ${target} differs from ${source}`);
}

console.log(`copied entry.png (${original.length} bytes) to ${target}`);
