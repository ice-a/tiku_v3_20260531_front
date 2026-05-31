<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">忘记密码</h2>
      <p class="auth-desc">输入注册邮箱，我们将发送重置密码链接</p>

      <form v-if="!sent" class="auth-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label class="label">邮箱地址</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="请输入注册邮箱"
            required
          />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '发送中...' : '发送重置邮件' }}
        </button>
      </form>

      <div v-else class="success-box">
        <div class="success-icon">✓</div>
        <p class="success-text">重置密码邮件已发送至 <strong>{{ email }}</strong></p>
        <p class="success-hint">请查收邮件并点击链接重置密码（30分钟内有效）</p>
        <button class="btn-submit" @click="sent = false; email = ''">重新发送</button>
      </div>

      <div class="auth-footer">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const loading = ref(false);
const sent = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || '发送失败');
    sent.value = true;
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
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
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

.success-text { margin: 0 0 8px; color: #334155; font-size: 15px; }
.success-hint { margin: 0 0 24px; color: #94a3b8; font-size: 13px; }

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.auth-footer a { color: #6366f1; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
</style>
