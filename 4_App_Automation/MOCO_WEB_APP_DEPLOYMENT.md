---
id: "20260509182344"
aliases: ["MOCO Web App Deployment Runbook"]
tags: ["#moco", "#google-ai"]
created: 2026-05-09
updated: 2026-05-16
---
# MOCO Web App Deployment Runbook

## Mục tiêu

Triển khai `MOCO_NHAP_HANG_V2.gs` thành Apps Script Web App để Codex/Antigravity gọi Google Sheet bằng HTTP, không cần browser agent thao tác UI Google Sheets.

## Files cần dùng

```text
MOCO_NHAP_HANG_V2.gs
MOCO_MASTER_NVL.gs
MOCO_THU_CHI_AUTO.gs
MOCO_DASHBOARD.gs
appsscript.json
moco_web_app_call.js
moco_web_app.env.example
```

## Deploy một lần trong Apps Script

1. Mở Google Sheet MOCO:

```text
https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit
```

2. Vào `Extensions > Apps Script`.
3. Dán nội dung `MOCO_NHAP_HANG_V2.gs` vào file `Code.gs`.
4. Tạo file script riêng và dán thêm:
   - `MOCO_MASTER_NVL.gs`
   - `MOCO_THU_CHI_AUTO.gs`
   - `MOCO_DASHBOARD.gs`
5. Nếu Apps Script hiện manifest, cập nhật bằng nội dung `appsscript.json`.
6. Vào `Project Settings > Script Properties`.
7. Thêm property:

```text
MOCO_WEB_APP_TOKEN=<secret tự đặt>
```

8. Chạy thử hàm `MOCO_SETUP` nếu cần setup lần đầu trong UI.
9. Vào `Deploy > New deployment > Web app`.
10. Chọn:
   - Execute as: `Me`
   - Who has access: tùy phạm vi tài khoản vận hành
11. Copy Web App URL.

## Gọi từ local

Copy env mẫu rồi điền secret cục bộ, không commit file chứa token thật:

```bash
cp "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app.env.example" /private/tmp/moco_web_app.env
```

Sau khi điền URL/token:

```bash
set -a
. /private/tmp/moco_web_app.env
set +a
```

Kiểm tra kết nối:

```bash
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" status
```

Dry-run clean:

```bash
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" clean_nhap_hang
```

Ghi thật, giữ UI live:

```bash
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" clean_nhap_hang --write
```

## Quy tắc an toàn

- Luôn chạy `status` trước.
- Luôn chạy `clean_nhap_hang` dry-run trước `--write`.
- Không dùng `--reset-ui` nếu founder đã chỉnh header, màu, width, border, conditional formatting.
- Không dùng `--source latest_backup` trừ khi cần rebuild từ backup gốc có cột `KHỐI LƯỢNG`.
- Sau khi ghi thật, kiểm tra response có `backupName`, `written: true`, `rowsNeedReview`.

## Acceptance Checklist

- `status` trả `ok: true`.
- `clean_nhap_hang` dry-run trả `written: false`.
- `clean_nhap_hang --write` tạo backup ẩn trước khi ghi.
- Header/UI live không bị reset khi không dùng `--reset-ui`.
- Vùng lịch sử giá `L:U` refresh được theo item ở `M2`.

---

## Related

- [[ANTIGRAVITY_HANDOFF_GOOGLE_SHEET_CONTROL]]
- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[CODEX_TASK_DEPLOY_DASHBOARD_V2]]
- [[DEPLOY_GUIDE]]
- [[MOCO_HANDOFF_2026-05-13_COST_UI_DROPDOWN]]
