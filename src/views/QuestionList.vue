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
        <a-col :xs="24" :sm="8">
          <a-select
            v-model:value="selectedTags"
            mode="tags"
            placeholder="输入标签筛选"
            style="width: 100%"
            @change="handleSearch"
          />
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
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { apiGet } from '../utils/api.js';

const keyword = ref('');
const category = ref(undefined);
const difficulty = ref(undefined);
const selectedTags = ref([]);
const questions = ref([]);
const loading = ref(false);
const categories = ref([]);

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
  { title: '浏览', dataIndex: ['stats', 'views'], width: 80 },
  { title: '答题', dataIndex: ['stats', 'attempts'], width: 80 },
];

function difficultyColor(d) {
  const map = { easy: 'green', medium: 'orange', hard: 'red' };
  return map[d] || 'default';
}

function difficultyLabel(d) {
  const map = { easy: '简单', medium: '中等', hard: '困难' };
  return map[d] || d;
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

onMounted(() => {
  fetchQuestions();
  fetchCategories();
});
</script>

<style scoped>
.question-list {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
