# Tuần 4 — Xây dựng các tính năng chính

**Thời gian:** 13/04 – 20/04/2026
**Tóm tắt:** Bắt đầu dựng các phần chính của hệ thống để chạy được trong thực tế, trọng tâm là tự động hóa trên Google Sheet.

---

## Mục tiêu

Xây dựng bốn phần chính:
1. Trang web giới thiệu sản phẩm.
2. Chatbot trả lời câu hỏi về sản phẩm.
3. Tự động hóa trên Google Sheet để giảm thao tác thủ công.
4. Bộ tài liệu nền kết nối với chatbot.

## Hướng tiếp cận

- Tiệm đang vận hành trên Google Sheet, nên phần tự động hóa được xây trực tiếp trong Sheet bằng Google Apps Script (công cụ tự động hóa của Google) để chủ tiệm dễ sử dụng.
- Chia thành các phần riêng: viết nội dung, nhập hàng, thu chi, bảng tổng hợp và tính giá vốn.
- Chatbot sử dụng Gemini, kèm khuyến nghị an toàn cho các câu hỏi liên quan đến sức khỏe.

## Công việc đã thực hiện

- Xây dựng biểu mẫu đặt hàng tự động gửi email xác nhận.
- Xây dựng phần quản lý kho kèm cảnh báo khi sắp hết hàng.
- Xây dựng ứng dụng nhận đơn hàng cơ bản.
- Khởi tạo công cụ tạo nội dung tự động ngay trong Google Sheet.

## Sản phẩm bàn giao

| Nội dung | Liên kết |
|----------|----------|
| Giới thiệu phần tự động hóa | [4_App_Automation/README.md](../../4_App_Automation/README.md) |
| Công cụ tạo nội dung trong Sheet | [4_App_Automation/MOCO_CONTENT_GEN.gs](../../4_App_Automation/MOCO_CONTENT_GEN.gs) |
| Hướng dẫn cài đặt | [4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md](../../4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md) |

## Kết quả

- Nắm được cách tự động hóa Google Sheet, làm nền cho bộ công cụ vận hành ở các tuần sau.
- Các tính năng chính đã chạy được độc lập, sẵn sàng để tích hợp.
