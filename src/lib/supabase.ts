/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

interface ImportMetaEnv {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

declare const importMeta: {
  env: ImportMetaEnv
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please copy .env.example to .env and add your Supabase credentials.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
