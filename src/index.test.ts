import { Tinkler } from './index';

// Mock the global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Tinkler', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the singleton instance
    (Tinkler as any)._instance = null;
  });

  describe('verify_key', () => {
    it('should return true when API key is valid', async () => {
      // Setup
      const mockResponse = { ok: true, json: () => Promise.resolve(true) };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Execute
      const tinkler = new Tinkler({ apiKey: 'test-key' });
      const result = await tinkler.verify_key();

      // Verify
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.tinkler.ai/verify_api_key',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-key',
          },
        }
      );
    });

    it('should throw error when API request fails', async () => {
      // Setup
      const mockResponse = { 
        ok: false, 
        status: 401, 
        statusText: 'Unauthorized' 
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Execute & Verify
      const tinkler = new Tinkler({ apiKey: 'test-key' });
      await expect(tinkler.verify_key()).rejects.toThrow(
        'Tinkler.verify_key failed: 401 Unauthorized'
      );
    });

    it('should use custom baseURL when provided', async () => {
      // Setup
      const mockResponse = { ok: true, json: () => Promise.resolve(true) };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Execute
      const tinkler = new Tinkler({ 
        apiKey: 'test-key',
        baseURL: 'https://custom.tinkler.ai'
      });
      await tinkler.verify_key();

      // Verify
      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.tinkler.ai/verify_api_key',
        expect.any(Object)
      );
    });
  });
}); 