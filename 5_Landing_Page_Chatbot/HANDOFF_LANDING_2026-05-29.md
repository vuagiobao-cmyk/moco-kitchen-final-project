---
id: 20260529-handoff-landing
aliases: ["MOCO Landing Handoff 2026-05-29", "Landing Page Monte Redesign Handoff"]
tags: ["#moco-kitchen", "#landing-page", "#handoff", "#design"]
created: 2026-05-29
updated: 2026-05-29
status: "Bản mốc gần nhất — dùng để đối chiếu & chỉnh sửa tiếp"
---

# HANDOFF — MOCO Kitchen Landing Page (Monte Layout Redesign)

> **Mục đích:** Đây là bản mốc (baseline) gần nhất của landing page MOCO Kitchen sau khi redesign theo layout Monte Cafe. Dùng tài liệu này để đối chiếu hiện trạng và tiếp tục chỉnh sửa.

## 1. Tóm tắt nhanh

- **Yêu cầu gốc:** Tái thiết kế landing page MOCO bám layout/cấu trúc của [montecafe.com.au](https://montecafe.com.au/), giữ nguyên **màu matcha green + logo + nội dung MOCO**.
- **Tham khảo design system:** refero.design — "Monte / Warm Terracotta Cafe" (palette giới hạn, typography tương phản, bề mặt phẳng + viền mảnh, bo góc 14–16px, pill 9999px, spacing thoáng).
- **Thương hiệu:** MoCo Kitchen | **Hà Nội**. Bán **bánh** (không bán cà phê). Đặt đơn qua **Zalo + Instagram + Facebook**, không có backend email.
- **Stack:** HTML/CSS/JS tĩnh thuần + chatbot (`chatbot.js` + `api/`), deploy Vercel.

## 2. Vị trí file (folder làm việc chính)

```
04_RnD_Lab/GOOGLE AI ECOSYSTEM K1-2026/Du_An_Cuoi_Khoa/5_Landing_Page_Chatbot/
├── index.html          ← layout mới (Monte v3)
├── style.css           ← ?v=20260529-monte-v3
├── app.js              ← ?v=20260529-monte-v3 (nav overlay, scroll reveal, FAQ)
├── chatbot.js          ← GIỮ NGUYÊN (không đụng)
├── api/                ← GIỮ NGUYÊN (backend chatbot)
├── assets/             ← ảnh sản phẩm + logo (xem mục 6)
├── vercel.json
└── 00_Spec/            ← requirements.md · design.md · tasks.md
```

> ⚠️ **Lưu ý quan trọng:** Tồn tại một bản copy khác tại `03_My_Projects/Moco_Kitchen/5_Landing_Page_Chatbot/`. Mọi chỉnh sửa trong phiên này chỉ áp dụng cho bản trong `04_RnD_Lab/.../Du_An_Cuoi_Khoa/`. **Nếu bản deploy thật nằm ở `03_My_Projects`, cần đồng bộ sang trước khi deploy.**

## 3. Thứ tự section hiện tại (baseline)

| # | Section | Mô tả | Ánh xạ Monte |
|---|---------|-------|--------------|
| — | `.brand-nav` + `.menu-overlay` | Nav trong suốt trên hero → solid khi cuộn; nút MENU mở overlay full màn; wordmark "moco"; nút ĐẶT BÁNH | MENU / monte / BOOK A TABLE |
| 1 | `.brand-hero` (#top) | Full màn nền matcha; **sketch nữ đầu bếp bắt kem hoàn thiện bánh** ở giữa; **vòng chữ xoay** "HEART-HEALTHY, SOUL-TASTY ✦..."; 2 dòng phụ trái/phải; "cuộn xuống ↓" | Hero sketch + curved rotating text |
| 2 | `.cake-hero` (#cake-hero) | Headline editorial + ảnh bánh (lemon) + badge "Best Seller" xoay | (phần ảnh sản phẩm) |
| 3 | `.mood.mood-light` | Ảnh to dạng **stack lớp nghiêng** + sketch nhỏ (whisk + tô bột) + 1 câu mood (ít chữ) | "SET ON HONEYSUCKLE..." mood block |
| 4 | `.hero-marquee` | Dải chữ chạy ngang lặp seamless | Running marquee |
| 5 | `.menu` (#menu) | **Thực đơn dạng CARD 3 cột**, 2 nhóm Keto / Healthy, ảnh 4:3 + tên + **giá** + size + mô tả + tag + cảnh báo rượu | All Day Menu (đổi thành card vì bán bánh) |
| 6 | `.mood.mood-green` (#story) | Mood block nền xanh (đảo chiều) + sketch (chanh + bạc hà) + câu chuyện + nút | mood block thứ 2 |
| 7 | `.gallery` (#gallery) | **Feed Instagram mockup** — header profile (avatar gradient IG + @mocokitchen) + card có ♥/💬/➤ + lượt thích + caption | "OH, HELLO" + Instagram |
| 8 | `.faq` (#faq) | Accordion 5 câu (tiểu đường, bảo quản, giao hàng, dị ứng, Keto vs Healthy) | (bổ sung cho shop bán bánh) |
| 9 | `.order` (#order) | CTA nền matcha: nút Zalo / Instagram / Facebook, giao Hà Nội | "CAFFEINATE YOUR INBOX" → đổi thành đặt hàng |
| — | `.footer` | 3 cột: Liên Hệ / Giờ Nhận Đơn / Tìm MOCO (Hà Nội) + logo + tagline + disclaimer + copyright | Contact / Opening Hours / Find Us |
| — | `.chatbot-widget` | Giữ nguyên, dùng `chatbot.js` | — |

## 4. Bảng giá đang dùng (founder duyệt)

| Bánh | Size | Nhóm | Giá |
|------|------|------|-----|
| Keto Tiramisu ⚠️(có rượu) | 350g | Keto dessert | 180.000đ |
| Keto Lemon Cheese Cake | 250g · size 10cm | Keto dessert | 140.000đ |
| Carrot Cake Kem Hy Lạp | 220g | Healthy cake | 90.000đ |
| Bông Lan Trứng Muối Yến Mạch | 230g | Healthy cake | 75.000đ |
| Bánh Mì Soda Nguyên Cám | 450g | Healthy bread | 70.000đ |
| Chuối Yến Mạch Choco | 200g | Healthy cake | 40.000đ |
| Bánh Cuộn Quế Nguyên Cám | 100g | Healthy pastry | 40.000đ |

## 5. Design tokens (giữ nguyên bản sắc MOCO)

Định nghĩa trong `:root` của `style.css`:

```
--color-primary:        #355C3B  (matcha green — vai trò "terracotta" của Monte)
--color-primary-dark:   #223F29
--color-primary-light:  #6F8F57
--color-accent:         #C86F4E
--color-bg:             #F8F4E9  (cream — trùng nền Monte)
--color-cream:          #FFF8E7
--color-text:           #243127
--radius-card: 16px · --radius-pill: 9999px
--font-display: Playfair Display · --font-body: Quicksand · --font-brand: Pacifico
```

**Nguyên tắc:** giữ matcha green thay terracotta; bề mặt phẳng + viền mảnh, hạn chế shadow nặng; nút primary ưu tiên outline.

## 6. Assets đang dùng (đều có thật trong `/assets`)

`moco-logo-green.png` (logo), `moco-lemon-hero.png` (hero bánh), `moco-tiramisu-real.png`, `moco-lemon-packaged.png`, `product-carrot.png`, `product-bonglan.png`, `product-soda.png`, `product-chuoi.png`, `product-cuonque.png`, `story-behind.png`, `og-cover.jpg`.

> Các sketch (nữ đầu bếp + 2 hình phụ) hiện là **SVG line-art inline** trong `index.html`, KHÔNG phải file ảnh. Màu nét theo `currentColor`.

## 7. JavaScript (`app.js`) — hành vi hiện có

- Brand nav: trong suốt trên hero → thêm class `.solid` khi cuộn quá 60% viewport.
- Menu overlay: nút `#menuBtn` mở/đóng `#menuOverlay`; đóng khi click link hoặc nhấn Esc.
- Scroll reveal: IntersectionObserver thêm `.visible` cho `.animate-on-scroll`.
- Smooth scroll cho anchor `#`.
- FAQ accordion: chỉ mở 1 mục tại một thời điểm.
- **Đã gỡ** (so với bản cũ): parallax floating, stats-counter, testimonial carousel (tránh lỗi tham chiếu null).
- Marquee + vòng chữ xoay + badge xoay: thuần CSS (`@keyframes`), tôn trọng `prefers-reduced-motion`.

## 8. Cách preview cục bộ

```
# trong thư mục 5_Landing_Page_Chatbot/
python3 -m http.server 8123
# mở http://localhost:8123/  (hard refresh Cmd+Shift+R nếu cache CSS)
```

> Lưu ý: chatbot gọi `api/` cần môi trường Vercel; preview tĩnh sẽ hiển thị widget nhưng chat có thể không phản hồi nếu thiếu backend/khoá API.

## 9. Quyết định đã chốt với Sếp

1. Menu **có hiển thị giá** (bán bánh, không bán cà phê).
2. Không backend email — đặt đơn qua **Zalo + Instagram + Facebook**.
3. Địa điểm **Hà Nội** (page: facebook.com/mocokitchen — "MoCo Kitchen | Hanoi").
4. Menu trình bày **dạng card 3 cột** (đã duyệt).
5. Sketch cần **vẽ art tinh tế** (đã làm bản refined cho hình chính + 2 hình phụ).
6. Instagram: **không embed widget** (nặng + cần IG Business) → dùng **mockup tĩnh nhìn rõ là Instagram**.

## 10. Hạng mục còn mở / gợi ý chỉnh tiếp

- [x] **Link liên hệ thật (DONE 2026-06-03):** Đã thay placeholder bằng thông tin thật từ profile IG founder:
  - Zalo: `https://zalo.me/0904826585` (0904 826 585)
  - Instagram: `instagram.com/moco_kitchen242` (@moco_kitchen242)
  - Địa chỉ: 368B Quang Trung, Hà Đông, Hà Nội → Google Maps link theo địa chỉ thật
  - Giờ nhận đơn: **9:00–17:00, T2–T7, nghỉ CN** (sửa từ "8–20h cả tuần" bị sai)
  - Email `hello@mocokitchen.vn` (placeholder) đã **gỡ** khỏi footer vì chưa có email thật
  - Đồng bộ system prompt `chatbot.js` (địa chỉ/giờ/Zalo/IG)
  - Bump version query `?v=20260603-contact`
- [ ] **Facebook URL chính xác:** mới có tên page "MoCo Kitchen"; nút FB hiện trỏ tới Facebook search. Cần dán URL page thật khi có.
- [ ] **Sketch nâng cấp:** bản hiện tại là SVG vector tối giản. Nếu muốn nét minh hoạ giàu chi tiết/mềm hơn → tạo ảnh sketch riêng (PNG nền trong) thay vào `.brand-sketch` / `.mood-sketch`.
- [ ] **Instagram feed thật (tuỳ chọn):** khi có tài khoản IG Business → gắn widget Behold.so / SnapWidget vào `#igFeed` (thay block mockup).
- [ ] **Đồng bộ bản `03_My_Projects/Moco_Kitchen/`** nếu đó là bản deploy chính.
- [ ] Cập nhật `og-cover.jpg` cho đúng ảnh share social mới (nếu cần).
- [ ] Kiểm tra cuối trên thiết bị thật ở 3 breakpoint (≥1024 / 768 / ≤480).
- [ ] **Deploy lại Vercel** sau khi đổi contact để bản live khớp.

## 11. Lịch sử phiên bản layout

| Phiên bản | Đặc điểm | Trạng thái |
|-----------|----------|-----------|
| Bản cũ (pre-redesign) | Hero typography lớp chồng absolute, menu grid card, không giá, có testimonials/parallax | Đã thay thế |
| monte-v1 | Topbar + hero marquee + statement blocks + menu list (dotted leader) + gallery + footer 3 cột | Đã thay thế |
| monte-v2 | Brand hero full màn + vòng chữ xoay + sketch + mood modules + menu card 3 cột | Đã thay thế |
| **monte-v3 (HIỆN TẠI)** | v2 + **sketch refined** (đầu bếp + whisk + chanh/bạc hà) + **gallery Instagram-style rõ ràng** | ✅ Baseline |

## 12. Spec liên quan

- `00_Spec/requirements.md` — 10 nhóm yêu cầu (R1–R10) + bảng giá + Definition of Done.
- `00_Spec/design.md` — kiến trúc section, mapping màu Monte→MOCO, design tokens, responsive, accessibility.
- `00_Spec/tasks.md` — 14 task + dependency graph.

---

*Handoff lập bởi Antigravity theo tinh thần @Manager_May. Audit gate: @QA_Thanh (kiểm tra giá đúng founder, brand giữ nguyên, không lẫn nội dung Monte).*
