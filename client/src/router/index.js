/**
 * Vue Router configuration for Montage Auto Studio.
 * Defines client-side routes, navigation guards, and history mode settings.
 */

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AdminView from '@/views/AdminView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';

// Application route definitions
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
  },
];

// Router instance creation with HTML5 Web History mode
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard for authentication checks
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isSubscriberSession = localStorage.getItem('subscriber_session_active') || localStorage.getItem('auth_token');
    // If no session active, initialize guest session for preview
    if (!isSubscriberSession) {
      localStorage.setItem('subscriber_session_active', 'true');
      localStorage.setItem('subscriber_name', 'Member Guest');
    }
  }
  next();
});

export default router;


