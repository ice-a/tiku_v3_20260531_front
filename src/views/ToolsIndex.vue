<template>
  <div class="tools-index">
    <div class="tools-header">
      <h2>在线工具</h2>
    </div>

    <div class="card-grid-wrapper">
      <div class="card-grid">
        <div
          v-for="tool in tools"
          :key="tool.path"
          class="card-cell"
          @click="$router.push(tool.path)"
        >
          <div class="card-block" :style="{ background: tool.gradient }">
            <span class="card-icon">{{ tool.icon }}</span>
          </div>
          <div class="card-info">
            <div class="card-title">{{ tool.title }}</div>
            <div class="card-desc">{{ tool.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { generateGradient } from '../utils/blockIcon.js';

const toolsRaw = [
  { path: '/tools/image', icon: ' ', title: '图片处理', desc: '格式转换、图片转 ICO' },
  { path: '/tools/encode', icon: ' ', title: '编码解码', desc: 'Base64、URL 编码解码' },
  { path: '/tools/text', icon: ' ', title: '文本处理', desc: '大小写、去空格、反转' },
  { path: '/tools/code', icon: ' ', title: '代码格式化', desc: 'JSON、XML、HTML 格式化' },
  { path: '/tools/crypto', icon: ' ', title: '哈希工具', desc: 'MD5、SHA256 哈希生成' },
  { path: '/tools/format', icon: ' ', title: '格式工具', desc: 'UA 生成、正则测试' },
  { path: '/tools/time', icon: '⏱️', title: '时间工具', desc: '时间戳转换、农历' },
  { path: '/tools/generator', icon: ' ', title: '生成工具', desc: 'JWT、密码、UUID 生成' },
];

const tools = toolsRaw.map(t => ({
  ...t,
  gradient: generateGradient(t.path),
}));

onMounted(() => {
  // no-op
});
</script>

<style scoped>
.tools-index {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tools-header {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.tools-header h2 {
  margin: 0;
  color: #1a1a2e;
  font-size: 20px;
}

.card-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.card-cell {
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.card-cell:hover {
  transform: scale(1.06) translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.card-cell:hover .card-icon {
  transform: scale(1.25) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
}

.card-block {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
}

.card-icon {
  font-size: 40px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.3s ease;
  user-select: none;
}

.card-info {
  padding: 12px 14px;
  text-align: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: #94a3b8;
}
</style>
