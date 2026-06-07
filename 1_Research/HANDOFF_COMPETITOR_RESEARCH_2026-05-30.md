---
id: "20260530113000"
aliases: ["MOCO Competitor Research Handoff", "Handoff nghiên cứu đối thủ MOCO"]
tags: ["#moco-kitchen", "#handoff", "#competitor", "#research", "#playwright"]
created: 2026-05-30
updated: 2026-05-30
status: "OPEN — chờ agent có Playwright/trình duyệt thực hiện"
skill: "08-nghien-cuu-doi-thu"
---

# HANDOFF — Nghiên cứu đối thủ cạnh tranh MOCO Kitchen

> **Người giao:** @Manager_May (phiên Kiro/Antigravity 2026-05-30)
> **Người nhận:** Agent/máy có **Playwright** hoặc trình duyệt thật truy cập được Facebook (gợi ý: @RnD_Ly)
> **Mức ưu tiên:** Cao — đang chặn việc hoàn thiện phần Research (Tuần 1) của dự án cuối khóa.

---

## 1. Việc cần làm (1 câu)

Vào trực tiếp 2 page Facebook đối thủ, thu thập dữ liệu thật, rồi **điền vào các ô `[CẦN KHẢO SÁT]`** trong file `competitor_analysis_moco.md`.

**2 đối thủ trực tiếp (Sếp chỉ định):**
- **Avo Baking** — https://www.facebook.com/avobaking.hn
- **Bếp Nhà Gừng** — https://www.facebook.com/bepnhagung

---

## 2. VÌ SAO phiên hiện tại CHƯA làm được (làm rõ để khỏi hiểu lầm)

Phiên Kiro/Antigravity ngày 2026-05-30 **không lấy được dữ liệu thật** của 2 page này. Lý do cụ thể:

1. **`web_fetch` trả về lỗi rỗng** với cả 2 URL Facebook — Facebook chặn truy cập nội dung từ fetcher không đăng nhập (trả 38 bytes "Error extracting content").
2. **`remote_web_search` trả kết quả nhiễu** — gõ "Avo Baking Hà Nội" ra toàn "Avo" nhà hàng ở Mỹ/Miami, không phải đối thủ thật ở Hà Nội. Không có nguồn đáng tin về 2 page này.
3. **Phiên này KHÔNG có Playwright / trình duyệt headful** để mở Facebook như người dùng thật.

→ Theo nguyên tắc SSOT của @QA_Thanh: **không bịa** giá/follower/sản phẩm. Vì vậy khung phân tích đã dựng sẵn nhưng để trống các ô dữ liệu thật, chờ agent có công cụ phù hợp.

> **Ghi chú của Sếp:** "Mỗi việc mở Playwright ra thôi mà." → Đúng, agent nào có Playwright/trình duyệt thật chỉ cần mở 2 page là crawl được. Đây không phải việc khó, chỉ là phiên hiện tại thiếu tool.

---

## 3. Công cụ gợi ý

- **Playwright** (ưu tiên) — mở browser thật, điều hướng tới 2 URL, screenshot + đọc DOM.
- Hoặc trình duyệt thường + đọc thủ công (Sếp/founder tự xem cũng được).
- Lưu ý: một số nội dung Facebook cần đăng nhập để xem đầy đủ; nếu cần, dùng phiên trình duyệt đã đăng nhập sẵn.

---

## 4. Dữ liệu cần thu thập (theo skill `08-nghien-cuu-doi-thu`)

Với MỖI đối thủ, lấy đủ 8 mục (điền vào bảng mục 3 của `competitor_analysis_moco.md`):

| # | Trường | Cách lấy |
|---|--------|----------|
| 1 | Định vị / thông điệp chính | Đọc mục "Giới thiệu/About" của page |
| 2 | Phong cách hình ảnh | Xem 10 ảnh gần nhất — tone màu, kiểu chụp, có/không dùng AI |
| 3 | Phân khúc giá | Xem các bài bán hàng có giá, ghi khoảng giá thấp–cao |
| 4 | Dòng sản phẩm chính | Liệt kê các loại bánh họ bán nhiều nhất |
| 5 | Kênh & follower | Số like/follow của page; có IG/TikTok/website không |
| 6 | Tần suất đăng | Đếm số bài/tuần trong ~1 tháng gần nhất |
| 7 | Điểm mạnh / điểm yếu | Quan sát: content, tương tác, dịch vụ, định vị |
| 8 | 3 bài tương tác cao nhất | Link + định dạng + góc độ + lý do hiệu quả (content benchmark) |

Đồng thời chụp **2-3 screenshot/page** làm bằng chứng (lưu vào `1_Research/competitor_screenshots/`).

---

## 5. Output cần bàn giao

1. Điền hết các ô `[CẦN KHẢO SÁT]` trong:
   `04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/1_Research/competitor_analysis_moco.md`
   - Mục 3.1 (Avo Baking), 3.2 (Bếp Nhà Gừng) — 8 trường mỗi đối thủ.
   - Mục 4 (SWOT) — phần Weaknesses/Threats còn để trống.
   - Mục 5 (positioning map) — chốt vị trí thật 2 đối thủ.
   - Mục 6 (content benchmark) — 5 bài/đối thủ.
2. Screenshot lưu vào `1_Research/competitor_screenshots/`.
3. Ghi rõ ngày khảo sát + nguồn (đã đăng nhập hay chưa) để @QA_Thanh verify.

---

## 6. Lưu ý quan trọng (đọc trước khi làm)

- **KHÔNG bịa số liệu.** Ô nào không xem được thì ghi "không xem được — cần đăng nhập" thay vì đoán.
- **KHÔNG copy content đối thủ** vào sản phẩm MOCO — chỉ phân tích để học và định vị khác biệt (xem mục 7 file `competitor_analysis_moco.md`).
- Sau khi điền xong, cập nhật:
  - `competitor_analysis_moco.md` (data + đổi status từ ⚠️ sang ✅)
  - `deep_research_banh_healthy_vn.md` mục 6.1 (bảng đối thủ trực tiếp)
  - `REVIEW_GATE_LOG.md` (ghi "đã có data đối thủ thật")
- Báo lại @Manager_May để chốt lại Tuần 1.

---

## 7. File liên quan

| File | Vai trò |
|------|---------|
| `1_Research/competitor_analysis_moco.md` | Khung phân tích cần điền (đích chính) |
| `1_Research/customer_insight_moco.md` | Insight khách (skill 09) — tham chiếu |
| `1_Research/marketing_plan_moco.md` | Kế hoạch tổng (skill 00) — nơi data đối thủ feed vào SWOT/Moat |
| `1_Research/deep_research_banh_healthy_vn.md` | Research thị trường — mục 6 cần cập nhật sau khi có data |

---

## Related
- [[competitor_analysis_moco]]
- [[marketing_plan_moco]]
- [[customer_insight_moco]]
- [[deep_research_banh_healthy_vn]]
- [[REVIEW_GATE_LOG]]
