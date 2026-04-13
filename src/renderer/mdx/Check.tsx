import { Checkbox, Label, Description } from "@heroui/react";
import { useContext } from "react";
import { DocContext } from "./doc-context";
import { useOnboardingStore } from "@/store/onboarding-store";

interface Props {
  id: string;
  hint?: string;
  children: React.ReactNode;
}

export function Check({ id, hint, children }: Props) {
  const docId = useContext(DocContext);
  if (!docId)
    throw new Error("<Check> must be used inside a DocContext.Provider");
  const key = `${docId}:${id}`;
  const checked = useOnboardingStore((s) => !!s.checks[key]);
  const toggle = useOnboardingStore((s) => s.toggleCheck);

  return (
    <Checkbox
      className="mdx-check"
      isSelected={checked}
      onChange={() => toggle(docId, id)}
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content className="mdx-check-content">
        <Label className="mdx-check-label">{children}</Label>
        {hint && <Description>{hint}</Description>}
      </Checkbox.Content>
    </Checkbox>
  );
}
