import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || '');
  const refreshToken = ref(localStorage.getItem('refreshToken') || '');

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || '登录失败');
    }

    const payload = json.data || json;
    token.value = payload.accessToken;
    refreshToken.value = payload.refreshToken || '';
    user.value = payload.user || null;

    localStorage.setItem('token', payload.accessToken);
    if (payload.refreshToken) {
      localStorage.setItem('refreshToken', payload.refreshToken);
    }

    return payload;
  }

  async function loginWithGithubCode(code, redirectUri) {
    const res = await fetch('/api/auth/github/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || json.message || 'GitHub 登录失败');
    }

    const payload = json.data || json;
    token.value = payload.accessToken;
    refreshToken.value = payload.refreshToken || '';
    user.value = payload.user || null;

    localStorage.setItem('token', payload.accessToken);
    if (payload.refreshToken) {
      localStorage.setItem('refreshToken', payload.refreshToken);
    }

    return payload;
  }

  async function register(username, email, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || '注册失败');
    }

    const payload = json.data || json;
    token.value = payload.accessToken;
    refreshToken.value = payload.refreshToken || '';
    user.value = payload.user || null;

    localStorage.setItem('token', payload.accessToken);
    if (payload.refreshToken) {
      localStorage.setItem('refreshToken', payload.refreshToken);
    }

    return payload;
  }

  async function logout() {
    token.value = '';
    refreshToken.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) return false;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshToken.value }),
    });

    if (!res.ok) {
      await logout();
      return false;
    }

    const json = await res.json();
    const payload = json.data || json;
    token.value = payload.accessToken;
    localStorage.setItem('token', payload.accessToken);
    if (payload.refreshToken) {
      refreshToken.value = payload.refreshToken;
      localStorage.setItem('refreshToken', payload.refreshToken);
    }

    return true;
  }

  async function getProfile() {
    if (!token.value) return null;

    const res = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) return null;
        return getProfile();
      }
      return null;
    }

    const json = await res.json();
    const payload = json.data || json;
    user.value = payload.user || payload;
    return user.value;
  }

  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    loginWithGithubCode,
    register,
    logout,
    refreshAccessToken,
    getProfile,
    setToken,
  };
});
