/**
 * Centralized technology catalog (Phase 6 — Technology Library).
 *
 * Projects continue to reference technologies by NAME in their `techStack`
 * (backward compatible). This catalog is the single source for a technology's
 * icon + category, so any project — including cloud rows that stored only a
 * name — renders a consistent chip. Unknown names still render gracefully.
 */
export type TechCategory =
  | 'Frontend'
  | 'Backend'
  | 'Mobile'
  | 'AI'
  | 'Data'
  | 'Cloud'
  | 'Tooling'
  | 'Other';

export interface Technology {
  readonly name: string;
  readonly icon: string;
  readonly category: TechCategory;
}

export const TECHNOLOGIES: readonly Technology[] = [
  // Frontend
  { name: 'Angular', icon: '🅰️', category: 'Frontend' },
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'Next.js', icon: '▲', category: 'Frontend' },
  { name: 'Vue', icon: '💚', category: 'Frontend' },
  { name: 'TypeScript', icon: '🟦', category: 'Frontend' },
  { name: 'Tailwind', icon: '🎨', category: 'Frontend' },
  { name: 'D3.js', icon: '📊', category: 'Frontend' },
  // Backend
  { name: 'Node.js', icon: '🟩', category: 'Backend' },
  { name: 'NestJS', icon: '🐈', category: 'Backend' },
  { name: 'FastAPI', icon: '⚡', category: 'Backend' },
  { name: 'Python', icon: '🐍', category: 'Backend' },
  { name: 'Webhooks', icon: '🪝', category: 'Backend' },
  // Mobile
  { name: 'Ionic', icon: '📱', category: 'Mobile' },
  { name: 'SQLite', icon: '💾', category: 'Mobile' },
  // AI
  { name: 'Claude API', icon: '🤖', category: 'AI' },
  { name: 'OpenAI', icon: '🧠', category: 'AI' },
  // Data
  { name: 'Postgres', icon: '🐘', category: 'Data' },
  { name: 'ClickHouse', icon: '🏠', category: 'Data' },
  { name: 'Redis', icon: '🔴', category: 'Data' },
  { name: 'Kafka', icon: '🪶', category: 'Data' },
  { name: 'BullMQ', icon: '🐂', category: 'Data' },
  { name: 'IndexedDB', icon: '💾', category: 'Data' },
  // Cloud / integrations
  { name: 'Supabase', icon: '⚡', category: 'Cloud' },
  { name: 'Docker', icon: '🐳', category: 'Cloud' },
  { name: 'Stripe', icon: '💳', category: 'Cloud' },
  { name: 'Shopify API', icon: '🛍️', category: 'Cloud' },
  { name: 'Gmail API', icon: '📧', category: 'Cloud' },
  { name: 'Twilio', icon: '📲', category: 'Cloud' },
  // Tooling
  { name: 'pdfmake', icon: '📄', category: 'Tooling' }
];

const BY_NAME = new Map<string, Technology>(
  TECHNOLOGIES.map((t) => [t.name.toLowerCase(), t])
);

/** Resolve a technology by name (case-insensitive); undefined if not catalogued. */
export function findTechnology(name: string): Technology | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}
