# Tuần 5 — Tích hợp & Giao diện

> **Giai đoạn:** 21/04 – 07/05/2026 · **Phase:** Ghép các phần rời thành một sản phẩm hoàn chỉnh
> **Chủ đề:** Tích hợp website + chatbot + KB + automation thành trải nghiệm liền mạch.

---

## 🎯 Mục tiêu

- Ghép tất cả phần đã làm riêng lẻ thành một sản phẩm chạy được từ đầu đến cuối.
- Hoàn thiện giao diện landing page theo nhận diện thương hiệu (Monte v3 — matcha green).
- Tích hợp chatbot Gemini vào landing qua serverless proxy (ẩn API key).

## 🔍 Phân tích & cách tiếp cận

- Landing chuyển sang phong cách **editorial, matcha green (#355C3B)** — tươi, sạch, đúng tinh thần healthy.
- Chatbot gọi qua `api/chat.js` (serverless) thay vì lộ key ở client.
- Bộ Apps Script vận hành (cost / nhập hàng / thu chi / dashboard) ghép vào một workbook duy nhất.

## 🛠️ Việc đã làm

- Hoàn thiện landing page 9 section (responsive, scroll reveal, FAQ, marquee).
- Tích hợp chatbot multi-turn với System Prompt + guardrails.
- Hợp nhất bộ script vận hành; chuẩn hóa nhập hàng V2, dashboard giá vốn.

## 📦 Deliverable & Link

| Hạng mục | Link |
|----------|------|
| 🌐 Website live | https://moco-kitchen-ai-hub.vercel.app |
| Mã nguồn landing + chatbot | [5_Landing_Page_Chatbot/](../../5_Landing_Page_Chatbot/) |
| Snapshot trạng thái dự án | [CONTEXT.md](../../CONTEXT.md) |

## ✅ Kết quả

- Sản phẩm chạy xuyên suốt: khách xem web → hỏi chatbot → nhận tư vấn đúng sản phẩm.
- Bộ vận hành nội bộ hoạt động trên một Google Sheet thật của founder.
- **Số liệu giai đoạn:** 12+ files mới, hàng nghìn dòng code; landing + chatbot + ops suite tích hợp xong.
