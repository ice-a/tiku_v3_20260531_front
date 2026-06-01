<template>
  <div class="user-profile">
    <!-- 头部横幅 -->
    <div class="profile-banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <a-avatar :size="72" :src="form.avatar" class="banner-avatar">
          {{ displayName.charAt(0).toUpperCase() }}
        </a-avatar>
        <div class="banner-info">
          <div class="banner-name-row">
            <h2>{{ displayName }}</h2>
            <a-tag v-if="isAdmin" color="gold" class="role-tag">管理员</a-tag>
            <a-tag v-else color="blue" class="role-tag">用户</a-tag>
          </div>
          <p v-if="form.bio" class="banner-bio">{{ form.bio }}</p>
          <p v-else class="banner-bio placeholder">这个人很懒，什么都没写~</p>
          <div class="banner-meta">
            <span>注册于 {{ formatDate(createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 个人数据统计 -->
    <a-card title="我的数据" style="margin-top: 16px" :bordered="false" class="stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ stats.practiceCount }}</div>
          <div class="stat-label">答题总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.correctCount }}</div>
          <div class="stat-label">答对题目</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.accuracy }}<span class="stat-unit">%</span></div>
          <div class="stat-label">正确率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.favoriteCount }}</div>
          <div class="stat-label">我的收藏</div>
        </div>
      </div>
    </a-card>

    <!-- 站点数据概览 -->
    <a-card title="站点数据" style="margin-top: 16px" :bordered="false" class="stats-card">
      <div class="stats-grid site-stats">
        <div class="stat-item">
          <div class="stat-value site">{{ siteStats.totalQuestions }}</div>
          <div class="stat-label">题目总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value site">{{ siteStats.totalNavigations }}</div>
          <div class="stat-label">导航收录</div>
        </div>
        <div class="stat-item">
          <div class="stat-value site">{{ siteStats.totalAffiliates }}</div>
          <div class="stat-label">AFF 收录</div>
        </div>
        <div class="stat-item">
          <div class="stat-value site">{{ siteStats.totalUsers }}</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-value site">{{ siteStats.totalPractices }}</div>
          <div class="stat-label">答题次数</div>
        </div>
      </div>
    </a-card>

    <!-- 我的提交 -->
    <a-card title="我的提交" style="margin-top: 16px" :bordered="false">
      <a-tabs v-model:activeKey="submissionTab">
        <a-tab-pane key="questions" tab="题目">
          <a-table
            :data-source="mySubmissions.questions"
            :columns="questionColumns"
            size="small"
            :pagination="false"
            row-key="_id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'text'">
                <router-link :to="`/tiku/${record._id}`">{{ truncate(record.text, 50) }}</router-link>
              </template>
              <template v-if="column.key === 'difficulty'">
                <a-tag :color="difficultyColor(record.difficulty)">{{ difficultyLabel(record.difficulty) }}</a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
              </template>
              <template v-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
            </template>
          </a-table>
          <a-empty v-if="!mySubmissions.questions.length" description="暂无提交" />
        </a-tab-pane>
        <a-tab-pane key="navigations" tab="导航">
          <a-table
            :data-source="mySubmissions.navigations"
            :columns="navColumns"
            size="small"
            :pagination="false"
            row-key="_id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a :href="record.url" target="_blank" rel="noopener noreferrer">{{ record.name }}</a>
              </template>
              <template v-if="column.key === 'status'">
                <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
              </template>
              <template v-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
            </template>
          </a-table>
          <a-empty v-if="!mySubmissions.navigations.length" description="暂无提交" />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 管理后台入口（仅管理员可见） -->
    <template v-if="isAdmin">
      <a-card title="管理后台" style="margin-top: 16px" :bordered="false" class="admin-card">
        <div class="admin-grid">
          <div class="admin-item" @click="$router.push('/admin/users')">
            <div class="admin-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
              <span> </span>
            </div>
            <div class="admin-text">
              <div class="admin-title">用户管理</div>
              <div class="admin-desc">查看和管理注册用户</div>
            </div>
          </div>
          <div class="admin-item" @click="$router.push('/admin/content')">
            <div class="admin-icon" style="background: linear-gradient(135deg, #f59e0b, #ef4444)">
              <span> </span>
            </div>
            <div class="admin-text">
              <div class="admin-title">内容审核</div>
              <div class="admin-desc">审核题目和反馈</div>
            </div>
          </div>
          <div class="admin-item" @click="$router.push('/admin/stats')">
            <div class="admin-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4)">
              <span> </span>
            </div>
            <div class="admin-text">
              <div class="admin-title">数据概览</div>
              <div class="admin-desc">查看站点统计数据</div>
            </div>
          </div>
          <div class="admin-item" @click="$router.push('/admin/settings')">
            <div class="admin-icon" style="background: linear-gradient(135deg, #ec4899, #f43f5e)">
              <span>⚙️</span>
            </div>
            <div class="admin-text">
              <div class="admin-title">系统设置</div>
              <div class="admin-desc">配置站点参数</div>
            </div>
          </div>
        </div>
      </a-card>
    </template>

    <!-- 社交信息 -->
    <a-card title="社交信息" style="margin-top: 16px" :bordered="false">
      <div class="social-list">
        <div v-for="item in socialPresets" :key="item.key" class="social-item">
          <div class="social-icon" :style="{ background: item.color }">
            <span>{{ item.icon }}</span>
          </div>
          <div class="social-info">
            <div class="social-name">{{ item.label }}</div>
            <a-input
              v-model:value="form.social[item.key]"
              :placeholder="item.placeholder"
              allow-clear
              size="small"
            />
          </div>
        </div>
      </div>
      <a-divider>自定义社交链接</a-divider>
      <div class="custom-social-list">
        <div v-for="(item, index) in form.customSocial" :key="index" class="custom-social-item">
          <a-input v-model:value="item.name" placeholder="名称" style="width: 120px" size="small" />
          <a-input v-model:value="item.url" placeholder="https://..." size="small" style="flex:1" />
          <a-button type="text" size="small" danger @click="removeCustomSocial(index)">删除</a-button>
        </div>
        <a-button type="dashed" size="small" @click="addCustomSocial" class="add-social-btn">+ 添加自定义链接</a-button>
      </div>
    </a-card>

    <!-- 编辑表单 -->
    <a-card title="编辑个人信息" style="margin-top: 16px" :bordered="false">
      <a-form :model="form" layout="vertical" @finish="handleSubmit">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="form.username" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="昵称" name="nickname">
              <a-input v-model:value="form.nickname" placeholder="请输入昵称" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="邮箱">
              <a-input v-model:value="form.email" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="个人简介" name="bio">
              <a-textarea v-model:value="form.bio" placeholder="介绍一下自己" :rows="3" :maxlength="500" show-count />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">保存修改</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 账号信息 -->
    <a-card title="账号信息" style="margin-top: 16px" :bordered="false">
      <a-descriptions :column="{ xs: 1, sm: 2 }" bordered size="small">
        <a-descriptions-item label="用户名">{{ form.username }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ form.email }}</a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag :color="isAdmin ? 'gold' : 'blue'">{{ isAdmin ? '管理员' : '普通用户' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="注册时间">{{ formatDate(createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="最近登录">{{ formatDate(lastLoginAt) }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../stores/auth';
import { apiGet, apiPut } from '../utils/api.js';

const authStore = useAuthStore();
const loading = ref(false);
const createdAt = ref('');
const lastLoginAt = ref('');
const submissionTab = ref('questions');
const mySubmissions = reactive({ questions: [], navigations: [] });
const stats = reactive({
  favoriteCount: 0,
  practiceCount: 0,
  correctCount: 0,
  accuracy: 0,
});
const siteStats = reactive({
  totalUsers: 0,
  totalQuestions: 0,
  totalNavigations: 0,
  totalAffiliates: 0,
  totalPractices: 0,
});
const socialPresets = [
  { key: 'github', label: 'GitHub', icon: 'GH', color: '#333', placeholder: '用户名或主页链接' },
  { key: 'bilibili', label: 'Bilibili', icon: 'B', color: '#fb7299', placeholder: 'UID 或空间链接' },
  { key: 'twitter', label: 'Twitter / X', icon: 'X', color: '#1da1f2', placeholder: '@用户名或链接' },
  { key: 'telegram', label: 'Telegram', icon: 'TG', color: '#0088cc', placeholder: '@用户名或链接' },
  { key: 'discord', label: 'Discord', icon: 'DC', color: '#5865f2', placeholder: '用户名#标签或邀请链接' },
  { key: 'steam', label: 'Steam', icon: 'S', color: '#1b2838', placeholder: 'Steam ID 或主页链接' },
];

const form = reactive({
  username: '',
  email: '',
  avatar: '',
  nickname: '',
  bio: '',
  social: {},
  customSocial: [],
});

const displayName = computed(() => form.nickname || form.username || '');
const isAdmin = computed(() => authStore.user?.role === 'admin');

const questionColumns = [
  { title: '题目', key: 'text', dataIndex: 'text', ellipsis: true },
  { title: '分类', key: 'category', dataIndex: 'category', width: 100 },
  { title: '难度', key: 'difficulty', dataIndex: 'difficulty', width: 80 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '提交时间', key: 'createdAt', dataIndex: 'createdAt', width: 160 },
];

const navColumns = [
  { title: '网站名称', key: 'name', dataIndex: 'name', ellipsis: true },
  { title: '分类', key: 'category', dataIndex: 'category', width: 100 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '提交时间', key: 'createdAt', dataIndex: 'createdAt', width: 160 },
];

function difficultyColor(d) {
  const map = { easy: 'green', medium: 'orange', hard: 'red' };
  return map[d] || 'default';
}

function difficultyLabel(d) {
  const map = { easy: '简单', medium: '中等', hard: '困难' };
  return map[d] || d;
}

function statusColor(s) {
  const map = { pending: 'orange', approved: 'green', rejected: 'red' };
  return map[s] || 'default';
}

function statusLabel(s) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' };
  return map[s] || s || '-';
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function fetchProfile() {
  loading.value = true;
  try {
    const data = await apiGet('/api/users/profile');
    const user = data.user || data;
    form.username = user.username || '';
    form.email = user.email || '';
    form.avatar = user.avatar || '';
    form.nickname = user.nickname || '';
    form.bio = user.bio || '';
    const s = user.socials || user.social || {};
    form.social = { ...s };
    form.customSocial = user.customSocial || [];
    createdAt.value = user.createdAt || '';
    lastLoginAt.value = user.lastLoginAt || '';
  } catch {
    message.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
}

async function fetchStats() {
  try {
    const data = await apiGet('/api/users/stats');
    Object.assign(stats, data);
  } catch {
    // ignore
  }
}

async function fetchSiteStats() {
  try {
    const data = await apiGet('/api/users/site-stats');
    Object.assign(siteStats, data);
  } catch {
    // ignore
  }
}

async function fetchSubmissions() {
  try {
    const data = await apiGet('/api/users/my-submissions');
    mySubmissions.questions = data.questions || [];
    mySubmissions.navigations = data.navigations || [];
  } catch {
    // ignore
  }
}

function addCustomSocial() {
  form.customSocial.push({ name: '', url: '' });
}

function removeCustomSocial(index) {
  form.customSocial.splice(index, 1);
}

async function handleSubmit() {
  loading.value = true;
  try {
    await apiPut('/api/users/profile', {
      username: form.username,
      nickname: form.nickname,
      bio: form.bio,
      socials: form.social,
      customSocial: form.customSocial.filter(item => item.name || item.url),
    });
    message.success('保存成功');
  } catch {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProfile();
  fetchStats();
  fetchSiteStats();
  fetchSubmissions();
});
</script>

<style scoped>
.user-profile {
  width: 100%;
}

/* Banner */
.profile-banner {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.banner-bg {
  height: 100px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
}

.banner-content {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 0 24px 20px;
  margin-top: -36px;
  position: relative;
}

.banner-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.banner-info {
  flex: 1;
  min-width: 0;
}

.banner-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-name-row h2 {
  margin: 0;
  font-size: 20px;
  color: #1a1a2e;
}

.role-tag {
  flex-shrink: 0;
}

.banner-bio {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

.banner-bio.placeholder {
  color: #94a3b8;
  font-style: italic;
}

.banner-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stats-grid.site-stats {
  grid-template-columns: repeat(5, 1fr);
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: #f8fafc;
  border-radius: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.stat-value.site {
  font-size: 22px;
  color: #6366f1;
}

.stat-unit {
  font-size: 16px;
  font-weight: 500;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Social */
.social-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  transition: background 0.2s;
}

.social-item:hover {
  background: #f1f5f9;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

.social-icon span {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.social-info {
  flex: 1;
  min-width: 0;
}

.social-name {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.custom-social-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-social-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-social-btn {
  align-self: flex-start;
}

/* Admin Grid */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.admin-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-item:hover {
  background: #eef2ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.admin-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
}

.admin-icon span {
  font-size: 22px;
}

.admin-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.admin-desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid.site-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .banner-content {
    padding: 0 16px 16px;
  }
}
</style>
