import { CaseStudy, RoadmapItem, Software } from '../models/software.model';

/**
 * Mock dataset. Image URLs use picsum.photos seeds for realistic previews;
 * every image-bound component also renders a gradient fallback so the UI looks
 * premium even fully offline.
 */
const img = (seed: string, w = 1200, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const YT = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

export const MOCK_SOFTWARE: readonly Software[] = [
  {
    id: 'sw-01',
    slug: 'nexus-ai-copilot',
    name: 'Nexus AI Copilot',
    tagline: 'An AI assistant that drafts, summarizes and automates your team’s busywork.',
    description:
      'Context-aware AI copilot embedded across your apps to draft replies, summarize threads and trigger workflows.',
    longDescription:
      'Nexus AI Copilot plugs into email, chat and your CRM to act as an always-on operations analyst. It reads context, drafts on-brand responses, surfaces the next best action and fires automations on approval. A retrieval layer over your own knowledge base keeps it grounded and cite-able.',
    problem:
      'Operations and support teams lose hours every day to repetitive drafting, status lookups and context-switching between tools.',
    manualPainPoints: [
      'Re-typing the same answers across email and chat',
      'Digging through threads to reconstruct context',
      'Copy-pasting data between CRM, docs and inboxes',
      'No single place to see “what needs my attention next”'
    ],
    solution:
      'A grounded AI copilot that lives beside every app — it reads context, drafts replies in your voice and triggers approved automations, turning a 20-minute task into a one-click confirm.',
    category: 'AI Tool',
    demoCategory: 'AI Automation',
    status: 'Live',
    visibility: 'public',
    featured: true,
    coverImage: img('nexus-cover'),
    accentColor: '#6d49ff',
    accentColor2: '#f43bb8',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'TypeScript', icon: '🟦' },
      { name: 'Claude API', icon: '🤖' },
      { name: 'Node.js', icon: '🟩' },
      { name: 'Postgres', icon: '🐘' }
    ],
    screenshots: [
      { id: 'ss-01', url: img('nexus-1'), thumbnail: img('nexus-1', 480, 300), caption: 'Unified copilot panel' },
      { id: 'ss-02', url: img('nexus-2'), thumbnail: img('nexus-2', 480, 300), caption: 'Smart reply drafting' },
      { id: 'ss-03', url: img('nexus-3'), thumbnail: img('nexus-3', 480, 300), caption: 'Workflow automation builder' }
    ],
    videos: [
      { id: 'vid-01', title: 'Nexus AI Copilot — 90s Product Tour', url: YT, thumbnail: img('nexus-video', 800, 450), durationSeconds: 92 },
      { id: 'vid-01b', title: 'Nexus in 30 seconds', url: YT, thumbnail: img('nexus-mini', 800, 450), durationSeconds: 30 }
    ],
    impact: [
      { label: 'Hours saved / week', value: '14h', delta: '+32%', trend: 'up', icon: '⏱️' },
      { label: 'Response time', value: '−61%', delta: '−61%', trend: 'down', icon: '⚡' },
      { label: 'CSAT', value: '4.8/5', delta: '+0.6', trend: 'up', icon: '⭐' }
    ],
    headlineMetric: { label: 'Response time', value: '−61%', trend: 'down', icon: '⚡' },
    timeSaved: '14 hrs / week',
    keyFeatures: [
      'Context-aware drafting grounded in your knowledge base',
      'One-click workflow automations with human approval',
      'Thread & meeting summaries with action items',
      'Role-based access and full audit trail'
    ],
    liveUrl: 'https://demo.growthifyedge.com/nexus',
    repoUrl: 'https://github.com/growthifyedge/nexus',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    teaserVideoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    walkthroughVideoUrl: 'https://vimeo.com/76979871',
    pricing: 'Subscription',
    rating: 4.8,
    clients: 42,
    impactScore: 96,
    launchedAt: '2025-09-12',
    updatedAt: '2026-05-30',
    tags: ['ai', 'productivity', 'copilot', 'automation']
  },
  {
    id: 'sw-02',
    slug: 'flowforge-automation',
    name: 'FlowForge Automation',
    tagline: 'Visual automation studio that connects 200+ tools without code.',
    description:
      'Drag-and-drop automation platform to wire up apps, schedule jobs and orchestrate multi-step business workflows.',
    longDescription:
      'FlowForge is a no-code orchestration layer for operations teams. Build branching workflows visually, add conditions and delays, and ship reliable automations with retries and observability baked in. A marketplace of recipes covers sales, finance and support.',
    problem:
      'Critical processes live in fragile spreadsheets and manual handoffs that break silently and are impossible to audit.',
    manualPainPoints: [
      'Copy-paste handoffs between billing, CRM and accounting',
      'No retries — a failed step means a dropped task',
      'Zero visibility into what ran and what failed',
      'Engineers needed for every small change'
    ],
    solution:
      'A visual canvas where ops teams compose reliable, observable automations themselves — with branching, retries and a full run log replacing brittle manual steps.',
    category: 'Automation',
    demoCategory: 'Operations',
    status: 'Live',
    visibility: 'public',
    featured: true,
    coverImage: img('flowforge-cover'),
    accentColor: '#10c5ac',
    accentColor2: '#6d49ff',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'NestJS', icon: '🐈' },
      { name: 'Redis', icon: '🔴' },
      { name: 'BullMQ', icon: '🐂' },
      { name: 'Docker', icon: '🐳' }
    ],
    screenshots: [
      { id: 'ss-04', url: img('flow-1'), thumbnail: img('flow-1', 480, 300), caption: 'Visual flow canvas' },
      { id: 'ss-05', url: img('flow-2'), thumbnail: img('flow-2', 480, 300), caption: 'Run history & logs' }
    ],
    videos: [
      { id: 'vid-02', title: 'Build an Automation in 60 Seconds', url: YT, thumbnail: img('flow-video', 800, 450), durationSeconds: 38 }
    ],
    impact: [
      { label: 'Manual tasks removed', value: '1,200/mo', delta: '+44%', trend: 'up', icon: '🔁' },
      { label: 'Error rate', value: '0.2%', delta: '−80%', trend: 'down', icon: '🛡️' }
    ],
    headlineMetric: { label: 'Manual tasks removed', value: '1,200/mo', trend: 'up', icon: '🔁' },
    timeSaved: '40 hrs / month',
    ioExample: {
      input: 'New paid invoice in Stripe',
      output: 'CRM updated → receipt emailed → Slack #finance pinged → ledger row written'
    },
    keyFeatures: [
      '200+ native integrations',
      'Branching, delays and error handling',
      'Recipe marketplace',
      'Real-time run observability'
    ],
    liveUrl: 'https://demo.growthifyedge.com/flowforge',
    teaserVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    walkthroughVideoUrl: 'https://growthifyedge.com/walkthroughs/flowforge.mp4',
    pricing: 'Subscription',
    rating: 4.6,
    clients: 67,
    impactScore: 91,
    launchedAt: '2025-06-01',
    updatedAt: '2026-06-10',
    tags: ['automation', 'no-code', 'integrations', 'ops']
  },
  {
    id: 'sw-03',
    slug: 'pulse-analytics-dashboard',
    name: 'Pulse Analytics',
    tagline: 'Real-time revenue and product analytics in one premium dashboard.',
    description:
      'Unified analytics with live KPIs, cohort analysis and AI-generated insights for decision makers.',
    longDescription:
      'Pulse Analytics consolidates revenue, product and marketing data into a single source of truth. Executives get live KPI tiles and narrative insights; analysts dive into cohorts, funnels and retention. Alerts notify teams the moment a metric breaks its expected band.',
    problem:
      'Leadership waits days for hand-built reports, so decisions consistently lag behind the market.',
    manualPainPoints: [
      'Analysts rebuilding the same report every Monday',
      'Numbers scattered across five different tools',
      'No alerting when a metric goes off the rails',
      'Executives flying blind between reporting cycles'
    ],
    solution:
      'A live cockpit that unifies every source, writes the narrative for you and alerts the moment something moves — turning Monday guesswork into real-time decisions.',
    category: 'Dashboard',
    demoCategory: 'Operations',
    status: 'Live',
    visibility: 'public',
    featured: true,
    coverImage: img('pulse-cover'),
    accentColor: '#f43bb8',
    accentColor2: '#6d49ff',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'D3.js', icon: '📊' },
      { name: 'ClickHouse', icon: '🏠' },
      { name: 'FastAPI', icon: '⚡' }
    ],
    screenshots: [
      { id: 'ss-06', url: img('pulse-1'), thumbnail: img('pulse-1', 480, 300), caption: 'Executive overview' },
      { id: 'ss-07', url: img('pulse-2'), thumbnail: img('pulse-2', 480, 300), caption: 'Cohort retention' }
    ],
    videos: [
      { id: 'vid-03b', title: 'Pulse Analytics Tour', url: YT, thumbnail: img('pulse-video', 800, 450), durationSeconds: 84 }
    ],
    impact: [
      { label: 'Decisions / week', value: '3x', delta: '+210%', trend: 'up', icon: '🧭' },
      { label: 'Reporting time', value: '−75%', delta: '−75%', trend: 'down', icon: '⏳' }
    ],
    headlineMetric: { label: 'Reporting time', value: '−75%', trend: 'down', icon: '⏳' },
    timeSaved: '20 hrs / week',
    keyFeatures: [
      'Live KPI tiles with anomaly alerts',
      'Cohort, funnel and retention analysis',
      'AI-generated narrative insights',
      'Shareable executive snapshots'
    ],
    liveUrl: 'https://demo.growthifyedge.com/pulse',
    pricing: 'Subscription',
    rating: 4.9,
    clients: 31,
    impactScore: 94,
    launchedAt: '2025-11-20',
    updatedAt: '2026-06-18',
    tags: ['analytics', 'dashboard', 'kpi', 'bi']
  },
  {
    id: 'sw-04',
    slug: 'inboxzero-ai',
    name: 'InboxZero AI',
    tagline: 'Triage, label and draft replies for your whole inbox automatically.',
    description:
      'AI email triage that categorizes, prioritizes and drafts responses so teams reach inbox zero daily.',
    longDescription:
      'InboxZero AI watches shared inboxes and applies your playbook: it labels by intent, routes to the right owner, drafts grounded replies and flags anything risky for a human. SLA timers and reporting keep support and sales response times tight.',
    problem:
      'Shared inboxes overflow; messages sit unrouted and customers wait hours for a first reply.',
    manualPainPoints: [
      'Agents manually sorting every incoming email',
      'Tickets falling through the cracks at peak times',
      'Inconsistent answers across the team',
      'No SLA visibility until something is already late'
    ],
    solution:
      'AI triage that labels by intent, routes to the right owner and drafts a grounded reply within seconds — humans just review and send.',
    category: 'AI Tool',
    demoCategory: 'Customer Support',
    status: 'Beta',
    visibility: 'client-only',
    featured: false,
    coverImage: img('inbox-cover'),
    accentColor: '#5b27f5',
    accentColor2: '#36e0c8',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'Claude API', icon: '🤖' },
      { name: 'Gmail API', icon: '📧' },
      { name: 'Supabase', icon: '⚡' }
    ],
    screenshots: [
      { id: 'ss-08', url: img('inbox-1'), thumbnail: img('inbox-1', 480, 300), caption: 'Auto-triaged inbox' }
    ],
    videos: [
      { id: 'vid-03', title: 'InboxZero AI in Action', url: YT, thumbnail: img('inbox-video', 800, 450), durationSeconds: 33 }
    ],
    impact: [
      { label: 'Tickets auto-handled', value: '58%', delta: '+58%', trend: 'up', icon: '🎫' },
      { label: 'First response', value: '< 2 min', delta: '−70%', trend: 'down', icon: '⚡' }
    ],
    headlineMetric: { label: 'Tickets auto-handled', value: '58%', trend: 'up', icon: '🎫' },
    timeSaved: '25 hrs / week',
    ioExample: {
      input: 'Customer email: “Where is my order #4821?”',
      output: 'Labeled “Shipping”, routed to Support, draft reply with live tracking link ready to send'
    },
    keyFeatures: [
      'Intent-based labeling and routing',
      'Grounded reply drafting',
      'SLA timers and escalation',
      'Risk flagging for sensitive replies'
    ],
    liveUrl: 'https://demo.growthifyedge.com/inboxzero',
    pricing: 'Subscription',
    rating: 4.4,
    clients: 18,
    impactScore: 88,
    launchedAt: '2026-02-15',
    updatedAt: '2026-06-01',
    tags: ['ai', 'email', 'support', 'productivity']
  },
  {
    id: 'sw-05',
    slug: 'quickquote-mini',
    name: 'QuickQuote',
    tagline: 'Turn a product list into a branded PDF quote in seconds.',
    description:
      'Lightweight quoting tool: pick products, apply discounts and export a polished, branded PDF instantly.',
    longDescription:
      'QuickQuote is a focused mini-software product for sales reps who live in spreadsheets. Build a quote from your catalog, apply tiered discounts and taxes, and send a branded PDF or shareable link — no CRM required.',
    problem:
      'Reps waste 30+ minutes per quote wrestling with spreadsheets and inconsistent templates.',
    manualPainPoints: [
      'Hand-formatting quotes in Word or Excel',
      'Pricing and discount errors',
      'Off-brand documents going to prospects',
      'Slow turnaround losing deals to faster competitors'
    ],
    solution:
      'Pick products from your catalog, apply discount rules, and export a perfectly branded PDF or link in under two minutes.',
    category: 'Mini Software',
    demoCategory: 'E-commerce',
    status: 'Live',
    visibility: 'public',
    featured: false,
    coverImage: img('quote-cover'),
    accentColor: '#ff6bd6',
    accentColor2: '#6d49ff',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'pdfmake', icon: '📄' },
      { name: 'IndexedDB', icon: '💾' }
    ],
    screenshots: [
      { id: 'ss-09', url: img('quote-1'), thumbnail: img('quote-1', 480, 300), caption: 'Quote builder' }
    ],
    videos: [
      { id: 'vid-04b', title: 'QuickQuote in 25 seconds', url: YT, thumbnail: img('quote-video', 800, 450), durationSeconds: 25 }
    ],
    impact: [
      { label: 'Quote turnaround', value: '90s', delta: '−95%', trend: 'down', icon: '⚡' },
      { label: 'Win rate', value: '+12%', delta: '+12%', trend: 'up', icon: '🏆' }
    ],
    headlineMetric: { label: 'Quote turnaround', value: '90 sec', trend: 'down', icon: '⚡' },
    timeSaved: '6 hrs / week',
    ioExample: {
      input: '3 catalog items + 10% loyalty discount',
      output: 'Branded, taxed PDF quote + shareable client link'
    },
    keyFeatures: [
      'Catalog-driven quote builder',
      'Tiered discounts and tax rules',
      'Branded PDF & shareable link',
      'Works fully offline'
    ],
    liveUrl: 'https://demo.growthifyedge.com/quickquote',
    pricing: 'One-time',
    rating: 4.5,
    clients: 120,
    impactScore: 82,
    launchedAt: '2025-04-08',
    updatedAt: '2026-03-22',
    tags: ['mini', 'sales', 'pdf', 'tools']
  },
  {
    id: 'sw-06',
    slug: 'syncbridge-integration',
    name: 'SyncBridge',
    tagline: 'Two-way sync between your CRM, billing and support tools.',
    description:
      'Reliable bidirectional data sync that keeps customers, invoices and tickets consistent across systems.',
    longDescription:
      'SyncBridge eliminates copy-paste between systems. It maps fields, resolves conflicts and keeps records in lockstep across CRM, billing and support — with a full sync log and replay for peace of mind.',
    problem:
      'Customer data drifts apart across systems, so every team works from a slightly different truth.',
    manualPainPoints: [
      'Updating the same record in three places',
      'Conflicting values with no source of truth',
      'Hours lost reconciling mismatches',
      'No way to replay or audit a bad sync'
    ],
    solution:
      'A bidirectional sync engine with field mapping, conflict rules and a replayable log that keeps every system in lockstep automatically.',
    category: 'Integration',
    demoCategory: 'Operations',
    status: 'In Development',
    visibility: 'private',
    featured: false,
    coverImage: img('sync-cover'),
    accentColor: '#36e0c8',
    accentColor2: '#5b27f5',
    techStack: [
      { name: 'Node.js', icon: '🟩' },
      { name: 'Kafka', icon: '🪶' },
      { name: 'TypeScript', icon: '🟦' }
    ],
    screenshots: [
      { id: 'ss-10', url: img('sync-1'), thumbnail: img('sync-1', 480, 300), caption: 'Field mapping' }
    ],
    videos: [],
    impact: [{ label: 'Data drift', value: '~0', delta: '−98%', trend: 'down', icon: '🧮' }],
    headlineMetric: { label: 'Data drift', value: '−98%', trend: 'down', icon: '🧮' },
    timeSaved: '15 hrs / month',
    keyFeatures: [
      'Bidirectional field mapping',
      'Conflict resolution rules',
      'Full sync log & replay',
      'Webhook + polling hybrid'
    ],
    pricing: 'Custom Quote',
    rating: 4.2,
    clients: 9,
    impactScore: 79,
    launchedAt: '2026-04-01',
    updatedAt: '2026-06-20',
    tags: ['integration', 'sync', 'data', 'ops']
  },
  {
    id: 'sw-07',
    slug: 'storefront-launch',
    name: 'Storefront Launch',
    tagline: 'Spin up a conversion-optimized storefront in an afternoon.',
    description:
      'Headless commerce starter with premium themes, cart, checkout and analytics wired in.',
    longDescription:
      'Storefront Launch is a production-grade headless commerce kit. It ships premium themes, a fast cart and checkout, SEO defaults and analytics so brands can go live in hours instead of months.',
    problem:
      'Launching a polished, fast storefront usually means months of custom build and a big budget.',
    manualPainPoints: [
      'Months of bespoke front-end work',
      'Slow, clunky checkout flows that lose sales',
      'SEO and analytics bolted on as an afterthought',
      'Expensive agency retainers to make changes'
    ],
    solution:
      'A headless, API-first kit with premium themes, Stripe checkout and analytics baked in — go live in a day and convert from hour one.',
    category: 'Web App',
    demoCategory: 'E-commerce',
    status: 'Beta',
    visibility: 'public',
    featured: true,
    coverImage: img('store-cover'),
    accentColor: '#6d49ff',
    accentColor2: '#36e0c8',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'Stripe', icon: '💳' },
      { name: 'Tailwind', icon: '🎨' }
    ],
    screenshots: [
      { id: 'ss-11', url: img('store-1'), thumbnail: img('store-1', 480, 300), caption: 'Storefront theme' },
      { id: 'ss-12', url: img('store-2'), thumbnail: img('store-2', 480, 300), caption: 'Checkout flow' }
    ],
    videos: [
      { id: 'vid-04', title: 'Storefront Launch Walkthrough', url: YT, thumbnail: img('store-video', 800, 450), durationSeconds: 110 }
    ],
    impact: [
      { label: 'Time to launch', value: '1 day', delta: '−92%', trend: 'down', icon: '🚀' },
      { label: 'Conversion', value: '+18%', delta: '+18%', trend: 'up', icon: '🛒' }
    ],
    headlineMetric: { label: 'Time to launch', value: '1 day', trend: 'down', icon: '🚀' },
    timeSaved: '3 months → 1 day',
    keyFeatures: [
      'Premium, customizable themes',
      'Stripe checkout out of the box',
      'SEO and analytics defaults',
      'Headless & API-first'
    ],
    liveUrl: 'https://demo.growthifyedge.com/storefront',
    pricing: 'One-time',
    rating: 4.7,
    clients: 54,
    impactScore: 90,
    launchedAt: '2026-01-10',
    updatedAt: '2026-06-15',
    tags: ['commerce', 'web', 'storefront', 'starter']
  },
  {
    id: 'sw-08',
    slug: 'fieldpilot-mobile',
    name: 'FieldPilot',
    tagline: 'Mobile app for field teams to capture jobs, photos and signatures offline.',
    description:
      'Offline-first mobile app for field service: job scheduling, photo capture, signatures and sync.',
    longDescription:
      'FieldPilot keeps field teams productive without signal. Technicians see their schedule, capture photos and signatures, and complete checklists offline — everything syncs the moment they reconnect.',
    problem:
      'Field techs lose data and time on paper forms and apps that die the second they lose signal.',
    manualPainPoints: [
      'Paper job sheets re-keyed back at the office',
      'Apps that break with no connectivity',
      'Lost photos and missing signatures',
      'No live view of crew progress'
    ],
    solution:
      'An offline-first app where techs capture everything on-site and it syncs automatically on reconnect — zero paperwork, zero lost data.',
    category: 'Mobile App',
    demoCategory: 'Operations',
    status: 'Concept',
    visibility: 'private',
    featured: false,
    coverImage: img('field-cover'),
    accentColor: '#10c5ac',
    accentColor2: '#6d49ff',
    techStack: [
      { name: 'Ionic', icon: '📱' },
      { name: 'Angular', icon: '🅰️' },
      { name: 'SQLite', icon: '💾' }
    ],
    screenshots: [],
    videos: [],
    impact: [{ label: 'Paperwork', value: '−100%', delta: '−100%', trend: 'down', icon: '📋' }],
    headlineMetric: { label: 'Paperwork', value: '−100%', trend: 'down', icon: '📋' },
    timeSaved: '10 hrs / week',
    keyFeatures: [
      'Offline-first job management',
      'Photo & signature capture',
      'Smart route scheduling',
      'Automatic background sync'
    ],
    pricing: 'Custom Quote',
    rating: 4.1,
    clients: 4,
    impactScore: 74,
    launchedAt: '2026-05-05',
    updatedAt: '2026-06-22',
    tags: ['mobile', 'field-service', 'offline']
  },
  {
    id: 'sw-09',
    slug: 'reviewpilot-ai',
    name: 'ReviewPilot AI',
    tagline: 'Auto-drafts on-brand replies to every customer review in seconds.',
    description:
      'AI automation that monitors reviews across platforms and drafts on-brand, sentiment-aware responses.',
    longDescription:
      'ReviewPilot AI watches Google, Trustpilot and marketplace reviews, classifies sentiment, and drafts a tailored on-brand reply for approval. Negative reviews are escalated instantly with a suggested recovery offer.',
    problem:
      'Reviews pile up unanswered, and the negative ones — the ones that matter most — get noticed too late.',
    manualPainPoints: [
      'Manually checking five review platforms daily',
      'Slow or no responses hurting ratings',
      'Generic copy-paste replies',
      'Negative reviews escalating before anyone sees them'
    ],
    solution:
      'Always-on monitoring with sentiment-aware, on-brand draft replies and instant escalation for anything negative — your reputation, on autopilot.',
    category: 'Automation',
    demoCategory: 'Customer Support',
    status: 'Live',
    visibility: 'public',
    featured: true,
    coverImage: img('review-cover'),
    accentColor: '#f43bb8',
    accentColor2: '#36e0c8',
    techStack: [
      { name: 'Angular', icon: '🅰️' },
      { name: 'Claude API', icon: '🤖' },
      { name: 'Node.js', icon: '🟩' },
      { name: 'Webhooks', icon: '🪝' }
    ],
    screenshots: [
      { id: 'ss-13', url: img('review-1'), thumbnail: img('review-1', 480, 300), caption: 'Review inbox with sentiment' }
    ],
    videos: [
      { id: 'vid-05', title: 'ReviewPilot AI — 30s Demo', url: YT, thumbnail: img('review-video', 800, 450), durationSeconds: 31 }
    ],
    impact: [
      { label: 'Reviews answered', value: '100%', delta: '+100%', trend: 'up', icon: '💬' },
      { label: 'Avg. response time', value: '4 min', delta: '−96%', trend: 'down', icon: '⚡' },
      { label: 'Rating lift', value: '+0.4★', delta: '+0.4', trend: 'up', icon: '⭐' }
    ],
    headlineMetric: { label: 'Reviews answered', value: '100%', trend: 'up', icon: '💬' },
    timeSaved: '8 hrs / week',
    ioExample: {
      input: '★★☆☆☆ “Jacket arrived late and packaging was damaged.”',
      output: 'Sentiment: Negative → escalated to manager + draft apology with 15% recovery code'
    },
    keyFeatures: [
      'Multi-platform review monitoring',
      'Sentiment classification & routing',
      'On-brand AI draft replies',
      'Instant negative-review escalation'
    ],
    liveUrl: 'https://demo.growthifyedge.com/reviewpilot',
    pricing: 'Subscription',
    rating: 4.7,
    clients: 28,
    impactScore: 89,
    launchedAt: '2026-03-18',
    updatedAt: '2026-06-21',
    tags: ['ai', 'automation', 'reviews', 'support']
  },
  {
    id: 'sw-10',
    slug: 'cartrescue-automation',
    name: 'CartRescue',
    tagline: 'Win back abandoned carts with perfectly-timed AI recovery flows.',
    description:
      'E-commerce automation that detects abandoned carts and triggers personalized multi-channel recovery.',
    longDescription:
      'CartRescue listens to your store events, detects abandonment in real time and orchestrates a personalized recovery sequence across email and SMS — with dynamic incentives tuned to each shopper’s cart value.',
    problem:
      'Up to 70% of carts are abandoned, and generic “you left something behind” emails barely move the needle.',
    manualPainPoints: [
      'Manually exporting abandoned-cart lists',
      'One-size-fits-all recovery emails',
      'Wrong timing — too early or far too late',
      'No view of what recovery actually earned'
    ],
    solution:
      'Real-time abandonment detection that fires a personalized, multi-channel recovery flow with value-tuned incentives — and reports exactly how much revenue it rescued.',
    category: 'Automation',
    demoCategory: 'E-commerce',
    status: 'Beta',
    visibility: 'client-only',
    featured: false,
    coverImage: img('cart-cover'),
    accentColor: '#6d49ff',
    accentColor2: '#ff6bd6',
    techStack: [
      { name: 'Node.js', icon: '🟩' },
      { name: 'Shopify API', icon: '🛍️' },
      { name: 'Twilio', icon: '📲' },
      { name: 'Claude API', icon: '🤖' }
    ],
    screenshots: [
      { id: 'ss-14', url: img('cart-1'), thumbnail: img('cart-1', 480, 300), caption: 'Recovery flow builder' }
    ],
    videos: [
      { id: 'vid-06', title: 'CartRescue Walkthrough', url: YT, thumbnail: img('cart-video', 800, 450), durationSeconds: 36 }
    ],
    impact: [
      { label: 'Carts recovered', value: '23%', delta: '+23%', trend: 'up', icon: '🛒' },
      { label: 'Revenue rescued', value: '$48k/mo', delta: '+18%', trend: 'up', icon: '💰' }
    ],
    headlineMetric: { label: 'Revenue rescued', value: '$48k/mo', trend: 'up', icon: '💰' },
    timeSaved: 'Fully automated',
    ioExample: {
      input: 'Shopper abandons a $220 cart at checkout',
      output: 'Email at 1h → SMS at 24h with 10% code → +$220 recovered, logged to dashboard'
    },
    keyFeatures: [
      'Real-time abandonment detection',
      'Multi-channel (email + SMS) flows',
      'Value-tuned dynamic incentives',
      'Revenue-rescued attribution'
    ],
    liveUrl: 'https://demo.growthifyedge.com/cartrescue',
    pricing: 'Subscription',
    rating: 4.6,
    clients: 22,
    impactScore: 87,
    launchedAt: '2026-02-28',
    updatedAt: '2026-06-19',
    tags: ['automation', 'ecommerce', 'recovery', 'revenue']
  }
];

export const MOCK_CASE_STUDIES: readonly CaseStudy[] = [
  {
    id: 'cs-01',
    softwareId: 'sw-01',
    clientName: 'Northwind Logistics',
    industry: 'Supply Chain',
    logo: img('northwind-logo', 160, 160),
    title: 'How Northwind cut response times by 61% with Nexus AI Copilot',
    challenge:
      'Northwind’s operations team was drowning in repetitive emails and status requests, with response times stretching to 8+ hours during peak season.',
    solution:
      'We deployed Nexus AI Copilot across their support and ops inboxes, grounded in their SOPs and shipment data, to draft replies and trigger status-lookup automations.',
    outcome:
      'Within six weeks, 58% of inbound requests were resolved with an AI-drafted reply approved in a single click, freeing the team for exception handling.',
    metrics: [
      { label: 'Response time', value: '−61%', trend: 'down' },
      { label: 'Hours saved / week', value: '14h', trend: 'up' },
      { label: 'CSAT', value: '4.8/5', trend: 'up' }
    ],
    quote: {
      text: 'It feels like we hired three analysts overnight — without the overhead.',
      author: 'Dana Whitfield',
      role: 'VP Operations, Northwind Logistics'
    },
    publishedAt: '2026-03-02'
  },
  {
    id: 'cs-02',
    softwareId: 'sw-02',
    clientName: 'Brightside Finance',
    industry: 'Fintech',
    logo: img('brightside-logo', 160, 160),
    title: 'Brightside removed 1,200 manual tasks a month with FlowForge',
    challenge:
      'Finance ops relied on fragile spreadsheets and manual handoffs between billing, CRM and accounting, causing reconciliation errors.',
    solution:
      'FlowForge orchestrated the full invoice-to-cash flow with branching logic, retries and observability, replacing brittle manual steps.',
    outcome:
      'Error rates dropped 80% and the team reclaimed two full days each week previously lost to reconciliation.',
    metrics: [
      { label: 'Manual tasks removed', value: '1,200/mo', trend: 'up' },
      { label: 'Error rate', value: '−80%', trend: 'down' }
    ],
    quote: {
      text: 'We finally trust our numbers in real time.',
      author: 'Marcus Lee',
      role: 'Head of Finance Ops, Brightside'
    },
    publishedAt: '2026-04-18'
  },
  {
    id: 'cs-03',
    softwareId: 'sw-03',
    clientName: 'Lumen Retail',
    industry: 'Retail',
    logo: img('lumen-logo', 160, 160),
    title: 'Lumen Retail triples weekly decisions with Pulse Analytics',
    challenge:
      'Leadership waited days for hand-built reports, so decisions lagged behind the market.',
    solution:
      'Pulse Analytics unified their revenue and product data into live dashboards with AI narrative insights and anomaly alerts.',
    outcome:
      'Reporting time fell 75% and the leadership team now makes 3x more data-backed decisions each week.',
    metrics: [
      { label: 'Decisions / week', value: '3x', trend: 'up' },
      { label: 'Reporting time', value: '−75%', trend: 'down' }
    ],
    quote: {
      text: 'Pulse turned our Monday guesswork into a live cockpit.',
      author: 'Priya Nair',
      role: 'COO, Lumen Retail'
    },
    publishedAt: '2026-05-09'
  },
  {
    id: 'cs-04',
    softwareId: 'sw-09',
    clientName: 'Atlas Outdoors',
    industry: 'E-commerce',
    logo: img('atlas-logo', 160, 160),
    title: 'Atlas Outdoors lifted its rating 0.4★ with ReviewPilot AI',
    challenge:
      'A growing review backlog meant negative feedback sat unanswered for days, dragging the brand’s public rating down.',
    solution:
      'ReviewPilot AI now monitors every platform, drafts on-brand replies in minutes and escalates negative reviews instantly with a recovery offer.',
    outcome:
      '100% of reviews are now answered within minutes, and the average rating climbed 0.4 stars in a single quarter.',
    metrics: [
      { label: 'Reviews answered', value: '100%', trend: 'up' },
      { label: 'Rating', value: '+0.4★', trend: 'up' }
    ],
    quote: {
      text: 'Our reputation runs itself now — and customers feel heard.',
      author: 'Sofia Marin',
      role: 'Head of CX, Atlas Outdoors'
    },
    publishedAt: '2026-06-11'
  }
];

export const MOCK_ROADMAP: readonly RoadmapItem[] = [
  { id: 'rm-01', title: 'Nexus Copilot — voice mode', description: 'Hands-free dictation and voice-driven actions across the copilot.', quarter: 'Q3 2026', status: 'In Progress', category: 'AI Tool', icon: '🎙️' },
  { id: 'rm-02', title: 'FlowForge marketplace v2', description: 'Community-published recipes with one-click install and ratings.', quarter: 'Q3 2026', status: 'Planned', category: 'Automation', icon: '🛒' },
  { id: 'rm-03', title: 'Pulse — predictive alerts', description: 'Forecast metric breaches before they happen with anomaly ML.', quarter: 'Q4 2026', status: 'Planned', category: 'Dashboard', icon: '🔮' },
  { id: 'rm-04', title: 'CartRescue — WhatsApp channel', description: 'Add WhatsApp to the multi-channel recovery sequence.', quarter: 'Q4 2026', status: 'Exploring', category: 'Automation', icon: '💚' },
  { id: 'rm-05', title: 'SyncBridge GA launch', description: 'General availability with self-serve connectors and SLA.', quarter: 'Q1 2027', status: 'Planned', category: 'Integration', icon: '🚀' },
  { id: 'rm-06', title: 'FieldPilot beta', description: 'First public beta of the offline-first field service app.', quarter: 'Q1 2027', status: 'Exploring', category: 'Mobile App', icon: '📱' },
  { id: 'rm-07', title: 'ReviewPilot — multi-language replies', description: 'Draft on-brand responses in 20+ languages automatically.', quarter: 'Q2 2026', status: 'Shipped', category: 'Automation', icon: '🌍' },
  { id: 'rm-08', title: 'Storefront — headless CMS blocks', description: 'Drag-and-drop content blocks for non-technical merchandisers.', quarter: 'Q2 2026', status: 'Shipped', category: 'Web App', icon: '🧱' }
];
