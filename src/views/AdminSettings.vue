<template>
  <div class="admin-settings">
    <a-card title="系统设置">
      <a-spin :spinning="pageLoading">
        <a-form :model="form" layout="vertical" @finish="handleSubmit">
          <a-form-item label="站点名称" name="siteName">
            <a-input v-model:value="form.siteName" placeholder="请输入站点名称" />
          </a-form-item>
          <a-form-item label="站点描述" name="siteDescription">
            <a-textarea v-model:value="form.siteDescription" :rows="3" placeholder="请输入站点描述" />
          </a-form-item>
          <a-form-item label="开放注册">
            <a-switch v-model:checked="form.registrationEnabled" />
          </a-form-item>
          <a-form-item label="邮箱验证">
            <a-switch v-model:checked="form.emailVerificationEnabled" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPut } from '../utils/api.js';

const pageLoading = ref(false);
const loading = ref(false);

const form = reactive({
  siteName: '',
  siteDescription: '',
  registrationEnabled: true,
  emailVerificationEnabled: false,
});

async function fetchSettings() {
  pageLoading.value = true;
  try {
    const data = await apiGet('/api/admin/settings');
    const settings = data.settings || {};
    form.siteName = settings.siteName || '';
    form.siteDescription = settings.siteDescription || '';
    form.registrationEnabled = settings.registrationEnabled ?? true;
    form.emailVerificationEnabled = settings.emailVerificationEnabled ?? false;
  } catch {
    message.error('获取系统设置失败');
  } finally {
    pageLoading.value = false;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    await apiPut('/api/admin/settings', {
      siteName: form.siteName,
      siteDescription: form.siteDescription,
      registrationEnabled: form.registrationEnabled,
      emailVerificationEnabled: form.emailVerificationEnabled,
    });
    message.success('设置保存成功');
  } catch {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.admin-settings {
  max-width: 600px;
  margin: 0 auto;
}
</style>
