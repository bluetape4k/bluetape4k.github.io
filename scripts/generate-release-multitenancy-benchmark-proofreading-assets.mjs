import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const out = "public/assets";
const c = {
  bg: "#07111F", panel: "#0D1B2D", card: "#10243A", card2: "#132B43",
  line: "#36536F", text: "#E6F2FF", muted: "#9CB4CC",
  cyan: "#36C5F0", mint: "#5EEAD4", amber: "#FBBF24", red: "#FB7185", violet: "#A78BFA",
};
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const fonts = (ko) => ({
  title: ko ? '"goorm Sans","Apple SD Gothic Neo",sans-serif' : '"Architects Daughter","Comic Sans MS",cursive',
  body: ko ? '"goorm Sans Code","goorm Sans",monospace' : '"Comic Mono","SFMono-Regular",Menlo,monospace',
});
const marker = (id, color) => `<marker id="arrow-${id}" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}"/></marker>`;
const common = (ko, includeMarkers = true) => {
  const f = fonts(ko);
  return `<defs>${includeMarkers ? `${marker("cyan", c.cyan)}${marker("mint", c.mint)}${marker("amber", c.amber)}${marker("red", c.red)}${marker("violet", c.violet)}` : ""}</defs>
  <style>
  .bg{fill:${c.bg}}.panel{fill:${c.panel};stroke:${c.line};stroke-width:2}.card{fill:${c.card};stroke:${c.line};stroke-width:2}.card2{fill:${c.card2};stroke:${c.line};stroke-width:2}
  .title{font:700 42px ${f.title};fill:${c.text}}.sub{font:600 19px ${f.body};fill:${c.muted}}.h{font:700 24px ${f.title};fill:${c.text}}
  .body{font:600 17px ${f.body};fill:${c.muted}}.mono{font:700 16px ${f.body};fill:${c.text}}.small{font:600 14px ${f.body};fill:${c.muted}}
  .life{stroke:${c.line};stroke-width:2;stroke-dasharray:8 9}.act{fill:#123252;stroke:${c.cyan};stroke-width:2}
  .call{fill:none;stroke:${c.cyan};stroke-width:4;marker-end:url(#arrow-cyan)}.ok{fill:none;stroke:${c.mint};stroke-width:4;marker-end:url(#arrow-mint)}
  .warn{fill:none;stroke:${c.amber};stroke-width:4;marker-end:url(#arrow-amber)}.err{fill:none;stroke:${c.red};stroke-width:4;marker-end:url(#arrow-red)}
  .violet{fill:none;stroke:${c.violet};stroke-width:4;marker-end:url(#arrow-violet)}.return{stroke-dasharray:10 8}
  .pill{fill:${c.card};stroke:${c.line};stroke-width:2}.frame{fill:none;stroke:${c.red};stroke-width:2;stroke-dasharray:10 8}
  .axis{stroke:${c.line};stroke-width:2}.grid{stroke:#233B54;stroke-width:1}.footer{fill:#0B2238;stroke:${c.line};stroke-width:2}
  </style>`;
};
const shell = (ko, w, h, title, subtitle, body, desc, includeMarkers = true) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>${common(ko, includeMarkers)}
<rect width="${w}" height="${h}" class="bg"/><rect x="32" y="32" width="${w - 64}" height="${h - 64}" rx="30" class="panel frame"/>
<text x="78" y="98" class="title">${esc(title)}</text><text x="80" y="138" class="sub subtitle">${esc(subtitle)}</text>${body}</svg>`;
const card = (x, y, w, h, title, lines, cls = "card") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" class="${cls}"/>
<text x="${x + 24}" y="${y + 44}" class="h">${esc(title)}</text>${lines.map((s, i) => `<text x="${x + 24}" y="${y + 82 + i * 30}" class="body">${esc(s)}</text>`).join("")}`;
const pill = (x, y, w, n, label, color = c.cyan) => `<rect x="${x}" y="${y}" width="${w}" height="42" rx="16" class="pill"/>
<circle cx="${x + 22}" cy="${y + 21}" r="14" fill="${c.panel}" stroke="${color}" stroke-width="2"/><text x="${x + 22}" y="${y + 27}" text-anchor="middle" class="mono badgeText">${n}</text>
<text x="${x + 48}" y="${y + 27}" class="mono labelText">${esc(label)}</text>`;

function release(locale) {
  const ko = locale === "ko";
  const t = ko ? {
    title: "Maven Central 릴리스 트레인의 검증 순서",
    sub: "개발용 버전 행렬을 안정 버전으로 고정하고, 중앙 BOM은 모든 상위 아티팩트가 조회된 뒤 게시합니다.",
    cards: [
      ["개발용 스냅샷", ["다음 개발선 검증", "게시 계약이 아님"]],
      ["안정 버전 고정", ["릴리스 행렬 확정", "SNAPSHOT 제거"]],
      ["상위 BOM 확인", ["Maven Central 조회", "미게시 항목만 게시"]],
      ["중앙 BOM 게시", ["POM 사전 검증", "가장 마지막에 게시"]],
      ["하위 소비자 검증", ["워크숍 / 예제", "검증된 BOM 적용"]],
    ],
    labels: ["버전 고정", "HTTP 조회", "공개 계약", "소비자 동기화"],
    patch: "게시 후 결함 → 같은 버전 교체 불가 → 새 패치 버전",
    footer: "일시적 스냅샷 403만 제한적으로 재시도하고, 테스트 실패·404·비호환은 즉시 실패시킵니다.",
  } : {
    title: "Verification Order for a Maven Central Release Train",
    sub: "Freeze development inputs into stable versions; publish the central BOM only after every upstream artifact resolves.",
    cards: [
      ["Development snapshots", ["Validate the next line", "Not a public contract"]],
      ["Freeze stable versions", ["Pin release matrix", "Remove SNAPSHOT refs"]],
      ["Verify upstream BOMs", ["Resolve from Central", "Publish missing only"]],
      ["Publish central BOM", ["Inspect POM first", "Publish last"]],
      ["Verify consumers", ["Workshops / examples", "Use verified BOM"]],
    ],
    labels: ["freeze", "HTTP resolve", "public contract", "consumer sync"],
    patch: "Defect after publish → no same-version replacement → new patch version",
    footer: "Retry only transient snapshot 403s; fail tests, 404s, and incompatibilities immediately.",
  };
  const xs = [60, 365, 670, 975, 1280];
  const body = t.cards.map(([h, lines], i) => card(xs[i], 250, 250, 210, h, lines, i === 3 ? "card2" : "card")).join("") +
    t.labels.map((v, i) => `<path d="M${xs[i] + 250} 355 H${xs[i + 1] - 18}" class="${i === 2 ? "ok" : "call"}"/><text x="${(xs[i] + 250 + xs[i + 1] - 18) / 2}" y="322" text-anchor="middle" class="small">${esc(v)}</text>`).join("") +
    `<rect x="310" y="570" width="980" height="92" rx="20" class="card2"/><text x="800" y="626" text-anchor="middle" class="h">${esc(t.patch)}</text>
    <rect x="120" y="755" width="1360" height="80" rx="20" class="footer"/><text x="800" y="804" text-anchor="middle" class="body">${esc(t.footer)}</text>`;
  return shell(ko, 1600, 900, t.title, t.sub, body, t.footer);
}

function tenantSequence(locale) {
  const ko = locale === "ko";
  const t = ko ? {
    title: "Ktor 요청에서 테넌트 스키마를 선택하는 순서",
    sub: "원본 헤더는 플러그인에서 검증하고, 호출 속성과 트랜잭션에는 형식화된 값만 전달합니다.",
    p: [["클라이언트","HTTP 요청"],["TenantPlugin","정규화·검증"],["호출 속성","Tenants.Tenant"],["라우트 처리기","명시적 전달"],["R2DBC 트랜잭션","스키마·조회"]],
    m: ["X-TENANT-ID 전달","헤더 정규화·테넌트 확인","형식화된 테넌트 저장","테넌트 값 조회","트랜잭션 시작","현재 스키마 설정","행 조회·응답"],
    alt: "거부 경계: 누락·공백·충돌·미등록 테넌트 → DB 접근 전에 400 응답",
    foot: "입력 검증은 권한 검증이 아닙니다. 인증 주체의 접근 권한과 테넌트 준비 상태는 별도 경계에서 확인합니다.",
  } : {
    title: "Tenant Schema Selection Across a Ktor Request",
    sub: "Validate raw headers in the plugin; pass only typed values through call attributes and the transaction boundary.",
    p: [["Client","HTTP request"],["TenantPlugin","normalize + validate"],["Call attributes","Tenants.Tenant"],["Route handler","explicit value"],["R2DBC transaction","schema + query"]],
    m: ["send X-TENANT-ID","normalize and resolve tenant","store typed tenant","read tenant value","start transaction","set current schema","return rows"],
    alt: "Rejection boundary: missing, blank, conflicting, or unknown tenant → 400 before DB access",
    foot: "Input validation is not authorization. Verify principal access and tenant readiness at separate boundaries.",
  };
  const xs = [165, 520, 875, 1230, 1585], y0 = 210;
  let body = t.p.map(([a,b],i)=>card(xs[i]-135,y0,270,100,a,[b],i===1?"card2":"card").replace('class="h"','class="h participant"')).join("");
  body += xs.map(x=>`<path d="M${x} 310 V1040" class="life"/>`).join("") + `<rect x="${xs[1]-9}" y="345" width="18" height="555" rx="8" class="act"/><rect x="${xs[4]-9}" y="760" width="18" height="180" rx="8" class="act"/>`;
  const rows = [
    [360,xs[0],xs[1]-12,"call"],[450,xs[1]+12,xs[2]-12,"ok"],[540,xs[1]+12,xs[2]-12,"ok"],
    [630,xs[3],xs[2]+12,"call"],[720,xs[3],xs[4]-12,"violet"],[810,xs[3],xs[4]-12,"warn"],[915,xs[4]-12,xs[0],"ok return"],
  ];
  rows.forEach(([y,a,b,cls],i)=>{const lx=Math.min(a,b)+Math.max(20,(Math.abs(b-a)-330)/2);body+=pill(lx,y-58,330,i+1,t.m[i],i<1?c.cyan:i<3?c.mint:i<5?c.violet:i<6?c.amber:c.mint)+`<path d="M${a} ${y} H${b}" class="${cls}"/>`;});
  body += `<rect x="290" y="970" width="1180" height="72" rx="18" class="footer"/><text x="880" y="1014" text-anchor="middle" class="body">${esc(t.alt)}</text>
  <rect x="145" y="1080" width="1510" height="74" rx="20" class="footer"/><text x="900" y="1125" text-anchor="middle" class="body">${esc(t.foot)}</text>`;
  return shell(ko, 1800, 1200, t.title, t.sub, body, t.foot);
}

function routingMap(locale) {
  const ko = locale === "ko";
  const t = ko ? {
    title:"실행 환경에 따른 테넌트 상태 전달 방식",sub:"전달 수단은 달라도 입력 검증, 명시적 전달, 트랜잭션 내부 선택, 격리 검증은 동일합니다.",
    l:["Spring / JDBC",["Filter·Interceptor","ThreadLocal·ScopedValue","JDBC 트랜잭션","정리 규칙 필수"]],
    r:["Ktor / R2DBC",["Application Plugin","ApplicationCall.attributes","suspendTransaction","명시적 값 전달"]],
    steps:["식별 정보 추출","권한·준비 상태 확인","라우팅 값 전달","스키마·대상 선택","격리 테스트"],
    foot:"헤더는 라우팅 입력일 뿐 인증·권한 정책이 아닙니다. korean ≠ english, acme:rw ≠ acme:ro를 실제 데이터로 검증합니다.",
  } : {
    title:"Tenant State Carriers by Runtime Model",sub:"Carriers differ; validation, explicit transfer, transaction-bound selection, and isolation proof stay the same.",
    l:["Spring / JDBC",["Filter or interceptor","ThreadLocal or ScopedValue","JDBC transaction","Cleanup is mandatory"]],
    r:["Ktor / R2DBC",["Application plugin","ApplicationCall.attributes","suspendTransaction","Pass typed values"]],
    steps:["extract identity","authorize + check readiness","pass routing value","select schema or target","prove isolation"],
    foot:"A header is routing input, not authentication policy. Prove korean ≠ english and acme:rw ≠ acme:ro with real data.",
  };
  let body = card(100,220,620,370,t.l[0],t.l[1],"card") + card(880,220,620,370,t.r[0],t.r[1],"card2");
  body += t.steps.map((s,i)=>`<rect x="${150+i*290}" y="700" width="250" height="92" rx="20" class="${i===1?"card2":"card"}"/><text x="${275+i*290}" y="754" text-anchor="middle" class="mono">${i+1}. ${esc(s)}</text>${i<4?`<path d="M${400+i*290} 746 H${438+i*290}" class="call"/>`:""}`).join("");
  body += `<rect x="130" y="870" width="1340" height="76" rx="20" class="footer"/><text x="800" y="916" text-anchor="middle" class="body">${esc(t.foot)}</text>`;
  return shell(ko,1600,1000,t.title,t.sub,body,t.foot);
}

const seed = [["H2 JDBC",59.972,c.cyan],["H2 R2DBC",19.196,c.mint],["PostgreSQL JDBC",14.402,c.amber],["PostgreSQL R2DBC",0.407,c.red],["MySQL JDBC",14.411,c.violet],["MySQL R2DBC",0.501,"#2DD4BF"]];
const xlog = (v) => 430 + ((Math.log10(v)+1)/3)*900;
function benchmarkMap(locale) {
  const ko=locale==="ko", t=ko?{
    title:"배치 벤치마크 결과의 생성 경로",sub:"측정 조건과 결과 문서를 같은 생성 경로에 두어 수치와 설명의 불일치를 줄입니다.",
    cards:[["Gradle 실행 프로필",["DB·드라이버별 실행","워밍업·반복 조건"]],["JMH 벤치마크",["@Param 비교 행렬","시드·전체 작업 분리"]],["JSON 보고서",["원시 측정 결과","작업별 ops/sec·avg ms"]],["문서 생성기",["표·차트 생성","조건과 단위 유지"]],["독자용 문서",["Markdown 상세 결과","추세와 한계 설명"]]],
    labels:["실행","기록","변환","게시"],foot:"테스트는 기능을 검증하고, 벤치마크는 고정된 조건에서 성능을 측정합니다."
  }:{
    title:"Batch Benchmark Report Generation Path",sub:"Keep measurement conditions and generated documentation in one path to prevent evidence drift.",
    cards:[["Gradle profiles",["DB and driver tasks","Warmup and iteration"]],["JMH benchmarks",[["@Param matrix"],["Seed vs full job"]].flat()],["JSON reports",["Raw measurements","Job ops/sec and avg ms"]],["Doc generator",["Tables and charts","Preserve units"]],["Reader docs",["Markdown details","Trend and limits"]]],
    labels:["run","record","transform","publish"],foot:"Tests verify behavior; benchmarks measure performance under fixed conditions."
  };
  const xs=[45,355,665,975,1285];let body=t.cards.map(([h,l],i)=>card(xs[i],260,270,220,h,l,i===2?"card2":"card")).join("");
  body+=t.labels.map((v,i)=>`<path d="M${xs[i]+270} 370 H${xs[i+1]-16}" class="call"/><text x="${(xs[i]+270+xs[i+1]-16)/2}" y="338" text-anchor="middle" class="small">${esc(v)}</text>`).join("");
  body+=`<rect x="170" y="650" width="1260" height="84" rx="20" class="footer"/><text x="800" y="700" text-anchor="middle" class="body">${esc(t.foot)}</text>`;
  return shell(ko,1600,820,t.title,t.sub,body,t.foot);
}
function seedChart(locale) {
  const ko=locale==="ko", title=ko?"데이터베이스별 시드 적재 작업 처리량":"Seed Job Throughput by Database";
  const sub=ko?"dataSize=10,000 · poolSize=30 · 로그 눈금 · 높을수록 좋음":"dataSize=10,000 · poolSize=30 · log scale · higher is better";
  let body=`<line x1="430" y1="210" x2="430" y2="760" class="axis"/>`;
  [0.1,1,10,100].forEach(v=>{const x=xlog(v);body+=`<line x1="${x}" y1="210" x2="${x}" y2="730" class="grid"/><text x="${x}" y="760" text-anchor="middle" class="small">${v}</text>`});
  seed.forEach(([name,v,color],i)=>{const y=245+i*78,x=xlog(v);body+=`<text x="90" y="${y+24}" class="mono">${name}</text><rect x="430" y="${y}" width="${x-430}" height="38" rx="10" fill="${color}"/><text x="${x+16}" y="${y+26}" class="mono">${v.toFixed(3)} jobs/s</text>`});
  const foot=ko?"ops/sec는 10,000행을 처리하는 시드 작업 전체의 초당 완료 횟수이며 행/초가 아닙니다.":"ops/sec counts completed 10,000-row seed jobs per second; it is not rows/second.";
  body+=`<rect x="120" y="810" width="1360" height="76" rx="20" class="footer"/><text x="800" y="856" text-anchor="middle" class="body">${esc(foot)}</text>`;
  return shell(ko,1600,930,title,sub,body,foot,false);
}
function postgresChart(locale) {
  const ko=locale==="ko", title=ko?"PostgreSQL 전체 배치 작업의 파티션별 처리량":"PostgreSQL Full-Job Throughput by Partition Count";
  const sub=ko?"dataSize=10,000 · poolSize=30 · 배치 작업 완료 횟수/초":"dataSize=10,000 · poolSize=30 · completed batch jobs/second";
  const rows=[[1,5.10,0.400],[4,10.5,4.70],[8,10.4,9.70]], scale=v=>400+v/12*900;let body="";
  rows.forEach(([p,j,r],i)=>{const y=270+i*170;body+=`<text x="95" y="${y+45}" class="h">${ko?"파티션":"partitions"} ${p}</text>
  <rect x="400" y="${y}" width="${scale(j)-400}" height="48" rx="12" fill="${c.cyan}"/><text x="${scale(j)+18}" y="${y+32}" class="mono">JDBC ${j.toFixed(2)} jobs/s</text>
  <rect x="400" y="${y+68}" width="${scale(r)-400}" height="48" rx="12" fill="${c.mint}"/><text x="${scale(r)+18}" y="${y+100}" class="mono">R2DBC ${r.toFixed(3)} jobs/s</text>`});
  const foot=ko?"파티션 수만 바꾸고 데이터 크기·연결 풀·저장소 구현은 고정해야 결과를 해석할 수 있습니다.":"Change only partition count; keep data size, pool size, and repository implementation fixed.";
  body+=`<rect x="120" y="820" width="1360" height="76" rx="20" class="footer"/><text x="800" y="866" text-anchor="middle" class="body">${esc(foot)}</text>`;
  return shell(ko,1600,940,title,sub,body,foot,false);
}

function render(stem, locale, svg) {
  const svgPath=`${out}/${stem}-${locale}.svg`, pngPath=`${out}/${stem}-${locale}.png`;
  writeFileSync(svgPath, `${svg}\n`);
  execFileSync("xmllint",["--noout",svgPath],{stdio:"inherit"});
  execFileSync("cairosvg",[svgPath,"-o",pngPath,"-s","2"],{stdio:"inherit"});
}
for (const locale of ["ko","en"]) {
  render("bluetape4k-dependencies-release-train-01",locale,release(locale));
  render("exposed-r2dbc-ktor-tenant-sequence-01",locale,tenantSequence(locale));
  render("exposed-r2dbc-ktor-routing-strategy-map-01",locale,routingMap(locale));
  render("exposed-batch-kotlinx-benchmark-map-01",locale,benchmarkMap(locale));
  render("exposed-batch-kotlinx-benchmark-summary-01",locale,seedChart(locale));
  render("exposed-batch-kotlinx-benchmark-postgresql-e2e-01",locale,postgresChart(locale));
}
