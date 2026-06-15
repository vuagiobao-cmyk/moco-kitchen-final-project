# Requirements — MOCO Kitchen Landing Page (Monte Cafe Layout Redesign)

## Giới thiệu

Dự án này tái cấu trúc landing page hiện tại của MOCO Kitchen (`5_Landing_Page_Chatbot/index.html`, `style.css`, `app.js`) để **bám sát layout/cấu trúc của template tham khảo [montecafe.com.au](https://montecafe.com.au/)**, đồng thời **giữ nguyên bản sắc thương hiệu MOCO**: bảng màu Matcha Green hiện có và logo `moco-logo-green.png`.

Mục tiêu là sao chép *bố cục, trình tự section, và phong cách trình bày editorial* của Monte Cafe (utility bar trạng thái, hero marquee chữ chạy, các khối statement cuộn lớn, menu dạng cột/list, feed social "Oh, Hello", form newsletter, footer 3 cột Contact / Opening Hours / Find Us) — chứ không sao chép nội dung hay màu sắc của Monte.

Đây là dự án cuối khoá Google AI Bootcamp 2026. Trang phải hoạt động tĩnh (HTML/CSS/JS thuần, deploy Vercel), giữ chatbot widget hiện có, và dùng đúng assets sản phẩm sẵn có trong `/assets`.

### Bối cảnh hiện trạng
- Stack: HTML tĩnh + `style.css` + `app.js` (vanilla JS), chatbot qua `chatbot.js` + `api/`, deploy Vercel (`vercel.json`).
- Bảng màu cần giữ: định nghĩa trong `:root` của `style.css` (matcha green `#355C3B`, cream `#FFF8E7`, accent `#C86F4E`...).
- Logo cần giữ: `/assets/moco-logo-green.png`.
- Dữ liệu sản phẩm: 7 sản phẩm (2 Keto + 5 Healthy Baking) từ `3_Content_Engine/moco_menu_products.md`, ảnh tương ứng trong `/assets`.
- **Bảng giá đã xác nhận:**

  | Bánh | Khối lượng / size | Nhóm | Giá bán |
  |------|------|------|---------|
  | Bánh Mì Soda Nguyên Cám | 450g | Healthy bread | 70.000đ |
  | Chuối Yến Mạch Choco | 200g | Healthy cake | 40.000đ |
  | Carrot Cake Kem Hy Lạp | 220g | Healthy cake | 90.000đ |
  | Bông Lan Trứng Muối Yến Mạch | 230g | Healthy cake | 75.000đ |
  | Bánh Cuộn Quế Nguyên Cám | 100g | Healthy pastry | 40.000đ |
  | Keto Lemon Cheese Cake | 250g, size 10cm | Keto dessert | 140.000đ |
  | Keto Tiramisu | 350g | Keto dessert | 180.000đ |

- **Thương hiệu:** MoCo Kitchen | Hà Nội (Facebook: facebook.com/mocokitchen). Khu vực hoạt động & giao hàng: **Hà Nội**.
- **Kênh đặt đơn:** Zalo + Instagram (không có backend nhận email).
- **Lưu ý quan trọng (rút kinh nghiệm bản hiện tại):** Đây là landing page **bán bánh**, nên một số mục cuối trang của Monte (vốn là quán cà phê dine-in) cần được thay bằng mục phù hợp bán hàng/đặt online — ưu tiên rõ giá, cách đặt, khu vực giao, thay vì "book a table".

### Phạm vi (Scope)
- **Trong phạm vi:** Thiết kế lại `index.html` và `style.css`, đồng thời điều chỉnh `app.js` cho các tương tác mới. Giữ trợ lý hỏi đáp, thông tin sản phẩm, câu hỏi thường gặp và các lưu ý hiện có.
- **Ngoài phạm vi:** Không xây thêm hệ thống gửi bản tin; không thay đổi cách hoạt động của trợ lý hỏi đáp; không tạo thêm ảnh mới; không đổi bảng giá khi chưa được xác nhận; không đổi bảng màu hoặc logo thương hiệu.

---

## Yêu cầu

### Requirement 1 — Utility/Status Bar (theo "OPEN TODAY TIL... / NEWCASTLE 20°C / BOOK")

**User Story:** Là khách truy cập, tôi muốn thấy ngay trạng thái mở cửa và nút hành động chính ở thanh trên cùng, để biết MOCO có đang nhận đơn không và cách đặt hàng nhanh.

#### Acceptance Criteria
1. WHEN trang tải xong THEN hệ thống SHALL hiển thị một utility bar mảnh phía trên (hoặc tích hợp trong navbar) chứa: trạng thái mở cửa/nhận đơn dạng text (ví dụ "ĐANG NHẬN ĐƠN — HÀ NỘI"), và một nút CTA chính ("Đặt Hàng"/"Nhắn Zalo").
2. WHEN khách bấm nút CTA chính trên utility bar THEN hệ thống SHALL cuộn mượt tới section đặt hàng HOẶC mở link đặt hàng (Zalo/Facebook).
3. WHERE màn hình mobile (≤768px) THE utility bar SHALL co gọn nội dung mà không vỡ layout (cho phép ẩn bớt phần phụ như địa điểm).
4. THE utility bar SHALL dùng đúng tông màu thương hiệu MOCO (matcha green / cream), KHÔNG dùng màu của Monte Cafe.

### Requirement 2 — Hero với Marquee chữ chạy + "Keep scrolling"

**User Story:** Là khách truy cập, tôi muốn một hero gây ấn tượng với dòng tagline lớn chạy ngang lặp lại và gợi ý cuộn xuống, giống cảm giác editorial của Monte Cafe.

#### Acceptance Criteria
1. WHEN trang tải xong THEN hero SHALL hiển thị một dòng marquee chữ lớn lặp lại theo chiều ngang chứa tagline thương hiệu MOCO (ví dụ "HEART-HEALTHY, SOUL-TASTY" hoặc "Bánh healthy thủ công").
2. THE marquee SHALL tự động cuộn ngang liên tục (animation), và SHALL lặp seamless (không có khoảng trống nhảy giật rõ rệt).
3. THE hero SHALL hiển thị một dòng gợi ý cuộn ("Keep scrolling for the good stuff" → bản Việt, ví dụ "Cuộn xuống để khám phá nhé").
4. THE hero SHALL hiển thị tên/logo thương hiệu MOCO và ít nhất một hình sản phẩm thật từ `/assets`.
5. WHERE `prefers-reduced-motion: reduce` được bật THE marquee SHALL dừng hoặc giảm chuyển động.
6. WHERE màn hình mobile THE hero SHALL hiển thị đầy đủ tagline và CTA mà không tràn ngang (no horizontal scroll ngoài chính marquee).

### Requirement 3 — Các khối Statement editorial cuộn lớn

**User Story:** Là khách truy cập, khi cuộn xuống tôi muốn đọc vài câu khẳng định lớn về thương hiệu (giống các block "MONTE IS FOR..." / "SET ON HONEYSUCKLE DRIVE..." của Monte), để hiểu tinh thần MOCO.

#### Acceptance Criteria
1. WHEN khách cuộn qua hero THEN hệ thống SHALL hiển thị tuần tự 2–4 khối statement chữ lớn (font display), mỗi khối là một câu/đoạn ngắn về giá trị MOCO (thủ công, không đường tinh luyện, nguyên liệu thật...).
2. WHEN một khối statement vào viewport THEN nó SHALL xuất hiện với hiệu ứng reveal (fade/slide) nhẹ.
3. THE khối statement chính SHALL có một CTA phụ (ví dụ "Khám phá menu" hoặc "Đặt một chiếc").
4. Nội dung phải lấy từ thông điệp thương hiệu MOCO hiện có, không sao chép nội dung của mẫu Monte.

### Requirement 4 — Menu dạng cột/list (theo "COFFEE & TEA / ALL DAY MENU")

**User Story:** Là khách truy cập, tôi muốn xem menu sản phẩm được trình bày theo nhóm dạng danh sách/cột rõ ràng như menu Monte, để duyệt nhanh các món theo dòng Keto và Healthy Baking.

#### Acceptance Criteria
1. THE section menu SHALL nhóm sản phẩm theo 2 danh mục hiện có: "Dòng Keto" (2 món) và "Dòng Healthy Baking" (5 món).
2. Khi hiển thị mỗi món, hệ thống phải có tên món, mô tả ngắn, đặc điểm chính và **giá bán** theo bảng giá đã xác nhận.
3. THE menu SHALL trình bày theo phong cách danh sách/cột (column list) gợi nhớ menu Monte, thay vì chỉ là lưới card như bản hiện tại; cho phép có ảnh thumbnail của món.
4. Phần menu phải giữ lưu ý về dị ứng và nguy cơ nhiễm chéo.
5. WHERE khách tương tác với một danh mục (nếu dùng dạng accordion/tab) THE hệ thống SHALL mở/đóng đúng nhóm tương ứng.
6. WHERE màn hình mobile THE menu SHALL xếp về 1 cột dễ đọc.

### Requirement 5 — Section Social "Oh, Hello" (feed dạng grid)

**User Story:** Là khách truy cập, tôi muốn xem một dải hình ảnh sản phẩm/khoảnh khắc thương hiệu dạng feed (giống mục "OH, HELLO" + Instagram của Monte), để cảm nhận hình ảnh thực tế của MOCO.

#### Acceptance Criteria
1. THE section SHALL có tiêu đề kiểu thân thiện (ví dụ "Ô, Chào Bạn 👋" / "Ghé Bếp MOCO") tương ứng "OH, HELLO".
2. THE section SHALL hiển thị một lưới (grid) gồm nhiều ô hình ảnh sản phẩm thật từ `/assets`.
3. WHEN khách hover một ô hình (desktop) THEN hệ thống SHALL hiển thị hiệu ứng nhẹ (zoom/overlay caption).
4. THE section SHALL có link "Theo dõi" trỏ tới Instagram @moco_kitchen242.
5. WHERE màn hình mobile THE grid SHALL giảm số cột (ví dụ 2 cột) và không vỡ layout.

### Requirement 6 — Khối Đặt Hàng / Kết Nối (thay cho Newsletter của Monte)

**User Story:** Là khách truy cập, tôi muốn một khối kêu gọi đặt hàng rõ ràng qua Zalo và Instagram (vì MOCO bán bánh, không có backend nhận email), để đặt bánh nhanh chóng.

#### Acceptance Criteria
1. THE section này SHALL thay thế khối "CAFFEINATE YOUR INBOX" của Monte bằng một khối **Đặt Hàng / Kết Nối** phù hợp bán bánh, với dòng mời gọi (ví dụ "Đặt bánh MOCO ngay hôm nay").
2. THE khối SHALL có các nút CTA đặt hàng: **Zalo** và **Instagram** (và có thể Facebook), trỏ tới kênh MOCO; mỗi nút mở tab mới an toàn (`rel="noopener"`).
3. THE khối SHALL nêu rõ quy trình đặt: nhắn qua Zalo/Instagram, làm thủ công số lượng nhỏ nên nên đặt sớm; và khu vực giao **Hà Nội**.
4. Hệ thống không có biểu mẫu email và không gửi dữ liệu tới dịch vụ bên thứ ba không xác định.
5. THE các nút CTA SHALL truy cập được bằng bàn phím và có nhãn/aria rõ ràng.

### Requirement 7 — Footer 3 khối: Contact / Opening Hours / Find Us

**User Story:** Là khách truy cập, tôi muốn footer rõ ràng với thông tin liên hệ, giờ mở cửa và địa điểm (giống footer Monte), để biết cách kết nối và tìm MOCO.

#### Acceptance Criteria
1. THE footer SHALL có khối "Liên Hệ" (Contact) gồm Zalo 0904 826 585, Instagram @moco_kitchen242 và Facebook MoCo Kitchen.
2. THE footer SHALL có khối "Giờ Nhận Đơn" (Opening Hours) dạng ngày thường / cuối tuần.
3. THE footer SHALL có khối "Tìm MOCO" (Find Us) với địa chỉ 368B Quang Trung, Hà Đông, Hà Nội và link Google Maps.
4. Chân trang phải hiển thị logo MOCO, thông điệp “Heart-Healthy, Soul-Tasty” và lưu ý dinh dưỡng hiện có.
5. THE footer SHALL giữ dòng copyright dự án ("© 2026 MOCO Kitchen. Dự án AI Marketing Hub — Google AI Bootcamp").

### Requirement 8 — Giữ nguyên bản sắc thương hiệu (Màu + Logo)

**User Story:** Là chủ dự án, tôi muốn dù layout giống Monte Cafe, trang vẫn phải là MOCO Kitchen về màu sắc và logo, để giữ nhận diện thương hiệu.

#### Acceptance Criteria
1. THE trang SHALL dùng bảng màu Matcha Green hiện có trong `:root` của `style.css`; KHÔNG đưa vào palette màu của Monte Cafe.
2. THE trang SHALL dùng logo `/assets/moco-logo-green.png` ở navbar và footer.
3. THE trang SHALL dùng nội dung sản phẩm/thông điệp của MOCO; KHÔNG sao chép text thương hiệu của Monte (tên quán, địa chỉ, tagline cà phê...).
4. THE bộ font SHALL phù hợp tinh thần editorial nhưng nhất quán với thương hiệu (giữ Playfair Display / Quicksand / Pacifico hiện có, hoặc thay tương đương có chủ đích).

### Requirement 9 — Giữ Chatbot Widget hoạt động

**User Story:** Là khách truy cập, tôi muốn vẫn dùng được trợ lý AI của MOCO sau khi đổi layout, để hỏi về sản phẩm.

#### Acceptance Criteria
1. THE trang sau redesign SHALL giữ chatbot widget (`chatbot-widget`) và tích hợp `chatbot.js` như hiện tại.
2. WHEN khách bấm nút chatbot THEN panel chat SHALL mở/đóng đúng như hành vi hiện có.
3. THE redesign SHALL KHÔNG phá vỡ liên kết tới `api/` của chatbot.

### Requirement 10 — Responsive, Hiệu năng & Truy cập

**User Story:** Là khách truy cập trên mọi thiết bị, tôi muốn trang tải nhanh, hiển thị đẹp và dùng được, để có trải nghiệm tốt.

#### Acceptance Criteria
1. THE trang SHALL hiển thị đúng và không bị tràn ngang (no unwanted horizontal scroll) ở các breakpoint desktop (≥1024px), tablet (768px), mobile (≤480px).
2. THE navbar SHALL có menu mobile (hamburger) hoạt động như hiện tại.
3. THE hình ảnh SHALL dùng `loading="lazy"` cho ảnh dưới fold và `width/height` hợp lý để hạn chế layout shift.
4. THE các section chính SHALL có cấu trúc heading hợp lý (một `h1` cho hero, `h2` cho các section) và `alt` mô tả cho ảnh sản phẩm.
5. WHERE `prefers-reduced-motion: reduce` THE các animation lớn (marquee, reveal) SHALL được giảm/tắt.
6. THE trang SHALL mở được trực tiếp dưới dạng tĩnh và deploy được trên Vercel với cấu hình `vercel.json` hiện có.

---

## Tiêu chí hoàn thành (Definition of Done)
- `index.html` được tái cấu trúc theo trình tự section của Monte Cafe (utility bar → hero marquee → statements → menu list → social grid → newsletter → footer 3 cột), giữ chatbot.
- `style.css` cập nhật layout mới nhưng vẫn dùng biến màu MOCO; không vỡ responsive.
- `app.js` hỗ trợ tương tác mới (marquee an toàn, scroll-reveal, newsletter validate, menu accordion/tab nếu dùng) và giữ các hành vi cũ còn dùng.
- Logo + màu sắc MOCO được giữ nguyên; không lẫn nội dung/màu của Monte.
- Mở thử trang tĩnh không có lỗi console nghiêm trọng; layout kiểm tra ở 3 breakpoint.
