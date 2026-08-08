# 2026-06-02 Exposed Part 5 교정

## 배경

Exposed Part 4가 merge된 뒤 다음 글은 Spring Boot integration, cache strategy, multi-tenancy, outbox/idempotency, production example을 다루는 한국어 전용 Part 5였다.

## 결정

workload-first 운영 가이드를 유지하고 자연스러움만 작게 다듬는다. 영어 대응 글을 추가하고 Parts 1-5가 모두 존재하므로 영어 Exposed series link도 완성한다.

## 결과

영어 Part 5 글을 추가하고 영어 Part 1-4 series navigation을 완전한 5편 시리즈로 갱신했으며, benchmark와 source claim을 바꾸지 않고 한국어 Part 5를 가볍게 교정했다.

## 검증

`git diff --check`와 `npm run build`를 실행한 뒤 PR을 연다.
