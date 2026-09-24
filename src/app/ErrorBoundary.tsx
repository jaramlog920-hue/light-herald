import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  message: string | null
}

/** 한 화면에서 예기치 못한 오류가 나도 앱 전체가 빈 화면이 되지 않게 한다 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null }

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown) {
    console.error('화면 오류:', error)
  }

  render() {
    if (this.state.message === null) return this.props.children
    return (
      <main className="reader">
        <h1>화면을 열지 못했습니다</h1>
        <p className="muted">
          주소가 잘못되었거나 저장된 기록에 문제가 있을 수 있습니다. 읽은 기록은 그대로 있으니 아래로 돌아가 주세요.
        </p>
        <p className="muted" style={{ fontSize: 12 }}>{this.state.message}</p>
        <a className="btn primary btn-block" href="/">
          지도로 돌아가기
        </a>
      </main>
    )
  }
}
