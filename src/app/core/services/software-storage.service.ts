import { Injectable } from '@angular/core';

import { Software } from '../models/software.model';
import { MOCK_SOFTWARE } from '../data/mock-software';

/**
 * Persistence boundary for showcase projects.
 *
 * Today this is backed by `localStorage`; swapping to an HTTP backend later is
 * a single-file change because every consumer goes through `SoftwareService`,
 * which talks only to this service. The mock dataset is used as the first-run
 * seed so the showcase is never empty.
 */
@Injectable({ providedIn: 'root' })
export class SoftwareStorageService {
  private static readonly KEY = 'growthifyedge.software.v1';

  private get storage(): Storage | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null;
    }
  }

  /** Read the persisted list, seeding (and persisting) defaults on first run. */
  load(): Software[] {
    const raw = this.storage?.getItem(SoftwareStorageService.KEY);
    if (!raw) {
      const seed = this.seed();
      this.save(seed);
      return seed;
    }
    try {
      const parsed = JSON.parse(raw) as Software[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      /* corrupt payload — fall through to a fresh seed */
    }
    const seed = this.seed();
    this.save(seed);
    return seed;
  }

  save(list: readonly Software[]): void {
    try {
      this.storage?.setItem(SoftwareStorageService.KEY, JSON.stringify(list));
    } catch {
      /* quota / privacy mode — keep working from in-memory state */
    }
  }

  /** Wipe persisted data and return a fresh copy of the seed dataset. */
  reset(): Software[] {
    this.storage?.removeItem(SoftwareStorageService.KEY);
    const seed = this.seed();
    this.save(seed);
    return seed;
  }

  /** A deep copy of the default projects so callers can mutate freely. */
  seed(): Software[] {
    return MOCK_SOFTWARE.map((s) => ({ ...s }));
  }
}
