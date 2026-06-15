# MOCO Kitchen — Dự án ứng dụng Google AI

Đây là dự án cuối khóa Google AI Bootcamp 2026 của Vũ Hoàng Phong, được xây dựng từ nhu cầu thực tế của MOCO Kitchen, một tiệm bánh healthy trực tuyến tại Hà Nội.

**Website:** [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)

## Bài toán

MOCO Kitchen có sản phẩm và khách hàng thật nhưng chỉ có hai founder trực tiếp vận hành. Những khó khăn chính gồm:

- Viết content mất nhiều thời gian và khó giữ brand voice nhất quán.
- Thông tin sản phẩm, thành phần và cách bảo quản chưa được tập trung ở một nơi.
- Khách hàng thường hỏi lại các câu về đường, dị ứng và cách chọn sản phẩm.
- Đơn hàng, giá vốn, nhập hàng và thu chi được xử lý bằng nhiều thao tác thủ công.
- Thương hiệu chưa có landing page riêng để giới thiệu sản phẩm và hỗ trợ đặt hàng.

## Giải pháp

Dự án xây dựng một hệ thống gồm hai phần:

### 1. Content & Customer Experience

- Knowledge base của bảy sản phẩm MOCO Kitchen.
- Bộ hướng dẫn để AI viết đúng brand voice.
- Lịch nội dung và bộ bài đăng mẫu cho Facebook/Instagram.
- Landing page giới thiệu sản phẩm.
- Chatbot hỏi đáp về sản phẩm, thành phần, bảo quản và đặt hàng.

### 2. Operations & Automation

- Biểu mẫu nhập đơn hàng.
- Theo dõi nguyên liệu và nhập hàng.
- Tính giá vốn nguyên liệu theo công thức.
- Ghi nhận thu chi và dashboard tổng hợp trên Google Sheets.

## Công cụ sử dụng

| Công cụ | Vai trò trong dự án |
|---|---|
| NotebookLM | Đọc và tổng hợp knowledge base sản phẩm |
| Gemini | Hỗ trợ viết content và trả lời câu hỏi của khách hàng |
| Google Apps Script | Xây dựng automation trong Google Sheets |
| Công cụ tạo ảnh của Google | Tạo hình minh họa sản phẩm cho bài trình bày và website |
| Veo 3 | Thử nghiệm ý tưởng video giới thiệu |
| Vercel | Deploy landing page |

## Kết quả chính

- Chuẩn hóa thông tin cho bảy sản phẩm thật.
- Xây dựng responsive landing page.
- Tích hợp chatbot, không để lộ API key cho người dùng.
- Tạo Content Generator ngay trong Google Sheets.
- Tập trung dữ liệu đơn hàng, giá vốn và thu chi vào một hệ thống.
- Giảm thời gian chuẩn bị một bài viết từ khoảng 2–3 giờ xuống còn khoảng 20 phút chỉnh sửa và kiểm tra.

## Cấu trúc dự án

| Thư mục | Nội dung |
|---|---|
| `1_Research/` | Mô tả bài toán, nghiên cứu thị trường, khách hàng và cạnh tranh |
| `2_Knowledge_Base/` | Danh mục nguồn sử dụng trong NotebookLM |
| `3_Content_Engine/` | Thông tin sản phẩm, câu hỏi thường gặp, lịch nội dung và bài viết mẫu |
| `3_Creative_Content/` | Visual concepts và video storyboard |
| `4_App_Automation/` | Mã nguồn automation trên Google Sheets |
| `5_Landing_Page_Chatbot/` | Landing page và chatbot |
| `6_Deployment_Demo/` | Deployment guide và demo script |
| `_Deliverables/Weekly_Reports/` | Báo cáo tiến độ sáu tuần |

## Bắt đầu đọc dự án

1. [Báo cáo tiến độ sáu tuần](_Deliverables/Weekly_Reports/README.md)
2. [Mô tả bài toán](1_Research/problem_statement_RCGC.md)
3. [Tổng hợp dữ liệu kinh doanh đến 15/06/2026](1_Research/business_data_snapshot_2026-06-15.md)
4. [Thông tin bảy sản phẩm](3_Content_Engine/moco_menu_products.md)
5. [Hướng dẫn triển khai và trình diễn](6_Deployment_Demo/README.md)

## Lưu ý về nội dung sức khỏe

Trợ lý của MOCO chỉ cung cấp thông tin về sản phẩm. Dự án không đưa ra chẩn đoán hoặc lời khuyên điều trị. Người có bệnh nền, đang mang thai hoặc có tiền sử dị ứng nên tham khảo bác sĩ hay chuyên gia dinh dưỡng trước khi lựa chọn thực phẩm.
