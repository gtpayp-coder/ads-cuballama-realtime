
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.CUBALLAMA_IRE_URL as string
  if (!url) return NextResponse.json({ error: 'Missing CUBALLAMA_IRE_URL' }, { status: 500 })

  const res = await fetch(url, { headers: { 'user-agent':'ADS/1.0 (+https://example.org)' } })
  const html = await res.text()
  const $ = cheerio.load(html)

  // Extract offers (very generic selectors; adjust when deploying)
  const offers: any[] = []
  $('.product, .card, .product-card, .woocommerce-LoopProduct-link').each((_, el) => {
    const title = $(el).find('h3, .product-name, .woocommerce-loop-product__title, h2').first().text().trim()
    const priceText = $(el).find('.price, [data-price], .amount').first().text()
    const price = parseFloat((priceText.replace(',', '.').match(/[\d\.]+/)||[])[0]||'')
    let img = $(el).find('img').attr('src') || ''
    if (img && !img.startsWith('http')) try { img = new URL(img, url).href } catch {}
    if (title && price) {
      offers.push({
        provider: 'cuballama',
        source_url: url,
        title,
        price_usd: price,
        lead_time: $('body').text().match(/24.*?48.*?h|2-3.*?(?:giorni|dias|days)/i)?.[0] || null,
        image_url: img || null,
        area: 'Santiago de Cuba'
      })
    }
  })

  // Supabase service client (server-side)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, serviceKey)

  // Save raw snapshot
  if (offers.length) {
    const { error: err1 } = await supabase
      .from('provider_offers')
      .insert(offers.map(o => ({ ...o, raw: o })))
    if (err1) console.error('provider_offers insert error', err1)
  }

  // Normalize: pick best 3 by (lead_time -> price)
  const parseH = (s?: string|null) => {
    if(!s) return 999
    const l = s.toLowerCase()
    if (l.includes('h')) { const n = l.replace(/[^\d\-]/g,'').split('-').map(n=>parseInt(n||'0')); return Math.min(...n) }
    if (/(giorni|dias|days)/.test(l)) { const n = l.replace(/[^\d\-]/g,'').split('-').map(n=>parseInt(n||'0')); return Math.min(...n)*24 }
    return 999
  }
  const sorted = offers.sort((a,b) => {
    const ta = parseH(a.lead_time), tb = parseH(b.lead_time)
    if (ta !== tb) return ta - tb
    return (a.price_usd || 999) - (b.price_usd || 999)
  }).slice(0, 6)

  // Upsert into combos (attivo=true) — mark fornitore= Cuballama
  for (const o of sorted) {
    const { error } = await supabase.from('combos').insert({
      fornitore: 'Cuballama',
      nome: o.title,
      prezzo_usd: o.price_usd,
      tempi: o.lead_time,
      immagine_url: o.image_url,
      attivo: true,
      source_url: o.source_url
    })
    if (error) console.error('combos insert error', error)
  }

  return NextResponse.json({ found: offers.length, inserted: sorted.length })
}
