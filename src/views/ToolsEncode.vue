<template>
  <div class="tools-encode">
    <a-card title="编码解码">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="base64" tab="Base64">
          <a-form layout="vertical">
            <a-form-item label="输入文本">
              <a-textarea v-model:value="base64Input" placeholder="请输入文本..." :rows="4" />
            </a-form-item>
            <a-space>
              <a-button type="primary" @click="base64Encode">编码</a-button>
              <a-button @click="base64Decode">解码</a-button>
              <a-button @click="copyResult(base64Result)" :disabled="!base64Result">复制结果</a-button>
            </a-space>
            <a-form-item label="结果" style="margin-top: 16px">
              <a-textarea :value="base64Result" :rows="4" readonly />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="url" tab="URL 编码">
          <a-form layout="vertical">
            <a-form-item label="输入文本">
              <a-textarea v-model:value="urlInput" placeholder="请输入文本..." :rows="4" />
            </a-form-item>
            <a-space>
              <a-button type="primary" @click="urlEncode">编码</a-button>
              <a-button @click="urlDecode">解码</a-button>
              <a-button @click="copyResult(urlResult)" :disabled="!urlResult">复制结果</a-button>
            </a-space>
            <a-form-item label="结果" style="margin-top: 16px">
              <a-textarea :value="urlResult" :rows="4" readonly />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost } from '../utils/api.js';

const activeTab = ref('base64');

const base64Input = ref('');
const base64Result = ref('');
const urlInput = ref('');
const urlResult = ref('');

async function base64Encode() {
  if (!base64Input.value) return message.warning('请输入文本');
  try {
    const data = await apiPost('/api/tools/base64/encode', { text: base64Input.value });
    base64Result.value = data.encoded;
  } catch (err) { message.error(err.message || '编码失败'); }
}

async function base64Decode() {
  if (!base64Input.value) return message.warning('请输入文本');
  try {
    const data = await apiPost('/api/tools/base64/decode', { encoded: base64Input.value });
    base64Result.value = data.decoded;
  } catch (err) { message.error(err.message || '解码失败'); }
}

async function urlEncode() {
  if (!urlInput.value) return message.warning('请输入文本');
  try {
    const data = await apiPost('/api/tools/url/encode', { text: urlInput.value });
    urlResult.value = data.encoded;
  } catch (err) { message.error(err.message || '编码失败'); }
}

async function urlDecode() {
  if (!urlInput.value) return message.warning('请输入文本');
  try {
    const data = await apiPost('/api/tools/url/decode', { encoded: urlInput.value });
    urlResult.value = data.decoded;
  } catch (err) { message.error(err.message || '解码失败'); }
}

async function copyResult(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制');
  } catch { message.error('复制失败'); }
}
</script>

<style scoped>
.tools-encode {
  max-width: 800px;
  margin: 0 auto;
}
</style>
