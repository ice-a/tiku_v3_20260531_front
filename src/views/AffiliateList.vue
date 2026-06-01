<template>
  <div class="affiliate-list">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-row">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索 AFF..."
          allow-clear
          size="large"
          @search="handleSearch"
          @change="onKeywordChange"
          @pressEnter="handleSearch"
          class="search-input"
        />
        <a-select
          v-model:value="category"
          placeholder="全部分类"
          allow-clear
          style="width: 140px"
          @change="handleSearch"
        >
          <a-select-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-select-option>
        </a-select>
        <a-select
          v-model:value="selectedTags"
          mode="tags"
          placeholder="标签筛选"
          allow-clear
          style="width: 200px"
          @change="handleSearch"
        />
        <a-button @click="resetSearch" :disabled="!keyword && !category && !selectedTags.length">
          重置
        </a-button>
      </div>
      <div class="search-meta" v-if="total > 0">
        共 <b>{{ total }}</b> 条结果
        <template v-if="keyword"> · 关键词: "{{ keyword }}"</template>
        <template v-if="category"> · 分类: {{ category }}</template>
      </div>
    </div>

    <!-- 卡片网格（内部滚动） -->
    <div class="card-grid-wrapper" ref="gridRef">
      <a-spin :spinning="loading">
        <div class="card-grid">
          <div
            v-for="item in affiliates"
            :key="item._id"
            class="card-cell"
            @click="openUrl(item.url)"
          >
            <div class="card-block" :style="{ background: item.gradient }">
              <span class="card-letter">{{ item.name?.charAt(0) }}</span>
            </div>
            <div class="card-info">
              <div class="card-name" :title="item.name">{{ item.name }}</div>
              <a-tag size="small">{{ item.category }}</a-tag>
            </div>
          </div>
        </div>
        <a-empty v-if="!loading && affiliates.length === 0" description="暂无 AFF 数据" />
      </a-spin>
    </div>

    <!-- 分页 -->
    <div class="pagination-bar" v-if="total > 0">
      <div class="page-info">
        {{ (current - 1) * pageSize + 1 }}-{{ Math.min(current * pageSize, total) }} / {{ total }}
      </div>
      <a-pagination
        v-model:current="current"
        :page-size="pageSize"
        :total="total"
        size="small"
        :show-size-changer="false"
        :show-quick-jumper="total > pageSize * 5"
        @change="handlePageChange"
      />
      <div class="page-actions">
        <a-button size="small" :disabled="current <= 1" @click="goPage(1)">首页</a-button>
        <a-button size="small" :disabled="current >= Math.ceil(total / pageSize)" @click="goPage(Math.ceil(total / pageSize))">末页</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiGet } from '../utils/api.js';
import { attachBlockIcons } from '../utils/blockIcon.js';

const keyword = ref('');
const category = ref(undefined);
const selectedTags = ref([]);
const affiliates = ref([]);
const loading = ref(false);
const categories = ref([]);
const current = ref(1);
const pageSize = ref(16);
const total = ref(0);
const gridRef = ref(null);

function openUrl(url) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

function resetSearch() {
  keyword.value = '';
  category.value = undefined;
  selectedTags.value = [];
  current.value = 1;
  fetchAffiliates();
}

let searchTimer = null;
function onKeywordChange() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => handleSearch(), 300);
}

function handleSearch() {
  current.value = 1;
  fetchAffiliates();
}

function handlePageChange(page) {
  current.value = page;
  fetchAffiliates();
  if (gridRef.value) gridRef.value.scrollTop = 0;
}

function goPage(page) {
  current.value = page;
  fetchAffiliates();
  if (gridRef.value) gridRef.value.scrollTop = 0;
}

function buildQuery() {
  const params = new URLSearchParams();
  params.set('page', current.value);
  params.set('limit', pageSize.value);
  if (keyword.value) params.set('keyword', keyword.value);
  if (category.value) params.set('category', category.value);
  if (selectedTags.value.length > 0) params.set('tags', selectedTags.value.join(','));
  return params.toString();
}

async function fetchAffiliates() {
  loading.value = true;
  try {
    const data = await apiGet(`/api/affiliates?${buildQuery()}`);
    affiliates.value = attachBlockIcons(data.affiliates || []);
    total.value = data.total || 0;
    const cats = new Set(data.affiliates.map((a) => a.category).filter(Boolean));
    categories.value = [...new Set([...categories.value, ...cats])];
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const data = await apiGet('/api/affiliates?limit=100');
    const cats = new Set(data.affiliates.map((a) => a.category).filter(Boolean));
    categories.value = [...cats];
  } catch {
    // ignore
  }
}

onMounted(() => {
  fetchAffiliates();
  fetchCategories();
});
</script>

<style scoped>
.affiliate-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.search-bar {
  flex-shrink: 0;
  padding: 14px 16px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.search-meta {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.search-meta b {
  color: #6366f1;
  font-weight: 600;
}

.card-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.card-cell {
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.card-cell:hover {
  transform: scale(1.06) translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.card-cell:hover .card-letter {
  transform: scale(1.2) rotate(-5deg);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-block {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
}

.card-letter {
  font-size: 30px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              text-shadow 0.3s ease;
  user-select: none;
}

.card-info {
  padding: 8px 10px;
  text-align: center;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px 2px;
  gap: 12px;
}

.page-info {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  min-width: 100px;
}

.page-actions {
  display: flex;
  gap: 6px;
}
</style>
