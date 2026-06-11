<template>
  <div v-if="ad && visible" class="ad-slot" :class="`ad-${ad.type}`">
    <a
      v-if="ad.link"
      :href="ad.link"
      target="_blank"
      rel="noopener noreferrer"
      class="ad-link"
      @click="trackClick"
    >
      <img v-if="ad.type === 'image'" :src="ad.content" :alt="ad.title" class="ad-image" />
      <div v-else-if="ad.type === 'text'" class="ad-text">{{ ad.content }}</div>
      <div v-else-if="ad.type === 'html'" class="ad-html" v-html="ad.content"></div>
    </a>
    <template v-else>
      <img v-if="ad.type === 'image'" :src="ad.content" :alt="ad.title" class="ad-image" />
      <div v-else-if="ad.type === 'text'" class="ad-text">{{ ad.content }}</div>
      <div v-else-if="ad.type === 'html'" class="ad-html" v-html="ad.content"></div>
    </template>
    <div class="ad-label">广告</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  slot: { type: String, required: true },
});

const authStore = useAuthStore();
const ad = ref(null);
const visible = computed(() => {
  if (!ad.value) return false;
  const plan = authStore.user?.membership?.plan || 'free';
  return plan === 'free';
});

async function fetchAd() {
  try {
    const res = await fetch(`/api/ads/slot?slot=${encodeURIComponent(props.slot)}`);
    const json = await res.json();
    ad.value = json.data?.ad || null;
  } catch {
    ad.value = null;
  }
}

async function trackClick() {
  if (ad.value?._id) {
    fetch(`/api/ads/${ad.value._id}/click`, { method: 'POST' }).catch(() => {});
  }
}

onMounted(fetchAd);
</script>

<style scoped>
.ad-slot {
  position: relative;
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
}
.ad-image {
  width: 100%;
  display: block;
  max-height: 120px;
  object-fit: cover;
}
.ad-text {
  padding: 12px 16px;
  font-size: 13px;
  color: #64748b;
}
.ad-label {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  color: #94a3b8;
  background: rgba(255,255,255,0.8);
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
