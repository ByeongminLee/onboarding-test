import { RadioGroup, Radio, Label } from '@heroui/react';
import { useContext } from 'react';
import { DocContext } from './doc-context';
import { useOnboardingStore } from '@/store/onboarding-store';

interface Props {
  question: string;
  options: string[];
  answer: number;
}

export function Quiz({ question, options, answer }: Props) {
  const docId = useContext(DocContext);
  if (!docId) throw new Error('<Quiz> must be used inside a DocContext.Provider');
  const selected = useOnboardingStore((s) => s.quizzes[docId]);
  const setAnswer = useOnboardingStore((s) => s.setQuizAnswer);

  const answered = selected !== undefined;
  const correct = answered && selected === answer;

  return (
    <div className="my-4 rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-4">
      <p className="mb-3 font-medium">💬 {question}</p>
      <RadioGroup
        value={selected !== undefined ? String(selected) : ''}
        onChange={(v: string) => setAnswer(docId, Number(v))}
      >
        {options.map((opt, i) => (
          <Radio key={i} value={String(i)}>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>{opt}</Label>
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>
      {answered && (
        <p className={`mt-3 text-sm ${correct ? 'text-[var(--accent)]' : 'text-[var(--warn)]'}`}>
          {correct ? '✅ 정답!' : '❌ 다시 확인해보세요.'}
        </p>
      )}
    </div>
  );
}
