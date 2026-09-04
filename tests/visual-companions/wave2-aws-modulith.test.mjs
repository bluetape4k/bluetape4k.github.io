import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { modulith, buildStory } from '../../src/data/visual-companions/wave2-aws-modulith.mjs';

test('DIRECT starts at SQS source verification, and never invents a third publisher', () => {
  assert.equal(buildStory('direct','normal').ids[0],'source');
  assert.throws(()=>buildStory('direct','publish'),RangeError);
  for(const path of ['sqs','sns']) assert.deepEqual(buildStory(path,'normal').ids.slice(0,2),['encode','publish']);
});

test('completed duplicates bypass dispatch but still acknowledge', () => {
  for(const {id:path} of modulith.paths){
    const value=buildStory(path,'duplicate');
    assert.equal(value.ids.includes('dispatch'),false);assert.equal(value.ids.includes('complete'),false);
    assert.equal(value.ids.at(-1),'ack');assert.equal(value.acknowledged,true);assert.equal(value.claimCompleted,true);
  }
});

test('source and envelope failures never claim; claim/handler failures cannot acknowledge', () => {
  for(const {id:path} of modulith.paths){
    for(const [scenario,last] of [['source','source'],['version','decode'],['busy','claim'],['handler','dispatch'],['cancel','dispatch'],['claim','complete']]){
      const story=buildStory(path,scenario);assert.equal(story.ids.at(-1),last);
      assert.equal(story.acknowledged,false);assert.equal(story.ids.includes('ack'),false);
      if(['source','version'].includes(scenario))assert.equal(story.ids.includes('claim'),false);
    }
    const ack=buildStory(path,'ack');assert.equal(ack.claimCompleted,true);assert.equal(ack.acknowledged,false);
  }
});

test('all allowed path/scenario combinations are finite, valid and locale-equivalent', () => {
  let count=0;
  for(const path of modulith.paths)for(const scenario of modulith.scenarios){
    if(path.id==='direct'&&scenario.outboundOnly)continue;
    const story=buildStory(path.id,scenario.id);count++;
    assert.ok(story.ids.length>0);assert.equal(new Set(story.ids).size,story.ids.length);
    for(const id of story.ids){assert.ok(modulith.phases[id]);for(const locale of ['en','ko']){assert.ok(modulith.phases[id].label[locale]);assert.ok(modulith.phases[id].text[locale]);}}
    if(story.failure)assert.equal(story.ids.at(-1),story.failure.at);
  }
  assert.equal(count,29);
  assert.throws(()=>buildStory('other','normal'),RangeError);assert.throws(()=>buildStory('sqs','other'),RangeError);
});

test('generated companions contain runnable offline scripts and both locale routes', () => {
  execFileSync(process.execPath,['scripts/generate-2-0-wave2-aws-modulith.mjs','--check']);
  execFileSync(process.execPath,['scripts/generate-2-0-wave2-aws-modulith-visuals.mjs','--check']);
  for(const locale of ['en','ko']){
    const prefix=locale==='ko'?'ko/':'';
    const html=readFileSync(`public/${prefix}visual-companions/bluetape4k-aws/${modulith.slug}/index.html`,'utf8');
    assert.match(html,new RegExp(`<html lang="${locale}">`));assert.match(html,/workflowReady/);
    assert.equal((html.match(/data-path="/g)||[]).length,3);assert.equal((html.match(/data-theme-button="/g)||[]).length,3);
    assert.match(html,/prefers-reduced-motion/);assert.match(html,/aria-live="polite"/);
    assert.doesNotMatch(html,/\b(?:fetch|WebSocket|XMLHttpRequest)\s*\(/);
    for(const [,script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script);
    for(const ext of ['svg','png'])assert.ok(existsSync(`public/assets/visual-companions/wave2/${modulith.slug}-${locale}.${ext}`));
  }
});
