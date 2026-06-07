---
id: "20260529114500"
aliases: ["MOCO Git Weekly Report", "Báo cáo Git theo tuần"]
tags: ["#moco-kitchen", "#google-ai-bootcamp", "#git-report"]
created: 2026-05-29
updated: 2026-05-29
---

# BÁO CÁO GIT THEO TUẦN — MOCO AI Creative & Operations Hub

> Tài liệu tổng hợp lịch sử Git commit theo 6 tuần triển khai dự án cuối khóa.
> Dùng để dán vào bảng theo dõi BTC hoặc đính kèm báo cáo tiến độ.

## Thông tin chung

| Mục | Nội dung |
|-----|----------|
| **Repository** | [moco-kitchen-final-project](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project) (Public) |
| **Branch chính** | `main` |
| **Thư mục dự án** | Thư mục gốc (Root) |
| **Thư mục bài tập** | `04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Buoi_*/` |
| **Người thực hiện** | Vũ Hoàng Phong |
| **Khóa học** | Google AI Bootcamp 2026 — CES Global |

> **Lưu ý:** Repository đã được cấu hình ở chế độ **Public** để BTC và Mentor có thể truy cập dễ dàng.

---

## Tuần 1 — Research & Project Framing (22/03 – 28/03/2026)

**Phase:** Khảo sát bài toán, xác định hướng dự án

### Nộp bài qua Google Classroom (không commit Git riêng)

Tuần 1 tập trung làm bài tập Buổi 1 (Gemini Foundation) trực tiếp trên Google Workspace. Nội dung bài tập đặt nền tảng cho toàn bộ dự án MOCO: xây dựng AI Trợ lý Marketing theo cấu trúc RCGC và Landing Page mẫu.

| Deliverable | Link |
|-------------|------|
| Google Doc nộp bài | [BÀI TẬP BUỔI 1](https://docs.google.com/document/d/18-pvOGLR6jSxo88NAczG9YiS0_eukKAlqEjXYTrVvJI/edit) |
| Gem (Trợ lý Marketing) | [Link Gem](https://gemini.google.com/gem/1tGlMB6dsuiY9c_vqFwTEh3sjPZG7BWnd?usp=sharing) |
| Canvas (Landing Page) | [Link Canvas](https://gemini.google.com/share/497bac3cbf4c) |

**Tóm tắt công việc:**
- Xây dựng System Prompt theo cấu trúc RCGC cho Trợ lý Marketing
- Tạo Mini Landing Page dịch vụ tư vấn Marketing AI
- Xác định hướng dự án cuối khóa: MOCO Kitchen — thương hiệu bánh healthy online

**File tham chiếu trong repo (commit sau):**
- `BAI_TAP_BUOI_1_GEMINI_FOUNDATION.md`
- `SO_TAY_LAM_BAI_TAP.md`

---

## Tuần 2 — Knowledge Base & Content Engine (29/03 – 05/04/2026)

**Phase:** Nghiên cứu NotebookLM, xây dựng kho kiến thức

### Git Link

| | |
|---|---|
| **Link GitHub (Dễ đọc)** | [Báo cáo Tuần 2](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Content_Engine/README.md) |
| **Commit đầu** | `b9b6b75` — feat(course): add Buoi_2 deliverables (04/04/2026) |
| **Commit cuối** | `52b4783` — vault: auto-sync 2026-04-05 |

### File khóa học thay đổi

| File | Mô tả |
|------|-------|
| `Buoi_2/buoi2_analysis.md` | Phân tích chuyên sâu bài tập NotebookLM |
| `Buoi_2/buoi2_deliverables.md` | Deliverables buổi 2 — Infographic + Slides |
| `Buoi_2/buoi2_infographic.html` | Infographic HTML bài tập |
| `Buoi_2/buoi2_slides.html` | Slides HTML bài tập |

**Tóm tắt công việc:**
- Thực hành NotebookLM: nạp tài liệu pháp lý, tạo infographic và slides tự động
- Nắm vững quy trình nạp nguồn → query → xuất artifact trên NotebookLM
- Kiến thức này áp dụng trực tiếp cho kho kiến thức MOCO ở tuần sau

---

## Tuần 3 — Creative Content & Visual Production (06/04 – 12/04/2026)

**Phase:** Thực hành tạo ảnh/video AI, xây dựng quy trình sáng tạo nội dung

### Git Link

| | |
|---|---|
| **Link GitHub (Dễ đọc)** | [Báo cáo Tuần 3](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Creative_Content/README.md) |
| **Commit chính** | `444d7e4` — feat(prompt): add GOOGLE AI K1-2026 Session 3 app workflow (11/04/2026) |

### File khóa học thay đổi

| File | Mô tả |
|------|-------|
| `Buoi_3/huong_dan_bai_tap_buoi3.md` | Bộ prompt ảnh/video AI cho thương hiệu café |
| `Buoi_3/App_Image_For_KeyVisual_SystemPrompt.md` | System prompt tạo Key Visual |
| `Buoi_3/Bai_Giang_Tang3_AI_Tools.txt` | Ghi chú bài giảng công cụ AI |

**Tóm tắt công việc:**
- Xây dựng bộ prompt tạo ảnh sản phẩm bằng Gemini Image Generation (Banana Pro)
- Thực hành Veo 3 Flow: tạo video 2 cảnh với Character Consistency
- Tạo bộ prompt templates — kiến thức nền cho việc gen 13 ảnh MOCO ở tuần sau
- Xây dựng System Prompt cho AI tạo Key Visual

---

## Tuần 4 — App Automation & Google Apps Script (13/04 – 20/04/2026)

**Phase:** Xây dựng automation, ứng dụng Apps Script vào vận hành

### Git Link

| | |
|---|---|
| **Link GitHub (Dễ đọc)** | [Báo cáo Tuần 4](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/4_App_Automation/README.md) |
| **Commit chính** | `b13bedf` — sync: OrderApp GAS Buoi 4 (13/04/2026) |

### File khóa học thay đổi (focus Buoi_4)

| File | Mô tả |
|------|-------|
| `Buoi_4/HUONG_DAN_LAM_BAI.md` | Hướng dẫn thực hiện bài tập Apps Script |
| `Buoi_4/BAI_HOC_QUAN_LY_DON_HANG.md` | Bài học quản lý đơn hàng |
| `Buoi_4/Bai1_Form_AutoEmail/Code.gs` | Google Form + Auto Email |
| `Buoi_4/Bai2_QuanLyKhoHang/Code.gs` | Hệ thống quản lý kho hàng |
| `Buoi_4/OrderApp_GAS/Code.gs` | App quản lý đơn hàng |
| `Buoi_4/OrderApp_GAS/Index.html` | Giao diện web app đơn hàng |
| `Buoi_4/OrderApp_GAS/CSS.html` | Styles cho web app |
| `Buoi_4/OrderApp_GAS/JavaScript.html` | Logic frontend web app |

**Tóm tắt công việc:**
- Xây dựng Google Form tự động gửi email xác nhận (Apps Script trigger)
- Xây dựng hệ thống quản lý kho hàng với cảnh báo tồn kho tự động
- Tạo Web App quản lý đơn hàng (HTML + GAS)
- Kiến thức Apps Script này được áp dụng trực tiếp vào MOCO Content Generator và MOCO Cost Automation ở tuần 5-6

---

## Tuần 5 — Xây dựng Core Features (21/04 – 07/05/2026)

**Phase:** Phase 1–2 MOCO — Research, Knowledge Base, Content Engine, Landing Page prototype

### Git Link

| | |
|---|---|
| **Link đọc trực tiếp** | [Website MOCO Kitchen (Vercel)](https://moco-kitchen-ai-hub.vercel.app) |
| **Commit chính** | `337e02e` — sync 2026-05-07: khởi tạo Du_An_Cuoi_Khoa |
| **Commit phụ** | `7f01de1` — Update Web Lab 5 (27/04/2026) |

### File MOCO mới tạo trong tuần

| File | Mô tả |
|------|-------|
| `Du_An_Cuoi_Khoa/README.md` | Tổng quan dự án MOCO Kitchen AI Hub |
| `1_Research/problem_statement_RCGC.md` | Bản mô tả bài toán theo RCGC |
| `1_Research/deep_research_banh_healthy_vn.md` | Nghiên cứu thị trường bánh healthy VN |
| `3_Content_Engine/gem_system_prompt_moco.md` | System Prompt V1 — Brand Voice DNA |
| `Buoi_5/index.html` | Landing Page prototype (Buổi 5) |
| `Buoi_5/style.css` | Styles cho Landing Page |
| `Buoi_5/script.js` | Logic frontend |

**Tóm tắt công việc:**
- Phân tích bài toán kinh doanh MOCO Kitchen (Problem Statement theo RCGC)
- Nghiên cứu thị trường bánh healthy Việt Nam (Deep Research)
- Xây dựng System Prompt V1 cho AI trợ lý MOCO — bộ "quy tắc giao tiếp" đầu tiên
- Tạo prototype Landing Page (Buổi 5)
- Khởi tạo cấu trúc thư mục dự án cuối khóa

**Số liệu:** 12 files mới, +4,615 dòng code

---

## Tuần 6 — Tích hợp, Deploy & Trình bày (08/05 – 22/05/2026)

**Phase:** Phase 3–5 MOCO — Content Engine V2, Apps Script Automation, Landing Page + Chatbot, Deploy Vercel, Documentation

### Git Link

| | |
|---|---|
| **Link GitHub (Dễ đọc)** | [Báo cáo Tuần 6](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/6_Deployment_Demo/README.md) |
| **Commit đầu** | `0e91a55` — feat: add MOCO inventory cleanup script (08/05/2026) |
| **Commit cuối** | `4490207` — syncout 2026-05-22 — Sign-off Phase 5 |

### Commits chính trong tuần (30+ commits)

| Ngày | Commit | Nội dung |
|------|--------|----------|
| 08/05 | `0e91a55` | MOCO inventory cleanup script |
| 08/05 | `41ae8fb` | MOCO sheet control handoff |
| 09/05 | `8528279` | MOCO V2 script, founder brief, sheet interaction rules |
| 09/05 | `828b63c` | Stabilize MOCO Google Sheet automation |
| 10/05 | `8a81da0` | MOCO handoffs for shoot and sheet work |
| 11/05 | `8534dec` | MOCO online bakery cost workflow |
| 11/05 | `787f5a3`→`5eef9bc`→`6ec861a` | Master NVL, import layout, purchase catalog |
| 11/05 | `e576645`→`27adf75`→`46f5abe` | Purchase name review sheet |
| 12/05 | `2aff0b0`→`69dec96` | Pricing dashboard, sub-recipe parsing |
| 13/05 | `125d0ca`→`f9ea8c9` | KB V2: rewrite 7 SP thật, QA sign-off Phase 2 |
| 14/05 | `553e3e7`→`aca153c` | NotebookLM test 5/5 PASS, Phase 4 features |
| 15/05 | `00e46e3` | Hero Bakerville redesign + layout cleanup |
| 16/05 | `dfdf95a` | Phase 5-6 completion + Codex remediation |
| 22/05 | `4490207` | Final syncout — Deploy Vercel + Documentation |

### File MOCO mới tạo/sửa (76 files, +24,563 dòng)

**Knowledge Base & Content Engine:**

| File | Mô tả |
|------|-------|
| `2_Knowledge_Base/notebooklm_source_manifest.md` | Manifest 7 nguồn NotebookLM |
| `3_Content_Engine/moco_menu_products.md` | Menu 7 SP thật, công thức chi tiết |
| `3_Content_Engine/moco_faq_nutrition.md` | FAQ dinh dưỡng V2 |
| `3_Content_Engine/moco_content_calendar_sample.md` | Lịch nội dung mẫu 2 tuần |
| `3_Content_Engine/moco_sample_posts_gem.md` | 5 bài mẫu content |
| `3_Content_Engine/gem_system_prompt_moco.md` | System Prompt V2 — guardrails y tế |
| `3_Content_Engine/PHASE2_QA_SIGNOFF_2026-05-13.md` | QA sign-off Phase 2 |

**Apps Script Automation (6 scripts, ~10,000+ dòng):**

| File | Mô tả |
|------|-------|
| `4_App_Automation/MOCO_CONTENT_GEN.gs` | Content generator 1-click |
| `4_App_Automation/MOCO_COST_AUTO.gs` | Automation giá nguyên liệu |
| `4_App_Automation/MOCO_MASTER_NVL.gs` | Master nguyên vật liệu |
| `4_App_Automation/MOCO_NHAP_HANG_V2.gs` | Nhập hàng V2 |
| `4_App_Automation/MOCO_THU_CHI_AUTO.gs` | Thu chi tự động |
| `4_App_Automation/MOCO_DASHBOARD.gs` | Dashboard tổng hợp |

**Landing Page & Chatbot (4 files):**

| File | Mô tả |
|------|-------|
| `5_Landing_Page_Chatbot/index.html` | Landing page Monte v3 (9 section) |
| `5_Landing_Page_Chatbot/style.css` | Matcha green theme (#355C3B), layout editorial |
| `5_Landing_Page_Chatbot/app.js` | Nav overlay, scroll reveal, FAQ, marquee |
| `5_Landing_Page_Chatbot/chatbot.js` + `api/chat.js` | Gemini chatbot (gemini-2.5-flash) qua serverless proxy |

**Creative Content:**

| File | Mô tả |
|------|-------|
| `3_Creative_Content/visual_concepts.md` | 13 ảnh AI đã generate |
| `3_Creative_Content/video_storyboard_demo.md` | Storyboard video Veo 3 |

**Deploy & Documentation:**

| File | Mô tả |
|------|-------|
| `5_Landing_Page_Chatbot/vercel.json` | Config deploy Vercel |
| `6_Deployment_Demo/DEMO_SCRIPT.md` | Kịch bản demo 5 phút |
| `_Deliverables/PHASE4_SIGNOFF.md` | Sign-off Phase 4 |
| `_Deliverables/PHASE5_SIGNOFF.md` | Sign-off Phase 5 |
| `_Deliverables/SLIDE_OUTLINE_TUAN6.md` | Outline 15 slides |
| `_Deliverables/HANDOFF_FINAL_2026-05-22.md` | Handoff tổng hợp |
| `CONTEXT.md` | Project snapshot |

**Tóm tắt công việc:**
- Rewrite toàn bộ KB theo 7 sản phẩm thật từ công thức founder
- Xây dựng System Prompt V2 với guardrails y tế (test 5/5 câu nhạy cảm PASS)
- 6 Apps Script automation cho Google Sheets (content gen, nhập hàng, thu chi, dashboard)
- Landing page responsive + Chatbot Gemini AI
- Tạo 13 ảnh sản phẩm bằng Banana Pro
- Deploy Vercel: [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)
- Hoàn thành documentation: README, CONTEXT, sign-off, slide outline, demo script

**Số liệu:** 76 files, +24,563 dòng code, 30+ commits

---

## Tổng hợp nhanh — Copy-Paste cho Bảng BTC

### Link mã nguồn (dán vào ô "Link mã nguồn" trong bảng BTC)

```text
https://github.com/vuagiobao-cmyk/moco-kitchen-final-project
(Public repo — chứa toàn bộ lịch sử 6 tuần dự án)
```

### Link Báo cáo/Sản phẩm theo tuần (dán vào cột evidence hoặc ghi chú)

```text
Tuần 1: Nộp qua Google Classroom — https://docs.google.com/document/d/18-pvOGLR6jSxo88NAczG9YiS0_eukKAlqEjXYTrVvJI/edit
Tuần 2 (Knowledge Base): https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Content_Engine/README.md
Tuần 3 (Creative Content): https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Creative_Content/README.md
Tuần 4 (App Automation): https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/4_App_Automation/README.md
Tuần 5 (Website Landing Page): https://moco-kitchen-ai-hub.vercel.app
Tuần 6 (Demo & Deployment): https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/6_Deployment_Demo/README.md
```

### Thống kê tổng

| Metric | Số liệu |
|--------|---------|
| Tổng commits liên quan MOCO | 55+ |
| Tổng files tạo/sửa | 100+ |
| Tổng dòng code thêm | 30,000+ |
| Thời gian triển khai | 6 tuần (22/03 – 22/05/2026) |
| Google AI Tools sử dụng | 6 (NotebookLM, Gemini, Apps Script, Banana Pro, Veo 3, Vercel) |
| Website live | [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) |

---

## Lưu ý về Repo

Repository `moco-kitchen-final-project` là **Public Repo** trên GitHub.
Để giúp Mentor đọc dễ dàng nhất, các link theo tuần ở trên đều dẫn trực tiếp đến file `README.md` của từng thư mục. Mentor click vào sẽ thấy ngay bài viết giải thích và link đến các file tài liệu liên quan mà không bị rối bởi danh sách file code.

---

## Related

- [[BTC_FORM_CONTENT_2026-05-22]]
- [[HANDOFF_THU_TUC_BANG_THEO_DOI]]
- [[CONTEXT]]
- [[README]]
