/**
 * Development environment.
 *
 * The app works fully offline with localStorage by default. To enable the
 * optional Supabase cloud backend, set `useSupabase: true` and fill in your
 * project URL + anon key (or override at deploy time — see README "Supabase
 * setup"). If anything is missing the app silently falls back to localStorage,
 * so demo mode never breaks.
 */
import { AppEnvironment } from './app-environment';

export const environment: AppEnvironment = {
  production: false,
  useSupabase: false,
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseBucket: 'project-media'
};
