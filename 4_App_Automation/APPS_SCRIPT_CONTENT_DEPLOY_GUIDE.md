# Hướng dẫn cài đặt công cụ soạn nội dung

Tài liệu này hướng dẫn đưa tệp [`MOCO_CONTENT_GEN.gs`](MOCO_CONTENT_GEN.gs) vào một Google Sheet thử nghiệm. Công cụ nhận yêu cầu trong bảng tính, gửi yêu cầu đến Gemini và lưu bản nháp để người dùng kiểm tra.

## 1. Chuẩn bị

1. Tạo khóa truy cập tại [Google AI Studio](https://aistudio.google.com/apikey).
2. Tạo một Google Sheet dùng riêng cho việc thử nghiệm.
3. Không đăng khóa truy cập lên GitHub, tài liệu chia sẻ hoặc ảnh chụp màn hình.

## 2. Cài mã nguồn

1. Trong Google Sheet, chọn **Tiện ích mở rộng → Apps Script**.
2. Tạo tệp mới tên `MOCO_CONTENT_GEN`.
3. Dán nội dung của [`MOCO_CONTENT_GEN.gs`](MOCO_CONTENT_GEN.gs) vào tệp.
4. Mở **Cài đặt dự án → Thuộc tính tập lệnh**.
5. Tạo thuộc tính `GEMINI_API_KEY` và nhập khóa truy cập.
6. Lưu dự án, chạy hàm `setupSheets` và cấp quyền theo hướng dẫn của Google.

## 3. Các bảng được tạo

| Bảng | Mục đích |
|---|---|
| `Content Brief` | Nhập sản phẩm, loại bài, nhóm khách hàng và điểm cần nhấn mạnh |
| `Content Output` | Nhận bản nháp nội dung và gợi ý hình ảnh |
| `Generation Log` | Ghi lại thời gian chạy và trạng thái xử lý |

## 4. Cách sử dụng

1. Điền một dòng yêu cầu trong `Content Brief`.
2. Đặt trạng thái là `Chờ xử lý`.
3. Chọn menu **MOCO Content AI → Tạo nội dung**.
4. Đọc kết quả tại `Content Output`.
5. Đối chiếu với [tài liệu sản phẩm](../3_Content_Engine/moco_menu_products.md) và [quy tắc viết bài](../3_Content_Engine/gem_system_prompt_moco.md).
6. Người dùng sửa và duyệt trước khi đăng.

Không nhập yêu cầu khẳng định một sản phẩm có thể chữa bệnh, an toàn tuyệt đối hoặc phù hợp với mọi người. Thông tin về giá, thành phần, chất gây dị ứng và bảo quản phải được kiểm tra bằng dữ liệu thực tế.

## 5. Một số lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Chưa cấu hình khóa truy cập | Kiểm tra thuộc tính `GEMINI_API_KEY` |
| Quá nhiều yêu cầu trong thời gian ngắn | Chờ một lúc rồi chạy lại |
| Không có dòng cần xử lý | Kiểm tra cột trạng thái trong `Content Brief` |
| Menu chưa xuất hiện | Tải lại Google Sheet |

## 6. Lịch nội dung

Tệp [`MOCO_CONTENT_CALENDAR.gs`](MOCO_CONTENT_CALENDAR.gs) bổ sung bảng theo dõi ngày đăng. Người dùng có thể chuyển các chủ đề đến hạn sang `Content Brief`, sau đó tạo bản nháp theo quy trình trên.

Tài liệu này chỉ mô tả cách cài đặt cho mục đích học tập và trình diễn. Không sử dụng bảng dữ liệu thật của khách hàng khi chưa có biện pháp phân quyền và bảo vệ thông tin phù hợp.
