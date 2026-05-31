<template>
  <div class="tools-generator">
    <!-- JWT 编码/解码 -->
    <a-card title="JWT 编码/解码" class="section-card">
      <a-row :gutter="24">
        <a-col :xs="24" :md="12">
          <h4>编码</h4>
          <a-textarea v-model:value="jwtPayload" placeholder='JWT Payload (JSON)，如 {"user":"test"}' :rows="4" />
          <a-input v-model:value="jwtSecret" placeholder="Secret" style="margin-top: 8px" />
          <div class="inline-row" style="margin-top: 8px">
            <a-select v-model:value="jwtExpiresIn" style="width: 120px">
              <a-select-option value="1h">1 小时</a-select-option>
              <a-select-option value="1d">1 天</a-select-option>
              <a-select-option value="7d">7 天</a-select-option>
              <a-select-option value="30d">30 天</a-select-option>
            </a-select>
            <a-button type="primary" @click="handleJwtEncode" :loading="jwtEncoding">编码</a-button>
          </div>
          <div v-if="jwtToken" class="result-box">
            <div class="result-label">Token</div>
            <a-textarea :value="jwtToken" :rows="3" readonly />
            <a-button size="small" @click="copyText(jwtToken)" style="margin-top: 4px">复制</a-button>
          </div>
        </a-col>
        <a-col :xs="24" :md="12">
          <h4>解码</h4>
          <a-textarea v-model:value="jwtTokenInput" placeholder="粘贴 JWT Token" :rows="4" />
          <a-button type="primary" @click="handleJwtDecode" :loading="jwtDecoding" style="margin-top: 8px">解码</a-button>
          <div v-if="jwtDecoded" class="result-box">
            <div class="result-label">Decoded Payload</div>
            <a-textarea :value="JSON.stringify(jwtDecoded, null, 2)" :rows="6" readonly />
            <a-button size="small" @click="copyText(JSON.stringify(jwtDecoded, null, 2))" style="margin-top: 4px">复制</a-button>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 密码生成器 -->
    <a-card title="密码生成器" class="section-card">
      <div class="password-config">
        <div class="inline-row">
          <span>长度：{{ pwdLength }}</span>
          <a-slider v-model:value="pwdLength" :min="8" :max="64" :style="{ width: '300px' }" />
        </div>
        <div class="checkbox-row">
          <a-checkbox v-model:checked="pwdOptions.uppercase">大写字母 A-Z</a-checkbox>
          <a-checkbox v-model:checked="pwdOptions.lowercase">小写字母 a-z</a-checkbox>
          <a-checkbox v-model:checked="pwdOptions.numbers">数字 0-9</a-checkbox>
          <a-checkbox v-model:checked="pwdOptions.symbols">特殊字符</a-checkbox>
        </div>
        <a-button type="primary" @click="handleGeneratePassword" :loading="pwdLoading">生成密码</a-button>
      </div>
      <div v-if="password" class="result-box">
        <div class="password-display">{{ password }}</div>
        <a-button size="small" @click="copyText(password)">复制</a-button>
      </div>
    </a-card>

    <!-- UUID 生成器 -->
    <a-card title="UUID 生成器" class="section-card">
      <div class="inline-row">
        <span>数量：</span>
        <a-input-number v-model:value="uuidCount" :min="1" :max="100" style="width: 100px" />
        <a-button type="primary" @click="handleGenerateUUID" :loading="uuidLoading">生成</a-button>
        <a-button v-if="uuids.length" @click="copyText(uuids.join('\n'))">批量复制</a-button>
      </div>
      <div v-if="uuids.length" class="uuid-list">
        <div v-for="(uuid, i) in uuids" :key="i" class="uuid-item">
          <code>{{ uuid }}</code>
          <a-button size="small" @click="copyText(uuid)">复制</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost } from '../utils/api.js';

// JWT
const jwtPayload = ref('');
const jwtSecret = ref('');
const jwtExpiresIn = ref('1h');
const jwtToken = ref('');
const jwtEncoding = ref(false);
const jwtTokenInput = ref('');
const jwtDecoded = ref(null);
const jwtDecoding = ref(false);

// Password
const pwdLength = ref(16);
const pwdOptions = reactive({ uppercase: true, lowercase: true, numbers: true, symbols: true });
const password = ref('');
const pwdLoading = ref(false);

// UUID
const uuidCount = ref(1);
const uuids = ref([]);
const uuidLoading = ref(false);

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制到剪贴板');
  }).catch(() => {
    message.error('复制失败');
  });
}

async function handleJwtEncode() {
  if (!jwtPayload.value || !jwtSecret.value) {
    message.warning('请填写 payload 和 secret');
    return;
  }
  jwtEncoding.value = true;
  try {
    const data = await apiPost('/api/tools/generate/jwt/encode', {
      payload: jwtPayload.value,
      secret: jwtSecret.value,
      expiresIn: jwtExpiresIn.value,
    });
    jwtToken.value = data.token;
    message.success('编码成功');
  } catch (err) {
    message.error(err.message || '编码失败');
  } finally {
    jwtEncoding.value = false;
  }
}

async function handleJwtDecode() {
  if (!jwtTokenInput.value) {
    message.warning('请粘贴 JWT Token');
    return;
  }
  jwtDecoding.value = true;
  try {
    const data = await apiPost('/api/tools/generate/jwt/decode', { token: jwtTokenInput.value });
    jwtDecoded.value = data.decoded;
  } catch (err) {
    message.error(err.message || '解码失败');
  } finally {
    jwtDecoding.value = false;
  }
}

async function handleGeneratePassword() {
  pwdLoading.value = true;
  try {
    const data = await apiPost('/api/tools/generate/password', { length: pwdLength.value, ...pwdOptions });
    password.value = data.password;
  } catch (err) {
    message.error(err.message || '生成失败');
  } finally {
    pwdLoading.value = false;
  }
}

async function handleGenerateUUID() {
  uuidLoading.value = true;
  try {
    const data = await apiPost('/api/tools/generate/uuid', { count: uuidCount.value });
    uuids.value = data.uuids;
  } catch (err) {
    message.error(err.message || '生成失败');
  } finally {
    uuidLoading.value = false;
  }
}
</script>

<style scoped>
.tools-generator {
  max-width: 1000px;
  margin: 0 auto;
}

.section-card {
  margin-bottom: 24px;
}

.section-card h4 {
  margin-bottom: 12px;
  color: #333;
}

.inline-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.result-box {
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.result-label {
  font-weight: 500;
  margin-bottom: 6px;
  color: #555;
}

.password-display {
  font-family: monospace;
  font-size: 18px;
  padding: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  word-break: break-all;
}

.uuid-list {
  margin-top: 12px;
}

.uuid-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.uuid-item code {
  flex: 1;
  font-size: 14px;
}
</style>
