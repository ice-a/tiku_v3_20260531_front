<template>
  <div class="user-security">
    <!-- 邮箱绑定 -->
    <a-card title="邮箱绑定" style="margin-bottom: 16px">
      <div v-if="emailVerified" class="email-bound">
        <a-result status="success" title="邮箱已绑定" :sub-title="currentEmail">
          <template #extra>
            <a-button type="primary" danger @click="showChangeEmail = true">更换邮箱</a-button>
          </template>
        </a-result>
      </div>
      <div v-else-if="currentEmail && !emailVerified" class="email-unverified">
        <a-result status="warning" title="邮箱待验证" :sub-title="`验证邮件已发送至 ${currentEmail}`">
          <template #extra>
            <a-space>
              <a-button type="primary" @click="handleResendVerification" :loading="resendLoading">
                重新发送验证邮件
              </a-button>
              <a-button @click="showChangeEmail = true">更换邮箱</a-button>
            </a-space>
          </template>
        </a-result>
        <a-divider />
        <div class="verify-input">
          <p>收到验证邮件后，请粘贴验证码：</p>
          <a-input-search
            v-model:value="verifyToken"
            placeholder="粘贴验证码"
            enter-button="验证"
            :loading="verifyLoading"
            @search="handleVerify"
          />
        </div>
      </div>
      <div v-else class="email-not-bound">
        <a-result status="info" title="未绑定邮箱" sub-title="绑定邮箱后可使用邮箱登录">
          <template #extra>
            <a-button type="primary" @click="showChangeEmail = true">绑定邮箱</a-button>
          </template>
        </a-result>
      </div>

      <!-- 绑定/更换邮箱弹窗 -->
      <a-modal
        v-model:open="showChangeEmail"
        title="绑定邮箱"
        @ok="handleBindEmail"
        :confirm-loading="bindLoading"
        @cancel="bindEmail = ''"
      >
        <a-form layout="vertical">
          <a-form-item label="邮箱地址">
            <a-input v-model:value="bindEmail" placeholder="请输入邮箱地址" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>

    <!-- 修改密码 -->
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
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../stores/auth';
import { apiGet, apiPost, apiPut } from '../utils/api.js';

const authStore = useAuthStore();
const loading = ref(false);
const currentEmail = ref('');
const emailVerified = ref(false);

// Email binding state
const showChangeEmail = ref(false);
const bindEmail = ref('');
const bindLoading = ref(false);
const resendLoading = ref(false);
const verifyToken = ref('');
const verifyLoading = ref(false);

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

async function fetchEmailStatus() {
  try {
    const data = await apiGet('/api/users/profile');
    const user = data.user || data;
    currentEmail.value = user.email || '';
    emailVerified.value = user.emailVerified || false;
  } catch {
    // ignore
  }
}

async function handleBindEmail() {
  if (!bindEmail.value.trim()) {
    message.warning('请输入邮箱地址');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(bindEmail.value)) {
    message.warning('邮箱格式不正确');
    return;
  }
  bindLoading.value = true;
  try {
    await apiPost('/api/users/email/bind', { email: bindEmail.value });
    message.success('验证邮件已发送，请查收');
    showChangeEmail.value = false;
    currentEmail.value = bindEmail.value;
    emailVerified.value = false;
    bindEmail.value = '';
    await fetchEmailStatus();
  } catch (err) {
    message.error(err.message || '发送失败');
  } finally {
    bindLoading.value = false;
  }
}

async function handleResendVerification() {
  resendLoading.value = true;
  try {
    await apiPost('/api/users/email/bind', { email: currentEmail.value });
    message.success('验证邮件已重新发送');
  } catch (err) {
    message.error(err.message || '发送失败');
  } finally {
    resendLoading.value = false;
  }
}

async function handleVerify() {
  if (!verifyToken.value.trim()) {
    message.warning('请输入验证码');
    return;
  }
  verifyLoading.value = true;
  try {
    await apiPost('/api/users/email/verify', { token: verifyToken.value });
    message.success('邮箱验证成功');
    verifyToken.value = '';
    emailVerified.value = true;
    await fetchEmailStatus();
    await authStore.getProfile();
  } catch (err) {
    message.error(err.message || '验证失败');
  } finally {
    verifyLoading.value = false;
  }
}

async function handleSubmit() {
  if (form.newPassword !== form.confirmPassword) {
    message.error('两次输入的密码不一致');
    return;
  }
  if (!form.oldPassword || !form.newPassword) {
    message.error('请填写完整信息');
    return;
  }
  if (form.newPassword.length < 10) {
    message.error('密码至少 10 个字符，需包含大小写字母、数字或特殊字符中的至少 3 种');
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

onMounted(() => {
  fetchEmailStatus();
});
</script>

<style scoped>
.user-security {
  width: 100%;
}

.email-bound :deep(.a-result),
.email-unverified :deep(.a-result),
.email-not-bound :deep(.a-result) {
  padding: 16px 0;
}

.verify-input {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
</style>
