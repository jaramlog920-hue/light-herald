import missionsJson from '../../content/missions.json'
import hand2Json from '../../content/missions-hand-2.json'
import hand3Json from '../../content/missions-hand-3.json'
import hand4Json from '../../content/missions-hand-4.json'
import hand5Json from '../../content/missions-hand-5.json'
import generatedJson from '../../content/missions-generated.json'

/** 지금 존재하는 모든 미션 id. 저장된 기록을 청소할 때 쓴다 */
export const MISSION_IDS: Set<string> = new Set(
  [missionsJson, hand2Json, hand3Json, hand4Json, hand5Json, generatedJson].flatMap((f) =>
    (f as { id: string }[]).map((m) => m.id),
  ),
)

/** 내용을 고치며 자리를 옮긴 미션 — 이미 완료한 사람의 기록을 잃지 않게 이어 준다 */
export const RENAMED_MISSIONS: Record<string, string> = {
  // 빌립보 감옥 장면은 행 16장이므로 옮겼다 (2026-09-22)
  'act:17:choice': 'act:16:choice',
}
