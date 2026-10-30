# Chrome Web Store Listing — IPTracer - Modern IP & Network Inspector

> Last Updated: 2026-10-30

## Store Listing

**Extension Name** [REQUIRED]
IPTracer - Modern IP & Network Inspector

**Short Description** [REQUIRED]
Real-time client IP, geolocation, ISP/ASN telemetry, active tab domain tracing, and VPN drop monitoring.

**Detailed Description** [REQUIRED]
Inspect your public IP address, geolocation details, internet service provider, and active tab website servers with a single click.

Key Features:
- Instant Client IP Detection: View your public IPv4 and IPv6 addresses, network latency, and country flag.
- Detailed Geolocation & ASN: See your city, region, postal code, coordinates, organization, and Autonomous System Number (ASN).
- Active Tab Host Tracing: Resolve the hosting server IP and data center location for whatever website you are browsing.
- VPN Drop Watchdog: Receive immediate desktop alerts when your public IP changes so you never browse unprotected.
- IP Change History: Review a timeline of recent network switches and location changes.
- Cyberpunk & Clean UI: High-contrast dashboard with automatic light and dark mode support.
- One-Click Copy: Fast clipboard copy for IP addresses and network diagnostics.

How to Use:
1. Click the IPTracer icon in your toolbar to view your current public IP, ISP, and location.
2. Switch to the Active Tab tab to see the server host IP and location for the site you are currently visiting.
3. Click any IP to copy it instantly to your clipboard.
4. Open Settings to toggle background VPN change notifications or toolbar country badges.

Privacy & Security:
IPTracer runs entirely on your device. It does not track your browsing activity, does not collect personal data, and does not sell or share any user information. All network lookups are performed over encrypted HTTPS connections.

Support:
Submit questions, feature suggestions, or bug reports via our GitHub repository.

**Category** [REQUIRED]
Developer Tools

**Single Purpose** [REQUIRED]
Displays public IP address, network telemetry, and host server geolocation for the current connection and active browser tab.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Extension Icon 48 | 48×48 PNG | ✅ Ready | `icons/icon-48.png` |
| Extension Icon 32 | 32×32 PNG | ✅ Ready | `icons/icon-32.png` |
| Extension Icon 16 | 16×16 PNG | ✅ Ready | `icons/icon-16.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | ⬜ Not created | `screenshot-client-ip.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ⬜ Not created | `screenshot-tab-ip.png` |
| Screenshot 3 [RECOMMENDED] | 1280×800 | ⬜ Not created | `screenshot-history-settings.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | `promo-small.png` |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | `promo-marquee.png` |

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `storage` | permissions | Saves local user preferences (light/dark theme, check interval) and the list of recent IP changes locally on device. |
| `alarms` | permissions | Schedules periodic background checks to alert users when their public IP changes or VPN disconnects. |
| `notifications` | permissions | Sends desktop alerts to notify the user if their public IP address changes unexpectedly. |
| `activeTab` | permissions | Reads the domain of the active tab when the extension icon is clicked to resolve that website's hosting server IP address. |
| `https://ipapi.co/*` | host_permissions | Primary HTTPS endpoint used to retrieve public IP address, geolocation, ISP, and ASN telemetry. |
| `https://ipinfo.io/*` | host_permissions | Secondary failover HTTPS endpoint for IP and geolocation lookups if primary provider is unreachable. |
| `https://api.ipify.org/*` | host_permissions | Tertiary fallback endpoint to verify public IP address during network disruption. |
| `https://cloudflare-dns.com/*` | host_permissions | Encrypted DNS-over-HTTPS (DoH) resolver used to identify the server IP address of the user's active tab. |

---

## Privacy & Data Use

### Data Collection
**Does the extension collect user data?** No

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|---|---|---|---|---|
| Personally identifiable info | No | No | None | No |
| Health info | No | No | None | No |
| Financial info | No | No | None | No |
| Authentication info | No | No | None | No |
| Personal communications | No | No | None | No |
| Location | No | No | None | No |
| Web history | No | No | None | No |
| User activity | No | No | None | No |
| Website content | No | No | None | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Distribution
**Visibility**: Public  
**Regions**: All regions

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 2.0.0 | 2026-10-30 | Complete Manifest V3 rebuild: dual client/host IP tracing, background VPN drop watchdog, modern dark/light cyber UI, zero jQuery dependency. | Draft |
| 1.0.0 | 2018-03-28 | Initial legacy release (Manifest V2). | Obsolete |
