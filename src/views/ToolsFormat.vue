<template>
  <div class="tools-format">
    <a-card title="格式化工具">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="ua" tab="UA 生成">
          <a-button @click="handleGenerateUA" :loading="uaLoading">生成随机 UA</a-button>
          <a-textarea v-model:value="uaResult" readonly :rows="3" style="margin-top: 16px" />
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
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPost } from '../utils/api.js';

const activeTab = ref('ua');
const uaLoading = ref(false);
const uaResult = ref('');
const regexPattern = ref('');
const regexInput = ref('');
const regexLoading = ref(false);
const regexResult = ref(null);

async function handleGenerateUA() {
  uaLoading.value = true;
  try {
    const data = await apiGet('/api/tools/ua/generate');
    uaResult.value = data.ua;
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
</script>

<style scoped>
.tools-format {
  max-width: 800px;
  margin: 0 auto;
}
</style>
