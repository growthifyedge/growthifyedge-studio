import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { adminGuard } from './core/guards/admin.guard';

/**
 * Every feature page is a standalone component, lazy-loaded via `loadComponent`.
 * The Shell hosts the persistent dark sidebar + glass topbar; presentation mode
 * renders full-bleed without chrome.
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Executive Dashboard · GrowthifyEdge',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'gallery',
        title: 'Software Gallery · GrowthifyEdge',
        loadComponent: () =>
          import('./features/software-library/software-library').then((m) => m.SoftwareLibrary)
      },
      {
        path: 'software/:slug',
        title: 'Software Detail · GrowthifyEdge',
        loadComponent: () =>
          import('./features/software-detail/software-detail').then((m) => m.SoftwareDetail)
      },
      {
        path: 'automations',
        title: 'AI Automation Gallery · GrowthifyEdge',
        loadComponent: () =>
          import('./features/ai-automations/ai-automations').then((m) => m.AiAutomations)
      },
      {
        path: 'lab',
        title: 'Mini Software Lab · GrowthifyEdge',
        loadComponent: () => import('./features/mini-lab/mini-lab').then((m) => m.MiniLab)
      },
      {
        path: 'theatre',
        title: 'Demo Theatre · GrowthifyEdge',
        loadComponent: () =>
          import('./features/demo-theatre/demo-theatre').then((m) => m.DemoTheatre)
      },
      {
        path: 'case-studies',
        title: 'Case Studies · GrowthifyEdge',
        loadComponent: () => import('./features/case-studies/case-studies').then((m) => m.CaseStudies)
      },
      {
        path: 'roadmap',
        title: 'Roadmap · GrowthifyEdge',
        loadComponent: () => import('./features/roadmap/roadmap').then((m) => m.Roadmap)
      },
      {
        path: 'present',
        title: 'Client Presentation · GrowthifyEdge',
        loadComponent: () => import('./features/presentation/presentation').then((m) => m.Presentation)
      },
      {
        path: 'present/:slug',
        title: 'Client Presentation · GrowthifyEdge',
        loadComponent: () =>
          import('./features/project-presentation/project-presentation').then(
            (m) => m.ProjectPresentation
          )
      },
      {
        path: 'login',
        title: 'Admin Sign In · GrowthifyEdge',
        loadComponent: () => import('./features/login/login').then((m) => m.Login)
      },
      {
        path: 'studio',
        title: 'Admin Studio · GrowthifyEdge',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin').then((m) => m.Admin)
      },
      {
        path: 'studio/new',
        title: 'Add Software · GrowthifyEdge',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/software-form/software-form').then((m) => m.SoftwareForm)
      },
      {
        path: 'studio/edit/:id',
        title: 'Edit Software · GrowthifyEdge',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/software-form/software-form').then((m) => m.SoftwareForm)
      },
      {
        path: 'contact',
        title: 'Request a Demo · GrowthifyEdge',
        loadComponent: () => import('./features/contact/contact').then((m) => m.Contact)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
