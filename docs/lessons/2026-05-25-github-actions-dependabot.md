# GitHub Actions Dependabot 적용 범위

## 배경

`bluetape4k-graph`가 GitHub Actions 갱신을 위한 Dependabot grouped pull request를 받았지만, 이 저장소에는 `.github/dependabot.yml`이 없어서 같은 자동 action-version 갱신을 받지 못했다.

## 결정

`develop`을 대상으로 GitHub Actions 전용 Dependabot 설정을 추가한다. `bluetape4k-dependencies`가 중앙 버전 거버넌스의 기준으로 남아 있으므로 leaf repository에는 Gradle과 Maven dependency 갱신을 넣지 않는다.

## 결과

Dependabot이 매주 GitHub Actions를 확인하고 모든 action 갱신을 `github-actions` group으로 묶는다.

## 검증

- Ruby YAML로 `.github/dependabot.yml`을 parse했다.
- `git diff --check`를 실행했다.
- workspace scan에서 GitHub Actions Dependabot 적용이 누락된 저장소가 없음을 확인했다.

## 향후 가이드

bluetape4k 저장소에 workflow를 추가할 때는 Dependabot에 `github-actions` ecosystem 항목과 grouped `github-actions` update rule이 있는지 확인한다.
