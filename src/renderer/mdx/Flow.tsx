interface FlowProps {
  steps: string[];
}

export function Flow({ steps }: FlowProps) {
  return (
    <div className="mdx-flow" role="group" aria-label="프로세스 플로우">
      {steps.map((step, idx) => (
        <div key={`${step}-${idx}`} className="mdx-flow-item">
          <div className="mdx-flow-step">
            <span className="mdx-flow-index">{idx + 1}</span>
            <span>{step}</span>
          </div>
          {idx < steps.length - 1 ? (
            <div className="mdx-flow-arrow">↓</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
