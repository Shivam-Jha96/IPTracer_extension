/**
 * IPTracer Popup Controller
 * Manages responsive UI states, optimistic cached rendering, tab toggling, and data synchronization.
 * Compatible with Chrome and Firefox.
 */

import { IPService } from '../services/ip-service.js';
import { StorageService } from '../services/storage-service.js';
import { TabService } from '../services/tab-service.js';

const extAPI = typeof browser !== 'undefined' ? browser : chrome;

class PopupController {
  constructor() {
    this.currentView = 'client'; // 'client' | 'tab'
    this.clientData = null;
    this.hostData = null;
    this.settings = null;
  }

  async init() {
    this.bindElements();
    this.bindEvents();
    await this.initThemeAndSettings();
    await this.loadInitialData();
  }

  bindElements() {
    // Nav tabs
    this.navClient = document.getElementById('nav-client');
    this.navTab = document.getElementById('nav-tab');

    // Views
    this.viewClient = document.getElementById('view-client');
    this.viewTab = document.getElementById('view-tab');
    this.loadingState = document.getElementById('loading-state');
    this.errorState = document.getElementById('error-state');
    this.errorMessage = document.getElementById('error-message');

    // Header buttons
    this.btnTheme = document.getElementById('btn-theme');
    this.btnRefresh = document.getElementById('btn-refresh');
    this.refreshIcon = document.getElementById('refresh-icon');
    this.btnSettings = document.getElementById('btn-settings');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.settingsPanel = document.getElementById('settings-panel');
    this.btnClearHistory = document.getElementById('btn-clear-history');
    this.btnRetry = document.getElementById('btn-retry');

    // Client IP UI
    this.clientVersion = document.getElementById('client-version');
    this.clientLatency = document.getElementById('client-latency');
    this.clientIp = document.getElementById('client-ip');
    this.btnCopyIp = document.getElementById('btn-copy-ip');
    this.copyLabel = document.getElementById('copy-label');
    this.clientFlag = document.getElementById('client-flag');
    this.clientCityCountry = document.getElementById('client-city-country');
    this.clientIsp = document.getElementById('client-isp');
    this.clientAsn = document.getElementById('client-asn');
    this.clientTimezone = document.getElementById('client-timezone');
    this.clientCoords = document.getElementById('client-coords');
    this.clientMapLink = document.getElementById('client-map-link');

    // History
    this.btnToggleHistory = document.getElementById('btn-toggle-history');
    this.historyContainer = document.getElementById('history-container');
    this.historyList = document.getElementById('history-list');
    this.historyChevron = document.getElementById('history-chevron');

    // Tab Host UI
    this.tabInternalWarning = document.getElementById('tab-internal-warning');
    this.tabWarningText = document.getElementById('tab-warning-text');
    this.tabHostContent = document.getElementById('tab-host-content');
    this.tabDomainName = document.getElementById('tab-domain-name');
    this.tabDnsType = document.getElementById('tab-dns-type');
    this.tabIpVersion = document.getElementById('tab-ip-version');
    this.tabLatency = document.getElementById('tab-latency');
    this.tabIp = document.getElementById('tab-ip');
    this.btnCopyTabIp = document.getElementById('btn-copy-tab-ip');
    this.copyTabLabel = document.getElementById('copy-tab-label');
    this.tabFlag = document.getElementById('tab-flag');
    this.tabCityCountry = document.getElementById('tab-city-country');
    this.tabIsp = document.getElementById('tab-isp');
    this.tabAsn = document.getElementById('tab-asn');
    this.tabTimezone = document.getElementById('tab-timezone');
    this.tabCoords = document.getElementById('tab-coords');
    this.tabMapLink = document.getElementById('tab-map-link');

    // Settings inputs
    this.settingWatchdog = document.getElementById('setting-watchdog');
    this.settingBadge = document.getElementById('setting-badge');
    this.settingInterval = document.getElementById('setting-interval');

    // Footer
    this.footerTimestamp = document.getElementById('footer-timestamp');
    this.footerProvider = document.getElementById('footer-provider');
    this.networkStatus = document.getElementById('network-status');
  }

  bindEvents() {
    // Navigation
    this.navClient.addEventListener('click', () => this.switchView('client'));
    this.navTab.addEventListener('click', () => this.switchView('tab'));

    // Actions
    this.btnRefresh.addEventListener('click', () => this.refreshCurrentView());
    this.btnRetry.addEventListener('click', () => this.refreshCurrentView());
    this.btnCopyIp.addEventListener('click', () => this.copyToClipboard(this.clientData?.ip, this.btnCopyIp, this.copyLabel));
    this.btnCopyTabIp.addEventListener('click', () => this.copyToClipboard(this.hostData?.ip, this.btnCopyTabIp, this.copyTabLabel));

    // Settings & Theme
    this.btnTheme.addEventListener('click', () => this.cycleTheme());
    this.btnSettings.addEventListener('click', () => this.toggleSettings());
    this.btnCloseSettings.addEventListener('click', () => this.toggleSettings());
    this.btnToggleHistory.addEventListener('click', () => this.toggleHistory());
    this.btnClearHistory.addEventListener('click', () => this.clearHistory());

    // Settings changes
    const onSettingChange = async () => {
      const updated = {
        watchdogEnabled: this.settingWatchdog.checked,
        showCountryBadge: this.settingBadge.checked,
        watchdogIntervalMinutes: parseInt(this.settingInterval.value, 10)
      };
      await StorageService.saveSettings(updated);
      if (extAPI && extAPI.runtime?.sendMessage) {
        extAPI.runtime.sendMessage({ action: 'UPDATE_SETTINGS', settings: updated });
      }
    };

    this.settingWatchdog.addEventListener('change', onSettingChange);
    this.settingBadge.addEventListener('change', onSettingChange);
    this.settingInterval.addEventListener('change', onSettingChange);
  }

  async initThemeAndSettings() {
    this.settings = await StorageService.getSettings();

    // Set Theme
    let theme = this.settings.theme || 'auto';
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);

    // Apply Settings to inputs
    this.settingWatchdog.checked = this.settings.watchdogEnabled !== false;
    this.settingBadge.checked = this.settings.showCountryBadge !== false;
    this.settingInterval.value = String(this.settings.watchdogIntervalMinutes || 5);
  }

  async cycleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    await StorageService.saveSettings({ theme: next });
  }

  toggleSettings() {
    this.settingsPanel.classList.toggle('hidden');
  }

  async toggleHistory() {
    const isHidden = this.historyContainer.classList.toggle('hidden');
    this.historyChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    if (!isHidden) {
      await this.renderHistory();
    }
  }

  async renderHistory() {
    const history = await StorageService.getHistory();
    this.historyList.replaceChildren();

    if (!history || history.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-history';
      emptyDiv.textContent = 'No IP changes recorded yet.';
      this.historyList.appendChild(emptyDiv);
      return;
    }

    for (const item of history) {
      const flag = IPService.getCountryFlagEmoji(item.country_code);
      const timeStr = new Date(item.timestamp).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const itemDiv = document.createElement('div');
      itemDiv.className = 'history-item';

      const detailsDiv = document.createElement('div');
      const ipSpan = document.createElement('span');
      ipSpan.className = 'history-item-ip';
      ipSpan.textContent = item.ip;

      const metaSpan = document.createElement('span');
      metaSpan.className = 'history-item-meta';
      metaSpan.textContent = ` ${flag} ${item.city}, ${item.country}`;

      detailsDiv.appendChild(ipSpan);
      detailsDiv.appendChild(metaSpan);

      const timeSpan = document.createElement('span');
      timeSpan.className = 'history-item-meta';
      timeSpan.textContent = timeStr;

      itemDiv.appendChild(detailsDiv);
      itemDiv.appendChild(timeSpan);

      this.historyList.appendChild(itemDiv);
    }
  }

  async clearHistory() {
    await StorageService.clearHistory();
    await this.renderHistory();
  }

  switchView(viewName) {
    if (this.currentView === viewName) return;
    this.currentView = viewName;

    if (viewName === 'client') {
      this.navClient.classList.add('active');
      this.navTab.classList.remove('active');
      this.viewClient.classList.remove('hidden');
      this.viewTab.classList.add('hidden');
      this.footerProvider.textContent = this.clientData?.provider || 'ipapi.co';
    } else {
      this.navClient.classList.remove('active');
      this.navTab.classList.add('active');
      this.viewClient.classList.add('hidden');
      this.viewTab.classList.remove('hidden');
      this.footerProvider.textContent = 'DoH + ipapi.co';
      if (!this.hostData) {
        this.loadHostData();
      }
    }
  }

  async loadInitialData() {
    // Optimistic render: first display cached IP if available
    const cached = await StorageService.getCachedClientIp();
    if (cached) {
      this.clientData = cached;
      this.renderClientData(cached, true);
    } else {
      this.showLoading(true);
    }

    // Always fetch fresh data in background
    await this.loadClientData();
  }

  async loadClientData() {
    try {
      this.btnRefresh.classList.add('rotating');
      this.hideError();

      const data = await IPService.fetchClientIp(6000);
      this.clientData = data;
      await StorageService.saveCachedClientIp(data);
      this.renderClientData(data, false);
      this.showLoading(false);
    } catch (err) {
      console.error('[IPTracer] Failed to load client IP:', err);
      if (!this.clientData) {
        this.showError(err.message || 'Network lookup failed. Check your internet connection.');
      }
    } finally {
      this.btnRefresh.classList.remove('rotating');
    }
  }

  async loadHostData() {
    try {
      this.btnRefresh.classList.add('rotating');
      this.hideError();

      const hostResult = await TabService.inspectActiveTab();
      if (!hostResult.isAvailable) {
        this.tabInternalWarning.classList.remove('hidden');
        this.tabWarningText.textContent = hostResult.reason;
        this.tabHostContent.classList.add('hidden');
        return;
      }

      this.tabInternalWarning.classList.add('hidden');
      this.tabHostContent.classList.remove('hidden');
      this.hostData = hostResult;
      this.renderHostData(hostResult);
    } catch (err) {
      console.error('[IPTracer] Failed to load tab host data:', err);
      this.tabInternalWarning.classList.remove('hidden');
      this.tabWarningText.textContent = `Could not inspect host: ${err.message}`;
      this.tabHostContent.classList.add('hidden');
    } finally {
      this.btnRefresh.classList.remove('rotating');
    }
  }

  async refreshCurrentView() {
    if (this.currentView === 'client') {
      await this.loadClientData();
    } else {
      await this.loadHostData();
    }
  }

  renderClientData(data, isCached = false) {
    this.clientIp.textContent = data.ip;
    this.clientVersion.textContent = data.version || 'IPv4';
    this.clientLatency.textContent = isCached ? 'Cached' : `⚡ ${data.latency}ms`;
    this.clientFlag.textContent = data.flag || '🌐';
    this.clientCityCountry.textContent = `${data.city}, ${data.country}`;
    this.clientIsp.textContent = data.org || 'Unknown Provider';
    this.clientAsn.textContent = data.asn || 'N/A';
    this.clientTimezone.textContent = `${data.timezone} (Postal: ${data.postal})`;

    if (data.latitude && data.longitude) {
      this.clientCoords.textContent = `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
      this.clientMapLink.href = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=12/${data.latitude}/${data.longitude}`;
      this.clientMapLink.classList.remove('hidden');
    } else {
      this.clientCoords.textContent = 'Coordinates unavailable';
      this.clientMapLink.classList.add('hidden');
    }

    const dateStr = new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.footerTimestamp.textContent = `Updated: ${dateStr}${isCached ? ' (cached)' : ''}`;
    this.footerProvider.textContent = data.provider || 'ipapi.co';
    this.networkStatus.textContent = 'ONLINE';
    this.networkStatus.style.color = 'var(--accent-emerald)';
  }

  renderHostData(data) {
    this.tabDomainName.textContent = data.hostname;
    this.tabDnsType.textContent = `DNS ${data.dnsType || 'A'}`;
    this.tabIp.textContent = data.ip;
    this.tabIpVersion.textContent = data.version || 'Server IP';
    this.tabLatency.textContent = `⚡ ${data.latency}ms`;
    this.tabFlag.textContent = data.flag || '🌐';
    this.tabCityCountry.textContent = `${data.city}, ${data.country}`;
    this.tabIsp.textContent = data.org || 'Unknown Host';
    this.tabAsn.textContent = data.asn || 'N/A';
    this.tabTimezone.textContent = data.timezone || 'UTC';

    if (data.latitude && data.longitude) {
      this.tabCoords.textContent = `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
      this.tabMapLink.href = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=12/${data.latitude}/${data.longitude}`;
      this.tabMapLink.classList.remove('hidden');
    } else {
      this.tabCoords.textContent = 'Coordinates unavailable';
      this.tabMapLink.classList.add('hidden');
    }
  }

  async copyToClipboard(text, buttonEl, labelEl) {
    if (!text || text === '0.0.0.0') return;
    try {
      await navigator.clipboard.writeText(text);
      buttonEl.classList.add('copied');
      const prevText = labelEl.textContent;
      labelEl.textContent = 'Copied!';
      setTimeout(() => {
        buttonEl.classList.remove('copied');
        labelEl.textContent = prevText;
      }, 1500);
    } catch (err) {
      console.warn('Copy to clipboard failed:', err);
    }
  }

  showLoading(isLoading) {
    if (isLoading) {
      this.loadingState.classList.remove('hidden');
      this.viewClient.classList.add('hidden');
      this.viewTab.classList.add('hidden');
    } else {
      this.loadingState.classList.add('hidden');
      if (this.currentView === 'client') {
        this.viewClient.classList.remove('hidden');
      } else {
        this.viewTab.classList.remove('hidden');
      }
    }
  }

  showError(message) {
    this.loadingState.classList.add('hidden');
    this.viewClient.classList.add('hidden');
    this.viewTab.classList.add('hidden');
    this.errorState.classList.remove('hidden');
    this.errorMessage.textContent = message;
    this.networkStatus.textContent = 'OFFLINE';
    this.networkStatus.style.color = 'var(--accent-red)';
  }

  hideError() {
    this.errorState.classList.add('hidden');
  }
}

// Bootstrap once DOM is parsed
document.addEventListener('DOMContentLoaded', () => {
  const app = new PopupController();
  app.init().catch(err => console.error('[IPTracer] Initialization error:', err));
});
