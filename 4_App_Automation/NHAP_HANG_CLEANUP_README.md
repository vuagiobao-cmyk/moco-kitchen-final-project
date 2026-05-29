---
id: "20260508222103"
aliases: ["MOCO - NHẬP HÀNG Cleanup"]
tags: ["#moco", "#google-ai"]
created: 2026-05-08
updated: 2026-05-16
---
# MOCO - NHẬP HÀNG Cleanup

> **Script chính duy nhất: `MOCO_NHAP_HANG_V2.gs`**
> File V1 (`MOCO_NHAP_HANG_CLEAN_SETUP.gs`) đã bị xóa vì trùng hàm với V2.

Google Sheet:

```text
https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit
```

Runbook chi tiết: `MOCO_WEB_APP_DEPLOYMENT.md`.

## Cách chạy

### Cách nhanh trong Google Sheet

1. Mở Google Sheet trên.
2. Vào `Extensions > Apps Script`.
3. Dán toàn bộ nội dung file **`MOCO_NHAP_HANG_V2.gs`** vào `Code.gs`.
4. Bấm Run hàm `MOCO_SETUP`.
5. Cấp quyền Google nếu được hỏi.
6. Quay lại tab `NHẬP HÀNG`, chọn item ở ô **`M2`** để xem lịch sử giá bên phải.

### Cách ổn định qua Apps Script Web App

1. Trong Apps Script, mở `Project Settings > Script Properties`.
2. Thêm property:

```text
MOCO_WEB_APP_TOKEN=<một chuỗi bí mật tự đặt>
```

3. Vào `Deploy > New deployment > Web app`.
4. Chọn:
   - Execute as: `Me`
   - Who has access: tài khoản/phạm vi phù hợp với nhu cầu vận hành
5. Copy Web App URL.
6. Nếu muốn dùng env file, copy `moco_web_app.env.example` ra vị trí local không commit rồi điền URL/token thật.
7. Gọi từ máy local bằng helper:

```bash
MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." \
MOCO_WEB_APP_TOKEN="..." \
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" status
```

Dry-run trước khi clean:

```bash
MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." \
MOCO_WEB_APP_TOKEN="..." \
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" clean_nhap_hang
```

Chạy clean thật, giữ UI/header/format hiện có:

```bash
MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." \
MOCO_WEB_APP_TOKEN="..." \
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" clean_nhap_hang --write
```

Chỉ dùng `--reset-ui` khi đã xác nhận không cần giữ chỉnh sửa thủ công trên Sheet live.
Mặc định helper đọc sheet hiện tại; chỉ dùng `--source latest_backup` khi cần rebuild từ backup gốc.

## Script sẽ làm gì

- Tạo một sheet backup ẩn trước khi ghi đè tab `NHẬP HÀNG`.
- Chuẩn hóa bảng chính thành: ngày nhập, tên hàng, loại hàng, SL mua, quy cách, đơn vị, giá nhập, đơn giá, nhà cung cấp, ghi chú.
- Tách khối lượng như `2kg`, `500gr`, `1 lít`, `355ml` thành số lượng số thuần và đơn vị chuẩn.
- Chuyển giá nhập dạng text `130.000 đ` thành number.
- Tự phân loại nháp theo tên hàng.
- Tạo bảng tra cứu biến động giá ở cột `L:U`.
- Tự refresh lịch sử giá khi sửa bảng chính hoặc đổi item ở `M2`.
- Khi gọi qua Web App, `clean_nhap_hang` mặc định là `dryRun` và không ghi Sheet nếu chưa truyền `--write`.
- Web App mặc định đọc dữ liệu live hiện tại, không đọc backup cũ, để tránh mất chỉnh sửa mới của founder.

## Lưu ý

- Dòng thiếu số lượng hoặc thiếu đơn vị sẽ được đánh dấu `Cần kiểm tra`.
- Giá chỉ so sánh đúng khi cùng đơn vị chuẩn, ví dụ cùng `g` hoặc cùng `ml`.
- Web App token không được commit vào repo; chỉ lưu trong Apps Script Properties hoặc biến môi trường local.

---

## Related

- [[ANTIGRAVITY_HANDOFF_GOOGLE_SHEET_CONTROL]]
- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[CODEX_TASK_DEPLOY_DASHBOARD_V2]]
- [[DEPLOY_GUIDE]]
- [[MOCO_HANDOFF_2026-05-13_COST_UI_DROPDOWN]]
