import test from 'node:test';
import assert from 'node:assert/strict';
import { IPService } from '../services/ip-service.js';
import { StorageService } from '../services/storage-service.js';
import { TabService } from '../services/tab-service.js';

test('IPService.isValidIPv4 validates correct and incorrect IPv4 addresses', () => {
  assert.equal(IPService.isValidIPv4('1.1.1.1'), true);
  assert.equal(IPService.isValidIPv4('192.168.1.1'), true);
  assert.equal(IPService.isValidIPv4('8.8.8.8'), true);
  assert.equal(IPService.isValidIPv4('0.0.0.0'), true);
  assert.equal(IPService.isValidIPv4('255.255.255.255'), true);

  assert.equal(IPService.isValidIPv4('256.0.0.1'), false);
  assert.equal(IPService.isValidIPv4('192.168.1'), false);
  assert.equal(IPService.isValidIPv4('192.168.1.1.1'), false);
  assert.equal(IPService.isValidIPv4('192.168.01.1'), false); // Leading zero
  assert.equal(IPService.isValidIPv4('abc.def.ghi.jkl'), false);
  assert.equal(IPService.isValidIPv4(''), false);
  assert.equal(IPService.isValidIPv4(null), false);
});

test('IPService.isValidIPv6 validates standard and compressed IPv6 addresses', () => {
  assert.equal(IPService.isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), true);
  assert.equal(IPService.isValidIPv6('2001:db8::1'), true);
  assert.equal(IPService.isValidIPv6('::1'), true);
  assert.equal(IPService.isValidIPv6('fe80::1'), true);

  assert.equal(IPService.isValidIPv6('192.168.1.1'), false);
  assert.equal(IPService.isValidIPv6('2001:xyz::1'), false);
  assert.equal(IPService.isValidIPv6(''), false);
  assert.equal(IPService.isValidIPv6(null), false);
});

test('IPService.isPrivateIP correctly identifies bogon and private subnets', () => {
  assert.equal(IPService.isPrivateIP('127.0.0.1'), true);
  assert.equal(IPService.isPrivateIP('localhost'), true);
  assert.equal(IPService.isPrivateIP('::1'), true);
  assert.equal(IPService.isPrivateIP('10.0.15.2'), true);
  assert.equal(IPService.isPrivateIP('192.168.0.100'), true);
  assert.equal(IPService.isPrivateIP('172.16.5.4'), true);
  assert.equal(IPService.isPrivateIP('169.254.1.1'), true);

  assert.equal(IPService.isPrivateIP('8.8.8.8'), false);
  assert.equal(IPService.isPrivateIP('1.1.1.1'), false);
  assert.equal(IPService.isPrivateIP('142.250.190.46'), false);
});

test('IPService.getCountryFlagEmoji converts ISO 3166-1 alpha-2 codes', () => {
  assert.equal(IPService.getCountryFlagEmoji('US'), '🇺🇸');
  assert.equal(IPService.getCountryFlagEmoji('IN'), '🇮🇳');
  assert.equal(IPService.getCountryFlagEmoji('GB'), '🇬🇧');
  assert.equal(IPService.getCountryFlagEmoji('de'), '🇩🇪'); // case-insensitive
  assert.equal(IPService.getCountryFlagEmoji(''), '🌐');
  assert.equal(IPService.getCountryFlagEmoji('USA'), '🌐');
});

test('IPService.normalizeIpData unifies ipapi and ipinfo payloads', () => {
  // ipapi format
  const ipapiRaw = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country_name: 'United States',
    country_code: 'US',
    latitude: 37.386,
    longitude: -122.0838,
    org: 'Google LLC',
    asn: 'AS15169',
    timezone: 'America/Los_Angeles',
    postal: '94035'
  };
  const norm1 = IPService.normalizeIpData(ipapiRaw, 'ipapi.co', 45);
  assert.equal(norm1.ip, '8.8.8.8');
  assert.equal(norm1.version, 'IPv4');
  assert.equal(norm1.flag, '🇺🇸');
  assert.equal(norm1.latitude, 37.386);
  assert.equal(norm1.longitude, -122.0838);
  assert.equal(norm1.latency, 45);

  // ipinfo format
  const ipinfoRaw = {
    ip: '1.1.1.1',
    city: 'Brisbane',
    region: 'Queensland',
    country: 'AU',
    loc: '-27.4698,153.0251',
    org: 'AS13335 Cloudflare, Inc.',
    postal: '4000',
    timezone: 'Australia/Brisbane'
  };
  const norm2 = IPService.normalizeIpData(ipinfoRaw, 'ipinfo.io', 32);
  assert.equal(norm2.ip, '1.1.1.1');
  assert.equal(norm2.country_code, 'AU');
  assert.equal(norm2.flag, '🇦🇺');
  assert.equal(norm2.latitude, -27.4698);
  assert.equal(norm2.longitude, 153.0251);
  assert.equal(norm2.asn, 'AS13335');
});

test('StorageService handles settings, caching and deduplicated history', async () => {
  // Reset mock storage
  globalThis.__mockStorage = {};

  const settings = await StorageService.getSettings();
  assert.equal(settings.watchdogEnabled, true);
  assert.equal(settings.watchdogIntervalMinutes, 5);

  await StorageService.saveSettings({ watchdogIntervalMinutes: 15 });
  const updated = await StorageService.getSettings();
  assert.equal(updated.watchdogIntervalMinutes, 15);
  assert.equal(updated.watchdogEnabled, true);

  // Cache test
  const ipData = {
    ip: '104.26.12.31',
    country: 'United States',
    country_code: 'US',
    city: 'San Francisco',
    org: 'Cloudflare'
  };
  await StorageService.saveCachedClientIp(ipData);
  const cached = await StorageService.getCachedClientIp();
  assert.equal(cached.ip, '104.26.12.31');

  // History test
  const history = await StorageService.getHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].ip, '104.26.12.31');

  // Deduplication check: re-saving same IP shouldn't add duplicate immediate entry
  await StorageService.saveCachedClientIp(ipData);
  const history2 = await StorageService.getHistory();
  assert.equal(history2.length, 1);

  // New IP saves new entry
  await StorageService.saveCachedClientIp({ ...ipData, ip: '142.250.190.46' });
  const history3 = await StorageService.getHistory();
  assert.equal(history3.length, 2);
  assert.equal(history3[0].ip, '142.250.190.46');

  // Clear history
  await StorageService.clearHistory();
  const cleared = await StorageService.getHistory();
  assert.equal(cleared.length, 0);
});

test('TabService.extractHostname parses standard and internal URLs', () => {
  const ext = TabService.extractHostname('https://github.com/Shivam-Jha96/IPTracer_extension');
  assert.equal(ext.isInternal, false);
  assert.equal(ext.hostname, 'github.com');

  const internal = TabService.extractHostname('chrome://extensions/');
  assert.equal(internal.isInternal, true);

  const invalid = TabService.extractHostname('not-a-url');
  assert.equal(invalid, null);
});
