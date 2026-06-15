# Tuần 4: App Automation & Core Features

Thư mục này chứa các Google Apps Script module được xây dựng để giảm thao tác thủ công trong Google Sheets của MOCO Kitchen.

## Các chức năng chính

| Chức năng | Tệp mã nguồn | Mục đích |
|---|---|---|
| Content Generator | [`MOCO_CONTENT_GEN.gs`](MOCO_CONTENT_GEN.gs) | Tạo content draft từ brief trong Google Sheets |
| Content Calendar | [`MOCO_CONTENT_CALENDAR.gs`](MOCO_CONTENT_CALENDAR.gs) | Quản lý lịch đăng và chuyển topic sang Content Brief |
| Cost Engine | [`MOCO_COST_AUTO.gs`](MOCO_COST_AUTO.gs) | Tổng hợp food cost theo công thức |
| Quản lý nhập hàng | [`MOCO_NHAP_HANG_V2.gs`](MOCO_NHAP_HANG_V2.gs) | Theo dõi nguyên liệu và hỗ trợ lập danh sách mua |
| Order Form | [`MOCO_Order_Form.html`](MOCO_Order_Form.html) | Nhập thông tin đơn hàng bằng form |
| Ghi nhận thu chi | [`MOCO_THU_CHI_AUTO.gs`](MOCO_THU_CHI_AUTO.gs) | Cập nhật dòng tiền từ dữ liệu đơn hàng |
| Dashboard | [`MOCO_DASHBOARD.gs`](MOCO_DASHBOARD.gs) | Hiển thị doanh thu, chi phí và sản phẩm bán chạy |

## Cách xem

- Đọc [Content Generator Deploy Guide](APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md).
- Mở các tệp `.gs` để xem mã nguồn Google Apps Script.
- Không cần cài đặt để đọc và đánh giá cấu trúc chương trình.

Các tệp chứa thông tin bàn giao kỹ thuật, nhật ký thử nghiệm và dữ liệu truy cập không thuộc bộ tài liệu nộp bài công khai.
