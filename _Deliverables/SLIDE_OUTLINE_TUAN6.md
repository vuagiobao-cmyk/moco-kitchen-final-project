---
id: 20260514081500
aliases: ["Slide Tuần 6 MOCO", "Presentation Outline Week 6"]
tags: ["#moco-kitchen", "#presentation", "#tuan6"]
created: 2026-05-14
updated: 2026-05-14
---

# SLIDE OUTLINE — TUẦN 6: THUYẾT TRÌNH DỰ ÁN CUỐI KHÓA
## MOCO AI Creative & Operations Hub
### Google AI Bootcamp 2026 — CES Global

> **Format:** Google Slides | **Thời lượng trình bày:** 10-15 phút  
> **Audience:** Mentor & Classmates Google AI Bootcamp  
> **Template:** Dùng Google Slides với theme **matcha green** (background `#355C3B` hoặc cream `#F8F4E9` / accent `#C86F4E` — nhất quán brand MOCO landing Monte v3)

---

## 📋 CẤU TRÚC SLIDE (15 slides)

---

### SLIDE 1 — COVER
**Title:** MOCO Kitchen AI Marketing Hub  
**Subtitle:** Heart-Healthy, Soul-Tasty × Google AI Ecosystem  
**Visual:** Logo MOCO + ảnh bánh trên nền matcha green  
**Bottom:** Google AI Bootcamp 2026 | Tên học viên | Ngày

---

### SLIDE 2 — BÀI TOÁN (Problem Statement)
**Tiêu đề:** "Làm Bánh Healthy — Dễ. Kể Câu Chuyện Đúng — Khó."

**3 Pain Points (icon + 1 dòng mỗi cái):**
- 🕐 **Thời gian** — Viết content mỗi ngày tốn 2-3 giờ, bên cạnh việc sản xuất bánh
- ⚠️ **Rủi ro y tế** — Claim sai về "phù hợp tiểu đường" → liability pháp lý, mất uy tín
- 📣 **Nhất quán** — Brand voice bị loãng khi thuê nhiều CTV viết bài

**Quote:** *"Chúng mình muốn khách hàng TIN, không chỉ MUA."*

---

### SLIDE 3 — GIẢI PHÁP (Our Solution)
**Tiêu đề:** MOCO AI Hub — Creative + Operations

**Diagram 2 trục:**
```
TRỤC CREATIVE
[📚 Knowledge Base] → [🤖 Content Engine] → [🌐 Landing Page] → [💬 Chatbot]
   NotebookLM              Apps Script          HTML/CSS/JS         Gemini API

TRỤC OPERATIONS (Google Sheets + Apps Script)
[🧾 Đơn hàng] → [💰 Cost/Food cost %] → [📒 Thu-Chi tự động] → [📊 Dashboard KPI]
```

**Bottom line:** "Phủ cả truyền thông LẪN vận hành — đúng tên AI Creative & Operations Hub"

---

### SLIDE 4 — GOOGLE AI TOOLS MATRIX
**Tiêu đề:** 6 Google AI Tools — Mỗi Cái Giải Một Vấn Đề Cụ Thể

| Tool | Dùng cho | Pain Point giải quyết |
|------|----------|----------------------|
| NotebookLM | Knowledge Base RAG | Thông tin sai, không nhất quán |
| Gemini Pro | Content Generation | Tốn thời gian viết tay |
| Google Apps Script | Automation workflow | Lặp đi lặp lại thủ công |
| Gemini API | Chatbot tư vấn | Không có kênh Q&A 24/7 |
| Banana Pro (ImageFX) | Visual content | Thiếu ảnh sản phẩm chuyên nghiệp |
| Veo 3 | Video demo | Không có video giới thiệu |

---

### SLIDE 5 — PHASE 1: KNOWLEDGE BASE
**Tiêu đề:** Nền Tảng — Kiến Thức Đúng Trước Khi Tạo Content

**Left (60%):** NotebookLM Interface screenshot (hoặc mockup)
- 7 sources: menu, FAQ, dinh dưỡng, system prompt, content calendar, research, brand guidelines

**Right (40%):**
- ✅ Test kết quả 5/5 queries pass
- ✅ Guardrails y tế: luôn recommend hỏi bác sĩ
- ✅ Allergen matrix cho 7 sản phẩm
- ✅ Không tuyên bố "chữa bệnh"

**Key insight:** *"NotebookLM là 'bộ nhớ vàng' — AI chatbot biết đúng sản phẩm, đúng allergen, đúng brand voice"*

---

### SLIDE 6 — PHASE 2: SYSTEM PROMPT DESIGN
**Tiêu đề:** Brand Voice DNA — Viết Một Lần, Dùng Mãi Mãi

**Left:** Code block nhỏ (excerpt System Prompt V2):
```
"Xưng 'chúng mình', gọi khách 'Anh chị'
KHÔNG dùng: 'chữa bệnh', 'an toàn tuyệt đối'
Khách tiểu đường: luôn khuyên hỏi bác sĩ"
```

**Right:** Before vs After example:
- ❌ Before: *"Bánh không đường, ăn thoải mái!"*
- ✅ After: *"Chúng mình dùng Allulose — chất tạo ngọt tự nhiên ít ảnh hưởng đường huyết. Với anh chị đang quản lý đường huyết, hãy tham khảo thêm ý kiến bác sĩ nhé 🤎"*

---

### SLIDE 7 — PHASE 3: CONTENT ENGINE (Apps Script)
**Tiêu đề:** Từ Brief → Bài Viết — Trong 30 Giây

**Demo flow (3 steps với arrows):**
1. **📝 Input** — Điền brief trong Google Sheet (SP + loại bài + đối tượng)
2. **⚡ Generate** — Bấm 1 nút → Apps Script gọi Gemini API
3. **📋 Output** — Bài viết A-B-C chuẩn Brand Voice + 3 idea ảnh

**Stats:**
- 5 loại content template: Product / Education / BTS / Review / Seasonal
- Rate limit protection: auto-delay giữa requests
- Log đầy đủ: timestamp + status mỗi lần generate

---

### SLIDE 8 — SAMPLE OUTPUT (Content Engine)
**Tiêu đề:** Kết Quả Thực Tế — Keto Tiramisu Post

**Khung slide:** Mockup Facebook post với bài viết thật (copy từ output)

*[Paste sample output thực tế từ Gemini — Product Post Keto Tiramisu, Education Post Allulose]*

**Bottom note:** "Brand voice check: ✅ xưng 'chúng mình' | ✅ không hô hào | ✅ có disclaimer Baileys/rượu"

---

### SLIDE 8B — OPERATIONS SUITE (Google Sheets + Apps Script)
**Tiêu đề:** Trục Vận Hành — Từ Đơn Hàng Đến Lợi Nhuận, Tự Động

**4 khối (icon + 1 dòng):**
- 🧾 **Quản lý đơn hàng** — Form nhập đơn 1 chạm, tách nguồn khách (IG/Bạn/Threads), ship/bù ship
- 💰 **Tính giá vốn tự động** — Từ công thức + giá NVL → food cost %. VD: Keto Tiramisu 83.876đ/hộp, giá 180k, food cost 46,6%
- 📒 **Sổ Thu-Chi tự động** — Đơn "Đã nhận tiền" → tự ghi THU; tách vốn đầu kỳ khỏi doanh thu
- 📊 **Dashboard KPI** — Doanh thu, chi phí, lợi nhuận, top bánh bán chạy, NVL biến động

**Stats live (dữ liệu thật):** 41 đơn · 31 đã thanh toán · doanh thu sau CK 8.235.000đ

**Key insight:** *"AI không chỉ giúp bán hàng — còn giúp founder biết mỗi chiếc bánh lãi bao nhiêu."*

---

### SLIDE 9 — PHASE 4: LANDING PAGE
**Tiêu đề:** Mặt Tiền Thương Hiệu — Landing Page AI-Powered

**Screenshot landing page** (full-width, matcha green theme)

**Section highlight (badges nhỏ overlay) — layout Monte v3:**
- 🏠 Brand Hero — vòng chữ xoay + slogan
- 🍰 Cake Hero — ảnh bánh + badge Best Seller
- 📋 Menu — 7 SP (2 dòng Keto/Healthy), có giá + cảnh báo rượu
- 📖 Story — câu chuyện MOCO
- 📸 Gallery — feed Instagram-style
- ❓ FAQ — dinh dưỡng & đặt hàng
- 📞 Order — đặt qua Zalo/Instagram/Facebook (Hà Nội)

---

### SLIDE 10 — PHASE 4: CHATBOT GEMINI
**Tiêu đề:** Tư Vấn 24/7 — Không Cần Con Người

**Left:** Screenshot chatbot widget trên landing page

**Right — Demo conversation:**
```
👤 "Tôi bị tiểu đường, ăn Tiramisu được không?"

🤖 "Keto Tiramisu của chúng mình dùng Allulose
thay đường trắng 🤎 Allulose ít ảnh hưởng đường
huyết hơn. Tuy nhiên, với anh chị đang điều trị
tiểu đường, chúng mình khuyến nghị tham khảo ý
kiến bác sĩ trước khi thưởng thức nhé."
```

**Badge:** "⚠️ Disclaimer y tế tự động — không tư vấn y khoa"

---

### SLIDE 11 — SAFETY & GUARDRAILS
**Tiêu đề:** Trách Nhiệm Thương Hiệu — Không Gì Quan Trọng Hơn An Toàn

**3-column layout:**

| 🛡️ Medical Safety | 🥜 Allergen Matrix | ✅ Content Guard |
|-------------------|-------------------|----------------|
| Tự động disclaimer tiểu đường, mẹ bầu | 7 SP × 8 allergen listed | Không tuyên bố "số 1", "chữa bệnh" |
| "Hỏi bác sĩ" trong mọi context y tế | Keto Tiramisu: cồn (Baileys, rum) | System Prompt enforce 100% |
| NotebookLM + Chatbot cùng guardrails | Gluten-free: chỉ dòng keto | Log mọi output để audit |

**Bottom:** *"Responsible AI không chỉ là yêu cầu pháp lý — đây là cam kết thương hiệu của MOCO Kitchen"*

---

### SLIDE 12 — KẾT QUẢ & IMPACT
**Tiêu đề:** Từ 0 → AI Hub Trong 6 Tuần

**Left — Numbers:**
- **7** sản phẩm được document đầy đủ vào KB
- **5/5** test queries NotebookLM PASS
- **4** tầng automation (KB → Content → Web → Chat)
- **6** Google AI tools tích hợp
- **400+** dòng code Apps Script production-ready

**Right — Time saved estimate:**
- Content writing: 2-3h/ngày → ~20 phút review
- FAQ response: real-time 24/7 vs. trả lời thủ công
- Allergen check: manual vs. auto trong system prompt

---

### SLIDE 13 — LESSONS LEARNED
**Tiêu đề:** 3 Bài Học Quan Trọng Nhất

**Format: 3 cards lớn**

**Card 1 — Responsible AI First 🛡️**  
*"Guardrails y tế không phải hạn chế — đó là bảo vệ cả khách hàng lẫn thương hiệu. Viết system prompt cẩn thận hơn viết code."*

**Card 2 — Prompt Engineering = Brand Architecture 🏗️**  
*"System Prompt V2 tốn thời gian nhất — nhưng là backbone của mọi thứ còn lại. Đầu tư đúng chỗ."*

**Card 3 — Start Simple, Layer Complexity 📈**  
*"NotebookLM → Apps Script → Chatbot — mỗi tầng build trên nền tầng trước. Đừng build everything at once."*

---

### SLIDE 14 — NEXT STEPS (Nếu Có Thêm Thời Gian)
**Tiêu đề:** Roadmap Tháng Tới

**Timeline layout (horizontal):**

```
TUẦN 7          TUẦN 8          TUẦN 9          TUẦN 10
   │               │               │               │
Deploy Vercel   Test Chatbot    Order Automation  Analytics
vercel.json     live (API Key)  Google Sheet sync NotebookLM
                                + Email notify    monthly report
```

**Optional features:**
- Zalo OA integration (order management)
- Ảnh sản phẩm AI → Banana Pro / ImageFX workflow
- A/B test content performance (Facebook Insights)

---

### SLIDE 15 — THANK YOU / Q&A
**Visual:** Ảnh bánh MOCO Kitchen đẹp nhất (full slide)

**Overlay text:**
> *"Chúng mình tin rằng công nghệ phục vụ tốt nhất khi nó giúp con người làm những điều họ yêu thích — nhiều hơn, tốt hơn."*

**Contact:**
- Demo: [link Vercel deploy]
- GitHub: [repo nếu có]

**Bottom:** MOCO Kitchen × Google AI Bootcamp 2026

---

## 📝 HƯỚNG DẪN THỰC HIỆN SLIDE

### Bước 1: Tạo Google Slides mới
- File → New → Google Slides
- Theme: Blank (tự customize)
- Slide size: 16:9 Widescreen

### Bước 2: Color palette (Monte v3 — matcha green)
```
Background: #355C3B (matcha green) hoặc #F8F4E9 (cream)
Surface/Card: #FFF8E7 (cream nhạt)
Accent: #C86F4E (terracotta ấm) / #6F8F57 (matcha sáng)
Text trên nền xanh: #FFF8E7
Text trên nền cream: #243127
```

### Bước 3: Font
- Heading: Cormorant Garamond (serif — gợi cảm bánh ngọt)
- Body: Inter (sans-serif — dễ đọc)

### Bước 4: Điền nội dung
Copy từng slide outline ở trên → điền vào Google Slides tương ứng

### Bước 5: Thêm visuals
- Ảnh sản phẩm MOCO từ `_Assets/`
- Screenshots landing page (Ctrl+Shift+5 hoặc Snipping Tool)
- Screenshots NotebookLM
- Diagram từ slide 3 vẽ bằng Google Slides Shape

---

*Outline bởi @Manager_May — Dự Án Cuối Khóa MOCO Kitchen 2026*

---

## Related

- [[HANDOFF_AUDIT_2026-05-14]]
- [[HANDOFF_CODEX_PHASE1_PHASE2_2026-05-13]]
- [[HANDOFF_FINAL_2026-05-14]]
- [[HANDOFF_MOCO_ORDER_SHEET_UI_2026-05-14]]
- [[HANDOFF_SESSION_2026-05-14]]
