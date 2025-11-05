'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

export default function AdminPage() {
  const [editId, setEditId] = useState<number | null>(null);

  const [nome, setNome] = useState('');
  // PREZZO gestito come stringa (fix TypeScript)
  const [prezzo, setPrezzo] = useState<string>('');
  const [tempi, setTempi] = useState('');
  const [fornitore, setFornitore] = useState('Cuballama');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [attivo, setAttivo] = useState(true);

  const [list, setList] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function toast(t: string) {
    setMsg(t);
    setTimeout(() => setMsg(''), 1600);
  }

  async function loadList() {
    setLoading(true);
    const { data, error } = await supabase
      .from('combos')
      .select(
        'id, nome, fornitore, prezzo_usd, tempi, immagine_url, source_url, attivo, sort_order, created_at'
      )
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setList(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadList();
  }, []);

  function resetForm() {
    setEditId(null);
    setNome('');
    setPrezzo('');
    setTempi('');
    setFornitore('Cuballama');
    setImageFile(null);
    setImageUrlInput('');
    setSourceUrl('');
    setAttivo(true);
    if (fileRef.current) fileRef.current.value = '';
  }

  function loadForEdit(c: Combo) {
    setEditId(c.id);
    setNome(c.nome ?? '');
    setPrezzo(
      c.prezzo_usd != null && !Number.isNaN(c.prezzo_usd) ? String(c.prezzo_usd) : ''
    );
    setTempi(c.tempi ?? '');
    setFornitore(c.fornitore ?? 'Cuballama');
    setImageFile(null);
    setImageUrlInput(c.immagine_url ?? '');
    setSourceUrl(c.source_url ?? '');
    setAttivo(!!c.attivo);
    if (fileRef.current) fileRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return toast('Inserisci un nome.');

    const prezzoNum = Number((prezzo ?? '').toString().replace(',', '.'));
    if (Number.isNaN(prezzoNum) || prezzoNum < 0) return toast('Prezzo non valido.');

    let finalImageUrl = imageUrlInput.trim() || null;

    if (imageFile) {
      const name = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      const { error: upErr } = await supabase.storage
        .from('combo-images')
        .upload(name, imageFile, { upsert: true });
      if (upErr) {
        console.error(upErr);
        return toast('Errore upload immagine.');
      }
      const { data: pub } = await supabase.storage
        .from('combo-images')
        .getPublicUrl(name);
      finalImageUrl = pub?.publicUrl ?? null;
    }

    const payload = {
      nome: nome.trim(),
      prezzo_usd: prezzoNum,
      tempi: tempi.trim() || null,
      immagine_url: finalImageUrl,
      source_url: sourceUrl.trim() || null,
      fornitore: fornitore.trim() || null,
      attivo,
    };

    if (editId == null) {
      const { error } = await supabase.from('combos').insert(payload);
      if (error) {
        console.error(error);
        return toast('Errore salvataggio.');
      }
      toast('Salvato.');
    } else {
      const { error } = await supabase.from('combos').update(payload).eq('id', editId);
      if (error) {
        console.error(error);
        return toast('Errore aggiornamento.');
      }
      toast('Aggiornato.');
    }

    resetForm();
    await loadList();
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminare questo combo?')) return;
    const { error } = await supabase.from('combos').delete().eq('id', id);
    if (error) {
      console.error(error);
      return toast('Errore eliminazione.');
    }
    toast('Eliminato.');
    await loadList();
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {msg && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="rounded-2xl bg-white ring-1 ring-black/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editId == null ? 'Nuovo combo' : 'Modifica combo'}
            </h2>
            {editId != null && (
              <button
                onClick={resetForm}
                className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300"
              >
                Esci
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm">
              Nome
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-neutral-300"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>

            <label className="text-sm">
              Prezzo (USD)
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-neutral-300"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                inputMode="decimal"
                required
              />
            </label>

            <label className="text-sm">
              Tempi consegna
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-neutral-300"
                value={tempi}
                onChange={(e) => setTempi(e.target.value)}
                placeholder="Es. 24-48h"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                Carica immagine
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <label className="text-sm">
                Oppure incolla URL immagine
                <input
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-neutral-300"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://…"
                />
              </label>
            </div>

            <label className="text-sm">
              Link all’offerta (source_url)
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-neutral-300"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>

            <label className="text-sm">
              Fornitore
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-neutral-300"
                value={fornitore}
                onChange={(e) => setFornitore(e.target.value)}
                placeholder="Cuballama"
              />
            </label>

            <label className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={attivo}
                onChange={(e) => setAttivo(e.target.checked)}
              />
              Attivo
            </label>

            <button
              type="submit"
              className="mt-2 w-full px-4 py-2 rounded-xl bg-rose-600 text-white hover:opacity-90"
            >
              {editId == null ? 'Salva' : 'Aggiorna'}
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="rounded-2xl bg-white ring-1 ring-black/5 p-5">
          <h2 className="text-xl font-semibold mb-4">Elenco</h2>
          {loading ? (
            <div className="text-neutral-500">Caricamento…</div>
          ) : list.length === 0 ? (
            <div className="text-neutral-500">Nessun combo inserito.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {list.map((c) => (
                <div key={c.id} className="rounded-xl ring-1 ring-black/5 p-3 bg-white">
                  {c.immagine_url && (
                    <img
                      src={c.immagine_url}
                      alt={c.nome}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="font-semibold">{c.nome}</div>
                  <div className="text-sm text-neutral-600">{c.fornitore ?? '—'}</div>
                  <div className="text-[15px] font-bold mt-1">
                    {c.prezzo_usd != null ? `$${c.prezzo_usd.toFixed(2)}` : '—'}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {c.tempi ? `Tempi: ${c.tempi}` : '—'} • Attivo: {c.attivo ? 'Sì' : 'No'}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => loadForEdit(c)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:opacity-90"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:opacity-90"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
