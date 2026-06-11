<template>
  <div class="donate-wall" v-if="wall.length > 0">
    <h3 class="wall-title">打赏记录</h3>
    <div class="wall-list">
      <div v-for="item in wall" :key="item._id" class="wall-item">
        <div class="wall-avatar">{{ item.username.charAt(0) }}</div>
        <div class="wall-info">
          <span class="wall-name">{{ item.username }}</span>
          <span class="wall-amount">打赏了 ¥{{ item.amount }}</span>
        </div>
        <div v-if="item.message" class="wall-msg">{{ item.message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiGet } from '../utils/api.js';

const wall = ref([]);

async function loadWall() {
  try {
    const data = await apiGet('/api/donations/wall?limit=10');
    wall.value = data.wall || [];
  } catch {}
}

onMounted(loadWall);
</script>

<style scoped>
.donate-wall { margin-top: 16px; }
.wall-title { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 12px; }
.wall-list { display: flex; flex-direction: column; gap: 8px; }
.wall-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  background: #f8fafc; border-radius: 8px;
}
.wall-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; flex-shrink: 0;
}
.wall-info { flex: 1; }
.wall-name { font-size: 13px; font-weight: 500; color: #334155; }
.wall-amount { font-size: 12px; color: #ef4444; margin-left: 6px; }
.wall-msg { font-size: 12px; color: #64748b; margin-top: 2px; }
</style>
