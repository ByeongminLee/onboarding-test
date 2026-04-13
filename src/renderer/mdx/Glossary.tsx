interface Props {
  term: string;
  children: React.ReactNode;
}

export function Glossary({ term, children }: Props) {
  return (
    <div className="my-2 rounded border border-[var(--border)] bg-[var(--surface2)] p-3">
      <div className="font-semibold text-[var(--learn)]">{term}</div>
      <div className="text-sm text-[var(--text-dim)]">{children}</div>
    </div>
  );
}
