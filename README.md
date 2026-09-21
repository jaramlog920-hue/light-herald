# 복음의 전령: 땅 끝까지

신약을 읽을수록 어두운 고대 지도에 빛이 번지는 웹 게임.

## 개발

```bash
npm i
npm run dev
npm test
npm run build
```

## 본문 출처

개역한글판(1961) — 저작재산권 보호기간 만료(퍼블릭 도메인).
데이터: https://github.com/kuris/bible (`data/krv`). `npm run build:bible`로 `src/content/nt-krv.json`을 재생성한다.

## 구조

- `src/content/` — 본문·책 메타·지도 좌표·지도 규칙·카드·인물·미션 JSON. 코드는 형식만 알고 내용은 모른다.
- `src/store/progress.ts` — 진행 상태 단일 스토어(localStorage persist). 쓰기 액션: markRead, saveNote, clearMission, startNextCycle, importState.
- `src/features/` — reader(읽기), map(살아나는 지도), cards(기록 카드·인물 관계도), missions(6종 미니게임), complete(완주), cycles(회독·백업).

## 콘텐츠 채우기

카드는 `src/content/cards.json`, 미션은 `src/content/missions.json`에 항목을 추가하면 된다. 없는 장은 기본 카드로 폴백되고, 미션 없는 장은 미션 버튼이 나타나지 않는다. `npm test`가 참조 무결성(장·도시·인물 id)을 검사한다.

## 이미지 교체

- 지도 배경: `public/assets/map-bg.webp` (좌표는 `src/content/map.json`, 1536×1024 기준)
- 앱 아이콘: `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`

## 설계 문서

`docs/superpowers/specs/`, `docs/superpowers/plans/`
