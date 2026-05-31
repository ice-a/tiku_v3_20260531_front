<template>
  <div class="home">
    <!-- 一言模块 -->
    <HitokotoBar />

    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card-gradient">
          <a-statistic title="题目总数" :value="stats.totalQuestions" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card-gradient">
          <a-statistic title="导航总数" :value="stats.totalNavigations" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card-gradient">
          <a-statistic title="AFF 总数" :value="stats.totalAffiliates" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 3 列内容 -->
    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <!-- 最新题目 -->
      <a-col :xs="24" :lg="8">
        <a-card title="最新题目">
          <a-list
            :data-source="latestQuestions"
            :loading="loading"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <router-link :to="`/tiku/${item._id}`">
                      {{ truncate(item.text, 50) }}
                    </router-link>
                  </template>
                  <template #description>
                    <a-space>
                      <a-tag>{{ item.category }}</a-tag>
                      <a-tag :color="difficultyColor(item.difficulty)">
                        {{ difficultyLabel(item.difficulty) }}
                      </a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 热门导航 -->
      <a-col :xs="24" :lg="8">
        <a-card title="热门导航">
          <a-list
            :data-source="hotNavigations"
            :loading="loading"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a :href="item.url" target="_blank" rel="noopener noreferrer">
                      {{ item.name }}
                    </a>
                  </template>
                  <template #description>
                    <a-space>
                      <a-tag>{{ item.category }}</a-tag>
                      <a-tag v-for="tag in item.tags?.slice(0, 3)" :key="tag">{{ tag }}</a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- AFF 推荐 -->
      <a-col :xs="24" :lg="8">
        <a-card title="AFF 推荐">
          <a-list
            :data-source="hotAffiliates"
            :loading="loading"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a :href="item.url" target="_blank" rel="noopener noreferrer">
                      {{ item.name }}
                    </a>
                  </template>
                  <template #description>
                    <a-space>
                      <a-tag>{{ item.category }}</a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiGet } from '../utils/api.js';
import HitokotoBar from '../components/HitokotoBar.vue';

const loading = ref(false);
const stats = ref({ totalQuestions: 0, totalNavigations: 0, totalAffiliates: 0 });
const latestQuestions = ref([]);
const hotNavigations = ref([]);
const hotAffiliates = ref([]);

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

async function fetchStats() {
  try {
    const [qData, nData, aData] = await Promise.all([
      apiGet('/api/questions?limit=1'),
      apiGet('/api/navigations?limit=1'),
      apiGet('/api/affiliates?limit=1'),
    ]);
    stats.value = {
      totalQuestions: qData.total || 0,
      totalNavigations: nData.total || 0,
      totalAffiliates: aData.total || 0,
    };
  } catch {
    // ignore
  }
}

async function fetchLatest() {
  loading.value = true;
  try {
    const data = await apiGet('/api/questions?limit=5&status=approved');
    latestQuestions.value = data.questions || [];
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
}

async function fetchHotNav() {
  try {
    const data = await apiGet('/api/navigations?limit=5');
    hotNavigations.value = data.navigations || [];
  } catch {
    // ignore
  }
}

async function fetchHotAff() {
  try {
    const data = await apiGet('/api/affiliates?limit=5');
    hotAffiliates.value = data.affiliates || [];
  } catch {
    // ignore
  }
}

onMounted(() => {
  fetchStats();
  fetchLatest();
  fetchHotNav();
  fetchHotAff();
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
