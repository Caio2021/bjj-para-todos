// lib/supabase/client.ts
// Use em Client Components ("use client")

import { createBrowserClient } from '@supabase/ssr'

// Polyfill BroadcastChannel para SSR (Next.js pré-renderiza client components no servidor).
// Sem isso, @supabase/auth-js emite console.error que o Next.js 15 exibe no overlay de dev.
if (typeof globalThis.BroadcastChannel === 'undefined') {
  // @ts-expect-error — polyfill mínimo apenas para silenciar o erro no SSR
  globalThis.BroadcastChannel = class {
    constructor() {}
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  }
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
