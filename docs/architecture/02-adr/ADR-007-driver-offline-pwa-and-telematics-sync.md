# ADR-007: Mobile Strategy, Driver Offline PWA and Cold-Chain Telematics Architecture

**Status:** Approved  
**Date:** 2026-11-08  
**Squad:** GIS & Mobile Specialist, Frontend Specialist, Security Engineer  

---

## 1. Context and Problem Statement

ZaminFlow requires a mobile solution for two distinct user types in Uzbekistan:
1. **Farmers:** Smallholder dairy producers operating low-cost Android smartphones in rural areas with 2G/3G connectivity.
2. **Drivers:** Logistics operators driving refrigerated milk tankers through remote agricultural valleys with frequent zero-connectivity zones, requiring GPS navigation, QR custody handover, and continuous cold-chain temperature verification.

Mobile browsers (Chrome/Safari) impose strict battery and memory throttling on background processes:
- Web browsers suspend or throttle JavaScript timers and Geolocation polling when the screen turns off or the tab is backgrounded.
- A driver cannot be expected to keep their phone screen active and unlocked for an entire 6-hour collection circuit without overheating the device or causing battery drain.

---

## 2. Decision Drivers

- **Reliability:** Custody handover at the farm gate must work 100% of the time, even when completely offline.
- **Cold-Chain Audit Integrity:** Milk quality is legally determined by maintaining $\le 4.0^\circ\text{C}$ throughout transit. Temperature records must be continuous and tamper-resistant.
- **Time to Market & Budget:** Maintaining separate native Swift (iOS) and Kotlin (Android) codebases alongside Next.js creates triple maintenance overhead.

---

## 3. Considered Options

1. **Option 1: Pure Responsive Web App (No Offline)**
   - *Fails:* Breaks immediately when driver enters a rural cellular dead zone.
2. **Option 2: Native Android / iOS Apps for Drivers & Farmers**
   - *Drawback:* Expensive, slow release cycle, separate app store review cycles.
3. **Option 3: Progressive Web App (PWA) with Offline ServiceWorker + Hardware Telematics Loggers (Selected)**
   - Build high-contrast PWA for drivers and farmers with ServiceWorker caching and IndexedDB store-and-forward.
   - Decouple background vehicle telematics: use dedicated onboard IoT hardware loggers (Teltonika / Ruptela) installed in the tanker refrigeration unit to record temperature and GPS continuously.

---

## 4. Decision

We adopt **Option 3: Progressive Web App with Hardware IoT Decoupling**.

1. **Frontend PWA:**
   - Manifest: `standalone` display mode, service worker caching static assets and API schemas.
   - IndexedDB store: captures offline pickup timestamps, dipstick volume measurements, and signature vectors.
   - Background Sync API: dispatches queued pickups immediately upon network reconnection.
2. **Logistics Telematics:**
   - In-cab mobile app provides route waypoint instructions and farm-gate QR handover.
   - Autonomous hardware tracker on the tanker refrigeration compartment logs continuous temperature curves ($T \le 4.0^\circ\text{C}$) to backend MQTT/HTTP telematics ingest independently of the driver's phone.

---

## 5. Consequences

- **Positive:**
  - Zero app store friction; updates deploy instantly with the web app.
  - Driver can complete entire morning collection circuit without internet access.
  - Cold-chain compliance is verified by tamper-resistant hardware rather than vulnerable phone sensors.
- **Negative / Trade-offs:**
  - Initial setup of service workers and IndexedDB sync requires thorough regression testing.
