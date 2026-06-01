import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue'),
      },
      {
        path: 'home',
        redirect: '/',
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/github/callback',
    name: 'GithubCallback',
    component: () => import('../views/GithubCallback.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue'),
    meta: { guest: true },
  },
  {
    path: '/tiku',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'TikuList',
        component: () => import('../views/QuestionList.vue'),
      },
      {
        path: ':id',
        name: 'TikuDetail',
        component: () => import('../views/QuestionDetail.vue'),
      },
    ],
  },
  {
    path: '/navigation',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Navigation',
        component: () => import('../views/NavigationList.vue'),
      },
    ],
  },
  {
    path: '/aff',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Aff',
        component: () => import('../views/AffiliateList.vue'),
      },
    ],
  },
  {
    path: '/career',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Career',
        component: () => import('../views/Career.vue'),
      },
    ],
  },
  {
    path: '/tools',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Tools',
        component: () => import('../views/ToolsIndex.vue'),
      },
      {
        path: 'image',
        name: 'ToolsImage',
        component: () => import('../views/ToolsImage.vue'),
      },
      {
        path: 'encode',
        name: 'ToolsEncode',
        component: () => import('../views/ToolsEncode.vue'),
      },
      {
        path: 'text',
        name: 'ToolsText',
        component: () => import('../views/ToolsText.vue'),
      },
      {
        path: 'code',
        name: 'ToolsCode',
        component: () => import('../views/ToolsCode.vue'),
      },
      {
        path: 'crypto',
        name: 'ToolsCrypto',
        component: () => import('../views/ToolsCrypto.vue'),
      },
      {
        path: 'format',
        name: 'ToolsFormat',
        component: () => import('../views/ToolsFormat.vue'),
      },
      {
        path: 'time',
        name: 'ToolsTime',
        component: () => import('../views/ToolsTime.vue'),
      },
      {
        path: 'generator',
        name: 'ToolsGenerator',
        component: () => import('../views/ToolsGenerator.vue'),
      },
    ],
  },
  {
    path: '/user',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/user/profile',
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../views/UserProfile.vue'),
      },
      {
        path: 'security',
        name: 'UserSecurity',
        component: () => import('../views/UserSecurity.vue'),
      },
      {
        path: 'notifications',
        name: 'UserNotifications',
        component: () => import('../views/UserNotifications.vue'),
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        component: () => import('../views/UserFavorites.vue'),
      },
      {
        path: 'ai-config',
        name: 'UserAiConfig',
        component: () => import('../views/UserAiConfig.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/users',
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/AdminUsers.vue'),
      },
      {
        path: 'content',
        name: 'AdminContent',
        component: () => import('../views/AdminContent.vue'),
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: () => import('../views/AdminStats.vue'),
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/AdminSettings.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const shouldRestoreUser = to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.guest;

  if (shouldRestoreUser && authStore.isAuthenticated && !authStore.user) {
    await authStore.getProfile();
  }

  // 如果需要认证但未登录，重定向到登录页
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 如果需要管理员权限
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return next({ name: 'TikuList' });
  }

  // 如果是访客页面（登录/注册）但已登录，重定向到首页
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'TikuList' });
  }

  next();
});

export default router;
