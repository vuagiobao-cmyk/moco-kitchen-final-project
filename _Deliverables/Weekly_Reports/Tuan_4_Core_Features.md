# Tuần 4 — Xây dựng các tính năng chính (Core Features)

**Thời gian:** 13/04 – 20/04/2026
**Tóm tắt:** Bắt đầu hiện thực hóa các phần chính của hệ thống để chạy được trong thực tế, trọng tâm là tự động hóa quy trình trên Google Sheet bằng Apps Script.

---

## Mục tiêu

Xây dựng bốn phần chính của hệ thống:
1. Landing page giới thiệu sản phẩm.
2. Chatbot tư vấn, trả lời câu hỏi về sản phẩm.
3. Automation (tự động hóa) trên Google Sheet để giảm thao tác thủ công cho vận hành.
4. Knowledge base kết nối với chatbot để đảm bảo trả lời đúng.

## Hướng tiếp cận

- MOCO Kitchen đang vận hành trực tiếp trên Google Sheet, nên phần automation được xây ngay trong Sheet bằng Google Apps Script — công cụ lập trình tự động hóa của Google. Cách làm này giúp founder sử dụng ngay trong công cụ quen thuộc, không phải học thêm phần mềm mới.
- Hệ thống được chia thành các module riêng biệt để dễ phát triển và bảo trì: tạo content, nhập hàng, thu chi, dashboard tổng hợp và tính giá vốn (cost).
- Chatbot sử dụng model Gemini, có cấu hình an toàn và kèm khuyến nghị cho các câu hỏi liên quan đến sức khỏe.

## Công việc đã thực hiện

- Xây dựng Google Form đặt hàng tự động gửi email xác nhận cho khách.
- Xây dựng module quản lý kho hàng kèm cảnh báo tự động khi sắp hết hàng.
- Xây dựng web app quản lý đơn hàng cơ bản.
- Khởi tạo công cụ tạo content tự động (MOCO Content Generator) hoạt động ngay trong Google Sheet.

## Sản phẩm bàn giao

| Nội dung | Liên kết |
|----------|----------|
| Giới thiệu phần automation | [4_App_Automation/README.md](../../4_App_Automation/README.md) |
| Công cụ tạo content trong Sheet | [4_App_Automation/MOCO_CONTENT_GEN.gs](../../4_App_Automation/MOCO_CONTENT_GEN.gs) |
| Hướng dẫn cài đặt và deploy | [4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md](../../4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md) |

## Kết quả

- Nắm vững cách dùng Apps Script để tự động hóa Google Sheet (gửi email tự động, web app, kết nối tới Gemini). Đây là nền tảng cho bộ công cụ vận hành của MOCO ở tuần 5 – 6.
- Các tính năng chính đã chạy độc lập được, sẵn sàng để tích hợp thành một hệ thống hoàn chỉnh.

---

**Điều hướng:** [← Tuần 3](Tuan_3_Sang_tao_Noi_dung.md) · [Mục lục các tuần](README.md) · [Tuần 5 →](Tuan_5_Tich_hop_Giao_dien.md)
