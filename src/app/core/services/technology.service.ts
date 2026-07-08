import { Injectable } from '@angular/core';

import { TechStackItem } from '../models/software.model';
import { Technology, TECHNOLOGIES, findTechnology } from '../data/technologies';

/**
 * Central access to the technology catalog. Resolves a project's tech-stack
 * name to its canonical icon/category so display stays consistent even when a
 * cloud row stored only the name.
 */
@Injectable({ providedIn: 'root' })
export class TechnologyService {
  readonly all: readonly Technology[] = TECHNOLOGIES;

  /** Icon for a tech name — the item's own icon wins, else the catalog, else a dot. */
  iconFor(item: TechStackItem): string {
    return item.icon ?? findTechnology(item.name)?.icon ?? '•';
  }

  category(name: string): string | undefined {
    return findTechnology(name)?.category;
  }
}
