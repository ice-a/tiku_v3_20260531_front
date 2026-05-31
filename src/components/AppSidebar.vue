<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    collapsible
    :width="220"
    :collapsed-width="64"
    class="app-sidebar"
  >
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      theme="dark"
      @click="handleMenuClick"
    >
      <template v-for="item in menuItems" :key="item.key">
        <a-sub-menu v-if="item.children" :key="item.key">
          <template #icon>
            <component :is="item.icon" />
          </template>
          <template #title>{{ item.label }}</template>
          <a-menu-item v-for="child in item.children" :key="child.key">
            <template #icon>
              <component :is="child.icon" />
            </template>
            {{ child.label }}
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item v-else :key="item.key">
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.label }}
        </a-menu-item>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  TagsOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  StarOutlined,
  ToolOutlined
} from '@ant-design/icons-vue';

const props = defineProps({
  menuConfig: {
    type: Array,
    default: () => []
  }
});

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref([route.name || 'home']);
const openKeys = ref([]);

const defaultMenuItems = [
  {
    key: 'home',
    label: '首页',
    icon: HomeOutlined,
    path: '/'
  },
  {
    key: 'tiku',
    label: '题库管理',
    icon: BookOutlined,
    children: [
      { key: 'tiku-list', label: '题目列表', icon: FileTextOutlined, path: '/tiku' },
      { key: 'tiku-categories', label: '分类管理', icon: TagsOutlined, path: '/tiku/categories' },
      { key: 'tiku-stats', label: '练习统计', icon: BarChartOutlined, path: '/tiku/stats' }
    ]
  },
  {
    key: 'navigation',
    label: '导航管理',
    icon: HomeOutlined,
    path: '/navigation'
  },
  {
    key: 'aff',
    label: 'AFF管理',
    icon: HomeOutlined,
    path: '/aff'
  },
  {
    key: 'tools',
    label: '在线工具',
    icon: ToolOutlined,
    path: '/tools'
  },
  {
    key: 'profile',
    label: '个人中心',
    icon: UserOutlined,
    children: [
      { key: 'profile-info', label: '个人信息', icon: UserOutlined, path: '/profile' },
      { key: 'profile-security', label: '安全设置', icon: SafetyOutlined, path: '/profile/security' },
      { key: 'profile-notifications', label: '消息通知', icon: BellOutlined, path: '/profile/notifications' },
      { key: 'profile-favorites', label: '收藏夹', icon: StarOutlined, path: '/favorites' },
      { key: 'profile-ai', label: 'AI配置', icon: SettingOutlined, path: '/profile/ai' }
    ]
  }
];

const menuItems = computed(() => {
  return props.menuConfig.length > 0 ? props.menuConfig : defaultMenuItems;
});

const findMenuItem = (items, key) => {
  for (const item of items) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findMenuItem(item.children, key);
      if (found) return found;
    }
  }
  return null;
};

const handleMenuClick = ({ key }) => {
  const item = findMenuItem(menuItems.value, key);
  if (item?.path) {
    router.push(item.path);
  }
};
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  overflow-y: auto;
  z-index: 999;
}

.app-sidebar::-webkit-scrollbar {
  width: 6px;
}

.app-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>
