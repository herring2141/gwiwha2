# 한글 타자 연습 (귀화 작문)

귀화시험 앱의 동반 도구. 와이프가 작문 모범답안을 직접 타이핑할 수 있도록, 한컴타자연습 형태로
한글 자판 **자리연습 → 낱글자 → 단문 → 귀화 작문(장문)** 단계를 연습하는 설치형 PWA.

- 라이브: https://seunghoonchoi-phd.github.io/gwiwha/typing/
- 귀화앱 홈의 "⌨️ 타자 연습" 카드로 진입.

## 특징
- **OS 한글 IME 불필요.** 물리 키(`event.code`)를 두벌식 오토마타로 직접 한글로 조합한다.
  자판이 익숙하지 않아도 화면이 "다음 누를 키 + 손가락"을 알려준다.
- 가상 키보드에 손가락 색상존 + 다음 키 하이라이트 + 손가락 점등.
- 정답 판정은 타깃 문자열을 표준 두벌식 자모 키 시퀀스로 분해해 키 단위로 비교.
- ko/中 전환(상단 `한·中`). 단문·장문은 중국어 의미를 함께 표시.
- 통계: 시간 · 타수(타/분) · 정확도 · 오타. 최고 타수는 기기별 localStorage 저장.
- 딥링크: `#모드/번호` (예: `#long/0`). 모드 = position / syllable / short / long.

## 파일
- `index.html` `styles.css` `app.js` — UI·로직
- `hangul.js` — 두벌식 키맵 + 손가락 배열 + 한글 조합 오토마타(순수 함수, node 검증됨)
- `data.js` — **자동 생성**. 원본은 상위 `../questions.json` (type=writing).
  재생성: 리포지토리 밖 `scratchpad/gen_data.py` 참고(작문 46개: 귀화 16 + 사전평가 30).
- `manifest.webmanifest` `sw.js` `icon*` — PWA

## 검증
- `hangul.js`는 전체 한글 음절 11,172자 + 모든 작문 모범답안에 대해
  `compose(textToKeystrokes(s)) === sanitize(s)` 라운드트립을 통과.
- 배포 시 `sw.js`의 `CACHE` 숫자만 올리면 설치된 기기가 다음 접속 때 자동 갱신.
