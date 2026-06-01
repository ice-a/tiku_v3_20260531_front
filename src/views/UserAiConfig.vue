<template>
  <div class="user-ai-config">
    <a-card title="AI 配置">
      <a-form :model="form" layout="vertical" @finish="handleSubmit">
        <a-form-item label="启用 AI">
          <a-switch v-model:checked="form.enabled" />
        </a-form-item>
        <a-form-item label="Base URL" name="baseUrl">
          <a-input v-model:value="form.baseUrl" placeholder="https://api.openai.com/v1" />
        </a-form-item>
        <a-form-item label="API Key" name="apiKey">
          <a-input-password v-model:value="form.apiKey" placeholder="sk-..." />
        </a-form-item>
        <a-form-item label="模型" name="model">
          <a-space>
            <a-select
              v-model:value="form.model"
              placeholder="选择模型"
              style="width: 320px"
              :disabled="models.length === 0"
              show-search
              :options="models.map(m => ({ label: m.id, value: m.id }))"
            />
            <a-button
              @click="fetchModels"
              :loading="modelsLoading"
              :disabled="!form.baseUrl || !form.apiKey"
            >
              获取模型
            </a-button>
          </a-space>
          <div v-if="models.length > 0" style="margin-top: 4px">
            <a-tag color="green">已获取 {{ models.length }} 个模型</a-tag>
          </div>
          <div v-else style="margin-top: 4px; color: #999; font-size: 12px">
            请先填写 Base URL 和 API Key，再点击获取模型
          </div>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">保存配置</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPost, apiPut } from '../utils/api.js';

const loading = ref(false);
const modelsLoading = ref(false);
const models = ref([]);
const form = reactive({
  enabled: false,
  baseUrl: '',
  apiKey: '',
  model: undefined,
});

async function fetchAiConfig() {
  loading.value = true;
  try {
    const data = await apiGet('/api/users/ai-config');
    const aiConfig = data.aiConfig || {};
    form.enabled = aiConfig.enabled ?? false;
    form.baseUrl = aiConfig.baseUrl || '';
    form.apiKey = '';
    form.model = aiConfig.model || undefined;
  } catch (err) {
    message.error(err.message || '获取 AI 配置失败');
  } finally {
    loading.value = false;
  }
}

async function fetchModels() {
  if (!form.baseUrl || !form.apiKey) {
    message.warning('请先填写 Base URL 和 API Key');
    return;
  }
  modelsLoading.value = true;
  try {
    const data = await apiPost('/api/users/ai-config/models', {
      baseUrl: form.baseUrl,
      apiKey: form.apiKey,
    });
    models.value = data.models || [];
    message.success(`已获取 ${models.value.length} 个模型`);
  } catch (err) {
    message.error(err.message || '获取模型列表失败');
  } finally {
    modelsLoading.value = false;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    await apiPut('/api/users/ai-config', {
      enabled: form.enabled,
      baseUrl: form.baseUrl,
      ...(form.apiKey ? { apiKey: form.apiKey } : {}),
      model: form.model,
    });
    message.success('保存成功');
  } catch (err) {
    message.error(err.message || '保存失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchAiConfig();
});
</script>

<style scoped>
.user-ai-config {
  width: 100%;
}
</style>
