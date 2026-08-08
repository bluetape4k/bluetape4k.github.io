# 2026-06-02 Exposed Part 1 교정

## 배경

merge된 cache/projects 교정 stack 다음의 시간순 blog 항목은 `bluetape4k-exposed` Part 1이었다. 한국어 글은 있었지만 영어 대응 글이 없었다.

## 결정

source에 근거한 Exposed/JDBC/R2DBC/Virtual Threads 주장을 유지하고 한국어 자연스러움만 작게 다듬는다. 동일한 benchmark 수치, source link, 운영상 주의점을 가진 영어 대응 글을 추가한다.

## 결과

영어 Part 1 글을 추가하고 한국어 버전을 가볍게 교정했다. 이후 영어 Exposed 글은 한 편씩 추가할 예정이므로 영어 series link는 현재 Part 1만 포함한다.

## 검증

PR을 열기 전에 `git diff --check`와 `npm run build`를 실행한다.
