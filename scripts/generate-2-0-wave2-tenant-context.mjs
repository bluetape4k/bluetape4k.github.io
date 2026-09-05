import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildStory, tenant } from '../src/data/visual-companions/wave2-tenant-context.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const js = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function emit(path, content) {
  const target = resolve(root, path);
  if (check) {
    if (readFileSync(target, 'utf8') !== content) throw new Error(`Stale generated file: ${path}`);
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

const copy = {
  en: {
    catalog: 'bluetape4k / bluetape4k-projects', manual: 'Open manual', language: '한국어',
    explore: 'Explore the carrier boundary', exploreText: 'Choose a carrier and replay six scenarios: what is visible, who owns it, and what remains after the boundary.',
    carrier: 'Carrier', scenario: 'Scenario', current: 'Current step', visible: 'Visible tenant', owner: 'Context owner', install: 'Binding', read: 'Read', after: 'After the boundary', outcome: 'Outcome', pending: 'In progress', play: 'Play', pause: 'Pause', reset: 'Reset', next: 'Next step', progress: 'Progress', compare: 'Compare the ownership contract', responsibilities: 'Caller responsibilities', source: 'Pinned source', diagram: 'Static overview', issue: 'Issue #421', keyboard: 'Keyboard: tab to a step and press Enter to inspect it.', nojs: 'JavaScript is required for the explorer.', unsupported: 'Boundary needs an explicit transport.',
  },
  ko: {
    catalog: 'bluetape4k / bluetape4k-projects', manual: '매뉴얼 열기', language: 'English',
    explore: 'carrier 경계 탐색', exploreText: 'carrier를 고르고 여섯 가지 상황을 재생합니다. 무엇이 보이는지, 누가 소유하는지, 경계 뒤에 무엇이 남는지 확인합니다.',
    carrier: 'Carrier', scenario: '상황', current: '현재 단계', visible: '현재 보이는 값', owner: 'Context 소유 범위', install: 'Binding', read: '조회', after: '경계 이후', outcome: '결과', pending: '진행 중', play: '재생', pause: '일시정지', reset: '처음으로', next: '다음 단계', progress: '진행률', compare: '소유 계약 비교', responsibilities: 'Caller 책임', source: '고정한 원본', diagram: '정적 개요', issue: '이슈 #421', keyboard: '키보드: 단계에 Tab으로 이동하고 Enter를 눌러 살펴보세요.', nojs: '탐색기를 사용하려면 JavaScript가 필요합니다.', unsupported: '경계에서는 명시적인 전달이 필요합니다.',
  },
};

function modelFor(locale) {
  const t = (value) => typeof value === 'string' ? value : value[locale];
  return {
    carriers: tenant.carriers.map((carrier) => ({
      id: carrier.id,
      label: carrier.label,
      owner: t(carrier.owner),
      install: t(carrier.install),
      read: t(carrier.read),
      cleanup: t(carrier.cleanup),
      boundary: t(carrier.boundary),
    })),
    scenarios: tenant.scenarios.map((scenario) => ({ id: scenario.id, label: t(scenario.label) })),
    stories: Object.fromEntries(tenant.carriers.map((carrier) => [
      carrier.id,
      Object.fromEntries(tenant.scenarios.map((scenario) => {
        const story = buildStory(carrier.id, scenario.id);
        return [scenario.id, {
          ...story,
          steps: story.steps.map((item) => ({ ...item, title: t(item.title), text: t(item.text) })),
          outcome: t(story.outcome),
        }];
      })),
    ])),
  };
}

for (const locale of ['en', 'ko']) {
  const t = (value) => typeof value === 'string' ? value : value[locale];
  const c = copy[locale];
  const model = modelFor(locale);
  const prefix = locale === 'ko' ? '/ko' : '';
  const route = `/visual-companions/${tenant.repository}/${tenant.slug}/`;
  const other = locale === 'ko' ? '' : '/ko';
  const manual = `${prefix}/manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant/`;
  const asset = `/assets/visual-companions/wave2/${tenant.slug}-${locale}`;
  const typography = locale === 'ko'
    ? { body: "'goorm Sans', system-ui, sans-serif", heading: "'goorm Sans', system-ui, sans-serif", code: "'goorm Sans Code', 'SFMono-Regular', ui-monospace, monospace" }
    : { body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', heading: "'Architects Daughter', system-ui, sans-serif", code: "'Comic Mono', 'SFMono-Regular', ui-monospace, monospace" };
  const first = model.carriers[0];
  const firstStory = model.stories[first.id].normal;
  const body = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t(tenant.title))}</title>
<style>
 :root{color-scheme:light;--bg:#f4f7f4;--surface:#fff;--surface-soft:#e6f2ed;--line:#c7d7cf;--ink:#20332c;--muted:#5c7067;--accent:#08776a;--accent-strong:#075c53;--danger:#aa4d42;--shadow:0 18px 42px rgba(26,72,57,.09);--font-body:${typography.body};--font-heading:${typography.heading};--font-code:${typography.code};font-family:var(--font-body)}
html[data-theme="dark"]{color-scheme:dark;--bg:#111a17;--surface:#1b2924;--surface-soft:#213d35;--line:#3b5a4d;--ink:#eef7f1;--muted:#b7cec2;--accent:#65d6bc;--accent-strong:#8be4ce;--danger:#f18d7e;--shadow:0 18px 42px rgba(0,0,0,.26)}
@media(prefers-color-scheme:dark){html:not([data-theme="light"]){color-scheme:dark;--bg:#111a17;--surface:#1b2924;--surface-soft:#213d35;--line:#3b5a4d;--ink:#eef7f1;--muted:#b7cec2;--accent:#65d6bc;--accent-strong:#8be4ce;--danger:#f18d7e;--shadow:0 18px 42px rgba(0,0,0,.26)}}
*{box-sizing:border-box}html{scroll-behavior:smooth}html[lang="ko"] body{word-break:keep-all}body{margin:0;background:var(--bg);color:var(--ink);line-height:1.55}a{color:var(--accent);text-underline-offset:3px}.shell{width:min(1180px,calc(100% - 2rem));margin-inline:auto}.topbar{position:sticky;top:0;z-index:2;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(14px)}.topbar .shell{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:4.2rem}.brand{font-family:var(--font-heading);font-size:1.15rem;font-weight:700;text-decoration:none;color:var(--ink)}.actions{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;justify-content:flex-end}.actions>a{font-size:.83rem}.theme{display:flex;gap:.2rem;margin-left:.3rem}.btn,.theme button{min-height:2.25rem;padding:.42rem .72rem;border:1px solid var(--line);border-radius:.55rem;background:var(--surface);color:var(--ink);cursor:pointer;font:inherit;font-size:.84rem}.btn:hover,.btn:focus-visible,.theme button:hover,.theme button:focus-visible{border-color:var(--accent);outline:3px solid color-mix(in srgb,var(--accent) 22%,transparent);outline-offset:1px}.theme button[aria-pressed="true"],.carrier-button[aria-pressed="true"]{border-color:var(--accent);background:var(--surface-soft);color:var(--accent-strong)}main{padding-bottom:4rem}.hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:2rem;align-items:end;padding:5.5rem 0 3rem}.eyebrow,.label{margin:0;color:var(--accent);font:700 .72rem/1.2 var(--font-code);letter-spacing:.08em;text-transform:uppercase}.hero h1{max-width:820px;margin:.8rem 0 1rem;font-family:var(--font-heading);font-size:clamp(2.8rem,7vw,5.8rem);line-height:.98;letter-spacing:-.03em}.hero .lead{max-width:760px;margin:0;color:var(--muted);font-size:clamp(1rem,1.8vw,1.3rem)}.invariant{padding:1.1rem 1.25rem;border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:.9rem;background:var(--surface);box-shadow:var(--shadow)}.invariant strong{display:block;color:var(--accent-strong);font-size:1.1rem}.invariant p{margin:.45rem 0 0;color:var(--muted);font-size:.9rem}.band{padding:3.2rem 0;border-top:1px solid var(--line)}.section-head{display:flex;align-items:end;justify-content:space-between;gap:1rem;margin-bottom:1.4rem}.section-head h2{margin:0;font-family:var(--font-heading);font-size:clamp(2rem,4vw,3.1rem);line-height:1}.section-head p{max-width:610px;margin:0;color:var(--muted);font-size:.96rem}.explorer{padding:1.25rem;border:1px solid var(--line);border-radius:1rem;background:var(--surface);box-shadow:var(--shadow)}.selectors{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:1rem;padding-bottom:1.2rem;border-bottom:1px solid var(--line)}.carrier-buttons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.45rem;margin-top:.55rem}.carrier-button{min-height:3rem;text-align:left;font-weight:650}.scenario-wrap{display:grid;align-content:start;gap:.55rem}.scenario-wrap select{width:100%;min-height:2.7rem;padding:.4rem .55rem;border:1px solid var(--line);border-radius:.55rem;background:var(--surface);color:var(--ink);font:inherit}.route-copy{display:grid;gap:.25rem;padding:1.2rem 0}.route-copy strong{color:var(--accent-strong);font-size:1.1rem}.route-copy p{max-width:900px;margin:0;color:var(--muted)}.stage-grid{display:grid;grid-template-columns:minmax(220px,.75fr) minmax(0,1.25fr);gap:1rem}.steps{display:grid;gap:.45rem;margin:0;padding:0;list-style:none}.step{display:grid;grid-template-columns:2.1rem minmax(0,1fr);gap:.6rem;width:100%;padding:.7rem .75rem;border:1px solid var(--line);border-radius:.65rem;background:var(--surface);color:var(--ink);cursor:pointer;text-align:left}.step:hover,.step:focus-visible{border-color:var(--accent);outline:3px solid color-mix(in srgb,var(--accent) 22%,transparent);outline-offset:1px}.step[aria-current="step"]{border-color:var(--accent);background:var(--surface-soft);color:var(--accent-strong)}.step.failed{border-color:var(--danger);color:var(--danger)}.step-number{font:600 .76rem/1.5 var(--font-code);color:var(--accent)}.detail{display:grid;grid-template-rows:auto auto;gap:1rem;min-height:18rem;padding:1.25rem;border:1px solid var(--line);border-top:4px solid var(--accent);border-radius:.8rem;background:var(--surface-soft)}.detail h3{margin:.3rem 0 .45rem;font-size:1.45rem}.detail p{margin:0;color:var(--muted)}.detail code{display:inline-block;margin-top:.85rem;padding:.35rem .55rem;border-radius:.4rem;background:var(--surface);color:var(--accent-strong);font:600 .8rem/1.4 var(--font-code);overflow-wrap:anywhere}.outcome{padding-top:1rem;border-top:1px solid var(--line)}.outcome strong{color:var(--accent-strong)}.outcome.failure strong{color:var(--danger)}.outcome p{margin:.35rem 0 0}.controls{display:flex;justify-content:space-between;gap:1rem;align-items:end;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)}.control-buttons{display:flex;gap:.4rem;flex-wrap:wrap}.progress{display:grid;grid-template-columns:auto minmax(130px,220px) auto;gap:.55rem;align-items:center;color:var(--muted);font-size:.8rem}.progress progress{width:100%;height:.55rem;accent-color:var(--accent)}.hint{margin:.8rem 0 0;color:var(--muted);font-size:.82rem}.fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}.field{display:grid;gap:.35rem;padding:.85rem;border:1px solid var(--line);border-radius:.65rem;background:var(--surface)}.field code{color:var(--accent-strong);font:600 .78rem/1.2 var(--font-code)}.field span{color:var(--muted);font-size:.88rem}.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem}.card{padding:1rem;border:1px solid var(--line);border-top:3px solid var(--accent);border-radius:.7rem;background:var(--surface)}.card h3{margin:0 0 .35rem;color:var(--accent-strong);font-size:1.05rem}.card p{margin:0;color:var(--muted);font-size:.88rem}.card dl{display:grid;gap:.65rem;margin:1rem 0 0}.card dt{color:var(--accent);font:700 .67rem/1.2 var(--font-code);text-transform:uppercase}.card dd{margin:0;color:var(--muted);font-size:.84rem}.responsibilities{grid-template-columns:repeat(3,minmax(0,1fr))}.note{margin:1rem 0 0;padding:1rem;border-radius:.7rem;background:var(--surface-soft);color:var(--muted);font-size:.9rem}.sources{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}.sources a{padding:.48rem .7rem;border:1px solid var(--line);border-radius:.5rem;background:var(--surface);font-size:.8rem}.footer-links{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1.2rem;color:var(--muted);font-size:.85rem}@media(max-width:900px){.hero{grid-template-columns:1fr}.selectors{grid-template-columns:1fr}.carrier-buttons{grid-template-columns:repeat(2,minmax(0,1fr))}.stage-grid{grid-template-columns:1fr}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.responsibilities{grid-template-columns:1fr 1fr}}@media(max-width:600px){.shell{width:min(100% - 1rem,1180px)}.topbar .shell{align-items:flex-start;padding:.7rem 0}.actions{gap:.25rem}.actions>a:first-child{display:none}.hero{padding:3.5rem 0 2.5rem}.hero h1{font-size:3.25rem}.band{padding:2.4rem 0}.section-head{display:grid}.explorer{padding:.8rem}.carrier-buttons{grid-template-columns:1fr}.controls{display:grid;align-items:start}.progress{grid-template-columns:auto minmax(0,1fr) auto}.fields,.cards,.responsibilities{grid-template-columns:1fr}.card dd,.field span{overflow-wrap:anywhere}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;transition:none!important}}
</style>
</head>
<body>
<nav class="topbar"><div class="shell"><a class="brand" href="${prefix}/visual-companions/">${c.catalog}</a><div class="actions"><a href="${manual}">${c.manual}</a><a href="${other}${route}" hreflang="${locale === 'ko' ? 'en' : 'ko'}">${c.language}</a><div class="theme" aria-label="Theme"><button class="theme-button" type="button" data-theme-button="auto" aria-pressed="true">Auto</button><button class="theme-button" type="button" data-theme-button="light" aria-pressed="false">Light</button><button class="theme-button" type="button" data-theme-button="dark" aria-pressed="false">Dark</button></div></div></div></nav>
<main class="shell">
<header class="hero"><div><p class="eyebrow">#421 · ${tenant.repository} · tenant context</p><h1>${esc(t(tenant.title))}</h1><p class="lead">${esc(t(tenant.summary))}</p></div><aside class="invariant"><strong>${esc(t(tenant.invariant))}</strong><p>${esc(t(tenant.carriers[0].boundary))}</p></aside></header>
<section class="band" id="explore"><div class="section-head"><div><p class="eyebrow">${c.carrier}</p><h2>${c.explore}</h2></div><p>${c.exploreText}</p></div><div class="explorer" id="tenant-explorer"><div class="selectors"><div><span class="label">${c.carrier}</span><div class="carrier-buttons">${model.carriers.map((carrier, index) => `<button class="btn carrier-button" type="button" data-carrier="${carrier.id}" aria-pressed="${index === 0}">${esc(carrier.label)}</button>`).join('')}</div></div><div class="scenario-wrap"><label class="label" for="scenario">${c.scenario}</label><select id="scenario">${model.scenarios.map((scenario) => `<option value="${scenario.id}">${esc(scenario.label)}</option>`).join('')}</select></div></div><div class="route-copy"><strong data-carrier-title>${esc(first.label)}</strong><p data-carrier-detail>${esc(first.owner)}</p></div><div class="stage-grid"><ol class="steps" aria-label="${c.progress}"></ol><article class="detail" aria-live="polite"><div><span class="label">${c.current} · <span data-position>01</span></span><h3 data-step-title></h3><p data-step-text></p><code data-visible></code><code data-owner></code></div><div class="outcome"><strong data-outcome>${c.pending}</strong><p data-outcome-detail></p></div></article></div><div class="controls"><div class="control-buttons"><button class="btn" type="button" data-action="reset">${c.reset}</button><button class="btn" type="button" data-action="play" aria-pressed="false">${c.play}</button><button class="btn" type="button" data-action="next">${c.next}</button></div><div class="progress"><span>${c.progress}</span><progress value="1" max="${firstStory.steps.length}"></progress><span data-count>1 / ${firstStory.steps.length}</span></div></div></div><p class="hint">${c.keyboard}</p><noscript><p>${c.nojs} <a href="${asset}.png">${c.diagram}</a></p></noscript></section>
<section class="band"><div class="section-head"><div><p class="eyebrow">${c.compare}</p><h2>${c.compare}</h2></div><p>${esc(t(tenant.summary))}</p></div><div class="cards">${model.carriers.map((carrier) => `<article class="card"><h3>${esc(carrier.label)}</h3><p>${esc(carrier.owner)}</p><dl><div><dt>${esc(c.install)}</dt><dd>${esc(carrier.install)}</dd></div><div><dt>${esc(c.read)}</dt><dd>${esc(carrier.read)}</dd></div><div><dt>${esc(c.after)}</dt><dd>${esc(carrier.cleanup)}</dd></div></dl></article>`).join('')}</div></section>
<section class="band"><div class="section-head"><div><p class="eyebrow">${c.responsibilities}</p><h2>${c.responsibilities}</h2></div><p>${esc(t(tenant.invariant))}</p></div><div class="cards responsibilities">${model.carriers.map((carrier) => `<article class="card"><h3>${esc(carrier.label)}</h3><p>${esc(carrier.boundary)}</p></article>`).join('')}</div><p class="note"><strong>${c.after}:</strong> ${locale === 'ko' ? '인증, 인가, tenant 해석과 업무 효과의 안전성은 caller가 소유합니다.' : 'Authentication, authorization, tenant resolution, and business-effect safety remain caller-owned.'}</p></section>
<section class="band"><div class="section-head"><div><p class="eyebrow">${c.source}</p><h2>${c.source}</h2></div><p>${esc(tenant.sourceRevision)}</p></div><div class="sources">${tenant.sources.map((source) => `<a href="${source.url}">${esc(source.name)}</a>`).join('')}</div><div class="footer-links"><a href="${asset}.png">${c.diagram}</a><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/${tenant.issue}">${c.issue}</a><span>source ${esc(tenant.sourceRevision)}</span></div></section>
</main>
<script>
(() => {
  const model=${js(model)}, labels=${js(c)};
  const root=document.getElementById('tenant-explorer');
  if(!root)return;
  const select=document.getElementById('scenario');
  const list=root.querySelector('.steps');
  const play=root.querySelector('[data-action="play"]');
  let carrier='${first.id}', scenario='normal', stepIndex=0, timer=null;
  const text=(query,value)=>{const node=root.querySelector(query);if(node)node.textContent=value;};
  const currentCarrier=()=>model.carriers.find((item)=>item.id===carrier);
  const story=()=>model.stories[carrier][scenario];
  function stop(){if(timer!==null)window.clearInterval(timer);timer=null;play.textContent=labels.play;play.setAttribute('aria-pressed','false');}
  function render(){
    const current=story(), item=current.steps[stepIndex], terminal=stepIndex===current.steps.length-1;
    root.dataset.carrier=carrier;root.dataset.scenario=scenario;root.dataset.step=String(stepIndex);root.dataset.terminal=String(terminal);root.dataset.status=terminal?current.status:'IN_PROGRESS';root.dataset.after=terminal?current.after:'pending';root.dataset.workflowReady='true';
    const selected=currentCarrier();
    text('[data-carrier-title]',selected.label);text('[data-carrier-detail]',selected.owner);text('[data-position]',String(stepIndex+1).padStart(2,'0'));text('[data-step-title]',item.title);text('[data-step-text]',item.text);text('[data-visible]',item.visible);text('[data-owner]',item.owner);text('[data-outcome]',terminal?labels.outcome:labels.pending);text('[data-outcome-detail]',terminal?current.outcome:labels.after);text('[data-count]',(stepIndex+1)+' / '+current.steps.length);
    list.replaceChildren(...current.steps.map((value,index)=>{const li=document.createElement('li'),button=document.createElement('button'),number=document.createElement('span');button.type='button';button.className='step';button.dataset.step=String(index);number.className='step-number';number.textContent=String(index+1).padStart(2,'0');button.append(number,document.createTextNode(value.title));if(index===stepIndex)button.setAttribute('aria-current','step');button.addEventListener('click',()=>{stop();stepIndex=index;render();list.querySelector('[aria-current="step"]').focus({preventScroll:true});});li.append(button);return li;}));
    const outcome=root.querySelector('.outcome');outcome.classList.toggle('failure',terminal&&['MISSING','FAILED_AND_CLEANED','FAILED_AND_ISOLATED'].includes(current.status));
    const progress=root.querySelector('progress');progress.max=current.steps.length;progress.value=stepIndex+1;root.querySelector('[data-action="next"]').disabled=terminal;if(terminal)stop();
  }
  root.querySelectorAll('[data-carrier]').forEach((button)=>button.addEventListener('click',()=>{stop();carrier=button.dataset.carrier;stepIndex=0;root.querySelectorAll('[data-carrier]').forEach((item)=>item.setAttribute('aria-pressed',String(item===button)));render();}));
  select.addEventListener('change',()=>{stop();scenario=select.value;stepIndex=0;render();});
  root.querySelector('[data-action="reset"]').addEventListener('click',()=>{stop();stepIndex=0;render();});
  root.querySelector('[data-action="next"]').addEventListener('click',()=>{stop();stepIndex=Math.min(stepIndex+1,story().steps.length-1);render();});
  play.addEventListener('click',()=>{if(timer!==null){stop();return;}if(stepIndex===story().steps.length-1)stepIndex=0;play.textContent=labels.pause;play.setAttribute('aria-pressed','true');render();timer=window.setInterval(()=>{stepIndex=Math.min(stepIndex+1,story().steps.length-1);render();},1350);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  document.querySelectorAll('[data-theme-button]').forEach((button)=>button.addEventListener('click',()=>{const theme=button.dataset.themeButton;if(theme==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=theme;document.querySelectorAll('[data-theme-button]').forEach((item)=>item.setAttribute('aria-pressed',String(item===button)));}));
  render();
})();
</script>
</body>
</html>
`;
  emit(`public${prefix}${route}index.html`, body);
}
console.log(`Tenant context HTML ${check ? 'checked' : 'generated'}`);
