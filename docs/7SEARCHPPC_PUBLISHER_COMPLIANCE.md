# 7SearchPPC Publisher Usage Policy – Compliance Analysis

This document maps each section of the 7SearchPPC Publisher Terms to CineMind’s implementation and any actions you need to take.

---

## 1. Eligibility & Account Registration

| Requirement | CineMind status | Action |
|-------------|-----------------|--------|
| Create account on 7SearchPPC | Your responsibility | Ensure registration is complete and accurate. |
| Accurate, complete, up-to-date info about yourself and website(s) | Your responsibility | Use the exact, live website URL (e.g. `https://yoursite.com`). |
| Legally competent; no impersonation | Your responsibility | N/A in code. |

---

## 2. Publisher Verification & Account Eligibility

KYC, verification in portal only, no abuse of multiple accounts. **All on you** – no code changes.

---

## 3. Website Approval & Rejection Criteria

### 3.1 Rejection reasons (what they check)

| Criterion | Risk for CineMind | What to do |
|-----------|-------------------|------------|
| **Incomplete, inactive, or under construction** | Low | Ensure the site is live, all main pages load (Home, Privacy, Cookies, Terms, etc.), and there is no “Coming soon” as the main experience. |
| **Lacking sufficient organic traffic or fabricated traffic** | Possible | They don’t publish a number. If rejected, ask support what “sufficient” means. Do not use bots, paid traffic for ad views, or incentivized clicks. |
| **Violation of IP rights, regulations, or law** | Low | You use licensed/API content (e.g. TMDB, OMDb). Keep credits and terms as required. |

### 3.2 Prohibited categories (a–h)

None apply to CineMind (movie discovery, no adult, gambling, etc.). **No action.**

---

## 4. Ad Tags, Placement & Usage Rules

| Rule | When it applies | CineMind compliance |
|------|------------------|----------------------|
| **4.1** Ad tags only on approved sites | After approval | Once approved, place 7SearchPPC tags only on approved URLs. |
| **4.2** No modifying/obfuscating ad code | When you add their code | Do not alter, minify, or obfuscate 7SearchPPC scripts. |
| **4.3** No hidden iframes, auto-refresh, incentivized/paid traffic, malware, forced redirects | When ads are live | Do not: hide ads in iframes, auto-refresh ad units, use paid/incent traffic for ad views, or use deceptive redirects. |
| **4.4** They may audit | Always | N/A. |
| **4.5** Site must clearly display: | **Required for approval** | **Done in code.** |
| → Privacy Policy outlining **data usage and ad-serving practices** | Yes | Privacy page has Section 6 (Advertising) and a dedicated “Data usage and ad-serving” subsection. |
| → **Explicit cookie consent banner** (e.g. GDPR, UK-GDPR) | Yes | `CookieConsentBanner` at bottom with Accept/Decline and link to Cookie Policy. |

---

## 5. Traffic Requirements & Prohibited Activities

| Requirement | CineMind status |
|-------------|-----------------|
| No bots, click-exchanges, incentivized clicks, PTC | Don’t use these. You don’t. |
| No cloaking, spoofing, malware, counterfeit traffic | Don’t use. You don’t. |
| No misleading layout to encourage accidental clicks | Use clear ad labels and placement; no ads disguised as content. |
| No mass unsolicited email, forced redirects, spam | Don’t use. You don’t. |

When you add 7SearchPPC units, keep them clearly identifiable as ads and avoid any layout that could cause accidental clicks.

---

## 6. Payout Terms & Conditions

Payment schedule, thresholds, KYC, currency (USD). **Your responsibility** – no code impact.

---

## 7. Publisher Obligations

You confirm you own the site, won’t manipulate metrics, and won’t alter creatives/URLs. **Your responsibility.**

---

## 8–10, 12–18. Legal and Operational

Suspension, IP, non-circumvention, liability, indemnity, amendments, governing law, force majeure, post-termination review. **No code requirements** – comply as a publisher.

---

## 11. Data Protection, Privacy & Consent

Publishers must follow GDPR, CCPA, etc. **Each website must disclose:**

| Disclosure | Where it appears in CineMind |
|------------|------------------------------|
| **Data collection and usage practices** | Privacy Policy: Sections 1 (Information We Collect), 2 (How We Use Your Information), 3 (Data Sharing). |
| **Third-party advertising involvement** | Privacy: Section 6 (Advertising) and “Data usage and ad-serving”. Cookie Policy: “How We Use Cookies” includes “Advertising and tracking” and third-party cookies for ad networks. |
| **Cookie usage and tracking technology** | Cookie Policy: what cookies are, how we use them (essential, auth, preferences, analytics, performance, **advertising**), types (session, persistent, third-party including ad partners). Cookie consent banner links to Cookie Policy. |

**Implemented in code:** Privacy and Cookie pages plus cookie banner cover Section 11.

---

## Checklist before resubmitting to 7SearchPPC

- [ ] **Live, complete site** – No “under construction”; main flows work.
- [ ] **Privacy Policy** – Visible link (e.g. footer/settings). Includes data collection, use, and **ad-serving/data usage** (Section 6 + “Data usage and ad-serving”).
- [ ] **Cookie Policy** – Linked from footer and from cookie banner. Includes **advertising and tracking** and third-party ad partners.
- [ ] **Cookie consent banner** – Shown (e.g. on first visit), with Accept/Decline and “Learn more” to Cookie Policy.
- [ ] **Exact URL** – Submit the same domain they will review (e.g. `https://cinemind.tech` or your real domain).
- [ ] **No prohibited content** – No adult, gambling, etc.
- [ ] **After approval** – Place 7SearchPPC ad code only as provided; do not modify or hide it; no incentivized or non-organic traffic for ad views.

---

## If you’re rejected again

1. **Ask for specifics** – Email support (e.g. support@7searchppc.com): “Can you tell me which exact requirement our site did not meet (e.g. traffic, content, privacy, cookies)?”
2. **Traffic** – If the reason is “insufficient traffic,” you may need more organic users or to try again later.
3. **URL** – Confirm you’re submitting a **website** URL (not only an app store link). If the main product is an app, the approved property should still be a web URL where the policy and cookie banner are clearly visible.

This file is for your reference only. 7SearchPPC’s current terms on their site remain the source of truth.
