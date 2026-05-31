<template>
  <a-layout-footer class="app-footer">
    <div class="footer-content">
      <div class="footer-links">
        <a href="/" class="footer-link">首页</a>
        <a-divider type="vertical" />
        <a href="/about" class="footer-link">关于我们</a>
        <a-divider type="vertical" />
        <a href="/contact" class="footer-link">联系我们</a>
        <a-divider type="vertical" />
        <a href="/privacy" class="footer-link">隐私政策</a>
      </div>
      <div class="footer-copyright">
        Copyright &copy; {{ currentYear }} 题库系统 All Rights Reserved.
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: 24px 50px;
  background: #f0f2f5;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  margin-bottom: 12px;
}

.footer-link {
  color: rgba(0, 0, 0, 0.65);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #1890ff;
}

.footer-copyright {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
