# MOCO App Automation - Handoff 2026-05-10

File này dùng để resume trên máy Mac/Antigravity mà không phải đọc lại toàn bộ hội thoại.

## 0. Quy tắc giao tiếp bắt buộc

- Không tự suy diễn xưng hô với người dùng.
- Không gọi người dùng là "chị". Nếu chưa đọc được hồ sơ cá nhân trong `AI_Command_Center`, dùng xưng hô trung tính.
- Trước khi làm tiếp trong repo này, đọc `AGENTS.md` ở root repo và các rule liên quan nếu cần.
- Khi làm trên Google Sheet đang được founder sửa trực tiếp: chỉ sửa phạm vi đã được yêu cầu, không clean/rebuild rộng nếu không cần.

## 1. Workspace và Google Sheet live

Repo Windows:

```text
C:\Antigravity\AI_Command_Center
```

Thư mục task:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation
```

Google Sheet live:

```text
https://docs.google.com/spreadsheets/d/1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y/edit
```

Spreadsheet ID:

```text
1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y
```

Apps Script ID:

```text
1I5X8oe-A9ZEqvx1as3lLmGUFVHsnsW-GiAMWNzQG-CBArDWTbEE7x8ET
```

`clasp` đã cấu hình trong thư mục task:

```text
.clasp.json
.claspignore
```

Deployments sau khi dọn tạm thời:

```text
Chỉ còn deployment chính: AKfycbwZY3M90n6iOF3ZFUg6m5vuH-hXSCjF_BzaCvzJYYs @HEAD
```

Không để token tạm trong code. `CODEX_TEMP_WEB_APP_TOKEN` phải là chuỗi rỗng.

## 2. File Apps Script hiện đang dùng

Các file `.gs` cần push bằng `clasp`:

```text
MOCO_NHAP_HANG_V2.gs
MOCO_MASTER_NVL.gs
MOCO_THU_CHI_AUTO.gs
MOCO_DASHBOARD.gs
MOCO_COST_AUTO.gs
appsscript.json
```

Lệnh syntax check đã dùng:

```powershell
& 'C:\Program Files\nodejs\node.exe' -e "const fs=require('fs'),vm=require('vm'); for (const p of process.argv.slice(1)) new vm.Script(fs.readFileSync(p,'utf8'),{filename:p}); console.log('OK syntax')" "MOCO_NHAP_HANG_V2.gs" "MOCO_MASTER_NVL.gs" "MOCO_THU_CHI_AUTO.gs" "MOCO_DASHBOARD.gs" "MOCO_COST_AUTO.gs"
```

Lệnh push:

```powershell
& 'C:\Users\ADMIN\AppData\Roaming\npm\clasp.cmd' push --force
```

## 3. Trạng thái đã hoàn thành

### 3.1. NHẬP HÀNG

Đã chuẩn hóa theo cấu trúc:

```text
A NGÀY NHẬP
B TÊN HÀNG HOÁ
C LOẠI HÀNG
D SL MUA
E QUY CÁCH
F ĐƠN VỊ
G GIÁ NHẬP
H ĐƠN GIÁ / 1 ĐV
I NHÀ CUNG CẤP
J GHI CHÚ
```

Cột H hiện là công thức thật, không phải value Apps Script ghi cứng:

```excel
=IF(OR($G2="";$D2="";$F2="");NA();IF(OR(LOWER($F2)="g";LOWER($F2)="ml");IF($E2="";NA();$G2/($D2*$E2));$G2/$D2))
```

Ý nghĩa:

- Nếu `g/ml`: giá nhập / (SL mua x quy cách).
- Nếu `cái/quả/bộ/túi`: giá nhập / SL mua.
- Thiếu dữ liệu thì hiện `#N/A` để biết dòng chưa đủ dữ liệu.

Đã thay dòng cũ `In tem nhãn` bằng 5 dòng chi tiết báo giá in ấn:

- Đai giấy Keto tiramisu 35,9x5cm C150 - 100 cái - 209.000 đ
- Đai giấy chuối yến mạch Choco 22x6cm C150 - 100 cái - 170.000 đ
- Thẻ Moco thank you 8x5cm C250 - 100 cái - 105.000 đ
- Tem Moco decal giấy 7x7cm bo góc - 400 cái - 297.000 đ
- Tem Moco bánh mì soda nguyên cám decal giấy 12x8cm bo góc - 100 cái - 162.000 đ

Lưu ý: không còn dòng tổng `In tem nhãn` cũ.

### 3.2. Lịch sử giá nhập

`MOCO_REFRESH_HISTORY()`:

- Rải lại công thức H cho tất cả dòng hiện có.
- Bảng lịch sử ở `L:U`.
- So sánh tăng/giảm theo `ĐƠN GIÁ / 1 ĐV`, không so sánh theo giá gói/hộp.

Bài học quan trọng:

- Muốn so sánh giá nhập giữa các lần mua phải quy về cùng đơn vị, ví dụ đ/g hoặc đ/ml.
- Ví dụ Allulose 200g, 400g, 1000g không được so sánh theo tổng tiền; phải so theo đ/g.

### 3.3. Master NVL

`Master NVL` hiện đọc giá từ cột H của `NHẬP HÀNG`.

Không tự tính lại từ G/D/E/F trong Master nữa, vì cột H là source chuẩn cho đơn giá / 1 đơn vị.

### 3.4. Thu - Chi

Đã sửa lỗi nghiêm trọng: `10.000.000` là vốn ban đầu, không phải doanh thu.

Nguồn gốc đã đối chiếu:

- Link user gửi có `gid=769383986`, nhưng gid này export ra `NHẬP HÀNG`.
- Tab gốc `Thu - Chi` thực tế có gid `1408507472`.

File gốc có dòng:

```text
TỔNG VỐN ĐẦU TƯ BAN ĐẦU | THU 10.000.000 | CHI 0 | SỐ DƯ 16.000.000
```

Đã sửa live:

- Đưa dòng vốn về đầu bảng `Thu - Chi`.
- Rebuild lại số dư từ vốn ban đầu.
- Không để dòng 10tr trôi xuống cuối bảng như giao dịch thu.
- `MOCO_REBUILD_THU_CHI()` hiện nhận diện dòng vốn và giữ ở đầu bảng.

Kết quả sau rebuild gần nhất:

```text
DOANH THU vận hành: 2.036.000 đ
TỔNG CHI: 14.497.500 đ
LỢI NHUẬN RÒNG: -12.461.500 đ
SỐ DƯ HIỆN TẠI: 3.538.500 đ
```

Còn 2 dòng `Mua NVL` ngày 09/05/2026 và 10/05/2026 chưa có tiền chi. Không tự xóa vì có thể là founder nhập dở.

### 3.5. Dashboard

Đã sửa `📊 Dashboard`:

- KPI `DOANH THU` không cộng dòng vốn ban đầu.
- KPI `SỐ DƯ HIỆN TẠI` lấy dòng cuối cùng cột F bằng `FILTER + INDEX`, không nhầm dòng vốn.
- Công thức dùng locale dấu `;`.
- Đã tạo lại dashboard live sau khi sửa Thu-Chi.

## 4. Cost automation hiện tại

File chính:

```text
MOCO_COST_AUTO.gs
```

Sheet output:

```text
COST TỪ CÔNG THỨC
COST REVIEW CẦN XỬ LÝ
```

Nguồn dữ liệu đã chốt:

- `Công thức bánh`: source chuẩn cho công thức nguyên liệu.
- `Master NVL`: source giá cho nguyên liệu mua ngoài.
- `COST DỰ KIẾN`: chỉ giữ metadata không liên quan nguyên liệu, ví dụ thành phẩm, bao bì, giá bán dự kiến, ghi chú vận hành. Không dùng cost nguyên liệu cũ trong sheet này.

`COST REVIEW CẦN XỬ LÝ` hiện là bảng review cho founder:

- Cột H: `Tôi chọn NVL này`
- Cột I: `Giá tạm / 1 đơn vị`
- Cột J: `Ghi chú của tôi`
- Cột K:N là cột kỹ thuật, đang ẩn.

Founder đã sửa/comment 4 dòng đầu của vùng data:

1. `dầu dừa`
   - Founder chọn `Dầu dừa`.
   - Giá đúng là `54đ/ml`.
   - Master đang có `58.000đ/ml`, sai quy cách/đơn vị, không được dùng trực tiếp.

2. `baking powder`
   - Founder nhập `400đ/g`.
   - Ghi chú: đã bổ sung ở sheet `NHẬP HÀNG`.
   - Cần refresh Master NVL hoặc dùng override nếu chưa match được.

3. `baking soda`
   - Founder nhập `121đ/g`.
   - Ghi chú: đã bổ sung ở sheet `NHẬP HÀNG`.
   - Gợi ý cũ match nhầm `Túi giấy craft đựng mỳ soda`; phải bỏ logic gợi ý này.

4. `bánh quy hạnh nhân, bánh cosy`
   - Đây là nguyên liệu mix, không phải một NVL đơn.
   - `bánh quy hạnh nhân` là tự làm, không nhập.
   - `bánh cosy` là hàng mua ngoài nhưng chưa có giá nhập.
   - Không được map cả dòng sang `Bột hạnh nhân`.

## 5. Bài học dữ liệu quan trọng

### 5.1. Vốn ban đầu không phải doanh thu

Không được tính `TỔNG VỐN ĐẦU TƯ BAN ĐẦU` vào doanh thu vận hành.

Nếu Dashboard cần `Doanh thu`, phải loại dòng có cột A là:

```text
TỔNG VỐN ĐẦU TƯ BAN ĐẦU
```

Nếu cần `Số dư`, dùng số dư cuối bảng, không dùng tổng thu - tổng chi nếu chưa định nghĩa rõ vốn.

### 5.2. Giá nhập phải quy về đơn vị nhỏ nhất

Không so sánh giá theo tổng tiền nhập nếu quy cách khác nhau.

Ví dụ:

- 200g giá 139.000
- 400g giá 213.000
- 1000g giá 678.000

Phải quy về đ/g rồi mới kết luận tăng/giảm.

### 5.3. Master NVL chỉ dành cho hàng mua ngoài

Không đưa bán thành phẩm tự làm vào `Master NVL`.

Ví dụ `bánh quy hạnh nhân tự làm`:

- Không bán riêng.
- Không nhập ngoài.
- Chỉ dùng làm nguyên liệu cho bánh khác.
- Phải tính bằng công thức con trong `Công thức bánh`.

### 5.4. Nguyên liệu mix phải tách được cấu phần

Dòng `bánh quy hạnh nhân, bánh cosy | 100g` nghĩa là mix gồm:

- phần `bánh quy hạnh nhân tự làm`: lấy cost từ công thức con.
- phần `bánh Cosy`: lấy giá mua ngoài từ Master NVL hoặc báo thiếu giá.

Không thể tính chính xác nếu không có tỷ lệ mix.

Cần user/founder cung cấp một trong hai cách:

```text
Cách A: tách trong Công thức bánh
bánh quy hạnh nhân tự làm | ?g
bánh Cosy | ?g

Cách B: tạo công thức con
Mix vụn bánh đế cheesecake
- bánh quy hạnh nhân tự làm | ?g
- bánh Cosy | ?g
Thành phẩm | 100g
```

Nếu chưa có tỷ lệ, hệ thống phải báo `MISSING_MIX_RATIO`, không tự chia 50/50.

## 6. Việc đang dở / next step

Next step ưu tiên cao: sửa `MOCO_COST_AUTO.gs` để hỗ trợ 3 nguồn cost:

1. `Master NVL`: nguyên liệu mua ngoài.
2. `Công thức bánh`: bán thành phẩm/công thức con tự làm.
3. `COST REVIEW CẦN XỬ LÝ`: override founder nhập ở cột H/I/J.

Logic đề xuất:

- Đọc review override:
  - Cột C: nguyên liệu trong công thức.
  - Cột H: NVL founder chọn.
  - Cột I: giá tạm / 1 đơn vị.
  - Cột J: ghi chú founder.
- Nếu Cột I có giá hợp lệ, dùng như override giá.
- Nếu Cột H có NVL, ưu tiên match đúng NVL đó.
- Nếu ghi chú nói "đã bổ sung ở NHẬP HÀNG", chạy hoặc hướng dẫn chạy:
  - `MOCO > Refresh lịch sử giá`
  - `MOCO > Refresh Master NVL`
  - rồi tạo lại cost.
- Với nguyên liệu tự làm:
  - match sang recipe/công thức con trong `Công thức bánh`.
  - cần biết tổng thành phẩm của công thức con theo gram/ml/cái.
  - cost trên 1 đơn vị = tổng cost công thức con / output quantity.
- Với dòng mix:
  - cần tách thành components.
  - nếu thiếu tỷ lệ thì đưa vào review với status `MISSING_MIX_RATIO`.

Không nên overwrite `COST REVIEW CẦN XỬ LÝ` nếu founder đang nhập. Nếu cần regenerate, trước tiên phải đọc và merge lại các cột H/I/J đã có.

## 7. Guardrail khi thao tác Google Sheet

- Không chạy `Clean NHẬP HÀNG` nếu user không yêu cầu rõ.
- Không xóa trắng `COST DỰ KIẾN`. Trước đó từng bị mất, user đã khôi phục từ `Bản sao của COST DỰ KIẾN`.
- Không rebuild sheet founder đang sửa nếu chỉ cần sửa vài dòng.
- Dùng deployment tạm chỉ khi cần chạy endpoint từ Codex, xong phải:
  - reset `CODEX_TEMP_WEB_APP_TOKEN = ''`
  - `clasp push --force`
  - `clasp undeploy <deploymentId>`
  - kiểm tra `clasp deployments` chỉ còn deployment chính.

## 8. Trạng thái git đáng chú ý

Các file Apps Script đang modified từ chuỗi công việc này:

```text
MOCO_DASHBOARD.gs
MOCO_MASTER_NVL.gs
MOCO_NHAP_HANG_V2.gs
MOCO_THU_CHI_AUTO.gs
appsscript.json
MOCO_COST_AUTO.gs
.clasp.json
.claspignore
```

Có untracked ngoài phạm vi task, không tự đụng:

```text
04_RnD_Lab/AI_Photo_Prompt_Lab/Projects/Moco_Kitchen/2026-05-10_Menu_Shoot/
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/3_Content_Engine/Visual_Production_Moco/
04_RnD_Lab/Trading_Zone/.../AGENTS.md
04_RnD_Lab/Trading_Zone/.../HANDOFF.md
```

Không revert các thay đổi này nếu user không yêu cầu.

## 9. Quick resume checklist trên Mac

1. Mở repo và đọc file này trước.
2. Chạy `git status --short --branch`.
3. Vào thư mục:

```text
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/4_App_Automation
```

4. Kiểm tra `.clasp.json` có đúng script ID.
5. Chạy syntax check cho các file `.gs`.
6. Nếu cần deploy:

```text
clasp push --force
```

7. Trước khi sửa cost tiếp, đọc live sheet `COST REVIEW CẦN XỬ LÝ`, đặc biệt cột H/I/J, vì founder có thể đã sửa thêm.
8. Không regenerate review nếu chưa preserve cột H/I/J.

