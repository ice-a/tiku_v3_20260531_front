<template>
  <div class="career-page">
    <!-- 桌面端左侧历史列表 -->
    <aside class="history-sidebar" v-if="!isMobile">
      <div class="sidebar-header">
        <a-button type="primary" block @click="startNewChat">
          + 新建对话
        </a-button>
      </div>
      <div class="history-list">
        <div
          v-for="item in historyList"
          :key="item._id"
          :class="['history-item', { active: currentHistoryId === item._id }]"
          @click="loadHistory(item._id)"
        >
          <div class="history-item-title">{{ item.title }}</div>
          <div class="history-item-meta">
            <span class="history-item-type">{{ typeLabels[item.type] }}</span>
            <span class="history-item-time">{{ formatTime(item.lastMessageAt) }}</span>
          </div>
          <a-button
            type="text"
            size="small"
            danger
            class="history-item-delete"
            @click.stop="deleteHistoryItem(item._id)"
          >
            删除
          </a-button>
        </div>
        <div v-if="historyList.length === 0" class="history-empty">
          暂无对话历史
        </div>
      </div>
    </aside>

    <!-- 移动端抽屉 -->
    <a-drawer
      v-if="isMobile"
      v-model:open="drawerVisible"
      title="对话历史"
      placement="left"
      :width="280"
    >
      <div class="sidebar-header">
        <a-button type="primary" block @click="startNewChat">
          + 新建对话
        </a-button>
      </div>
      <div class="history-list">
        <div
          v-for="item in historyList"
          :key="item._id"
          :class="['history-item', { active: currentHistoryId === item._id }]"
          @click="loadHistory(item._id); drawerVisible = false"
        >
          <div class="history-item-title">{{ item.title }}</div>
          <div class="history-item-meta">
            <span class="history-item-type">{{ typeLabels[item.type] }}</span>
            <span class="history-item-time">{{ formatTime(item.lastMessageAt) }}</span>
          </div>
          <a-button
            type="text"
            size="small"
            danger
            class="history-item-delete"
            @click.stop="deleteHistoryItem(item._id)"
          >
            删除
          </a-button>
        </div>
        <div v-if="historyList.length === 0" class="history-empty">
          暂无对话历史
        </div>
      </div>
    </a-drawer>

    <!-- 右侧对话面板 -->
    <main class="chat-panel">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <a-button v-if="isMobile" type="text" @click="drawerVisible = true">
          历史
        </a-button>
        <a-select v-model:value="mode" style="width: 140px" @change="handleModeChange">
          <a-select-option value="interview">面试辅导</a-select-option>
          <a-select-option value="resume">简历优化</a-select-option>
          <a-select-option value="career">职场规划</a-select-option>
        </a-select>
      </div>

      <!-- 对话区域 -->
      <div class="chat-container" ref="chatContainer">
        <!-- 欢迎卡片 -->
        <div v-if="messages.length === 0" class="welcome-section">
          <div class="welcome-card">
            <h2>你好，我是你的 AI 辅导顾问</h2>
            <p>选择下方话题开始对话，或直接输入你的问题</p>
          </div>
          <div class="prompt-chips">
            <div class="chip-group">
              <h4>面试模式</h4>
              <div class="chips">
                <a-button
                  v-for="chip in interviewChips"
                  :key="chip"
                  size="small"
                  class="chip-btn"
                  @click="sendChip(chip)"
                >
                  {{ chip }}
                </a-button>
              </div>
            </div>
            <div class="chip-group">
              <h4>简历模式</h4>
              <div class="chips">
                <a-button
                  v-for="chip in resumeChips"
                  :key="chip"
                  size="small"
                  class="chip-btn"
                  @click="sendChip(chip)"
                >
                  {{ chip }}
                </a-button>
              </div>
            </div>
            <div class="chip-group">
              <h4>职业模式</h4>
              <div class="chips">
                <a-button
                  v-for="chip in careerChips"
                  :key="chip"
                  size="small"
                  class="chip-btn"
                  @click="sendChip(chip)"
                >
                  {{ chip }}
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div :class="msg.role === 'user' ? 'user-bubble' : 'ai-bubble'">
            <MarkdownRenderer v-if="msg.role === 'assistant'" :content="msg.content" />
            <p v-else>{{ msg.content }}</p>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="message assistant">
          <div class="ai-bubble loading-bubble">
            <span class="dot-typing"></span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <a-textarea
          v-model:value="input"
          :placeholder="placeholderText"
          :rows="2"
          :auto-size="{ minRows: 1, maxRows: 4 }"
          @pressEnter.prevent="handleSend"
          class="chat-input"
        />
        <a-button
          type="primary"
          @click="handleSend"
          :loading="loading"
          :disabled="!input.trim()"
          class="send-btn"
        >
          发送
        </a-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPost, apiDelete } from '../utils/api.js';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const mode = ref('interview');
const input = ref('');
const loading = ref(false);
const messages = ref([]);
const chatContainer = ref(null);
const currentHistoryId = ref(null);
const historyList = ref([]);
const drawerVisible = ref(false);
const isMobile = ref(false);

const typeLabels = {
  interview: '面试辅导',
  resume: '简历优化',
  career: '职场规划'
};

const interviewChips = ['帮我模拟一次前端面试', '分析我的简历优势', '制定转岗计划'];
const resumeChips = ['优化我的工作经历描述', '简历应该突出什么'];
const careerChips = ['评估我的职业方向', '行业前景分析'];

const placeholderText = computed(() => {
  const map = {
    interview: '描述你面试的岗位和问题...',
    resume: '粘贴你的简历内容或描述优化需求...',
    career: '描述你的职业困惑或规划需求...',
  };
  return map[mode.value] || '输入你的问题...';
});

function checkMobile() {
  isMobile.value = window.innerWidth < 768;
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}

async function fetchHistoryList() {
  try {
    const data = await apiGet(`/api/career/history?type=${mode.value}&limit=50`);
    historyList.value = data.list || [];
  } catch {
    // 静默处理
  }
}

async function loadHistory(id) {
  try {
    const data = await apiGet(`/api/career/history/${id}`);
    currentHistoryId.value = data._id;
    messages.value = (data.messages || []).map(m => ({
      role: m.role,
      content: m.content
    }));
    // 更新 mode 为历史对话的类型
    if (data.type && ['interview', 'resume', 'career'].includes(data.type)) {
      mode.value = data.type;
    }
    scrollToBottom();
  } catch {
    message.error('加载对话失败');
  }
}

function startNewChat() {
  currentHistoryId.value = null;
  messages.value = [];
}

async function deleteHistoryItem(id) {
  try {
    await apiDelete(`/api/career/history/${id}`);
    historyList.value = historyList.value.filter(h => h._id !== id);
    if (currentHistoryId.value === id) {
      currentHistoryId.value = null;
      messages.value = [];
    }
    message.success('已删除');
  } catch {
    message.error('删除失败');
  }
}

async function handleSend(e) {
  if (e && e.key === 'Enter' && e.shiftKey) return;
  if (!input.value.trim() || loading.value) return;

  const userMessage = input.value.trim();
  input.value = '';
  messages.value.push({ role: 'user', content: userMessage });
  scrollToBottom();

  loading.value = true;
  try {
    const data = await apiPost('/api/career/chat', {
      message: userMessage,
      historyId: currentHistoryId.value,
      type: mode.value
    });

    messages.value.push({ role: 'assistant', content: data.response || '' });
    if (data.historyId) {
      currentHistoryId.value = data.historyId;
    }
    // 刷新历史列表
    fetchHistoryList();
    scrollToBottom();
  } catch (err) {
    message.error(err.message || '请求失败，请稍后重试');
    // 移除失败的用户消息
    messages.value.pop();
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

function sendChip(chip) {
  input.value = chip;
  handleSend();
}

function handleModeChange() {
  startNewChat();
  fetchHistoryList();
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchHistoryList();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.career-page {
  display: flex;
  height: calc(100vh - 64px);
  background: #f5f5f5;
}

/* 左侧历史列表 */
.history-sidebar {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  position: relative;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f5f5f5;
}

.history-item.active {
  background: #e6f4ff;
}

.history-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 40px;
}

.history-item-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.history-item-type {
  color: #667eea;
}

.history-item-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .history-item-delete {
  opacity: 1;
}

.history-empty {
  text-align: center;
  color: #999;
  padding: 32px 16px;
  font-size: 14px;
}

/* 右侧对话面板 */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

/* 欢迎卡片 */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
}

.welcome-card {
  text-align: center;
  margin-bottom: 32px;
}

.welcome-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.welcome-card p {
  font-size: 15px;
  color: #666;
}

.prompt-chips {
  width: 100%;
  max-width: 600px;
}

.chip-group {
  margin-bottom: 20px;
}

.chip-group h4 {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-btn {
  border-radius: 16px;
  font-size: 13px;
  border-color: #667eea;
  color: #667eea;
  transition: all 0.2s;
}

.chip-btn:hover {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

/* 消息气泡 */
.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.user-bubble {
  background: #667eea;
  color: #fff;
  padding: 10px 16px;
  border-radius: 16px 16px 4px 16px;
  max-width: 70%;
  word-break: break-word;
}

.user-bubble p {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.ai-bubble {
  background: #fff;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  max-width: 75%;
  border: 1px solid #e8e8e8;
  word-break: break-word;
}

.ai-bubble p {
  margin: 0;
  line-height: 1.6;
}

.loading-bubble {
  padding: 12px 20px;
}

.dot-typing {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  position: relative;
  animation: dotTyping 1.4s infinite linear;
}

.dot-typing::before,
.dot-typing::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  top: 0;
}

.dot-typing::before {
  left: -12px;
  animation: dotTyping 1.4s infinite linear 0.2s;
}

.dot-typing::after {
  left: 12px;
  animation: dotTyping 1.4s infinite linear 0.4s;
}

@keyframes dotTyping {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

.chat-input {
  flex: 1;
  border-radius: 12px;
}

.send-btn {
  height: 40px;
  border-radius: 12px;
  min-width: 72px;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .career-page {
    height: calc(100vh - 56px);
  }

  .history-sidebar {
    display: none;
  }

  .welcome-card h2 {
    font-size: 20px;
  }

  .prompt-chips {
    max-width: 100%;
  }

  .ai-bubble {
    max-width: 90%;
  }

  .user-bubble {
    max-width: 85%;
  }
}
</style>
