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
  useSupabase: false,
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseBucket: 'project-media'
};
