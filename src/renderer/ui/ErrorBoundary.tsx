import { Component, type ReactNode } from 'react';

interface Props {
  docId: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.docId !== this.props.docId && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-6 rounded border border-[var(--warn)] bg-[var(--surface2)] p-4">
          <h3 className="mb-2 font-semibold text-[var(--warn)]">
            문서를 렌더링할 수 없습니다
          </h3>
          <p className="mono text-xs text-[var(--text-dim)]">{this.props.docId}</p>
          <p className="mt-2 text-sm">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
