/**
 * Tab Service for IPTracer
 * Resolves the active tab's domain and fetches the remote server's IP via DNS-over-HTTPS (DoH).
 */

import { IPService } from './ip-service.js';

export class TabService {
  /**
   * Get the active tab in the current window
   */
  static async getActiveTab() {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
      return null;
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  }

  /**
   * Extract cleanly formatted hostname from URL
   * @param {string} urlString
   */
  static extractHostname(urlString) {
    if (!urlString) return null;
    try {
      const url = new URL(urlString);
      // Filter out internal browser protocol schemes
      if (['chrome:', 'edge:', 'about:', 'chrome-extension:', 'file:', 'brave:'].includes(url.protocol)) {
        return { isInternal: true, protocol: url.protocol, hostname: url.hostname || url.protocol };
      }
      return { isInternal: false, protocol: url.protocol, hostname: url.hostname };
    } catch {
      return null;
    }
  }

  /**
   * Query DNS-over-HTTPS (Cloudflare DoH) for host IP resolution
   * @param {string} hostname
   */
  static async resolveDomainDns(hostname) {
    if (!hostname) throw new Error('Hostname is required');

    // Direct IP check
    if (IPService.isValidIPv4(hostname) || IPService.isValidIPv6(hostname)) {
      return { ip: hostname, type: IPService.isValidIPv6(hostname) ? 'AAAA' : 'A' };
    }

    // Try IPv4 (A record) first
    try {
      const v4Url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
      const res = await fetch(v4Url, {
        headers: { 'Accept': 'application/dns-json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.Answer && json.Answer.length > 0) {
          const aRecord = json.Answer.find(ans => ans.type === 1); // 1 = A
          if (aRecord && aRecord.data) {
            return { ip: aRecord.data, type: 'A' };
          }
        }
      }
    } catch (e) {
      console.warn('[IPTracer] DoH A record lookup failed:', e);
    }

    // Fallback to IPv6 (AAAA record)
    try {
      const v6Url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=AAAA`;
      const res = await fetch(v6Url, {
        headers: { 'Accept': 'application/dns-json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.Answer && json.Answer.length > 0) {
          const aaaaRecord = json.Answer.find(ans => ans.type === 28); // 28 = AAAA
          if (aaaaRecord && aaaaRecord.data) {
            return { ip: aaaaRecord.data, type: 'AAAA' };
          }
        }
      }
    } catch (e) {
      console.warn('[IPTracer] DoH AAAA record lookup failed:', e);
    }

    throw new Error(`Unable to resolve DNS for ${hostname}`);
  }

  /**
   * Inspect the currently active tab and return its remote host IP & Geolocation
   */
  static async inspectActiveTab() {
    const tab = await this.getActiveTab();
    if (!tab || !tab.url) {
      return {
        isAvailable: false,
        reason: 'No active browser tab found.'
      };
    }

    const hostInfo = this.extractHostname(tab.url);
    if (!hostInfo) {
      return {
        isAvailable: false,
        reason: 'Invalid URL in active tab.'
      };
    }

    if (hostInfo.isInternal) {
      return {
        isAvailable: false,
        isInternal: true,
        hostname: hostInfo.hostname,
        reason: `Internal browser page (${hostInfo.protocol}) does not have a public IP.`
      };
    }

    // Resolve DNS to IP
    const dnsResult = await this.resolveDomainDns(hostInfo.hostname);
    // Resolve Geolocation for the resolved IP
    const ipDetails = await IPService.fetchIpDetails(dnsResult.ip);

    return {
      isAvailable: true,
      hostname: hostInfo.hostname,
      tabTitle: tab.title || hostInfo.hostname,
      tabFavicon: tab.favIconUrl || '',
      dnsType: dnsResult.type,
      ...ipDetails
    };
  }
}
