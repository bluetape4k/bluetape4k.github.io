# CairoSVG PNG 출력에서 custom-font parity 유지

## 배경

Clinic Appointment diagram은 영어 label에 `Architects Daughter`와 `Comic Mono`를 선언하고, 두 font 모두 macOS에 설치되어 있다. sandbox render는 `fc-match`로 font 이름을 찾을 수 있었지만 Fontconfig cache directory에 쓸 수 없었다. 그래서 librsvg와 direct CairoSVG가 모두 조용히 fallback font로 대체했다. 선언 audit는 통과했지만 published PNG와 editable SVG의 typography가 같지 않았다.

## 교훈

font 설치, `fc-match`, SVG 선언만으로 raster parity를 증명할 수 없다. Fontconfig가 쓰기 가능한 cache를 사용할 수 있는지 확인하고, font file로 렌더링한 specimen과 실제 glyph shape를 비교하며, full-size image에서 line break 변경, clipping, label collision을 검사해야 한다.

direct CairoSVG text rendering이 font를 대체하면 editable SVG는 그대로 두고, Fontconfig가 cache를 읽고 쓸 수 있는 환경에서 다음 pipeline을 사용한다.

1. 관련 user font directory에 `fc-cache -f`를 실행하고 `fc-match`로 정확한 font file을 확인한다.
2. librsvg로 source SVG를 intermediate SVG로 렌더링해 text를 resolved glyph path로 만든다.
3. rendered title과 body label을 `Architects Daughter` 및 `Comic Mono` font file의 direct specimen과 비교한다.
4. outlined SVG를 CairoSVG로 canonical PNG에 렌더링한다.
5. 원본 SVG의 locale별 font declaration을 audit하고 최종 PNG를 full size로 검사한다.

outlined intermediate로 원본 SVG를 교체하지 않는다. source는 계속 editable, searchable, localizable해야 한다.

## 사용한 검증

- 쓰기 가능한 cache directory에서 `fc-cache -f`가 완료됐고 `fc-match`가 요청한 font file을 확인했다.
- direct font-file specimen이 예상한 handwritten title과 monospace body glyph shape를 확인했다.
- 여덟 개 English Clinic Appointment PNG를 outlined-SVG pipeline으로 다시 생성했다.
- 이미 예상한 goorm Sans와 goorm Sans Code rendering과 일치하므로 여덟 개 Korean PNG는 유지했다.
- XML, text normalization, connector, geometry, endpoint, mixed-corner, font, full-size image, test, site-build 검사가 통과했다.
