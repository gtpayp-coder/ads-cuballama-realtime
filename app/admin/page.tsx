
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Combo = {
  id?: string;
  fornitore: string;
  nome: string;
  prezzo_usd: number;
  tempi?: string;
  immagine_url?: string;
  attivo: boolean;
  source_url?: string | null;
}

function uid(){ return Math.random().toString(36).slice(2) }

export default function AdminPage(){
  const [user, setUser] = useState<any>(null)
  const [list, setList] = useState<Combo[]>([])
  const [form, setForm] = useState<Combo>({ fornitore:'Cuballama', nome:'', prezzo_usd:35, tempi:'24-48h', immagine_url:'', attivo:true, source_url:'' })
  const [file, setFile] = useState<File|null>(null)

  useEffect(()=>{
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null))
    return () => { sub.subscription.unsubscribe() }
  }, [])

  useEffect(()=>{ load() }, [])

  const load = async()=>{
    const { data } = await supabase.from('combos').select('*').order('created_at',{ascending:false})
    setList(data as Combo[] || [])
  }

  const signIn = async (e:any)=>{
    e.preventDefault()
    const email = (e.target.email.value||'').trim()
    const password = (e.target.password.value||'').trim()
    if(!email || !password) return alert('Compila email e password')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) alert(error.message)
  }
  const signOut = async()=>{ await supabase.auth.signOut() }

  const uploadImage = async()=>{
    if(!file) return null
    const name = `combo-${Date.now()}-${uid()}.jpg`
    const { error } = await supabase.storage.from('combo-images').upload(name, file, { upsert: false })
    if(error){ alert(error.message); return null }
    const { data } = await supabase.storage.from('combo-images').getPublicUrl(name)
    return data.publicUrl || null
  }

  const save = async()=>{
    if(!form.nome) return alert('Inserisci un nome')
    let imgUrl = form.immagine_url || null
    if(file){
      const pub = await uploadImage()
      if(pub) imgUrl = pub
    }
    const payload = { ...form, immagine_url: imgUrl }
    const { error } = await supabase.from('combos').insert(payload as any)
    if(error) return alert(error.message)
    setForm({ fornitore:'Cuballama', nome:'', prezzo_usd:35, tempi:'24-48h', immagine_url:'', attivo:true, source_url:'' })
    setFile(null)
    ;(document.getElementById('file') as HTMLInputElement).value = ''
    load()
  }

  const del = async(id?:string)=>{
    if(!id) return
    if(!confirm('Eliminare questo combo?')) return
    const { error } = await supabase.from('combos').delete().eq('id', id)
    if(error) return alert(error.message)
    load()
  }

  if(!user){
    return (
      <div className="card" style={{maxWidth:420, margin:'32px auto'}}>
        <h2>Login Admin</h2>
        <form onSubmit={signIn} style={{display:'grid', gap:8}}>
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <button className="btn" type="submit">Entra</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16}}>
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2>Nuovo combo</h2>
          <button className="btn" onClick={signOut}>Esci</button>
        </div>
        <div style={{display:'grid', gap:8}}>
          <input placeholder="Nome" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})}/>
          <input placeholder="Fornitore" value={form.fornitore} onChange={e=>setForm({...form, fornitore:e.target.value})}/>
          <input placeholder="Prezzo USD" type="number" value={form.prezzo_usd} onChange={e=>setForm({...form, prezzo_usd:parseFloat(e.target.value)})}/>
          <input placeholder="Tempi (es. 24-48h)" value={form.tempi} onChange={e=>setForm({...form, tempi:e.target.value})}/>
          <input id="file" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <input placeholder="Oppure incolla URL immagine" value={form.immagine_url||''} onChange={e=>setForm({...form, immagine_url:e.target.value})}/>
          <input placeholder="Link all'offerta (source_url)" value={form.source_url||''} onChange={e=>setForm({...form, source_url:e.target.value})}/>
          <label className="small"><input type="checkbox" checked={form.attivo} onChange={e=>setForm({...form, attivo:e.target.checked})}/> Attivo</label>
          <button className="btn" onClick={save}>Salva</button>
        </div>
      </div>

      <div className="card">
        <h2>Elenco</h2>
        <div className="grid">
          {list.map(c=>(
            <div key={c.id} className="card">
              {c.immagine_url ? <img src={c.immagine_url} alt={c.nome}/> : null}
              <strong>{c.nome}</strong>
              <div className="small">{c.fornitore}</div>
              <div><b>${c.prezzo_usd}</b> • <span className="small">Tempi: {c.tempi || '—'}</span></div>
              {c.source_url ? <a href={c.source_url} target="_blank" className="small">Vai all'offerta</a> : null}
              <div className="small">Attivo: {c.attivo ? 'SI' : 'NO'}</div>
              <button className="btn" onClick={()=>del(c.id)}>Elimina</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
