<template>
  <div class="tools-code">
    <a-button class="back-btn" size="small" @click="$router.replace('/tools')">
      ← 返回工具
    </a-button>
    <a-card title="代码格式化">
      <div class="toolbar">
        <a-select v-model:value="lang" style="width: 200px">
          <a-select-option value="json">JSON</a-select-option>
          <a-select-option value="xml">XML</a-select-option>
          <a-select-option value="html">HTML</a-select-option>
          <a-select-option value="js">JavaScript</a-select-option>
          <a-select-option value="python">Python</a-select-option>
          <a-select-option value="java">Java</a-select-option>
          <a-select-option value="sql">SQL</a-select-option>
        </a-select>
        <a-button @click="handleClear">清空</a-button>
      </div>
      <a-textarea v-model:value="input" placeholder="输入代码" :rows="10" />
      <div class="actions">
        <a-button type="primary" @click="handleFormat" :loading="loading">格式化</a-button>
        <a-button @click="handleCopy" :disabled="!result">复制结果</a-button>
      </div>
      <a-textarea v-model:value="result" placeholder="格式化结果" :rows="10" readonly />
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost } from '../utils/api.js';

const loading = ref(false);
const lang = ref('json');
const input = ref('');
const result = ref('');

const legacyLangs = ['json', 'xml', 'html'];

async function handleFormat() {
  if (!input.value) {
    message.warning('请输入代码');
    return;
  }
  loading.value = true;
  try {
    const isLegacy = legacyLangs.includes(lang.value);
    const url = isLegacy ? `/api/tools/format/${lang.value}` : '/api/tools/format/code';
    const body = isLegacy
      ? { text: input.value }
      : { language: lang.value, text: input.value };
    const data = await apiPost(url, body);
    result.value = data.formatted || '';
  } catch (err) {
    message.error(err.message || '格式化失败');
  } finally {
    loading.value = false;
  }
}

function handleCopy() {
  if (!result.value) return;
  navigator.clipboard.writeText(result.value).then(() => {
    message.success('已复制到剪贴板');
  }).catch(() => {
    message.error('复制失败');
  });
}

function handleClear() {
  input.value = '';
  result.value = '';
}
</script>

<style scoped>
.tools-code {
  width: 100%;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}
</style>
