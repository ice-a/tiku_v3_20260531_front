<template>
  <div class="user-notifications">
    <a-card title="消息通知设置">
      <a-form layout="vertical">
        <a-form-item label="邮件通知">
          <a-switch v-model:checked="preferences.email" />
        </a-form-item>
        <a-form-item label="飞书通知">
          <a-switch v-model:checked="preferences.feishu" />
        </a-form-item>
        <a-form-item label="微信通知">
          <a-switch v-model:checked="preferences.wechat" />
        </a-form-item>
        <a-form-item label="Bark 通知">
          <a-switch v-model:checked="preferences.bark" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSave" :loading="loading">保存设置</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPut } from '../utils/api.js';

const loading = ref(false);
const preferences = reactive({
  email: false,
  feishu: false,
  wechat: false,
  bark: false,
});

async function fetchNotifications() {
  loading.value = true;
  try {
    const data = await apiGet('/api/users/notifications');
    const notifications = data.notifications || {};
    preferences.email = notifications.email ?? false;
    preferences.feishu = notifications.feishu ?? false;
    preferences.wechat = notifications.wechat ?? false;
    preferences.bark = notifications.bark ?? false;
  } catch {
    message.error('获取通知设置失败');
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  loading.value = true;
  try {
    await apiPut('/api/users/profile', { notificationPreferences: { ...preferences } });
    message.success('保存成功');
  } catch {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.user-notifications {
  width: 100%;
}
</style>
