<template>
  <div class="user-security">
    <a-card title="修改密码">
      <a-form :model="form" layout="vertical" @finish="handleSubmit">
        <a-form-item label="旧密码" name="oldPassword" :rules="[{ required: true, message: '请输入旧密码' }]">
          <a-input-password v-model:value="form.oldPassword" />
        </a-form-item>
        <a-form-item label="新密码" name="newPassword" :rules="[{ required: true, message: '请输入新密码' }]">
          <a-input-password v-model:value="form.newPassword" />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword" :rules="[{ required: true, message: '请确认新密码' }]">
          <a-input-password v-model:value="form.confirmPassword" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">修改密码</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { apiPut } from '../utils/api.js';

const loading = ref(false);
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

async function handleSubmit() {
  if (form.newPassword !== form.confirmPassword) {
    message.error('两次输入的密码不一致');
    return;
  }
  if (!form.oldPassword || !form.newPassword) {
    message.error('请填写完整信息');
    return;
  }
  loading.value = true;
  try {
    await apiPut('/api/users/password', {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    message.success('密码修改成功');
    form.oldPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  } catch {
    message.error('密码修改失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.user-security {
  max-width: 600px;
  margin: 0 auto;
}
</style>
