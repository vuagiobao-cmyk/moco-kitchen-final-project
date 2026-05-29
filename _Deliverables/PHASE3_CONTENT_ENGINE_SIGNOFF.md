---
id: 20260513231000
aliases: ["Phase 3 Sign-off", "Content Engine Sign-off MOCO"]
tags: ["#moco-kitchen", "#deliverable", "#sign-off", "#phase3"]
created: 2026-05-13
updated: 2026-05-13
---

# PHASE 3 — CONTENT ENGINE SIGN-OFF

> **Dự Án Cuối Khóa Google AI Bootcamp 2026**
> **Case Study:** MOCO Kitchen — AI Marketing Hub "0 đồng"
> **Phase:** 3 — Content Engine & Visual Production
> **Status:** ✅ COMPLETED

---

## 1. Tóm Tắt Giai Đoạn

Phase 3 hoàn thành việc xây dựng **Content Engine** — hệ thống tạo nội dung AI tự động cho MOCO Kitchen, bao gồm:
- Knowledge Base V2 chuẩn hoá theo 7 sản phẩm thật
- NotebookLM đã nạp, test, và tạo studio artifacts
- Bộ bài mẫu Facebook tuân thủ Brand Voice DNA
- Visual Prompt Templates cho AI image generation

---

## 2. Deliverables Checklist

### 2A. Knowledge Base V2

| File | Nội dung | Status |
|---|---|:---:|
| `moco_menu_products.md` | 7 sản phẩm, thành phần, chất tạo ngọt, allergen | ✅ |
| `moco_faq_nutrition.md` | FAQ dinh dưỡng, guardrails, tư vấn theo nhóm khách | ✅ |
| `gem_system_prompt_moco.md` | System instruction cho Gemini Pro | ✅ |
| `moco_content_calendar_sample.md` | Lịch nội dung mẫu 2 tuần + tỷ lệ content | ✅ |

### 2B. NotebookLM Integration

| Item | Status | Evidence |
|---|:---:|---|
| Upload 7 sources V2 | ✅ | Notebook `b7594329` |
| Query test — 7 SP đúng | ✅ | `NLM_TEST_RESULTS_V2.md` |
| Query test — Guardrails | ✅ | `NLM_TEST_RESULTS_V2.md` |
| Briefing Doc | ✅ | Artifact `52df964a` |
| Audio Overview (Podcast) | ✅ | Artifact `7e3d4788` |
| Flashcards | ✅ | Artifact `23d2ea05` |
| Quiz (9 câu) | ✅ | Artifact `8ea1a7c7` |
| Mind Map | ✅ | Artifact `9bbeb9ee` |

### 2C. Sample Posts

| Bài | Thể loại | Sản phẩm | Status |
|---|---|---|:---:|
| Bài 1 | Product Post | Keto Tiramisu | ✅ |
| Bài 2 | Education Post | Allulose (liên kết Tiramisu + Cheesecake) | ✅ |
| Bài 3 | BTS / Storytelling | Chuối Yến Mạch Choco | ✅ |
| Bài 4 | Product Post | Carrot Cake Kem Hy Lạp | ✅ |
| Bài 5 | Review / Social Proof | Bánh Mì Cuộn Quế | ✅ |

**QA Matrix:** 5/5 bài pass tất cả guardrails (xem bảng tổng kết trong `moco_sample_posts_gem.md`)

### 2D. Visual Production

| Item | Số lượng | Status |
|---|---|:---:|
| Visual Prompt Templates | 21 (7 SP × 3 góc) | ✅ |
| Style Direction (Japanese Airy) | Documented | ✅ |
| Negative Prompt chuẩn | Documented | ✅ |
| Hướng dẫn sử dụng Google Flow/ImageFX | Documented | ✅ |

---

## 3. Guardrails Compliance Summary

| Quy tắc | Áp dụng | Verified |
|---|---|:---:|
| Xưng "chúng mình", không "shop/cửa hàng" | Toàn bộ | ✅ |
| Không claim chữa bệnh / an toàn tuyệt đối | Toàn bộ | ✅ |
| Disclaimer khẩu phần + hỏi bác sĩ | Mỗi bài + NLM | ✅ |
| Emoji ≤ 3 / bài | 5/5 bài | ✅ |
| Không GenZ slang | 5/5 bài | ✅ |
| Không "MUA NGAY" / hard sell | 5/5 bài | ✅ |
| Nhắc rượu nếu có (Tiramisu) | Bài 1 | ✅ |

---

## 4. File Index — Phase 3

```
3_Content_Engine/
├── gem_system_prompt_moco.md          ← System prompt V2
├── moco_menu_products.md              ← Menu 7 SP
├── moco_faq_nutrition.md              ← FAQ dinh dưỡng
├── moco_content_calendar_sample.md    ← Lịch content mẫu
├── moco_sample_posts_gem.md           ← 5 bài FB mẫu
├── CODEX_AUDIT_HANDOFF_2026-05-13.md  ← Handoff cho Codex audit
├── PHASE2_QA_SIGNOFF_2026-05-13.md    ← Sign-off Phase 2
└── Visual_Production_Moco/
    └── visual_prompt_templates_moco.md ← 21 prompt ảnh AI

_Deliverables/
├── NLM_TEST_RESULTS_V2.md            ← Kết quả test NotebookLM
├── nlm_mind_map_moco.json            ← Mind Map JSON
├── nlm_quiz_moco.html                ← Quiz HTML (9 câu)
├── nlm_flashcards_moco.html          ← Flashcards HTML
├── HANDOFF_CODEX_PHASE1_PHASE2.md    ← Handoff Phase 1+2
├── THU_TUC_BANG_THEO_DOI_CA_NHAN.md  ← Bảng theo dõi cá nhân
└── PHASE3_CONTENT_ENGINE_SIGNOFF.md  ← [THIS FILE]
```

---

## 5. Các Bước Tiếp Theo (Phase 4)

1. **App Automation / Website:**
   - Landing page MOCO Kitchen (Vercel hoặc Google Sites)
   - Google Apps Script tự động gửi email / nhắc đặt hàng
   - Chatbot tích hợp Gemini trên website

2. **Visual Production thực tế:**
   - Founder chụp ảnh sản phẩm + dùng Google Flow revise
   - Dùng 21 prompt templates để gen ảnh 4K trên ImageFX
   - Deadline ảnh: trước 26/5 (hết hạn Google Ultra)

3. **Deploy content thật:**
   - Đăng 5 bài mẫu lên FB MOCO Kitchen
   - Thu thập engagement metrics sau 7 ngày
   - A/B test giữa ảnh chụp thật vs ảnh AI

---

## 6. Sign-off

| Role | Verdict | Note |
|---|---|---|
| @Manager_May | ✅ APPROVED | Đầy đủ deliverables, logic mạch lạc |
| @QA_Thanh | ✅ PASSED | Guardrails nghiêm ngặt, test NLM passed |
| @Writer_Van | ✅ APPROVED | Tone nhất quán, brand voice chuẩn |

**Phase 3 — Content Engine: COMPLETED ✅**

---

*Dự Án Cuối Khóa Google AI Bootcamp K1-2026 | MOCO Kitchen AI Marketing Hub*

---

## Related

- [[HANDOFF_AUDIT_2026-05-14]]
- [[HANDOFF_CODEX_PHASE1_PHASE2_2026-05-13]]
- [[HANDOFF_FINAL_2026-05-14]]
- [[HANDOFF_MOCO_ORDER_SHEET_UI_2026-05-14]]
- [[HANDOFF_SESSION_2026-05-14]]
