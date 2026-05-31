<template>
  <div class="user-profile">
    <!-- 摘要头部 -->
    <div class="profile-header">
      <a-avatar :size="80" :src="form.avatar">
        {{ displayName.charAt(0).toUpperCase() }}
      </a-avatar>
      <div class="profile-header-info">
        <h2>{{ displayName }}</h2>
        <p v-if="form.bio" class="bio">{{ form.bio }}</p>
      </div>
    </div>

    <!-- 编辑表单 -->
    <a-card title="编辑个人信息" style="margin-top: 16px">
      <a-form :model="form" layout="vertical" @finish="handleSubmit">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="form.username" />
        </a-form-item>
        <a-form-item label="昵称" name="nickname">
          <a-input v-model:value="form.nickname" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="form.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="个人简介" name="bio">
          <a-textarea v-model:value="form.bio" placeholder="介绍一下自己" :rows="3" :maxlength="500" show-count />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" disabled />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">保存</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 统计卡片 -->
    <a-card title="我的统计" style="margin-top: 16px">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-statistic title="收藏数量" :value="stats.favoriteCount" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="答题数量" :value="stats.practiceCount" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="正确率" :value="stats.accuracy" suffix="%" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 元信息 -->
    <a-card title="账号信息" style="margin-top: 16px">
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="注册时间">{{ formatDate(createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="最近登录">{{ formatDate(lastLoginAt) }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPut } from '../utils/api.js';

const loading = ref(false);
const createdAt = ref('');
const lastLoginAt = ref('');
const stats = reactive({
  favoriteCount: 0,
  practiceCount: 0,
  correctCount: 0,
  accuracy: 0,
});
const form = reactive({
  username: '',
  email: '',
  avatar: '',
  nickname: '',
  phone: '',
  bio: '',
});

const displayName = computed(() => form.nickname || form.username || '');

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
    form.phone = user.phone || '';
    form.bio = user.bio || '';
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
    // 静默处理统计加载失败
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    await apiPut('/api/users/profile', {
      username: form.username,
      nickname: form.nickname,
      phone: form.phone,
      bio: form.bio,
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
});
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.profile-header-info h2 {
  margin: 0 0 4px;
  font-size: 22px;
}

.profile-header-info .bio {
  margin: 0;
  color: #999;
  font-size: 13px;
}
</style>
