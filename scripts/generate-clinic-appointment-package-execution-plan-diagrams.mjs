import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const out = resolve('public/assets');
const esc = (v) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const lines = (items, x, y, cls = 'body', gap = 25, anchor = 'middle') => items.map((v, i) => `<text class="${cls}" x="${x}" y="${y + i * gap}" text-anchor="${anchor}">${esc(v)}</text>`).join('\n');
const card = ({ id, x, y, w, h, tone = 'blue', title, body = [], compact = false }) => `<g class="node-card"><rect id="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="22" class="card ${tone}"/><text class="card-title${compact ? ' compact' : ''}" x="${x + w / 2}" y="${y + 45}" text-anchor="middle">${esc(title)}</text>${lines(body, x + w / 2, y + 82, 'body', 24)}</g>`;

const shell = ({ locale, title, subtitle, height, body, kind = 'workflow' }) => {
 const isSequence = kind === 'sequence';
 const markerSize = isSequence ? 16 : 14;
 const viewBoxSize = isSequence ? 10 : 14;
 const refX = isSequence ? 9 : 12;
 const refY = isSequence ? 5 : 7;
 const path = isSequence ? 'M 0 0 L 10 5 L 0 10 Z' : 'M0 0 L14 7 L0 14 Z';
 return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="${height}" viewBox="0 0 1440 ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle)}</desc>
<defs>
 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#111932"/></linearGradient>
 ${[['blue','#60a5fa'],['green','#2dd4bf'],['amber','#fbbf24'],['red','#fb7185']].map(([n,c]) => `<marker id="${n}Arrow" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" markerWidth="${markerSize}" markerHeight="${markerSize}" refX="${refX}" refY="${refY}" orient="auto" markerUnits="userSpaceOnUse" data-role="${isSequence ? 'sequence' : 'primary'}" data-size="${markerSize}x${markerSize}" data-tip-direction="positive-x"><path d="${path}" fill="${c}" data-solid-head="true"/></marker>`).join('\n')}
 <style>
 .title{font-family:${locale === 'ko' ? '"goorm Sans",sans-serif' : '"Architects Daughter",cursive'};font-size:37px;font-weight:700;fill:#f8fafc}.subtitle{font-family:${locale === 'ko' ? '"goorm Sans",sans-serif' : '"Comic Mono",monospace'};font-size:18px;fill:#aebed2}.card{fill:#11233e;stroke-width:3}.card.blue{stroke:#60a5fa}.card.green{stroke:#2dd4bf;fill:#10333b}.card.amber{stroke:#fbbf24;fill:#312818}.card.red{stroke:#fb7185;fill:#341b2b}.card-title{font-family:${locale === 'ko' ? '"goorm Sans",sans-serif' : '"Architects Daughter",cursive'};font-size:21px;font-weight:700;fill:#f8fafc}.card-title.compact{font-family:${locale === 'ko' ? '"goorm Sans Code","goorm Sans",monospace' : '"Comic Mono",monospace'};font-size:15px}.body,.label,.note{font-family:${locale === 'ko' ? '"goorm Sans Code","goorm Sans",monospace' : '"Comic Mono",monospace'};fill:#d7e3f3}.body{font-size:16px}.note{font-size:15px;fill:#aebed2}.route{fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.blue-line{stroke:#60a5fa;marker-end:url(#blueArrow)}.green-line{stroke:#2dd4bf;marker-end:url(#greenArrow)}.amber-line{stroke:#fbbf24;marker-end:url(#amberArrow)}.red-line{stroke:#fb7185;marker-end:url(#redArrow)}.lifeline{stroke:#526783;stroke-width:2;stroke-dasharray:8 10}.activation{fill:#17314e;stroke:#7091ab;stroke-width:2}.pill{fill:#0d1a2e;stroke-width:2}.label{font-size:15px}.frame{fill:none;stroke:#526783;stroke-width:2;stroke-dasharray:9 8}.badge{font-family:${locale === 'ko' ? '"goorm Sans",sans-serif' : '"Comic Mono",monospace'};font-size:15px;font-weight:700}
 </style>
</defs><rect width="1440" height="${height}" fill="url(#bg)"/><rect x="28" y="26" width="1384" height="${height - 52}" rx="30" fill="none" stroke="#2b4168" stroke-width="2"/>
<text class="title" x="64" y="78">${esc(title)}</text><text class="subtitle" x="66" y="112">${esc(subtitle)}</text>${body}</svg>`;
};

const copy = {
 ko: {
  flow:{title:'선택한 패키지 실행 계약을 Plan 리비전으로 고정한다',sub:'선택 결과와 정확한 구성 상품 버전을 검증하되 방문 시간은 만들지 않습니다.',contract:'환자 A의 실행 계약',contractBody:['피부 진단 v2 · 필수','레이저 토닝 v8 · 선택','진정 마스크 관리 v4 · 선택'],checks:['수량·전체 크기','정확한 선택 수','진료 항목 근거 이력','관계 참조','실행 의존성 순환'],revision:'새 Plan 리비전',revisionBody:['PlannedTreatment','ExecutionDependency','VisitGroupingConstraint'],group:'묶음 조건은 별도 축',groupBody:['MAY_SAME_VISIT · 함께 가능','MUST_SEPARATE_VISIT · 분리'],boundary:'최종 경계',boundaryBody:['방문 후보를 만들지 않는다','확정 예약을 만들지 않는다']},
  seq:{title:'구매 완료와 패키지 실행 계획은 서로 다른 이벤트 경계다',sub:'기존 Plan을 찾은 뒤 검증·저장하고, 명시적인 최종 상태로 수렴합니다.',participants:['구매 서비스','PurchaseCompletedHandler','VisitPlanningEventHandler','PackageExecutionPlanner','Plan · inbox · outbox'],messages:['구매 완료 → 기존 AppointmentPlan 생성','별도 PackageExecutionEvent 전달','Plan · 상품 · version · hash · 순서 확인','실행 계약 검증 요청','AppointmentPlanRevisionDraft 반환','리비전 · 하위 그래프 · inbox · outbox 원자적 저장'],decision:'최종 상태 결정',outcomes:['DUPLICATE','WAITING_GAP','격리 · 충돌','리비전 추가']}
 },
 en: {
  flow:{title:'Freeze a Selected Package Contract into a Plan Revision',sub:'Validate choices and exact component versions without creating visit times.',contract:'Patient A Execution Contract',contractBody:['skin diagnosis v2: required','laser toning v8: selected','soothing mask v4: selected'],checks:['quantity and total size','exact selection count','treatment provenance','relation references','dependency acyclicity'],revision:'New Plan Revision',revisionBody:['PlannedTreatment','ExecutionDependency','VisitGroupingConstraint'],group:'Grouping Is a Separate Axis',groupBody:['MAY_SAME_VISIT: permitted','MUST_SEPARATE_VISIT: separate'],boundary:'Terminal Boundary',boundaryBody:['does not create visit candidates','does not confirm appointments']},
  seq:{title:'Purchase Completion and Package Planning Use Separate Events',sub:'Look up the existing Plan, validate and store, then converge on an explicit terminal outcome.',participants:['Purchase service','PurchaseCompletedHandler','VisitPlanningEventHandler','PackageExecutionPlanner','Plan, inbox, outbox'],messages:['purchase completed: create existing Plan','deliver separate PackageExecutionEvent','check Plan, product, version, hash, order','validate execution contract','return AppointmentPlanRevisionDraft','atomically store revision, children, inbox, outbox'],decision:'Terminal Outcome Decision',outcomes:['DUPLICATE','WAITING_GAP','quarantine, conflict','revision appended']}
 }
};

function flow(locale, c) {
 const checkCards = c.checks.map((title, i) => card({id:['limits','selection','provenance','relations','acyclic'][i],x:465,y:170+i*126,w:390,h:90,tone:i===4?'green':'blue',title,body:[],compact:locale==='en'})).join('');
 const checkEdges = [0,1,2,3].map((_,i)=>`<path class="route blue-line" data-source-node="${['limits','selection','provenance','relations'][i]}" data-target-node="${['selection','provenance','relations','acyclic'][i]}" d="M660 ${260+i*126} V${296+i*126}"/>`).join('');
 return shell({locale,title:c.title,subtitle:c.sub,height:940,body:`
 ${card({id:'contract',x:55,y:280,w:320,h:230,title:c.contract,body:c.contractBody})}
 ${checkCards}
 ${card({id:'revision',x:950,y:210,w:390,h:210,tone:'green',title:c.revision,body:c.revisionBody})}
 ${card({id:'grouping',x:950,y:480,w:390,h:170,tone:'amber',title:c.group,body:c.groupBody,compact:locale==='en'})}
 ${card({id:'boundary',x:950,y:710,w:390,h:150,tone:'red',title:c.boundary,body:c.boundaryBody})}
 <path class="route blue-line" data-source-node="contract" data-target-node="limits" d="M375 395 H410 Q435 395 435 370 V240 Q435 215 465 215"/>
 ${checkEdges}
 <path class="route green-line" data-source-node="acyclic" data-target-node="revision" d="M855 719 H895 Q920 719 920 694 V340 Q920 315 950 315"/>
 <path class="route amber-line" data-source-node="revision" data-target-node="grouping" d="M1145 420 V480"/>
 <path class="route red-line" data-source-node="grouping" data-target-node="boundary" d="M1145 650 V710"/>
 <text class="note" x="65" y="825">${esc(locale==='ko'?'선택 사례는 승인된 설계, 검증 동작은 현재 planner와 테스트에 근거합니다.':'The scenario comes from the approved design; validation behavior comes from the current planner and tests.')}</text>`});
}

function pill(n, text, x, y, w, color) { return `<g><rect class="pill" x="${x}" y="${y}" width="${w}" height="34" rx="17" stroke="${color}"/><circle cx="${x+18}" cy="${y+17}" r="12" fill="${color}" opacity=".2" stroke="${color}"/><text class="label" x="${x+18}" y="${y+22}" text-anchor="middle">${n}</text><text class="label" x="${x+40}" y="${y+22}">${esc(text)}</text></g>`; }
function seq(locale, c) {
 const xs=[120,390,690,980,1260];
 const heads=xs.map((x,i)=>card({id:['purchase','purchase-handler','visit-handler','planner','store'][i],x:x-110,y:150,w:220,h:100,title:c.participants[i],compact:true})).join('');
 const lives=xs.map(x=>`<path class="lifeline" d="M${x} 250 V1000"/>`).join('');
 const rows=[300,420,540,660,780,900]; const pairs=[[0,1],[0,2],[2,4],[2,3],[3,2],[2,4]]; const tones=[['blue','#60a5fa'],['amber','#fbbf24'],['blue','#60a5fa'],['blue','#60a5fa'],['green','#2dd4bf'],['green','#2dd4bf']];
 const msgs=rows.map((y,i)=>{const [a,b]=pairs[i]; const [tone,color]=tones[i]; const left=Math.min(xs[a],xs[b]), right=Math.max(xs[a],xs[b]); const dir=`M${xs[a]} ${y} H${xs[b]}`; const labelWidth=Math.min(510,Math.max(250,c.messages[i].length*10+70)); const labelX=(left+right-labelWidth)/2; return `${pill(i+1,c.messages[i],labelX,y-48,labelWidth,color)}<path class="route seq ${tone}-line" data-source-node="${['purchase','purchase-handler','visit-handler','planner','store'][a]}" data-target-node="${['purchase','purchase-handler','visit-handler','planner','store'][b]}" d="${dir}"/>`;}).join('');
 const outcomes=c.outcomes.map((v,i)=>`<rect x="${190+i*270}" y="1125" width="230" height="72" rx="20" class="card ${['blue','amber','red','green'][i]}"/><text class="card-title compact" x="${305+i*270}" y="1168" text-anchor="middle">${esc(v)}</text>`).join('');
 return shell({locale,title:c.title,subtitle:c.sub,height:1280,kind:'sequence',body:`${heads}${lives}<rect class="activation" x="680" y="395" width="20" height="550" rx="8"/>${msgs}<rect class="frame" x="85" y="1030" width="1270" height="190" rx="24"/><rect x="510" y="1010" width="420" height="42" rx="21" fill="#15243d" stroke="#a78bfa" stroke-width="2"/><text class="badge" x="720" y="1037" text-anchor="middle" fill="#d8b4fe">${esc(c.decision)}</text>${outcomes}`});
}

await mkdir(out,{recursive:true});
for (const locale of ['ko','en']) {
 for (const [stem,svg] of [[`clinic-appointment-package-execution-plan-01-${locale}`,flow(locale,copy[locale].flow)],[`clinic-appointment-package-execution-plan-02-${locale}`,seq(locale,copy[locale].seq)]]) {
  const svgPath=resolve(out,`${stem}.svg`), pngPath=resolve(out,`${stem}.png`);
  await writeFile(svgPath,`${svg.trim()}\n`,'utf8');
  execFileSync('xmllint',['--noout',svgPath],{stdio:'inherit'});
  execFileSync('cairosvg',[svgPath,'-o',pngPath,'-s','2'],{stdio:'inherit'});
 }
}
