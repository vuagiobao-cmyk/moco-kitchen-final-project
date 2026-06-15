# MOCO Kitchen — Dự án ứng dụng Google AI

Đây là dự án cuối khóa Google AI Bootcamp 2026 của Vũ Hoàng Phong, được xây dựng từ nhu cầu thực tế của MOCO Kitchen, một tiệm bánh healthy trực tuyến tại Hà Nội.

**Website:** [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)

## Bài toán

MOCO Kitchen có sản phẩm và khách hàng thật nhưng nguồn lực vận hành còn nhỏ. Những khó khăn chính gồm:

- Viết bài cho mạng xã hội mất nhiều thời gian và khó giữ giọng thương hiệu nhất quán.
- Thông tin sản phẩm, thành phần và cách bảo quản chưa được tập trung ở một nơi.
- Khách hàng thường hỏi lại các câu về đường, dị ứng và cách chọn sản phẩm.
- Đơn hàng, giá vốn, nhập hàng và thu chi được xử lý bằng nhiều thao tác thủ công.
- Thương hiệu chưa có website riêng để giới thiệu sản phẩm và hỗ trợ đặt hàng.

## Giải pháp

Dự án xây dựng một hệ thống gồm hai phần:

### 1. Hỗ trợ nội dung và khách hàng

- Kho thông tin của bảy sản phẩm MOCO Kitchen.
- Bộ hướng dẫn để AI viết đúng giọng thương hiệu.
- Lịch nội dung và các bài viết mẫu.
- Website giới thiệu sản phẩm.
- Trợ lý hỏi đáp về sản phẩm, thành phần, bảo quản và đặt hàng.

### 2. Hỗ trợ vận hành

- Biểu mẫu nhập đơn hàng.
- Theo dõi nguyên liệu và nhập hàng.
- Tính giá vốn nguyên liệu theo công thức.
- Ghi nhận thu chi và tổng hợp số liệu trên Google Sheets.

## Công cụ sử dụng

| Công cụ | Vai trò trong dự án |
|---|---|
| NotebookLM | Đọc và tổng hợp thông tin từ các tài liệu sản phẩm |
| Gemini | Hỗ trợ viết bài và trả lời câu hỏi của khách hàng |
| Google Apps Script | Tự động hóa các thao tác trong Google Sheets |
| Công cụ tạo ảnh của Google | Tạo hình minh họa sản phẩm cho bài trình bày và website |
| Veo 3 | Thử nghiệm ý tưởng video giới thiệu |
| Vercel | Đưa website lên internet |

## Kết quả chính

- Chuẩn hóa thông tin cho bảy sản phẩm thật.
- Xây dựng website hiển thị tốt trên máy tính và điện thoại.
- Tích hợp trợ lý hỏi đáp, không để lộ khóa truy cập dịch vụ AI cho người dùng.
- Tạo công cụ hỗ trợ viết bài ngay trong Google Sheets.
- Tập trung dữ liệu đơn hàng, giá vốn và thu chi vào một hệ thống.
- Giảm thời gian chuẩn bị một bài viết từ khoảng 2–3 giờ xuống còn khoảng 20 phút chỉnh sửa và kiểm tra.

## Cấu trúc dự án

| Thư mục | Nội dung |
|---|---|
| `1_Research/` | Mô tả bài toán, nghiên cứu thị trường, khách hàng và cạnh tranh |
| `2_Knowledge_Base/` | Danh sách tài liệu sử dụng trong NotebookLM |
| `3_Content_Engine/` | Thông tin sản phẩm, câu hỏi thường gặp, lịch và bài viết mẫu |
| `3_Creative_Content/` | Định hướng hình ảnh và video |
| `4_App_Automation/` | Mã nguồn các công cụ trên Google Sheets |
| `5_Landing_Page_Chatbot/` | Mã nguồn website và trợ lý hỏi đáp |
| `6_Deployment_Demo/` | Hướng dẫn và kịch bản trình diễn |
| `_Deliverables/Weekly_Reports/` | Báo cáo tiến độ sáu tuần |

## Bắt đầu đọc dự án

1. [Báo cáo tiến độ sáu tuần](_Deliverables/Weekly_Reports/README.md)
2. [Mô tả bài toán](1_Research/problem_statement_RCGC.md)
3. [Thông tin bảy sản phẩm](3_Content_Engine/moco_menu_products.md)
4. [Hướng dẫn trình diễn](6_Deployment_Demo/README.md)

## Lưu ý về nội dung sức khỏe

Trợ lý của MOCO chỉ cung cấp thông tin về sản phẩm. Dự án không đưa ra chẩn đoán hoặc lời khuyên điều trị. Người có bệnh nền, đang mang thai hoặc có tiền sử dị ứng nên tham khảo bác sĩ hay chuyên gia dinh dưỡng trước khi lựa chọn thực phẩm.
