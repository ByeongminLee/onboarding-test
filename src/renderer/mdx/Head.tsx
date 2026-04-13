interface Props {
  title: string;
  date?: string;
  description?: string;
}

export function Head({ title, date, description }: Props) {
  return (
    <header className="mb-6 border-b border-[var(--border)] pb-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-[var(--text-dim)]">{description}</p>}
      {date && <p className="mono text-xs text-[var(--text-dim)]">{date}</p>}
    </header>
  );
}
