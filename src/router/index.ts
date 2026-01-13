import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/single-ticket',
    name: 'SingleTicket',
    component: () => import('../views/SingleTicketView.vue'),
  },
  {
    path: '/task-breakdown',
    name: 'TaskBreakdown',
    component: () => import('../views/TaskBreakdownView.vue'),
  },
  {
    path: '/story-coverage',
    name: 'StoryCoverage',
    component: () => import('../views/StoryCoverageView.vue'),
  },
  {
    path: '/prd-sync',
    name: 'PRDSync',
    component: () => import('../views/PRDSyncView.vue'),
  },
  {
    path: '/sprint-planning',
    name: 'SprintPlanning',
    component: () => import('../views/SprintPlanningView.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: () => import('../views/JobsView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Track page views in Google Analytics
router.afterEach((to) => {
  // Check if gtag is available (Google Analytics script loaded)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-JLES1V6N73', {
      page_path: to.path,
      page_title: to.name || to.path,
    });
  }
});

export default router;










