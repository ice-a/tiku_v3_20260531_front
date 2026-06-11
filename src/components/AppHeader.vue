<template>
  <a-layout-header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <router-link to="/" class="logo">
          <span class="logo-text">题库系统</span>
        </router-link>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :theme="'dark'"
          class="nav-menu"
          @click="handleMenuClick"
        >
          <a-menu-item key="home">
            <template #icon><HomeOutlined /></template>
            首页
          </a-menu-item>
          <a-menu-item key="tiku">
            <template #icon><BookOutlined /></template>
            题库
          </a-menu-item>
          <a-menu-item key="navigation">
            <template #icon><CompassOutlined /></template>
            导航
          </a-menu-item>
          <a-menu-item key="aff">
            <template #icon><LinkOutlined /></template>
            AFF
          </a-menu-item>
          <a-menu-item key="tools">
            <template #icon><ToolOutlined /></template>
            在线工具
          </a-menu-item>
        </a-menu>
      </div>

      <div class="header-right">
        <template v-if="!isLoggedIn">
          <a-space>
            <a-button type="link" @click="goToLogin">登录</a-button>
            <a-button type="primary" @click="goToRegister">注册</a-button>
          </a-space>
        </template>
        <template v-else>
          <a-dropdown>
            <a-space class="user-info">
              <a-avatar :src="userInfo.avatar" :size="32">
                {{ userInfo.username?.charAt(0)?.toUpperCase() }}
              </a-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <a-tag v-if="isPro" color="purple" size="small">PRO</a-tag>
              <a-tag v-if="isEnterprise" color="gold" size="small">企业</a-tag>
            </a-space>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="favorites">
                  <StarOutlined />
                  收藏夹
                </a-menu-item>
                <a-menu-item key="membership">
                  <CrownOutlined />
                  会员中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  HomeOutlined,
  BookOutlined,
  CompassOutlined,
  LinkOutlined,
  ToolOutlined,
  UserOutlined,
  StarOutlined,
  LogoutOutlined,
  CrownOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useAuthStore();

const selectedKeys = ref([route.name || 'home']);

const isLoggedIn = computed(() => !!userStore.token);
const userInfo = computed(() => userStore.user || {});
const isPro = computed(() => userStore.user?.membership?.plan === 'pro');
const isEnterprise = computed(() => userStore.user?.membership?.plan === 'enterprise');

const routeMap = {
  home: '/',
  tiku: '/tiku',
  navigation: '/navigation',
  aff: '/aff',
  tools: '/tools'
};

const handleMenuClick = ({ key }) => {
  const path = routeMap[key];
  if (path) {
    router.push(path);
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const handleUserMenuClick = ({ key }) => {
  switch (key) {
    case 'profile':
      router.push('/user/profile');
      break;
    case 'favorites':
      router.push('/user/favorites');
      break;
    case 'membership':
      router.push('/user/membership');
      break;
    case 'logout':
      userStore.logout();
      router.push('/');
      break;
  }
};
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  line-height: 64px;
  padding: 0 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
}

.nav-menu {
  line-height: 64px;
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  color: #fff;
  font-size: 14px;
}
</style>
