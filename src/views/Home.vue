<template>
  <div class="home-page">
    <section class="overview-panel">
      <div class="overview-copy">
        <p class="eyebrow">资源工作台</p>
        <h1>题库、导航、AFF 和工具集中入口</h1>
        <p class="summary">
          快速进入练习、资料导航、推广资源和常用在线工具，首页只保留高频入口和最近内容。
        </p>

        <div class="home-search">
          <a-segmented
            v-model:value="searchScope"
            :options="searchScopeOptions"
            size="large"
          />
          <a-input-search
            v-model:value="searchKeyword"
            :placeholder="searchPlaceholder"
            size="large"
            enter-button="搜索"
            allow-clear
            @search="handleSearch"
          />
        </div>
      </div>

      <div class="quick-actions" aria-label="常用入口">
        <router-link
          v-for="action in quickActions"
          :key="action.path"
          :to="action.path"
          class="quick-action"
        >
          <span class="quick-icon" :style="{ color: action.color, background: action.bg }">
            <component :is="action.icon" />
          </span>
          <span class="quick-text">
            <strong>{{ action.title }}</strong>
            <small>{{ action.description }}</small>
          </span>
          <ArrowRightOutlined class="quick-arrow" />
        </router-link>
      </div>
    </section>

    <!-- 广告位 -->
    <AdSlot slot="home_banner" />

    <a-alert
      v-if="errorText"
      type="warning"
      show-icon
      :message="errorText"
      closable
      @close="errorText = ''"
    />

    <section class="stats-grid" aria-label="数据概览">
      <router-link
        v-for="item in statItems"
        :key="item.key"
        :to="item.path"
        class="stat-tile"
      >
        <span class="stat-icon" :style="{ color: item.color, background: item.bg }">
          <component :is="item.icon" />
        </span>
        <span class="stat-info">
          <small>{{ item.title }}</small>
          <strong>{{ loading.stats ? '--' : stats[item.key] }}</strong>
        </span>
      </router-link>
    </section>

    <section class="content-grid">
      <div class="home-panel questions-panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">最新题目</p>
            <h2>最近更新</h2>
          </div>
          <router-link class="panel-link" to="/tiku">
            查看全部 <ArrowRightOutlined />
          </router-link>
        </div>

        <a-skeleton v-if="loading.questions" active :paragraph="{ rows: 5 }" />
        <div v-else-if="latestQuestions.length" class="question-list">
          <router-link
            v-for="question in latestQuestions"
            :key="question._id"
            :to="`/tiku/${question._id}`"
            class="question-row"
          >
            <span class="question-title">{{ truncate(question.text, 64) }}</span>
            <span class="question-meta">
              <a-tag v-if="question.category">{{ question.category }}</a-tag>
              <a-tag :color="difficultyColor(question.difficulty)">
                {{ difficultyLabel(question.difficulty) }}
              </a-tag>
            </span>
          </router-link>
        </div>
        <a-empty v-else description="暂无题目" />
      </div>

      <div class="home-panel navigation-panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">资源导航</p>
            <h2>常用站点</h2>
          </div>
          <router-link class="panel-link" to="/navigation">
            更多导航 <ArrowRightOutlined />
          </router-link>
        </div>

        <div v-if="categoryOptions.length > 1" class="category-filter">
          <a-segmented
            v-model:value="activeCategory"
            :options="categoryOptions"
            size="small"
          />
        </div>

        <a-skeleton v-if="loading.navigations" active :paragraph="{ rows: 4 }" />
        <div v-else-if="filteredNavigations.length" class="resource-grid">
          <button
            v-for="item in filteredNavigations"
            :key="item._id"
            class="resource-tile"
            type="button"
            @click="openUrl(item.url)"
          >
            <span class="resource-mark" :style="{ background: item.gradient }">
              {{ getInitial(item.name) }}
            </span>
            <span class="resource-name" :title="item.name">{{ item.name }}</span>
            <span class="resource-category">{{ item.category || '未分类' }}</span>
          </button>
        </div>
        <a-empty v-else description="暂无导航" />
      </div>

      <div class="home-panel affiliate-panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">AFF 推荐</p>
            <h2>近期资源</h2>
          </div>
          <router-link class="panel-link" to="/aff">
            查看 AFF <ArrowRightOutlined />
          </router-link>
        </div>

        <a-skeleton v-if="loading.affiliates" active :paragraph="{ rows: 4 }" />
        <div v-else-if="hotAffiliates.length" class="affiliate-list">
          <a
            v-for="item in hotAffiliates"
            :key="item._id"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="affiliate-row"
          >
            <span>
              <strong>{{ item.name }}</strong>
              <small>{{ item.category || '未分类' }}</small>
            </span>
            <ArrowRightOutlined />
          </a>
        </div>
        <a-empty v-else description="暂无 AFF 数据" />
      </div>

      <div class="home-panel tools-panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">在线工具</p>
            <h2>快速处理</h2>
          </div>
          <router-link class="panel-link" to="/tools">
            工具箱 <ArrowRightOutlined />
          </router-link>
        </div>

        <div class="tool-list">
          <router-link
            v-for="tool in toolShortcuts"
            :key="tool.path"
            :to="tool.path"
            class="tool-row"
          >
            <span class="tool-icon" :style="{ color: tool.color, background: tool.bg }">
              <component :is="tool.icon" />
            </span>
            <span>
              <strong>{{ tool.title }}</strong>
              <small>{{ tool.description }}</small>
            </span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRightOutlined,
  BookOutlined,
  CodeOutlined,
  CompassOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  LinkOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue';
import { apiGet } from '../utils/api.js';
import { attachBlockIcons } from '../utils/blockIcon.js';
import AdSlot from '../components/AdSlot.vue';

const router = useRouter();

const searchKeyword = ref('');
const searchScope = ref('questions');
const activeCategory = ref('__all__');
const errorText = ref('');

const loading = reactive({
  stats: false,
  questions: false,
  navigations: false,
  affiliates: false,
});

const stats = reactive({
  totalQuestions: 0,
  totalNavigations: 0,
  totalAffiliates: 0,
});

const latestQuestions = ref([]);
const hotNavigations = ref([]);
const hotAffiliates = ref([]);
const navCategories = ref([]);

const searchScopes = [
  {
    label: '题目',
    value: 'questions',
    path: '/tiku',
    placeholder: '搜索题目、答案关键词',
  },
  {
    label: '导航',
    value: 'navigations',
    path: '/navigation',
    placeholder: '搜索站点名称或链接',
  },
  {
    label: 'AFF',
    value: 'affiliates',
    path: '/aff',
    placeholder: '搜索 AFF 名称或链接',
  },
];

const quickActions = [
  {
    title: '题库练习',
    description: '按分类、难度和标签筛选题目',
    path: '/tiku',
    icon: BookOutlined,
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    title: '资源导航',
    description: '集中打开常用学习与开发站点',
    path: '/navigation',
    icon: CompassOutlined,
    color: '#059669',
    bg: '#d1fae5',
  },
  {
    title: '在线工具',
    description: '编码、格式化、时间和生成器',
    path: '/tools',
    icon: ToolOutlined,
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    title: '面试辅导',
    description: '沉淀面试准备和练习记录',
    path: '/career',
    icon: FileTextOutlined,
    color: '#b45309',
    bg: '#fef3c7',
  },
];

const statItems = [
  {
    key: 'totalQuestions',
    title: '题目总数',
    path: '/tiku',
    icon: BookOutlined,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    key: 'totalNavigations',
    title: '导航站点',
    path: '/navigation',
    icon: CompassOutlined,
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    key: 'totalAffiliates',
    title: 'AFF 资源',
    path: '/aff',
    icon: LinkOutlined,
    color: '#dc2626',
    bg: '#fef2f2',
  },
];

const toolShortcuts = [
  {
    title: '编码转换',
    description: 'URL、Base64 和常用编码',
    path: '/tools/encode',
    icon: CodeOutlined,
    color: '#0f766e',
    bg: '#ccfbf1',
  },
  {
    title: '文本处理',
    description: '清洗、统计和转换文本',
    path: '/tools/text',
    icon: FileTextOutlined,
    color: '#4338ca',
    bg: '#e0e7ff',
  },
  {
    title: '时间工具',
    description: '时间戳、时区和日期计算',
    path: '/tools/time',
    icon: FieldTimeOutlined,
    color: '#b45309',
    bg: '#fef3c7',
  },
];

const searchScopeOptions = searchScopes.map(({ label, value }) => ({ label, value }));

const searchPlaceholder = computed(() => {
  return searchScopes.find((item) => item.value === searchScope.value)?.placeholder || '输入关键词';
});

const categoryOptions = computed(() => [
  { label: '全部', value: '__all__' },
  ...navCategories.value.map((category) => ({ label: category, value: category })),
]);

const filteredNavigations = computed(() => {
  if (activeCategory.value === '__all__') {
    return hotNavigations.value;
  }
  return hotNavigations.value.filter((item) => item.category === activeCategory.value);
});

function handleSearch(value) {
  const scope = searchScopes.find((item) => item.value === searchScope.value) || searchScopes[0];
  const keyword = (value || searchKeyword.value).trim();
  router.push({
    path: scope.path,
    query: keyword ? { keyword } : {},
  });
}

function difficultyColor(difficulty) {
  const map = { easy: 'green', medium: 'orange', hard: 'red' };
  return map[difficulty] || 'default';
}

function difficultyLabel(difficulty) {
  const map = { easy: '简单', medium: '中等', hard: '困难' };
  return map[difficulty] || '未设置';
}

function truncate(text, length) {
  if (!text) return '未命名题目';
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
}

function openUrl(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function setHomeError(message) {
  if (!errorText.value) {
    errorText.value = message;
  }
}

async function fetchStats() {
  loading.stats = true;
  try {
    const [questionData, navigationData, affiliateData] = await Promise.all([
      apiGet('/api/questions?limit=1'),
      apiGet('/api/navigations?limit=1'),
      apiGet('/api/affiliates?limit=1'),
    ]);

    stats.totalQuestions = questionData.total || 0;
    stats.totalNavigations = navigationData.total || 0;
    stats.totalAffiliates = affiliateData.total || 0;
  } catch {
    setHomeError('首页统计加载失败，请稍后刷新。');
  } finally {
    loading.stats = false;
  }
}

async function fetchLatestQuestions() {
  loading.questions = true;
  try {
    const data = await apiGet('/api/questions?limit=6&status=approved');
    latestQuestions.value = data.questions || [];
  } catch {
    setHomeError('最新题目加载失败，请稍后刷新。');
  } finally {
    loading.questions = false;
  }
}

async function fetchHotNavigations() {
  loading.navigations = true;
  try {
    const data = await apiGet('/api/navigations?limit=12');
    const navigations = data.navigations || [];
    hotNavigations.value = attachBlockIcons(navigations);
    navCategories.value = [...new Set(navigations.map((item) => item.category).filter(Boolean))];
  } catch {
    setHomeError('导航数据加载失败，请稍后刷新。');
  } finally {
    loading.navigations = false;
  }
}

async function fetchHotAffiliates() {
  loading.affiliates = true;
  try {
    const data = await apiGet('/api/affiliates?limit=5');
    hotAffiliates.value = data.affiliates || [];
  } catch {
    setHomeError('AFF 数据加载失败，请稍后刷新。');
  } finally {
    loading.affiliates = false;
  }
}

onMounted(() => {
  fetchStats();
  fetchLatestQuestions();
  fetchHotNavigations();
  fetchHotAffiliates();
});
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  color: #172033;
}

.overview-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 24px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
}

.overview-copy h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0;
}

.eyebrow,
.panel-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.summary {
  max-width: 640px;
  margin: 12px 0 20px;
  color: #526071;
  line-height: 1.7;
}

.home-search {
  display: grid;
  grid-template-columns: auto minmax(260px, 1fr);
  gap: 12px;
  align-items: center;
}

.quick-actions {
  display: grid;
  gap: 10px;
}

.quick-action,
.stat-tile,
.question-row,
.affiliate-row,
.tool-row {
  text-decoration: none;
}

.quick-action {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 16px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  color: #172033;
  background: #fbfdff;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.quick-action:hover {
  border-color: #cbd5e1;
  background: #fff;
  transform: translateY(-1px);
}

.quick-icon,
.stat-icon,
.tool-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.quick-icon {
  width: 42px;
  height: 42px;
  font-size: 21px;
}

.quick-text,
.stat-info,
.affiliate-row span,
.tool-row span {
  display: grid;
  min-width: 0;
}

.quick-text strong,
.affiliate-row strong,
.tool-row strong {
  color: #172033;
  font-size: 14px;
  line-height: 1.35;
}

.quick-text small,
.affiliate-row small,
.tool-row small {
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.quick-arrow {
  color: #94a3b8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 86px;
  padding: 16px;
  color: #172033;
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
}

.stat-tile:hover {
  border-color: #cbd5e1;
}

.stat-icon {
  width: 44px;
  height: 44px;
  font-size: 22px;
  flex: 0 0 auto;
}

.stat-info small {
  color: #64748b;
  font-size: 13px;
}

.stat-info strong {
  margin-top: 4px;
  color: #0f172a;
  font-size: 28px;
  line-height: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 16px;
  margin-top: 16px;
}

.home-panel {
  min-width: 0;
  padding: 18px;
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
  color: #111827;
}

.panel-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  color: #2563eb;
  font-size: 13px;
  text-decoration: none;
}

.question-list,
.affiliate-list,
.tool-list {
  display: grid;
  gap: 10px;
}

.question-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid #eef2f7;
  color: #172033;
}

.question-row:last-child {
  border-bottom: 0;
}

.question-row:hover .question-title {
  color: #2563eb;
}

.question-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-meta {
  display: inline-flex;
  gap: 4px;
  white-space: nowrap;
}

.category-filter {
  max-width: 100%;
  margin-bottom: 14px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
  gap: 10px;
}

.resource-tile {
  display: grid;
  gap: 7px;
  justify-items: center;
  min-width: 0;
  padding: 12px 8px;
  background: #fbfdff;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  cursor: pointer;
}

.resource-tile:hover {
  border-color: #cbd5e1;
  background: #fff;
}

.resource-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.resource-name {
  max-width: 100%;
  overflow: hidden;
  color: #172033;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-category {
  max-width: 100%;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.affiliate-row,
.tool-row {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #172033;
  background: #fbfdff;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
}

.affiliate-row {
  grid-template-columns: minmax(0, 1fr) 16px;
}

.tool-row {
  grid-template-columns: 38px minmax(0, 1fr);
}

.affiliate-row:hover,
.tool-row:hover {
  border-color: #cbd5e1;
  background: #fff;
}

.tool-icon {
  width: 38px;
  height: 38px;
  font-size: 19px;
}

@media (max-width: 960px) {
  .overview-panel,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .home-search {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .overview-panel,
  .home-panel {
    padding: 16px;
  }

  .overview-copy h1 {
    font-size: 23px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .question-row {
    grid-template-columns: 1fr;
  }

  .question-meta {
    flex-wrap: wrap;
  }
}
</style>
