import { SoftwareCategory, SoftwareStatus } from './software.model';

export interface SoftwareFilters {
  search: string;
  category: SoftwareCategory | 'All';
  status: SoftwareStatus | 'All';
  tech: string | 'All';
  featuredOnly: boolean;
  sort: SortOption;
}

export type SortOption = 'newest' | 'featured' | 'impact' | 'rating' | 'name';

export const DEFAULT_FILTERS: SoftwareFilters = {
  search: '',
  category: 'All',
  status: 'All',
  tech: 'All',
  featuredOnly: false,
  sort: 'newest'
};

export const CATEGORY_OPTIONS: readonly (SoftwareCategory | 'All')[] = [
  'All',
  'AI Tool',
  'Automation',
  'Mini Software',
  'Web App',
  'Dashboard',
  'Integration',
  'Mobile App'
];

export const STATUS_OPTIONS: readonly (SoftwareStatus | 'All')[] = [
  'All',
  'Live',
  'Beta',
  'In Development',
  'Concept',
  'Archived'
];

export const SORT_OPTIONS: readonly { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured first' },
  { value: 'impact', label: 'Highest impact' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name (A–Z)' }
];
