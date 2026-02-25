/**
 * record-demo.js — Playwright demo recorder for Refine Backlog
 * Records a walkthrough of the Vercel preview URL and saves frames to /tmp/demo-frames/
 *
 * Usage: PREVIEW_URL=https://xxx.vercel.app node .github/scripts/record-demo.js
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://refinebacklog.com';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/demo-frames';
const SAMPLE_STORY = 'As a product manager, I want to view sprint velocity charts so that I can track team performance over time';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function takeFrames(page, dir, count, intervalMs, startIdx) {
  let idx = startIdx;
  for (let i = 0; i < count; i++) {
    const filename = path.join(dir, `frame_${String(idx).padStart(4, '0')}.png`);
    await page.screenshot({ path: filename, fullPage: false });
    idx++;
    if (i < count - 1) await sleep(intervalMs);
  }
  return idx;
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Recording demo against: ${PREVIEW_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  let frameIdx = 1;

  // ── Step 1: Load homepage (3s, 6 frames)
  console.log('Step 1: Loading homepage...');
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(1000);
  frameIdx = await takeFrames(page, OUTPUT_DIR, 6, 500, frameIdx);

  // ── Step 2: Scroll to the tool / input area
  console.log('Step 2: Scrolling to tool area...');
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(500);
  frameIdx = await takeFrames(page, OUTPUT_DIR, 3, 400, frameIdx);

  // ── Step 3: Find the textarea and type
  console.log('Step 3: Typing sample story...');
  const inputSelectors = [
    'textarea',
    'input[type="text"]',
    '[placeholder*="story"]',
    '[placeholder*="paste"]',
    '[placeholder*="backlog"]',
    '[data-testid="story-input"]',
    '.story-input',
  ];

  let inputEl = null;
  for (const sel of inputSelectors) {
    try {
      inputEl = await page.locator(sel).first();
      await inputEl.waitFor({ timeout: 2000 });
      break;
    } catch {
      inputEl = null;
    }
  }

  if (inputEl) {
    await inputEl.click();
    await sleep(300);
    // Type character by character for a "live typing" effect
    for (const char of SAMPLE_STORY) {
      await page.keyboard.type(char);
      if (Math.random() < 0.15) {
        await page.screenshot({ path: path.join(OUTPUT_DIR, `frame_${String(frameIdx).padStart(4, '0')}.png`) });
        frameIdx++;
      }
    }
    await sleep(500);
    frameIdx = await takeFrames(page, OUTPUT_DIR, 4, 400, frameIdx);
  } else {
    console.log('Input not found — taking screenshot of current state');
    frameIdx = await takeFrames(page, OUTPUT_DIR, 4, 500, frameIdx);
  }

  // ── Step 4: Click the refine button
  console.log('Step 4: Clicking refine button...');
  const buttonSelectors = [
    'button:has-text("Refine")',
    'button:has-text("Submit")',
    'button:has-text("Generate")',
    'button[type="submit"]',
    '[data-testid="refine-btn"]',
  ];

  let clicked = false;
  for (const sel of buttonSelectors) {
    try {
      const btn = page.locator(sel).first();
      await btn.waitFor({ timeout: 1500 });
      await btn.click();
      clicked = true;
      console.log(`Clicked: ${sel}`);
      break;
    } catch {
      // try next
    }
  }

  if (!clicked) {
    console.log('Submit button not found — pressing Enter');
    await page.keyboard.press('Enter');
  }

  // ── Step 5: Wait for AI response (6s, 12 frames)
  console.log('Step 5: Waiting for AI response...');
  frameIdx = await takeFrames(page, OUTPUT_DIR, 12, 500, frameIdx);

  // ── Step 6: Scroll down to show output
  console.log('Step 6: Showing output...');
  await page.evaluate(() => window.scrollBy(0, 500));
  await sleep(500);
  frameIdx = await takeFrames(page, OUTPUT_DIR, 6, 500, frameIdx);

  // ── Step 7: Hold on result (3s, 6 frames)
  frameIdx = await takeFrames(page, OUTPUT_DIR, 6, 500, frameIdx);

  // ── Step 8: Scroll back to top
  console.log('Step 8: Scroll to top...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  frameIdx = await takeFrames(page, OUTPUT_DIR, 4, 400, frameIdx);

  await browser.close();
  console.log(`Done. ${frameIdx - 1} frames saved to ${OUTPUT_DIR}`);
})().catch(err => {
  console.error('Recording failed:', err.message);
  process.exit(1);
});
