<template>
  <div class="admin-content">
    <a-card title="内容审核">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="question" tab="题目审核" />
        <a-tab-pane key="feedback" tab="反馈处理" />
      </a-tabs>

      <a-table
        :columns="columns"
        :data-source="pendingItems"
        :loading="loading"
        :pagination="pagination"
        row-key="_id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'content'">
            <span>{{ truncate(record.text || record.content || record.title || '', 80) }}</span>
          </template>
          <template v-if="column.key === 'category'">
            <a-tag>{{ record.category || '-' }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" size="small" @click="handleApprove(record)">通过</a-button>
              <a-button danger size="small" @click="handleReject(record)">拒绝</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const activeTab = ref('question');
const pendingItems = ref([]);
const loading = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const questionColumns = [
  { title: '题目内容', key: 'content', dataIndex: 'text', ellipsis: true },
  { title: '分类', key: 'category', dataIndex: 'category', width: 120 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 100 },
  { title: '提交时间', key: 'createdAt', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
];

const feedbackColumns = [
  { title: '反馈内容', key: 'content', dataIndex: 'content', ellipsis: true },
  { title: '分类', key: 'category', dataIndex: 'category', width: 120 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 100 },
  { title: '提交时间', key: 'createdAt', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
];

const columns = ref(questionColumns);

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function formatDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleString('zh-CN');
}

function statusColor(s) {
  const map = { pending: 'orange', approved: 'green', rejected: 'red' };
  return map[s] || 'default';
}

function statusLabel(s) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' };
  return map[s] || s || '-';
}

function handleTabChange(key) {
  columns.value = key === 'question' ? questionColumns : feedbackColumns;
  pagination.current = 1;
  fetchPendingItems();
}

function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchPendingItems();
}

async function fetchPendingItems() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.set('type', activeTab.value);
    params.set('page', pagination.current);
    params.set('limit', pagination.pageSize);
    const res = await fetch(`/api/admin/content/pending?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      pendingItems.value = data.data?.pending || [];
      pagination.total = pendingItems.value.length;
    } else {
      message.error(data.error || '获取待审核内容失败');
    }
  } catch {
    message.error('获取待审核内容失败');
  } finally {
    loading.value = false;
  }
}

async function handleApprove(record) {
  try {
    const res = await fetch(`/api/admin/content/${record._type}/${record._id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) {
      message.success('审核通过');
      fetchPendingItems();
    } else {
      message.error(data.error || '操作失败');
    }
  } catch {
    message.error('操作失败');
  }
}

async function handleReject(record) {
  try {
    const res = await fetch(`/api/admin/content/${record._type}/${record._id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) {
      message.success('已拒绝');
      fetchPendingItems();
    } else {
      message.error(data.error || '操作失败');
    }
  } catch {
    message.error('操作失败');
  }
}

onMounted(() => {
  fetchPendingItems();
});
</script>

<style scoped>
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
