# 빛의 전령 3단계 (기록 카드·묵상·완주) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 장을 읽으면 사건/인물/말씀 카드를 얻고, 묵상 한 줄을 남기며, 27권 완주 시 나만의 지도를 본다.

**Architecture:** 카드 획득은 저장하지 않고 `readChapters`에서 파생(`resolveCards`). 인물 관계도는 `people.json`의 노드·엣지 중 획득한 인물만 활성. 묵상은 스토어 `notes`. 완주 화면은 canvas로 지도+묵상을 PNG로 그린다.

**Tech Stack:** 0~2단계와 동일.

## Global Constraints
- 카드 없는 장은 기본 "말씀의 등불" 카드(`type: 'word'`, id `lamp:<ref>`)로 폴백
- 예수님 관련 카드는 `event`(사건 기록)로만, `person` 카드는 예수님 외 인물
- 카드 id 형식 `<ref>:<slug>` (예 `jhn:3:nicodemus`)

## Tasks

### Task 1: 카드·인물 콘텐츠와 파생 함수
- `types.ts`: `Card { id ref type title summary verseRef personId? }`, `Person { id name role }`, `Relation { from to label }`
- `cards.json` 70장 내외, `people.json { persons, relations }`
- `features/cards/resolveCards.ts`: `cardsForRef(ref): Card[]` (없으면 lamp 폴백), `resolveCards(readChapters): EarnedCard[]` (`{ card, earnedAt }`), `earnedPersonIds(readChapters): Set<string>`
- 테스트: 스키마(ref·personId 유효), 폴백, 파생

### Task 2: 획득 연출 + 묵상
- `features/cards/CardFace.tsx` (type별 색), `features/reader/RewardSheet.tsx`: 읽음 직후 카드 + 묵상 입력 + [지도 보기][다음 장]
- ChapterView: 읽음 클릭 → RewardSheet 표시; 이미 읽은 장은 하단에 묵상 편집 영역
- 테스트: 읽음 → 시트 표시 → 묵상 저장

### Task 3: 카드장 + 인물 관계도
- `/cards`: 타입 탭, 획득/미획득(실루엣) 그리드, 탭 → 상세
- `/people`: SVG 원형 배치 그래프, 획득 인물만 밝게, 엣지 라벨
- 지도 하단 버튼에 [카드장] 추가

### Task 4: 지도 마커 탭 → 기록 패널
- CityLayer 클릭 → `MapView`가 `selectedCity` 상태 → 하단 패널: 그 도시에서 켜진 ref들(발자국/확산/교회) + 읽은 날짜 + 묵상, "읽으러 가기" 링크

### Task 5: 완주 화면
- `/complete`: 260장 완료 시 지도에서 [완주 보기] 노출. 문구, 시작·완료 날짜, 묵상 목록, canvas PNG 저장
- 테스트: 미완주 시 안내, 완주 시 문구
