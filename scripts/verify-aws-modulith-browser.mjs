import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { modulith, buildStory } from '../src/data/visual-companions/wave2-aws-modulith.mjs';

// PLAYWRIGHT_MODULE은 저장소 의존성을 추가하지 않고 설치된 검증 도구를 선택한다.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(process.env.VISUAL_OUTPUT || '/tmp/issue420-browser');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={ chromium:browser.version(), viewport:{width:1440,height:1080}, deviceScaleFactor:1, timezone:'UTC', reducedMotion:'reduce', captures:[], scenarios:0, mobile:[], errors:[] };
const context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:1,locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',colorScheme:'light'});
const page=await context.newPage();
page.on('pageerror',error=>report.errors.push(error.message));
const checksum=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
try {
  for(const locale of ['en','ko']){
    const prefix=locale==='ko'?'ko/':'';
    const url=process.env.VISUAL_BASE_URL ? `${process.env.VISUAL_BASE_URL}/${prefix}visual-companions/bluetape4k-aws/${modulith.slug}/` : pathToFileURL(resolve(root,`public/${prefix}visual-companions/bluetape4k-aws/${modulith.slug}/index.html`)).href;
    await page.goto(url);await page.locator('[data-workflow-ready="true"]').waitFor();await page.evaluate(()=>document.fonts.ready);
    const fonts=await page.evaluate(()=>({body:getComputedStyle(document.body).fontFamily,ready:document.fonts.status}));
    for(const theme of ['light','dark']){
      await page.locator(`[data-theme-button="${theme}"]`).click();
      const one=resolve(output,`${locale}.${theme}.png`),two=resolve(output,`${locale}.${theme}.repeat.png`);
      await page.screenshot({path:one,fullPage:true,animations:'disabled'});await page.screenshot({path:two,fullPage:true,animations:'disabled'});
      assert.equal(checksum(one),checksum(two),'Capture must be deterministic');
      report.captures.push({locale,theme,path:one,sha256:checksum(one),identical:true,fonts});
    }
    for(const path of modulith.paths){
      await page.locator(`button[data-path="${path.id}"]`).click();
      for(const scenario of modulith.scenarios){
        if(path.id==='direct'&&scenario.outboundOnly){assert.equal(await page.locator('option[value="publish"]').isDisabled(),true);continue;}
        await page.selectOption('#scenario',scenario.id);
        const expected=buildStory(path.id,scenario.id);
        for(let i=1;i<expected.ids.length;i++)await page.locator('[data-action="next"]').click();
        assert.equal(await page.locator('#modulith-explorer').getAttribute('data-terminal'),'true');
        assert.equal(await page.locator('#modulith-explorer').getAttribute('data-acknowledged'),String(expected.acknowledged));
        assert.equal(await page.locator('.step').count(),expected.ids.length);
        assert.equal(await page.locator('[data-action="next"]').isDisabled(),true);
        if(expected.failure)assert.equal(await page.locator('[data-code]').textContent(),expected.failure.code);
        await page.locator('[data-action="reset"]').click();assert.equal(await page.locator('#modulith-explorer').getAttribute('data-step'),'0');
        report.scenarios++;
      }
    }
    await page.locator('button[data-path="sqs"]').click();await page.selectOption('#scenario','publish');await page.locator('[data-action="play"]').click();
    await page.locator('#modulith-explorer[data-terminal="true"]').waitFor();
    assert.equal(await page.locator('[data-action="play"]').getAttribute('aria-pressed'),'false');
    await page.locator('button[data-path="direct"]').click();assert.equal(await page.locator('#scenario').inputValue(),'normal');
    await page.locator('[data-action="play"]').click();await page.locator('[data-action="play"]').click();assert.equal(await page.locator('[data-action="play"]').getAttribute('aria-pressed'),'false');
    await page.locator('[data-action="reset"]').click();
    await page.locator('.step').nth(1).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#modulith-explorer').getAttribute('data-step'),'1');
    assert.equal(await page.locator('.step[aria-current="step"]').evaluate(el=>el===document.activeElement),true);
    await page.locator('[data-theme-button="auto"]').click();assert.equal(await page.locator('html').getAttribute('data-theme'),null);
    await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(13, 23, 19)');await page.emulateMedia({colorScheme:'light'});
    for(const width of [390,768]){
      await page.setViewportSize({width,height:844});
      for(const theme of ['light','dark']){
        await page.locator(`[data-theme-button="${theme}"]`).click();
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,`${locale}/${width}/${theme} overflows`);
        report.mobile.push({locale,width,theme,overflow});
        if(width===390)await page.screenshot({path:resolve(output,`${locale}.${theme}.mobile.png`),fullPage:true,animations:'disabled'});
      }
    }
    await page.setViewportSize(report.viewport);
  }
  assert.deepEqual(report.errors,[]);report.passed=true;
} finally {await browser.close();writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
