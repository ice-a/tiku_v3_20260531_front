<template>
  <div class="tools-text">
    <a-card title="文本处理">
      <a-textarea v-model:value="input" placeholder="输入文本" :rows="6" />
      <a-space style="margin-top: 16px">
        <a-button @click="handleFormat('uppercase')">转大写</a-button>
        <a-button @click="handleFormat('lowercase')">转小写</a-button>
        <a-button @click="handleFormat('capitalize')">首字母大写</a-button>
        <a-button @click="handleFormat('trim')">去除空格</a-button>
        <a-button @click="handleFormat('reverse')">反转</a-button>
      </a-space>
      <a-textarea v-model:value="result" placeholder="处理结果" :rows="6" style="margin-top: 16px" />
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost } from '../utils/api.js';

const input = ref('');
const result = ref('');

async function handleFormat(type) {
  if (!input.value) {
    message.warning('请输入文本');
    return;
  }
  try {
    const data = await apiPost('/api/tools/text/format', { text: input.value, type });
    result.value = data.result;
  } catch (err) {
    message.error(err.message || '处理失败');
  }
}
</script>

<style scoped>
.tools-text {
  max-width: 800px;
  margin: 0 auto;
}
</style>
