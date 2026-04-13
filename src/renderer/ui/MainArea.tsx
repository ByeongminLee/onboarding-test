import { TopBar } from './TopBar';
import { ContentArea } from './ContentArea';

export function MainArea() {
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-auto">
        <ContentArea />
      </div>
    </main>
  );
}
