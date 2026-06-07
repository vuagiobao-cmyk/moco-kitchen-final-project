---
id: "20260522164200"
aliases: ["MOCO Final Handoff", "Handoff tổng hợp dự án cuối khóa"]
tags: ["#moco-kitchen", "#google-ai", "#handoff", "#final"]
created: 2026-05-22
updated: 2026-05-22
---

# HANDOFF TỔNG HỢP — MOCO AI Creative & Operations Hub

> **Dự án:** Dự án cuối khóa Google AI Bootcamp 2026 (CES Global)
> **Người thực hiện:** Vũ Hoàng Phong | KIWI Creative — Creative Director
> **Khóa/lớp:** Google AI Ecosystem K1-2026 / VIBEK1
> **Ngày handoff:** 2026-05-22
> **Trạng thái:** Phase 1–5 hoàn thành (phần kỹ thuật). Chờ slides + thủ tục BTC.

File này thay thế toàn bộ 14 handoff files cũ (2026-05-12 → 2026-05-15). Bất kỳ agent nào tiếp nhận dự án này chỉ cần đọc file này + `README.md` + `CONTEXT.md`.

---

## 1. Link Quan Trọng

| Tài nguyên | URL |
|------------|-----|
| **Landing Page (Live)** | [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) |
| **Vercel Dashboard** | [vercel.com/phong7890-6763s-projects/moco-kitchen-ai-hub](https://vercel.com/phong7890-6763s-projects/moco-kitchen-ai-hub) |
| **NotebookLM Notebook** | [notebooklm.google.com/notebook/b7594329-7387-43fc-9a10-1a0d738b2e18](https://notebooklm.google.com/notebook/b7594329-7387-43fc-9a10-1a0d738b2e18) |
| **Google Sheet (Bảng cá nhân BTC)** | [docs.google.com/spreadsheets/d/1_7XRYSsfxpyOwIgcovGyw3-0RLOqQULh](https://docs.google.com/spreadsheets/d/1_7XRYSsfxpyOwIgcovGyw3-0RLOqQULh/edit?usp=sharing&ouid=118398036921009252831&rtpof=true&sd=true) |
| **Google Sheet (Bảng tổng lớp)** | [docs.google.com/spreadsheets/d/1BkRm2fEeSOoN1QOi43_mFAxh_LybL_csUB0pFtBPGt4](https://docs.google.com/spreadsheets/d/1BkRm2fEeSOoN1QOi43_mFAxh_LybL_csUB0pFtBPGt4/edit?gid=1591482019#gid=1591482019) |
| **Google Sheet (Mẫu BTC)** | [docs.google.com/spreadsheets/d/1dHRKzwIiIvlv5NI6R7ua8adVFevJwt7E](https://docs.google.com/spreadsheets/d/1dHRKzwIiIvlv5NI6R7ua8adVFevJwt7E/edit) |
| **AI Studio API Key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Google Sheet (MOCO Operations)** | [docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE](https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit) |
| **Apps Script Project ID** | `1I5X8oe-A9ZEqvx1as3lLmGUFVHsnsW-GiAMWNzQG-CBArDWTbEE7x8ET` |

---

## 2. Trạng Thái Tổng Quan

| Phase | Nội dung | Trạng thái | Ngày hoàn thành |
|-------|----------|-----------|-----------------|
| Phase 1 | Research & Problem Statement (RCGC) | ✅ DONE | 2026-05-09 |
| Phase 2 | Knowledge Base V2 — 7 SP thật từ founder | ✅ DONE | 2026-05-13 |
| Phase 3 | Content Engine & System Prompt V2 | ✅ DONE | 2026-05-13 |
| Phase 4A | Landing Page — Monte v3, 9 section, responsive | ✅ DONE | 2026-05-14 (redesign 05-29) |
| Phase 4B | NotebookLM KB — 7 nguồn, 5/5 test PASS | ✅ DONE | 2026-05-14 |
| Phase 4C | Chatbot Gemini 2.5 Flash — guardrails y tế | ✅ DONE | 2026-05-14 |
| Phase 4D | Apps Script Content Generator (~400 dòng) | ✅ DONE | 2026-05-14 |
| Phase 4E | Operations Suite — Cost / Đơn hàng / Thu-Chi / Dashboard | ✅ DONE | 2026-05-28 |
| Phase 5A | Deploy Vercel — moco-kitchen-ai-hub.vercel.app | ✅ DONE | 2026-05-22 |
| Phase 5B | Documentation — README, CONTEXT, Signoff, Demo Script | ✅ DONE | 2026-05-22 |
| Phase 5C | Thủ tục BTC — Bảng theo dõi, Kế hoạch 6 tuần | 🟡 Sếp | |
| Phase 5D | Google Slides 15 trang + Video demo | 🟡 Sếp | |

---

## 3. Google AI Tools Sử Dụng (6/3 yêu cầu)

| # | Tool | Chức năng | Evidence |
|---|------|-----------|---------|
| 1 | **NotebookLM** | Knowledge Base RAG — 7 nguồn, guardrails y tế | 5/5 test PASS |
| 2 | **Gemini Pro / API** | Content generation + Chatbot tư vấn | chatbot.js + MOCO_CONTENT_GEN.gs |
| 3 | **Google Apps Script** | Automation: content gen từ Sheet → Gemini API | ~400 dòng code |
| 4 | **Banana Pro / ImageFX** | 17 ảnh sản phẩm/brand AI cho Landing Page | assets/ folder |
| 5 | **Veo 3** | Video demo concept (storyboard) | video_storyboard_demo.md |
| 6 | **Vercel** | Deploy landing page | moco-kitchen-ai-hub.vercel.app |

---

## 4. Cấu Trúc Thư Mục

```
Du_An_Cuoi_Khoa/
├── 1_Research/                    ← Problem statement (RCGC), deep research
├── 2_Knowledge_Base/              ← NotebookLM manifest, test queries
├── 3_Content_Engine/              ← System Prompt V2, menu, FAQ, calendar
├── 3_Creative_Content/            ← Visual concepts (13 ảnh), video storyboard
├── 4_App_Automation/              ← Creative: Content Gen | Operations: Cost/Đơn hàng/Thu-Chi/Dashboard
├── 5_Landing_Page_Chatbot/        ← index.html, style.css, app.js, chatbot.js, assets/
├── 6_Deployment_Demo/             ← URL deploy, demo script 5 phút, 15 slide images
├── _Assets/                       ← Asset manifest (fonts, colors, 17 ảnh landing)
├── _Deliverables/                 ← Sign-offs, slide outline, test results, thủ tục BTC
├── CONTEXT.md                     ← Project snapshot (resume nhanh)
├── README.md                      ← Tổng quan dự án
└── HUONG_DAN_DU_AN_CUOI_KHOA.pdf ← Đề bài BTC
```

---

## 5. Thông Số Kỹ Thuật

### Landing Page (Monte v3 — redesign 2026-05-29)
- **Stack:** HTML5 + Vanilla CSS + Vanilla JS (no framework)
- **Sections (9):** Brand Hero (vòng chữ xoay + sketch), Cake Hero (ảnh bánh + badge), Mood Light, Menu (card 3 cột, 2 dòng Keto/Healthy, **có giá**), Mood Green (Story), Gallery (Instagram mockup), FAQ (5 câu), Order (Zalo/IG/FB), Footer 3 cột
- **Design tokens:** `--color-primary: #355C3B` (matcha green) | `--color-accent: #C86F4E` | `--color-bg: #F8F4E9` (cream) | Fonts: Playfair Display, Quicksand, Pacifico
- **Features:** Layout editorial kiểu Monte Cafe, marquee chữ chạy, scroll reveal (IntersectionObserver), menu overlay full màn, FAQ accordion, sketch SVG inline, responsive, `prefers-reduced-motion`
- **Địa điểm:** Hà Nội — đặt đơn qua Zalo + Instagram + Facebook (không backend email)

### Chatbot
- **Model:** gemini-2.5-flash (chọn vì speed + cost)
- **Kiến trúc:** Frontend `chatbot.js` gọi serverless `api/chat.js`; key đọc từ `process.env.GEMINI_API_KEY` trên Vercel (KHÔNG hardcode trong frontend)
- **System Prompt V2:** Brand voice DNA — xưng "chúng mình", guardrails y tế bắt buộc
- **Features:** Conversation history (20 turns), suggestion chips, markdown rendering, typing indicator, error handling (429/quota)
- **Guardrails:** Tiểu đường → "hỏi bác sĩ" | Keto Tiramisu → cảnh báo rượu | Dị ứng → "liên hệ trước" | Không tuyên bố chữa bệnh

### Apps Script Content Generator
- **File:** MOCO_CONTENT_GEN.gs (~400 dòng)
- **Chức năng:** Điền brief trên Sheet → Bấm 1 nút → Gemini API → Output bài viết chuẩn brand voice + 3 idea ảnh
- **Sheets:** Brief / Output / Log (auto-setup)
- **API Key:** Lưu qua Script Properties (không hardcode)
- **Rate limit:** 1.5s delay giữa requests
- **5 loại template:** Product / Education / BTS / Review / Seasonal

### Operations Suite (Google Sheets + Apps Script) — TRỤC VẬN HÀNH CHÍNH THỨC

Đây là nửa "Operations" của dự án "AI Creative **& Operations** Hub" — quản lý vận hành thực tế của tiệm bánh trên Google Sheets, dùng dữ liệu đơn hàng thật.

- **`MOCO_COST_AUTO.gs` — Cost Engine:** đọc sheet `CÔNG THỨC` + `Master NVL`, tự tính cost nguyên liệu cho từng bánh (xử lý cả công thức con / sub-recipe), tính **food cost %**, gợi ý giá bán theo lãi mục tiêu. Có `COST REVIEW` để founder bổ sung giá tạm khi chưa có hóa đơn thật.
  - Ví dụ live: Keto Tiramisu — cost 156.777đ/mẻ, yield 2 hộp → 83.876đ/hộp, giá bán 180.000đ, **food cost 46,6%**.
- **`MOCO_MASTER_NVL.gs` — Master NVL:** chuẩn hóa giá nhập nguyên vật liệu (165 dòng nhập hàng), nguồn giá chuẩn cho cost engine.
- **`MOCO_NHAP_HANG_V2.gs` + `MOCO_Order_Form.html` — Quản lý đơn hàng:** Order Form (modeless dialog) nhập đơn → ghi `ĐƠN HÀNG` (1 dòng/đơn cho founder) + `ĐƠN HÀNG - MÓN` (item-level cho dashboard). Có cột nguồn khách (IG/Bạn/Threads), ship, bù ship.
- **`MOCO_THU_CHI_AUTO.gs` — Thu-Chi tự động:** khi đơn chuyển `Đã nhận tiền` → tự ghi dòng THU (onEdit trigger + backfill); layout sổ song song THU/CHI, vốn đầu kỳ tách khỏi doanh thu vận hành.
- **`MOCO_DASHBOARD.gs` — Dashboard KPI:** doanh thu, tổng chi, lợi nhuận ròng, số dư, top bánh bán chạy, NVL biến động giá, chi tiêu theo loại — tự cập nhật từ dữ liệu Sheets.
  - Snapshot live (41 đơn): tổng đơn 41, đã giao 31, đã thanh toán 31, doanh thu sau CK 8.235.000đ.
- **Live sheet:** `Bản sao của Moco Kitchen` (`1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y`).

---

## 6. Quyết Định Kiến Trúc Quan Trọng

| # | Quyết định | Lý do |
|---|-----------|-------|
| 1 | Hybrid Option B + C (Content Creation + Smart Assistant) | Kết hợp cả 2 hướng đề bài mạnh nhất |
| 2 | gemini-2.5-flash thay vì Pro cho chatbot | Speed + cost tối ưu cho demo, output đủ tốt |
| 3 | Hardcode API Key trong chatbot.js | ❌ Đã thay bằng serverless `api/chat.js` (env var) — an toàn hơn |
| 4 | Script Properties cho Apps Script API Key | Best practice bảo mật |
| 5 | Medical guardrails bắt buộc mọi AI output | Trách nhiệm thương hiệu — không tư vấn y khoa |
| 6 | No framework (Vanilla HTML/CSS/JS) | Landing page đơn giản, không cần React/Vue |
| 7 | NotebookLM sources upload thủ công | Không có API automation cho NLM |
| 8 | Matcha green (#355C3B) + cream (#F8F4E9) — layout Monte v3 | Nhất quán brand MOCO + tinh thần editorial Monte Cafe |

---

## 7. Cảnh Báo & Lưu Ý

> ⚠️ **API Key bảo mật:** Key Gemini đọc từ `GEMINI_API_KEY` trên Vercel env (serverless `api/chat.js`), KHÔNG hardcode trong frontend. Key là loại miễn phí của AI Studio.

> ⚠️ **Chatbot KHÔNG phải công cụ tư vấn y tế.** Chỉ demo là trợ lý sản phẩm/FAQ. Mọi câu liên quan tiểu đường, mẹ bầu, dị ứng phải có disclaimer.

> ⚠️ **Bếp chung = nhiễm chéo.** Tất cả SP làm trong cùng bếp — allergen cross-contamination risk phải nêu rõ.

> ⚠️ **Keto Tiramisu có rượu** (rum, Baileys). Không phù hợp trẻ em, mẹ bầu, người kiêng cồn.

> ⚠️ **NotebookLM sources upload thủ công.** Nếu cần update KB, phải vào NLM và upload lại.

---

## 8. Việc Còn Lại (Sếp Thao Tác)

### Ưu tiên cao — Trước ngày demo
1. **Tạo Google Slides 15 trang** — Outline: `_Deliverables/SLIDE_OUTLINE_TUAN6.md` | Ảnh AI: `6_Deployment_Demo/slide_images/` (15 ảnh)
2. **Test chatbot live** tại [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) — 3 queries
3. **Chụp screenshots** Landing Page, NotebookLM, Chatbot, Apps Script → chèn vào slides

### Ưu tiên trung bình — Thủ tục BTC
4. **Đổi tên bảng cá nhân:** `[VIBEK1] - STT Nhóm - Vũ Hoàng Phong`
5. **Mở quyền chia sẻ:** `Bất kỳ ai có liên kết` → `Người nhận xét`
6. **Điền tab Kế Hoạch 6 Tuần** — Nội dung copy-paste từ `_Deliverables/HANDOFF_THU_TUC_BANG_THEO_DOI.md`
7. **Điền tab Nhật Ký Thực Hiện** (tuần 3–5)
8. **Dán link bảng cá nhân** vào bảng tổng lớp
9. **Điền tab Kết Quả & ROI** (tuần 6, trước demo)

### Optional
10. **Quay video demo** 3–5 phút theo `6_Deployment_Demo/DEMO_SCRIPT.md`

---

## 9. Lịch Sử Phát Triển

| Ngày | Sự kiện | Nền tảng |
|------|---------|----------|
| 2026-05-07 | Khởi tạo dự án, chọn MOCO Kitchen | Mac |
| 2026-05-09 | Phase 1 Done — Research + Problem Statement | Mac → Windows |
| 2026-05-12 | Cross-machine sync Mac ↔ Windows | Mac + Windows |
| 2026-05-13 | Phase 2 Done — KB V2 rewrite (7 SP thật) | Windows Codex |
| 2026-05-13 | Phase 3 Done — Content Engine + System Prompt V2 | Windows Codex |
| 2026-05-14 | Phase 4A-4D Done — LP + NLM + Chatbot + Apps Script | Windows Antigravity |
| 2026-05-15 | Landing Page polish — ảnh AI, hero redesign | Windows Antigravity |
| 2026-05-22 | Phase 5A-5B Done — Deploy Vercel + 15 slide images | Mac Antigravity |
| 2026-05-29 | Landing redesign Monte v3 (matcha green, 9 section) + serverless chatbot | Antigravity |

---

## 10. Thông Tin Đăng Ký Dự Án

| Mục | Giá trị |
|-----|---------|
| Họ và tên | Vũ Hoàng Phong |
| Email | phong7890@gmail.com |
| Phòng ban | KIWI Creative — Thiết kế & Video Production |
| Chức danh | Creative Director |
| Tên dự án | MOCO AI Creative & Operations Hub |
| Phân loại | Content & Marketing |
| Mức ưu tiên | Rất cao |
| Thời gian/tuần | 6–8 giờ |
| Ngày ký cam kết | 09/05/2026 |

---

## 11. File Tham Chiếu Chính

| File | Mục đích |
|------|----------|
| `README.md` | Tổng quan dự án |
| `CONTEXT.md` | Snapshot trạng thái (resume nhanh) |
| `_Deliverables/PHASE4_SIGNOFF.md` | Sign-off Phase 4 |
| `_Deliverables/PHASE5_SIGNOFF.md` | Sign-off Phase 5 |
| `_Deliverables/SLIDE_OUTLINE_TUAN6.md` | Outline 15 slides thuyết trình |
| `_Deliverables/THU_TUC_BANG_THEO_DOI_CA_NHAN.md` | Checklist thủ tục BTC |
| `6_Deployment_Demo/DEMO_SCRIPT.md` | Kịch bản demo 5 phút |
| `3_Content_Engine/gem_system_prompt_moco.md` | System Prompt V2 — Brand Voice DNA |
| `4_App_Automation/MOCO_CONTENT_GEN.gs` | Apps Script Content Generator |
| `4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md` | Hướng dẫn deploy Apps Script |

---

*Handoff bởi @Manager_May — 2026-05-22. Thay thế toàn bộ 14 handoff files cũ (2026-05-12 → 2026-05-15).*
