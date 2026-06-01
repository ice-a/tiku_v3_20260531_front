<template>
  <div class="tools-crypto">
    <a-button class="back-btn" size="small" @click="$router.replace('/tools')">
      ← 返回工具
    </a-button>
    <a-card title="加密解密">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="hash" tab="哈希生成">
          <a-textarea v-model:value="hashInput" placeholder="输入文本" :rows="4" />
          <a-space style="margin-top: 16px">
            <a-button @click="handleHash('md5')">MD5</a-button>
            <a-button @click="handleHash('sha1')">SHA1</a-button>
            <a-button @click="handleHash('sha256')">SHA256</a-button>
          </a-space>
          <a-input v-model:value="hashResult" readonly style="margin-top: 16px" />
        </a-tab-pane>
        <a-tab-pane key="base64" tab="Base64">
          <a-textarea v-model:value="base64Input" placeholder="输入文本" :rows="4" />
          <a-space style="margin-top: 16px">
            <a-button @click="handleBase64('encode')">编码</a-button>
            <a-button @click="handleBase64('decode')">解码</a-button>
          </a-space>
          <a-textarea v-model:value="base64Result" placeholder="结果" :rows="4" style="margin-top: 16px" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost } from '../utils/api.js';

const activeTab = ref('hash');
const hashInput = ref('');
const hashResult = ref('');
const base64Input = ref('');
const base64Result = ref('');

async function handleHash(algo) {
  if (!hashInput.value) {
    message.warning('请输入文本');
    return;
  }
  try {
    const data = await apiPost('/api/tools/hash/generate', { text: hashInput.value, algorithm: algo });
    hashResult.value = data.hash;
  } catch (err) {
    message.error(err.message || '生成失败');
  }
}

async function handleBase64(action) {
  if (!base64Input.value) {
    message.warning('请输入文本');
    return;
  }
  try {
    const endpoint = action === 'encode' ? '/api/tools/base64/encode' : '/api/tools/base64/decode';
    const body = action === 'encode' ? { text: base64Input.value } : { encoded: base64Input.value };
    const data = await apiPost(endpoint, body);
    base64Result.value = action === 'encode' ? data.encoded || '' : data.decoded || '';
  } catch (err) {
    message.error(err.message || '操作失败');
  }
}
</script>

<style scoped>
.tools-crypto {
  width: 100%;
}
</style>
