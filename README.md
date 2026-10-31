# IPTracer 🌐⚡

> **A high-performance, privacy-focused Cross-Browser & Cross-Platform Extension (Microsoft Edge, Google Chrome, Mozilla Firefox, Android & iOS) for real-time client IP tracing, geolocation telemetry, active tab domain resolution, and background VPN drop monitoring.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-success.svg)
![Platform Support](https://img.shields.io/badge/platforms-Edge%20%7C%20Chrome%20%7C%20Firefox%20%7C%20Android%20%7C%20iOS-orange.svg)
![Edge Ready](https://img.shields.io/badge/Microsoft%20Edge-Partner%20Center%20Ready-0078D7.svg?logo=microsoftedge&logoColor=white)
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
  - Sleek, high-contrast dashboard with automatic system dark/light theme support and responsive mobile adaptation.
  - Crisp typography with monospace accents for IP addresses and network codes.
- 📱 **Universal Desktop & Mobile Compatibility**:
  - Runs natively on **Desktop** (Microsoft Edge, Google Chrome, Mozilla Firefox, Brave, Opera).
  - Runs on **Mobile** (Firefox for Android, Orion on iOS, and Safari on iOS/iPadOS).
  - Dedicated build profiles for **Microsoft Edge Add-ons**, **Chrome Web Store**, and **Mozilla Add-ons (AMO)**.
- 🚀 **Zero Runtime Dependencies**:
  - Pure native ES2024+ (`fetch`, `async/await`, CSS Grid, native `navigator.clipboard`).
  - Total bundle size is under 40 KB (eliminates obsolete 87 KB jQuery library).

---

## 📂 Repository Structure

```
IPTracer_extension/
├── manifest.json              # Universal Manifest V3 base configuration
├── package.json               # Developer scripts and native test configuration
├── CHROMEWEBSTORE.md          # Web Store listing metadata & privacy justifications
├── PRIVACY.md                 # Store-compliant Privacy Policy for Edge, Chrome & Firefox
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
│   └── package-extension.js   # Multi-target ZIP packager for Edge, Chrome & Firefox
└── test/
    └── ip-service.test.js     # Automated unit tests using Node.js native test runner
```

---

## 🛠️ Installation & Setup

### 1. Microsoft Edge (Desktop)

1. Open Microsoft Edge and navigate to:
   ```
   edge://extensions
   ```
2. Enable the **Developer mode** toggle in the left sidebar.
3. Click **Load unpacked** and select the `IPTracer_extension` folder.
   *(Alternatively, unpack and load the store-ready `dist/iptracer-edge.zip` archive).*
4. Click the puzzle piece (`🧩`) icon in Edge's toolbar and toggle **Show in toolbar** (`👁️`) next to IPTracer to pin it.

### 2. Google Chrome & Chromium Browsers (Brave, Opera, Vivaldi)

1. Open your browser's extensions page:
   - **Google Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked** and select the `IPTracer_extension` folder (or unpacked `dist/iptracer-chrome.zip`).
4. Pin the IPTracer icon to your toolbar for instant access.

### 3. Mozilla Firefox (Desktop)

1. Open Firefox and navigate to:
   ```
   about:debugging#/runtime/this-firefox
   ```
2. Click **Load Temporary Add-on...**
3. Select `manifest.json` inside the `IPTracer_extension` folder (or within `dist/iptracer-firefox.zip`).
4. IPTracer will load immediately with Gecko Manifest V3 support.

### 4. Android (Firefox for Android)

1. **Via Mozilla Add-ons (AMO)**: Once published, users on Firefox for Android can install IPTracer directly from the AMO listing page with one tap.
2. **Local Testing on Android**:
   - Open Firefox for Android (Nightly/Beta).
   - Go to **Settings** $\rightarrow$ **About Firefox** $\rightarrow$ Tap the Firefox logo 5 times to enable developer tools.
   - Under **Custom Add-on collection**, enter your collection ID containing IPTracer.

### 5. iOS / iPadOS

Mobile iOS browsers run extensions through two official methods:
- **Option A — Orion Browser on iOS (Direct)**: Install the [Orion Browser](https://browser.kagi.com/) from the App Store. Orion natively supports Chrome, Edge, and Firefox extensions on iOS. Download `iptracer-edge.zip` or open the store listing in Orion to install with one tap.
- **Option B — Apple Safari Web Extension (App Store)**: Convert the extension into a native iOS Safari App using Apple's official converter on macOS:
  ```bash
  xcrun safari-web-extension-converter /path/to/IPTracer_extension --ios-only
  ```
  Open the resulting Xcode project, sign with your Apple Developer Team, and run on your iPhone or submit to the iOS App Store.

---

## 🚀 How to Use & See It in Action

### 1. Pin IPTracer to Your Toolbar
Keep IPTracer visible for instant network status:
- **Microsoft Edge**: Click the **Extensions (`🧩`)** menu $\rightarrow$ click **Show in toolbar** (`👁️`) next to IPTracer.
- **Chrome / Brave**: Click the **Extensions (`🧩`)** menu $\rightarrow$ click the **Pin (`📌`)** next to IPTracer.
- **Firefox**: Click the **Extensions (`🧩`)** menu $\rightarrow$ right-click **IPTracer** (or click the gear `⚙️`) $\rightarrow$ select **Pin to Toolbar**.

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

## 🌐 Cross-Browser & Multi-Target Architecture

Modern browser engines differ in their Manifest V3 background script implementations and store ingestion validation rules:

| Target / Store | Background Type | `browser_specific_settings` | Package Output |
|---|---|---|---|
| **Microsoft Edge** (Partner Center) | `service_worker` (`type: module`) | ❌ Strict MV3 (Disallowed) | `dist/iptracer-edge.zip` |
| **Google Chrome** (Chrome Web Store) | `service_worker` (`type: module`) | Optional | `dist/iptracer-chrome.zip` |
| **Mozilla Firefox** (AMO & Android) | `scripts: [...]` (`type: module`) | ✅ Required (`gecko`, `gecko_android`) | `dist/iptracer-firefox.zip` |
| **Universal Release** (GitHub Releases) | `service_worker` (`type: module`) | Removed for Chromium safety | `dist/iptracer-v2.0.0.zip` |

### Automated Multi-Target Packaging

Build all store-tailored release packages with one command:
```bash
npm run package
```

The packaging pipeline (`scripts/package-extension.js`):
1. **Normalizes file paths** to standard forward-slashes (`/`), preventing ZIP header validation errors on Windows.
2. **Generates Microsoft Edge compliant manifests**: Enforces pure `service_worker` background and strips `browser_specific_settings` to prevent Edge Partner Center ingest errors.
3. **Generates Mozilla Firefox AMO compliant manifests**: Transforms the background entry to Gecko's `scripts` array and injects mandatory `data_collection_permissions` declarations.
4. **Builds four discrete ZIP distributions** in `dist/` ready for developer store upload and release deployment.

### Unified Runtime API Abstraction

All code components utilize an adaptive API abstraction layer (`globalThis.browser || globalThis.chrome`) ensuring seamless execution across Edge, Chrome, and Firefox without polyfills:

```javascript
// Cross-browser storage abstraction
const browserAPI = globalThis.browser || globalThis.chrome;
await browserAPI.storage.local.set({ [key]: value });
```

---

## 🧪 Running Automated Tests

Run the built-in test suite (requires Node.js 18+; zero external test frameworks needed):

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

To re-generate icons or rebuild distribution packages:
```bash
npm run generate-icons
npm run package
```

---

## 🔒 Security & Privacy

- **Store-Compliant Privacy Policy**: Fully documented in [PRIVACY.md](PRIVACY.md), compliant with the Microsoft Edge Partner Center Developer Agreement, Google Chrome Web Store Developer Program Policies, and Mozilla Add-on Policies.
- **Encrypted Transport**: All API requests utilize HTTPS endpoints (`ipapi.co`, `ipinfo.io`, `api.ipify.org`, `cloudflare-dns.com`).
- **No Data Harvesting**: No cookies, credentials, browsing history, or personal telemetry are collected, tracked, or transmitted off-device.
- **Strict Content Security Policy**: Zero inline scripts; fully complies with Manifest V3 security standards.

---

## 📄 License

MIT License. Developed and modernized by IPTracer contributors.
