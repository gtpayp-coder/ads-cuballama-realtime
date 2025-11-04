import dynamic from 'next/dynamic';
const ComboGrid = dynamic(() => import('@/components/ComboGrid'), { ssr: false });

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Combo del momento (Cuballama)</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Dati aggiornati periodicamente dalla pagina pubblica di Iré a Santiago (Cuballama).
      </p>
      <ComboGrid />
    </main>
  );
}
