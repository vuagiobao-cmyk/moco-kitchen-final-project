---
id: "20260508222529"
aliases: ["Antigravity Handoff - MOCO Google Sheet Control"]
tags: ["#moco", "#google-ai"]
created: 2026-05-08
updated: 2026-05-16
---
# Antigravity Handoff - MOCO Google Sheet Control

## Nguồn yêu cầu

Người dùng tiếp tục xử lý dự án cuối khóa tại:

```text
C:\Antigravity\AI_Command_Center\04_RnD_Lab\GOOGLE AI ECOSYSTEM K1-2026\Du_An_Cuoi_Khoa
```

Google Sheet cần xử lý:

```text
https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit?usp=sharing
```

Vấn đề của founder MOCO:

- Founder đang phải tự điền, tự tính tay từ nhập nguyên liệu đến cost nguyên liệu và giá bán thực tế.
- Việc này mất nhiều thời gian không cần thiết.
- Mục tiêu là tự động hóa tối đa, bắt đầu từ sheet `NHẬP HÀNG`.

## Phạm vi bước đầu

Sheet đầu tiên cần xử lý: `NHẬP HÀNG`.

Yêu cầu ban đầu:

- Bổ sung cột `LOẠI HÀNG`.
- Bổ sung cột `ĐƠN VỊ`, thống nhất về `g`, `ml`, `quả` cho dễ tính.
- Sửa cột `SỐ LƯỢNG` để chỉ còn số.
- Clean data để dùng cho các phần tính cost và giá bán sau.
- Có cách xem lịch sử giá nhập của một item mua nhiều lần, gồm thay đổi theo tiền thật và phần trăm.

## Quyết định đã chốt với user

Các lựa chọn đã được user xác nhận:

- Clean trực tiếp trên tab `NHẬP HÀNG`, không tạo tab clean riêng.
- Bảng lịch sử giá đặt bên phải cùng sheet, bắt đầu khoảng cột `L`.
- `LOẠI HÀNG` tự phân loại nháp bằng rule theo tên item, founder có thể sửa lại dropdown sau.
- Không tự bịa dữ liệu nếu thiếu số lượng/đơn vị; dòng thiếu thông tin phải đánh dấu `Cần kiểm tra`.

## Thiết kế bảng chính

Chuẩn hóa `NHẬP HÀNG` thành 10 cột:

```text
NGÀY NHẬP
TÊN HÀNG HOÁ
LOẠI HÀNG
SL MUA
QUY CÁCH
ĐƠN VỊ
GIÁ NHẬP
ĐƠN GIÁ
NHÀ CUNG CẤP
GHI CHÚ
```

Quy tắc chuyển đổi đơn vị:

- `500g`, `500gr` -> `500` + `g`
- `2kg` -> `2000` + `g`
- `1kg` -> `1000` + `g`
- `355ml` -> `355` + `ml`
- `1L`, `1l`, `1 lít` -> `1000` + `ml`
- `2 lít` -> `2000` + `ml`
- `3 lít` -> `3000` + `ml`
- Trứng -> ưu tiên đơn vị `quả` nếu có số lượng rõ.
- Bao bì/dụng cụ -> cho phép thêm `cái`, `bộ`, `túi` nếu cần.

Quy tắc giá:

- `GIÁ NHẬP` phải là number thật, format tiền Việt.
- `ĐƠN GIÁ = GIÁ NHẬP / SL MUA`.
- Nếu thiếu số lượng hoặc thiếu đơn vị, `ĐƠN GIÁ` để trống và `GHI CHÚ` ghi `Cần kiểm tra`.

## Thiết kế bảng lịch sử giá

Đặt bên phải cùng tab `NHẬP HÀNG`, khu vực `L:U`.

Ô chọn item:

```text
M2
```

Header bảng lịch sử giá:

```text
Ngày nhập
Số lượng
Quy cách
Đơn vị
Giá nhập
Đơn giá
Nhà cung cấp
Chênh lệch tiền
Chênh lệch %
Trạng thái
```

Hành vi:

- Người dùng chọn item ở `M2`.
- Bảng trả về lịch sử nhập của item đó.
- So sánh `ĐƠN GIÁ` với lần mua trước cùng `ĐƠN VỊ`.
- Trạng thái gồm `Lần đầu`, `Tăng`, `Giảm`, `Không đổi`, `Không đủ dữ liệu`.
- Nếu khác đơn vị hoặc thiếu dữ liệu thì không so sánh bừa.

## File đã tạo trong repo

Script Apps Script:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/MOCO_NHAP_HANG_CLEAN_SETUP.gs
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/MOCO_NHAP_HANG_V2.gs
```

README hướng dẫn chạy:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/NHAP_HANG_CLEANUP_README.md
```

Helper gọi Web App từ local:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js
```

Runbook deploy Web App:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/MOCO_WEB_APP_DEPLOYMENT.md
```

Apps Script manifest:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/appsscript.json
```

Commit đã push:

```text
0e91a55 feat: add MOCO inventory cleanup script
```

## Hạn chế của Codex session hiện tại

Codex hiện tại đọc được Google Sheet qua public export:

```text
https://docs.google.com/spreadsheets/d/<sheet-id>/gviz/tq?tqx=out:csv&sheet=NH%E1%BA%ACP%20H%C3%80NG
```

Nhưng session này không có OAuth/Google Sheets API connector để ghi trực tiếp ngược vào Google Sheet.

Đã kiểm tra:

- Không có env Google/Sheets/Drive credentials.
- Không có `gcloud` hoặc `clasp` khả dụng.
- Link public đọc được, nhưng không đủ quyền ghi.

Vì vậy cách triển khai an toàn hiện tại là:

1. Mở Google Sheet.
2. Vào `Extensions > Apps Script`.
3. Dán nội dung `MOCO_NHAP_HANG_V2.gs`.
4. Chạy hàm `MOCO_SETUP`.
5. Cấp quyền.
6. Quay lại sheet và dùng menu `MOCO`.

## Cách Antigravity tiếp quản để điều khiển trực tiếp Google Sheet

Nếu Antigravity có browser automation hoặc quyền Google trong môi trường, làm theo hướng này:

1. Mở Google Sheet bằng browser đã đăng nhập tài khoản có quyền edit.
2. Mở `Extensions > Apps Script`.
3. Tạo hoặc mở project Apps Script bound với sheet.
4. Dán file `MOCO_NHAP_HANG_V2.gs` vào `Code.gs`.
5. Save project.
6. Chạy `MOCO_SETUP`.
7. Approve OAuth permission nếu Google hỏi.
8. Quay lại spreadsheet, refresh tab nếu cần.
9. Kiểm tra tab `NHẬP HÀNG`:
   - Có sheet backup ẩn `BACKUP_...`.
   - Cột A:J đã đúng cấu trúc mới.
   - Cột L:U có bảng tra cứu giá.
   - Ô `M2` có dropdown item.
10. Chọn các item mua lặp để test:
   - `Đường ăn kiêng Allulose`
   - `Bột hạnh nhân`
   - `Sữa tươi không đường TH`
   - `Whipping Cream Anchor 1kg`

Nếu Antigravity có Google Sheets API credentials:

1. Có thể dùng API để tạo Apps Script project hoặc batch update trực tiếp.
2. Vẫn ưu tiên Apps Script bound-to-sheet vì user/founder có thể tự chạy lại và có menu `MOCO`.
3. Sau khi chạy, ghi lại evidence: thời gian chạy, số dòng xử lý, số dòng `Cần kiểm tra`, screenshot hoặc mô tả khu vực `L:U`.

## Cách điều khiển nhanh với Codex

Nhanh nhất trong Codex hiện tại:

- Dùng Codex tạo/kiểm tra Apps Script, đọc dữ liệu public, mô phỏng logic local.
- User hoặc Antigravity dán script vào Apps Script để thực thi quyền ghi.

Để Codex ghi trực tiếp Google Sheet trong các lần sau, cần một trong các cách:

1. Cài/enable Google Drive hoặc Google Sheets connector có quyền edit trong Codex session.
2. Cài `clasp` và đăng nhập Google trên máy, rồi Codex dùng `clasp push/run`.
3. Cấu hình service account Google Sheets API và chia sẻ sheet cho service account đó.
4. Dùng Apps Script Web App endpoint có quyền ghi, Codex gọi endpoint bằng HTTP. Đây là hướng đã triển khai trong `MOCO_NHAP_HANG_V2.gs`.

Khuyến nghị thực tế:

- Với dự án nhỏ và cần nhanh: dùng Apps Script bound-to-sheet.
- Với dự án cần automation dài hạn: tạo Apps Script Web App hoặc service account để Codex/Antigravity có thể gọi tự động.

## Apps Script Web App endpoint đã triển khai

`MOCO_NHAP_HANG_V2.gs` có `doPost(e)` để Codex/Antigravity gọi trực tiếp bằng HTTP, không cần browser agent thao tác Google Sheets UI.

Thiết lập một lần trong Apps Script:

1. Dán/push nội dung `MOCO_NHAP_HANG_V2.gs` vào Apps Script bound với Google Sheet.
2. Nếu dùng manifest editor hoặc `clasp`, dùng `appsscript.json` đi kèm.
3. Vào `Project Settings > Script Properties`.
4. Thêm property:

```text
MOCO_WEB_APP_TOKEN=<secret tự đặt, không commit vào repo>
```

5. Vào `Deploy > New deployment > Web app`.
6. Chọn `Execute as: Me`.
7. Chọn quyền access phù hợp.
8. Copy Web App URL để gọi bằng local helper.

Payload tối thiểu:

```json
{
  "token": "<MOCO_WEB_APP_TOKEN>",
  "action": "status"
}
```

Actions:

- `status`: trả `spreadsheetId`, tên sheet, số dòng, header hiện tại, item đang chọn, timestamp.
- `refresh_history`: chỉ refresh vùng lịch sử giá, không clean bảng chính.
- `clean_nhap_hang`: mặc định `dryRun: true`, chỉ preview số dòng sẽ xử lý và số dòng `Cần kiểm tra`.

Muốn chạy clean thật:

```json
{
  "token": "<MOCO_WEB_APP_TOKEN>",
  "action": "clean_nhap_hang",
  "dryRun": false,
  "confirm": "RUN_CLEAN_NHAP_HANG",
  "preserveUi": true,
  "sourceMode": "current"
}
```

Quy tắc an toàn:

- Không có token hoặc token sai -> không ghi dữ liệu.
- `clean_nhap_hang` không có confirm phrase -> không ghi dữ liệu.
- `preserveUi: true` là mặc định để không reset header/UI/format đã chỉnh tay.
- `sourceMode: "current"` là mặc định để không ghi đè chỉnh sửa mới bằng backup cũ.
- Chỉ dùng `sourceMode: "latest_backup"` khi cần rebuild từ backup gốc có cột `KHỐI LƯỢNG`.
- Chỉ dùng `preserveUi: false` khi đã xác nhận không cần giữ chỉnh sửa thủ công.

Gọi từ local helper:

```bash
MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." \
MOCO_WEB_APP_TOKEN="..." \
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" status
```

Dry-run clean:

```bash
MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." \
MOCO_WEB_APP_TOKEN="..." \
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" clean_nhap_hang
```

Clean thật, giữ UI:

```bash
MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." \
MOCO_WEB_APP_TOKEN="..." \
node "04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js" clean_nhap_hang --write
```

## Test checklist sau khi chạy

Kiểm tra dữ liệu:

- `500g` -> `500`, `g`
- `500gr` -> `500`, `g`
- `2kg` -> `2000`, `g`
- `1kg` -> `1000`, `g`
- `355ml` -> `355`, `ml`
- `1L` -> `1000`, `ml`
- `1 lít`, `2 lít`, `3 lít` -> `1000/2000/3000`, `ml`

Kiểm tra lịch sử giá:

- Item mua nhiều lần hiển thị đủ lịch sử.
- `Chênh lệch tiền` và `Chênh lệch %` dựa trên `ĐƠN GIÁ`, không dựa trên tổng giá nhập.
- Khác đơn vị hoặc thiếu dữ liệu không so sánh bừa.

Kiểm tra an toàn:

- Có backup ẩn trước khi ghi đè.
- Các dòng thiếu số lượng/đơn vị có `Cần kiểm tra`.
- Founder có thể sửa `LOẠI HÀNG` bằng dropdown.

## Việc tiếp theo đề xuất

Sau khi `NHẬP HÀNG` đã sạch, triển khai tiếp:

1. Tạo master list nguyên liệu chuẩn từ `TÊN HÀNG HOÁ`.
2. Tạo bảng recipe/BOM cho từng món bánh.
3. Tính cost nguyên liệu theo đơn giá mới nhất hoặc đơn giá trung bình.
4. Tính giá bán đề xuất theo margin.
5. Tạo dashboard cảnh báo item tăng giá mạnh.

---

## Related

- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[CODEX_TASK_DEPLOY_DASHBOARD_V2]]
- [[DEPLOY_GUIDE]]
- [[MOCO_HANDOFF_2026-05-13_COST_UI_DROPDOWN]]
- [[MOCO_HANDOFF_2026-05-13_UI_YIELD_SYNCOUT]]
