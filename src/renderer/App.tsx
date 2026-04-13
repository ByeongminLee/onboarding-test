import { Button } from '@heroui/react';

export default function App() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Onboarding App</h1>
      <Button variant="primary" onPress={() => alert('ok')}>테스트 버튼</Button>
    </div>
  );
}
