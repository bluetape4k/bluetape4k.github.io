import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { tenant, buildStory } from '../src/data/visual-companions/wave2-tenant-context.mjs';

// 설치된 Playwright를 사용하며 저장소 의존성을 변경하지 않는다.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(import.meta.dirname, '..');
const output = resolve(process.env.VISUAL_OUTPUT || '/tmp/issue421-browser');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { chromium: browser.version(), viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1, locale: 'en-US', timezone: 'UTC', reducedMotion: 'reduce', captures: [], scenarios: 0, mobile: [], errors: [] };
const context = await browser.newContext({ viewport: report.viewport, deviceScaleFactor: 1, locale: report.locale, timezoneId: 'UTC', reducedMotion: 'reduce', colorScheme: 'light' });
const page = await context.newPage();
page.on('pageerror', (error) => report.errors.push(error.message));
const checksum = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
try {
  for (const locale of ['en', 'ko']) {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const route = `${prefix}visual-companions/${tenant.repository}/${tenant.slug}/`;
    const url = process.env.VISUAL_BASE_URL ? `${process.env.VISUAL_BASE_URL}/${route}` : pathToFileURL(resolve(root, `public/${route}index.html`)).href;
    await page.goto(url);
    const explorer = page.locator('#tenant-explorer');
    await page.locator('[data-workflow-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(/\bundefined\b/i.test(await page.locator('body').innerText()), false, 'All reader-facing labels are defined');
    const fonts = await page.evaluate(() => ({ family: getComputedStyle(document.body).fontFamily, status: document.fonts.status }));
    for (const theme of ['light', 'dark']) {
      await page.locator(`[data-theme-button="${theme}"]`).click();
      await page.evaluate(() => scrollTo(0, 0));
      const one = resolve(output, `${locale}.${theme}.png`), two = resolve(output, `${locale}.${theme}.repeat.png`);
      await page.screenshot({ path: one, fullPage: true, animations: 'disabled' });
      await page.screenshot({ path: two, fullPage: true, animations: 'disabled' });
      assert.equal(checksum(one), checksum(two), 'Deterministic capture');
      report.captures.push({ locale, theme, path: one, sha256: checksum(one), identical: true, fonts });
    }
    for (const carrier of tenant.carriers) {
      await page.locator(`button[data-carrier="${carrier.id}"]`).click();
      for (const scenario of tenant.scenarios) {
        await page.selectOption('#scenario', scenario.id);
        const expected = buildStory(carrier.id, scenario.id);
        for (let step = 1; step < expected.steps.length; step++) await page.locator('[data-action="next"]').click();
        assert.equal(await explorer.getAttribute('data-terminal'), 'true');
        assert.equal(await explorer.getAttribute('data-status'), expected.status);
        assert.equal(await explorer.getAttribute('data-after'), expected.after);
        assert.equal(await page.locator('.step').count(), expected.steps.length);
        assert.equal(await page.locator('[data-action="next"]').isDisabled(), true);
        await page.locator('[data-action="reset"]').click();
        assert.equal(await explorer.getAttribute('data-step'), '0');
        report.scenarios++;
      }
    }
    await page.locator('button[data-carrier="threadlocal"]').click();
    await page.selectOption('#scenario', 'normal');
    await page.locator('.step').nth(1).focus();
    await page.keyboard.press('Enter');
    assert.equal(await explorer.getAttribute('data-step'), '1');
    assert.equal(await page.locator('.step[aria-current="step"]').evaluate((el) => el === document.activeElement), true);
    await page.locator('[data-action="reset"]').click();
    await page.locator('[data-action="play"]').click();
    await page.locator('[data-action="play"]').click();
    assert.equal(await page.locator('[data-action="play"]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-action="play"]').click();
    await page.locator('#tenant-explorer[data-terminal="true"]').waitFor({ timeout: 20000 });
    assert.equal(await page.locator('[data-action="play"]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-action="reset"]').click();
    await page.locator('[data-theme-button="auto"]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), null);
    await page.emulateMedia({ colorScheme: 'light' });
    const light = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.emulateMedia({ colorScheme: 'dark' });
    const dark = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.notEqual(light, dark);
    await page.emulateMedia({ colorScheme: 'light' });
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const theme of ['light', 'dark']) {
        await page.locator(`[data-theme-button="${theme}"]`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${locale}/${width}/${theme} overflow`);
        report.mobile.push({ locale, width, theme, overflow: false });
        if (width === 390) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: resolve(output, `${locale}.${theme}.mobile.png`), fullPage: true, animations: 'disabled' });
        }
      }
    }
    await page.setViewportSize(report.viewport);
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} finally {
  await browser.close();
  writeFileSync(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
