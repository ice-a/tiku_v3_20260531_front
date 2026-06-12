<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">T</span>
          <span class="logo-text">题库系统</span>
        </router-link>

        <nav class="nav">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item.key) }"
          >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="header-right">
          <template v-if="authStore.isAuthenticated">
            <a-dropdown>
              <button class="user-btn">
                <span class="avatar">{{ userInitial }}</span>
                <span class="username">{{ authStore.user?.username || '用户' }}</span>
                <svg class="chevron" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
              </button>
              <template #overlay>
                <a-menu @click="handleUserMenuClick">
                  <a-menu-item key="profile">个人信息</a-menu-item>
                  <a-menu-item key="security">安全设置</a-menu-item>
                  <a-menu-item key="favorites">收藏夹</a-menu-item>
                  <a-menu-item key="ai-config">AI 配置</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <div class="auth-btns">
              <button class="btn-ghost" @click="$router.push('/login')">登录</button>
              <button class="btn-primary" @click="$router.push('/register')">注册</button>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main class="content">
      <HitokotoBar v-if="!route.meta.hideHitokoto" compact style="margin-bottom: 16px" />
      <router-view />
    </main>

    <footer class="footer">
      <span>题库系统 &copy; {{ new Date().getFullYear() }}</span>
      <a
        class="footer-link"
        href="https://github.com/ice-a"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub: ice-a
      </a>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HitokotoBar from '../components/HitokotoBar.vue';
import {
  HomeOutlined,
  BookOutlined,
  CompassOutlined,
  LinkOutlined,
  ReadOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = [
  { key: 'home', label: '首页', path: '/', icon: HomeOutlined },
  { key: 'tiku', label: '题库', path: '/tiku', icon: BookOutlined },
  { key: 'navigation', label: '导航', path: '/navigation', icon: CompassOutlined },
  { key: 'aff', label: 'AFF', path: '/aff', icon: LinkOutlined },
  { key: 'career', label: '面试辅导', path: '/career', icon: ReadOutlined },
  { key: 'tools', label: '在线工具', path: '/tools', icon: ToolOutlined },
];

const userInitial = computed(() => {
  const name = authStore.user?.username || '';
  return name.charAt(0).toUpperCase();
});

function isActive(key) {
  const path = route.path;
  if (key === 'home') return path === '/';
  return path.startsWith(`/${key}`);
}

function handleUserMenuClick({ key }) {
  if (key === 'logout') {
    authStore.logout();
    router.push('/login');
  } else {
    router.push(`/user/${key}`);
  }
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e8ecf1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.logo:hover .logo-icon {
  transform: scale(1.05);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: #334155;
  background: #f1f5f9;
}

.nav-item.active {
  color: #6366f1;
  background: #eef2ff;
  font-weight: 600;
}

.header-right {
  flex-shrink: 0;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.chevron {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.auth-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-ghost {
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-primary {
  padding: 6px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1280px;
  margin: 24px auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  border-top: 1px solid #e8ecf1;
  background: #fff;
}

.footer-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

@media (max-width: 960px) {
  .header-inner {
    flex-wrap: wrap;
    gap: 10px;
    height: auto;
    min-height: 60px;
    padding: 10px 16px;
  }

  .nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
  }

  .nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }

  .content {
    margin: 16px auto;
    padding: 0 16px;
  }
}

@media (max-width: 560px) {
  .header-right {
    width: 100%;
  }

  .auth-btns {
    justify-content: flex-end;
  }

  .username {
    display: none;
  }
}
</style>
