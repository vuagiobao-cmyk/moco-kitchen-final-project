---
id: "20260522154400"
aliases: ["Demo Script MOCO", "Kịch bản demo 5 phút"]
tags: ["#moco", "#demo", "#presentation"]
created: 2026-05-22
updated: 2026-05-22
---

# DEMO SCRIPT — MOCO AI Creative & Operations Hub

> Kịch bản demo 5 phút cho thuyết trình dự án cuối khóa Google AI Bootcamp 2026

## Chuẩn bị trước demo

### Tabs mở sẵn trên Chrome:
1. **Tab 1:** Landing Page — [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)
2. **Tab 2:** NotebookLM — [notebook](https://notebooklm.google.com/notebook/b7594329-7387-43fc-9a10-1a0d738b2e18)
3. **Tab 3:** Google Sheets (Apps Script Content Generator)
4. **Tab 4:** Google Slides (backup, nếu cần switch)

### Checklist:
- [ ] Internet ổn định
- [ ] Zoom/loa đủ nghe (nếu online)
- [ ] Chatbot đang hoạt động (test 1 query trước)

---

## Kịch bản 5 phút

### 🕐 Phút 0:00 – 0:30 | Giới thiệu bài toán

**Nói:**
> "MOCO Kitchen là thương hiệu bánh Healthy online — bán Keto Tiramisu, Lemon Cheesecake và 5 loại bánh healthy khác. Bài toán: founder viết content mất 2-3 giờ/ngày, thông tin dinh dưỡng dễ sai, brand voice không nhất quán khi thuê CTV."

**Hiển thị:** Slide 2 (Problem Statement)

---

### 🕐 Phút 0:30 – 1:00 | Giải pháp 4 tầng

**Nói:**
> "Giải pháp: Xây AI Hub 4 tầng — Knowledge Base bằng NotebookLM, Content Engine bằng Apps Script + Gemini API, Landing Page responsive, và Chatbot tư vấn sản phẩm. Tổng cộng sử dụng 6 Google AI Tools."

**Hiển thị:** Slide 3-4 (Solution + Tools Matrix)

---

### 🕐 Phút 1:00 – 2:30 | Demo Live: Landing Page + Chatbot

**Chuyển sang Tab 1 (Landing Page)**

**Nói:**
> "Đây là landing page MOCO Kitchen — theme Matcha Green, 6 sections, responsive. Chúng ta scroll qua nhanh."

**Thao tác:**
1. Scroll chậm qua Hero → Products (chỉ 2 dòng sản phẩm) → Story → FAQ
2. Click mở 1 FAQ "Bánh có phù hợp cho người tiểu đường không?" → chỉ disclaimer
3. **Click chatbot widget** (góc phải dưới)

**Nói:**
> "Và đây là chatbot tư vấn — powered by Gemini 2.5 Flash. Thử hỏi một câu nhạy cảm."

**Gõ vào chatbot:**
```
Tôi bị tiểu đường, ăn bánh nào được?
```

**Chờ response → chỉ vào guardrails:**
> "Chatbot tự động khuyên hỏi bác sĩ — đây là guardrails y tế được nhúng trong System Prompt. Không tuyên bố chữa bệnh, không nói ăn thoải mái."

---

### 🕐 Phút 2:30 – 3:30 | Demo Live: Apps Script

**Chuyển sang Tab 3 (Google Sheets)**

**Nói:**
> "Tầng Content Engine — founder điền brief trong Google Sheet, bấm 1 nút, Apps Script gọi Gemini API tạo bài viết chuẩn brand voice."

**Thao tác:**
1. Chỉ sheet Brief — cột Sản Phẩm, Loại Bài, Đối Tượng
2. Chỉ menu "🍰 MOCO Content AI" → chạy generate (hoặc show output đã có)
3. Chỉ sheet Output — bài viết thật + image ideas
4. Chỉ sheet Log — timestamp, status

---

### 🕐 Phút 3:30 – 4:15 | NotebookLM Knowledge Base

**Chuyển sang Tab 2 (NotebookLM)**

**Nói:**
> "Nền tảng của tất cả là Knowledge Base trong NotebookLM — 7 nguồn tài liệu đã chuẩn hóa. NotebookLM đóng vai 'bộ nhớ vàng' — chatbot và content engine đều dựa trên data từ đây."

**Thao tác:**
1. Chỉ danh sách 7 sources
2. Hỏi 1 query nhanh trong NotebookLM chat
3. Chỉ kết quả — có citation từ nguồn

---

### 🕐 Phút 4:15 – 5:00 | Kết quả & Bài học

**Quay lại Slides**

**Nói:**
> "Kết quả: 7 sản phẩm document đầy đủ, 5/5 test queries PASS, 4 tầng automation hoạt động, 6 Google AI tools tích hợp. Thời gian viết content giảm từ 2-3 giờ xuống 20 phút review."

> "Bài học quan trọng nhất: Responsible AI — guardrails y tế không phải hạn chế, đó là bảo vệ cả khách hàng lẫn thương hiệu."

**Hiển thị:** Slide 12-13 (Results + Lessons)

**Kết:**
> "Cảm ơn mọi người. MOCO Kitchen — Heart-Healthy, Soul-Tasty."

---

## Backup Plan

| Tình huống | Xử lý |
|-----------|--------|
| Internet chậm/mất | Dùng screenshots trong slides, không demo live |
| Chatbot API lỗi/quota | Show screenshot kết quả test đã lưu |
| Apps Script lỗi | Show sheet Output có sẵn kết quả |
| NotebookLM chậm | Show screenshot test results |

---

## Related

- [[SLIDE_OUTLINE_TUAN6]]
- [[PHASE5_SIGNOFF]]
