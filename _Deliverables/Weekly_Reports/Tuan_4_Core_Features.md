# Tuần 4 — Xây dựng Core Features

> **Giai đoạn:** 13/04 – 20/04/2026 · **Phase:** Dựng 4 trụ cột của hệ thống
> **Chủ đề:** Hiện thực hóa hệ thống thành các tính năng chạy được, đặc biệt là automation Apps Script.

---

## 🎯 Mục tiêu

Xây 4 phần lõi của AI Hub:
1. **Website** giới thiệu sản phẩm.
2. **Chatbot** tư vấn FAQ sản phẩm (Gemini).
3. **Apps Script automation** cho vận hành Google Sheet.
4. **Knowledge Base** kết nối chatbot.

## 🔍 Phân tích & cách tiếp cận

- Chọn Google Apps Script vì founder vận hành trên Google Sheet → automation ngay trong công cụ quen thuộc.
- Thiết kế các module tách biệt: content generator, nhập hàng, thu chi, dashboard, cost.
- Chatbot dùng `gemini-2.5-flash` với safety settings + guardrails y tế.

## 🛠️ Việc đã làm

- Google Form + Auto Email (Apps Script trigger).
- Hệ thống quản lý kho hàng + cảnh báo tồn kho.
- Web App quản lý đơn hàng (HTML + GAS).
- Khởi tạo **MOCO Content Generator** (sinh bài 1-click trong Sheet).

## 📦 Deliverable & Link

| Hạng mục | Link |
|----------|------|
| Tổng quan App Automation | [4_App_Automation/README.md](../../4_App_Automation/README.md) |
| Content Generator (Apps Script) | [4_App_Automation/MOCO_CONTENT_GEN.gs](../../4_App_Automation/MOCO_CONTENT_GEN.gs) |
| Hướng dẫn deploy | [4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md](../../4_App_Automation/APPS_SCRIPT_CONTENT_DEPLOY_GUIDE.md) |

## ✅ Kết quả

- Nắm vững Apps Script (trigger, web app, UrlFetch gọi Gemini) → nền tảng cho bộ vận hành MOCO ở tuần 5-6.
- Các tính năng lõi đã chạy được độc lập, sẵn sàng tích hợp.
