/**
 * Shape of the build-time environment config. Kept in its own file so it can be
 * imported by BOTH `environment.ts` and `environment.prod.ts` without the
 * production `fileReplacements` swap causing a self-import.
 */
export interface AppEnvironment {
  readonly production: boolean;
  /** Master switch for the cloud backend. */
  readonly useSupabase: boolean;
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  /** Storage bucket used for thumbnail/screenshot uploads. */
  readonly supabaseBucket: string;
  /**
   * Demo-mode admin password gate (used ONLY when Supabase is disabled). In
   * production the real Supabase Auth login is used and this is ignored. Note:
   * a frontend password is demo-grade, not real security.
   */
  readonly adminLocalPassword: string;
}
