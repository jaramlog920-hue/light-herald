# 빛의 전령 0~2단계 (기반·읽기·지도) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 신약 27권 260장을 앱 안에서 읽고 "읽음"을 누르면 어두운 고대 지도에 빛이 번지는, 플레이 가능한 첫 버전을 만든다.

**Architecture:** 콘텐츠(본문·책 메타·지도 좌표·규칙)는 전부 `src/content/*.json`, 진행 상태는 Zustand persist 단일 스토어. 지도는 배경 이미지 위 SVG 오버레이이며 `map-rules.json`을 순수 함수 `resolveMap(readSet)`으로 해석해 켜진 요소를 계산한다. 쓰기 액션은 `markRead` 하나, 나머지는 읽기.

**Tech Stack:** Vite, React 19, TypeScript, react-router 7, Zustand 5 (persist), Framer Motion, Vitest + Testing Library + jsdom.

## Global Constraints

- 프로젝트 루트: `cloooo/light-herald` (git init 됨)
- 본문 출처: `https://raw.githubusercontent.com/kuris/bible/main/data/krv/{bookId}.json` (소문자). 구조 `{ book, bookName, chapters: string[][] }`. README에 출처·"저작재산권 보호기간 만료" 명시
- 지도 배경: `public/assets/map-bg.webp` (1536×1024). SVG viewBox `0 0 1536 1024`
- 모바일 우선, 다크 테마 고정, 한국어 UI
- 책 id 27개 순서 고정: `mat mrk luk jhn act rom 1co 2co gal eph php col 1th 2th 1ti 2ti tit phm heb jas 1pe 2pe 1jn 2jn 3jn jud rev`
- 장 참조 문자열: `"mat:4"`; 책 완료 트리거 키: `"book:rom"`

---

## File Structure

```
scripts/build-bible.mjs                # 원격 JSON 27개 → src/content/nt-krv.json
src/main.tsx, app/App.tsx, app/routes.tsx, app/global.css
src/content/books.json, nt-krv.json, map.json, map-rules.json, types.ts, books.ts, bible.ts
src/store/progress.ts                  # Zustand persist
src/features/reader/BookList.tsx, ChapterList.tsx, ChapterView.tsx, MarkReadButton.tsx, reader.css
src/features/map/resolveMap.ts         # 순수 함수 readSet → MapState
src/features/map/useMapState.ts, MapView.tsx, map.css, layers/{types,CityLayer,SpreadLayer,FootprintLayer,ChurchLayer,NewJerusalemLayer}.tsx
src/shared/ProgressBar.tsx
테스트는 소스 옆 *.test.ts(x)
```

---

### Task 1: 프로젝트 골격
- Vite react-ts 스캐폴드, `react-router zustand framer-motion`, dev deps `vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- `vite.config.ts` test: jsdom, globals, setupFiles `src/setupTests.ts` (`import '@testing-library/jest-dom/vitest'`)
- `App.test.tsx`: 앱 제목 렌더 확인 → `App` 최소 구현 → global.css 다크 토큰(`--bg #0b0f1a --fg #e8dcc0 --gold #e6b422 --muted #8a8270 --panel #161b2a`)
- README(출처·라이선스), 커밋 `chore: scaffold vite react ts with vitest`

### Task 2: 책 메타데이터
- `types.ts`: `BookGroup`, `Book { id code name abbr chapters group }`
- `books.json` 27권, `books.ts`: `BOOKS`, `getBook(id)`(없으면 throw), `chapterRef`, `parseRef`, `ALL_REFS`(260)
- 테스트: 27권/260장, `ALL_REFS[0]==='mat:1'`, 마지막 `'rev:22'`, 헬퍼 동작
- 커밋 `feat(content): add NT book metadata and ref helpers`

### Task 3: 개역한글 본문 내장
- `scripts/build-bible.mjs`: books.json 순회 fetch, 장 수 검증, `{ [bookId]: string[][] }`로 저장. `npm run build:bible`
- `bible.ts`: `getChapter(bookId, ch): string[]`, `verseCount`
- 테스트: 260장 모두 절 > 0, 요 3:16 '독생자' 포함, 계 22장 21절
- 커밋 `feat(content): embed KRV New Testament text with build script`

### Task 4: 진행 스토어
- `progress.ts` persist 키 `light-herald-progress` v1: `cycle, readChapters: Record<ref, ISO>, notes, lastRef, seenMapRefs, markRead(최초 날짜 유지), saveNote, setLastRef, markMapSeen(중복 제거)`
- selectors: `selectReadSet, selectBookProgress(s, bookId), selectTotalProgress`
- 테스트: 최초 날짜 유지, 선택자 값, localStorage 저장, 노트/seen
- 커밋 `feat(store): add persisted progress store`

### Task 5: 읽기 화면
- 라우트 `/`(홈) `/books` `/books/:bookId` `/read/:bookId/:chapter`
- BookList(그룹별, 진행률), ChapterList(그리드, 읽은 장 강조), ChapterView(절 번호 본문, 읽음 버튼, 다음 장 — 마지막 장이면 다음 책 1장, 지도 보기), MarkReadButton(읽음 → `✓ 읽었어요 · YYYY-MM-DD` disabled)
- 통합 테스트: 목록→장→본문→읽음→스토어 반영→다음 장 링크; 마 28 → 막 1
- `.claude/launch.json` dev 서버, 커밋 `feat(reader): book/chapter navigation and mark-read flow`

### Task 6: 지도 데이터와 규칙
- `types.ts`: `MapCity{id name x y}`, `MapData{cities routes}`, `MapRule` (footprint/spread/church/new-jerusalem)
- `map.json`: 도시 20곳(예루살렘·유대·갈릴리·사마리아·가이사랴·다메섹·안디옥·구브로·갈라디아·골로새·에베소·밧모·빌립보·데살로니가·아덴·고린도·그레데·멜리데·로마·바벨론) + 항로 4개
- `map-rules.json`: 복음서 발자국 12개, 사도행전 확산 16개(2→예루살렘 … 28→로마), 서신서 21권 교회+주제 라벨, 계시록 new-jerusalem
- 스키마 테스트: 도시 고유·범위 내, 항로/규칙이 실제 도시·ref·책 참조, 모든 서신서에 교회 규칙 존재
- 커밋 `feat(content): add map cities, routes and light rules`

### Task 7: 규칙 해석기
- `resolveMap(readSet, rules?) → MapState { litCities(항상 jerusalem), footprints, spreads, churches, newJerusalem, triggeredRefs }`, `isBookComplete`
- 테스트: 초기 예루살렘만, 행 8 → 사마리아, 사도행전 전체 → 로마, 로마서 완독 → 로마 교회 '은혜의 기초' + `book:rom`, 전체 → newJerusalem
- 커밋 `feat(map): add pure rule resolver`

### Task 8: 지도 화면 (첫 화면)
- `useMapState()`: `{ state, newRefs }`, newRefs = triggered − seen, 1.5초 후 `markMapSeen`
- 레이어 props `{ state, cities: Map, isNew(ref) }`. SpreadLayer(선 pathLength 애니, `data-testid="spread-line"`), CityLayer(`data-testid="city-{id}" data-lit`), FootprintLayer(도시 주변 원형 배치), ChurchLayer(교회 path + 라벨, 같은 도시 세로 스택), NewJerusalemLayer(파동 원 + 텍스트)
- MapView: 가로 스크롤 캔버스(aspect 1536/1024, 높이 100dvh), 배경 img + svg(glow filter), HUD(제목·진행률), 하단 `이어 읽기`(lastRef) / `읽기 시작`(mat:1) / `책 목록`. 마운트 시 오른쪽(예루살렘)으로 스크롤
- 테스트: 초기 예루살렘만 lit·로마 unlit·읽기 시작 링크; 사도행전 후 로마 lit·선 5개 초과·이어 읽기 링크; 로마서 완독 → '은혜의 기초'
- 브라우저 확인 후 좌표 미세 조정, 커밋 `feat(map): living map home screen with light spread, footprints, churches`

---

## Self-Review
- 스펙 0~2단계 요구는 Task 1–8이 덮음. "도시 탭 → 관련 책"은 3단계(마커에 묵상 표시)로 이월.
- 타입: `MapRule`(6) ↔ `resolveMap`(7) ↔ `LayerProps`(8) 일치. bookComplete 키 `book:<id>` 통일.
