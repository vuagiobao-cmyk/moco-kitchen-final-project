---
id: "20260522154300"
aliases: ["Deployment Demo README"]
tags: ["#moco", "#deploy", "#demo"]
created: 2026-05-22
updated: 2026-05-22
---

# 6_Deployment_Demo — Hướng dẫn Demo dự án MOCO Kitchen

> Thư mục chứa hướng dẫn demo, kịch bản trình bày, screenshots và URL deploy.

## 🔗 URL Deploy

| Kênh | URL | Trạng thái |
|------|-----|-----------|
| **Vercel Production** | [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) | ✅ Live |
| Vercel Inspect | [Vercel Dashboard](https://vercel.com/phong7890-6763s-projects/moco-kitchen-ai-hub) | ✅ |

## Nội dung thư mục

| File | Mô tả |
|------|--------|
| `README.md` | File này — hướng dẫn tổng quan |
| `DEMO_SCRIPT.md` | Kịch bản demo 5 phút |

## Cách demo

1. Mở [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app) trên Chrome
2. Scroll qua các section (Monte v3): Brand Hero → Cake Hero → Menu (7 SP có giá) → Story → Gallery → FAQ → Order → Footer
3. Click chatbot widget (góc phải dưới) → test 3 queries
4. Show Apps Script trên Google Sheets (tab riêng)
5. Show NotebookLM notebook (tab riêng)

## Lưu ý bảo mật

- Chatbot gọi Gemini qua serverless `api/chat.js`; key đọc từ `GEMINI_API_KEY` trên Vercel env (KHÔNG hardcode trong frontend)
- Key là loại miễn phí của AI Studio
- Không share URL rộng rãi ngoài phạm vi lớp học
