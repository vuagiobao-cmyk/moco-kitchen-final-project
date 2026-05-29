---
id: 20260513223500
aliases: ["Phase 2 QA Signoff MOCO", "MOCO Knowledge Base QA"]
tags: ["#moco-kitchen", "#qa", "#knowledge-base"]
created: 2026-05-13
updated: 2026-05-13
---

# Phase 2 QA Sign-off — Knowledge Base & Content Engine

> Scope: kiểm tra và chốt bộ source Tuần 2 / phần đầu Tuần 3 cho MOCO Kitchen AI Marketing Hub.

---

## 1. File Đã Kiểm Tra

| File | Kết quả |
|---|---|
| `moco_menu_products.md` | Đã bổ sung disclaimer, allergen, nutrition ước tính cho đủ 5 sản phẩm, bỏ claim tuyệt đối. |
| `moco_faq_nutrition.md` | Đã chuyển sang tiếng Việt có dấu, thêm guardrails sức khỏe, sửa câu trả lời nhóm dị ứng/tiểu đường/mẹ bầu. |
| `moco_content_calendar_sample.md` | Đã chuyển sang tiếng Việt có dấu, thêm prompt guardrails và lịch tuần kế tiếp. |
| `gem_system_prompt_moco.md` | Đã sửa facts dinh dưỡng để Gem không lặp claim “không ảnh hưởng đường huyết” hoặc “an toàn tuyệt đối”. |
| `2_Knowledge_Base/notebooklm_source_manifest.md` | Đã thêm manifest nguồn để đóng gói Phase 2 và test lại NotebookLM. |

---

## 2. Findings Đã Xử Lý

### Critical — Claim sức khỏe quá mạnh

Đã sửa các claim kiểu “không ảnh hưởng đường huyết”, “phù hợp cho người tiểu đường Type 1/2”, “an toàn tuyệt đối cho mẹ bầu”. Nội dung mới dùng ngôn ngữ có điều kiện: ít đường hơn bánh truyền thống, cần kiểm soát khẩu phần, hỏi bác sĩ/chuyên gia dinh dưỡng khi có bệnh nền.

### Critical — Mâu thuẫn allergen

Đã sửa logic Cookie/Granola và trẻ dị ứng đạm sữa bò. Cookie có bơ/sữa/trứng/hạt nên không còn được gợi ý cho trẻ dị ứng đạm sữa bò. Granola được ghi là cần xác nhận nguy cơ nhiễm chéo.

### Warning — Dữ liệu dinh dưỡng thiếu cho Cheesecake/Granola

Đã bổ sung nutrition ước tính cho đủ 5 sản phẩm. Vẫn cần founder xác nhận theo công thức thực tế trước khi công bố thương mại.

### Warning — FAQ không dấu

Đã chuyển toàn bộ FAQ sang tiếng Việt có dấu, phù hợp hơn cho NotebookLM và brand voice.

### Warning — Thiếu manifest nguồn NotebookLM

Đã thêm `2_Knowledge_Base/notebooklm_source_manifest.md` để ghi source set, guardrails và test queries.

---

## 3. Điều Kiện Trước Khi Demo/Nộp Phase 2

1. Nạp lại các file đã sửa vào NotebookLM.
2. Chụp/lưu bằng chứng danh sách 7 sources trong notebook.
3. Chạy tối thiểu 5 test query trong manifest.
4. Founder xác nhận công thức, khẩu phần, allergen và chính sách vận chuyển.
5. Không demo chatbot như công cụ tư vấn y tế; demo là trợ lý tư vấn sản phẩm/FAQ.

---

## 4. Verdict

**Rating theo Unified Rating Scale:** Pass with Comments  

Phase 2 có thể chốt ở mức **nội bộ/demo có kiểm soát**. Chưa nên công khai chatbot cho khách thật nếu chưa có founder confirmation và test NotebookLM sau khi nạp lại source mới.

---

*Audit: Codex theo @Manager_May + @QA_Thanh, 2026-05-13.*

---

## Related

- [[CODEX_AUDIT_HANDOFF_2026-05-13_KB_CONTENT]]
- [[gem_system_prompt_moco]]
- [[moco_content_calendar_sample]]
- [[moco_faq_nutrition]]
- [[moco_menu_products]]
