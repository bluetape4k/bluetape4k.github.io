# 부끄러운 버그가 만든 안전장치 블로그

## 배경

작고 부끄러운 실수가 지속적인 test와 release guard로 발전한, 해결된 `bluetape4k-projects` issue를 바탕으로 blog 글이 필요했다.

## 결정

issues #491, #595, #602, #654, #656/#657의 근거가 있는 다섯 사례를 사용하고, #497을 release-gate pattern으로 마무리한다.

## 결과

게시 가능한 Starlight blog 글, `docs/blog` 아래의 working-source copy, pastel summary image asset을 추가했다.

## 검증

편집 후 `npm run build`를 실행하고 이미지를 preview한다. 문체는 솔직하게 유지하되 issue, PR, lesson 근거를 벗어나지 않는다.

## 향후 agent

솔직한 postmortem 스타일 글에서는 사람을 탓하지 않는다. 각 실수를 regression test, bounded cleanup, release gate, lifecycle rule 중 구체적인 guard에 연결한다.
