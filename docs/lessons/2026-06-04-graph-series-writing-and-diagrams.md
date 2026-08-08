# Graph 시리즈 글쓰기와 다이어그램 review

## 배경

bluetape4k-graph Part 1-4 series는 diagram readability, author voice, bilingual parity, benchmark wording, workshop example applicability를 기준으로 여러 review를 거쳤다.

## 결정

graph 글은 module catalog를 나열하는 third-party 글이 아니라 library author가 실제 도입 경로를 설명하는 글로 쓴다. 각 섹션은 독자의 service problem에서 시작해 가장 작은 유용한 example 또는 diagram을 보여주고, native graph storage feature나 다른 tool이 더 적합한 경계를 설명한다.

diagram은 label을 줄이기 전에 canvas와 box를 넓힌다. reviewer가 connector visibility, spacing, ERD readability를 지적하면 rendered PNG를 개별적으로 확인한다. 본문 diagram은 example case를 설명하고, hero figure는 architecture diagram이 아닌 editorial 3D workbench image로 유지한다.

## 결과

Graph series의 한국어·영어 글이 다음 내용을 맞춰 유지한다.

- graph storage 선택과 Cypher boundary
- `GraphOperations`, schema, transaction, merge, execution model 가이드
- Graph I/O format, benchmark context, mean-only quick-run 표
- ERD와 Spring Boot/Ktor integration example이 있는 workshop scenario

## 검증

- `git diff --check`
- `npm run build`
- 한국어·영어 Graph Part 1-4 local route 확인
- 갱신한 graph diagram과 ERD의 rendered PNG 검사

## 향후 가이드

repository example과 README link만 나열하는 graph 글을 게시하지 않는다. 독자가 해당 pattern을 자신의 service에 적용할 수 있는지 판단하려면 글 안에 충분한 scenario 설명이 필요하다.

benchmark result file에 standard deviation이나 error 값이 없으면 placeholder column을 만들거나 "not in the original quick-run" 같은 third-party note를 쓰지 않는다. 존재하는 metric, 실행 형태, 해당 값을 사용하는 데 따르는 한계를 밝힌다.
