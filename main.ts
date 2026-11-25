// news-image-20261125 entry (Node 22, standard library only).
// The image is entry.png beside this file: a front page summing up the
// world's news of Wednesday 25 November 2026. The program copies it to
// /output/entry.png, byte for byte, so the judge sees exactly those bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { closeSync, copyFileSync, mkdirSync, openSync, readFileSync, readSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = join(here, 'entry.png');
const dst = join(out, 'entry.png');

// The file is named entry.png but may hold JPEG bytes (the rules tell
// PNG and JPEG apart by their first bytes), so accept either magic: the
// 8-byte PNG signature or the 3-byte JPEG start-of-image marker. Read
// the head and tail through a file descriptor, without loading the whole
// image into memory for the check.
const fd = openSync(src, 'r');
const head = Buffer.alloc(8);
readSync(fd, head, 0, 8, 0);
const size = statSync(src).size;
const tail = Buffer.alloc(12);
readSync(fd, tail, 0, 12, size - 12);
closeSync(fd);

const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
  && head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a;
const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
if (!isPng && !isJpeg) throw new Error('entry.png is neither PNG nor JPEG by its first bytes');

// A whole image, not a truncated one: a JPEG must end with its EOI
// marker (0xff 0xd9) and a PNG with its IEND chunk.
if (isJpeg && !(tail[10] === 0xff && tail[11] === 0xd9)) {
  throw new Error('entry.png is a truncated JPEG: no end-of-image marker');
}
if (isPng && !(tail[0] === 0x00 && tail[1] === 0x00 && tail[2] === 0x00 && tail[3] === 0x00
  && tail[4] === 0x49 && tail[5] === 0x45 && tail[6] === 0x4e && tail[7] === 0x44)) {
  throw new Error('entry.png is a truncated PNG: no IEND chunk');
}

mkdirSync(out, { recursive: true });
copyFileSync(src, dst);

// Verify the copy is byte-identical, so the judge sees exactly the
// bytes this program was given.
if (!readFileSync(src).equals(readFileSync(dst))) {
  throw new Error('copy mismatch: /output/entry.png differs from entry.png');
}
console.log(`copied entry.png (${isPng ? 'PNG' : 'JPEG'}, ${size} bytes) to ${dst}`);
