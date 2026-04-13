import { MDXProvider } from "@mdx-js/react";
import { type ComponentProps, type ReactNode } from "react";
import { Check } from "./Check";
import { Quiz } from "./Quiz";
import { Mission, MissionNote } from "./Mission";
import { Glossary } from "./Glossary";
import { Head } from "./Head";
import { Mermaid } from "./Mermaid";
import { Flow } from "./Flow";
import { MatrixTable } from "./MatrixTable";

export { DocContext } from "./doc-context";

function Pre(props: ComponentProps<"pre">) {
  const child = props.children;
  if (
    child &&
    typeof child === "object" &&
    "props" in child &&
    child.props &&
    typeof child.props === "object"
  ) {
    const codeClass =
      "className" in child.props && typeof child.props.className === "string"
        ? child.props.className
        : "";
    const codeText =
      "children" in child.props && typeof child.props.children === "string"
        ? child.props.children
        : "";

    if (codeClass.includes("language-mermaid")) {
      return <Mermaid chart={codeText} />;
    }
  }

  return <pre {...props} />;
}

const components = {
  Check,
  Quiz,
  Mission,
  MissionNote,
  Glossary,
  Head,
  Flow,
  MatrixTable,
  pre: Pre,
};

export function MdxComponents({ children }: { children: ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
