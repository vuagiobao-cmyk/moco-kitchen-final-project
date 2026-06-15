# Tuần 2 — Dữ liệu và phân tích kinh doanh

**Thời gian:** 29/03 – 05/04/2026

**Tóm tắt:** Chuẩn hóa dữ liệu thực tế của MOCO Kitchen thành một kho thông tin rõ ràng để AI có thể trả lời chính xác.

## Mục tiêu

- Chuẩn hóa thông tin của bảy sản phẩm đang bán, gồm nguyên liệu, cách bảo quản và các thành phần cần lưu ý.
- Xây dựng kho thông tin thống nhất cho NotebookLM và chatbot.
- Phân tích nhu cầu khách hàng và bối cảnh cạnh tranh để lựa chọn hướng định vị phù hợp.

## Cách thực hiện

- Đối chiếu công thức thực tế và chia sản phẩm thành hai nhóm: Keto và Healthy Baking.
- Lập bảng chất gây dị ứng cho từng món, đặc biệt là sữa, trứng, hạt, gluten và cồn.
- Viết câu trả lời thận trọng cho các câu hỏi liên quan đến tiểu đường, thai kỳ và dị ứng. Trợ lý chỉ cung cấp thông tin sản phẩm, không thay thế tư vấn của bác sĩ.
- Phân tích đối thủ và nhu cầu của khách hàng.
- Tổng hợp dữ liệu bán hàng, nguồn đơn, thu chi và chi phí dự kiến từ Google Sheet gốc.

## Công việc đã hoàn thành

- Biên soạn tài liệu cho bảy sản phẩm thật của MOCO Kitchen.
- Xây dựng bộ câu hỏi thường gặp về thành phần, dinh dưỡng, bảo quản và đặt hàng.
- Lập danh mục nguồn cho NotebookLM và bộ câu hỏi kiểm tra trước khi demo.
- Hoàn thiện phân tích đối thủ và nhu cầu khách hàng ở mức phù hợp với phạm vi dự án.
- Cập nhật số liệu đến ngày 15/06/2026: 73 đơn, 169 sản phẩm và 12.982.500 đồng thực nhận ghi trong bảng đơn hàng.
- Xác định Threads là kênh đáng ưu tiên, với 24 đơn và 38% số tiền thực nhận.
- Đối chiếu lại công thức để sửa thông tin về khối lượng sản phẩm, chất tạo ngọt và gluten.

## Sản phẩm bàn giao

| Nội dung | Liên kết |
|---|---|
| Thông tin bảy sản phẩm | [Xem tài liệu](../../3_Content_Engine/moco_menu_products.md) |
| Bộ câu hỏi thường gặp | [Xem tài liệu](../../3_Content_Engine/moco_faq_nutrition.md) |
| Danh mục nguồn cho NotebookLM | [Xem tài liệu](../../2_Knowledge_Base/notebooklm_source_manifest.md) |
| Phân tích đối thủ | [Xem tài liệu](../../1_Research/competitor_analysis_moco.md) |
| Nghiên cứu nhu cầu khách hàng | [Xem tài liệu](../../1_Research/customer_insight_moco.md) |
| Tổng hợp dữ liệu kinh doanh đến 15/06/2026 | [Xem tài liệu](../../1_Research/business_data_snapshot_2026-06-15.md) |

## Kết quả

- AI có một kho thông tin thống nhất về sản phẩm, hạn chế trả lời sai hoặc tự suy diễn.
- Khách hàng có thể tra cứu rõ thành phần, cách bảo quản và những điểm cần lưu ý trước khi mua.
- MOCO xác định được hướng khác biệt: sản phẩm thủ công, thông tin minh bạch và trải nghiệm tư vấn thuận tiện.
- Dữ liệu thật giúp phân vai sản phẩm rõ hơn: Chuối Yến Mạch Choco dẫn đầu về số lượng; Cheesecake và Tiramisu dẫn đầu về doanh thu theo giá niêm yết.

---

**Điều hướng:** [← Tuần 1](Tuan_1_Tu_duy_AI_Nghien_cuu.md) · [Mục lục](README.md) · [Tuần 3 →](Tuan_3_Sang_tao_Noi_dung.md)
