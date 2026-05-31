import { describe, it, expect, vi, beforeEach } from 'vitest';

// api.js uses import.meta.env and localStorage, need to mock
vi.stubEnv('VITE_API_BASE_URL', '');

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// Test the internal helper functions by importing the module
// and testing the exported functions with mocked fetch
describe('api.js', () => {
  it('apiGet calls fetch with GET method', async () => {
    const mockResponse = { success: true, data: { items: [] } };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { apiGet } = await import('../api.js');
    const result = await apiGet('/api/test');

    expect(result).toEqual({ items: [] });
    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('apiPost calls fetch with POST method and body', async () => {
    const mockResponse = { success: true, data: { id: 1 } };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { apiPost } = await import('../api.js');
    const result = await apiPost('/api/test', { name: 'test' });

    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    );
  });

  it('apiPut calls fetch with PUT method', async () => {
    const mockResponse = { success: true, data: { updated: true } };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { apiPut } = await import('../api.js');
    await apiPut('/api/test', { name: 'updated' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'updated' }),
      })
    );
  });

  it('apiDelete calls fetch with DELETE method', async () => {
    const mockResponse = { success: true, data: { deleted: true } };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { apiDelete } = await import('../api.js');
    await apiDelete('/api/test/1');

    expect(fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('throws error on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    }));

    const { apiGet } = await import('../api.js');
    await expect(apiGet('/api/test')).rejects.toThrow('Server error');
  });

  it('includes Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token-123');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    }));

    const { apiGet } = await import('../api.js');
    await apiGet('/api/test');

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('returns json directly when no data field', async () => {
    const mockResponse = { success: true, message: 'ok' };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { apiGet } = await import('../api.js');
    const result = await apiGet('/api/test');

    expect(result).toEqual({ success: true, message: 'ok' });
  });
});
