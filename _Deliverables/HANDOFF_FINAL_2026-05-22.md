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
| Phase 4A | Landing Page — 7 sections, dark theme, responsive | ✅ DONE | 2026-05-14 |
| Phase 4B | NotebookLM KB — 7 nguồn, 5/5 test PASS | ✅ DONE | 2026-05-14 |
| Phase 4C | Chatbot Gemini 2.5 Flash — guardrails y tế | ✅ DONE | 2026-05-14 |
| Phase 4D | Apps Script Content Generator (~400 dòng) | ✅ DONE | 2026-05-14 |
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
| 4 | **Banana Pro / ImageFX** | 13 ảnh sản phẩm AI cho Landing Page | assets/ folder |
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
├── 4_App_Automation/              ← MOCO_CONTENT_GEN.gs + deploy guide + ops scripts
├── 5_Landing_Page_Chatbot/        ← index.html, style.css, app.js, chatbot.js, assets/
├── 6_Deployment_Demo/             ← URL deploy, demo script 5 phút, 9 slide images
├── _Assets/                       ← Asset manifest (fonts, colors, 13 ảnh)
├── _Deliverables/                 ← Sign-offs, slide outline, test results, thủ tục BTC
├── CONTEXT.md                     ← Project snapshot (resume nhanh)
├── README.md                      ← Tổng quan dự án
└── HUONG_DAN_DU_AN_CUOI_KHOA.pdf ← Đề bài BTC
```

---

## 5. Thông Số Kỹ Thuật

### Landing Page
- **Stack:** HTML5 + Vanilla CSS + Vanilla JS (no framework)
- **Sections:** Hero (Bakerville-style typography), Products (7 SP, 2 dòng), Story, FAQ (5 câu), Testimonials (3 reviews carousel), Order (CTA), Footer
- **Design tokens:** `--bg-dark: #1a0030` | `--accent-gold: #e8c07a` | Fonts: Playfair Display, Quicksand, Pacifico
- **Features:** Glassmorphism cards, scroll animations (IntersectionObserver), floating hero elements (CSS keyframes), responsive mobile/tablet/desktop, lazy loading
- **Size:** 477 lines HTML (~30KB), ~25KB CSS, ~4.6KB app.js

### Chatbot
- **Model:** gemini-2.5-flash (chọn vì speed + cost)
- **API Key:** Hardcode trong chatbot.js line 11 (chỉ cho demo)
- **System Prompt V2:** Brand voice DNA — xưng "chúng mình", guardrails y tế bắt buộc
- **Features:** Conversation history (20 turns), suggestion chips, markdown rendering, typing indicator, error handling (429/quota)
- **Guardrails:** Tiểu đường → "hỏi bác sĩ" | Keto Tiramisu → cảnh báo rượu | Dị ứng → "liên hệ trước" | Không tuyên bố chữa bệnh
- **Size:** 198 lines JS (~8KB)

### Apps Script Content Generator
- **File:** MOCO_CONTENT_GEN.gs (~400 dòng)
- **Chức năng:** Điền brief trên Sheet → Bấm 1 nút → Gemini API → Output bài viết chuẩn brand voice + 3 idea ảnh
- **Sheets:** Brief / Output / Log (auto-setup)
- **API Key:** Lưu qua Script Properties (không hardcode)
- **Rate limit:** 1.5s delay giữa requests
- **5 loại template:** Product / Education / BTS / Review / Seasonal

### Operations Scripts (bonus, ngoài phạm vi khóa)
- `MOCO_COST_AUTO.gs` — Tự động tính chi phí
- `MOCO_NHAP_HANG_V2.gs` — Quản lý nhập hàng
- `MOCO_MASTER_NVL.gs` — Master nguyên vật liệu
- `MOCO_THU_CHI_AUTO.gs` — Thu chi tự động
- `MOCO_DASHBOARD.gs` — Dashboard tổng hợp

---

## 6. Quyết Định Kiến Trúc Quan Trọng

| # | Quyết định | Lý do |
|---|-----------|-------|
| 1 | Hybrid Option B + C (Content Creation + Smart Assistant) | Kết hợp cả 2 hướng đề bài mạnh nhất |
| 2 | gemini-2.5-flash thay vì Pro cho chatbot | Speed + cost tối ưu cho demo, output đủ tốt |
| 3 | Hardcode API Key trong chatbot.js | Demo purpose only — disable sau demo |
| 4 | Script Properties cho Apps Script API Key | Best practice bảo mật |
| 5 | Medical guardrails bắt buộc mọi AI output | Trách nhiệm thương hiệu — không tư vấn y khoa |
| 6 | No framework (Vanilla HTML/CSS/JS) | Landing page đơn giản, không cần React/Vue |
| 7 | NotebookLM sources upload thủ công | Không có API automation cho NLM |
| 8 | Dark theme (#1a0030) + warm gold (#e8c07a) | Nhất quán brand identity MOCO Kitchen |

---

## 7. Cảnh Báo & Lưu Ý

> ⚠️ **API Key bảo mật:** chatbot.js hardcode API Key. Sau demo → vào aistudio.google.com/apikey → disable key.

> ⚠️ **Chatbot KHÔNG phải công cụ tư vấn y tế.** Chỉ demo là trợ lý sản phẩm/FAQ. Mọi câu liên quan tiểu đường, mẹ bầu, dị ứng phải có disclaimer.

> ⚠️ **Bếp chung = nhiễm chéo.** Tất cả SP làm trong cùng bếp — allergen cross-contamination risk phải nêu rõ.

> ⚠️ **Keto Tiramisu có rượu** (rum, Baileys). Không phù hợp trẻ em, mẹ bầu, người kiêng cồn.

> ⚠️ **NotebookLM sources upload thủ công.** Nếu cần update KB, phải vào NLM và upload lại.

---

## 8. Việc Còn Lại (Sếp Thao Tác)

### Ưu tiên cao — Trước ngày demo
1. **Tạo Google Slides 15 trang** — Outline: `_Deliverables/SLIDE_OUTLINE_TUAN6.md` | Ảnh AI: `6_Deployment_Demo/slide_images/` (9 ảnh)
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
| 2026-05-15 | Landing Page polish — 13 ảnh AI, hero redesign, testimonials | Windows Antigravity |
| 2026-05-22 | Phase 5A-5B Done — Deploy Vercel + 9 slide images | Mac Antigravity |

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
