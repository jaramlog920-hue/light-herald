/** 회독별 칭호. 전령 → 증인 → 제자 → 사도 → 땅 끝까지. 6회차 이상은 5회차 칭호를 유지한다 */
export const CYCLE_TITLES: Record<number, string> = {
  1: '길을 걷는 전령',
  2: '복음을 아는 증인',
  3: '말씀을 지키는 제자',
  4: '빛 가운데 행하는 자',
  5: '땅 끝까지 이른 전령',
}

export const MAX_CYCLE_THEME = 5

export function cycleTitle(cycle: number): string {
  return CYCLE_TITLES[Math.min(cycle, MAX_CYCLE_THEME)] ?? CYCLE_TITLES[1]
}

