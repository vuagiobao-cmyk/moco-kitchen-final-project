# Deployment & Demo Guide — MOCO Kitchen

## Liên kết

- **Website:** [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)
- **Mã nguồn:** [github.com/vuagiobao-cmyk/moco-kitchen-final-project](https://github.com/vuagiobao-cmyk/moco-kitchen-final-project)
- **Weekly Reports:** [Xem mục lục](../_Deliverables/Weekly_Reports/README.md)
- **Final Handoff:** [Trạng thái nộp bài 2026-06-15](../_Deliverables/HANDOFF_FINAL_SUBMISSION_2026-06-15.md)

## Deployment Verification

Giao diện mới nằm trong thư mục `5_Landing_Page_Chatbot/`. Khi kiểm tra đúng bản, trang sẽ có các dấu hiệu sau:

- Hero nền xanh lá, logo chữ `moco` ở giữa thanh điều hướng.
- Menu trái ghi `MENU`, nút phải ghi `ĐẶT BÁNH`.
- Vòng chữ ở giữa hero với thông điệp `Heart-Healthy, Soul-Tasty`.
- Dòng bên trái `ĐANG NHẬN ĐƠN · 9–17H` và bên phải `HÀ NỘI · VIỆT NAM`.
- Phần menu bên dưới có headline `Bánh Của Chúng Mình`.

Nếu mở link mà vẫn thấy giao diện cũ:

1. Xác nhận đang mở đúng domain `https://moco-kitchen-ai-hub.vercel.app`.
2. Hard refresh hoặc mở `https://moco-kitchen-ai-hub.vercel.app/?v=20260615`.
3. Kiểm tra Vercel Production deployment có lấy commit mới nhất từ GitHub `main` hay không.
4. Kiểm tra Vercel project có deploy đúng thư mục `5_Landing_Page_Chatbot/` hay không, vì file `vercel.json` nằm trong thư mục này.
5. Nếu cần, redeploy Production từ Vercel sau khi chọn đúng commit.

## Demo Flow

1. Mở landing page và giới thiệu danh mục bảy sản phẩm.
2. Mở FAQ để minh họa cách trình bày thông tin về thành phần và bảo quản.
3. Đặt một câu hỏi cho chatbot, ví dụ: “Tôi cần lưu ý gì khi chọn bánh nếu đang kiểm soát đường?”
4. Mở Google Sheets và giới thiệu Content Generator.
5. Giới thiệu Order Form, Cost Engine, Thu-Chi và Dashboard.
6. Mở NotebookLM để cho thấy các câu trả lời dựa trên tài liệu đã chuẩn hóa.

## Pre-demo Checklist

- Kiểm tra landing page và chatbot đang hoạt động.
- Mở sẵn landing page, NotebookLM, Google Sheets và slide trong các browser tab riêng.
- Chuẩn bị screenshot dự phòng nếu kết nối internet không ổn định.
- Không hiển thị API key, password hoặc dữ liệu cá nhân của khách hàng.

## Tài liệu trong thư mục

| Tài liệu | Nội dung |
|---|---|
| `README.md` | Deployment & demo guide |
| `DEMO_SCRIPT.md` | Demo script 5 phút |
| `slide_images/` | Visual assets dùng cho presentation |
