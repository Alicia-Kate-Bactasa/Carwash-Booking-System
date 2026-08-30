import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AdminView from '@/views/AdminView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';

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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isSubscriberSession = localStorage.getItem('subscriber_session_active');
    if (!isSubscriberSession) {
      return next({ name: 'home' });
    }
  }
  next();
});

export default router;
