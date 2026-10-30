# IPTracer 🌐⚡

> **A high-performance, privacy-focused Cross-Browser Extension (Chrome & Firefox Manifest V3) for real-time client IP tracing, geolocation telemetry, active tab domain resolution, and background VPN drop monitoring.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-success.svg)
![Chrome & Firefox](https://img.shields.io/badge/browsers-Chrome%20%7C%20Firefox%20%7C%20Edge%20%7C%20Brave-orange.svg)
![Dependencies](https://img.shields.io/badge/dependencies-0%20runtime-emerald.svg)
![Tests](https://img.shields.io/badge/tests-7%20passing-brightgreen.svg)

---

## ✨ Features

- 🛰️ **Dual-Perspective IP Inspection**:
  - **My Client IP**: Instant public IPv4 and IPv6 detection, latency measurement, country flag, city, region, coordinates, ISP, and ASN.
  - **Active Tab Host**: Resolves the hostname, remote server IP, hosting facility, and data center geolocation for the website currently open in your active browser tab using encrypted DNS-over-HTTPS (DoH).
- 🛡️ **VPN Drop & IP Change Sentinel**:
  - Background event worker periodically monitors your public egress IP.
  - Fires instant desktop notifications if your public IP changes unexpectedly (e.g. if your VPN tunnel drops).
  - Optional toolbar badge showing your current country code (e.g., `US`, `DE`, `JP`).
- 📋 **One-Click Clipboard Actions**:
  - Click to copy IP address with visual feedback.
  - Direct quick link to open coordinates on OpenStreetMap.
- 🕒 **IP Transition History**:
  - Tracks and deduplicates recent network transitions and location changes locally on device.
- 🎨 **Modern Cyber / Glassmorphic UI**:
  - Sleek, high-contrast dashboard with automatic system dark/light theme support.
  - Crisp typography with monospace accents for IP addresses and network codes.
- 🦊 **Universal Cross-Browser Compatibility**:
  - Runs natively on **Google Chrome**, **Mozilla Firefox**, **Microsoft Edge**, and **Brave** from the exact same codebase.
  - Seamlessly handles Chrome's Service Worker runtime and Firefox's Gecko event page runtime via unified manifest declarations.
- 🚀 **Zero Runtime Dependencies**:
  - Pure native ES2024+ (`fetch`, `async/await`, CSS Grid, native `navigator.clipboard`).
  - Total bundle size is under 40 KB (eliminates obsolete 87 KB jQuery library).

---

## 📂 Repository Structure

```
IPTracer_extension/
├── manifest.json              # Cross-browser Manifest V3 (Chrome + Firefox)
├── package.json               # Developer scripts and native test configuration
├── CHROMEWEBSTORE.md          # Web Store listing metadata & privacy justifications
├── README.md                  # Project documentation & usage instructions
├── icons/                     # Standardized crisp PNG extension icons
│   ├── icon-16.png            # 16x16 Toolbar & favicon
│   ├── icon-32.png            # 32x32 Retina display icon
│   ├── icon-48.png            # 48x48 Extension manager icon
│   └── icon-128.png           # 128x128 Store showcase icon
├── background/
│   └── service-worker.js      # Universal background script (alarms, badge, watchdog)
├── popup/
│   ├── popup.html             # Semantic accessible dashboard layout
│   ├── popup.css              # Glassmorphic cyber theme with dark/light mode
│   └── popup.js               # Reactive event controller with optimistic rendering
├── services/
│   ├── ip-service.js          # Multi-provider failover IP & geolocation resolver
│   ├── storage-service.js     # Safe cross-browser storage abstraction layer
│   └── tab-service.js         # Active tab URL extractor & Cloudflare DoH resolver
├── scripts/
│   ├── generate-icons.js      # Zero-dependency procedural PNG icon generator
│   └── package-extension.js   # Universal ZIP packager for Chrome & Firefox
└── test/
    └── ip-service.test.js     # Automated unit tests using Node.js native test runner
```

---

## 🛠️ Installation & Setup

### 1. Load in Google Chrome / Chromium Browsers

1. Clone or download this repository.
2. Open Chrome and navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** and select the `IPTracer_extension` folder.
5. The IPTracer icon will appear in your Chrome toolbar. Pin it for quick access!

### 2. Load in Mozilla Firefox

1. Open Firefox and navigate to:
   ```
   about:debugging#/runtime/this-firefox
   ```
2. Click **Load Temporary Add-on...**
3. Select `manifest.json` inside the `IPTracer_extension` folder.
4. IPTracer will be loaded immediately with full Manifest V3 compatibility.

---

## 🚀 How to Use & See It in Action

### 1. Pin IPTracer to Your Toolbar
Keep IPTracer visible for instant network status:
- **Chrome / Brave / Edge**: Click the **puzzle piece icon (`🧩`)** in the top-right $\rightarrow$ click the **Pin (`📌`)** next to IPTracer.
- **Firefox**: Click the **puzzle piece icon (`🧩`)** $\rightarrow$ right-click **IPTracer** (or click the gear `⚙️`) $\rightarrow$ select **Pin to Toolbar**.

> 💡 **Country Code Badge**: Once loaded, IPTracer automatically displays a badge on the toolbar icon showing your current country code (e.g., `US`, `GB`, `IN`, `DE`).

### 2. Inspect Any Website in Real-Time
1. Open any website in your browser (e.g., `https://github.com`, `https://wikipedia.org`, or `https://cloudflare.com`).
2. Click the **IPTracer icon** in the toolbar to open the dashboard.
3. Switch between the two tabs at the top:

#### Perspective A: "My Client IP"
- **Your Public IP**: Displays your public IPv4 or IPv6 address.
- **Latency**: Measures round-trip ping time in milliseconds (e.g., `⚡ 28ms`).
- **Location & ISP**: Shows country flag, city, region, organization, and Autonomous System Number (ASN).
- **Actions**: Click **Copy** to copy your IP or **Map Preview** to open OpenStreetMap coordinates.

#### Perspective B: "Active Tab Host"
- **Server Domain**: Automatically extracts the domain from your active tab (e.g., `github.com`).
- **Resolved Server IP**: Resolves the hosting server's public IP using encrypted DNS-over-HTTPS (DoH).
- **Hosting Provider & Datacenter**: Discloses who hosts the site (e.g., `Fastly`, `Cloudflare`, `AWS`) and where that physical datacenter is located.
- **Actions**: Click **Copy** to copy the website server's IP address.

### 3. Background VPN Drop Watchdog
1. Connect or disconnect from your VPN.
2. The background sentinel will detect the egress IP shift.
3. You will receive an instant desktop alert:
   > **IPTracer: IP Address Changed**  
   > *Egress IP changed: 198.51.100.22 (United States) ➔ 203.0.113.45 (India)*
4. The toolbar country badge will immediately update.
5. Expand **IP Transition History** in the popup to review a timestamped log of your network changes.

---

## 🌐 Cross-Browser Architecture (Chrome & Firefox)

Modern browsers differ slightly in their Manifest V3 background script implementations:
- **Chromium (Chrome, Edge, Brave)** uses `background.service_worker`.
- **Gecko (Firefox)** uses `background.scripts` with `"type": "module"`.

IPTracer achieves 100% universal compatibility by configuring both targets in [`manifest.json`](manifest.json) alongside an API abstraction layer (`globalThis.browser || globalThis.chrome`):

```json
"background": {
  "service_worker": "background/service-worker.js",
  "scripts": ["background/service-worker.js"],
  "type": "module"
},
"browser_specific_settings": {
  "gecko": {
    "id": "iptracer@extension.local",
    "strict_min_version": "109.0"
  }
}
```

---

## 🧪 Running Automated Tests

Run the built-in test suite (requires Node.js 18+; no npm packages required):

```bash
npm test
```

Expected output:
```text
✔ IPService.isValidIPv4 validates correct and incorrect IPv4 addresses
✔ IPService.isValidIPv6 validates standard and compressed IPv6 addresses
✔ IPService.isPrivateIP correctly identifies bogon and private subnets
✔ IPService.getCountryFlagEmoji converts ISO 3166-1 alpha-2 codes
✔ IPService.normalizeIpData unifies ipapi and ipinfo payloads
✔ StorageService handles settings, caching and deduplicated history
✔ TabService.extractHostname parses standard and internal URLs
ℹ tests 7
ℹ pass 7
```

To re-generate PNG icons:
```bash
npm run generate-icons
```

---

## 🔒 Security & Privacy

- **Encrypted Transport**: All API requests utilize HTTPS endpoints (`ipapi.co`, `ipinfo.io`, `api.ipify.org`, `cloudflare-dns.com`).
- **No Data Harvesting**: No cookies, credentials, or personal telemetry are ever transmitted or stored on external servers.
- **Strict Content Security Policy**: Zero inline scripts; fully complies with Chrome and Firefox Manifest V3 requirements.

---

## 📄 License

MIT License. Developed and modernized by IPTracer contributors.
