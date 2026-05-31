<template>
  <div class="admin-users">
    <a-card title="用户管理">
      <a-input-search
        v-model:value="keyword"
        placeholder="搜索用户..."
        style="width: 300px; margin-bottom: 16px"
        allow-clear
        @search="handleSearch"
      />
      <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="pagination"
        row-key="_id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'orange'">
              {{ record.status === 'active' ? '正常' : record.status }}
            </a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-popconfirm title="确定删除该用户？" @confirm="handleDelete(record._id)">
                <a style="color: red">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editVisible"
      title="编辑用户"
      @ok="handleEditSubmit"
      :confirm-loading="editLoading"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="用户名">
          <a-input v-model:value="editForm.username" disabled />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="editForm.role">
            <a-select-option value="user">user</a-select-option>
            <a-select-option value="admin">admin</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const keyword = ref('');
const users = ref([]);
const loading = ref(false);
const editVisible = ref(false);
const editLoading = ref(false);
const editingId = ref('');

const editForm = reactive({
  username: '',
  role: 'user',
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
  { title: '邮箱', dataIndex: 'email', key: 'email', ellipsis: true },
  { title: '角色', key: 'role', dataIndex: 'role', width: 100 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 100 },
  { title: '注册时间', key: 'createdAt', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' },
];

function formatDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleString('zh-CN');
}

function handleSearch() {
  pagination.current = 1;
  fetchUsers();
}

function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchUsers();
}

function buildQuery() {
  const params = new URLSearchParams();
  params.set('page', pagination.current);
  params.set('limit', pagination.pageSize);
  if (keyword.value) params.set('keyword', keyword.value);
  return params.toString();
}

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await fetch(`/api/admin/users?${buildQuery()}`);
    const data = await res.json();
    if (data.success) {
      users.value = data.data.users || data.data || [];
      pagination.total = data.data.total || 0;
    } else {
      message.error(data.error || '获取用户列表失败');
    }
  } catch {
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

function handleEdit(record) {
  editingId.value = record._id;
  editForm.username = record.username;
  editForm.role = record.role || 'user';
  editVisible.value = true;
}

async function handleEditSubmit() {
  editLoading.value = true;
  try {
    const res = await fetch(`/api/admin/users/${editingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: editForm.role }),
    });
    const data = await res.json();
    if (data.success) {
      message.success('更新成功');
      editVisible.value = false;
      fetchUsers();
    } else {
      message.error(data.error || '更新失败');
    }
  } catch {
    message.error('更新失败');
  } finally {
    editLoading.value = false;
  }
}

async function handleDelete(id) {
  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      message.success('删除成功');
      fetchUsers();
    } else {
      message.error(data.error || '删除失败');
    }
  } catch {
    message.error('删除失败');
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
