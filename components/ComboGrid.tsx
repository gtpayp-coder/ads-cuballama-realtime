'use client';

type Props = {
  combo: {
    id: number;
    nome: string;
    fornitore: string | null;
    prezzo_usd: number | null;
    tempi: string | null;
    immagine_url: string | null;
    source_url: string | null;
  };
};

export default function ComboCard({ combo }: Props) {
  return (
    <div className="rounded-2xl shadow-sm ring-1 ring-black/5 bg-white p-4 hover:shadow-md transition">
      {combo.immagine_url && (
        <img
          src={combo.immagine_url}
          alt={combo.nome}
          className="w-full h-48 object-cover rounded-xl mb-3"
          loading="lazy"
        />
      )}
      <div className="text-lg font-semibold">{combo.nome}</div>
      {combo.fornitore && (
        <div className="text-sm text-neutral-600 mt-0.5">Fornitore: {combo.fornitore}</div>
      )}
      {combo.prezzo_usd != null && (
        <div className="mt-2 text-[15px] font-bold">${combo.prezzo_usd.toFixed(2)}</div>
      )}
      {combo.tempi && (
        <div className="text-sm text-neutral-600 mt-1">Tempi di consegna: {combo.tempi}</div>
      )}
      <div className="mt-3">
        {combo.source_url ? (
          <a
            href={combo.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white hover:opacity-90"
          >
            Apri l’offerta
          </a>
        ) : (
          <span className="text-xs text-neutral-400">Nessun link offerta</span>
        )}
      </div>
    </div>
  );
}
