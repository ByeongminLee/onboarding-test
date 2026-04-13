interface MissionProps {
  title: string;
  description: string;
}

export function Mission({ title, description }: MissionProps) {
  return (
    <div className="my-4 rounded-lg border-l-4 border-[var(--mission)] bg-[var(--surface2)] p-4">
      <h4 className="mb-1 font-semibold text-[var(--mission)]">{title}</h4>
      <p className="text-sm text-[var(--text-dim)]">{description}</p>
    </div>
  );
}

export function MissionNote() {
  return null;
}
