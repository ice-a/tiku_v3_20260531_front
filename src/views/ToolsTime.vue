<template>
  <div class="tools-time">
    <a-button class="back-btn" size="small" @click="$router.replace('/tools')">
      ← 返回工具
    </a-button>
    <a-row :gutter="[16, 16]">
      <!-- 时间戳转换卡片 -->
      <a-col :xs="24" :lg="12">
        <a-card title="时间戳转换" class="time-card">
          <a-form layout="vertical">
            <a-form-item label="输入（时间戳或日期字符串）">
              <a-input v-model:value="convertInput" placeholder="例: 1700000000 或 2024-01-01 12:00:00" />
            </a-form-item>
            <a-space>
              <a-button type="primary" @click="toTimestamp">日期 → 时间戳</a-button>
              <a-button @click="toDate">时间戳 → 日期</a-button>
            </a-space>
            <a-descriptions v-if="convertResult" bordered size="small" style="margin-top: 16px" :column="1">
              <a-descriptions-item label="秒级时间戳">
                {{ convertResult.timestamp }}
                <a-button type="link" size="small" @click="copyResult(String(convertResult.timestamp))">复制</a-button>
              </a-descriptions-item>
              <a-descriptions-item label="毫秒级时间戳">
                {{ convertResult.timestampMs }}
                <a-button type="link" size="small" @click="copyResult(String(convertResult.timestampMs))">复制</a-button>
              </a-descriptions-item>
              <a-descriptions-item label="本地时间">
                {{ convertResult.date }}
                <a-button type="link" size="small" @click="copyResult(convertResult.date)">复制</a-button>
              </a-descriptions-item>
              <a-descriptions-item label="ISO 格式">
                {{ convertResult.iso }}
                <a-button type="link" size="small" @click="copyResult(convertResult.iso)">复制</a-button>
              </a-descriptions-item>
            </a-descriptions>
          </a-form>
        </a-card>
      </a-col>

      <!-- 实时时间戳卡片 -->
      <a-col :xs="24" :lg="6">
        <a-card title="实时时间戳" class="time-card">
          <div class="realtime-section">
            <div class="timestamp-display">
              <div class="ts-label">秒级时间戳</div>
              <div class="ts-value">{{ currentTimestamp }}</div>
              <a-button type="link" size="small" @click="copyResult(String(currentTimestamp))">复制</a-button>
            </div>
            <div class="timestamp-display">
              <div class="ts-label">毫秒级时间戳</div>
              <div class="ts-value">{{ currentTimestampMs }}</div>
              <a-button type="link" size="small" @click="copyResult(String(currentTimestampMs))">复制</a-button>
            </div>
            <div class="timestamp-display">
              <div class="ts-label">当前时间</div>
              <div class="ts-value ts-value--time">{{ currentTime }}</div>
              <a-button type="link" size="small" @click="copyResult(currentTime)">复制</a-button>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 农历信息卡片 -->
      <a-col :xs="24" :lg="6">
        <a-card title="农历信息" class="time-card">
          <div class="lunar-section">
            <div class="lunar-date">{{ lunarInfo.date }}</div>
            <a-divider style="margin: 12px 0" />
            <div class="lunar-detail">{{ lunarInfo.detail }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost } from '../utils/api.js';

const convertInput = ref('');
const convertResult = ref(null);

const currentTimestamp = ref(Math.floor(Date.now() / 1000));
const currentTimestampMs = ref(Date.now());
const currentTime = ref('');

const lunarInfo = ref({ date: '', detail: '' });

let timer = null;

function updateRealtime() {
  const now = new Date();
  currentTimestamp.value = Math.floor(now.getTime() / 1000);
  currentTimestampMs.value = now.getTime();
  currentTime.value = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

// Simple lunar calendar calculation (approximate)
function calculateLunar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];

  // Heavenly Stems and Earthly Branches
  const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const shengXiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;

  lunarInfo.value = {
    date: `${year}年${month}月${day}日 星期${weekDay}`,
    detail: `${tianGan[ganIndex]}${diZhi[zhiIndex]}年 生肖${shengXiao[zhiIndex]}`
  };
}

async function toTimestamp() {
  if (!convertInput.value) return message.warning('请输入日期字符串');
  try {
    const data = await apiPost('/api/tools/timestamp/convert', { input: convertInput.value, direction: 'toTimestamp' });
    convertResult.value = data;
  } catch (err) {
    message.error(err.message || '转换失败');
  }
}

async function toDate() {
  if (!convertInput.value) return message.warning('请输入时间戳');
  try {
    const data = await apiPost('/api/tools/timestamp/convert', { input: convertInput.value, direction: 'toDate' });
    convertResult.value = data;
  } catch (err) {
    message.error(err.message || '转换失败');
  }
}

async function copyResult(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制');
  } catch { message.error('复制失败'); }
}

onMounted(() => {
  updateRealtime();
  calculateLunar();
  timer = setInterval(updateRealtime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.tools-time {
  width: 100%;
}

.time-card {
  border-radius: var(--card-radius, 12px);
  height: 100%;
}

.time-card :deep(.ant-card-head) {
  border-bottom: 2px solid var(--primary-color, #667eea);
}

.time-card :deep(.ant-card-head-title) {
  font-weight: bold;
}

.time-card :deep(.ant-card-body) {
  padding: 20px;
}

.realtime-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timestamp-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ts-label {
  font-size: 13px;
  color: #666;
  min-width: 80px;
}

.ts-value {
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: var(--primary-color, #667eea);
  flex: 1;
  word-break: break-all;
}

.ts-value--time {
  font-size: 14px;
}

.lunar-section {
  text-align: center;
  padding: 16px 0;
}

.lunar-date {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.lunar-detail {
  font-size: 16px;
  color: var(--primary-color, #667eea);
  font-weight: 500;
}

@media (max-width: 768px) {
  .timestamp-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .ts-value {
    font-size: 16px;
  }
}
</style>
