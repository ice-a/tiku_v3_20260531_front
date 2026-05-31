<template>
  <div class="auth-container">
    <div class="auth-card">
      <template v-if="!token">
        <h2 class="auth-title">链接无效</h2>
        <p class="auth-desc">缺少重置令牌，请从邮件中点击链接打开此页面</p>
        <router-link to="/forgot-password" class="btn-submit" style="text-align:center;text-decoration:none;">重新申请</router-link>
      </template>

      <template v-else-if="done">
        <h2 class="auth-title">密码重置成功</h2>
        <div class="success-box">
          <div class="success-icon">✓</div>
          <p class="success-text">你的密码已更新</p>
          <router-link to="/login" class="btn-submit" style="text-align:center;text-decoration:none;">前往登录</router-link>
        </div>
      </template>

      <template v-else>
        <h2 class="auth-title">设置新密码</h2>
        <p class="auth-desc">请输入新密码</p>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label class="label">新密码</label>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="至少 6 个字符"
              minlength="6"
              required
            />
          </div>
          <div class="field">
            <label class="label">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="input"
              placeholder="再次输入密码"
              required
            />
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? '提交中...' : '重置密码' }}
          </button>
        </form>
      </template>

      <div class="auth-footer">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const token = computed(() => route.query.token || '');

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const done = ref(false);

async function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致');
    return;
  }
  if (password.value.length < 6) {
    alert('密码至少 6 个字符');
    return;
  }

  loading.value = true;
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, password: password.value }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || '重置失败');
    done.value = true;
  } catch (err) {
    alert(err.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.auth-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.auth-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}

.auth-desc {
  margin: 0 0 28px;
  font-size: 14px;
  color: #64748b;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field { display: flex; flex-direction: column; gap: 6px; }

.label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.input {
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus { border-color: #6366f1; }

.btn-submit {
  display: block;
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  box-sizing: border-box;
}

.btn-submit:hover { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.success-box {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: #ecfdf5;
  color: #10b981;
  font-size: 24px;
  font-weight: 700;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-text { margin: 0 0 24px; color: #334155; font-size: 15px; }

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.auth-footer a { color: #6366f1; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
</style>
