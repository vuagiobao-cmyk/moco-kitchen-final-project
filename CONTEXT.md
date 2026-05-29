---
id: 20260513222000
aliases: ["MOCO Final Project Context", "Google AI Ecosystem MOCO Context"]
tags: ["#moco-kitchen", "#google-ai-bootcamp", "#context"]
created: 2026-05-13
updated: 2026-05-29
---

# CONTEXT — MOCO AI Creative & Operations Hub

> Snapshot trạng thái hiện tại của dự án cuối khóa Google AI Bootcamp 2026. File này dùng để resume nhanh giữa Codex, Antigravity và các phiên làm việc sau.


---

## 1. Trạng Thái Hiện Tại

- **Dự án:** MOCO AI Creative & Operations Hub
- **Thư mục:** `C:\Antigravity\AI_Command_Center\04_RnD_Lab\GOOGLE AI ECOSYSTEM K1-2026\Du_An_Cuoi_Khoa`
- **Ngày snapshot:** 2026-05-14 08:00 +07 (Phase 4 sign-off)
- **Branch hiện tại:** `main`
- **Lead:** @Manager_May | **QA:** @QA_Thanh

### Trạng thái Phase

| Phase | Trạng thái |
|-------|-----------|
| Phase 1-3 | ✅ DONE |
| Phase 4A Landing Page | ✅ DONE |
| Phase 4B NotebookLM | ✅ DONE (5/5 test queries PASS) |
| Phase 4C Chatbot | ✅ DONE — gemini-2.5-flash + API Key injected |
| Phase 4D Apps Script | ✅ DONE |
| Phase 5A Deploy Vercel | ✅ DONE — [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) |
| Phase 5B Documentation | ✅ DONE — README, CONTEXT, SIGNOFF, SLIDE, DEMO_SCRIPT |
| Phase 5C Thủ tục BTC | 🟡 Sếp thao tác — Bảng theo dõi, Kế hoạch 6 tuần |
| Phase 5D Slides & Video | 🟡 Sếp thao tác — Google Slides 15 trang |



---

## 2. Phase / Tuần Đã Chốt

### Phase 1 / Tuần 1 — Research & Project Framing

**Rating:** System Decision — Effective

Đã hoàn thành:

- Problem statement theo RCGC.
- Research thị trường bánh healthy và AI trong F&B marketing.
- Bổ sung citation/source log cho research.
- Cập nhật README để khớp cấu trúc phase hiện tại.

File chính:

- `1_Research/problem_statement_RCGC.md`
- `1_Research/deep_research_banh_healthy_vn.md`
- `README.md`

### Phase 2 / Tuần 2 — Knowledge Base & Content Engine

**Rating:** Pass with Comments

Đã hoàn thành ở mức nội bộ/demo có kiểm soát:

- Chuẩn hóa menu/product KB.
- Chuẩn hóa FAQ dinh dưỡng có tiếng Việt dấu.
- Sửa claim sức khỏe/allergen.
- Sửa Gem system prompt để tránh tư vấn y khoa.
- Tạo NotebookLM source manifest.
- Tạo QA sign-off Phase 2.

Điều kiện trước khi public/demo chính thức:

- Nạp lại các source V2 đã sửa vào NotebookLM (7 source).
- Chạy 5 test query V2 trong `2_Knowledge_Base/notebooklm_source_manifest.md`.
- Founder xác nhận công thức, khẩu phần, allergen và vận chuyển.
- Lưu screenshot/list 7 sources trong NotebookLM.

### Phase 2 / V2 Update — KB Rewrite Theo 7 Sản Phẩm Thật

**Ngày:** 2026-05-13

Đã rewrite toàn bộ 4 file KB theo công thức thật từ Google Sheet founder:
- `moco_menu_products.md` → V2: 7 SP, công thức chi tiết, allergen matrix
- `moco_faq_nutrition.md` → V2: FAQ theo 7 SP, bảng chất tạo ngọt, hạn bảo quản
- `gem_system_prompt_moco.md` → V2: 7 SP, từ vựng mới (chuối, quế, trứng muối, cà rốt)
- `moco_content_calendar_sample.md` → V2: 2 tuần mẫu + pipeline SP chưa cover
- `notebooklm_source_manifest.md` → V2: test query sửa theo SP thật

---

## 3. File Đã Sửa / Tạo Trong Phiên Codex

### Sửa

- `1_Research/deep_research_banh_healthy_vn.md` — bổ sung citation, source log, hạ claim thị trường/sức khỏe.
- `3_Content_Engine/gem_system_prompt_moco.md` — thêm guardrails y tế/allergen cho Gem.
- `README.md` — cập nhật cấu trúc `2_Knowledge_Base` và `3_Content_Engine`.

### Tạo mới

- `2_Knowledge_Base/notebooklm_source_manifest.md` — manifest 7 source, guardrails, test query, verdict Phase 2.
- `3_Content_Engine/PHASE2_QA_SIGNOFF_2026-05-13.md` — QA sign-off Phase 2.
- `3_Content_Engine/moco_menu_products.md` — menu/KB đã hạ rủi ro y tế và allergen.
- `3_Content_Engine/moco_faq_nutrition.md` — FAQ có dấu, tránh tư vấn y khoa.
- `3_Content_Engine/moco_content_calendar_sample.md` — content calendar mẫu có guardrails.
- `CONTEXT.md` — file snapshot này.

---

## 4. File Dirty Không Phải Codex Vừa Chạm Trong Phase 1/2

Các file sau đã dirty trước đó từ Antigravity, chưa được Codex chỉnh trong phiên Phase 1/2:

- `4_App_Automation/MOCO_COST_AUTO.gs`
- `4_App_Automation/MOCO_NHAP_HANG_V2.gs`
- `4_App_Automation/moco_web_app_call.js`

Không revert các file này nếu chưa có yêu cầu rõ.

---

## 5. NotebookLM / Google Sheet

### NotebookLM

- Notebook URL trong handoff Antigravity: `https://notebooklm.google.com/notebook/b7594329-7387-43fc-9a10-1a0d738b2e18`
- Codex chưa xác minh trực tiếp được NotebookLM vì không có NotebookLM MCP/CLI trong phiên.
- Việc cần làm tiếp: nạp lại source đã sửa và chạy test query.

### Google Sheet

- Link user cung cấp: `https://docs.google.com/spreadsheets/d/1_7XRYSsfxpyOwIgcovGyw3-0RLOqQULh/edit?gid=1880262502#gid=1880262502`
- Codex truy cập được public export của tab hiện tại.
- Tab hiện tại là form đăng ký cuối tuần 1 và đã gần như đầy đủ.
- Nội dung nên điền tiếp nếu có khu vực/tab kế hoạch: Phase 1 hoàn thành, Phase 2 Pass with Comments, link evidence vào manifest/sign-off.

---

## 6. Next Actions

**Phase 5A-5B đã hoàn tất (2026-05-22):**
- ✅ Deploy Vercel: [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)
- ✅ `vercel.json` — config deploy
- ✅ `README.md` — update link demo
- ✅ `CONTEXT.md` — snapshot mới nhất
- ✅ `PHASE4_SIGNOFF.md` — close hoàn toàn
- ✅ `PHASE5_SIGNOFF.md` — sign-off Phase 5
- ✅ `SLIDE_OUTLINE_TUAN6.md` — outline 15 slides
- ✅ `DEMO_SCRIPT.md` — kịch bản demo 5 phút
- ✅ `3_Creative_Content/` — visual concepts + video storyboard
- ✅ `_Assets/asset_manifest.md` — danh mục 13 ảnh AI
- ✅ `6_Deployment_Demo/` — URL + demo script
- ✅ `_Deliverables/GIT_WEEKLY_REPORT.md` — Báo cáo Git theo 6 tuần (55+ commits, 100+ files, 30,000+ dòng code)

**Còn lại (cần Sếp thực hiện):**
1. **Tạo Google Slides** từ `SLIDE_OUTLINE_TUAN6.md` (15 slides)
2. **Điền bảng theo dõi BTC** — xem `HANDOFF_THU_TUC_BANG_THEO_DOI.md`
3. **Dán link bảng cá nhân** vào bảng tổng lớp
4. **Dán link mã nguồn** — xem `_Deliverables/GIT_WEEKLY_REPORT.md` mục "Copy-Paste cho Bảng BTC"
5. **Test chatbot live** tại [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)
6. **Quay video demo** (nếu BTC yêu cầu)



---

## 7. QA Warning

@QA_Thanh: Không public chatbot như công cụ tư vấn sức khỏe. Chỉ demo là trợ lý tư vấn sản phẩm/FAQ. Mọi câu liên quan tiểu đường, mẹ bầu, dị ứng, trẻ nhỏ phải có disclaimer và khuyến nghị hỏi chuyên gia y tế.

---

## 8. Handoff Pointer

- Handoff file: `_Deliverables/HANDOFF_CODEX_PHASE1_PHASE2_2026-05-13.md`
- Checkpoint file: `.agent/checkpoints/session_2026-05-13.md`

