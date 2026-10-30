/**
 * IP Service for IPTracer
 * High-performance, resilient multi-provider IP and Geolocation resolution.
 */

export class IPService {
  /**
   * Convert ISO 3166-1 alpha-2 country code to emoji flag
   * @param {string} countryCode e.g. "US", "IN", "DE"
   * @returns {string} Emoji flag or globe
   */
  static getCountryFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const code = countryCode.toUpperCase();
    const firstChar = String.fromCodePoint(code.charCodeAt(0) + 127397);
    const secondChar = String.fromCodePoint(code.charCodeAt(1) + 127397);
    return `${firstChar}${secondChar}`;
  }

  /**
   * Validate if a string is a valid IPv4 address
   * @param {string} ip
   * @returns {boolean}
   */
  static isValidIPv4(ip) {
    if (typeof ip !== 'string') return false;
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      if (!/^\d+$/.test(part)) return false;
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255 && (part === '0' || !part.startsWith('0'));
    });
  }

  /**
   * Validate if a string is a valid IPv6 address
   * @param {string} ip
   * @returns {boolean}
   */
  static isValidIPv6(ip) {
    if (typeof ip !== 'string') return false;
    const trimmed = ip.trim();
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
    return ipv6Regex.test(trimmed);
  }

  /**
   * Detect if an IP address is a private/internal bogon IP
   * @param {string} ip
   * @returns {boolean}
   */
  static isPrivateIP(ip) {
    if (!ip) return false;
    const trimmed = ip.trim();
    if (trimmed === '127.0.0.1' || trimmed === 'localhost' || trimmed === '::1') return true;
    if (this.isValidIPv4(trimmed)) {
      const parts = trimmed.split('.').map(Number);
      // 10.0.0.0 - 10.255.255.255
      if (parts[0] === 10) return true;
      // 172.16.0.0 - 172.31.255.255
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0 - 192.168.255.255
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.0.0 - 169.254.255.255 (Link-local)
      if (parts[0] === 169 && parts[1] === 254) return true;
    }
    if (this.isValidIPv6(trimmed)) {
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) return true;
    }
    return false;
  }

  /**
   * Standardize unified normalized IP data record
   */
  static normalizeIpData(raw, provider, latencyMs) {
    let lat = null;
    let lon = null;
    if (raw.latitude !== undefined && raw.longitude !== undefined) {
      lat = parseFloat(raw.latitude);
      lon = parseFloat(raw.longitude);
    } else if (typeof raw.loc === 'string') {
      const parts = raw.loc.split(',');
      if (parts.length === 2) {
        lat = parseFloat(parts[0]);
        lon = parseFloat(parts[1]);
      }
    }

    const countryCode = (raw.country_code || raw.country || '').toUpperCase();
    const countryName = raw.country_name || raw.country || 'Unknown';
    const flag = this.getCountryFlagEmoji(countryCode);

    return {
      ip: raw.ip,
      version: this.isValidIPv6(raw.ip) ? 'IPv6' : 'IPv4',
      city: raw.city || 'Unknown City',
      region: raw.region || raw.region_name || 'Unknown Region',
      country: countryName,
      country_code: countryCode,
      flag: flag,
      postal: raw.postal || raw.postal_code || 'N/A',
      latitude: lat,
      longitude: lon,
      timezone: raw.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      asn: raw.asn || (raw.org && raw.org.startsWith('AS') ? raw.org.split(' ')[0] : 'N/A'),
      org: raw.org || raw.isp || 'Unknown Provider',
      provider: provider,
      latency: latencyMs || 0,
      timestamp: Date.now()
    };
  }

  /**
   * Fetch Client IP and geolocation with multi-provider failover
   */
  static async fetchClientIp(timeoutMs = 6000) {
    const providers = [
      {
        name: 'ipapi.co',
        url: 'https://ipapi.co/json/',
        parse: (data, latency) => this.normalizeIpData(data, 'ipapi.co', latency)
      },
      {
        name: 'ipinfo.io',
        url: 'https://ipinfo.io/json',
        parse: (data, latency) => this.normalizeIpData(data, 'ipinfo.io', latency)
      },
      {
        name: 'ipify',
        url: 'https://api.ipify.org?format=json',
        parse: (data, latency) => this.normalizeIpData({
          ip: data.ip,
          city: 'Unknown',
          country_name: 'Unknown',
          org: 'Public Network'
        }, 'ipify', latency)
      }
    ];

    let lastError = null;

    for (const provider of providers) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(provider.url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from ${provider.name}`);
        }

        const data = await response.json();
        if (!data || !data.ip) {
          throw new Error(`Invalid response payload from ${provider.name}`);
        }

        const latency = Date.now() - startTime;
        return provider.parse(data, latency);
      } catch (err) {
        lastError = err;
        console.warn(`[IPTracer] Provider ${provider.name} failed:`, err.message);
        // Continue to next provider in loop
      }
    }

    throw new Error(`All IP providers failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
  }

  /**
   * Resolve geolocation details for a specific IP address
   * @param {string} targetIp 
   */
  static async fetchIpDetails(targetIp, timeoutMs = 6000) {
    if (!targetIp || this.isPrivateIP(targetIp)) {
      return {
        ip: targetIp,
        version: this.isValidIPv6(targetIp) ? 'IPv6' : 'IPv4',
        city: 'Private Network',
        region: 'Local / Intranet',
        country: 'Localhost / Private IP',
        country_code: 'LAN',
        flag: '🔒',
        postal: 'N/A',
        latitude: null,
        longitude: null,
        timezone: 'Local',
        asn: 'Private',
        org: 'Private / Bogon Range',
        provider: 'local',
        latency: 0,
        timestamp: Date.now()
      };
    }

    const providers = [
      {
        name: 'ipapi.co',
        url: `https://ipapi.co/${encodeURIComponent(targetIp)}/json/`,
        parse: (data, latency) => this.normalizeIpData(data, 'ipapi.co', latency)
      },
      {
        name: 'ipinfo.io',
        url: `https://ipinfo.io/${encodeURIComponent(targetIp)}/json`,
        parse: (data, latency) => this.normalizeIpData(data, 'ipinfo.io', latency)
      }
    ];

    let lastError = null;
    for (const provider of providers) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(provider.url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from ${provider.name}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.reason || 'Lookup error');
        }

        const latency = Date.now() - startTime;
        return provider.parse(data, latency);
      } catch (err) {
        lastError = err;
        console.warn(`[IPTracer] Lookup ${targetIp} via ${provider.name} failed:`, err.message);
      }
    }

    throw new Error(`Could not resolve IP details for ${targetIp}. ${lastError ? lastError.message : ''}`);
  }
}
