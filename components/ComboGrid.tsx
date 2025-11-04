'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Combo = {
  id: string;
  fornitore: string;
  nome: string;
  prezzo_usd: number;
  tempi: string | null;
  immagine_url: string | null;
  source_url: string | null;
  attivo: boolean;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ComboGrid() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .eq('attivo', true);
      if (!error && data) setCombos(data as Combo[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p style={{ color: '#666' }}>Caricamento in corso...</p>;

  if (!combos.length)
    return <p style={{ color: '#666' }}>Nessuna offerta disponibile al momento.</p>;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginTop: 16,
      }}
    >
      {combos.map((combo) => (
        <div
          key={combo.id}
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 6px 12px rgba(0,0,0,.1)',
            padding: 16,
          }}
        >
          {combo.immagine_url ? (
            <img
              src={combo.immagine_url}
              alt={combo.nome}
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          ) : (
            <div
              style={{
                background: '#eee',
                height: 160,
                borderRadius: 8,
              }}
            />
          )}
          <h3 style={{ margin: '12px 0 6px' }}>{combo.nome}</h3>
          <p style={{ color: '#666', margin: '0 0 6px' }}>
            Fornitore: {combo.fornitore}
          </p>
          <strong style={{ display: 'block', marginBottom: 6 }}>
            ${combo.prezzo_usd.toFixed(2)}
          </strong>
          {combo.tempi && (
            <p style={{ fontSize: 13, color: '#888' }}>
              Tempi di consegna: {combo.tempi}
            </p>
          )}
          {combo.source_url && (
            <a
              href={combo.source_url}
              target="_blank"
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: '#d6362f',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Vai all’offerta
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
