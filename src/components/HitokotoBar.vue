<template>
  <div class="hitokoto-bar" :class="{ compact }">
    <a-spin :spinning="loading && !hitokoto.text">
      <Transition name="hitokoto-flip" mode="out-in">
        <div :key="hitokoto.text" class="hitokoto-inner">
          <div class="quote-icon">"</div>
          <p class="hitokoto-text">{{ hitokoto.text }}</p>
          <div class="hitokoto-footer">
            <span class="hitokoto-source" v-if="hitokoto.from">
              —— {{ hitokoto.from_who ? hitokoto.from_who + ' ' : '' }}《{{ hitokoto.from }}》
            </span>
            <a-button type="link" @click="handleRefresh" :loading="loading" class="refresh-btn">
              <span class="refresh-icon">↻</span> 换一句
            </a-button>
          </div>
        </div>
      </Transition>
    </a-spin>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHitokoto } from '../composables/useHitokoto';

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const { hitokoto, loading, fetchHitokoto } = useHitokoto();

function handleRefresh() {
  fetchHitokoto(true);
}

onMounted(fetchHitokoto);
</script>

<style scoped>
.hitokoto-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 40px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hitokoto-bar::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.hitokoto-inner {
  position: relative;
  z-index: 1;
}

.quote-icon {
  font-size: 72px;
  line-height: 1;
  opacity: 0.3;
  position: absolute;
  top: 10px;
  left: 20px;
  font-family: serif;
}

.hitokoto-text {
  font-size: 20px;
  line-height: 1.8;
  margin: 0;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hitokoto-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}

.hitokoto-source {
  opacity: 0.85;
  margin-right: 16px;
  font-size: 14px;
}

.refresh-btn {
  color: white !important;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 4px;
}

.refresh-btn:hover {
  opacity: 1;
}

.refresh-icon {
  font-size: 16px;
  display: inline-block;
  transition: transform 0.5s ease;
}

.refresh-btn:hover .refresh-icon {
  transform: rotate(360deg);
}

/* 切换动画：3D 翻转 + 淡入淡出 */
.hitokoto-flip-enter-active {
  animation: hitokoto-in 0.6s ease;
}

.hitokoto-flip-leave-active {
  animation: hitokoto-out 0.4s ease;
}

@keyframes hitokoto-in {
  0% {
    opacity: 0;
    transform: rotateX(90deg) scale(0.8);
    filter: blur(4px);
  }
  50% {
    opacity: 0.8;
    transform: rotateX(-10deg) scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: rotateX(0deg) scale(1);
    filter: blur(0);
  }
}

@keyframes hitokoto-out {
  0% {
    opacity: 1;
    transform: rotateX(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotateX(-90deg) scale(0.8);
    filter: blur(4px);
  }
}

/* compact 模式 */
.hitokoto-bar.compact {
  padding: 16px 24px;
  border-radius: 12px;
}

.hitokoto-bar.compact .quote-icon {
  display: none;
}

.hitokoto-bar.compact .hitokoto-text {
  font-size: 14px;
  line-height: 1.6;
}

.hitokoto-bar.compact .hitokoto-source {
  font-size: 12px;
}

.hitokoto-bar.compact .refresh-btn {
  font-size: 12px;
}

@media (max-width: 768px) {
  .hitokoto-bar {
    padding: 20px 24px;
  }
  .hitokoto-text {
    font-size: 16px;
  }
  .quote-icon {
    font-size: 48px;
  }
  .hitokoto-bar.compact {
    padding: 12px 16px;
  }
}
</style>
