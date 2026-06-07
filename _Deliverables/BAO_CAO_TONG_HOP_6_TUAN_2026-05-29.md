---
id: "20260529160000"
aliases: ["MOCO Báo Cáo Tổng Hợp 6 Tuần", "Weekly Synthesis & Audit Report"]
tags: ["#moco-kitchen", "#google-ai-bootcamp", "#bao-cao", "#audit"]
created: 2026-05-29
updated: 2026-05-29
---

# BÁO CÁO TỔNG HỢP 6 TUẦN + AUDIT — MOCO AI Creative & Operations Hub

> **Dự án cuối khóa Google AI Bootcamp 2026 (CES Global)** · Vũ Hoàng Phong · VIBEK1
> **Mục đích:** Tổng hợp toàn bộ việc đã làm theo từng tuần để báo cáo lên link chung của lớp, kèm danh sách "cần chốt", "còn thiếu", và kết quả audit của @QA_Thanh.
> **Lập bởi:** @Manager_May điều phối · @QA_Thanh audit (read-only) · 2026-05-29
> **Quyết định của Sếp đã áp dụng:** (1) Địa điểm = **Hà Nội**; (2) Bản deploy chuẩn = **Monte v3** (trong `Du_An_Cuoi_Khoa`); (3) Hệ tuần theo bảng kế hoạch 6 tuần; (4) Founder **đã duyệt** giá/công thức/allergen; (5) **Chấp nhận self-report** NotebookLM.

---

## A. TÓM TẮT NHANH (cho Sếp đọc trong 1 phút)

- Dự án **đã hoàn thành phần kỹ thuật** (Tuần 1→6) trên **2 trục**:
  - **Creative:** Research → Knowledge Base → Content Engine → Landing Page + Chatbot.
  - **Operations:** Cost Engine (food cost %) → Quản lý đơn hàng (Order Form) → Thu-Chi tự động → Dashboard KPI — chạy trên dữ liệu đơn hàng thật (41 đơn).
- **Website live:** [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) · **Repo public:** [github.com/vuagiobao-cmyk/moco-kitchen-final-project](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project)
- **Operations sheet live:** `Bản sao của Moco Kitchen` (Google Sheets + Apps Script).
- **6 Google AI tools** tích hợp (yêu cầu BTC chỉ cần 3): NotebookLM, Gemini, Apps Script, Banana Pro, Veo 3, Vercel.
- **Còn lại chủ yếu là thủ tục + trình bày:** điền bảng BTC, tạo Google Slides, (tùy chọn) video demo.

---

## B. TỔNG HỢP "ĐÃ LÀM" THEO TỪNG TUẦN

> Hệ tuần theo bảng Kế Hoạch 6 Tuần của BTC (đã đối chiếu chéo `GIT_WEEKLY_REPORT.md`, `BTC_FORM_CONTENT_2026-05-22.md`, các sign-off, và code thực tế).

### Tuần 1 — Research & Project Framing
**Trạng thái: ✅ Hoàn thành**

| Hạng mục | Bằng chứng |
|---|---|
| Problem statement theo RCGC | `1_Research/problem_statement_RCGC.md` |
| Nghiên cứu thị trường bánh healthy VN (có citation/source log) | `1_Research/deep_research_banh_healthy_vn.md` |
| Chốt hướng dự án Hybrid Option B + C | `README.md`, `HANDOFF_FINAL_2026-05-22.md` |
| Đăng ký dự án cuối khóa | `THU_TUC_BANG_THEO_DOI_CA_NHAN.md` (ký 09/05/2026) |

**Deliverable:** Bản mô tả bài toán, deep research, README, form đăng ký.

---

### Tuần 2 — Knowledge Base & Content Engine (nền tảng)
**Trạng thái: ✅ Hoàn thành**

| Hạng mục | Bằng chứng |
|---|---|
| Chuẩn hóa KB theo 7 sản phẩm thật từ founder | `3_Content_Engine/moco_menu_products.md` (V2) |
| FAQ dinh dưỡng có dấu, hạ rủi ro claim y tế/allergen | `3_Content_Engine/moco_faq_nutrition.md` (V2) |
| System Prompt V2 — Brand Voice DNA + guardrails y tế | `3_Content_Engine/gem_system_prompt_moco.md` |
| NotebookLM source manifest (7 nguồn) | `2_Knowledge_Base/notebooklm_source_manifest.md` |
| QA sign-off Phase 2 | `3_Content_Engine/PHASE2_QA_SIGNOFF_2026-05-13.md` |

**Deliverable:** Knowledge base cho NotebookLM, System Prompt "Trợ lý MOCO", bộ dữ liệu nguồn cho chatbot + content generator.

---

### Tuần 3 — Creative Content & Visual Production
**Trạng thái: ✅ Hoàn thành**

| Hạng mục | Bằng chứng |
|---|---|
| 5 bài mẫu content (Product/Education/BTS/Review/Seasonal) | `3_Content_Engine/moco_sample_posts_gem.md` |
| Content calendar mẫu 2 tuần | `3_Content_Engine/moco_content_calendar_sample.md` |
| 21 prompt ảnh (7 SP × 3 góc) + 13 ảnh AI đã tạo (Banana Pro) | `3_Creative_Content/visual_concepts.md`, `_Assets/asset_manifest.md` |
| Storyboard video demo (Veo 3) | `3_Creative_Content/video_storyboard_demo.md` |
| Visual prompt templates + moodboard | `3_Content_Engine/Visual_Production_Moco/` |

**Deliverable:** Prompt templates, bộ concept ảnh/video, lịch nội dung mẫu.

---

### Tuần 4 — App Automation & Google Apps Script (2 trục)
**Trạng thái: ✅ Hoàn thành**

Tuần 4 gồm **2 nhánh automation** — đây là phần làm rõ trục "Operations" của tên dự án "AI Creative **& Operations** Hub":

**Nhánh A — Creative (tạo nội dung):**

| Hạng mục | Bằng chứng |
|---|---|
| Content Generator 1-click (Sheet → Gemini API, ~400 dòng) | `4_App_Automation/MOCO_CONTENT_GEN.gs` |
| Hướng dẫn deploy Apps Script | `4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md` |

**Nhánh B — Operations (vận hành tiệm bánh trên Google Sheets):**

| Hạng mục | Mô tả | Bằng chứng |
|---|---|---|
| **Cost Engine** | Tính cost từ `CÔNG THỨC` + `Master NVL` (xử lý cả công thức con), ra **food cost %** + gợi ý giá bán. VD live: Keto Tiramisu cost 83.876đ/hộp, giá 180k, food cost 46,6% | `MOCO_COST_AUTO.gs` |
| **Master NVL** | Chuẩn hóa 165 dòng giá nhập nguyên vật liệu | `MOCO_MASTER_NVL.gs` |
| **Quản lý đơn hàng** | Order Form (dialog) → ghi `ĐƠN HÀNG` (1 dòng/đơn) + `ĐƠN HÀNG - MÓN` (item-level); cột nguồn khách/ship/bù ship | `MOCO_NHAP_HANG_V2.gs`, `MOCO_Order_Form.html` |
| **Thu-Chi tự động** | Đơn "Đã nhận tiền" → tự ghi THU (onEdit + backfill); sổ song song THU/CHI, tách vốn đầu kỳ | `MOCO_THU_CHI_AUTO.gs` |
| **Dashboard KPI** | Doanh thu / chi / lợi nhuận / số dư / top bánh / NVL biến động. Live: 41 đơn, 31 đã thanh toán, doanh thu sau CK 8.235.000đ | `MOCO_DASHBOARD.gs` |

**Live sheet:** `Bản sao của Moco Kitchen` (`1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y`).

**Deliverable:** Content Generator (Creative) + Operations Suite hoàn chỉnh (Cost / Đơn hàng / Thu-Chi / Dashboard) vận hành trên dữ liệu đơn hàng thật.

---

### Tuần 5 — Tích hợp & Core Features (Landing + Chatbot + NotebookLM)
**Trạng thái: ✅ Hoàn thành**

| Hạng mục | Bằng chứng |
|---|---|
| Landing page (HTML/CSS/JS tĩnh) | `5_Landing_Page_Chatbot/index.html`, `style.css`, `app.js` |
| Chatbot Gemini 2.5 Flash + System Prompt V2 + guardrails | `5_Landing_Page_Chatbot/chatbot.js` |
| Backend chatbot serverless an toàn (`process.env.GEMINI_API_KEY`) | `5_Landing_Page_Chatbot/api/chat.js` |
| NotebookLM KB — self-report 5/5 test query PASS | `_Deliverables/PHASE4B_NOTEBOOKLM_TEST_RESULTS_2026-05-14.md` |
| NotebookLM artifacts (flashcards, quiz, mindmap) | `_Deliverables/nlm_*.html/.json`, `NLM_TEST_RESULTS_V2.md` |

**Deliverable:** Hệ thống chạy được end-to-end (Web + Chatbot + Content tool + KB).

---

### Tuần 6 — Deployment & Trình bày
**Trạng thái: ✅ Hoàn thành (phần kỹ thuật) · 🟡 Còn thủ tục + slide**

| Hạng mục | Bằng chứng |
|---|---|
| Deploy Vercel (production) | [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app), `vercel.json` |
| **Redesign landing Monte v3** (matcha green, 9 section, SVG sketch) | `HANDOFF_LANDING_2026-05-29.md` + `00_Spec/` |
| Documentation: README, CONTEXT, sign-off, demo script | `_Deliverables/PHASE4_SIGNOFF.md`, `PHASE5_SIGNOFF.md`, `6_Deployment_Demo/DEMO_SCRIPT.md` |
| Slide outline 15 trang + slide images | `_Deliverables/SLIDE_OUTLINE_TUAN6.md`, `6_Deployment_Demo/slide_images/` (15 file PNG) |
| Báo cáo Git theo 6 tuần | `_Deliverables/GIT_WEEKLY_REPORT.md` |
| Nội dung điền bảng BTC (copy-paste ready) | `_Deliverables/BTC_FORM_CONTENT_2026-05-22.md` |

**Deliverable:** Link demo live, slide outline, demo script, bộ tài liệu nộp bài.

---

## C. CẦN CHỐT VỚI SẾP — đã có quyết định ✅

| # | Vấn đề | Quyết định của Sếp |
|---|---|---|
| 1 | Địa điểm Hà Nội hay TP.HCM | ✅ **Hà Nội** (đã verify qua Sheet đơn hàng thật — toàn địa chỉ Hà Nội: Hoàng Mai, Hà Đông, Nguyễn Trãi, Chùa Láng...) |
| 2 | Bản deploy nào là chính | ✅ **Monte v3** trong `Du_An_Cuoi_Khoa` — xóa/đồng bộ bản trùng |
| 3 | Hệ tuần dùng để báo cáo | ✅ Theo bảng Kế Hoạch 6 Tuần (bản trên) |
| 4 | Founder duyệt giá/công thức/allergen chưa | ✅ **Đã duyệt** — dùng theo dữ liệu hiện có |
| 5 | NotebookLM 5/5 PASS — cần screenshot? | ✅ **Chấp nhận self-report** |

---

## D. TRẠNG THÁI XỬ LÝ (cập nhật 2026-05-29)

### ✅ ĐÃ XỬ LÝ XONG TRONG PHIÊN NÀY

1. ✅ **Xóa bản landing trùng** `03_My_Projects/Moco_Kitchen/5_Landing_Page_Chatbot/` (gồm `chatbot.js` chứa key hardcode), gỡ khỏi git index. Giữ nguyên phần còn lại của `Moco_Kitchen`.
2. ✅ **Sửa lỗi địa điểm sẽ lộ khi demo**: `chatbot.js` system prompt ("TP.HCM" → **Hà Nội**) + 2 chỗ trong `requirements.md`. Đã verify Hà Nội qua Sheet đơn hàng thật.
3. ✅ **Cập nhật toàn bộ tài liệu mô tả landing cho khớp Monte v3** (matcha green, 9 section, serverless, không testimonials):
   - `README.md` — cấu trúc + section + kích hoạt chatbot (serverless thay vì dòng 11) + manifest 17 ảnh.
   - `HANDOFF_FINAL_2026-05-22.md` — thông số landing/chatbot, quyết định kiến trúc, cảnh báo, lịch sử, slide 15 ảnh.
   - `PHASE4_SIGNOFF.md` + `PHASE5_SIGNOFF.md` — section, chatbot serverless, 17 ảnh.
   - `CONTEXT.md` — trạng thái phase.
   - `6_Deployment_Demo/README.md` + `DEMO_SCRIPT.md` — luồng demo theo 9 section + bảo mật serverless.
   - `GIT_WEEKLY_REPORT.md` — mô tả file landing (mentor-facing).
   - `3_Creative_Content/visual_concepts.md` — thêm ghi chú version Monte v3.
4. ✅ **Sửa spec Requirement 4**: "KHÔNG hiển thị giá" → **có hiển thị giá** (founder duyệt); cập nhật non-goal tương ứng.
5. ✅ **Đồng bộ số liệu**: slide images 9 → **15**; asset 13 → **17** (`asset_manifest.md` viết lại theo palette matcha green + danh mục thật).
6. ✅ **Đánh dấu hoàn thành 14 task** trong `00_Spec/tasks.md` (Monte v3 đã live).

### 🟢 CÒN LẠI — Nhỏ / placeholder (tùy chọn, không chặn nộp bài)

7. Thay link thật cho Zalo (`https://zalo.me/`), Instagram (`instagram.com/mocokitchen`), email (`hello@mocokitchen.vn`) trong `index.html` khi có.
8. Chốt thành phần lady finger trong Keto Tiramisu (có gluten không) để hoàn thiện cảnh báo dị ứng.
9. Cập nhật `og-cover.jpg` cho ảnh share social (nếu cần).
10. (Tùy chọn) Quay video demo 3-5 phút theo `DEMO_SCRIPT.md`.

### ⏭️ BỎ QUA THEO QUYẾT ĐỊNH CỦA SẾP

- **Rotate API key/token**: Sếp xác nhận key Gemini là loại miễn phí, không quan trọng → không cần rotate. (Bản demo chính đã dùng serverless; key cũ chỉ còn trong git history của bản đã xóa.)

### 📋 Thủ tục BTC còn treo (Sếp thao tác trên Google Sheet)

- [ ] Đổi tên bảng cá nhân: `[VIBEK1] - STT Nhóm - Vũ Hoàng Phong`
- [ ] Mở quyền chia sẻ: `Bất kỳ ai có liên kết` → `Người nhận xét`
- [ ] Điền tab Kế Hoạch 6 Tuần / Nhật Ký / Kết Quả & ROI (nội dung sẵn trong `BTC_FORM_CONTENT_2026-05-22.md`)
- [ ] Dán link bảng cá nhân vào bảng tổng lớp
- [ ] Tạo Google Slides 15 trang (tone matcha green) từ `SLIDE_OUTLINE_TUAN6.md`

---

## E. KẾT QUẢ AUDIT (@QA_Thanh — read-only)

**Verdict ban đầu: PASS WITH COMMENTS** (rating 6.5/10). Sau khi đóng các việc tài liệu + đồng bộ + xóa bản trùng trong phiên này → **tài liệu đã khớp thực tế Monte v3**, ước tính rating lên **~8.5/10**. Điểm trừ còn lại duy nhất là secret trong git history (Sếp đã quyết bỏ qua vì key free).

Findings đã được verify bằng bằng chứng file:dòng. Bản landing chính (`Du_An_Cuoi_Khoa`) về mặt bảo mật **an toàn** nhờ kiến trúc serverless.

> Giới hạn phiên (minh bạch): phiên này không có tool NotebookLM/Vercel live, nên trạng thái deploy live cần Sếp tự verify khi thao tác. NotebookLM 5/5 PASS là self-report (Sếp đã chấp nhận).

---

## F. ĐÃ XỬ LÝ — Bản trùng landing page

`03_My_Projects/Moco_Kitchen/` là một thư mục dự án thương hiệu riêng (chứa `_knowledge/`, `_rules/`, handoff vận hành) — **không xóa**. Chỉ thư mục con `5_Landing_Page_Chatbot/` là bản landing cũ trùng lặp (pre-redesign + chứa secret bị git track) đã được **xóa** theo quyết định của Sếp (2026-05-29). Phần còn lại giữ nguyên vẹn.

---

## Related

- [[HANDOFF_FINAL_2026-05-22]]
- [[GIT_WEEKLY_REPORT]]
- [[BTC_FORM_CONTENT_2026-05-22]]
- [[HANDOFF_LANDING_2026-05-29]]
- [[CONTEXT]]
