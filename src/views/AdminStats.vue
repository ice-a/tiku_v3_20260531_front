<template>
  <div class="admin-stats">
    <!-- 概览卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="6">
        <a-card>
          <a-statistic title="总用户" :value="stats.users?.total || 0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card>
          <a-statistic title="今日新增" :value="stats.users?.newToday || 0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card>
          <a-statistic title="总题目" :value="stats.content?.totalQuestions || 0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card>
          <a-statistic title="总练习" :value="stats.activity?.totalPractices || 0" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细统计 -->
    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :xs="24" :md="12">
        <a-card title="内容统计">
          <a-spin :spinning="contentLoading">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="题目总数">{{ contentStats.questions?.total || 0 }}</a-descriptions-item>
              <a-descriptions-item label="待审核">{{ contentStats.questions?.pending || 0 }}</a-descriptions-item>
              <a-descriptions-item label="导航总数">{{ contentStats.navigations?.total || 0 }}</a-descriptions-item>
              <a-descriptions-item label="AFF 总数">{{ contentStats.affiliates?.total || 0 }}</a-descriptions-item>
            </a-descriptions>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card title="用户统计">
          <a-spin :spinning="statsLoading">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="总用户">{{ stats.users?.total || 0 }}</a-descriptions-item>
              <a-descriptions-item label="今日新增">{{ stats.users?.newToday || 0 }}</a-descriptions-item>
              <a-descriptions-item label="活跃用户">{{ stats.users?.active || 0 }}</a-descriptions-item>
              <a-descriptions-item label="管理员">{{ stats.users?.admins || 0 }}</a-descriptions-item>
            </a-descriptions>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>

    <!-- 活动统计 -->
    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="活动统计">
          <a-spin :spinning="statsLoading">
            <a-descriptions :column="{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }" bordered size="small">
              <a-descriptions-item label="总练习次数">{{ stats.activity?.totalPractices || 0 }}</a-descriptions-item>
              <a-descriptions-item label="今日练习">{{ stats.activity?.todayPractices || 0 }}</a-descriptions-item>
              <a-descriptions-item label="总浏览量">{{ stats.activity?.totalViews || 0 }}</a-descriptions-item>
              <a-descriptions-item label="今日浏览">{{ stats.activity?.todayViews || 0 }}</a-descriptions-item>
            </a-descriptions>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet } from '../utils/api.js';

const stats = reactive({
  users: {},
  content: {},
  activity: {},
});

const contentStats = reactive({
  questions: {},
  navigations: {},
  affiliates: {},
});

const statsLoading = ref(false);
const contentLoading = ref(false);

async function fetchDashboard() {
  statsLoading.value = true;
  try {
    const data = await apiGet('/api/admin/stats/dashboard');
    Object.assign(stats.users, data.users || {});
    Object.assign(stats.content, data.content || {});
    Object.assign(stats.activity, data.activity || {});
  } catch {
    message.error('获取仪表盘数据失败');
  } finally {
    statsLoading.value = false;
  }
}

async function fetchContentStats() {
  contentLoading.value = true;
  try {
    const data = await apiGet('/api/admin/stats/content');
    Object.assign(contentStats.questions, data.questions || {});
    Object.assign(contentStats.navigations, data.navigations || {});
    Object.assign(contentStats.affiliates, data.affiliates || {});
  } catch {
    message.error('获取内容统计失败');
  } finally {
    contentLoading.value = false;
  }
}

onMounted(() => {
  fetchDashboard();
  fetchContentStats();
});
</script>

<style scoped>
.admin-stats {
  width: 100%;
}
</style>
