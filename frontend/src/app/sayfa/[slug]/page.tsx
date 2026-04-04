import { serverFetch } from '@/lib/server-api';
import { notFound } from 'next/navigation';
import { FiFileText } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await serverFetch<any>(`/pages/${params.slug}`);
  if (!page) return { title: 'Sayfa Bulunamadı' };
  return { title: `${page.title} — Köylüoğlu Fresh` };
}

export default async function StaticPageView({ params }: { params: { slug: string } }) {
  const page = await serverFetch<any>(`/pages/${params.slug}`);
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-orange-50 rounded-xl flex items-center justify-center">
          <FiFileText className="text-brand-orange-500" size={18} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 prose prose-sm prose-gray max-w-none">
        {page.content?.split('\n').map((line: string, i: number) => {
          if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{line.replace('### ', '')}</h3>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{line.replace('## ', '')}</h2>;
          if (line.startsWith('- **')) { const m = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/); if (m) return <p key={i} className="ml-4 mb-1"><strong className="text-gray-800">{m[1]}</strong>{m[2] ? `: ${m[2]}` : ''}</p>; }
          if (line.startsWith('- ')) return <p key={i} className="ml-4 mb-1 text-gray-600">• {line.replace('- ', '')}</p>;
          if (line.startsWith('**')) return <p key={i} className="font-semibold text-gray-800 mt-3">{line.replace(/\*\*/g, '')}</p>;
          if (line.trim() === '') return <div key={i} className="h-3" />;
          return <p key={i} className="text-gray-600 leading-relaxed mb-2">{line}</p>;
        })}
      </div>
    </div>
  );
}
