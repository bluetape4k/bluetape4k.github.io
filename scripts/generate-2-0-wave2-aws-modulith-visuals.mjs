import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { modulith } from '../src/data/visual-companions/wave2-aws-modulith.mjs';

const root=resolve(import.meta.dirname,'..'),check=process.argv.includes('--check');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const bi=(en,ko)=>({en,ko});
function emit(path,value){const target=resolve(root,path);if(check){if(readFileSync(target,'utf8')!==value)throw new Error(`Stale generated file: ${path}`);}else{mkdirSync(dirname(target),{recursive:true});writeFileSync(target,value);}}
function wrap(value,width){const lines=[];let line='';for(const word of value.split(/\s+/)){const next=line?`${line} ${word}`:word;if(line&&[...next].reduce((sum,ch)=>sum+(/[가-힣]/.test(ch)?2:1),0)>width){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
const base='public/assets/visual-companions/wave2/';
for(const locale of ['en','ko']){
  const t=v=>typeof v==='string'?v:v[locale];
  const font=locale==='ko'?'goorm Sans':'Comic Mono';
  const heading=locale==='ko'?'goorm Sans':'Architects Daughter';
  const sections=[
    {id:'producer',x:60,title:bi('Publication boundary','발행 경계'),badge:'SNS / SQS',items:[
      ['01',t(modulith.phases.encode.label),t(bi('Resolve a logical target and routing key. Encode the registered event type/version, stable ID and allowed headers.', '논리 대상과 routing key를 해석합니다. 등록된 type/version, 안정적인 ID와 허용 header를 encode합니다.'))],
      ['02',t(modulith.phases.publish.label),t(bi('SNS or SQS publisher completion resolves the publication future. Admission is bounded.', 'SNS 또는 SQS publisher 완료 뒤 publication future를 완료합니다. 동시 발행 수를 제한합니다.'))],
    ]},
    {id:'source',x:520,title:bi('SQS input boundary','SQS 입력 경계'),badge:'DIRECT / SNS',items:[
      ['A','DIRECT',t(bi('Read the envelope directly from SQS body. Reject SNS-shaped bodies. DIRECT is an input mode, not a publisher.', 'SQS body의 envelope를 직접 읽습니다. SNS 형태는 거부합니다. DIRECT는 발행 서비스가 아닌 입력 모드입니다.'))],
      ['B','SNS',t(bi('Read an SNS Notification from SQS. Verify the allowed topic and signature before decoding its Message.', 'SQS의 SNS Notification을 읽습니다. 허용 topic과 서명을 검증한 뒤 Message를 decode합니다.'))],
    ]},
    {id:'consumer',x:980,title:bi('Consumer boundary','Consumer 경계'),badge:'CLAIM / DISPATCH / ACK',items:[
      ['01',t(modulith.phases.claim.label),t(bi('Claim by type and stable ID. Completed suppresses dispatch; InProgress fails; Acquired grants a fenced token.', 'type과 안정적인 ID로 claim합니다. Completed는 dispatch를 생략하고 InProgress는 실패합니다. Acquired는 fencing token을 부여합니다.'))],
      ['02',t(modulith.phases.complete.label),t(bi('After synchronous dispatch, complete with the current token. Only APPLIED or ALREADY_APPLIED permits ack.', '동기 dispatch 뒤 현재 token으로 완료합니다. APPLIED 또는 ALREADY_APPLIED만 ack를 허용합니다.'))],
    ]},
  ];
  const ledger={kind:'architecture',source:{question:t(bi('Which boundaries own publication, source trust, processing and retry safety?','발행, 입력 신뢰, 처리와 재시도 안전성은 어떤 경계가 담당하는가?')),revision:modulith.revision,paths:['src/data/visual-companions/wave2-aws-modulith.mjs']},nodes:sections.map(s=>({id:s.id,label:t(s.title),source:modulith.sources[s.id==='producer'?0:2].url})),edges:[{id:'published-body',from:'producer',to:'source',kind:'data',source:modulith.sources[0].url},{id:'verified-event',from:'source',to:'consumer',kind:'data',source:modulith.sources[2].url}],behavior:{branches:0,loops:0},repairs:[{target:'text',reason:'Use supported glyphs and width-aware Korean wrapping; preserve boundary summaries',touches:8}]};
  emit(`docs/diagrams/visual-companions-wave2/${modulith.slug}-${locale}.semantic.json`,JSON.stringify(ledger,null,2)+'\n');
  const out=[`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1420" viewBox="0 0 1440 1420" role="img" aria-labelledby="title desc"><title id="title">${esc(t(bi('Spring Modulith event boundaries','Spring Modulith 이벤트 처리 경계')))}</title><desc id="desc">${esc(t(modulith.summary))}</desc><defs><marker id="arrow" markerWidth="10" markerHeight="10" viewBox="0 0 10 10" refX="10" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="secondary" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#08776a"/></marker></defs><style>text{font-family:'${font}',sans-serif;fill:#1c2925}.title{font-family:'${heading}',sans-serif;font-size:44px;font-weight:bold}.heading{font-family:'${heading}',sans-serif;font-size:29px;font-weight:bold}.body{font-size:19px}.small{font-size:17px}.tag{font-size:17px;fill:#08776a;font-weight:bold}.muted{fill:#52645b}.callout{font-size:22px;font-weight:bold}.card{fill:#fff;stroke:#cbd6cf;stroke-width:2}.connector{fill:none;stroke:#08776a;stroke-width:3;stroke-linecap:round}</style><rect width="1440" height="1420" fill="#f5f6f3"/>`];
  const text=(cls,x,y,value)=>out.push(`<text class="${cls}" x="${x}" y="${y}">${esc(value)}</text>`);
  function lines(cls,x,y,value,width=34,gap=27){const values=wrap(value,width);values.forEach((line,i)=>text(cls,x,y+i*gap,line));return y+values.length*gap;}
  text('tag',60,55,'SPRING MODULITH / AWS');
  text('title',60,116,t(bi('One event. Separate processing boundaries.','하나의 이벤트, 분리된 처리 경계')));
  text('callout',60,174,t(bi('Publish success is not consumer completion', '발행 성공은 수신 처리 완료를 보장하지 않습니다')));
  for(const s of sections){
    out.push(`<rect id="${s.id}" class="card" x="${s.x}" y="220" width="400" height="620" rx="12"/>`);
    text('tag',s.x+26,261,s.badge);text('heading',s.x+26,306,t(s.title));
    let y=356;
    for(const [number,title,body] of s.items){text('tag',s.x+26,y,number);y+=34;text('callout',s.x+26,y,title);y+=33;y=lines('body',s.x+26,y,body,locale==='ko'?30:31,27)+32;}
  }
  for(const [id,start,end] of [['published-body',460,520],['verified-event',920,980]])out.push(`<path id="${id}" class="connector" data-connector="true" data-source="${id==='published-body'?'producer':'source'}" data-target="${id==='published-body'?'source':'consumer'}" d="M ${start} 510 H ${end}" marker-end="url(#arrow)"/>`);
  out.push('<rect x="60" y="870" width="1320" height="120" rx="10" fill="#e1f1eb" stroke="#cbd6cf"/>');
  text('callout',86,912,t(bi('Verified source / decode / claim / dispatch / complete / ack','입력 검증 / decode / claim / dispatch / complete / ack')));
  lines('body',86,951,t(bi('Completed duplicates bypass dispatch and complete. No acknowledgement follows a failed consume operation.','완료된 중복은 dispatch와 complete를 생략합니다. Consume 실패 뒤에는 acknowledgement를 수행하지 않습니다.')),100,26);
  out.push('<rect x="60" y="1020" width="640" height="230" rx="10" fill="#fff" stroke="#cbd6cf"/><rect x="730" y="1020" width="650" height="230" rx="10" fill="#fff" stroke="#cbd6cf"/>');
  text('heading',86,1065,t(bi('Completion has limits','완료 보장의 범위')));
  lines('body',86,1110,t(modulith.phases.dispatch.text),locale==='ko'?47:47,27);
  text('heading',756,1065,t(bi('Caller-owned policy','호출자 소유 정책')));
  lines('body',756,1110,t(modulith.responsibilities[1].text),locale==='ko'?49:48,27);
  lines('small muted',60,1300,t(modulith.caveats),locale==='ko'?105:115,26);
  out.push('</svg>\n');emit(`${base}${modulith.slug}-${locale}.svg`,out.join('\n'));
}
console.log(`Modulith SVG and semantic ledger ${check?'checked':'generated'}`);
