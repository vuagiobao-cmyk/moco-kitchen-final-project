# NỘI DUNG ĐIỀN BẢNG THEO DÕI BTC — Copy-Paste Ready

> **Phiên bản:** V2 — Viết lại bằng ngôn ngữ dễ hiểu, phù hợp báo cáo cho lớp.
> **Hướng dẫn:** Copy nội dung trong khung `text` → dán vào đúng ô trong Google Sheet.

---

## TAB 1: KẾ HOẠCH 6 TUẦN

> Tuần 1–3 đã có sẵn. Bên dưới là Tuần 4, 5, 6.

---

### Tuần 4 — Xây dựng Core Features

**[CỘT: Tên giai đoạn]**
```text
Xây dựng Core Features
```

**[CỘT: Mục tiêu cụ thể của tuần này]**
```text
Xây dựng các phần chính của hệ thống trên 2 trục. TRỤC CREATIVE: (1) Website giới thiệu sản phẩm — hiển thị đẹp trên cả điện thoại lẫn máy tính; (2) Chatbot tư vấn sản phẩm — khách hỏi về bánh thì AI trả lời tự động, nhưng luôn nhắc khách hỏi bác sĩ nếu có bệnh nền; (3) Kho kiến thức trên NotebookLM. TRỤC VẬN HÀNH (Google Sheets + Apps Script): (4) Công cụ viết bài tự động; (5) Bảng tính giá vốn (cost) tự động theo công thức từng loại bánh — ra giá thành và % chi phí nguyên liệu; (6) Quản lý đơn hàng + tự động ghi sổ thu chi khi khách thanh toán; (7) Dashboard tổng hợp doanh thu, chi phí, lợi nhuận, bánh bán chạy.
```

**[CỘT: Deliverable chính]**
```text
Website giới thiệu sản phẩm (landing page 1 trang, chạy trên mọi thiết bị) + chatbot tư vấn AI + kho kiến thức NotebookLM (7 nguồn, test 5 câu hỏi khó đều đúng); công cụ viết bài 1-click; BỘ CÔNG CỤ VẬN HÀNH trên Google Sheets: tính giá vốn tự động (food cost %), quản lý đơn hàng bằng form, sổ thu-chi tự động, dashboard KPI — đang chạy trên dữ liệu đơn hàng thật của tiệm.
```

**[CỘT: Trạng thái]:** `✅ Hoàn thành`

---

### Tuần 5 — Tích hợp & Giao diện

**[CỘT: Tên giai đoạn]**
```text
Tích hợp & Giao diện
```

**[CỘT: Mục tiêu cụ thể của tuần này]**
```text
Ghép tất cả các phần đã làm riêng lẻ thành một sản phẩm hoàn chỉnh, chạy được từ đầu đến cuối. Làm đẹp giao diện website: thêm hiệu ứng cuộn trang, phần đánh giá khách hàng tự chạy, ảnh sản phẩm bay nhẹ khi scroll. Test chatbot bằng 5 câu hỏi khó nhất (ví dụ: "Tiểu đường ăn được không?", "Con dị ứng sữa bò thì sao?") — tất cả AI đều trả lời đúng và tự nhắc khách hỏi bác sĩ. Kiểm tra hiển thị trên điện thoại, máy tính bảng, laptop.
```

**[CỘT: Deliverable chính]**
```text
Hệ thống hoàn chỉnh chạy được (Website + Chatbot + Công cụ viết bài + Kho kiến thức), kết quả test 5/5 câu đúng, hiển thị tốt trên mọi thiết bị, tài liệu hướng dẫn đầy đủ.
```

**[CỘT: Trạng thái]:** `✅ Hoàn thành`

---

### Tuần 6 — Deployment & Trình bày

**[CỘT: Tên giai đoạn]**
```text
Deployment & Trình bày
```

**[CỘT: Mục tiêu cụ thể của tuần này]**
```text
Đưa website lên internet để ai cũng truy cập được (qua Vercel). Chuẩn bị slide thuyết trình 15 trang, kịch bản demo 5 phút, ảnh minh hoạ đẹp. Hoàn thiện các giấy tờ nộp bài: bảng theo dõi, nhật ký thực hiện, báo cáo kết quả.
```

**[CỘT: Deliverable chính]**
```text
Website chạy live trên internet (moco-kitchen-ai-hub.vercel.app), slide 15 trang, kịch bản demo 5 phút, ảnh minh hoạ, bảng BTC hoàn chỉnh.
```

**[CỘT: Trạng thái]:** `✅ Hoàn thành`

---

## TAB 2: NHẬT KÝ THỰC HIỆN (Tuần 3 → Tuần 5)

---

### Tuần 3

**[CỘT: Đã hoàn thành trong tuần này]**
```text
1. Xây dựng "bộ quy tắc giao tiếp" cho AI: dạy AI xưng "chúng mình", gọi khách "Anh chị", không được nói quá về sức khoẻ, phải nhắc khách hỏi bác sĩ.
2. Viết 5 bài mẫu content cho 5 loại bài khác nhau (giới thiệu sản phẩm, chia sẻ kiến thức, kể chuyện hậu trường, review, bài theo mùa) — tất cả đều đúng giọng thương hiệu.
3. Tạo bộ công thức viết bài mẫu để AI biết cách viết từng loại bài.
4. Viết 21 mô tả ảnh cho AI tạo hình (7 sản phẩm × 3 góc chụp khác nhau).
5. Dùng công cụ AI của Google (Banana Pro) tạo 13 ảnh sản phẩm cho website.
```

**[CỘT: Khó khăn / Blocker gặp phải]**
```text
Bản quy tắc giao tiếp đầu tiên (V1) bị lỗi: AI viết quá mạnh kiểu "ăn thoải mái không lo béo!", "an toàn tuyệt đối cho tiểu đường" — rất nguy hiểm vì MOCO bán cho người có bệnh nền. Phải viết lại bản V2 với danh sách từ ngữ cấm dùng và bắt buộc phải có dòng nhắc "hỏi bác sĩ" trong mọi tình huống nhạy cảm.
```

**[CỘT: Cần hỗ trợ / Điều chỉnh]**
```text
Cần hỏi thêm founder về thành phần lady finger trong Keto Tiramisu (có bột mì không?) vì ảnh hưởng đến cảnh báo dị ứng gluten.
```

**[CỘT: % Tiến độ]:** `60%`

---

### Tuần 4

**[CỘT: Đã hoàn thành trong tuần này]**
```text
1. Làm xong website giới thiệu sản phẩm: thiết kế tông xanh matcha + kem ấm, hiển thị 7 sản phẩm, có phần FAQ và đánh giá khách hàng.
2. Chatbot tư vấn AI: khách hỏi gì về bánh, chatbot trả lời được. Hỏi về tiểu đường — chatbot tự nhắc hỏi bác sĩ thay vì bán hàng bất chấp.
3. Đưa kho kiến thức lên NotebookLM: 7 nguồn tài liệu. Test 5 câu hỏi khó — 5/5 đều trả lời đúng.
4. Công cụ viết bài tự động trên Google Sheets: founder gõ tên bánh + chọn loại bài → bấm 1 nút → có bài viết + 3 ý tưởng ảnh.
5. BỘ CÔNG CỤ VẬN HÀNH trên Google Sheets: (a) bảng tính giá vốn tự động theo công thức từng bánh, ra giá thành/hộp và % chi phí nguyên liệu, gợi ý giá bán; (b) form nhập đơn hàng + quản lý đơn (nguồn khách, ship); (c) sổ thu-chi tự động ghi khi khách thanh toán; (d) dashboard tổng hợp doanh thu/chi phí/lợi nhuận/bánh bán chạy. Đang chạy trên dữ liệu đơn thật (41 đơn).
6. Phác thảo kịch bản video demo 6 cảnh cho Veo 3.
```

**[CỘT: Khó khăn / Blocker gặp phải]**
```text
Website dùng hosting miễn phí (Vercel) nên không có phần server riêng. Vì vậy mã kết nối chatbot với Gemini phải để lộ trong code — chấp nhận rủi ro cho mục đích demo, sẽ tắt sau khi nộp bài.
```

**[CỘT: Cần hỗ trợ / Điều chỉnh]**
```text
Không cần thay đổi gì. Các phần kết nối với nhau tốt, AI trả lời nhất quán giữa chatbot, công cụ viết bài và kho kiến thức NotebookLM.
```

**[CỘT: % Tiến độ]:** `85%`

---

### Tuần 5

**[CỘT: Đã hoàn thành trong tuần này]**
```text
1. Đưa website lên internet (moco-kitchen-ai-hub.vercel.app) — ai cũng truy cập được.
2. Làm đẹp website: thêm hiệu ứng cuộn trang mượt, ảnh sản phẩm bay nhẹ, phần đánh giá tự chuyển.
3. Viết tài liệu hướng dẫn đầy đủ (README, hướng dẫn chạy, báo cáo hoàn thành).
4. Test trên điện thoại, tablet, laptop — đều hiển thị tốt.
5. Chuẩn bị tài liệu thuyết trình: phác thảo 15 slide, kịch bản demo 5 phút, 6 ảnh minh họa đẹp.
```

**[CỘT: Khó khăn / Blocker gặp phải]**
```text
Ảnh sản phẩm trên website bị lỗi hiển thị sau khi đưa lên internet (do thư mục ảnh không được tải lên cùng). Giải pháp tạm: dùng ảnh minh họa trong slide thay vì demo trực tiếp trên web.
```

**[CỘT: Cần hỗ trợ / Điều chỉnh]**
```text
Không thay đổi phạm vi. Tập trung hoàn thiện slide và giấy tờ trước ngày demo.
```

**[CỘT: % Tiến độ]:** `95%`

---

### NHÌN LẠI GIAI ĐOẠN THỰC HIỆN (Tuần 5)

**[CỘT: Điều gì đã làm tốt nhất?]**
```text
Xây dựng bộ "quy tắc giao tiếp" (System Prompt) cho AI thật kỹ càng. Nhờ vậy, khi test 5 câu hỏi nhạy cảm nhất — như "Tiểu đường ăn được không?", "Con dị ứng sữa bò thì sao?" — AI đều trả lời đúng: giới thiệu sản phẩm phù hợp, nhưng luôn nhắc khách hỏi bác sĩ và cảnh báo về thành phần rượu hay dị ứng. Đây là phần mất nhiều thời gian nhất nhưng tạo giá trị lớn nhất — vì bảo vệ khách hàng chính là bảo vệ thương hiệu.
```

**[CỘT: Điều gì cần cải thiện?]**
```text
Quản lý file ảnh khi đưa website lên internet. 13 ảnh sản phẩm tạo bằng AI không được tải lên cùng website → ảnh bị lỗi hiển thị. Lần sau cần kiểm tra kỹ hơn trước khi đưa lên, hoặc dùng dịch vụ lưu ảnh riêng thay vì để chung với code.
```

**[CỘT: Bài học quan trọng nhất?]**
```text
"Dạy AI nói đúng" quan trọng hơn "code nhiều tính năng". Toàn bộ chatbot, công cụ viết bài và kho kiến thức đều dùng chung một bộ quy tắc giao tiếp — nếu bộ này sai, tất cả output đều sai. Đầu tư thời gian "dạy AI" (prompt engineering) mang lại hiệu quả cao nhất.
```

---

## TAB 3: KẾT QUẢ & ROI

### Sản phẩm cuối khóa

**[CỘT: Link sản phẩm / demo]**
```text
https://moco-kitchen-ai-hub.vercel.app
```

**[CỘT: Link video demo]**
```text
(Sếp tự điền sau khi quay — hoặc ghi: Trình bày trực tiếp tại buổi demo)
```

**[CỘT: Link slide thuyết trình]**
```text
(Sếp dán link Google Slides sau khi tạo xong)
```

**[CỘT: Link mã nguồn (nếu có)]**
```text
https://github.com/vuagiobao-cmyk/moco-kitchen-final-project
(Public repo — chứa toàn bộ dự án)
Chi tiết từng tuần: xem file _Deliverables/GIT_WEEKLY_REPORT.md
```

**[CỘT: Mô tả sản phẩm đã hoàn thành]**
```text
Hệ thống AI hỗ trợ marketing cho tiệm bánh healthy MOCO Kitchen, gồm 4 phần liên kết nhau:

1. Kho kiến thức AI (NotebookLM) — lưu toàn bộ thông tin chính xác về 7 loại bánh, dinh dưỡng, câu hỏi thường gặp. AI tra cứu từ đây để không bao giờ trả lời sai.

2. Công cụ viết bài tự động (Google Sheets + Gemini) — founder gõ tên bánh, bấm 1 nút, 30 giây sau có bài đăng Facebook chuẩn giọng thương hiệu kèm gợi ý ảnh. Trước đây mất 2-3 giờ mỗi ngày.

3. Website giới thiệu sản phẩm (landing page 1 trang) — hiển thị 7 loại bánh, có chatbot tư vấn AI tự động. Khách hỏi "Tiểu đường ăn được không?" — chatbot giới thiệu sản phẩm phù hợp nhưng luôn nhắc hỏi bác sĩ.

4. BỘ CÔNG CỤ VẬN HÀNH (Google Sheets + Apps Script) — quản lý thực tế của tiệm: (a) tự động tính giá vốn theo công thức từng bánh, ra % chi phí nguyên liệu (food cost) và gợi ý giá bán; (b) form nhập đơn hàng + quản lý đơn theo nguồn khách; (c) sổ thu-chi tự ghi khi khách thanh toán; (d) dashboard tổng hợp doanh thu, chi phí, lợi nhuận, bánh bán chạy. Đang chạy trên dữ liệu đơn hàng thật của tiệm.

5. Tích hợp 6 công cụ Google AI: NotebookLM, Gemini, Apps Script, Banana Pro (tạo ảnh), Veo 3 (kịch bản video), Vercel (đưa web lên internet).

Điểm đặc biệt: dự án phủ cả 2 mặt — TRUYỀN THÔNG (content, chatbot, website) và VẬN HÀNH (cost, đơn hàng, thu chi, dashboard) — đúng tên "AI Creative & Operations Hub". Toàn bộ tuân thủ AI có trách nhiệm: không tuyên bố chữa bệnh, tự cảnh báo rượu và dị ứng, luôn khuyên khách tham khảo bác sĩ.
```

---

### So sánh Kỳ vọng vs Thực tế

**Dòng 1: Thời gian tiết kiệm được**

| Cột | Nội dung |
|-----|----------|
| Kỳ vọng ban đầu | `Tiết kiệm 5-8 giờ/tuần cho việc viết bài, tổng hợp thông tin sản phẩm và làm báo cáo` |
| Kết quả thực tế | `Giảm khoảng 90% thời gian viết bài: trước mất 2-3 giờ soạn một bài Facebook, giờ chỉ cần 30 giây tạo bài + 15-20 phút đọc lại và chỉnh. Ước tính tiết kiệm 6-8 giờ/tuần nếu founder dùng hàng ngày.` |
| Đạt / Chưa đạt | `Đạt` |
| Ghi chú | `Đã test với 5 bài mẫu — tất cả đều đúng giọng thương hiệu, không cần sửa nhiều.` |

**Dòng 2: Chi phí giảm thiểu**

| Cột | Nội dung |
|-----|----------|
| Kỳ vọng ban đầu | `Giảm 50-70% thời gian chuẩn bị nội dung, hình ảnh` |
| Kết quả thực tế | `Giảm khoảng 80% thời gian soạn nội dung nhờ chỉ cần bấm 1 nút thay vì soạn từ đầu. 13 ảnh sản phẩm do AI tạo, không cần thuê chụp (tiết kiệm khoảng 2-5 triệu VND). Toàn bộ hệ thống chạy miễn phí (Gemini API miễn phí + hosting miễn phí trên Vercel).` |
| Đạt / Chưa đạt | `Vượt` |
| Ghi chú | `Tổng chi phí thực tế: 0 VND — dùng hoàn toàn công cụ miễn phí của Google.` |

**Dòng 3: Số lượng user / người dùng**

| Cột | Nội dung |
|-----|----------|
| Kỳ vọng ban đầu | `Founder MOCO Kitchen + đội KIWI Creative (2-3 người)` |
| Kết quả thực tế | `1 người dùng chính (founder) đã test công cụ viết bài và chatbot. Website public — ai cũng truy cập được.` |
| Đạt / Chưa đạt | `Đạt` |
| Ghi chú | `Quy mô phù hợp với tiệm bánh nhỏ 2 người vận hành.` |

**Dòng 4: Tỉ lệ tự động hóa quy trình (%)**

| Cột | Nội dung |
|-----|----------|
| Kỳ vọng ban đầu | `Tự động hóa việc viết bài, tư vấn khách hàng, tra cứu thông tin sản phẩm` |
| Kết quả thực tế | `Khoảng 85% tự động: từ gõ tên bánh đến có bài viết hoàn chỉnh chỉ cần bấm 1 nút. Chatbot tư vấn 24/7 không cần người trực. Kho kiến thức tự tra cứu chính xác. 15% còn lại là founder đọc lại và duyệt — cần thiết để đảm bảo chất lượng.` |
| Đạt / Chưa đạt | `Vượt` |
| Ghi chú | `Không nên tự động 100% vì sản phẩm liên quan sức khoẻ — cần người duyệt cuối.` |

**Dòng 5: Chất lượng đầu ra so với trước**

| Cột | Nội dung |
|-----|----------|
| Kỳ vọng ban đầu | `Giọng thương hiệu nhất quán hơn, phản hồi khách nhanh hơn` |
| Kết quả thực tế | `Giọng thương hiệu nhất quán 100%: mọi bài viết và câu trả lời chatbot đều xưng "chúng mình", đúng tông ấm áp. Đặc biệt: AI tự cảnh báo rượu trong Tiramisu, nhắc nhiễm chéo dị ứng — những chi tiết mà viết tay thường quên.` |
| Đạt / Chưa đạt | `Vượt` |
| Ghi chú | `An toàn hơn viết tay: 5/5 câu hỏi nhạy cảm đều có dòng nhắc "hỏi bác sĩ" tự động.` |

---

## TAB 4: BÀI HỌC & KẾ HOẠCH TIẾP THEO

**[CỘT: Điều hữu ích nhất học được từ dự án này]** ⭐⭐
```text
"Dạy AI nói đúng" (Prompt Engineering) là kỹ năng quan trọng nhất khi làm dự án AI. Thay vì tập trung viết code phức tạp, tôi dành phần lớn thời gian "dạy" AI cách xưng hô, cách giới thiệu sản phẩm, những gì KHÔNG được nói (ví dụ: "chữa bệnh", "ăn thoải mái") — và chỉ cần viết bộ quy tắc này một lần, cả 3 phần (chatbot, công cụ viết bài, kho kiến thức) đều dùng chung. Ngoài ra, việc dùng NotebookLM làm "kho kiến thức" giúp AI luôn trả lời dựa trên thông tin thật thay vì bịa ra — bài học áp dụng được cho mọi dự án AI.
```

**[CỘT: Khó khăn lớn nhất và cách bạn vượt qua]**
```text
MOCO Kitchen bán bánh cho người tiểu đường, mẹ bầu, trẻ dị ứng — nhóm khách rất nhạy cảm về sức khoẻ. Bản "quy tắc giao tiếp" đầu tiên bị lỗi: AI viết kiểu "ăn thoải mái không lo béo!", "an toàn tuyệt đối cho tiểu đường" — nếu đăng lên thật thì rất nguy hiểm. Cách vượt qua: viết lại bộ quy tắc lần 2, thêm danh sách từ cấm, bắt buộc mọi câu trả lời liên quan bệnh nền phải có dòng "hãy tham khảo ý kiến bác sĩ". Test 5 câu hỏi khó nhất — 5/5 đều an toàn.
```

**[CỘT: Nếu làm lại, bạn sẽ thay đổi điều gì?]** ⭐⭐
```text
1. Xây kho kiến thức (NotebookLM) XONG TRƯỚC rồi mới làm chatbot và công cụ viết bài. Tôi làm song song nên phải quay lại sửa khi phát hiện thông tin chưa khớp nhau.
2. Quản lý file ảnh cẩn thận hơn khi đưa website lên internet — tránh lỗi ảnh không hiển thị.
3. Cho founder (người dùng thật) test sớm hơn thay vì chỉ tự test kỹ thuật — góc nhìn người dùng rất khác góc nhìn người làm.
```

**[CỘT: Kế hoạch phát triển sản phẩm sau khóa học]**
```text
Tháng 6: Thêm tính năng đặt hàng trực tiếp qua Zalo OA — kênh phổ biến nhất cho quán ăn nhỏ tại Việt Nam.
Tháng 7: Kết nối Google Looker Studio để có bảng thống kê tự động — theo dõi doanh thu, đơn hàng, bài nào được tương tác nhiều.
Tháng 8: Hệ thống nhận diện khách quay lại, gợi ý sản phẩm phù hợp dựa trên lịch sử mua.
Dài hạn: Biến mô hình AI Hub này thành "công thức" có thể áp dụng cho các quán ăn/tiệm bánh nhỏ khác.
```

**[CỘT: Bạn có muốn sản phẩm này được đóng gói thành mini course không?]**
```text
Có, rất muốn
```

---

## CHECKLIST — Dán xong thì check

- [ ] Tab Kế Hoạch 6 Tuần: Tuần 4, 5, 6 đã điền + đổi trạng thái `✅ Hoàn thành`
- [ ] Tab Nhật Ký: Tuần 3, 4, 5 đã điền + % tiến độ (60%, 85%, 95%)
- [ ] Tab Nhìn Lại: 3 câu hỏi đã điền
- [ ] Tab KQ & ROI: link demo + mô tả + 5 dòng so sánh
- [ ] Tab Bài Học: 5 câu hỏi đã điền
- [ ] Đổi tên file bảng: `[VIBEK1] - STT Nhóm - Vũ Hoàng Phong`
- [ ] Mở quyền share: `Bất kỳ ai có liên kết` → `Người nhận xét`
- [ ] Dán link bảng cá nhân vào bảng tổng lớp
