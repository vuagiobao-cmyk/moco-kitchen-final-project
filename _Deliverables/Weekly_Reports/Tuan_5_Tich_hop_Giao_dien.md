# Tuần 5 — Tích hợp & Giao diện

**Thời gian:** 21/04 – 07/05/2026
**Tóm tắt:** Ghép các phần đã làm riêng lẻ thành một sản phẩm hoàn chỉnh chạy thông suốt từ đầu đến cuối, đồng thời hoàn thiện giao diện landing page theo nhận diện thương hiệu.

---

## Mục tiêu

- Tích hợp tất cả các phần đã xây dựng riêng (landing page, chatbot, knowledge base, automation) thành một sản phẩm hoàn chỉnh, sử dụng được trong thực tế.
- Hoàn thiện giao diện landing page theo đúng nhận diện thương hiệu — phiên bản Monte v3 với tông xanh matcha.
- Tích hợp chatbot vào landing page.

## Hướng tiếp cận

- Landing page được chuyển sang phong cách editorial tươi, gọn, tông xanh matcha (#355C3B), phù hợp với định hướng "healthy" của thương hiệu và tạo cảm giác sạch sẽ, dễ chịu.
- Chatbot được tích hợp theo cách không để lộ API key (khóa kết nối tới Gemini) ra phía người dùng, thông qua một lớp trung gian. Cách làm này bảo đảm an toàn, tránh bị lạm dụng key.
- Các module quản lý của tiệm (giá vốn, nhập hàng, thu chi, dashboard) được gom về chung một file Google Sheet để vận hành tập trung, thuận tiện cho founder.

## Công việc đã thực hiện

- Hoàn thiện landing page với đầy đủ các phần: cuộn mượt, hiệu ứng hiển thị, phần FAQ, hiển thị tốt trên cả điện thoại và máy tính.
- Tích hợp chatbot có khả năng ghi nhớ ngữ cảnh trong suốt cuộc trò chuyện (multi-turn), giúp tư vấn liền mạch hơn.
- Hợp nhất bộ công cụ vận hành; chuẩn hóa lại module nhập hàng và dashboard giá vốn.

## Sản phẩm bàn giao

| Nội dung | Liên kết |
|----------|----------|
| Landing page (xem trực tiếp) | https://moco-kitchen-ai-hub.vercel.app |
| Mã nguồn landing page và chatbot | [5_Landing_Page_Chatbot/](../../5_Landing_Page_Chatbot/) |
| Tình trạng dự án | [CONTEXT.md](../../CONTEXT.md) |

## Kết quả

- Sản phẩm chạy thông suốt theo đúng hành trình người dùng: khách xem landing page, đặt câu hỏi với chatbot và nhận tư vấn đúng sản phẩm.
- Bộ công cụ vận hành nội bộ hoạt động trong thực tế trên Google Sheet của tiệm.
- Số liệu giai đoạn: hơn 10 file mới và hàng nghìn dòng code; landing page, chatbot và bộ công cụ vận hành đã được tích hợp hoàn chỉnh.
