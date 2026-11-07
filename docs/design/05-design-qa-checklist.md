# ZaminFlow Design QA Verification Checklist

**Document ID:** `DOC-DQA-001`  
**Review Target:** Frontend UI components & viewports  

---

| Item ID | Verification Area | Acceptance Criteria | Verified Status |
| :---: | :--- | :--- | :---: |
| **DQA-01** | Landing Navigation | Sticky pill navigation, active link underline, smooth anchor scrolling to `#company`, `#team`, `#stats`, `#contact`. | **Pass** |
| **DQA-02** | Dark Mode Toggle | Toggles entire page between light mint/white and deep dark navy (`#0A1926`), preserving contrast. | **Pass** |
| **DQA-03** | Team Carousel | Horizontal smooth scroll, progress bar tracking position, accessible $\ge 44\text{px}$ social targets, authentic team photos. | **Pass** |
| **DQA-04** | Auth Screen Headers | Sign in header strictly reads "Sign in to ZaminFlow"; Sign up header reads "Create your account". | **Pass** |
| **DQA-05** | Role Selector (Sign up)| Three mutually exclusive public pills: `Farmer`, `Dairy Industry`, `Driver`. `Admin` strictly excluded. | **Pass** |
| **DQA-06** | Farmer Dashboard | Quick overview KPI cards, active batches list, mobile responsive cards without horizontal scroll. | **Pass** |
| **DQA-07** | Dairy Dashboard | Silo capacity progress bar, cold-chain live intake table, escrow funding balance glanceable. | **Pass** |
| **DQA-08** | Driver Dashboard | High contrast status chips, one-handed touch targets, route overview at 360px without header overflow. | **Pass** |
| **DQA-09** | Admin Dashboard | KYB review queue with document counter, platform trade volume, arbitration status table. | **Pass** |
| **DQA-10** | Empty & Loading States| Consistent skeletons during data load; friendly empty states with action buttons when lists are empty. | **Pass** |
