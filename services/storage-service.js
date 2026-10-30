/**
 * Storage Service for IPTracer
 * Manages local storage persistence for IP caching, historical changes, and user preferences.
 */

const DEFAULT_SETTINGS = {
  theme: 'auto',
  watchdogEnabled: true,
  watchdogIntervalMinutes: 5,
  showCountryBadge: true
};

const MAX_HISTORY_ITEMS = 10;

export class StorageService {
  /**
   * Safe getter for chrome.storage.local with mock fallback for testing
   */
  static getStorageArea() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return chrome.storage.local;
    }
    // In-memory fallback if outside chrome extension context (e.g. Node tests)
    if (!globalThis.__mockStorage) {
      globalThis.__mockStorage = {};
    }
    return {
      get: (keys) => {
        return new Promise((resolve) => {
          if (typeof keys === 'string') {
            resolve({ [keys]: globalThis.__mockStorage[keys] });
          } else if (Array.isArray(keys)) {
            const res = {};
            keys.forEach(k => { res[k] = globalThis.__mockStorage[k]; });
            resolve(res);
          } else if (typeof keys === 'object' && keys !== null) {
            const res = {};
            for (const [k, v] of Object.entries(keys)) {
              res[k] = globalThis.__mockStorage[k] !== undefined ? globalThis.__mockStorage[k] : v;
            }
            resolve(res);
          } else {
            resolve({ ...globalThis.__mockStorage });
          }
        });
      },
      set: (items) => {
        return new Promise((resolve) => {
          Object.assign(globalThis.__mockStorage, items);
          resolve();
        });
      }
    };
  }

  /**
   * Retrieve user settings merged with defaults
   */
  static async getSettings() {
    const storage = this.getStorageArea();
    const result = await storage.get({ settings: DEFAULT_SETTINGS });
    return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
  }

  /**
   * Save partial or full user settings
   */
  static async saveSettings(newSettings) {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };
    const storage = this.getStorageArea();
    await storage.set({ settings: updated });
    return updated;
  }

  /**
   * Get cached client IP data
   */
  static async getCachedClientIp() {
    const storage = this.getStorageArea();
    const result = await storage.get('cachedClientIp');
    return result.cachedClientIp || null;
  }

  /**
   * Save cached client IP data and record change in history if IP changed
   */
  static async saveCachedClientIp(ipData) {
    if (!ipData || !ipData.ip) return;
    const storage = this.getStorageArea();
    const previous = await this.getCachedClientIp();
    
    await storage.set({ cachedClientIp: { ...ipData, cachedAt: Date.now() } });

    if (!previous || previous.ip !== ipData.ip) {
      await this.addHistoryEntry({
        ip: ipData.ip,
        country: ipData.country_name || ipData.country || 'Unknown',
        country_code: ipData.country_code || '',
        city: ipData.city || 'Unknown',
        org: ipData.org || ipData.isp || 'Unknown',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Retrieve list of recorded IP changes
   */
  static async getHistory() {
    const storage = this.getStorageArea();
    const result = await storage.get({ ipHistory: [] });
    return result.ipHistory || [];
  }

  /**
   * Add a new entry to the IP history (capped at MAX_HISTORY_ITEMS)
   */
  static async addHistoryEntry(entry) {
    const history = await this.getHistory();
    // Prepend newest entry, deduplicate immediate previous
    if (history.length > 0 && history[0].ip === entry.ip) {
      return history;
    }
    const updated = [entry, ...history].slice(0, MAX_HISTORY_ITEMS);
    const storage = this.getStorageArea();
    await storage.set({ ipHistory: updated });
    return updated;
  }

  /**
   * Clear historical records
   */
  static async clearHistory() {
    const storage = this.getStorageArea();
    await storage.set({ ipHistory: [] });
  }
}
