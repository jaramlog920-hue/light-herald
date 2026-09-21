# 빛의 전령: 신약 아카이브 — 로드맵 설계

작성일: 2026-09-22
상태: 승인됨 (구현 전)

## 1. 개요

성경의 기록이 흩어져 어두워진 세계에서, 플레이어가 신약 27권 260장을 읽으며
기억의 조각을 되찾아 이야기를 복원하는 웹 게임. 핵심 재미는 **"읽을수록 세계가 살아남"** —
어두운 고대 지도 위 예루살렘 한 점의 빛이 읽기 진행에 따라 로마까지 번진다.

전투 없음. 캐릭터는 "기록의 전령"으로 동행하는 존재.

## 2. 확정 결정

| 항목 | 결정 |
|---|---|
| 프로젝트 | `cloooo/light-herald` 독립 프로젝트 (jaramlog와 무관) |
| 스택 | Vite + React + TypeScript, 모바일 우선 PWA, 정적 호스팅 |
| 상태 관리 | Zustand + localStorage persist (단일 progress 스토어) |
| 애니메이션 | Framer Motion + SVG/CSS |
| 진행 데이터 | 브라우저 로컬 저장. 계정 동기화는 6단계(선택) |
| 성경 본문 | 개역한글(퍼블릭 도메인) 신약 전문 내장 |
| 이미지 에셋 | 사용자가 제공. 준비 전에는 플레이스홀더 |
| 단계 전략 | B: 시스템 레이어 순 (읽기 → 지도 → 카드 → 미니게임 → 회독) |

## 3. 아키텍처 원칙

### 3.1 콘텐츠와 코드 분리
성경 본문, 책 메타, 지도 좌표, 지도 규칙, 카드, 미션은 전부 `src/content/*.json`.
코드는 JSON 스키마만 알고 내용은 모른다. 콘텐츠가 비어 있어도(카드 없는 장, 미션 없는 장)
앱은 폴백으로 동작한다. 콘텐츠 채우기는 코딩 없이 JSON 편집으로 가능해야 한다.

### 3.2 단일 진행 스토어, 단방향 의존
```
ProgressStore {
  cycle: 1 | 2 | 3
  readChapters: Record<cycle, Record<"book:chapter", { readAt: ISOString }>>
  notes: Record<"book:chapter", string>          // 묵상 한 줄
  cards: Record<cardId, { earnedAt }>
  missions: Record<missionId, { clearedAt, hintsUsed }>
  gems: number                                    // 약속의 보석
}
```
쓰기 액션은 `markRead`, `saveNote`, `clearMission`, `startNextCycle`, `importJSON` 뿐.
지도·카드·미션 레이어는 스토어를 **읽기만** 한다. 파생 상태(어떤 도시가 켜졌는지,
어떤 카드를 얻었는지)는 selector로 계산하며 저장하지 않는다.

### 3.3 데이터 주도 지도
지도는 배경 이미지 + SVG 오버레이 하나. 도시·경로 좌표는 `map.json`,
"어떤 장을 읽으면 무엇이 켜지는가"는 `map-rules.json`. 지도 컴포넌트는 규칙을
해석만 하고 성경 지식을 하드코딩하지 않는다.

### 3.4 폴더 구조 (feature-first)
```
light-herald/
  docs/superpowers/specs/
  scripts/            # 본문 변환 스크립트
  public/             # 이미지 에셋, manifest, 아이콘
  src/
    content/          # nt-krv.json, books.json, map.json, map-rules.json, cards.json, missions.json
    store/            # progress.ts (Zustand)
    features/
      reader/         # 1단계
      map/            # 2단계
      cards/          # 3단계
      missions/       # 4단계
      cycles/         # 5단계
    shared/           # 공용 UI, 유틸, 타입
    app/              # 라우팅, 레이아웃
```

## 4. 단계별 상세

### 0단계 — 기반·데이터
- Vite+React+TS 골격, ESLint, Prettier, Vitest
- `scripts/build-bible.ts`: 공개 개역한글 데이터셋 → `nt-krv.json` (`{ [bookId]: string[][] }`, 장→절 배열). 출처·라이선스를 README에 기록
- `books.json`: 27권 `{ id, name, abbr, chapters, group: gospel|acts|pauline|general|revelation, region }`
- `map.json`: 도시 약 20곳 `{ id, name, x, y }` (0~1000 정규화 좌표) + 바울 항로 `routes[]`
- 완료 기준: 본문 로더 테스트에서 27권·260장·절 수 > 0 검증

### 1단계 — 읽기 + 진행 저장
- 화면: 책 목록 → 장 목록 → 본문(절 번호) → 하단 "읽음" 버튼
- `markRead` 시 날짜 기록, 이미 읽은 장은 재읽기 가능하되 최초 날짜 유지
- 진행률: 책별 / 전체 %, 마지막 읽던 위치로 이어가기
- 완료 기준: 마 1장~계 22장 체크 가능, 새로고침·재접속 후 유지

### 2단계 — 살아나는 지도 (첫 화면)
- 첫 화면 = 지도. 초기 상태: 안개 속 예루살렘 한 점만 빛남
- `map-rules.json` 규칙 형식:
  ```json
  { "when": { "book": "act", "chapter": 8 }, "effect": "spread", "to": "samaria" }
  { "when": { "bookComplete": "rom" }, "effect": "church", "at": "rome", "label": "은혜의 기초" }
  { "when": { "book": "mat", "chapter": 4 }, "effect": "footprint", "at": "galilee" }
  { "when": { "bookComplete": "rev" }, "effect": "new-jerusalem" }
  ```
- 효과 종류: `footprint`(복음서 발자국), `spread`(사도행전 빛 확산 원·연결선), `church`(서신서 교회+주제 라벨), `new-jerusalem`(계시록)
- "읽음" 후 지도 복귀 시 새로 켜진 요소만 애니메이션. 이미 켜진 것은 즉시 표시
- 도시 탭 → 관련 책/장 목록으로 이동
- 완료 기준: 초기 예루살렘만 빛남; 사도행전 28장 읽으면 로마까지 빛 연결; 로마서 완독 시 로마에 교회

### 3단계 — 기록 카드 + 묵상 + 완주 화면
- `cards.json`: `{ id, chapterRef, type: event|person|word, title, summary, verseRef }`. 예수님 관련은 "사건 기록 카드"로만
- 읽음 시 해당 장 카드 획득 연출. 카드장: 획득/미획득(실루엣). 카드 없는 장은 기본 "말씀의 등불" 카드
- 인물 인장(person 카드) 누적 → 인물 관계도(노드·엣지 JSON, 간단 SVG 그래프)
- 묵상: 읽음 시 한 줄 입력(선택). 지도 마커 탭 → 그 장의 묵상·읽은 날짜
- 완주 화면: 27권 완료 시 "복음은 예루살렘에서 시작되어, 당신의 오늘까지 왔습니다." + 묵상·날짜가 오버레이된 나만의 지도 + PNG 저장
- 완료 기준: 카드 폴백 동작, 완주 플로우 동작

### 4단계 — 미션·미니게임
- 공통 미션 프레임: `missions.json` `{ id, type, chapterRef, data }`. 정답/오답 UI 공통. 오답 시 혼내지 않고 힌트(해당 절 링크) 제공
- 6종 타입, 각각 컴포넌트 하나:
  1. `quiz` 사건 추리 — 4지선다 (누가 말했나 / 어느 도시)
  2. `gospel-detective` 복음서 탐정 — 마태/마가/누가/요한 다중선택
  3. `voyage` 바울의 항해 — 지도 위 도시 순서 연결
  4. `deliver` 편지 배달 — 서신서 완료 시 편지를 도시로 드래그
  5. `word-puzzle` 말씀 조각 맞추기 — 단어 카드 순서
  6. `choice` 선택의 순간 — 상황·선택지·해설
- 장 읽음 → 그 장 미션 1개 해금. 미션 없는 장은 버튼 비활성
- `word-puzzle` 클리어 → 약속의 보석 +1, 보석은 다른 미션 힌트에 사용
- 콘텐츠는 복음서 앞부분부터 채우고 점진 확장
- 완료 기준: 6종 각 1문항 이상 동작

### 5단계 — 회독·PWA 마감
- 완주 시 다음 회독 시작. 회독별 칭호: 1 길을 걷는 전령 / 2 복음을 아는 증인 / 3 말씀을 지키는 제자
- 회독별 지도 색 테마 변경, 이전 회독 기록 보존·열람
- PWA: manifest, 서비스워커(본문·콘텐츠 오프라인 캐시), 설치 안내
- JSON 내보내기/가져오기(병합 규칙: 읽은 장은 합집합, 묵상은 최신 우선)
- 완료 기준: Lighthouse PWA 통과, 오프라인 읽기·체크 가능

### 6단계(선택) — 계정 동기화
Supabase Auth + progress 테이블, 로컬↔클라우드 병합. 별도 스펙으로 진행.

## 5. 검증 지점
1~2단계 완료 후 실제로 며칠 사용해 보고 3단계 이후 우선순위를 재조정한다.

## 6. 에셋 요청 목록 (사용자 제공)

| 필요 시점 | 에셋 | 요구사항 |
|---|---|---|
| 2단계 | 고대 지도 배경 1장 | 지중해 동부(이탈리아~이스라엘), 어두운 양피지 톤, 2000px 이상, 세로/가로 크롭 모두 가능 |
| 2단계 | 전령 캐릭터 1~2장 | 첫 화면·완주 화면용, 정면/걷는 모습, 투명 배경 PNG |
| 3단계 | 카드 프레임 3종 | 사건/인물/말씀 구분 테두리, 투명 배경 |
| 3단계 | 인물 일러스트(선택) | 없으면 인장(도장) 스타일 아이콘을 코드로 생성 |
| 5단계 | 앱 아이콘 | 등불 모티프, 512×512 |

빛, 안개, 발자국, 교회 아이콘, 항로선, 새 예루살렘 이펙트는 SVG/CSS로 코드에서 생성.

## 7. 테스트 전략
- 콘텐츠 JSON: 스키마 검증 테스트(장 참조가 실제 존재하는지, 규칙의 도시 id가 map.json에 있는지)
- 스토어: 액션 단위 테스트, persist 직렬화/역직렬화, 가져오기 병합
- 지도 규칙 해석기: 읽은 장 집합 → 켜진 요소 집합 순수 함수 테스트
- 미션: 타입별 채점 로직 순수 함수 테스트
- UI: 핵심 플로우(읽음 → 지도 갱신) Testing Library 통합 테스트

## 8. 범위 밖
- 구약, 다국어, 소셜·커뮤니티 기능, 서버 사이드 로직 (6단계 제외)
