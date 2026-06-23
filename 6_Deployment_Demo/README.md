# Deployment Demo

## URL demo

| Kênh | URL | Trạng thái |
|---|---|---|
| Landing page | [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) | Live |
| Google Sheet demo | [MOCO Kitchen AI workflow](https://docs.google.com/spreadsheets/d/1Ajbsj_xCligByJcebzb5clhamn0hmOtsBhoVSapoFAo/edit?usp=sharing) | View only |

## Nội dung thư mục

| File | Mô tả |
|---|---|
| `README.md` | Hướng dẫn tổng quan |
| `DEMO_SCRIPT.md` | Kịch bản demo 5 phút |
| `slide_images/` | Ảnh minh họa cho slide |

## Cách demo

1. Mở landing page trên Chrome.
2. Scroll qua hero, menu sản phẩm, story, gallery, FAQ và order.
3. Mở chatbot và test một câu hỏi về sản phẩm.
4. Giới thiệu Content Generator trong Google Sheets.
5. Giới thiệu workflow tạo hình ảnh từ ảnh sản phẩm chụp thực tế.
6. Giới thiệu NotebookLM knowledge base.

## Lưu ý bảo mật

- Chatbot gọi Gemini qua serverless API; key đọc từ biến môi trường trên Vercel.
- Khi demo Google Sheet, chỉ mở các tab AI/content cần trình bày và không trích dữ liệu nhạy cảm vào bài viết public.
