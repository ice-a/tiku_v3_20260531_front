<template>
  <div class="affiliate-list">
    <!-- 搜索栏 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="[16, 12]" align="middle">
        <a-col :xs="24" :sm="10">
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索 AFF..."
            allow-clear
            @search="handleSearch"
            @change="onKeywordChange"
          />
        </a-col>
        <a-col :xs="12" :sm="6">
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

    <!-- AFF 卡片列表 -->
    <a-spin :spinning="loading">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="item in affiliates"
          :key="item._id"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <a-card hoverable class="aff-card" @click="openUrl(item.url)">
            <template #cover>
              <div class="aff-icon-wrapper">
                <img
                  v-if="item.icon"
                  :src="item.icon"
                  :alt="item.name"
                  class="aff-icon"
                  @error="(e) => e.target.style.display = 'none'"
                />
                <div v-else class="aff-icon-placeholder">
                  {{ item.name?.charAt(0) }}
                </div>
              </div>
            </template>
            <a-card-meta :title="item.name" :description="item.category">
              <template #description>
                <div>
                  <a-tag>{{ item.category }}</a-tag>
                  <div class="aff-tags">
                    <a-tag v-for="tag in item.tags?.slice(0, 3)" :key="tag" color="blue">{{ tag }}</a-tag>
                  </div>
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>

      <a-empty v-if="!loading && affiliates.length === 0" description="暂无 AFF 数据" />
    </a-spin>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <a-pagination
        v-model:current="current"
        v-model:page-size="pageSize"
        :total="total"
        show-size-changer
        :show-total="(t) => `共 ${t} 条`"
        @change="handlePageChange"
        @showSizeChange="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiGet } from '../utils/api.js';

const keyword = ref('');
const category = ref(undefined);
const selectedTags = ref([]);
const affiliates = ref([]);
const loading = ref(false);
const categories = ref([]);
const current = ref(1);
const pageSize = ref(20);
const total = ref(0);

function openUrl(url) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
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

function handlePageChange() {
  fetchAffiliates();
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
    affiliates.value = data.affiliates || [];
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
  max-width: 1200px;
  margin: 0 auto;
}

.aff-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.aff-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.aff-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: #fafafa;
}

.aff-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.aff-icon-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.aff-tags {
  margin-top: 4px;
}

.pagination-wrapper {
  margin-top: 24px;
  text-align: right;
}
</style>
