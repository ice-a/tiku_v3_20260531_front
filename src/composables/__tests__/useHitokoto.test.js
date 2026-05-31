import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHitokoto } from '../useHitokoto.js';

const CACHE_KEY = 'hitokoto_cache';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useHitokoto', () => {
  it('returns loading state and hitokoto ref', () => {
    const { hitokoto, loading, fetchHitokoto } = useHitokoto();
    expect(hitokoto.value).toBeDefined();
    expect(loading.value).toBe(false);
    expect(typeof fetchHitokoto).toBe('function');
  });

  it('uses cached data when TTL not expired', async () => {
    const cachedData = {
      data: { text: '缓存语录', from: '测试', from_who: '' },
      timestamp: Date.now() - 1000, // 1 second ago, within 5 min TTL
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

    const { hitokoto, fetchHitokoto } = useHitokoto();
    await fetchHitokoto();

    expect(hitokoto.value.text).toBe('缓存语录');
  });

  it('fetches fresh data when cache expired', async () => {
    const cachedData = {
      data: { text: '旧缓存', from: '测试', from_who: '' },
      timestamp: Date.now() - 10 * 60 * 1000, // 10 min ago, past 5 min TTL
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

    const mockResponse = {
      hitokoto: '新鲜语录',
      from: 'API',
      from_who: '作者',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    }));

    const { hitokoto, fetchHitokoto } = useHitokoto();
    await fetchHitokoto();

    expect(hitokoto.value.text).toBe('新鲜语录');
    expect(fetch).toHaveBeenCalled();
  });

  it('fetches fresh data when forceRefresh is true', async () => {
    const cachedData = {
      data: { text: '缓存语录', from: '测试', from_who: '' },
      timestamp: Date.now(), // just now
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

    const mockResponse = {
      hitokoto: '强制刷新',
      from: 'API',
      from_who: '',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    }));

    const { hitokoto, fetchHitokoto } = useHitokoto();
    await fetchHitokoto(true);

    expect(hitokoto.value.text).toBe('强制刷新');
  });

  it('falls back to default on fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { hitokoto, fetchHitokoto } = useHitokoto();
    await fetchHitokoto(true);

    expect(hitokoto.value.text).toBe('生活不止眼前的苟且，还有诗和远方。');
  });

  it('handles corrupted cache gracefully', async () => {
    localStorage.setItem(CACHE_KEY, 'not-valid-json');

    const mockResponse = {
      hitokoto: '新语录',
      from: 'API',
      from_who: '',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    }));

    const { hitokoto, fetchHitokoto } = useHitokoto();
    await fetchHitokoto();

    expect(hitokoto.value.text).toBe('新语录');
  });

  it('saves to cache after successful fetch', async () => {
    const mockResponse = {
      hitokoto: '测试语录',
      from: '来源',
      from_who: '作者',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    }));

    const { fetchHitokoto } = useHitokoto();
    await fetchHitokoto(true);

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    expect(cached.data.text).toBe('测试语录');
    expect(cached.timestamp).toBeGreaterThan(0);
  });
});
