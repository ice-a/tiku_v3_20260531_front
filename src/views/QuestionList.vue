<template>
  <div class="question-list">
    <!-- 搜索栏 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="[16, 12]" align="middle">
        <a-col :xs="24" :sm="8">
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索题目..."
            allow-clear
            @search="handleSearch"
            @change="onKeywordChange"
          />
        </a-col>
        <a-col :xs="12" :sm="4">
          <a-select
            v-model:value="category"
            placeholder="分类"
            allow-clear
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="12" :sm="4">
          <a-select
            v-model:value="difficulty"
            placeholder="难度"
            allow-clear
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option value="easy">简单</a-select-option>
            <a-select-option value="medium">中等</a-select-option>
            <a-select-option value="hard">困难</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="6">
          <a-select
            v-model:value="selectedTags"
            mode="tags"
            placeholder="输入标签筛选"
            style="width: 100%"
            @change="handleSearch"
          />
        </a-col>
        <a-col :xs="24" :sm="2">
          <a-button type="primary" block @click="showUploadModal = true">
            上传题目
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 题目列表 -->
    <a-table
      :columns="columns"
      :data-source="questions"
      :loading="loading"
      :pagination="pagination"
      row-key="_id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'text'">
          <router-link :to="`/tiku/${record._id}`">
            {{ truncate(record.text, 60) }}
          </router-link>
        </template>
        <template v-if="column.key === 'category'">
          <a-tag>{{ record.category }}</a-tag>
        </template>
        <template v-if="column.key === 'difficulty'">
          <a-tag :color="difficultyColor(record.difficulty)">
            {{ difficultyLabel(record.difficulty) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'tags'">
          <a-space>
            <a-tag v-for="tag in record.tags?.slice(0, 3)" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
      </template>
    </a-table>

    <!-- 上传题目弹窗 -->
    <a-modal
      v-model:open="showUploadModal"
      title="上传题目"
      @ok="handleUpload"
      :confirm-loading="uploadLoading"
      @cancel="resetUploadForm"
    >
      <a-form :model="uploadForm" layout="vertical">
        <a-form-item label="题目内容" required>
          <a-textarea v-model:value="uploadForm.text" placeholder="请输入题目内容" :rows="4" />
        </a-form-item>
        <a-form-item label="参考答案" required>
          <a-textarea v-model:value="uploadForm.answer" placeholder="请输入参考答案" :rows="3" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类" required>
              <a-input v-model:value="uploadForm.category" placeholder="如：前端、后端" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="难度" required>
              <a-select v-model:value="uploadForm.difficulty" placeholder="选择难度">
                <a-select-option value="easy">简单</a-select-option>
                <a-select-option value="medium">中等</a-select-option>
                <a-select-option value="hard">困难</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="标签">
          <a-select v-model:value="uploadForm.tags" mode="tags" placeholder="输入标签后回车" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPost } from '../utils/api.js';

const keyword = ref('');
const category = ref(undefined);
const difficulty = ref(undefined);
const selectedTags = ref([]);
const questions = ref([]);
const loading = ref(false);
const categories = ref([]);

// Upload state
const showUploadModal = ref(false);
const uploadLoading = ref(false);
const uploadForm = reactive({
  text: '',
  answer: '',
  category: '',
  difficulty: undefined,
  tags: [],
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const columns = [
  { title: '题目', key: 'text', dataIndex: 'text', ellipsis: true },
  { title: '分类', key: 'category', dataIndex: 'category', width: 120 },
  { title: '难度', key: 'difficulty', dataIndex: 'difficulty', width: 80 },
  { title: '标签', key: 'tags', dataIndex: 'tags', width: 200 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '浏览', dataIndex: ['stats', 'views'], width: 70 },
  { title: '答题', dataIndex: ['stats', 'attempts'], width: 70 },
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

let searchTimer = null;
function onKeywordChange() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => handleSearch(), 300);
}

function handleSearch() {
  pagination.current = 1;
  fetchQuestions();
}

function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchQuestions();
}

function buildQuery() {
  const params = new URLSearchParams();
  params.set('page', pagination.current);
  params.set('limit', pagination.pageSize);
  if (keyword.value) params.set('keyword', keyword.value);
  if (category.value) params.set('category', category.value);
  if (difficulty.value) params.set('difficulty', difficulty.value);
  if (selectedTags.value.length > 0) params.set('tags', selectedTags.value.join(','));
  return params.toString();
}

async function fetchQuestions() {
  loading.value = true;
  try {
    const data = await apiGet(`/api/questions?${buildQuery()}`);
    questions.value = data.questions || [];
    pagination.total = data.total || 0;
    const cats = new Set(data.questions.map((q) => q.category).filter(Boolean));
    categories.value = [...new Set([...categories.value, ...cats])];
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const data = await apiGet('/api/questions?limit=100');
    const cats = new Set(data.questions.map((q) => q.category).filter(Boolean));
    categories.value = [...cats];
  } catch {
    // ignore
  }
}

async function handleUpload() {
  if (!uploadForm.text.trim() || !uploadForm.answer.trim() || !uploadForm.category || !uploadForm.difficulty) {
    message.warning('请填写题目、答案、分类和难度');
    return;
  }
  uploadLoading.value = true;
  try {
    await apiPost('/api/questions', {
      text: uploadForm.text,
      answer: uploadForm.answer,
      category: uploadForm.category,
      difficulty: uploadForm.difficulty,
      tags: uploadForm.tags,
    });
    message.success('题目已提交，等待审核');
    showUploadModal.value = false;
    resetUploadForm();
    fetchQuestions();
  } catch (err) {
    message.error(err.message || '上传失败');
  } finally {
    uploadLoading.value = false;
  }
}

function resetUploadForm() {
  uploadForm.text = '';
  uploadForm.answer = '';
  uploadForm.category = '';
  uploadForm.difficulty = undefined;
  uploadForm.tags = [];
}

onMounted(() => {
  fetchQuestions();
  fetchCategories();
});
</script>

<style scoped>
.question-list {
  width: 100%;
}
</style>
