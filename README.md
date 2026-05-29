---
id: "20260507180238"
aliases: ["MOCO Kitchen — AI Creative & Operations Hub"]
tags: ["#moco", "#google-ai"]
created: 2026-05-07
updated: 2026-05-16
---
# 🍰 MOCO Kitchen — AI Creative & Operations Hub

> Dự án cuối khóa Google AI Bootcamp 2026 (CES Global)  
> **Trạng thái:** Phase 1–5 hoàn thành ✅ | Demo: [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)

---

## 📌 Mô tả dự án

Hệ thống marketing AI tích hợp 4 tầng cho MOCO Kitchen — tiệm bánh Healthy online:

```
[📚 Knowledge Base] → [🤖 Content Engine] → [🌐 Landing Page] → [💬 Chatbot]
   NotebookLM              Apps Script          HTML/CSS/JS         Gemini API
```

**Hybrid Option B + C:** Content Creation System + Smart Business Assistant

---

## 🛠️ Google AI Tools (6/3 yêu cầu)

| # | Tool | Chức năng |
|---|------|-----------|
| 1 | **NotebookLM** | Knowledge base RAG — 7 nguồn, guardrails y tế |
| 2 | **Gemini Pro / API** | Content generation + Chatbot tư vấn |
| 3 | **Google Apps Script** | Automation: content gen từ Sheet → Gemini API |
| 4 | **Banana Pro / ImageFX** | Ảnh sản phẩm AI |
| 5 | **Veo 3** | Video demo sản phẩm |
| 6 | **Vercel / GitHub Pages** | Deploy landing page |

---

## 📁 Cấu trúc thư mục

```
1_Research/                       ← Tuần 1: Deep Research, problem statement
2_Knowledge_Base/                 ← Tuần 2: NotebookLM manifest, KB guardrails
3_Content_Engine/                 ← Tuần 2-3: System Prompt V2, menu, FAQ, content calendar
4_App_Automation/                 ← Tuần 4: Apps Script content generator
  └── MOCO_CONTENT_GEN.gs        ← Script chính (Gemini API + Google Sheets)
  └── APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md
5_Landing_Page_Chatbot/           ← Tuần 5: Website + Chatbot
  └── index.html                 ← Landing page (7 sections)
  └── style.css                  ← Dark theme, glassmorphism
  └── app.js                     ← Scroll effects, navigation
  └── chatbot.js                 ← Gemini chatbot (gemini-2.5-flash, API Key injected)
  └── vercel.json                ← Deploy config
3_Creative_Content/               ← Ảnh AI & Video concept
  └── visual_concepts.md         ← 13 ảnh AI đã generate
  └── video_storyboard_demo.md   ← Storyboard video Veo 3
_Assets/                          ← Asset manifest (fonts, colors, ảnh)
  └── asset_manifest.md          ← Danh mục 13 assets
_Deliverables/                    ← Deliverables chính thức
  └── PHASE4_SIGNOFF.md          ← Sign-off Phase 4
  └── PHASE5_SIGNOFF.md          ← Sign-off Phase 5 (Deploy)
  └── SLIDE_OUTLINE_TUAN6.md     ← Outline 15 slides thuyết trình
  └── PHASE4B_NOTEBOOKLM_TEST_RESULTS_2026-05-14.md
  └── THU_TUC_BANG_THEO_DOI_CA_NHAN.md
6_Deployment_Demo/                ← Demo & deploy artifacts
  └── README.md                  ← URL deploy + hướng dẫn
  └── DEMO_SCRIPT.md             ← Kịch bản demo 5 phút
CONTEXT.md                        ← Project snapshot (resume nhanh)
```

---

## 📊 Trạng thái Phase

| Phase | Nội dung | Trạng thái |
|-------|----------|-----------|
| Phase 1 | Research & Problem Statement | ✅ DONE |
| Phase 2 | Knowledge Base V2 (7 SP thật) | ✅ DONE |
| Phase 3 | Content Engine & System Prompt V2 | ✅ DONE |
| Phase 4A | Landing Page (4 files) | ✅ DONE |
| Phase 4B | NotebookLM — 5/5 test queries PASS | ✅ DONE |
| Phase 4C | Chatbot Gemini Integration | ✅ DONE |
| Phase 4D | Apps Script Content Generator | ✅ DONE |
| Phase 5A | Deploy Vercel | ✅ DONE |
| Phase 5B | Documentation & Deliverables | ✅ DONE |

---

## 🚀 Demo Live

> **🔗 [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)** — Deployed 2026-05-22

### Re-deploy (nếu cần cập nhật)
```bash
cd 5_Landing_Page_Chatbot
vercel --prod --yes
```

---

## 💬 Kích hoạt Chatbot

1. Tạo API Key **miễn phí** tại [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Mở `5_Landing_Page_Chatbot/chatbot.js` dòng 11
3. Thay `const API_KEY = ''` bằng `const API_KEY = 'AIza...'`
4. Reload trang → test chatbot

---

## 📚 File quan trọng

| File | Mục đích |
|------|---------|
| `CONTEXT.md` | Snapshot để resume nhanh |
| `3_Content_Engine/gem_system_prompt_moco.md` | System Prompt V2 — Brand Voice DNA |
| `4_App_Automation/MOCO_CONTENT_GEN.gs` | Apps Script Content Generator |
| `4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md` | Hướng dẫn deploy Script |
| `_Deliverables/HANDOFF_FINAL_2026-05-22.md` | Handoff tổng hợp duy nhất (thay thế 14 files cũ) |
| `_Deliverables/PHASE4_SIGNOFF.md` | Sign-off checklist Phase 4 |
| `_Deliverables/PHASE5_SIGNOFF.md` | Sign-off checklist Phase 5 (Deploy) |
| `_Deliverables/SLIDE_OUTLINE_TUAN6.md` | Outline slide thuyết trình 15 slides |
| `6_Deployment_Demo/DEMO_SCRIPT.md` | Kịch bản demo 5 phút |

---

## 🏷️ Brand info

| | |
|---|---|
| **Tên** | MOCO Kitchen |
| **Slogan** | "Heart-Healthy, Soul-Tasty" |
| **Ngành** | Bánh Healthy (online) |
| **Target** | Người tiểu đường, ăn kiêng, mẹ bầu, fitness, trẻ dị ứng |
| **Brand voice** | Chân thành, tỉ mỉ, xưng "chúng mình" |
| **7 Sản phẩm** | Keto Tiramisu, Keto Lemon Cheesecake, Chuối Yến Mạch Choco, Bánh Mì Soda Nguyên Cám, Bông Lan Trứng Muối, Carrot Cake Kem Hy Lạp, Bánh Mì Cuộn Quế |

---

## Tham chiếu

- Brand assets: `03_My_Projects/Personal_Projects/Moco_Kitchen/`
- Khóa học: `04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/`
- Hướng dẫn đề bài: `HUONG_DAN_DU_AN_CUOI_KHOA_GOOGLE_AI_BOOTCAMP_2026_CES.pdf`

---

> ⚠️ **QA Note (@QA_Thanh):** Chatbot KHÔNG được public như công cụ tư vấn y tế. Chỉ demo là trợ lý tư vấn sản phẩm/FAQ. Mọi câu liên quan tiểu đường, mẹ bầu, dị ứng phải kèm disclaimer và khuyến nghị hỏi chuyên gia.
