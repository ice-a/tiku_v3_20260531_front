<template>
  <div class="question-detail" v-if="question">
    <!-- 题目信息 -->
    <a-card :loading="loading">
      <template #title>
        <a-space>
          <a-tag>{{ question.category }}</a-tag>
          <a-tag :color="difficultyColor(question.difficulty)">
            {{ difficultyLabel(question.difficulty) }}
          </a-tag>
          <a-tag v-for="tag in question.tags" :key="tag">{{ tag }}</a-tag>
        </a-space>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="handleFavorite" :type="isFavorite ? 'primary' : 'default'">
            {{ isFavorite ? '已收藏' : '收藏' }}
          </a-button>
          <a-button @click="handleShare">分享</a-button>
          <a-button @click="showFeedbackModal = true">反馈</a-button>
          <a-tooltip :title="aiEnabled ? '' : '请先在 AI 配置中启用 AI'">
            <a-button
              @click="handleAiAnswer"
              :loading="aiAnswerLoading"
              :disabled="!aiEnabled"
            >
              AI 获取答案
            </a-button>
          </a-tooltip>
        </a-space>
      </template>

      <div class="question-text">
        <h3>题干</h3>
        <p>{{ question.text }}</p>
      </div>

      <a-divider />

      <div class="question-answer">
        <h3>参考答案</h3>
        <template v-if="showAnswer">
          <div class="answer-text"><MarkdownRenderer :content="question.answer" /></div>
          <a-button type="link" size="small" @click="showAnswer = false">隐藏答案</a-button>
        </template>
        <template v-else>
          <a-button type="dashed" block @click="showAnswer = true">
            查看答案
          </a-button>
        </template>
      </div>

      <!-- AI 生成答案区域 -->
      <div v-if="showAiAnswer && aiAnswer" class="ai-answer-section">
        <div class="ai-answer-header">
          <a-tag color="purple">AI 生成</a-tag>
          <a-button type="link" size="small" @click="showAiAnswer = false">收起</a-button>
        </div>
        <div class="ai-answer-text"><MarkdownRenderer :content="aiAnswer" /></div>
        <a-space>
          <a-button type="primary" size="small" @click="submitAiToPool" :loading="adoptLoading">
            提交到答案池
          </a-button>
          <a-button size="small" @click="showAiAnswer = false">忽略</a-button>
        </a-space>
      </div>

      <!-- 答案池 -->
      <div class="answer-pool-section">
        <div class="answer-pool-header">
          <h3>答案池 <a-tag>{{ answerPool.length }}</a-tag></h3>
        </div>

        <!-- 提交自己的答案 -->
        <div v-if="authStore.isAuthenticated" class="answer-pool-submit">
          <a-textarea
            v-model:value="poolAnswerText"
            placeholder="提交你的答案到答案池..."
            :rows="3"
          />
          <a-button
            type="primary"
            size="small"
            style="margin-top: 8px"
            @click="submitMyAnswer"
            :loading="poolSubmitLoading"
            :disabled="!poolAnswerText.trim()"
          >
            提交到答案池
          </a-button>
        </div>
        <div v-else class="answer-pool-login-hint">
          <a-typography-text type="secondary">登录后可提交答案到答案池</a-typography-text>
        </div>

        <!-- 答案列表 -->
        <a-list
          v-if="answerPool.length"
          :data-source="answerPool"
          :loading="answerPoolLoading"
          size="small"
          class="answer-pool-list"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #avatar>
                  <a-avatar style="background-color: #667eea">
                    {{ (item.user?.username || 'U')[0].toUpperCase() }}
                  </a-avatar>
                </template>
                <template #title>
                  <a-space>
                    <span>{{ item.user?.username || '匿名用户' }}</span>
                    <a-tag v-if="item.source === 'ai'" color="purple" size="small">AI</a-tag>
                    <a-tag v-else color="blue" size="small">手动</a-tag>
                  </a-space>
                </template>
                <template #description>
                  <div class="pool-answer-text"><MarkdownRenderer :content="item.answer" /></div>
                  <div class="pool-answer-time">{{ formatTime(item.createdAt) }}</div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
        <a-empty v-else-if="!answerPoolLoading" description="暂无答案，快来提交第一个吧" />
      </div>

      <a-descriptions bordered size="small" style="margin-top: 16px" :column="{ xs: 1, sm: 2 }">
        <a-descriptions-item label="浏览次数">{{ question.stats?.views || 0 }}</a-descriptions-item>
        <a-descriptions-item label="答题次数">{{ question.stats?.attempts || 0 }}</a-descriptions-item>
        <a-descriptions-item label="正确次数">{{ question.stats?.correctAttempts || 0 }}</a-descriptions-item>
        <a-descriptions-item label="正确率">
          {{ question.stats?.attempts ? Math.round((question.stats.correctAttempts / question.stats.attempts) * 100) : 0 }}%
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 分享图片预览 -->
    <a-modal v-model:open="showShareModal" title="分享题目" :footer="null">
      <img v-if="shareImageUrl" :src="shareImageUrl" alt="分享图片" style="width: 100%" />
      <a-spin v-else />
    </a-modal>

    <!-- 反馈弹窗 -->
    <a-modal
      v-model:open="showFeedbackModal"
      title="提交反馈"
      @ok="handleFeedback"
      :confirm-loading="feedbackLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="反馈类型">
          <a-select v-model:value="feedbackType" placeholder="请选择反馈类型">
            <a-select-option value="error_report">答案/内容错误</a-select-option>
            <a-select-option value="suggestion">建议/其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="反馈内容">
          <a-textarea v-model:value="feedbackContent" placeholder="请描述问题..." :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>

  <a-spin v-else-if="loading" style="display: block; margin: 100px auto" />

  <a-result v-else status="404" title="题目不存在" sub-title="请检查题目 ID 是否正确">
    <template #extra>
      <a-button type="primary" @click="$router.push('/tiku')">返回列表</a-button>
    </template>
  </a-result>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../stores/auth';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api.js';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const route = useRoute();
const authStore = useAuthStore();

const question = ref(null);
const loading = ref(false);
const showAnswer = ref(false);
const isFavorite = ref(false);
const showShareModal = ref(false);
const shareImageUrl = ref('');
const showFeedbackModal = ref(false);
const feedbackType = ref(undefined);
const feedbackContent = ref('');
const feedbackLoading = ref(false);

// AI answer state
const aiEnabled = ref(false);
const aiAnswer = ref('');
const aiAnswerLoading = ref(false);
const showAiAnswer = ref(false);
const adoptLoading = ref(false);

// 答案池状态
const answerPool = ref([]);
const answerPoolLoading = ref(false);
const poolAnswerText = ref('');
const poolSubmitLoading = ref(false);

function difficultyColor(d) {
  const map = { easy: 'green', medium: 'orange', hard: 'red' };
  return map[d] || 'default';
}

function difficultyLabel(d) {
  const map = { easy: '简单', medium: '中等', hard: '困难' };
  return map[d] || d;
}

async function fetchQuestion() {
  loading.value = true;
  try {
    const data = await apiGet(`/api/questions/${route.params.id}`);
    question.value = data.question;
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
}

async function fetchAiConfigStatus() {
  if (!authStore.isAuthenticated) return;
  try {
    const data = await apiGet('/api/users/ai-config');
    aiEnabled.value = !!data.aiConfig?.enabled;
  } catch {
    // ignore
  }
}

async function handleAiAnswer() {
  aiAnswerLoading.value = true;
  try {
    const data = await apiPost(`/api/questions/${route.params.id}/ai-answer`, {});
    aiAnswer.value = data.answer;
    showAiAnswer.value = true;
  } catch {
    message.error('AI 生成答案失败');
  } finally {
    aiAnswerLoading.value = false;
  }
}

async function submitAiToPool() {
  adoptLoading.value = true;
  try {
    const data = await apiPost(`/api/questions/${route.params.id}/answer-pool`, {
      answer: aiAnswer.value,
      source: 'ai'
    });
    answerPool.value = data.answerPool;
    showAiAnswer.value = false;
    message.success('AI 答案已提交到答案池');
  } catch {
    message.error('提交答案失败');
  } finally {
    adoptLoading.value = false;
  }
}

async function submitMyAnswer() {
  if (!poolAnswerText.value.trim()) return;
  poolSubmitLoading.value = true;
  try {
    const data = await apiPost(`/api/questions/${route.params.id}/answer-pool`, {
      answer: poolAnswerText.value,
      source: 'manual'
    });
    answerPool.value = data.answerPool;
    poolAnswerText.value = '';
    message.success('答案已提交到答案池');
  } catch {
    message.error('提交答案失败');
  } finally {
    poolSubmitLoading.value = false;
  }
}

async function fetchAnswerPool() {
  answerPoolLoading.value = true;
  try {
    const data = await apiGet(`/api/questions/${route.params.id}/answer-pool`);
    answerPool.value = data.answerPool || [];
  } catch {
    // ignore
  } finally {
    answerPoolLoading.value = false;
  }
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return d.toLocaleDateString('zh-CN');
}

async function handleFavorite() {
  if (!authStore.isAuthenticated) {
    message.warning('请先登录');
    return;
  }
  try {
    if (isFavorite.value) {
      await apiDelete(`/api/users/favorites/question/${route.params.id}`);
      isFavorite.value = false;
      message.success('已取消收藏');
    } else {
      await apiPost('/api/users/favorites', { itemType: 'question', itemId: route.params.id });
      isFavorite.value = true;
      message.success('已收藏');
    }
  } catch {
    message.error('操作失败');
  }
}

async function handleShare() {
  showShareModal.value = true;
  shareImageUrl.value = '';
  try {
    const res = await fetch(`/api/questions/${route.params.id}/share`);
    if (res.ok) {
      const blob = await res.blob();
      shareImageUrl.value = URL.createObjectURL(blob);
    }
  } catch {
    message.error('生成分享图片失败');
  }
}

async function handleFeedback() {
  if (!feedbackType.value || !feedbackContent.value.trim()) {
    message.warning('请填写反馈类型和内容');
    return;
  }
  if (!authStore.isAuthenticated) {
    message.warning('请先登录');
    return;
  }
  feedbackLoading.value = true;
  try {
    await apiPost(`/api/questions/${route.params.id}/feedback`, { type: feedbackType.value, content: feedbackContent.value });
    message.success('反馈已提交');
    showFeedbackModal.value = false;
    feedbackType.value = undefined;
    feedbackContent.value = '';
  } catch {
    message.error('提交反馈失败');
  } finally {
    feedbackLoading.value = false;
  }
}

onMounted(() => {
  fetchQuestion();
  fetchAiConfigStatus();
  fetchAnswerPool();
});
</script>

<style scoped>
.question-detail {
  width: 100%;
}

.question-text h3,
.question-answer h3 {
  margin-bottom: 8px;
  color: #667eea;
}

.answer-text {
  white-space: pre-wrap;
  line-height: 1.8;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
}

.ai-answer-section {
  margin-top: 16px;
  padding: 16px;
  background: #FFF7ED;
  border-left: 4px solid #667eea;
  border-radius: 8px;
}

.ai-answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ai-answer-text {
  white-space: pre-wrap;
  line-height: 1.8;
  margin-bottom: 12px;
}

.answer-pool-section {
  margin-top: 16px;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
}

.answer-pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.answer-pool-header h3 {
  margin: 0;
  color: #667eea;
}

.answer-pool-submit {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.answer-pool-login-hint {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
}

.answer-pool-list {
  background: transparent;
}

.pool-answer-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
  margin-bottom: 4px;
}

.pool-answer-time {
  color: #999;
  font-size: 12px;
}
</style>
