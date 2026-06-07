# Tuần 2 — Dữ liệu & Phân tích nghiệp vụ

> **Giai đoạn:** 29/03 – 05/04/2026 · **Phase:** Chuẩn hóa dữ liệu nền, xây kho kiến thức
> **Chủ đề:** Biến dữ liệu thật của founder thành Knowledge Base có cấu trúc cho AI.

---

## 🎯 Mục tiêu

- Chuẩn hóa toàn bộ dữ liệu nền cho hệ thống AI: menu 7 sản phẩm thật với công thức chi tiết.
- Dựng kho kiến thức (Knowledge Base) để AI trả lời chính xác, không bịa.
- Thực hành **NotebookLM** làm nền cho việc kiểm chứng nguồn.

## 🔍 Phân tích & cách tiếp cận

- Lấy công thức thật từ Google Sheet của founder → tách thành 2 dòng: **Keto** (allulose/đường la hán) và **Healthy Baking** (giảm đường tinh luyện).
- Xây **allergen matrix** và bảng chất tạo ngọt để xử lý câu hỏi nhạy cảm (tiểu đường, mẹ bầu, dị ứng).
- Phân tích đối thủ & insight khách hàng để định vị khác biệt.

## 🛠️ Việc đã làm

- Viết KB menu 7 sản phẩm (công thức, nguyên liệu, allergen).
- Viết FAQ dinh dưỡng có guardrails y tế.
- Lập **NotebookLM source manifest** (7 nguồn + bộ câu hỏi test).
- Nghiên cứu đối thủ trực tiếp + chân dung khách hàng.

## 📦 Deliverable & Link

| Hạng mục | Link |
|----------|------|
| Menu 7 sản phẩm (KB) | [3_Content_Engine/moco_menu_products.md](../../3_Content_Engine/moco_menu_products.md) |
| FAQ dinh dưỡng | [3_Content_Engine/moco_faq_nutrition.md](../../3_Content_Engine/moco_faq_nutrition.md) |
| NotebookLM manifest | [2_Knowledge_Base/notebooklm_source_manifest.md](../../2_Knowledge_Base/notebooklm_source_manifest.md) |
| Nghiên cứu đối thủ | [1_Research/competitor_analysis_moco.md](../../1_Research/competitor_analysis_moco.md) |
| Insight khách hàng | [1_Research/customer_insight_moco.md](../../1_Research/customer_insight_moco.md) |

## ✅ Kết quả

- KB chuẩn hóa theo 7 SP thật → AI nói đúng sản phẩm, đúng nguyên liệu.
- Bộ guardrails y tế/allergen sẵn sàng cho chatbot và content ở các tuần sau.
