---
id: "20260509182344"
aliases: ["MOCO Kitchen — Hướng dẫn Deploy Scripts"]
tags: ["#moco", "#google-ai"]
created: 2026-05-09
updated: 2026-05-16
---
# MOCO Kitchen — Hướng dẫn Deploy Scripts

> Tất cả scripts đã sẵn sàng. Sếp chỉ cần paste vào Apps Script.

## Danh sách Scripts

| File | Chức năng | Thứ tự chạy |
|------|-----------|-------------|
| `MOCO_NHAP_HANG_V2.gs` | Clean NHẬP HÀNG + lịch sử giá | **1** (đã có) |
| `MOCO_MASTER_NVL.gs` | Tạo Master NVL (bảng nguyên liệu chuẩn) | **2** |
| `MOCO_THU_CHI_AUTO.gs` | Tự ghi THU cho đơn Done + chuẩn hóa giao diện Thu-Chi | **3** |
| `MOCO_DASHBOARD.gs` | Dashboard tổng hợp | **4** |

## Cách deploy

### Bước 1: Mở Apps Script
1. Mở Google Sheet MOCO
2. Vào `Extensions > Apps Script`

### Bước 2: Paste scripts
- Mở file `Code.gs` và dán nội dung `MOCO_NHAP_HANG_V2.gs`
- Tạo file script riêng cho từng file còn lại:
  - `MOCO_MASTER_NVL.gs`
  - `MOCO_THU_CHI_AUTO.gs`
  - `MOCO_DASHBOARD.gs`
- Có thể paste nối tiếp vào `Code.gs`, nhưng tạo file riêng dễ kiểm tra hơn.

> Quan trọng: chỉ có một entrypoint chính. `onOpen()` và `onEdit(e)` nằm trong `MOCO_NHAP_HANG_V2.gs`.
> Không tạo thêm `onOpen()` hoặc `onEdit(e)` khác.

### Bước 3: Chạy tuần tự

```
1. MOCO_SETUP                    → Clean NHẬP HÀNG (nếu chưa chạy)
2. MOCO_GENERATE_NVL_REVIEW      → Sinh bảng review tên NVL
   → Sếp review cột C (vàng) → chỉnh tên nếu cần
3. MOCO_CREATE_MASTER_NVL        → Tạo Master NVL chính thức
4. MOCO_REBUILD_THU_CHI          → Backup + dọn dòng trống + làm lại UI Thu-Chi
5. MOCO_BACKFILL_THU             → Bổ sung THU cho đơn Done cũ
6. MOCO_CREATE_DASHBOARD         → Tạo Dashboard tổng hợp
```

### Bước 4: Kiểm tra

- [ ] Tab NHẬP HÀNG: cột A:J đúng, khu vực L:U có lịch sử giá
- [ ] Tab "📋 Review Tên NVL": danh sách tên NVL, cột C cho Sếp chỉnh
- [ ] Tab "Master NVL": ~60 nguyên liệu, có đơn giá mới nhất + TB
- [ ] Tab "Thu - Chi": có backup `BACKUP_THU_CHI_*`, không còn dòng trống giữa bảng, cột C dễ đọc, cột F có SỐ DƯ liên tục
- [ ] Tab "📊 Dashboard": KPI cards, top bánh, cảnh báo NVL

## Lưu ý

- **KHÔNG paste `MOCO_NHAP_HANG_CLEAN_SETUP.gs`** — file V1 đã xóa, trùng hàm với V2.
- Dashboard dùng formula thuần → tự cập nhật khi data thay đổi.
- Master NVL có Named Range `Master_NVL` → dùng cho VLOOKUP cross-sheet.
- Thu-Chi trigger: `onEdit(e)` trong V2 sẽ gọi `onEditThuChi_(e)`. Khi cột G trong `Đơn đặt hàng` = `done` hoặc `đã nhận tiền` → tự ghi THU và tự tính số dư.
- `MOCO_REBUILD_THU_CHI` luôn tạo backup ẩn trước khi dọn bảng. Dòng auto mới hiển thị mô tả ngắn, marker chống trùng được lưu trong note của ô mô tả.
- Dashboard vẫn tạo được nếu chưa có `Master_NVL`; vùng cảnh báo NVL sẽ để trống cho đến khi tạo Master NVL.

---

*Ngày tạo: 09/05/2026 | MOCO Kitchen AI Marketing Hub*

---

## Related

- [[ANTIGRAVITY_HANDOFF_GOOGLE_SHEET_CONTROL]]
- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[CODEX_TASK_DEPLOY_DASHBOARD_V2]]
- [[MOCO_HANDOFF_2026-05-13_COST_UI_DROPDOWN]]
- [[MOCO_HANDOFF_2026-05-13_UI_YIELD_SYNCOUT]]
