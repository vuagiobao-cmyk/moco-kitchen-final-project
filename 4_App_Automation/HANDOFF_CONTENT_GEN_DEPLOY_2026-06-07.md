---
id: "20260607130000"
aliases: ["MOCO Content Gen Deploy Handoff", "Handoff Content Automation 2026-06-07"]
tags: ["#moco-kitchen", "#apps-script", "#gemini-api", "#content-automation", "#handoff", "#clasp"]
created: 2026-06-07
updated: 2026-06-07
status: "✅ LIVE — Content Generator đã deploy & chạy được trên sheet vận hành MOCO"
---

# HANDOFF — MOCO Content Generator (Apps Script + Gemini) Deploy & Fix

> **Mục đích:** Ghi lại toàn bộ quá trình deploy thật + sửa lỗi của công cụ tự động viết content (Content Generator) chạy trong Google Sheet bằng Gemini API. Dùng tài liệu này để (1) hiểu hiện trạng, (2) tái triển khai sang sheet/dự án khác.
> **Phiên:** 2026-06-07 · @Manager_May điều phối · @Dev_An deploy · @QA_Thanh audit

---

## 1. Tóm tắt — đã làm được gì

- Phát hiện Content Generator (`MOCO_CONTENT_GEN.gs`) **trước đây chưa từng deploy live** (project Apps Script chỉ có 7 file vận hành, không có Content Gen).
- Đã **deploy thật** bằng `clasp` (không phải copy-paste tay) vào project Apps Script bound với sheet vận hành MOCO.
- Đã sửa loạt lỗi để công cụ chạy trọn vẹn: model, scope quyền, xung đột `onOpen`, token, thinking-mode cắt bài, retry khi model quá tải.
- **Kết quả:** Founder điền brief → bấm menu → ra bài Facebook/Instagram đầy đủ. ✅ Đã nghiệm thu.

---

## 2. Toạ độ hệ thống (IDs quan trọng)

| Thành phần | Giá trị |
|---|---|
| Google Sheet vận hành | `1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y` ("Bản sao của Moco Kitchen") |
| Apps Script scriptId (bound) | `1I5X8oe-A9ZEqvx1as3lLmGUFVHsnsW-GiAMWNzQG-CBArDWTbEE7x8ET` |
| Editor Apps Script | `https://script.google.com/d/1I5X8oe-A9ZEqvx1as3lLmGUFVHsnsW-GiAMWNzQG-CBArDWTbEE7x8ET/edit` |
| Tài khoản sở hữu (theo handoff cũ) | `vuagiobao@gmail.com` |
| Repo nguồn (SSOT code) | `04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/` |
| Bản sao thứ 2 (đã đồng bộ) | `03_My_Projects/Moco_Kitchen/4_App_Automation/` |

> ⚠️ `clasp` đã đăng nhập sẵn trên máy này (`~/.clasprc.json`), `.clasp.json` trong thư mục repo trỏ đúng scriptId trên → `clasp push` từ thư mục repo là đẩy thẳng lên live.

---

## 3. Quy trình vận hành cho Founder (sau khi đã setup)

```
[1] Mở sheet → trên menu có "🍰 MOCO Content AI"
[2] Tab "Content Brief": mỗi dòng 1 bài
    Sản phẩm | Loại bài | Đối tượng | Điểm nhấn | Ghi chú | Trạng thái = "Chờ xử lý"
[3] Menu → ✨ Generate Content
[4] Bài viết đầy đủ đổ vào tab "Content Output" (+ cột Idea ảnh)
[5] Nhật ký mỗi lần chạy ở tab "Generation Log"
```

- Model: `gemini-2.5-flash` (đồng bộ với chatbot landing).
- API key free: `aistudio.google.com/apikey`, lưu ở Script Properties `GEMINI_API_KEY`.

---

## 4. Các lỗi đã gặp & cách sửa (theo thứ tự thời gian)

| # | Triệu chứng | Nguyên nhân gốc | Cách sửa |
|---|---|---|---|
| 1 | Guide trỏ cài vào sheet thủ tục BTC | Sai ID sheet trong tài liệu | Sửa guide → sheet vận hành `1dZDkHL...` |
| 2 | Lệch model | Code hardcode `gemini-2.0-flash` trong khi chatbot dùng 2.5 | Đổi `GEMINI_API_URL` → `gemini-2.5-flash`, bump version 1.1 |
| 3 | Push sẽ vỡ menu vận hành | `MOCO_CONTENT_GEN` có `onOpen()` trùng với `onOpen()` của `MOCO_NHAP_HANG_V2` | Đổi `onOpen()` → `buildContentAiMenu_()`; gọi guarded từ `onOpen` chính |
| 4 | `❌ Lỗi`: "Các quyền không đủ để gọi UrlFetchApp.fetch" | Manifest khai báo cứng `oauthScopes` nhưng **thiếu** `script.external_request` | Thêm scope `script.external_request` vào `appsscript.json` |
| 5 | Cấp quyền không bật hộp / chạy `setupSheets` từ editor lỗi `getUi from this context` | Menu sheet không ép re-consent; `setupSheets` dùng `getUi()` không chạy được trong editor; không gọi API ngoài nên không kích hoạt scope | Thêm hàm `authorizeExternal()` (chỉ gọi `UrlFetchApp`, không `getUi`) → Run từ editor để ép hộp cấp quyền |
| 6 | Bài viết **cụt 1 câu** ("...Nỗi tr") | `gemini-2.5-flash` bật **thinking mode** mặc định, ăn hết 800 token output | `thinkingConfig: { thinkingBudget: 0 }` + nâng `maxOutputTokens` 800 → 2048 |
| 7 | 1 dòng `❌ Lỗi`: "model experiencing high demand" | Lỗi tạm thời phía Google (model quá tải) | Thêm retry tối đa 3 lần (chờ 2.5s→5s) cho 429/500/503/"high demand" + báo `finishReason` nếu rỗng |
| 8 | Founder lỡ xóa `MOCO_WEB_APP_TOKEN` | Thao tác nhầm | Khôi phục từ `moco_web_app.env` backup: `BcFR8yIva8C82b6DRnmE3Nf_4eJKQmzy3O3bCjmbZ7E` |

---

## 5. Hai bước Google BẮT BUỘC làm bằng tay (không tự động được)

clasp đẩy được **code**, nhưng 2 thứ này thuộc rào bảo mật Google, chỉ thao tác trong trình duyệt đăng nhập tài khoản chủ:

1. **Cấp quyền (OAuth consent):** Run hàm `authorizeExternal` từ Apps Script editor → "Xem xét quyền" → (Nâng cao → Đi tới...) → **Cho phép**. Cần làm lại mỗi khi `oauthScopes` đổi.
2. **Script Properties:** Thêm `GEMINI_API_KEY` (và giữ `MOCO_WEB_APP_TOKEN`). clasp KHÔNG set được Script Properties.

> Mẹo ép hộp cấp quyền: phải Run hàm **có gọi UrlFetchApp và KHÔNG gọi getUi** từ editor (đó là lý do tồn tại hàm `authorizeExternal`). Bấm menu trong sheet sẽ không ép re-consent.

---

## 6. Hướng dẫn TÁI TRIỂN KHAI sang sheet/dự án khác

Để bê công cụ này sang một Google Sheet khác (vd dự án khác):

1. **Lấy scriptId mới:** Mở sheet đích → Extensions → Apps Script → URL chứa scriptId, HOẶC tạo `.clasp.json` mới với scriptId đó.
2. **Chuẩn `.claspignore`** whitelist đúng các file cần đẩy (xem bản hiện tại — nhớ có `!MOCO_CONTENT_GEN.gs`).
3. **Xử lý xung đột `onOpen`:** nếu sheet đích đã có script với `onOpen()` riêng → KHÔNG để 2 `onOpen()`. Dùng pattern: 1 `onOpen()` chính gọi các hàm builder `buildXxxMenu_()` (guarded bằng `typeof ... === 'function'`).
4. **Manifest `appsscript.json`** phải có đủ scope:
   ```
   script.container.ui, spreadsheets, script.external_request
   ```
5. `clasp push --force` từ thư mục chứa code + `.clasp.json`.
6. Trên trình duyệt: Run `authorizeExternal` (cấp quyền) + thêm `GEMINI_API_KEY` vào Script Properties.
7. Trong sheet: F5 → menu 🍰 → Setup Sheets → điền brief → Generate.
8. **Tùy biến nội dung:** sửa `SYSTEM_PROMPT` (brand voice + danh mục sản phẩm) trong `MOCO_CONTENT_GEN.gs` cho thương hiệu mới.

---

## 7. Còn mở / nâng cấp đề xuất (chưa làm)

- [ ] Nối **Content Calendar**: thêm cột Ngày đăng/Kênh, sinh brief tự động từ lịch.
- [ ] Auto gửi draft qua **Gmail** sau mỗi lần generate.
- [ ] Nối **Idea ảnh** → workflow Banana Pro để có ảnh kèm bài.
- [ ] Cân nhắc gộp 2 bản code (`Du_An_Cuoi_Khoa` vs `03_My_Projects`) về 1 SSOT để khỏi maintain 2 nơi (hiện đã đồng bộ thủ công).

---

## 8. File đã đổi trong phiên này (repo, CHƯA commit git)

- `4_App_Automation/MOCO_CONTENT_GEN.gs` — model 2.5, `buildContentAiMenu_`, `authorizeExternal`, thinkingBudget=0, maxOutputTokens=2048, retry, check rỗng.
- `4_App_Automation/MOCO_NHAP_HANG_V2.gs` — gọi `buildContentAiMenu_()` guarded trong `onOpen`.
- `4_App_Automation/appsscript.json` — thêm scope `script.external_request`.
- `4_App_Automation/.claspignore` — whitelist `MOCO_CONTENT_GEN.gs`.
- `4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md` — sửa sheet đích.
- Bản `03_My_Projects/Moco_Kitchen/4_App_Automation/` — đồng bộ model + sheet.

---

## Related
- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[ANTIGRAVITY_HANDOFF_GOOGLE_SHEET_CONTROL]]
- [[DEPLOY_GUIDE]]
- [[lessons_learned]]
