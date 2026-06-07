---
id: 20260514073400
aliases: ["MOCO Content Gen Deploy Guide", "Apps Script Content Generator Guide"]
tags: ["#moco-kitchen", "#apps-script", "#gemini-api", "#phase4d"]
created: 2026-05-14
updated: 2026-05-14
---

# Deploy Guide — MOCO Content Generator (Apps Script)

> **Script:** `MOCO_CONTENT_GEN.gs`  
> **Phase:** 4D — Apps Script Content Generator  
> **Mục tiêu:** Tự động sinh bài viết Facebook/Instagram cho MOCO Kitchen bằng Gemini AI trực tiếp trong Google Sheets

---

## 1. Lấy API Key (Miễn phí)

1. Truy cập **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)** — đăng nhập bằng bất kỳ tài khoản Google nào
2. Bấm **"Create API key"**
3. Copy key dạng `AIzaSy...`
4. Lưu key — **không chia sẻ, không commit lên Git**

> **Quota miễn phí:** ~60 requests/phút với `gemini-2.5-flash` — đủ dùng thoải mái cho demo

---

## 2. Cài Script vào Google Sheets MOCO

### Bước 1: Mở Google Sheet MOCO Kitchen

> ⚠️ **Cài vào sheet vận hành MOCO** (`Bản sao của Moco Kitchen`) — KHÔNG cài vào sheet thủ tục nộp bài của lớp.

```text
https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit
```

### Bước 2: Mở Apps Script Editor

```
Extensions → Apps Script
```

### Bước 3: Tạo file script mới

- Trong Apps Script Editor, bấm **"+"** bên cạnh "Files"
- Chọn **"Script"**
- Đặt tên: **`MOCO_CONTENT_GEN`**
- Xóa code mặc định, **paste toàn bộ nội dung file `MOCO_CONTENT_GEN.gs`** vào

### Bước 4: Thêm API Key vào Script Properties

```
(Apps Script Editor) → Project Settings (⚙️) → Script Properties → Add property
```

| Property | Value |
|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` (key của bạn) |

> ⚠️ **KHÔNG paste API Key trực tiếp vào code** — dùng Script Properties để bảo mật

### Bước 5: Lưu và Authorize

- Bấm **Save** (Ctrl+S)
- Bấm **Run** → chọn hàm `setupSheets`
- Lần đầu sẽ yêu cầu **Authorize** — bấm "Review permissions" → chọn tài khoản Google → "Allow"

---

## 3. Sử Dụng

### Bước 1: Setup Sheets (chỉ làm 1 lần)

Trong Google Sheet:
```
Menu 🍰 MOCO Content AI → 📋 Setup Sheets
```

Script sẽ tạo 3 sheets:
- **Content Brief** — điền yêu cầu ở đây
- **Content Output** — xem kết quả ở đây
- **Generation Log** — nhật ký mỗi lần chạy

### Bước 2: Điền Brief

Mở sheet **"Content Brief"**, điền vào các cột:

| Cột | Mô tả | Ví dụ |
|---|---|---|
| Sản phẩm | Tên sản phẩm MOCO | `Keto Tiramisu` |
| Loại bài | Dropdown chọn loại | `Product Post` |
| Nhóm đối tượng | Target khách hàng | `Người kiểm soát đường huyết` |
| Điểm nhấn | Thông điệp muốn nhấn | `Allulose không tăng đường huyết` |
| Ghi chú thêm | (Tùy chọn) | `Nhắc đặt hàng qua Zalo` |
| Trạng thái | Để: **Chờ xử lý** | `Chờ xử lý` |

**Loại bài hỗ trợ:**
- `Product Post` — Giới thiệu sản phẩm
- `Education Post` — Bài giáo dục/thông tin
- `BTS / Storytelling` — Hậu trường làm bánh
- `Review / Social Proof` — Trải nghiệm khách hàng
- `Seasonal / Event` — Theo mùa/sự kiện

### Bước 3: Generate

```
Menu 🍰 MOCO Content AI → ✨ Generate Content
```

- Script sẽ xử lý tất cả rows có trạng thái **"Chờ xử lý"**
- Mỗi bài mất khoảng 3-5 giây
- Kết quả ghi vào sheet **"Content Output"**

### Bước 4: Xem & Dùng

Mở sheet **"Content Output"**:
- Cột **"Nội dung bài viết"** — copy vào Facebook/Instagram
- Cột **"Idea ảnh"** — gợi ý concept ảnh cho bài

---

## 4. Troubleshooting

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| "Chưa cấu hình API Key" | Script Properties chưa có key | Thêm `GEMINI_API_KEY` vào Script Properties |
| "HTTP 429" | Quá nhiều request trong 1 phút | Đợi 1-2 phút rồi chạy lại |
| "HTTP 400" | Prompt lỗi hoặc content bị filter | Kiểm tra lại nội dung brief |
| "Không có brief nào" | Không có row trạng thái "Chờ xử lý" | Đổi cột Trạng thái → "Chờ xử lý" |
| Script không load | Chưa refresh menu | Reload Google Sheet (F5) |

---

## 5. Mở Rộng (Optional)

### Trigger tự động hàng ngày

Để script tự chạy mỗi sáng lúc 8h:

```
(Apps Script Editor) → Triggers (⏱️) → Add Trigger
→ Function: generateContentFromBrief
→ Time-based → Day timer → 8am-9am
```

### Gửi output qua Gmail (bonus)

Có thể mở rộng script để tự động gửi draft bài qua Gmail cho founder sau mỗi lần generate — hỏi tôi nếu cần.

---

## 6. File liên quan

| File | Vai trò |
|---|---|
| `MOCO_CONTENT_GEN.gs` | Script chính |
| `3_Content_Engine/gem_system_prompt_moco.md` | Nguồn System Prompt (đã embed trong script) |
| `3_Content_Engine/moco_sample_posts_gem.md` | Ví dụ output mẫu để so sánh |

---

*Phase 4D — MOCO AI Marketing Hub | Google AI Bootcamp 2026*

---

## Related

- [[ANTIGRAVITY_HANDOFF_GOOGLE_SHEET_CONTROL]]
- [[CODEX_TASK_DEPLOY_DASHBOARD_V2]]
- [[DEPLOY_GUIDE]]
- [[MOCO_HANDOFF_2026-05-13_COST_UI_DROPDOWN]]
- [[MOCO_HANDOFF_2026-05-13_UI_YIELD_SYNCOUT]]


---

## NÂNG CẤP 2026-06-07 — Lịch nội dung + Prompt ảnh Banana Pro

File bổ sung: `MOCO_CONTENT_CALENDAR.gs` (đã whitelist trong `.claspignore`, push chung qua clasp).

Sau khi push, **F5 lại sheet** để menu cập nhật. Không cần cấp quyền lại (không thêm scope mới).

### A. Lịch nội dung (Content Calendar)

Menu `🍰 MOCO Content AI → 📅 Lịch nội dung`:

1. **🆕 Setup Content Calendar** — tạo sheet `Content Calendar` với cột: Ngày đăng, Kênh, Sản phẩm, Loại bài, Đối tượng, Điểm nhấn / Occasion, Ghi chú thêm, Đã đẩy? (kèm dropdown Kênh & Loại bài).
2. Điền lịch theo từng dòng = 1 bài cần đăng.
3. **➡️ Đẩy toàn bộ lịch chưa xử lý sang Brief** — copy mọi dòng chưa có dấu `✅ Đã đẩy` xuống sheet `Content Brief` (status `Chờ xử lý`), kèm thông tin `Kênh:` vào ghi chú, rồi đánh dấu dòng lịch là `✅ Đã đẩy` để không trùng.
4. **📆 Chỉ đẩy bài đến hạn hôm nay** — như trên nhưng chỉ lấy dòng có `Ngày đăng <= hôm nay`.
5. Sang `Content Brief` bấm `✨ Generate Content` như bình thường.

### B. Prompt ảnh Banana Pro

Menu `🍰 MOCO Content AI → 🎨 Tạo prompt ảnh Banana Pro`:

- Đọc sheet `Content Output`, với mỗi bài chưa có prompt sẽ lấy "Idea ảnh" (tiếng Việt) + tên sản phẩm → gọi Gemini sinh **1 prompt tiếng Anh chuẩn Nano Banana Pro** (food photography), ghi vào cột mới `Banana Pro Prompt` (cột G).
- Copy prompt ở cột G → dán vào **Nano Banana Pro** để gen ảnh minh hoạ kèm bài.
- Quy ước prompt theo bộ template logo/visual MOCO (warm earthy palette: sage green, oatmeal beige, cocoa brown, milk white; soft natural light; no text/logo/watermark).
- Hàm an toàn: chỉ sinh cho bài chưa có prompt (bỏ qua bài đã có), có retry khi model quá tải.

### C. Gen ảnh đúng style bằng Gem trên Gemini

Prompt ở cột "Banana Pro Prompt" KHÔNG dán trực tiếp vào Gemini thường (mỗi lần ra một kiểu).
Thay vào đó dùng **Gem "MOCO Visual Art Director"** đã khóa sẵn nhận diện Moco để mọi ảnh đồng nhất:

- Cấu hình + hướng dẫn tạo Gem: `Du_An_Cuoi_Khoa/3_Creative_Content/MOCO_VISUAL_GEM_CONFIG.md`
- Luồng: copy prompt cột G → mở Gem → dán → Gem gen ảnh đúng brand + trả prompt EN tái lập.
