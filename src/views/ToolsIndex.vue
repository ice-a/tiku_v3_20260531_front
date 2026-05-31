<template>
  <div class="tools-index">
    <h2>在线工具</h2>
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :lg="8" v-for="tool in tools" :key="tool.path">
        <a-card hoverable class="tool-card" @click="$router.push(tool.path)">
          <div class="tool-icon">{{ tool.icon }}</div>
          <div class="tool-title">{{ tool.title }}</div>
          <div class="tool-desc">{{ tool.desc }}</div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
const tools = [
  { path: '/tools/image', icon: ' ', title: '图片处理', desc: '格式转换、图片转 ICO' },
  { path: '/tools/encode', icon: ' ', title: '编码解码', desc: 'Base64、URL 编码解码' },
  { path: '/tools/text', icon: ' ', title: '文本处理', desc: '大小写、去空格、反转' },
  { path: '/tools/code', icon: ' ', title: '代码格式化', desc: 'JSON、XML、HTML 格式化' },
  { path: '/tools/crypto', icon: ' ', title: '哈希工具', desc: 'MD5、SHA256 哈希生成' },
  { path: '/tools/format', icon: ' ', title: '格式工具', desc: 'UA 生成、正则测试' },
  { path: '/tools/time', icon: '⏱️', title: '时间工具', desc: '时间戳转换、农历' },
  { path: '/tools/generator', icon: ' ', title: '生成工具', desc: 'JWT、密码、UUID 生成' },
];
</script>

<style scoped>
.tools-index {
  max-width: 1000px;
  margin: 0 auto;
}

.tools-index h2 {
  margin-bottom: 24px;
  color: #333;
}

.tool-card {
  text-align: center;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tool-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.tool-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.tool-desc {
  font-size: 14px;
  color: #666;
}
</style>
