/**
 * IPTracer Background Service Worker / Event Script
 * Manifest V3 Event Script for Chrome and Firefox.
 * Handles background IP monitoring, VPN drop alerts, and toolbar badge updates.
 */

import { IPService } from '../services/ip-service.js';
import { StorageService } from '../services/storage-service.js';

const extAPI = typeof browser !== 'undefined' ? browser : chrome;
const ALARM_NAME = 'iptracer_watchdog_alarm';

/**
 * Update the extension toolbar action badge with country code or status
 */
async function updateBadge(data) {
  try {
    const settings = await StorageService.getSettings();
    if (!settings.showCountryBadge || !data || !data.country_code) {
      if (extAPI.action && extAPI.action.setBadgeText) {
        await extAPI.action.setBadgeText({ text: '' });
      }
      return;
    }
    if (extAPI.action && extAPI.action.setBadgeText) {
      await extAPI.action.setBadgeText({ text: data.country_code.slice(0, 4) });
      await extAPI.action.setBadgeBackgroundColor({ color: '#0284c7' }); // Sky-600
    }
  } catch (err) {
    console.warn('[IPTracer SW] Failed to update badge:', err);
  }
}

/**
 * Check client IP, compare against previous cache, and alert on change
 */
async function performIpCheck(isStartup = false) {
  try {
    const settings = await StorageService.getSettings();
    if (!settings.watchdogEnabled && !isStartup) {
      return;
    }

    const previous = await StorageService.getCachedClientIp();
    const current = await IPService.fetchClientIp(5000);

    // Save and update history if changed
    await StorageService.saveCachedClientIp(current);
    await updateBadge(current);

    // Alert if IP changed (and we had a previous recorded IP)
    if (previous && previous.ip && previous.ip !== current.ip) {
      const message = `Egress IP changed: ${previous.ip} (${previous.country}) ➔ ${current.ip} (${current.country})`;
      if (extAPI.notifications && extAPI.notifications.create) {
        extAPI.notifications.create('iptracer-ip-changed', {
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'IPTracer: IP Address Changed',
          message: message,
          priority: 2
        });
      }
    }
  } catch (err) {
    console.warn('[IPTracer SW] Background IP check encountered error:', err.message);
  }
}

/**
 * Configure watchdog alarm schedule
 */
async function setupAlarm() {
  if (!extAPI.alarms) return;
  const settings = await StorageService.getSettings();
  const period = Math.max(1, settings.watchdogIntervalMinutes || 5);
  await extAPI.alarms.clear(ALARM_NAME);
  extAPI.alarms.create(ALARM_NAME, {
    delayInMinutes: 1,
    periodInMinutes: period
  });
}

// Lifecycle: Installation and updates
if (extAPI.runtime && extAPI.runtime.onInstalled) {
  extAPI.runtime.onInstalled.addListener(async (details) => {
    console.log('[IPTracer SW] Extension installed/updated:', details.reason);
    await setupAlarm();
    await performIpCheck(true);
  });
}

// Lifecycle: Browser startup
if (extAPI.runtime && extAPI.runtime.onStartup) {
  extAPI.runtime.onStartup.addListener(async () => {
    await setupAlarm();
    await performIpCheck(true);
  });
}

// Periodic alarm handler
if (extAPI.alarms && extAPI.alarms.onAlarm) {
  extAPI.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
      await performIpCheck(false);
    }
  });
}

// Messaging bridge for immediate checks requested by popup
if (extAPI.runtime && extAPI.runtime.onMessage) {
  extAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'REFRESH_IP') {
      (async () => {
        try {
          const current = await IPService.fetchClientIp(6000);
          await StorageService.saveCachedClientIp(current);
          await updateBadge(current);
          sendResponse({ success: true, data: current });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true; // Keeps async response channel open
    }

    if (message.action === 'UPDATE_SETTINGS') {
      (async () => {
        await StorageService.saveSettings(message.settings);
        await setupAlarm();
        const cached = await StorageService.getCachedClientIp();
        if (cached) await updateBadge(cached);
        sendResponse({ success: true });
      })();
      return true;
    }
  });
}
