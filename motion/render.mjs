// Renders motion/kurs-video.html frame by frame into the course film.
//
//   npm install --prefix motion      (once: playwright-core + three, uses the installed Google Chrome)
//   node motion/render.mjs
//
// Output: motion/out/kurs-video-master.mp4 (1920×1080 master, not deployed) and for the site
//         assets/kurs-video.mp4 (1600×900), assets/kurs-video-mobile.mp4 (960×540),
//         assets/kurs-video-poster.webp. Needs ffmpeg on PATH.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30, DURATION = 34, POSTER_AT = 32.4;
const MASTER = path.join(ROOT, 'motion', 'out', 'kurs-video-master.mp4');
// Web versions sized to the tile they play in (≈1400 px on desktop, ≈370 px on phones).
const WEB = [
  { file: path.join(ROOT, 'assets', 'kurs-video.mp4'), width: 1600, crf: 28 },
  { file: path.join(ROOT, 'assets', 'kurs-video-mobile.mp4'), width: 960, crf: 28 },
];
const POSTER = path.join(ROOT, 'assets', 'kurs-video-poster.webp');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };

function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function ffmpeg(args) {
  const proc = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = once(proc, 'exit').then(([code]) => { if (code) throw new Error('ffmpeg exited with ' + code); });
  return { stdin: proc.stdin, done };
}

fs.mkdirSync(path.dirname(MASTER), { recursive: true });
const server = await serve();
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/motion/kurs-video.html?render`);
  await page.waitForFunction(() => window.__ready);
  await page.evaluate(() => window.__ready);
  const stage = page.locator('#stage');

  const master = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-an', MASTER]);
  const frames = FPS * DURATION;
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.__render(t), f / FPS);
    if (!master.stdin.write(await stage.screenshot({ type: 'png' }))) await once(master.stdin, 'drain');
    if (f % FPS === 0) process.stdout.write(`\r${f / FPS}s / ${DURATION}s`);
  }
  master.stdin.end();
  await master.done;

  await page.evaluate(t => window.__render(t), POSTER_AT);
  const poster = ffmpeg(['-f', 'png_pipe', '-i', '-', '-vf', 'scale=1280:-2', '-c:v', 'libwebp', '-quality', '80', POSTER]);
  poster.stdin.end(await stage.screenshot({ type: 'png' }));
  await poster.done;

  for (const { file, width, crf } of WEB) {
    await ffmpeg(['-i', MASTER, '-vf', `scale=${width}:-2:flags=lanczos`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', file]).done;
  }

  for (const f of [MASTER, ...WEB.map(w => w.file), POSTER]) console.log(`\n${path.relative(ROOT, f)}  ${(fs.statSync(f).size / 1024).toFixed(0)} KB`);
} finally {
  await browser.close();
  server.close();
}
