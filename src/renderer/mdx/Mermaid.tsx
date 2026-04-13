import { useEffect, useMemo, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  const id = useMemo(
    () => `mermaid-${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  useEffect(() => {
    let active = true;

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });

    mermaid
      .render(id, chart)
      .then((result) => {
        if (!active) return;
        setSvg(result.svg);
        setError("");
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Mermaid 렌더링 오류");
      });

    return () => {
      active = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="mdx-mermaid-error">
        <p>Mermaid 다이어그램 렌더링 실패</p>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="mdx-mermaid-loading">다이어그램 렌더링 중...</div>;
  }

  return (
    <div className="mdx-mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
