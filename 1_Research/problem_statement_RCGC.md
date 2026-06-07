---
id: 20260507170200
tags: ["#problem-statement", "#RCGC", "#moco-kitchen"]
created: 2026-05-07
updated: 2026-05-07
---

# Problem Statement — MOCO Kitchen AI Marketing Hub

> Framework: **RCGC** (Role - Context - Goal - Constraint) theo yêu cầu Google AI Bootcamp 2026

---

## Role (Vai trò)
Xây dựng hệ thống **AI Creative & Operations Hub** cho MOCO Kitchen — thương hiệu bánh Healthy online tại Hà Nội, phục vụ người tiểu đường, ăn kiêng, mẹ bầu, người tập luyện và trẻ dị ứng đạm sữa bò.

## Context (Bối cảnh)

### Thực trạng ngành
- Thị trường bánh Healthy VN tăng trưởng mạnh (2025-2026), đặc biệt trên TMĐT (Shopee, TikTok Shop).
- Khoảng **7 triệu người** mắc tiểu đường type 2 tại VN — nhu cầu thực phẩm thay thế đường rất lớn.
- Gen Z & Millennials dẫn dắt xu hướng "clean label" — minh bạch thành phần, không phụ gia.

### Thực trạng doanh nghiệp (MOCO Kitchen)
- **Quy mô:** Tiệm bánh online nhỏ do 2 founder vận hành tại **Hà Nội**, bán qua Facebook, Instagram & Zalo.
- **Sản phẩm (7 SP thật):** 2 dòng Keto (Keto Tiramisu, Keto Lemon Cheesecake) + 5 dòng Healthy Baking (Chuối Yến Mạch Choco, Bánh Mì Soda Nguyên Cám, Bông Lan Trứng Muối, Carrot Cake Kem Hy Lạp, Bánh Cuộn Quế) — dùng Allulose/đường la hán, trehalose, đường dừa, bột nguyên cám, mascarpone Anchor.
- **Lợi thế:** Brand voice đã được đúc rút (Content Playbook v1.1), sản phẩm thật, khách hàng thật.
- **Hạn chế:** 
  - Founder viết mỗi bài Facebook mất 2-3 tiếng
  - Không có lịch content nhất quán
  - Quên reply khách → mất đơn hàng
  - Chưa có landing page/chatbot tư vấn
  - Ảnh sản phẩm tự chụp, chưa đồng bộ visual
  - Chưa quản lý cost/đơn hàng/thu chi tập trung

### Bài toán cốt lõi
> **Làm thế nào để một tiệm bánh Healthy online 2 người có thể vận hành marketing chuyên nghiệp bằng Google AI — từ sáng tạo nội dung, tư vấn khách hàng, quản lý đơn hàng, đến hiện diện online — mà không cần thuê thêm nhân sự?**

## Goal (Mục tiêu)

Xây dựng **"AI Creative & Operations Hub"** — hệ thống tích hợp 6 công cụ Google AI giải quyết 5 bài toán cụ thể:

| # | Bài toán | Công cụ AI | Deliverable |
|---|---|---|---|
| 1 | Content creation chậm, không nhất quán | **Gemini Pro** (Gem) + Content Playbook | Content Generator: viết bài FB/IG chuẩn brand voice trong vài phút |
| 2 | Thiếu kiến thức dinh dưỡng hệ thống | **NotebookLM** | Knowledge Base 7 nguồn + guardrails y tế |
| 3 | Visual không chuyên nghiệp | **Banana Pro** + **Veo 3** | Ảnh sản phẩm AI + storyboard video |
| 4 | Quản lý vận hành thủ công (đơn, cost, thu chi) | **Apps Script** + Sheets | Order Form + tính cost/food cost + Thu-Chi tự động + Dashboard |
| 5 | Chưa có hiện diện online | **Vercel** + Antigravity | Landing page (trang đích 1 trang) + Chatbot tư vấn sản phẩm |

### Kết quả mong đợi (đã đạt thực tế)
- **Thời gian tạo content:** 2-3 tiếng → ~20 phút/bài (gõ tên bánh + bấm 1 nút → bài chuẩn brand voice + gợi ý ảnh)
- **Tư vấn khách 24/7:** Chatbot trả lời sản phẩm/FAQ, tự gắn disclaimer y tế
- **Vận hành tập trung:** Đơn hàng, cost (food cost %), thu chi, dashboard KPI trên 1 Google Sheet
- **Hiện diện online:** Landing page live trên Vercel + chatbot

## Constraint (Ràng buộc)

| Ràng buộc | Chi tiết |
|---|---|
| **Thời gian** | 6 tuần (timeline Google AI Bootcamp) |
| **Ngân sách** | $0 — chỉ dùng free tier (Vercel, Google AI Studio, Sheets) |
| **Nhân lực** | 1 người thực hiện (solo project) |
| **Công cụ bắt buộc** | Tối thiểu 3 Google AI tools → dùng 6 tools |
| **Brand voice** | Phải tuân thủ Content Playbook v1.1 — "chân thành, không bốc phét" |
| **Tính thực tế** | Dự án phải áp dụng được cho doanh nghiệp thật đang kinh doanh |

---

## Tóm tắt 1 câu

> MOCO Kitchen AI Creative & Operations Hub giải quyết bài toán **"marketing + vận hành chuyên nghiệp cho tiệm bánh Healthy 2 người"** bằng cách tích hợp 6 công cụ Google AI — từ viết content, tạo ảnh/video, landing page + chatbot tư vấn, đến quản lý đơn hàng/cost/thu chi — trong 6 tuần với ngân sách $0.

---

*Ngày tạo: 2026-05-07 | Dự án cuối khóa Google AI Bootcamp 2026*

---

## Related

- [[deep_research_banh_healthy_vn]]
