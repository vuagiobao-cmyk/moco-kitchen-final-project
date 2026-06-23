# MOCO Kitchen - Dự án ứng dụng Google AI

Đây là dự án cuối khóa Google AI Bootcamp 2026 của Vũ Hoàng Phong, được xây dựng từ nhu cầu thực tế của MOCO Kitchen, một thương hiệu bánh healthy trực tuyến tại Hà Nội.

**Landing page:** [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)

**Google Sheet demo (view only):** [MOCO Kitchen AI workflow](https://docs.google.com/spreadsheets/d/1Ajbsj_xCligByJcebzb5clhamn0hmOtsBhoVSapoFAo/edit?usp=sharing)

## Bài toán

MOCO Kitchen có sản phẩm thật và cần một hệ thống gọn nhẹ để hỗ trợ truyền thông, quản lý thông tin sản phẩm và tư vấn khách hàng. Những khó khăn chính gồm:

- Viết content mất nhiều thời gian và khó giữ brand voice nhất quán.
- Thông tin sản phẩm, thành phần và cách bảo quản nằm rải rác ở nhiều nơi.
- Khách hàng thường hỏi lại các câu về thành phần, dị ứng và cách chọn sản phẩm.
- Hình ảnh sản phẩm cần đủ số lượng và chất lượng cho menu, landing page và social.
- Thương hiệu cần một landing page riêng để giới thiệu sản phẩm và hỗ trợ đặt hàng.

## Giải pháp

Dự án xây dựng một hệ thống gồm năm phần có thể trình bày công khai:

1. Knowledge base cho bảy sản phẩm MOCO Kitchen.
2. Hướng dẫn brand voice và Content Generator bằng Gemini.
3. Workflow hình ảnh sản phẩm: dùng ảnh chụp điện thoại của bánh thật làm nguồn, sau đó dùng AI để thử background, ánh sáng và biến thể hình ảnh.
4. Landing page giới thiệu sản phẩm và câu chuyện thương hiệu.
5. Chatbot hỏi đáp về sản phẩm, thành phần, bảo quản và đặt hàng.

Một số phần vận hành nội bộ đã được tách khỏi repo công khai để tránh đưa dữ liệu nhạy cảm vào bài nộp.

## Công cụ sử dụng

| Công cụ | Vai trò trong dự án |
|---|---|
| NotebookLM | Đọc và tổng hợp knowledge base sản phẩm |
| Gemini | Hỗ trợ viết content và trả lời câu hỏi của khách hàng |
| Google Sheets + Apps Script | Tạo Content Generator và quy trình tạo nội dung |
| Công cụ tạo ảnh của Google | Hỗ trợ thử background, ánh sáng và biến thể hình ảnh sản phẩm |
| Veo 3 | Thử nghiệm ý tưởng video giới thiệu |
| Vercel | Deploy landing page |

## Kết quả chính

- Chuẩn hóa thông tin cho bảy sản phẩm thật.
- Xây dựng landing page responsive.
- Tích hợp chatbot qua serverless API, không để lộ API key trong frontend.
- Tạo Content Generator ngay trong Google Sheets.
- Xây dựng workflow hình ảnh dựa trên ảnh sản phẩm chụp thực tế.
- Xây dựng `DESIGN.md` làm quy chuẩn thiết kế dài hạn cho MOCO Kitchen.
- Chuẩn hóa tài liệu demo và báo cáo tiến độ sáu tuần.

## Cấu trúc dự án

| Thư mục | Nội dung |
|---|---|
| `DESIGN.md` | Quy chuẩn thiết kế MOCO Kitchen: màu sắc, typography, component, hình ảnh, voice và guardrails |
| `1_Research/` | Mô tả bài toán, nghiên cứu thị trường, khách hàng và cạnh tranh |
| `2_Knowledge_Base/` | Danh mục nguồn sử dụng trong NotebookLM |
| `3_Content_Engine/` | Thông tin sản phẩm, FAQ, lịch nội dung và bài viết mẫu |
| `3_Creative_Content/` | Hệ thống hình ảnh và kịch bản phân cảnh video |
| `4_App_Automation/` | Content Generator và hướng dẫn Apps Script cho demo |
| `5_Landing_Page_Chatbot/` | Landing page và chatbot |
| `6_Deployment_Demo/` | Deployment guide và demo script |
| `_Deliverables/Weekly_Reports/` | Báo cáo tiến độ sáu tuần |

## Bắt đầu đọc dự án

1. [Báo cáo tiến độ sáu tuần](_Deliverables/Weekly_Reports/README.md)
2. [Mô tả bài toán](1_Research/problem_statement_RCGC.md)
3. [DESIGN.md - Quy chuẩn thiết kế MOCO Kitchen](DESIGN.md)
4. [Thông tin bảy sản phẩm](3_Content_Engine/moco_menu_products.md)
5. [Hướng dẫn triển khai và trình diễn](6_Deployment_Demo/README.md)

## Lưu ý về nội dung sức khỏe

Trợ lý của MOCO chỉ cung cấp thông tin về sản phẩm. Dự án không đưa ra chẩn đoán hoặc lời khuyên điều trị. Người có bệnh nền, đang mang thai hoặc có tiền sử dị ứng nên tham khảo bác sĩ hay chuyên gia dinh dưỡng trước khi lựa chọn thực phẩm.
