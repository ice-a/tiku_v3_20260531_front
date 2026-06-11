<template>
  <div class="login-container">
    <a-card class="login-card" title="登录">
      <a-form
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleLogin"
      >
        <a-form-item label="邮箱" name="email">
          <a-input
            v-model:value="formState.email"
            placeholder="请输入邮箱"
            size="large"
          >
            <template #prefix>
              <MailOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>

        <a-divider class="login-divider">其他方式登录</a-divider>

        <a-button
          class="github-login-btn"
          size="large"
          block
          @click="handleGithubLogin"
        >
          <img class="github-icon" :src="githubIcon" alt="" />
          GitHub 登录
        </a-button>

        <p v-if="!canUseGithubLogin" class="oauth-config-tip">
          GitHub 登录未配置，请设置 VITE_GITHUB_CLIENT_ID。
        </p>

        <div class="login-footer">
          <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
        </div>

        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '../stores/auth';
import githubIcon from '../assets/github.svg';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);

const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const githubRedirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/github/callback`;
const githubScope = import.meta.env.VITE_GITHUB_SCOPE || 'read:user user:email';
const canUseGithubLogin = computed(() => Boolean(githubClientId && githubRedirectUri));

const formState = reactive({
  email: '',
  password: '',
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 10, message: '密码至少 10 个字符' },
  ],
};

async function handleLogin() {
  loading.value = true;
  try {
    await authStore.login(formState.email, formState.password);
    message.success('登录成功');
    const redirect = route.query.redirect || '/tiku';
    router.push(redirect);
  } catch (error) {
    message.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
}

function handleGithubLogin() {
  if (!canUseGithubLogin.value) {
    message.warning('GitHub 登录参数未配置');
    return;
  }

  const state = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  sessionStorage.setItem('githubOAuthState', state);
  const redirect = route.query.redirect || '/tiku';
  sessionStorage.setItem('githubOAuthRedirect', String(redirect));
  sessionStorage.setItem('githubOAuthRedirectUri', githubRedirectUri);

  const params = new URLSearchParams({
    client_id: githubClientId,
    redirect_uri: githubRedirectUri,
    scope: githubScope,
    state,
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}

.login-card {
  width: 400px;
}

.login-divider {
  margin: 6px 0 18px;
  color: #94a3b8;
  font-size: 13px;
}

.github-login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-color: #d1d5db;
  color: #0f172a;
  background: #ffffff;
}

.github-login-btn:hover {
  border-color: #0f172a;
  color: #0f172a;
  background: #f8fafc;
}

.github-icon {
  width: 22px;
  height: 22px;
}

.oauth-config-tip {
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
}

.forgot-link {
  color: #64748b;
  font-size: 14px;
}

.forgot-link:hover {
  color: #6366f1;
}
</style>
