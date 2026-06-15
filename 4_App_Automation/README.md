# Tuần 4: Các công cụ hỗ trợ vận hành

Thư mục này chứa các chương trình Google Apps Script được xây dựng để giảm thao tác thủ công trong Google Sheets của MOCO Kitchen.

## Các chức năng chính

| Chức năng | Tệp mã nguồn | Mục đích |
|---|---|---|
| Soạn nội dung | [`MOCO_CONTENT_GEN.gs`](MOCO_CONTENT_GEN.gs) | Tạo bản nháp bài đăng từ yêu cầu trong bảng tính |
| Lập lịch nội dung | [`MOCO_CONTENT_CALENDAR.gs`](MOCO_CONTENT_CALENDAR.gs) | Quản lý ngày đăng và chuyển chủ đề sang danh sách cần soạn |
| Tính giá vốn | [`MOCO_COST_AUTO.gs`](MOCO_COST_AUTO.gs) | Tổng hợp chi phí nguyên liệu theo công thức |
| Quản lý nhập hàng | [`MOCO_NHAP_HANG_V2.gs`](MOCO_NHAP_HANG_V2.gs) | Theo dõi nguyên liệu và hỗ trợ lập danh sách mua |
| Theo dõi đơn hàng | [`MOCO_Order_Form.html`](MOCO_Order_Form.html) | Nhập thông tin đơn hàng bằng biểu mẫu |
| Ghi nhận thu chi | [`MOCO_THU_CHI_AUTO.gs`](MOCO_THU_CHI_AUTO.gs) | Cập nhật dòng tiền từ dữ liệu đơn hàng |
| Tổng hợp kết quả | [`MOCO_DASHBOARD.gs`](MOCO_DASHBOARD.gs) | Hiển thị doanh thu, chi phí và sản phẩm bán chạy |

## Cách xem

- Đọc [hướng dẫn cài đặt công cụ soạn nội dung](APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md).
- Mở các tệp `.gs` để xem mã nguồn Google Apps Script.
- Không cần cài đặt để đọc và đánh giá cấu trúc chương trình.

Các tệp chứa thông tin bàn giao kỹ thuật, nhật ký thử nghiệm và dữ liệu truy cập không thuộc bộ tài liệu nộp bài công khai.
