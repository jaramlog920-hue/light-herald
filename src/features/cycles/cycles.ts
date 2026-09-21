/** 회독별 칭호. 4회차 이상은 3회차 칭호를 유지한다 */
export const CYCLE_TITLES: Record<number, string> = {
  1: '길을 걷는 전령',
  2: '복음을 아는 증인',
  3: '말씀을 지키는 제자',
}

export function cycleTitle(cycle: number): string {
  return CYCLE_TITLES[Math.min(cycle, 3)] ?? CYCLE_TITLES[1]
}
