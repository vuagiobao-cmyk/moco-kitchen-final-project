---
id: "20260607160000"
aliases: ["MOCO Review Index 2026-06-07", "Mục lục review Content Automation"]
tags: ["#moco-kitchen", "#review", "#index", "#handoff", "#apps-script", "#gem"]
created: 2026-06-07
updated: 2026-06-07
status: "✅ Đã deploy + push remote — chờ Sếp review & nghiệm thu live"
---

# 📑 MỤC LỤC REVIEW — MOCO Content Automation (2026-06-07)

> Tổng hợp toàn bộ việc đã làm trong phiên 2026-06-07 để Sếp review một lượt.
> Branch: `sync/phong-20260518-083837` · Đã push remote · @Manager_May điều phối, @Dev_An code, @QA_Thanh audit.

---

## 1. Tóm tắt 1 dòng

Deploy Content Generator live → thêm Lịch nội dung + prompt ảnh Banana Pro → tạo Gem gen ảnh đúng brand → gộp code về 1 SSOT → commit & push.

---

## 2. Commit để review (mới nhất → cũ)

| Commit | Nội dung | Trạng thái |
|---|---|---|
| `e8e255e5` | Gem "MOCO Visual Art Director" gen ảnh đúng brand | Cấu hình — chờ Sếp tạo Gem trên Gemini |
| `3f315698` | Gộp Apps Script về 1 SSOT ở `Du_An_Cuoi_Khoa` | ✅ Xong (có README pointer ở bản 03) |
| `b1bdd354` | Content Calendar + Banana Pro image-prompt | ✅ Đã clasp push live |
| `772ed271` | Deploy Content Generator (Gemini 2.5-flash) | ✅ Live, founder đã nghiệm thu |

Xem diff: `git show <hash>` hoặc `git log -p 772ed271^..e8e255e5`.

---

## 3. File cần review (theo chức năng)

### A. Content Generator + Lịch nội dung + Banana (SSOT)
`Du_An_Cuoi_Khoa/4_App_Automation/`
- `MOCO_CONTENT_GEN.gs` — generator gốc (đã sửa menu thêm submenu Lịch + mục Banana).
- `MOCO_CONTENT_CALENDAR.gs` — **MỚI**: sheet Content Calendar, đẩy lịch→Brief, sinh prompt ảnh Banana Pro.
- `appsscript.json` — scope `script.external_request`.
- `.claspignore` — whitelist file mới.
- `APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md` — hướng dẫn (đã thêm mục Calendar / Banana / Gem).
- `HANDOFF_CONTENT_GEN_DEPLOY_2026-06-07.md` — handoff gốc của phiên deploy.

### B. Gem gen ảnh
`Du_An_Cuoi_Khoa/3_Creative_Content/`
- `MOCO_VISUAL_GEM_CONFIG.md` — **MỚI**: instruction copy-paste để tạo Gem trên Gemini.

### C. Gộp SSOT
`03_My_Projects/Moco_Kitchen/4_App_Automation/`
- Đã xoá 13 file code/clasp trùng → thay bằng `README_SSOT_POINTER.md` (giữ `.md` lịch sử + `.env`).

---

## 4. Luồng vận hành end-to-end (sau nâng cấp)

```
Content Calendar (lịch: Ngày đăng, Kênh, SP, Loại bài...)
   │ menu → 📅 Đẩy sang Brief (toàn bộ / đến hạn hôm nay)
   ▼
Content Brief  → ✨ Generate Content (Gemini 2.5-flash)
   ▼
Content Output (bài viết + Idea ảnh)
   │ menu → 🎨 Tạo prompt ảnh Banana Pro
   ▼
Cột "Banana Pro Prompt" (EN)
   │ copy → Gem "MOCO Visual Art Director" trên Gemini
   ▼
Ảnh đúng nhận diện Moco + prompt EN tái lập
```

---

## 5. Checklist nghiệm thu (Sếp/QA chạy thử live)

- [ ] F5 sheet "Bản sao của Moco Kitchen" → thấy menu `🍰 MOCO Content AI` có submenu `📅 Lịch nội dung` + mục `🎨 Tạo prompt ảnh Banana Pro`.
- [ ] Chạy `📅 → 🆕 Setup Content Calendar` → có sheet "Content Calendar" + dropdown.
- [ ] Điền 1 dòng lịch → `➡️ Đẩy ... sang Brief` → dòng xuất hiện ở Content Brief, lịch đánh dấu "✅ Đã đẩy".
- [ ] `✨ Generate Content` → ra bài ở Content Output.
- [ ] `🎨 Tạo prompt ảnh Banana Pro` → cột G "Banana Pro Prompt" có prompt EN.
- [ ] Tạo Gem trên Gemini theo `MOCO_VISUAL_GEM_CONFIG.md` → dán prompt → ảnh đúng style.

---

## 6. Việc còn mở

- [ ] Tạo Gem trên Gemini (thủ công, không tự động được — cần tài khoản Sếp).
- [ ] Test live toàn luồng Calendar/Banana (chưa test, mới qua syntax check + clasp push OK).
- [ ] WIP landing tối qua (`5_Landing_Page_Chatbot/chatbot.js`, `index.html`, `HANDOFF_LANDING_2026-05-29.md`) vẫn dirty — chưa commit, chờ Sếp quyết.
- [ ] (Đề xuất cũ) Auto gửi draft qua Gmail; nối Idea ảnh tự động sang ảnh.

---

## Related
- [[HANDOFF_CONTENT_GEN_DEPLOY_2026-06-07]]
- [[MOCO_VISUAL_GEM_CONFIG]]
- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[README_SSOT_POINTER]]
