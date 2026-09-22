import { motion } from 'framer-motion'
import { APP_TITLE, APP_SUBTITLE } from '../../app/branding'
import '../cards/cards.css'
import './guide.css'

const STEPS: { icon: string; title: string; body: string }[] = [
  { icon: '📖', title: '한 장을 읽고 "읽음"을 누르세요', body: '신약 27권 260장, 개역한글 본문이 들어 있어요. 읽은 장만큼 어두운 지도에 빛이 번집니다 — 예루살렘에서 로마까지.' },
  { icon: '🧩', title: '미션을 풀면 기록 카드가 열려요', body: '퀴즈 · 빈칸 채우기 · 말씀 조각 맞추기 · 사건 추리 · 선택의 순간. 그 장의 미션을 모두 완료하면 사건 기록 · 인물 인장 · 말씀 조각 카드가 복원됩니다.' },
  { icon: '💎', title: '말씀 조각을 맞추면 보석을 얻어요', body: '약속의 보석은 다른 미션에서 힌트를 볼 때 하나씩 씁니다.' },
  { icon: '🔖', title: '구절을 길게 누르면 북마크', body: '메모를 남길 수 있고, 회독 화면에서 모아 보고 바로 갈 수 있어요. 북마크는 회독이 바뀌어도 남습니다.' },
  { icon: '🖼', title: '책을 다 읽으면 그림이 완성돼요', body: '책 목록에서 각 권의 장 목록이 퍼즐판이에요. 장을 읽을 때마다 조각이 드러나고, 완독하면 그림을 열 수 있어요.' },
  { icon: '🗺', title: '260장을 다 읽으면 완주', body: '기념 지도를 이미지로 저장하고, 다음 회독을 시작할 수 있어요. 회차마다 지도의 빛깔과 칭호가 달라집니다.' },
  { icon: '💾', title: '기록은 이 기기에만 저장돼요', body: '폰을 바꾸거나 브라우저 데이터를 지우면 사라집니다. 회독 화면 → JSON 내보내기로 가끔 백업해 두세요.' },
]

/** 상단 (?)로 여는 사용 안내 */
export function GuideSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-backdrop" role="dialog" aria-label="사용 안내" onClick={onClose}>
      <motion.div
        className="sheet guide"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>
          {APP_TITLE}: {APP_SUBTITLE}
        </h2>
        <p className="muted guide-lead">신약을 읽을수록 고대 지도에 빛이 번지는 통독 게임입니다.</p>
        <ol className="guide-steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <span className="guide-icon" aria-hidden>
                {s.icon}
              </span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="muted guide-install">
          📱 홈 화면에 앱처럼 설치: 안드로이드는 크롬 메뉴 → "홈 화면에 추가", 아이폰은 사파리 공유 → "홈 화면에 추가". 카카오톡 안에서 열렸다면 먼저 "브라우저로 열기"를 눌러 주세요.
        </p>
        <button className="btn primary btn-block" onClick={onClose}>
          시작하기
        </button>
      </motion.div>
    </div>
  )
}
