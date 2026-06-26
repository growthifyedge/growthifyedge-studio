/**
 * Domain models for the GrowthifyEdge Software Showcase Hub.
 * Backend-ready: the mock service returns these exact shapes a real API would,
 * so swapping the data source later requires no component changes.
 */

export type SoftwareCategory =
  | 'AI Tool'
  | 'Automation'
  | 'Mini Software'
  | 'Web App'
  | 'Dashboard'
  | 'Integration'
  | 'Mobile App';

export type SoftwareStatus = 'Live' | 'Beta' | 'In Development' | 'Concept' | 'Archived';

export type PricingModel = 'Free' | 'Subscription' | 'One-time' | 'Custom Quote';

/** Who can see a project — mirrors the Admin Studio visibility control. */
export type Visibility = 'public' | 'private' | 'client-only';

/** Grouping used by the Demo Theatre sections. */
export type DemoCategory =
  | 'Mini Demo'
  | 'AI Automation'
  | 'Customer Support'
  | 'E-commerce'
  | 'Operations';

export interface TechStackItem {
  readonly name: string;
  readonly icon?: string;
}

export interface Screenshot {
  readonly id: string;
  readonly url: string;
  readonly thumbnail: string;
  readonly caption: string;
}

export interface DemoVideo {
  readonly id: string;
  readonly title: string;
  /** Embeddable URL (YouTube/Vimeo/MP4). */
  readonly url: string;
  readonly thumbnail: string;
  readonly durationSeconds: number;
}

export interface BusinessImpactMetric {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly trend?: 'up' | 'down' | 'neutral';
  readonly icon?: string;
}

/** Concrete before/after example for mini tools & automations. */
export interface IoExample {
  readonly input: string;
  readonly output: string;
}

export interface CaseStudy {
  readonly id: string;
  readonly softwareId: string;
  readonly clientName: string;
  readonly industry: string;
  readonly logo: string;
  readonly title: string;
  readonly challenge: string;
  readonly solution: string;
  readonly outcome: string;
  readonly metrics: readonly BusinessImpactMetric[];
  readonly quote?: { readonly text: string; readonly author: string; readonly role: string };
  readonly publishedAt: string;
}

export interface Software {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly longDescription: string;

  // Story: problem → manual pain → solution
  readonly problem: string;
  readonly manualPainPoints: readonly string[];
  readonly solution: string;

  readonly category: SoftwareCategory;
  readonly demoCategory: DemoCategory;
  readonly status: SoftwareStatus;
  readonly visibility: Visibility;
  readonly featured: boolean;
  /** Explicit "mini software" flag (in addition to the Mini Software category). */
  readonly isMini?: boolean;

  readonly coverImage: string;
  readonly accentColor: string;
  readonly accentColor2: string;

  readonly techStack: readonly TechStackItem[];
  readonly screenshots: readonly Screenshot[];
  readonly videos: readonly DemoVideo[];
  readonly impact: readonly BusinessImpactMetric[];
  readonly keyFeatures: readonly string[];

  /** Headline impact metric surfaced on cards. */
  readonly headlineMetric: BusinessImpactMetric;
  readonly timeSaved: string;
  readonly ioExample?: IoExample;

  readonly liveUrl?: string;
  readonly repoUrl?: string;
  readonly caseStudyUrl?: string;

  // Dedicated client-facing video links. YouTube/Vimeo links embed in a modal;
  // any other URL opens safely in a new tab.
  readonly demoVideoUrl?: string;
  readonly teaserVideoUrl?: string;
  readonly walkthroughVideoUrl?: string;

  readonly pricing: PricingModel;
  readonly rating: number;
  readonly clients: number;
  readonly impactScore: number;
  readonly launchedAt: string;
  readonly updatedAt: string;
  readonly tags: readonly string[];
}

export type RoadmapStatus = 'Shipped' | 'In Progress' | 'Planned' | 'Exploring';

export interface RoadmapItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly quarter: string;
  readonly status: RoadmapStatus;
  readonly category: SoftwareCategory;
  readonly icon: string;
}
