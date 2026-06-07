---
id: 20260507170200
tags: ["#problem-statement", "#RCGC", "#moco-kitchen"]
created: 2026-05-07
updated: 2026-06-07
---

# Problem Statement — MOCO Kitchen AI Marketing Hub

> Framework: **RCGC** (Role – Context – Goal – Constraint) theo yêu cầu Google AI Bootcamp 2026

---

## Mục lục

1. [Role (Vai trò)](#role-vai-trò)
2. [Context (Bối cảnh)](#context-bối-cảnh)
3. [Goal (Mục tiêu)](#goal-mục-tiêu)
4. [Constraint (Ràng buộc)](#constraint-ràng-buộc)
5. [Tài liệu liên quan](#tài-liệu-liên-quan)

---

## Role (Vai trò)

Xây dựng hệ thống **AI Creative & Operations Hub** cho MOCO Kitchen — thương hiệu bánh Healthy online tại Hà Nội, phục vụ nhóm khách hàng quan tâm sức khỏe: người tiểu đường, người ăn kiêng, mẹ bầu, người tập luyện và gia đình muốn ăn lành.

> **Lưu ý về dị ứng:** Sản phẩm **không** phù hợp với người dị ứng đạm sữa bò. Nhiều món sử dụng phô mai/sữa (mascarpone, cream cheese, sữa chua Hy Lạp) và đều được làm chung một gian bếp nên có nguy cơ nhiễm chéo. Mọi tư vấn liên quan dị ứng đều kèm khuyến nghị hỏi kỹ thành phần và tham khảo ý kiến bác sĩ.

## Context (Bối cảnh)

### Thực trạng ngành
- Thị trường bánh Healthy VN tăng trưởng mạnh (2025–2026), đặc biệt trên thương mại điện tử (Shopee, TikTok Shop).
- Khoảng **7 triệu người** mắc tiểu đường type 2 tại VN — nhu cầu thực phẩm thay thế đường rất lớn.
- Gen Z và Millennials dẫn dắt xu hướng "clean label" — minh bạch thành phần, không phụ gia.

### Thực trạng doanh nghiệp (MOCO Kitchen)
- **Quy mô:** Tiệm bánh online nhỏ do 2 founder vận hành tại **Hà Nội**, bán qua Facebook, Instagram và Zalo.
- **Sản phẩm (7 SP thật):** 2 dòng Keto (Keto Tiramisu, Keto Lemon Cheesecake) + 5 dòng Healthy Baking (Chuối Yến Mạch Choco, Bánh Mì Soda Nguyên Cám, Bông Lan Trứng Muối, Carrot Cake Kem Hy Lạp, Bánh Cuộn Quế) — dùng Allulose/đường la hán, trehalose, đường dừa, bột nguyên cám, mascarpone Anchor.
- **Lợi thế:** Thương hiệu đã có sản phẩm thật và khách hàng thật; giọng điệu thương hiệu (brand voice) đã được hệ thống hóa thành bộ quy tắc giao tiếp cho AI — xem [System Prompt / Brand Voice](../3_Content_Engine/gem_system_prompt_moco.md).
- **Hạn chế:**
  - Founder viết mỗi bài Facebook mất 2–3 tiếng.
  - Không có lịch content (content calendar) nhất quán.
  - Quên reply khách → mất đơn hàng.
  - Chưa có landing page/chatbot tư vấn.
  - Ảnh sản phẩm tự chụp, chưa đồng bộ visual.
  - Chưa quản lý cost/đơn hàng/thu chi tập trung.

### Bài toán cốt lõi
> **Làm thế nào để một tiệm bánh Healthy online 2 người có thể vận hành marketing chuyên nghiệp bằng Google AI — từ sáng tạo nội dung, tư vấn khách hàng, quản lý đơn hàng, đến hiện diện online — mà không cần thuê thêm nhân sự?**

## Goal (Mục tiêu)

Xây dựng **"AI Creative & Operations Hub"** — hệ thống tích hợp 6 công cụ Google AI giải quyết 5 bài toán cụ thể:

| # | Bài toán | Công cụ AI | Sản phẩm bàn giao |
|---|---|---|---|
| 1 | Viết content chậm, thiếu nhất quán | **Gemini** (Gem) + bộ quy tắc brand voice | Content Generator: viết bài FB/IG đúng giọng thương hiệu trong vài phút |
| 2 | Thiếu kiến thức dinh dưỡng hệ thống | **NotebookLM** | Kho kiến thức gồm 7 nguồn tài liệu, kèm bộ quy tắc an toàn về sức khỏe (luôn nhắc hỏi bác sĩ, không tuyên bố chữa bệnh) |
| 3 | Hình ảnh chưa chuyên nghiệp | **Banana Pro** + **Veo 3** | Ảnh sản phẩm tạo bằng AI + storyboard video |
| 4 | Quản lý vận hành thủ công (đơn, cost, thu chi) | **Apps Script** + Google Sheets | Order Form + tính cost/food cost + Thu-Chi tự động + Dashboard |
| 5 | Chưa có hiện diện online | **Vercel** | Landing page + chatbot tư vấn sản phẩm |

### Kết quả mong đợi (đã đạt thực tế)
- **Thời gian tạo content:** 2–3 tiếng → khoảng 20 phút/bài (gõ tên bánh, bấm một nút → bài đúng brand voice kèm gợi ý ảnh).
- **Tư vấn khách 24/7:** Chatbot trả lời về sản phẩm và FAQ, tự gắn khuyến nghị an toàn về sức khỏe.
- **Vận hành tập trung:** Đơn hàng, cost (food cost %), thu chi và dashboard KPI trên cùng một Google Sheet.
- **Hiện diện online:** Landing page chạy trên Vercel kèm chatbot.

## Constraint (Ràng buộc)

| Ràng buộc | Chi tiết |
|---|---|
| **Thời gian** | 6 tuần (theo timeline Google AI Bootcamp). |
| **Ngân sách** | $0 — chỉ dùng bản miễn phí (free tier) của Vercel, Google AI Studio và Google Sheets. |
| **Nhân lực** | 1 người thực hiện. |
| **Công cụ** | Yêu cầu tối thiểu 3 công cụ Google AI; dự án sử dụng 6 công cụ: **NotebookLM, Gemini, Google Apps Script, Banana Pro, Veo 3, Vercel**. |
| **Brand voice** | Tuân thủ bộ quy tắc giao tiếp đã thống nhất — "chân thành, không phóng đại" (xem [System Prompt / Brand Voice](../3_Content_Engine/gem_system_prompt_moco.md)). |
| **Tính thực tế** | Sản phẩm hướng tới khả năng áp dụng được cho một doanh nghiệp đang hoạt động, thay vì chỉ dừng ở mức bài tập mô phỏng. |

---

## Tài liệu liên quan

- [Nghiên cứu thị trường bánh Healthy VN](./deep_research_banh_healthy_vn.md)
- [System Prompt / Brand Voice](../3_Content_Engine/gem_system_prompt_moco.md)
- [Báo cáo theo tuần](../_Deliverables/Weekly_Reports/README.md)

[↑ Về mục lục](#mục-lục)

---

*Ngày tạo: 2026-05-07 · Cập nhật: 2026-06-07 · Dự án cuối khóa Google AI Bootcamp 2026*
