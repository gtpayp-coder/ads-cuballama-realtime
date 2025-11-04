export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return new Response(JSON.stringify({ ok: hasUrl && hasKey, hasUrl, hasKey }), {
    headers: { 'content-type': 'application/json' }
  });
}
