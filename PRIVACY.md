# Privacy Policy for IPTracer

**Last Updated:** October 31, 2026

IPTracer ("we", "our", or "the extension") is a lightweight, privacy-respecting network inspector extension designed to provide users with transparent real-time telemetry about their public IP address, geolocation, network carrier/ISP, and active tab domain DNS resolution.

## 1. Data Collection & Processing

* **IP Address & Geolocation:** To display your public IP address, region, city, country, and ISP/ASN, the extension sends client-side HTTPS queries directly to trusted public IP telemetry providers (`ipapi.co`, `ipinfo.io`, and `api.ipify.org`). These requests are executed directly from your browser. We operate no intermediate logging servers or backends.
* **Active Tab Domain:** When the extension popup is opened, the active tab's hostname is inspected solely to perform DNS-over-HTTPS (DoH) lookups via `cloudflare-dns.com` for diagnostic display. Browsing history, URLs, and page content are never logged, tracked, or collected.
* **No Personally Identifiable Information (PII):** IPTracer does not collect names, email addresses, phone numbers, payment details, passwords, health data, or communications.

## 2. Local Storage

* All user settings (such as dark/light theme, refresh frequency, and VPN monitor alerts) and recent IP inspection history are stored strictly on your local device using `chrome.storage.local`.
* This data never leaves your browser and can be cleared at any time by clearing your browser data or uninstalling the extension.

## 3. Third-Party Services

IPTracer interacts with the following external endpoints solely to deliver core inspection functionality:
* `https://ipapi.co` & `https://ipinfo.io` (IP telemetry & geolocation)
* `https://api.ipify.org` (Public IP failover resolution)
* `https://cloudflare-dns.com` (Encrypted DNS resolution via DoH)

Please refer to the respective privacy policies of these third-party providers regarding standard web request server logging.

## 4. No Sale or Monetization of User Data

We do not sell, rent, monetize, or trade any user data, network information, or telemetry to data brokers, advertisers, or any third parties.

## 5. Contact & Source Code

IPTracer is fully open-source. You can review the complete source code, audit permissions, or report issues on GitHub:
https://github.com/Shivam-Jha96/IPTracer_extension
