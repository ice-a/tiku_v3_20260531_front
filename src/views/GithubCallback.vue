<template>
  <div class="callback-container">
    <a-card class="callback-card">
      <div class="callback-status">
        <img class="github-icon" :src="githubIcon" alt="" />
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
        <a-button v-if="failed" type="primary" @click="goLogin">返回登录</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../stores/auth';
import githubIcon from '../assets/github.svg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const title = ref('正在完成 GitHub 登录');
const description = ref('请稍候，正在校验 GitHub 授权信息。');
const failed = ref(false);

function fail(text) {
  title.value = 'GitHub 登录失败';
  description.value = text;
  failed.value = true;
}

function goLogin() {
  router.replace('/login');
}

onMounted(async () => {
  const code = route.query.code;
  const state = route.query.state;
  const savedState = sessionStorage.getItem('githubOAuthState');
  const redirect = sessionStorage.getItem('githubOAuthRedirect') || '/tiku';
  const redirectUri = sessionStorage.getItem('githubOAuthRedirectUri') || `${window.location.origin}/github/callback`;

  if (!code || !state || !savedState || state !== savedState) {
    fail('授权状态校验不通过，请重新发起 GitHub 登录。');
    return;
  }

  try {
    await authStore.loginWithGithubCode(String(code), redirectUri);
    sessionStorage.removeItem('githubOAuthState');
    sessionStorage.removeItem('githubOAuthRedirect');
    sessionStorage.removeItem('githubOAuthRedirectUri');
    message.success('GitHub 登录成功');
    router.replace(redirect);
  } catch (error) {
    fail(error.message || 'GitHub 授权校验失败');
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: #f0f2f5;
}

.callback-card {
  width: min(420px, 100%);
}

.callback-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.callback-status h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.callback-status p {
  margin: 0 0 8px;
  color: #64748b;
  line-height: 1.7;
}

.github-icon {
  width: 52px;
  height: 52px;
}
</style>
