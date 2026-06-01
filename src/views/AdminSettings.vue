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
          <a-divider>邮件服务器配置（SMTP）</a-divider>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12">
              <a-form-item label="SMTP 主机" name="smtpHost">
                <a-input v-model:value="form.smtpHost" placeholder="如：smtp.qq.com" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item label="SMTP 端口" name="smtpPort">
                <a-input v-model:value="form.smtpPort" placeholder="465 或 587" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item label="发信邮箱" name="smtpUser">
                <a-input v-model:value="form.smtpUser" placeholder="noreply@example.com" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item label="发信人名称" name="smtpFrom">
                <a-input v-model:value="form.smtpFrom" placeholder="题库系统" />
              </a-form-item>
            </a-col>
          </a-row>
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
  smtpHost: '',
  smtpPort: '465',
  smtpUser: '',
  smtpFrom: '',
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
    form.smtpHost = settings.smtpHost || '';
    form.smtpPort = settings.smtpPort || '465';
    form.smtpUser = settings.smtpUser || '';
    form.smtpFrom = settings.smtpFrom || '';
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
      smtpHost: form.smtpHost,
      smtpPort: form.smtpPort,
      smtpUser: form.smtpUser,
      smtpFrom: form.smtpFrom,
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
  width: 100%;
}
</style>
