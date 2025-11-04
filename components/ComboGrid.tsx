'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ComboCard from './ComboCard';

type Combo = {
  id: number;
  nome: string;
  fornitore: string | null;
  prezzo_usd: number | null;
  tempi: string | null;
  immagine_url: string | null;
  source_url: string | null;
  attivo: boolean;
  sort_order?: number | null;
};

export default function ComboGrid() {
  const [data, setData] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [supplier, setSupplier] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('combos')
        .select('id, nome, fornitore, prezzo_usd, tempi, immagine_url, source_url, attivo, sort_order')
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('prezzo_usd', { ascending: true, nullsFirst: true });
      if (!cancelled) {
        if (error) console.error(error);
        setData(data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const suppliers = useMemo(() => {
    const s = new Set<string>();
    data.forEach(d => d.fornitore && s.add(d.fornitore));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() =>
    data.filter(d =>
      (!onlyActive || d.attivo) &&
      (!supplier || d.fornitore === supplier) &&
      (!q || d.nome.toLowerCase().includes(q.toLowerCase()))
    ), [data, q, onlyActive, supplier]);

  if (loading) return <div className="text-neutral-500">Caricamento…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Cerca combo…"
          className="px-3 py-2 rounded-xl border border-neutral-300 bg-white"
        />
        <select
          value={supplier}
          onChange={e => setSupplier(e.target.value)}
          className="px-3 py-2 rounded-xl border border-neutral-300 bg-white"
        >
          <option value="">Tutti i fornitori</option>
          {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} />
          Solo attivi
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="text-neutral-500">Nessun risultato.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => <ComboCard key={c.id} combo={c} />)}
        </div>
      )}
    </div>
  );
}
