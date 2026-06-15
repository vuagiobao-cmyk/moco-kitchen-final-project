# Deploy Guide — MOCO Content Generator

Tài liệu này hướng dẫn deploy [`MOCO_CONTENT_GEN.gs`](MOCO_CONTENT_GEN.gs) vào Google Sheets. Công cụ nhận brief, gửi prompt đến Gemini và lưu content draft để founder kiểm tra.

## 1. Chuẩn bị

1. Tạo API key tại [Google AI Studio](https://aistudio.google.com/apikey).
2. Tạo một Google Sheet dùng riêng cho việc thử nghiệm.
3. Không đăng API key lên GitHub, tài liệu chia sẻ hoặc ảnh chụp màn hình.

## 2. Cài mã nguồn

1. Trong Google Sheet, chọn **Tiện ích mở rộng → Apps Script**.
2. Tạo tệp mới tên `MOCO_CONTENT_GEN`.
3. Dán nội dung của [`MOCO_CONTENT_GEN.gs`](MOCO_CONTENT_GEN.gs) vào tệp.
4. Mở **Cài đặt dự án → Thuộc tính tập lệnh**.
5. Tạo Script Property `GEMINI_API_KEY` và nhập API key.
6. Lưu dự án, chạy hàm `setupSheets` và cấp quyền theo hướng dẫn của Google.

## 3. Các bảng được tạo

| Bảng | Mục đích |
|---|---|
| `Content Brief` | Nhập product, content type, target audience và key message |
| `Content Output` | Nhận content draft và visual idea |
| `Generation Log` | Ghi lại thời gian chạy và status |

## 4. Cách sử dụng

1. Điền một dòng yêu cầu trong `Content Brief`.
2. Đặt trạng thái là `Chờ xử lý`.
3. Chọn menu **MOCO Content AI → Tạo nội dung**.
4. Đọc kết quả tại `Content Output`.
5. Đối chiếu với [Product Knowledge](../3_Content_Engine/moco_menu_products.md) và [Brand Voice Guide](../3_Content_Engine/gem_system_prompt_moco.md).
6. Founder edit và approve trước khi đăng.

Không nhập yêu cầu khẳng định một sản phẩm có thể chữa bệnh, an toàn tuyệt đối hoặc phù hợp với mọi người. Thông tin về giá, thành phần, chất gây dị ứng và bảo quản phải được kiểm tra bằng dữ liệu thực tế.

## 5. Một số lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Chưa cấu hình API key | Kiểm tra Script Property `GEMINI_API_KEY` |
| Quá nhiều yêu cầu trong thời gian ngắn | Chờ một lúc rồi chạy lại |
| Không có dòng cần xử lý | Kiểm tra cột trạng thái trong `Content Brief` |
| Menu chưa xuất hiện | Tải lại Google Sheet |

## 6. Content Calendar

Tệp [`MOCO_CONTENT_CALENDAR.gs`](MOCO_CONTENT_CALENDAR.gs) bổ sung bảng theo dõi ngày đăng. Người dùng có thể chuyển các chủ đề đến hạn sang `Content Brief`, sau đó tạo bản nháp theo quy trình trên.

Tài liệu này chỉ mô tả cách cài đặt cho mục đích học tập và trình diễn. Không sử dụng bảng dữ liệu thật của khách hàng khi chưa có biện pháp phân quyền và bảo vệ thông tin phù hợp.
