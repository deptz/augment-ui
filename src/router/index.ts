import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/single-ticket',
    name: 'SingleTicket',
    component: () => import('../views/SingleTicketView.vue'),
    meta: { title: 'Single Ticket' },
  },
  {
    path: '/task-breakdown',
    name: 'TaskBreakdown',
    component: () => import('../views/TaskBreakdownView.vue'),
    meta: { title: 'Task Breakdown' },
  },
  {
    path: '/story-coverage',
    name: 'StoryCoverage',
    component: () => import('../views/StoryCoverageView.vue'),
    meta: { title: 'Story Coverage' },
  },
  {
    path: '/prd-sync',
    name: 'PRDSync',
    component: () => import('../views/PRDSyncView.vue'),
    meta: { title: 'PRD Sync' },
  },
  {
    path: '/sprint-planning',
    name: 'SprintPlanning',
    component: () => import('../views/SprintPlanningView.vue'),
    meta: { title: 'Sprint Planning' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Settings' },
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: () => import('../views/JobsView.vue'),
    meta: { title: 'Jobs' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update page title and track page views
router.afterEach((to) => {
  // Update document title
  const baseTitle = 'Augment';
  const pageTitle = to.meta.title as string | undefined;
  document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;

  // Track page views in Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-JLES1V6N73', {
      page_path: to.path,
      page_title: document.title,
    });
  }
});

export default router;










