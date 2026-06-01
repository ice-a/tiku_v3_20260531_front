<template>
  <div class="tools-format">
    <a-button class="back-btn" size="small" @click="$router.replace('/tools')">
      ← 返回工具
    </a-button>
    <a-card title="格式化工具">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="ua" tab="UA 生成">
          <div class="ua-config">
            <div class="config-row">
              <span class="config-label">浏览器</span>
              <a-select v-model:value="uaConfig.browser" style="width: 160px" placeholder="随机">
                <a-select-option :value="undefined">随机</a-select-option>
                <a-select-option value="Chrome">Chrome</a-select-option>
                <a-select-option value="Firefox">Firefox</a-select-option>
                <a-select-option value="Safari">Safari</a-select-option>
                <a-select-option value="Edge">Edge</a-select-option>
              </a-select>
            </div>
            <div class="config-row">
              <span class="config-label">操作系统</span>
              <a-select v-model:value="uaConfig.os" style="width: 160px" placeholder="随机">
                <a-select-option :value="undefined">随机</a-select-option>
                <a-select-option value="Windows">Windows</a-select-option>
                <a-select-option value="macOS">macOS</a-select-option>
                <a-select-option value="Linux">Linux</a-select-option>
                <a-select-option value="Android">Android</a-select-option>
                <a-select-option value="iOS">iOS</a-select-option>
              </a-select>
            </div>
            <div class="config-row">
              <span class="config-label">设备类型</span>
              <a-select v-model:value="uaConfig.device" style="width: 160px" placeholder="随机">
                <a-select-option :value="undefined">随机</a-select-option>
                <a-select-option value="Desktop">桌面端</a-select-option>
                <a-select-option value="Mobile">移动端</a-select-option>
                <a-select-option value="Tablet">平板</a-select-option>
              </a-select>
            </div>
            <div class="config-row">
              <span class="config-label">数量</span>
              <a-input-number v-model:value="uaConfig.count" :min="1" :max="10" style="width: 100px" />
            </div>
            <a-button type="primary" @click="handleGenerateUA" :loading="uaLoading" class="generate-btn">
              生成 UA
            </a-button>
          </div>
          <div v-if="uaResults.length" class="ua-results">
            <div v-for="(ua, i) in uaResults" :key="i" class="ua-result-item">
              <code>{{ ua }}</code>
              <a-button type="link" size="small" @click="copyText(ua)">复制</a-button>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="regex" tab="正则测试">
          <a-input v-model:value="regexPattern" placeholder="正则表达式" style="margin-bottom: 16px" />
          <a-input v-model:value="regexInput" placeholder="测试字符串" style="margin-bottom: 16px" />
          <a-button type="primary" @click="handleTestRegex" :loading="regexLoading">测试</a-button>
          <div v-if="regexResult" style="margin-top: 16px">
            <a-tag :color="regexResult.isMatch ? 'green' : 'red'">
              {{ regexResult.isMatch ? '匹配' : '不匹配' }}
            </a-tag>
            <div v-if="regexResult.matches?.length">
              匹配结果：{{ regexResult.matches.join(', ') }}
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPost } from '../utils/api.js';

const activeTab = ref('ua');
const uaLoading = ref(false);
const uaResults = ref([]);
const regexPattern = ref('');
const regexInput = ref('');
const regexLoading = ref(false);
const regexResult = ref(null);

const uaConfig = reactive({
  browser: undefined,
  os: undefined,
  device: undefined,
  count: 1,
});

async function handleGenerateUA() {
  uaLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (uaConfig.browser) params.set('browser', uaConfig.browser);
    if (uaConfig.os) params.set('os', uaConfig.os);
    if (uaConfig.device) params.set('device', uaConfig.device);
    params.set('count', uaConfig.count);
    const data = await apiGet(`/api/tools/ua/generate?${params.toString()}`);
    uaResults.value = Array.isArray(data.ua) ? data.ua : [data.ua];
  } catch (err) {
    message.error(err.message || '生成失败');
  } finally {
    uaLoading.value = false;
  }
}

async function handleTestRegex() {
  if (!regexPattern.value || !regexInput.value) {
    message.warning('请输入正则表达式和测试字符串');
    return;
  }
  regexLoading.value = true;
  try {
    const data = await apiPost('/api/tools/regex/test', { pattern: regexPattern.value, testString: regexInput.value });
    regexResult.value = data;
  } catch (err) {
    message.error(err.message || '测试失败');
  } finally {
    regexLoading.value = false;
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制');
  }).catch(() => {
    message.error('复制失败');
  });
}
</script>

<style scoped>
.tools-format {
  width: 100%;
}

.back-btn {
  margin-bottom: 12px;
}

.ua-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-label {
  font-size: 14px;
  color: #333;
  min-width: 70px;
  text-align: right;
}

.generate-btn {
  align-self: flex-start;
}

.ua-results {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ua-result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.ua-result-item code {
  flex: 1;
  font-size: 13px;
  color: #334155;
  word-break: break-all;
}
</style>
