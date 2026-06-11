<template>
  <div class="membership-page">
    <a-card title="会员中心" :bordered="false">
      <div class="current-plan">
        <div class="plan-badge" :class="currentPlan">
          {{ currentPlan === 'free' ? '免费版' : currentPlan === 'pro' ? 'Pro 会员' : '企业版' }}
        </div>
        <div v-if="membership.expiresAt" class="plan-expires">
          到期时间：{{ formatDate(membership.expiresAt) }}
        </div>
      </div>
    </a-card>

    <a-card title="升级套餐" :bordered="false" style="margin-top: 16px">
      <div class="plan-grid">
        <div v-for="(plan, key) in plans" :key="key" :class="['plan-card', { active: currentPlan === key }]">
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price">
            <span class="price-big">¥{{ plan.price }}</span>
            <span class="price-unit">/月</span>
          </div>
          <div v-if="plan.yearlyPrice" class="plan-yearly">
            年付 ¥{{ plan.yearlyPrice }}（省 ¥{{ plan.price * 12 - plan.yearlyPrice }}）
          </div>
          <ul class="plan-features">
            <li>题目浏览：无限</li>
            <li>基础练习：{{ key === 'free' ? '每日10次' : '无限' }}</li>
            <li>查看完整答案：{{ key === 'free' ? '❌' : '✅' }}</li>
            <li>AI 评分：{{ key === 'free' ? '❌' : key === 'pro' ? '每日20次' : '无限' }}</li>
            <li>AI 生成答案：{{ key === 'free' ? '❌' : key === 'pro' ? '每日10次' : '无限' }}</li>
            <li>AI 对话：{{ key === 'free' ? '每日2条' : key === 'pro' ? '每日50条' : '无限' }}</li>
            <li>无广告：{{ key === 'free' ? '❌' : '✅' }}</li>
          </ul>
          <a-button
            v-if="key !== 'free' && currentPlan !== key"
            type="primary"
            block
            @click="selectPlan(key)"
          >
            选择套餐
          </a-button>
          <a-button v-else-if="currentPlan === key" block disabled>
            当前套餐
          </a-button>
        </div>
      </div>
    </a-card>

    <a-modal v-model:open="showPay" title="选择支付方式" :footer="null" width="360px">
      <div class="pay-body">
        <p>套餐：{{ payPlan?.name }} — ¥{{ payAmount }}</p>
        <a-button block style="margin-top: 12px" @click="pay('alipay')">支付宝支付</a-button>
        <a-button block style="margin-top: 8px" @click="pay('wechat')">微信支付</a-button>
        <a-button block style="margin-top: 8px" @click="pay('manual')">联系管理员开通</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { apiGet, apiPost } from '../utils/api.js';

const plans = ref({});
const membership = ref({});
const currentPlan = ref('free');
const showPay = ref(false);
const payPlan = ref(null);
const payAmount = ref(0);
const yearly = ref(false);

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('zh-CN');
}

async function loadData() {
  try {
    const [planData, memData] = await Promise.all([
      apiGet('/api/membership/plans'),
      apiGet('/api/membership/current'),
    ]);
    plans.value = planData.plans || {};
    membership.value = memData || {};
    currentPlan.value = memData.plan || 'free';
  } catch {}
}

function selectPlan(key) {
  const plan = plans.value[key];
  if (!plan) return;
  payPlan.value = { ...plan, key };
  payAmount.value = plan.price;
  yearly.value = false;
  showPay.value = true;
}

async function pay(channel) {
  try {
    const data = await apiPost('/api/membership/order', {
      plan: payPlan.value.key,
      channel,
      yearly: yearly.value,
    });
    message.success('订单已创建，订单号：' + data.order.tradeNo);
    showPay.value = false;
    loadData();
  } catch (err) {
    message.error(err.message || '创建订单失败');
  }
}

onMounted(loadData);
</script>

<style scoped>
.current-plan { display: flex; align-items: center; gap: 16px; }
.plan-badge {
  padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;
}
.plan-badge.free { background: #f1f5f9; color: #64748b; }
.plan-badge.pro { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
.plan-badge.enterprise { background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; }
.plan-expires { font-size: 13px; color: #94a3b8; }
.plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.plan-card {
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;
  text-align: center; transition: all 0.2s;
}
.plan-card.active { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
.plan-name { font-size: 16px; font-weight: 600; color: #334155; }
.plan-price { margin: 8px 0; }
.price-big { font-size: 28px; font-weight: 700; color: #6366f1; }
.price-unit { font-size: 13px; color: #94a3b8; }
.plan-yearly { font-size: 12px; color: #10b981; margin-bottom: 8px; }
.plan-features { text-align: left; font-size: 13px; color: #64748b; list-style: none; padding: 0; margin: 12px 0; }
.plan-features li { padding: 4px 0; }
.pay-body { text-align: center; }
</style>
