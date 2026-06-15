---
id: "202606150001"
title: "MOCO Kitchen - Final Submission Handoff"
created: 2026-06-15
updated: 2026-06-15
project: "Google AI Ecosystem K1-2026 - Dự án cuối khóa"
status: "ready-for-final-review"
---

# MOCO Kitchen - Final Submission Handoff

Tài liệu này dùng để bàn giao nhanh trước khi nộp bài. Mục tiêu là giúp mở đúng file, đúng link, đúng trang web, và tránh nhầm với bản cũ.

## 1. Trạng thái hiện tại

- Repo công khai: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project>
- Branch nộp bài: `main`
- Commit công khai mới nhất trước handoff này: `9ec5d01 - docs: add MOCO brand identity design`
- Website ghi trong README: <https://moco-kitchen-ai-hub.vercel.app>
- Thư mục landing page: `5_Landing_Page_Chatbot/`
- Thư mục báo cáo nộp bài: `_Deliverables/Weekly_Reports/`

## 2. Giao diện mới đã được lưu ở đâu?

Giao diện trong screenshot đã nằm trong source GitHub, không phải file tạm.

File chính:

- `5_Landing_Page_Chatbot/index.html`
- `5_Landing_Page_Chatbot/style.css`
- `5_Landing_Page_Chatbot/app.js`
- `5_Landing_Page_Chatbot/chatbot.js`
- `5_Landing_Page_Chatbot/assets/`

Dấu hiệu đối chiếu với screenshot:

- Thanh trên có `MENU`, logo chữ `moco`, và nút `ĐẶT BÁNH`.
- Hero xanh lá có class `brand-hero`.
- Vòng chữ ở giữa có class `brand-ring`.
- Text bên trái: `ĐANG NHẬN ĐƠN · 9–17H`.
- Text bên phải: `HÀ NỘI · VIỆT NAM`.
- Phần menu có class `cake-hero`, marquee `Heart-Healthy, Soul-Tasty`, và các card sản phẩm.
- CSS đang dùng layout `MOCO Kitchen - Monte-style Layout v2 - Matcha Green Brand`.

Link GitHub cần mở khi muốn kiểm tra source:

- Homepage source: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/5_Landing_Page_Chatbot/index.html>
- Style source: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/5_Landing_Page_Chatbot/style.css>
- Asset folder: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/tree/main/5_Landing_Page_Chatbot/assets>

## 3. Nếu bấm link mà vẫn thấy web cũ

Kết luận ngắn: source đã lưu, nhưng Production có thể chưa đang dùng bản mới.

Cần kiểm tra theo thứ tự:

1. Xác nhận URL đang mở là `https://moco-kitchen-ai-hub.vercel.app`, không phải link preview/deployment cũ.
2. Hard refresh trình duyệt.
3. Thử thêm query để tránh cache: `https://moco-kitchen-ai-hub.vercel.app/?v=20260615`.
4. Vào Vercel project, kiểm tra Production deployment đang lấy commit mới nhất trên GitHub `main`.
5. Nếu Vercel project đang trỏ root repo, cần đảm bảo cấu hình deploy đúng thư mục `5_Landing_Page_Chatbot/`. File `vercel.json` hiện nằm trong thư mục này, không nằm ở root repo.
6. Nếu đã redeploy mà vẫn cũ, kiểm tra domain có trỏ sang đúng Vercel project hay không.

Lưu ý: trong lần kiểm tra tự động này, môi trường không resolve được DNS của `moco-kitchen-ai-hub.vercel.app`, nên chưa thể xác nhận live Production bằng lệnh tự động. Việc này cần được kiểm tra trực tiếp trên browser của máy hoặc Vercel dashboard.

## 4. Tài liệu quan trọng để giảng viên đọc

- Root README: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/README.md>
- Weekly reports: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/tree/main/_Deliverables/Weekly_Reports>
- Báo cáo tổng hợp 6 tuần: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/_Deliverables/BAO_CAO_TONG_HOP_6_TUAN_2026-05-29.md>
- Snapshot dữ liệu kinh doanh: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/1_Research/business_data_snapshot_2026-06-15.md>
- Brand identity design: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Creative_Content/design.md>
- Visual concept: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Creative_Content/visual_concepts.md>
- Sample content posts: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/3_Content_Engine/moco_sample_posts_gem.md>
- Deployment guide: <https://github.com/vuagiobao-cmyk/moco-kitchen-final-project/blob/main/6_Deployment_Demo/README.md>

## 5. Các cập nhật gần nhất đã đẩy lên GitHub

- `078ddfc - docs: refresh research data and social content`
  - Cập nhật dữ liệu nghiên cứu từ Google Sheet MOCO.
  - Làm mới snapshot dữ liệu, insight khách hàng, FAQ, menu và content mẫu.

- `d19f44b - docs: expand MOCO visual direction`
  - Mở rộng visual concept.
  - Thêm vai trò ảnh, asset audit, shot list và nguyên tắc dùng visual.

- `9ec5d01 - docs: add MOCO brand identity design`
  - Thêm `3_Creative_Content/design.md`.
  - Ghi rõ brand identity, logo rationale, màu sắc, typography, layout và cách áp dụng.

## 6. Checklist trước khi nộp

- Mở GitHub repo và xác nhận README hiện đủ các link chính.
- Mở `5_Landing_Page_Chatbot/index.html` trên GitHub và thấy class `brand-hero`.
- Mở website Production và xác nhận đúng giao diện xanh trong screenshot.
- Nếu Production cũ, redeploy lại từ Vercel theo mục 3.
- Mở Weekly Reports tuần 1-6, đảm bảo không còn câu nội bộ, câu hỏi đang chờ xử lý, hay ghi chú đang làm.
- Mở `design.md` và `visual_concepts.md` để giải thích phần nhận diện thương hiệu nếu giảng viên hỏi.
- Chuẩn bị screenshot website mới làm bằng chứng dự phòng.

## 7. Điểm cần lưu ý khi thuyết trình

- Không nói đây là website thương mại hoàn chỉnh; nói đây là landing page demo cho dự án cuối khóa.
- Không trình bày sample post như feedback thật của khách hàng; đây là nội dung mẫu để minh họa brand voice.
- Không công bố dữ liệu cá nhân trong Google Sheet nếu có khách hàng thật.
- Nếu bị hỏi về visual, nhấn mạnh: brand identity và logo do founder tự xây từ đầu; AI hỗ trợ hệ thống hóa, mở rộng guideline và quản lý một số asset minh họa.

## 8. Trạng thái bàn giao

- Source landing page: đã lưu trong GitHub.
- Design document: đã lưu trong GitHub.
- Visual concept: đã lưu trong GitHub.
- Weekly reports: đã lưu trong GitHub.
- Rủi ro chính: Production link có thể hiện bản cũ nếu Vercel chưa redeploy đúng commit/thư mục.
