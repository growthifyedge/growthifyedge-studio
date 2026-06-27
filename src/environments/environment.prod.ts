import { AppEnvironment } from './app-environment';

/**
 * Production environment (swapped in at build time via angular.json
 * `fileReplacements`). Fill these in — or inject them at deploy time on
 * Vercel/Netlify — to turn on the Supabase backend in production builds.
 *
 * Leaving `useSupabase: false` ships a fully working localStorage demo.
 */
export const environment: AppEnvironment = {
  production: true,
  useSupabase: true,
  supabaseUrl: 'https://njhhyqtqtgegpqfixzmi.supabase.co',
  // Supabase *publishable* (public) key — safe for the browser; data is
  // protected by RLS policies, never the secret/service_role key.
  supabaseAnonKey: 'sb_publishable_rrIoYhFiKKo3Kbpip6j9bQ_w7wB_hMS',
  supabaseBucket: 'project-media'
};
