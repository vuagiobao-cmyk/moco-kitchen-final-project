---
id: "20260528113000"
aliases: ["MOCO Handoff - Cost Data Validation and Order Source Channel"]
tags: ["#moco", "#google-ai", "#handoff", "#sheet-automation"]
created: 2026-05-28
updated: 2026-05-28
---

# MOCO Handoff - Cost Data Validation and Order Source Channel

Date: 2026-05-28  
Machine: Windows `C:\Antigravity\AI_Command_Center`  
Workspace: `C:\Antigravity\AI_Command_Center\04_RnD_Lab\GOOGLE AI ECOSYSTEM K1-2026\Du_An_Cuoi_Khoa`

## Live Sheets

Target sheet đang làm việc:

```text
https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit
Spreadsheet ID: 1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y
Name: Bản sao của Moco Kitchen
```

Source sheet gốc để đối chiếu/bổ sung dữ liệu:

```text
https://docs.google.com/spreadsheets/d/1Ajbsj_xCligByJcebzb5clhamn0hmOtsBhoVSapoFAo/edit
Spreadsheet ID: 1Ajbsj_xCligByJcebzb5clhamn0hmOtsBhoVSapoFAo
Tabs used: Đơn đặt hàng, Thu - Chi, NHẬP HÀNG, TTB, NVL
```

Local source export đã dùng:

```text
C:\tmp\moco_source_latest_20260528.xlsx
C:\tmp\moco_source_latest_tabs_20260528.json
```

## Việc Đã Làm

### 1. Bổ sung dữ liệu từ sheet gốc theo hướng không ghi đè bừa

User đã làm rõ yêu cầu: không copy đè nguyên tab từ sheet gốc sang bản sao. Cách xử lý đã áp dụng:

- Đọc sheet gốc.
- So với sheet hiện tại.
- Chỉ bổ sung/chuẩn hóa phần thiếu hoặc sai.
- Tạo backup trước khi ghi các vùng quan trọng.
- Không xóa/chèn lại dữ liệu ngoài phạm vi cần sửa nếu không cần.

Các action Apps Script đã được bổ sung/sử dụng trong `MOCO_NHAP_HANG_V2.gs`:

- `import_public_source_tabs`
- `merge_public_source_tabs`
- `repair_public_source_merge`
- `repair_direct_source_tabs`
- `dedupe_nhap_hang_merge_keys`
- `dedupe_nhap_hang_strict_keys`
- `validate_nhap_hang_ai_fix`
- `repair_order_source_channel`

Helper local `moco_web_app_call.js` đã có alias mới:

- `import-source`
- `merge-source`
- `repair-source-merge`
- `repair-direct-tabs`
- `dedupe-nhap`
- `dedupe-nhap-strict`
- `validate-nhap-ai`
- `repair-order-source`

### 2. Validate và dọn dữ liệu nhập hàng

Trạng thái sau validate:

- `NHẬP HÀNG`: 165 dòng dữ liệu.
- Không còn lỗi `#N/A`.
- Không còn category/unit lệch chuẩn theo bộ rule hiện tại.
- Không còn dòng strict duplicate sau dọn.
- `NVL` đã sửa header.
- `TTB` sạch theo snapshot kiểm tra.
- `AI VALIDATE REVIEW` còn 7 dòng cần founder/AI duyệt tiếp nếu muốn chuẩn hóa sâu hơn.

Đã có cơ chế:

- Dedupe theo merge key.
- Dedupe strict key.
- AI validate/fix các lỗi phổ biến.
- Đưa dòng không đủ chắc chắn sang `AI VALIDATE REVIEW` thay vì tự sửa bừa.

### 3. Dọn version/deployment cũ

Apps Script project đã chạm giới hạn:

```text
200 versions
```

Đã xóa các deployment cũ có thể xóa, giữ lại các deployment cần thiết như `@HEAD` và deployment live gần nhất.

Lưu ý quan trọng:

- Google Apps Script API/clasp không cho xóa version history đã tạo.
- Vì đã đạt 200 versions, hiện chưa tạo deploy version mới được.
- Các cập nhật mới nhất được push lên code và chạy qua `@HEAD`.
- `clasp push` có thể exit code `1` do lỗi ghi credential local `C:\Users\ADMIN\.clasprc.json`, nhưng log vẫn báo `Pushed 6 files`.

### 4. Update công thức và cost Basque burn cheesecake

Founder đã update lại công thức Basque burn cheesecake. Đã cập nhật cost theo công thức mới:

```text
Basque burn cheesecake
Yield: 1 chiếc size 15cm
Cost: 97,980đ
```

Nguyên liệu hiện dùng:

```text
Trứng gà: 2 quả
Cream Cheese: 220g
Whipping Cream: 150g
Bơ: 10g
bột ngô: 5g
Đường Allulose: 20g
Đường La hán: 20g
Vani: 5ml
```

Kết quả đã được kiểm tra lại sau cập nhật.

### 5. Sửa thiếu cột nguồn khách trong ĐƠN HÀNG

Vấn đề phát hiện:

- Sheet gốc `Đơn đặt hàng` có cột `Mạng XH`.
- Sheet bản sao `ĐƠN HÀNG` thiếu cột tương ứng.
- Mapping cũ đang đưa nhầm giá trị `IG`, `Bạn`, `Threads` vào cột `Ngày đặt`.

Quyết định triển khai:

- Thêm cột `Nguồn khách` ở cuối schema `ĐƠN HÀNG`, tức cột S.
- Không chèn cột vào giữa để tránh làm lệch công thức/dashboard đang phụ thuộc vị trí cột cũ.
- Rebuild lại `ĐƠN HÀNG` từ source latest.
- Tạo backup trước khi ghi.

Backup live đã tạo:

```text
BACKUP_DON_HANG_STANDARDIZE_20260528_112313
```

Kết quả sau ghi:

```text
ĐƠN HÀNG lastRow: 78
ĐƠN HÀNG lastColumn: 19
Rows data: 77
Unique orders: 41
Source channels: Bạn, IG, Threads
Missing required fields: 0
Warnings: 0
```

Header hiện tại của `ĐƠN HÀNG`:

```text
Mã đơn
Ngày đặt
Ngày giao
Giờ giao
Tên KH
SĐT
Địa chỉ
Tên bánh
SKU/Menu
SL
Đơn giá
Thành tiền
Chiết khấu
Doanh thu sau CK
TT sản xuất
TT giao hàng
TT thanh toán
Ghi chú
Nguồn khách
```

Validate sau ghi:

- `Ngày đặt` không còn chứa `IG/Bạn/Threads`.
- `Nguồn khách` đã giữ đúng `IG`, `Bạn`, `Threads`.
- Số tiền đã đọc đúng dạng `280000.0` thành `280.000đ`, không còn bị nhân 10 lần.
- `Giá sau CK` đã lấy đúng từ cột source `Giá sau CK`, không lấy nhầm `Phí ship`.

### 6. Backfill THU CHI và kiểm tra Dashboard

Sau khi rebuild `ĐƠN HÀNG`, đã chạy lại backfill `THU CHI`.

Kết quả:

```text
Inserted THU rows: 31
Done orders detected: 31
```

Dashboard sau kiểm tra không có lỗi formula:

```text
Tổng thu: 21,650,998đ
Tổng chi: 17,564,500đ
Lợi nhuận ròng: 4,086,498đ
Số dư hiện tại: 10,086,498đ
Formula errors: 0
```

Snapshot `THU CHI` sau kiểm tra:

```text
thuRows: 66
chiRows: 68
totalThu: 21,650,998
totalChi: 17,564,500
net: 4,086,498
finalBalance: 10,086,498
filterRange: A2:O70
```

Lưu ý:

- Trong lần ghi repair order source, Apps Script có cảnh báo phụ: `Bạn không thể đặt định dạng số của các ô trong một cột đã nhập.`
- Chạy lại riêng `backfill_thu_chi` sau đó thành công.
- Dashboard và `THU CHI` đọc được dữ liệu đúng.

## File Đã Sửa Trong Repo

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/MOCO_NHAP_HANG_V2.gs
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/appsscript.json
```

Trong `MOCO_NHAP_HANG_V2.gs`, các điểm chính:

- Thêm action `repair_order_source_channel`.
- Thêm cột chuẩn `Nguồn khách` vào `MOCO_ORDER_STANDARD_HEADERS`.
- Sửa `migrateMocoLegacyOrderRows_` để:
  - `row[4]` của source là `Mạng XH`, không phải `Ngày đặt`.
  - Ghi vào `sourceChannel`.
  - Để `orderDate` trống nếu source không có ngày đặt riêng.
- Sửa đọc sheet chuẩn bằng header map thay vì index cứng.
- Sửa `parseMocoOrderAmount_` để không nhân 10 lần các chuỗi số dạng `280000.0`.
- Sửa `orderRevenueAfterDiscount` lấy từ source cột `Giá sau CK`.
- Thêm `writeMocoStandardOrderSheetPlain_` để ghi bảng đơn hàng ổn định khi dropdown/typed column có vấn đề.

Trong `moco_web_app_call.js`:

- Thêm alias và payload handling cho các action merge/repair/validate.
- `repair-order-source` nhận `--source-json` và `--write`.

## Cách Chạy Lại Khi Cần

Chạy dry-run repair nguồn khách:

```powershell
node .\moco_web_app_call.js repair-order-source --source-json C:\tmp\moco_source_latest_tabs_20260528.json
```

Ghi thật:

```powershell
node .\moco_web_app_call.js repair-order-source --source-json C:\tmp\moco_source_latest_tabs_20260528.json --write
```

Backfill thu:

```powershell
node .\moco_web_app_call.js backfill-thu
```

Kiểm tra đơn hàng hiện tại:

```powershell
node .\moco_web_app_call.js order-current
```

Kiểm tra dashboard:

```powershell
node .\moco_web_app_call.js dashboard-current
```

Nếu action mới chưa có ở deployed version live do giới hạn 200 versions, dùng Web App `@HEAD` bằng OAuth như phiên này đã làm. Không ghi token vào handoff.

## Kiểm Tra Đã Chạy

Local syntax:

```text
MOCO_NHAP_HANG_V2.gs syntax ok
moco_web_app_call.js syntax ok
```

Apps Script:

```text
clasp push
Result: Pushed 6 files
Known local warning: EPERM writing C:\Users\ADMIN\.clasprc.json
```

Live dry-run trước ghi:

```text
sourceRows: 1017
migratedRows: 77
uniqueOrders: 41
sourceChannels: Bạn, IG, Threads
missing: []
warnings: []
```

Live validate sau ghi:

```text
alreadyStandard: true
sourceSheet: ĐƠN HÀNG
uniqueOrders: 41
migratedRows: 77
missingCount: 0
warnings: []
```

## Rủi Ro Còn Lại

QA_Thanh:

- Apps Script đang chạm giới hạn 200 versions. Muốn deploy version mới cần tạo Apps Script project mới, hoặc chấp nhận chạy `@HEAD` trong giai đoạn sửa nhanh.
- `ĐƠN HÀNG` còn một số dòng `Chưa match MENU & GIÁ`, ví dụ các tên chưa khớp exact với `MENU & GIÁ`. Đây là vấn đề chuẩn hóa tên menu, không phải lỗi import nguồn khách.
- `AI VALIDATE REVIEW` còn 7 dòng cần duyệt nếu muốn dữ liệu nhập hàng sạch tuyệt đối.
- Một số số điện thoại từ source bị Google/Excel export dạng khoa học hoặc thiếu định dạng text. Cần xử lý riêng nếu founder muốn dùng phone cho vận hành/CRM.
- Không dùng Google Sheets API trực tiếp được từ OAuth project hiện tại vì `sheets.googleapis.com` đang disabled. Phiên này dùng Apps Script Web App/OAuth fallback.

## Trạng Thái Git Khi Handoff

Branch:

```text
sync/phong-20260518-083837
```

Có thay đổi liên quan MOCO automation:

```text
M 04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/MOCO_NHAP_HANG_V2.gs
M 04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/appsscript.json
M 04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation/moco_web_app_call.js
```

Có thay đổi ngoài phạm vi, không đụng:

```text
M 04_RnD_Lab/Trading_Zone/_knowledge/README.md
?? 04_RnD_Lab/Trading_Zone/Fibonacci_Boroden_System/
?? 05_Daily/2026-05-28.md
```

## Next Actions

1. Founder duyệt 7 dòng trong `AI VALIDATE REVIEW`.
2. Chuẩn hóa các tên bánh đang `Chưa match MENU & GIÁ`.
3. Nếu cần deploy production version mới, xử lý giới hạn 200 Apps Script versions trước.
4. Nếu muốn đưa cột `Nguồn khách` vào báo cáo, thêm view/chart theo cột S thay vì sửa công thức dashboard cũ.

## Update 2026-05-28 - Tiramisu Yield 2 Hộp

Founder đã sửa công thức `KETO TIRAMISU` trong sheet `CÔNG THỨC`:

```text
Yield parsed: 2 lòng đỏ làm kem trứng: Thành phẩm 2 hộp
Parsed yield: 2 hộp / mẻ
```

Đã chạy lại pipeline:

```powershell
node .\moco_web_app_call.js all
node .\moco_web_app_call.js debug_pricing_dashboard_state
node .\moco_web_app_call.js debug_recipe_yield_candidates
node .\moco_web_app_call.js issues
```

Kết quả live sau rebuild:

```text
KETO TIRAMISU
SKU: MOCO-005
Tổng cost / mẻ: 156,777đ
Yield: 2 hộp / mẻ
Cost nguyên liệu / hộp: 83,876đ
Giá bán hiện tại: 180,000đ
Food cost: 46.60%
Giá theo food cost chỉ nguyên liệu: 240,000đ
Lãi gộp sau nguyên liệu: 96,124đ
Giá theo lãi mục tiêu: 210,000đ
```

`COST REVIEW` sau rebuild:

```text
rows: 0
issues: []
```

QA_Thanh:

- Cost Tiramisu đang dùng một số giá tạm/tham khảo cho `Vani`, `mascapone`, `Whipping Cream`, `muối`, `cafe`, `rượu rum`, `rượu baileys`. Khi có hóa đơn thật trong `NHẬP HÀNG`, cần refresh lại để thay giá tạm bằng giá thật.
- Trong `CÔNG THỨC` vẫn còn text cũ `CT 3 chiếc` ở một dòng phụ, nhưng parser đã chọn yield tốt hơn là `Thành phẩm 2 hộp`, nên hiện không ảnh hưởng kết quả cost.

## Update 2026-05-28 - Founder Order View Gộp Món Và Ship

Founder yêu cầu:

```text
Update lại sheet đặt hàng, thêm cột "ship" và "bù ship",
gộp những món cùng 1 đơn vào chứ đừng tách ra.
```

Đánh giá khả thi:

- Khả thi nếu `ĐƠN HÀNG` chuyển sang view founder-facing 1 dòng/đơn.
- Không nên chỉ xóa các dòng chi tiết vì dashboard/analytics vẫn cần item-level data.
- Quyết định triển khai: `ĐƠN HÀNG` là bảng gọn cho founder; sheet ẩn `ĐƠN HÀNG - CHI TIẾT` giữ 77 dòng item-level để truy vết và phục vụ báo cáo khi cần.

Đã thêm action:

```text
apply_founder_order_view
```

Alias local:

```powershell
node .\moco_web_app_call.js founder-order-view --source-json C:\tmp\moco_source_latest_tabs_20260528.json
node .\moco_web_app_call.js founder-order-view --source-json C:\tmp\moco_source_latest_tabs_20260528.json --write
```

Kết quả live sau ghi:

```text
ĐƠN HÀNG
lastRow: 42
lastColumn: 19
compactOrders: 41
detailRows saved in hidden sheet: 77
Backup: BACKUP_DON_HANG_STANDARDIZE_20260528_231256
```

Header mới của `ĐƠN HÀNG`:

```text
Mã đơn
Ngày đặt
Ngày giao
Giờ giao
Tên KH
SĐT
Địa chỉ
Món trong đơn
Tổng SL
Thành tiền hàng
Khuyến mại
Ship
Bù ship
Doanh thu sau CK
TT sản xuất
TT giao hàng
TT thanh toán
Ghi chú
Nguồn khách
```

Ghi chú kỹ thuật:

- Tab cũ `ĐƠN HÀNG` bị Google typed-column lock khi clear validation/format. Script đã fallback: backup trước, xóa tab cũ đang hỏng, tạo lại tab `ĐƠN HÀNG` cùng tên, rồi ghi dữ liệu gọn.
- Sheet ID của `ĐƠN HÀNG` đã đổi sau khi tạo lại tab.
- Đã tạo/ghi sheet ẩn `ĐƠN HÀNG - CHI TIẾT`.
- Đã sửa `DASHBOARD` để top bánh đọc từ `ĐƠN HÀNG - CHI TIẾT` nếu sheet này tồn tại, còn tổng quan đơn hàng đọc từ `ĐƠN HÀNG` gọn.

Kiểm tra sau ghi:

```text
backfill_thu_chi:
inserted: 0
doneOrders: 31
reason: Không có đơn Done mới nào cần bổ sung hoặc đơn đã tồn tại.

dashboard:
formula errors: []
total orders: 41
paid orders: 31
unpaid orders: 10
order revenue after CK: 8,235,000đ
```

QA_Thanh:

- `ĐƠN HÀNG` hiện dễ đọc hơn cho founder, nhưng mọi phân tích theo từng món phải đọc từ `ĐƠN HÀNG - CHI TIẾT`, không đọc cột `Món trong đơn` đã gộp.
- Một số tên món trong order nguồn chưa match exact với `MENU & GIÁ`, nên top bánh theo tên chuẩn vẫn có dòng chưa lên số đầy đủ. Cần xử lý bước chuẩn hóa tên món order nếu muốn dashboard bán chạy chính xác hơn.

## Correction 2026-05-29 - Founder One-Sheet Order UX

Sau phản hồi của Anh, chốt lại thiết kế:

- Founder chỉ thao tác ở `ĐƠN HÀNG`.
- `ĐƠN HÀNG - MÓN` chỉ là sheet data ẩn cho dashboard/cost, không phải UI nhập liệu.
- `ĐƠN HÀNG - CHI TIẾT` cũ bị xóa trong cleanup vì trùng vai trò với `ĐƠN HÀNG - MÓN`.

Layout `ĐƠN HÀNG` hiện tại:

```text
Mã đơn
Nguồn khách
Ngày đặt
Ngày giao
Giờ giao
Tên KH
SĐT
Địa chỉ
Món 1 | SL 1
Món 2 | SL 2
Món 3 | SL 3
Món 4 | SL 4
Món 5 | SL 5
Tóm tắt món (tự động)
Tổng SL
Tổng tiền món
Khuyến mại
Ship
Bù ship
Doanh thu sau CK
TT sản xuất
TT giao hàng
TT thanh toán
Ghi chú
```

Quy tắc nhập:

- Founder chọn món bằng dropdown ở các cột `Món 1..5`.
- Founder chỉ nhập số lượng ở `SL 1..5`.
- `Tóm tắt món (tự động)` và `Tổng SL` dùng formula, không nhập tay.
- `SĐT` format text trước khi ghi để tránh mất số 0 đầu.

Kết quả live:

```text
ĐƠN HÀNG
lastColumn: 29
lastRow: 100 do có formula sẵn cho dòng trống
sample phone fixed: 0785208272
sample summary: 1 x Bánh chuối\n1 x Bánh mỳ soda

ĐƠN HÀNG - MÓN
hidden data sheet
detailRows: 77

DASHBOARD
formula errors: []
Tổng đơn hàng: 41
Đơn đã giao: 31
Đơn đã nhận tiền: 31
Đơn chưa thanh toán: 10
Tổng doanh thu sau CK: 8,235,000đ
```

Cleanup sheet ẩn:

```text
Deleted hidden old backup/detail sheets: 31 total across cleanup passes.
Kept:
- BACKUP_DON_HANG_STANDARDIZE_20260529_000116
- BACKUP_THU_CHI_RECONCILE_20260528_082947
- ĐƠN HÀNG - MÓN (hidden data for dashboard)
```

## Correction 2026-05-28 - Order Entry UX Fix

Sau phản hồi của Anh, phương án "gộp món thành một ô chữ dài" được xác định là sai ở tầng nhập liệu:

- Không để người vận hành gõ tay từng món vào một ô multiline.
- Không dùng serial date như `46141.0` ở cột `Ngày giao`.
- Không để mất màu/validation ở các cột tình trạng.
- Không giấu dữ liệu dòng món nếu đây là nơi người vận hành cần nhập/sửa.

Phương án đã chốt lại:

- `ĐƠN HÀNG`: bảng tổng hợp 1 dòng/đơn để founder đọc nhanh.
- `ĐƠN HÀNG - MÓN`: bảng dòng món visible, mỗi món một dòng, dùng để nhập/sửa món theo cấu trúc chuẩn.
- Cột H của `ĐƠN HÀNG` đổi thành `Tóm tắt món (tự động)` và có note: không nhập tay ở đây, nhập/sửa tại `ĐƠN HÀNG - MÓN`.
- `Ngày giao` được convert về `dd/MM/yyyy`.
- `Ship` và `Bù ship` vẫn giữ trong bảng tổng hợp.
- Cột `TT sản xuất`, `TT giao hàng`, `TT thanh toán` được gắn dropdown và conditional color lại.
- `DASHBOARD` được sửa để đọc item-level data từ `ĐƠN HÀNG - MÓN` trước, fallback về `ĐƠN HÀNG - CHI TIẾT`, sau đó mới fallback về `ĐƠN HÀNG`.

Kết quả live sau correction:

```text
ĐƠN HÀNG
lastRow: 42
lastColumn: 19
header H: Tóm tắt món (tự động)
Ngày giao sample: 29/04/2026, 08/05/2026, 08/05/2026\n09/05/2026

ĐƠN HÀNG - MÓN
visible sheet
detailRows: 77
```

Lưu ý vận hành:

- Web app deployment public đang kẹt giới hạn 200 versions của Apps Script, nên action mới được chạy qua deployment `@HEAD` endpoint `/dev` có OAuth thay vì `/exec` public.
- Code đã push lên Apps Script HEAD; muốn public `/exec` nhận action mới thì cần dọn bớt Apps Script project versions trong UI rồi redeploy lại deployment đang dùng.
- Exact màu custom cũ không khôi phục được sau khi tab `ĐƠN HÀNG` từng bị recreate vì typed-column lock; hiện đã dựng lại màu trạng thái bằng conditional formatting.

## Correction 2026-05-28 - Thu Chi Order Sync Repair

Vấn đề phát hiện sau khi gộp `ĐƠN HÀNG`:

- `THU CHI` bị append trùng nhiều dòng doanh thu đơn.
- Cột `NGÀY THU` có serial date như `46150.0`.
- Marker đối chiếu bị lệch giữa `AUTO-ĐƠN-*` và `AUTO-DON-*`, nên backfill không nhận ra đơn đã có.
- Dòng `Vốn` 10.000.000 nằm trong bảng thu trong khi đã có ô `Số dư đầu kỳ`, làm `Tổng thu` bị lẫn vốn với doanh thu vận hành.

Đã sửa logic:

- Marker doanh thu đơn chuẩn hóa về ASCII: `AUTO-DON-{mã đơn}`.
- Hàm đọc marker nhận cả dạng cũ có dấu và dạng mới không dấu.
- Khi repair, bỏ toàn bộ dòng thu doanh thu đơn auto cũ rồi dựng lại từ `ĐƠN HÀNG`, mỗi paid order đúng 1 dòng.
- Convert ngày thu sang `yyyy-MM-dd`.
- Chuyển dòng `Vốn` vào `Số dư đầu kỳ`, không tính trong `Tổng thu`.
- Giữ nguyên bảng chi.

Kết quả live sau repair:

```text
Backup: BACKUP_THU_CHI_20260528_234545
THU rows: 31
CHI rows: 68
duplicateThuRefs: []
openingBalance: 16,000,000đ
totalThu: 6,121,000đ
totalChi: 17,564,500đ
finalBalance: 4,556,500đ
```

Ghi chú QA:

- `DASHBOARD` phần `DOANH THU` đang đọc theo dòng tiền đã thu trong `THU CHI`: 6.121.000đ.
- `DASHBOARD` phần `TỔNG QUAN ĐƠN HÀNG` vẫn hiển thị tổng doanh thu sau CK của toàn bộ đơn: 8.235.000đ, bao gồm cả đơn chưa thanh toán.
- Chênh lệch này là đúng theo logic cashflow vs order pipeline, nhưng nên đổi nhãn dashboard nếu founder dễ nhầm.

## Correction 2026-05-29 - Apps Script Order Form

Quyết định chốt theo feedback của Anh:

- Không dùng layout `Món 1..5 / SL 1..5` vì nếu khách mua nhiều loại bánh thì mở rộng cột rất kém.
- Không bắt Founder gõ tay tóm tắt món vào một ô multiline.
- `ĐƠN HÀNG` là bảng tổng hợp để đọc/lọc/đổi trạng thái, mỗi đơn chỉ 1 dòng.
- `ĐƠN HÀNG - MÓN` là data sheet ẩn, mỗi món 1 dòng, dùng cho dashboard/thu chi/tổng hợp.
- Nhập đơn mới bằng sidebar Apps Script: menu `MOCO > Nhập đơn mới`.

Đã triển khai code:

- Thêm file `MOCO_Order_Form.html` làm sidebar form.
- Thêm `MOCO_SHOW_ORDER_FORM()` để mở form trong Google Sheet.
- Thêm `MOCO_GET_ORDER_FORM_DATA()` để nạp menu bánh, option trạng thái, ngày hiện tại, mã đơn tiếp theo.
- Thêm `MOCO_SAVE_ORDER_FROM_FORM(payload)` để validate và ghi đơn:
  - append 1 dòng vào `ĐƠN HÀNG`;
  - append N dòng vào `ĐƠN HÀNG - MÓN`;
  - tính tổng SL, tổng tiền món, khuyến mại, ship, doanh thu sau CK;
  - giữ SĐT dạng text để không mất số 0 đầu;
  - nếu `TT thanh toán = Đã nhận tiền` thì sync sang `THU CHI`.
- Cập nhật menu `MOCO` để có nút `Nhập đơn mới`.
- Cập nhật `DASHBOARD` đọc lại đúng cột compact mới.
- Cập nhật `THU CHI` để header map nhận layout mới.

Trạng thái live sau khi áp dụng:

```text
ĐƠN HÀNG
lastRow: 42
lastColumn: 19
merged ranges: none
sample phone: 0785208272

ĐƠN HÀNG - MÓN
hidden data sheet
detailRows: 77

DASHBOARD
formula errors: []
total orders: 41
delivered: 31
paid: 31
unpaid: 10
order revenue after CK: 8,235,000đ
cashflow revenue: 6,121,000đ
total chi: 17,564,500đ
final balance: 4,556,500đ
```

Đã dọn sheet ẩn:

- Xóa các backup/detail cũ không cần thiết.
- Giữ lại latest order backup, latest thu chi backup, và `ĐƠN HÀNG - MÓN` đang ẩn.

QA cần Founder duyệt tiếp:

- `MENU & GIÁ` đang có duplicate `KETO LEMON CHEESECAKE 14cm` với 2 giá/SKU khác nhau.
- `Basque burn cheesecake` đang có giá 0 trong menu, nên form có thể tính sai nếu Founder chọn món này trước khi cập nhật giá bán.
- Chưa tạo đơn test giả lập trên live sheet để tránh làm bẩn dữ liệu thật; đã validate dữ liệu form, syntax, layout, dashboard và thu chi.

Update UX nhỏ:

- `MOCO_SHOW_ORDER_FORM()` đổi từ sidebar sang modeless dialog rộng `860 x 720`.
- Form `MOCO_Order_Form.html` đổi layout 2 cột: thông tin đơn bên trái, món trong đơn bên phải, thanh toán/trạng thái phía dưới.
- Nút `Lưu đơn` cố định ở đáy form để dễ thao tác khi danh sách món dài.
- Trường `SL` trong form đơn hàng khóa về số nguyên: UI dùng `min=1`, `step=1`; backend `MOCO_SAVE_ORDER_FROM_FORM()` từ chối số lượng thập phân.

Update cleanup sheet tạm:

- Lý do từng có nhiều `SOURCE_*`/`BACKUP_*`: mỗi lần import/merge từ sheet gốc hoặc sửa dữ liệu lớn đều tạo staging/backup để không ghi đè mất dữ liệu trong lúc chuẩn hóa.
- Sau khi chốt Apps Script order form và validate dashboard/thu chi, các staging/backup này không còn cần giữ trong file vận hành.
- Đã thêm `MOCO_AUDIT_TEMP_SHEETS()` và `MOCO_CLEANUP_TEMP_SHEETS()` để audit/xóa có kiểm soát.
- Đã xóa live 55 sheet tạm/backup:
  - `SOURCE_*`
  - `BACKUP_*`
  - `BACKUP_IMPORT_*`
  - `BACKUP_REPAIR_*`
  - `BACKUP_THU_CHI_RECONCILE_*`
  - `BACKUP_DON_HANG_STANDARDIZE_*`
- Kết quả sau cleanup: `remainingTempCount = 0`.
- Giữ lại `ĐƠN HÀNG - MÓN` vì đây là sheet ẩn bắt buộc cho form/dashboard, không phải backup.
