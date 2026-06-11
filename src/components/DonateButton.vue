<template>
  <div class="donate-section">
    <a-button type="primary" danger @click="showModal = true">
       打赏作者
    </a-button>
    <a-modal v-model:open="showModal" title="打赏支持" :footer="null" width="420px">
      <div class="donate-body">
        <p class="donate-desc">如果觉得有帮助，可以请作者喝杯咖啡 ☕</p>
        <div class="amount-grid">
          <button
            v-for="amt in amounts"
            :key="amt"
            :class="['amount-btn', { active: selected === amt }]"
            @click="selected = amt"
          >
            ¥{{ amt }}
          </button>
        </div>
        <a-input-number
          v-model:value="customAmount"
          :min="1"
          :max="9999"
          placeholder="自定义金额"
          style="width: 100%; margin-top: 12px"
          @change="selected = 0"
        />
        <a-textarea
          v-model:value="msg"
          placeholder="留个言（可选）"
          :rows="2"
          style="margin-top: 12px"
          :maxlength="200"
        />
        <a-checkbox v-model:checked="anonymous" style="margin-top: 8px">匿名打赏</a-checkbox>
        <a-button
          type="primary"
          block
          style="margin-top: 16px"
          :loading="loading"
          @click="handleDonate"
        >
          确认打赏 ¥{{ finalAmount }}
        </a-button>
        <div v-if="stats.totalCount > 0" class="donate-stats">
          已有 {{ stats.totalCount }} 人打赏，累计 ¥{{ stats.totalAmount }}
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiPost, apiGet } from '../utils/api.js';

const showModal = ref(false);
const loading = ref(false);
const amounts = [5, 10, 20, 50];
const selected = ref(10);
const customAmount = ref(null);
const msg = ref('');
const anonymous = ref(false);
const stats = ref({ totalAmount: 0, monthAmount: 0, totalCount: 0 });

const finalAmount = computed(() => {
  if (customAmount.value) return customAmount.value;
  return selected.value || 10;
});

async function handleDonate() {
  if (finalAmount.value < 1) {
    message.warning('金额至少 1 元');
    return;
  }
  loading.value = true;
  try {
    await apiPost('/api/donations', {
      amount: finalAmount.value,
      message: msg.value,
      anonymous: anonymous.value,
    });
    message.success('感谢打赏！');
    showModal.value = false;
    loadStats();
  } catch (err) {
    message.error(err.message || '打赏失败');
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    const data = await apiGet('/api/donations/stats');
    stats.value = data;
  } catch {}
}

onMounted(loadStats);
</script>

<style scoped>
.donate-body { text-align: center; }
.donate-desc { color: #64748b; margin-bottom: 16px; }
.amount-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.amount-btn {
  padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: 15px; font-weight: 600;
  transition: all 0.2s;
}
.amount-btn:hover { border-color: #ef4444; color: #ef4444; }
.amount-btn.active { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.donate-stats { margin-top: 16px; font-size: 12px; color: #94a3b8; }
</style>
