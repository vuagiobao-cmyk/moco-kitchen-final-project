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

Hệ thống AI tích hợp cho MOCO Kitchen — tiệm bánh Healthy online — gồm **2 trục: Creative (truyền thông) + Operations (vận hành)**:

```
TRỤC CREATIVE
[📚 Knowledge Base] → [🤖 Content Engine] → [🌐 Landing Page] → [💬 Chatbot]
   NotebookLM              Apps Script          HTML/CSS/JS         Gemini API

TRỤC OPERATIONS (Google Sheets + Apps Script)
[🧾 Nhập đơn (Form)] → [💰 Tính Cost theo công thức] → [📒 Thu-Chi tự động] → [📊 Dashboard]
   Order Form sidebar     Recipe→Cost + food cost %      Cashflow sync          KPI realtime
```

**Hybrid Option B + C:** Content Creation System + Smart Business Assistant — đúng tinh thần tên dự án "AI Creative **& Operations** Hub".

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
4_App_Automation/                 ← Tuần 4: Automation (2 nhánh)
  ── NHÁNH CREATIVE:
  └── MOCO_CONTENT_GEN.gs        ← Content generator 1-click (Gemini API + Sheets)
  └── APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md
  ── NHÁNH OPERATIONS (vận hành tiệm bánh):
  └── MOCO_COST_AUTO.gs          ← Tính cost theo công thức → food cost %, gợi ý giá bán
  └── MOCO_MASTER_NVL.gs         ← Master nguyên vật liệu (giá nhập chuẩn hóa)
  └── MOCO_NHAP_HANG_V2.gs       ← Quản lý nhập hàng + Order Form sidebar
  └── MOCO_THU_CHI_AUTO.gs       ← Thu-Chi tự động: đơn "Đã nhận tiền" → ghi THU
  └── MOCO_DASHBOARD.gs          ← Dashboard KPI (doanh thu, cost, lợi nhuận, top bánh)
  └── MOCO_Order_Form.html       ← Form nhập đơn (modeless dialog)
5_Landing_Page_Chatbot/           ← Tuần 5-6: Website + Chatbot (redesign Monte v3)
  └── index.html                 ← Landing page (9 section, layout Monte v3)
  └── style.css                  ← Matcha green theme (#355C3B), bề mặt phẳng + viền mảnh
  └── app.js                     ← Nav overlay, scroll reveal, FAQ accordion, marquee
  └── chatbot.js                 ← Gemini chatbot (gemini-2.5-flash) — gọi qua /api/chat
  └── api/chat.js                ← Serverless proxy (GEMINI_API_KEY qua Vercel env)
  └── vercel.json                ← Deploy config
  └── HANDOFF_LANDING_2026-05-29.md ← Bản mốc layout mới nhất (Monte v3)
3_Creative_Content/               ← Ảnh AI & Video concept
  └── visual_concepts.md         ← 13 ảnh AI đã generate
  └── video_storyboard_demo.md   ← Storyboard video Veo 3
_Assets/                          ← Asset manifest (fonts, colors, ảnh)
  └── asset_manifest.md          ← Danh mục assets (17 ảnh trong landing)
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
| Phase 4A | Landing Page (Monte v3, 9 section) | ✅ DONE |
| Phase 4B | NotebookLM — 5/5 test queries PASS | ✅ DONE |
| Phase 4C | Chatbot Gemini Integration | ✅ DONE |
| Phase 4D | Apps Script Content Generator | ✅ DONE |
| Phase 4E | **Operations Suite** (Cost / Đơn hàng / Thu-Chi / Dashboard) | ✅ DONE |
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

Chatbot gọi Gemini qua serverless function `api/chat.js` (an toàn, không hardcode key trong frontend):

1. Tạo API Key **miễn phí** tại [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Trên Vercel: **Project Settings → Environment Variables** → thêm `GEMINI_API_KEY = AIza...`
3. Redeploy (`vercel --prod`) → chatbot hoạt động
4. Local preview tĩnh sẽ hiển thị widget nhưng chat cần môi trường Vercel để gọi `/api/chat`

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
| **Target** | Người tiểu đường, ăn kiêng, mẹ bầu, người tập luyện, gia đình muốn ăn lành |
| **Brand voice** | Chân thành, tỉ mỉ, xưng "chúng mình" |
| **7 Sản phẩm** | Keto Tiramisu, Keto Lemon Cheesecake, Chuối Yến Mạch Choco, Bánh Mì Soda Nguyên Cám, Bông Lan Trứng Muối, Carrot Cake Kem Hy Lạp, Bánh Mì Cuộn Quế |

---

## Tham chiếu

- Brand assets: `03_My_Projects/Personal_Projects/Moco_Kitchen/`
- Khóa học: `04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/`
- Hướng dẫn đề bài: `HUONG_DAN_DU_AN_CUOI_KHOA_GOOGLE_AI_BOOTCAMP_2026_CES.pdf`

---

> ⚠️ **QA Note (@QA_Thanh):** Chatbot KHÔNG được public như công cụ tư vấn y tế. Chỉ demo là trợ lý tư vấn sản phẩm/FAQ. Mọi câu liên quan tiểu đường, mẹ bầu, dị ứng phải kèm disclaimer và khuyến nghị hỏi chuyên gia.
