# MOCO Google Sheet Automation - Handoff 2026-05-09

## Trạng thái hiện tại

Repo đã đóng gói bộ Apps Script mới cho MOCO Kitchen để thay browser automation bằng menu/Apps Script ổn định hơn.

Các phần đã có trong repo:

- `MOCO_NHAP_HANG_V2.gs`: entrypoint chính, chỉ còn một `onOpen()` và một `onEdit(e)`, có Web App endpoint `doPost(e)`.
- `MOCO_MASTER_NVL.gs`: tạo/reload bảng `Master NVL`, named range `Master_NVL` không gồm header.
- `MOCO_THU_CHI_AUTO.gs`: tự ghi THU từ đơn `done`, chống trùng bằng marker `AUTO-ĐƠN-*`, có `MOCO_REBUILD_THU_CHI()` để backup, dọn dòng trống, sort ngày, tính lại số dư và làm lại UI.
- `MOCO_DASHBOARD.gs`: tạo `📊 Dashboard`, không lỗi nếu chưa có `Master_NVL`.
- `DEPLOY_GUIDE.md`: hướng dẫn copy/paste và thứ tự chạy.
- `MOCO_WEB_APP_DEPLOYMENT.md`, `moco_web_app_call.js`, `moco_web_app.env.example`, `appsscript.json`: bộ chuẩn bị cho Web App endpoint sau này.

## Trạng thái trên Google Sheet live

Đã thấy menu `MOCO` xuất hiện trên Google Sheet, nghĩa là Apps Script đã load được ít nhất một phần code.

Theo trao đổi cuối phiên:

- `Master NVL` đã có.
- `Thu - Chi` bị rối vì dòng auto THU bị chèn sau vùng trống giả và cột mô tả quá hẹp.
- Repo đã sửa lỗi này, nhưng cần paste lại code mới nhất lên Apps Script rồi chạy menu mới.

## Việc cần làm tiếp trên Google Sheet

Làm theo đúng thứ tự:

1. Mở Google Sheet MOCO -> `Tiện ích mở rộng > Apps Script`.
2. Copy đè nội dung file `MOCO_NHAP_HANG_V2.gs` từ repo vào file Apps Script tương ứng.
3. Copy đè nội dung file `MOCO_THU_CHI_AUTO.gs` từ repo vào file Apps Script tương ứng.
4. Bấm Save trong Apps Script.
5. Quay lại Google Sheet và reload trang.
6. Chạy `MOCO > Chuẩn hóa Thu - Chi`.
7. Kiểm tra có sheet backup ẩn dạng `BACKUP_THU_CHI_*`.
8. Kiểm tra tab `Thu - Chi`:
   - Không còn dòng trống giữa bảng.
   - Cột C dễ đọc, không còn chip/dropdown gây rối cho mô tả auto.
   - Cột F `SỐ DƯ` có công thức liên tục.
9. Chạy `MOCO > Backfill THU cho đơn Done` lần nữa để xác nhận không tạo trùng.
10. Chạy `MOCO > Tạo Dashboard tổng hợp` để dashboard đọc lại số liệu mới.

Không chạy `Clean NHẬP HÀNG` nếu sheet nhập hàng hiện tại đã ổn.

## File cần copy vào Apps Script

Chỉ copy các file `.gs` này:

```text
MOCO_NHAP_HANG_V2.gs
MOCO_MASTER_NVL.gs
MOCO_THU_CHI_AUTO.gs
MOCO_DASHBOARD.gs
```

Không copy các file `.md`, `.json`, `.env.example`, hoặc `moco_web_app_call.js` vào Apps Script.

## Kiểm tra đã chạy trong repo

Đã pass các kiểm tra static:

```text
node --check /private/tmp/MOCO_NHAP_HANG_V2.js
node --check /private/tmp/MOCO_MASTER_NVL.js
node --check /private/tmp/MOCO_THU_CHI_AUTO.js
node --check /private/tmp/MOCO_DASHBOARD.js
node --check /private/tmp/moco_apps_script_concat.js
git diff --check -- 4_App_Automation
```

Lưu ý: Node 24 không check trực tiếp đuôi `.gs`, nên đã copy tạm sang `/private/tmp/*.js` để kiểm tra syntax.

## Rủi ro và guardrail

- `MOCO_REBUILD_THU_CHI()` có ghi lại vùng A:F của `Thu - Chi`, nhưng luôn tạo backup ẩn trước.
- Không commit token thật. Token Web App chỉ đặt trong Apps Script Properties hoặc env local.
- Nếu dashboard hiện `#ERROR!`, ưu tiên kiểm tra công thức locale và named range `Master_NVL`.
- Nếu `onEdit` không tự ghi THU vì quyền trigger, tạo installable trigger cho `onEdit` sau.

## Điểm resume nhanh

Khi mở máy ở nhà:

1. `git pull`.
2. Mở file này trước.
3. Copy 2 file mới nhất `MOCO_NHAP_HANG_V2.gs` và `MOCO_THU_CHI_AUTO.gs` lên Apps Script.
4. Chạy `MOCO > Chuẩn hóa Thu - Chi`.
5. Gửi lại screenshot nếu có lỗi ở `Thu - Chi` hoặc `Dashboard`.
