import { ref } from 'vue';

const hitokoto = ref({ text: '加载中...', from: '', from_who: '' });
const loading = ref(false);
const CACHE_KEY = 'hitokoto_cache';
const CACHE_TTL = 5 * 60 * 1000;
const FETCH_TIMEOUT = 8000;

let currentController = null;

const defaultHitokoto = {
  text: '生活不止眼前的苟且，还有诗和远方。',
  from: '高晓松',
  from_who: '',
};

function normalizeHitokoto(payload = {}) {
  const data = payload.data || payload;
  const h = data.hitokoto || data;
  return {
    text: h.text || h.hitokoto || defaultHitokoto.text,
    from: h.from || '',
    from_who: h.from_who || h.fromWho || '',
  };
}

function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  currentController = controller;
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export function useHitokoto() {
  async function fetchHitokoto(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            hitokoto.value = data;
            return;
          }
        } catch { /* ignore corrupted cache */ }
      }
    }

    if (currentController) {
      currentController.abort();
    }

    loading.value = true;
    try {
      const res = await fetchWithTimeout(
        `/api/hitokoto${forceRefresh ? '?refresh=1' : ''}`,
        FETCH_TIMEOUT,
      );
      if (!res.ok) throw new Error(`Hitokoto request failed (${res.status})`);
      hitokoto.value = normalizeHitokoto(await res.json());
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: hitokoto.value,
        timestamp: Date.now(),
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            hitokoto.value = JSON.parse(cached).data;
          } catch {
            hitokoto.value = defaultHitokoto;
          }
        } else {
          hitokoto.value = defaultHitokoto;
        }
      }
    } finally {
      loading.value = false;
    }
  }

  return { hitokoto, loading, fetchHitokoto };
}
