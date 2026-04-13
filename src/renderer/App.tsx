import { contentTree } from '@/content';

export default function App() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">파트 {contentTree.length}개 로드됨</h1>
      <ul className="list-disc pl-5">
        {contentTree.map(p => (
          <li key={p.id}>{p.title} ({p.docs.length}개 문서)</li>
        ))}
      </ul>
    </div>
  );
}
