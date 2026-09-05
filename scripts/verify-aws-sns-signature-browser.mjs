import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  awsSnsSignatureCompanion as companion,
  buildSnsVerificationStory,
} from '../src/data/visual-companions/wave2-aws-sns-signature.mjs';

// Use an installed Playwright module without adding a repository dependency.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(import.meta.dirname, '..');
const output = resolve(process.env.VISUAL_OUTPUT || '/tmp/issue422-browser');
mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  chromium: browser.version(),
  viewport: { width: 1440, height: 1080 },
  deviceScaleFactor: 1,
  locale: 'en-US',
  timezone: 'UTC',
  reducedMotion: 'reduce',
  captures: [],
  scenarios: 0,
  mobile: [],
  errors: [],
};
const context = await browser.newContext({
  viewport: report.viewport,
  deviceScaleFactor: 1,
  locale: report.locale,
  timezoneId: report.timezone,
  reducedMotion: report.reducedMotion,
  colorScheme: 'light',
});
const page = await context.newPage();
page.on('pageerror', (error) => report.errors.push(error.message));
const checksum = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

try {
  for (const locale of ['en', 'ko']) {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const route = `${prefix}visual-companions/${companion.repository}/${companion.slug}/`;
    const url = process.env.VISUAL_BASE_URL
      ? `${process.env.VISUAL_BASE_URL.replace(/\/$/, '')}/${route}`
      : pathToFileURL(resolve(root, `public/${route}index.html`)).href;
    await page.goto(url);
    const explorer = page.locator('#bt4k-issue-422');
    await page.locator('[data-workflow-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(/\bundefined\b/i.test(await page.locator('body').innerText()), false, 'All reader-facing labels are defined');
    const fonts = await page.evaluate(() => ({
      family: getComputedStyle(document.body).fontFamily,
      status: document.fonts.status,
    }));

    for (const theme of ['light', 'dark']) {
      await page.locator(`[data-theme-button="${theme}"]`).click();
      await page.evaluate(() => scrollTo(0, 0));
      const one = resolve(output, `${locale}.${theme}.png`);
      const two = resolve(output, `${locale}.${theme}.repeat.png`);
      await page.screenshot({ path: one, fullPage: true, animations: 'disabled' });
      await page.screenshot({ path: two, fullPage: true, animations: 'disabled' });
      assert.equal(checksum(one), checksum(two), `${locale}/${theme} capture is deterministic`);
      report.captures.push({ locale, theme, path: one, sha256: checksum(one), identical: true, fonts });
    }

    for (const scenario of companion.scenarios) {
      await page.locator(`[data-scenario-button="${scenario.id}"]`).click();
      const expected = buildSnsVerificationStory(scenario.id);
      for (let step = 1; step < expected.ids.length; step += 1) {
        await page.locator('[data-action="next"]').click();
      }
      assert.equal(await explorer.getAttribute('data-terminal'), 'true');
      assert.equal(await explorer.getAttribute('data-status'), expected.failClosed ? 'FAILED' : 'VERIFIED');
      assert.equal(await page.locator('[data-action="next"]').isDisabled(), true);
      assert.equal(await page.locator('.message-row.is-failed').count(), expected.failClosed ? 1 : 0);
      assert.equal(await page.locator('.message-row.is-done').count(), expected.ids.length - 1);
      if (scenario.id === 'valid-v1') assert.match(await page.locator('[data-step-index="7"]').getAttribute('class'), /is-muted/);
      if (scenario.id === 'valid-v2') assert.match(await page.locator('[data-step-index="6"]').getAttribute('class'), /is-muted/);
      await page.locator('[data-action="reset"]').click();
      assert.equal(await explorer.getAttribute('data-step'), '0');
      report.scenarios += 1;
    }

    await page.locator('[data-scenario-button="valid-v1"]').click();
    await page.locator('[data-step-button="1"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await explorer.getAttribute('data-step'), '1');
    assert.equal(
      await page.locator('[data-step-button="1"]').evaluate((element) => element === document.activeElement),
      true,
      'Step selection preserves keyboard focus',
    );
    await page.keyboard.press('End');
    assert.equal(await explorer.getAttribute('data-terminal'), 'true');

    await page.locator('[data-action="reset"]').click();
    await page.locator('[data-action="play"]').click();
    await page.locator('[data-action="play"]').click();
    assert.equal(await page.locator('[data-action="play"]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-action="play"]').click();
    await page.locator('#bt4k-issue-422[data-terminal="true"]').waitFor({ timeout: 20_000 });
    assert.equal(await page.locator('[data-action="play"]').getAttribute('aria-pressed'), 'false');

    await page.locator('[data-action="reset"]').click();
    await page.locator('[data-theme-button="auto"]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), null);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => matchMedia('(prefers-color-scheme: light)').matches);
    const light = await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--bg'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => !matchMedia('(prefers-color-scheme: light)').matches);
    const dark = await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--bg'));
    assert.notEqual(light, dark);
    await page.emulateMedia({ colorScheme: 'light' });

    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      if (width === 390) await page.locator('[data-scroll-hint]').waitFor({ state: 'visible' });
      for (const theme of ['light', 'dark']) {
        await page.locator(`[data-theme-button="${theme}"]`).click();
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
          `${locale}/${width}/${theme} has no document overflow`,
        );
        report.mobile.push({ locale, width, theme, overflow: false });
        if (width === 390 && ((locale === 'en' && theme === 'light') || (locale === 'ko' && theme === 'dark'))) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({
            path: resolve(output, `${locale}.${theme}.mobile.png`),
            fullPage: true,
            animations: 'disabled',
          });
        }
      }
    }
    await page.setViewportSize(report.viewport);
  }

  assert.deepEqual(report.errors, []);
  report.passed = true;
} finally {
  await browser.close();
  writeFileSync(resolve(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));
