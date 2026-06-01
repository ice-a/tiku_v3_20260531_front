import { ref } from 'vue';

const hitokoto = ref({ text: '加载中...', from: '', from_who: '' });
const loading = ref(false);
const CACHE_KEY = 'hitokoto_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

const defaultHitokoto = {
  text: '生活不止眼前的苟且，还有诗和远方。',
  from: '高晓松',
  from_who: '',
};

function normalizeHitokoto(payload = {}) {
  const data = payload.data || payload;
  const fromWho = data.from_who || data.fromWho || '';

  return {
    text: data.text || data.hitokoto || defaultHitokoto.text,
    from: data.from || '',
    from_who: fromWho,
  };
}

export function useHitokoto() {
  async function fetchHitokoto(forceRefresh = false) {
    // 检查缓存
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            hitokoto.value = data;
            return;
          }
        } catch {}
      }
    }

    loading.value = true;
    try {
      const res = await fetch(`/api/hitokoto${forceRefresh ? '?refresh=1' : ''}`);
      if (res.ok === false) throw new Error(`Hitokoto request failed (${res.status})`);

      hitokoto.value = normalizeHitokoto(await res.json());
      // 保存缓存
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: hitokoto.value,
        timestamp: Date.now(),
      }));
    } catch {
      hitokoto.value = defaultHitokoto;
    } finally {
      loading.value = false;
    }
  }

  return { hitokoto, loading, fetchHitokoto };
}
