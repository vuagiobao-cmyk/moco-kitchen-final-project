# Problem Statement - MOCO Kitchen

MOCO Kitchen là một thương hiệu bánh healthy trực tuyến với sản phẩm thật và nhu cầu truyền thông thực tế. Team cần một hệ thống gọn nhẹ để làm content đều hơn, quản lý thông tin sản phẩm tốt hơn và tạo trải nghiệm giới thiệu sản phẩm chuyên nghiệp hơn.

## Vấn đề chính

| Nhóm vấn đề | Mô tả | Hướng xử lý |
|---|---|---|
| Content | Viết bài thủ công mất thời gian và dễ lệch brand voice | Content Generator bằng Gemini và Google Sheets |
| Knowledge | Thông tin sản phẩm, thành phần và FAQ nằm rải rác | Chuẩn hóa knowledge base và đưa vào NotebookLM |
| Visual | Ảnh sản phẩm cần nhiều biến thể hơn cho menu, landing page và social | Dùng ảnh chụp thật làm nguồn, AI hỗ trợ background và ánh sáng |
| Customer Experience | Khách hàng hay hỏi lại các câu về thành phần, bảo quản và lựa chọn sản phẩm | Landing page và chatbot hỏi đáp sản phẩm |
| Safety | Nội dung liên quan đến sức khỏe cần thận trọng | Guardrails: không chẩn đoán, không hứa hẹn, khuyến nghị hỏi chuyên gia khi cần |

## Mục tiêu dự án

- Tạo một hệ thống AI hỗ trợ marketing cho MOCO Kitchen.
- Giữ thông tin sản phẩm nhất quán giữa knowledge base, content, chatbot và landing page.
- Tăng số lượng và chất lượng hình ảnh bằng workflow dựa trên ảnh sản phẩm thật.
- Tạo được public demo rõ ràng, dễ giải thích trong buổi báo cáo cuối khóa.
