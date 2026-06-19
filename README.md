# MOCO Kitchen - Du an ung dung Google AI

Day la du an cuoi khoa Google AI Bootcamp 2026 cua Vu Hoang Phong, duoc xay dung tu nhu cau thuc te cua MOCO Kitchen, mot thuong hieu banh healthy truc tuyen tai Ha Noi.

**Landing page:** [moco-kitchen-ai-hub.vercel.app](https://moco-kitchen-ai-hub.vercel.app)

**Google Sheet demo (view only):** [MOCO Kitchen AI workflow](https://docs.google.com/spreadsheets/d/1Ajbsj_xCligByJcebzb5clhamn0hmOtsBhoVSapoFAo/edit?usp=sharing)

## Bai toan

MOCO Kitchen co san pham that va can mot he thong gon nhe de ho tro truyen thong, quan ly thong tin san pham va tu van khach hang. Nhung kho khan chinh gom:

- Viet content mat nhieu thoi gian va kho giu brand voice nhat quan.
- Thong tin san pham, thanh phan va cach bao quan nam rai rac o nhieu noi.
- Khach hang thuong hoi lai cac cau ve thanh phan, di ung va cach chon san pham.
- Hinh anh san pham can du so luong va chat luong cho menu, landing page va social.
- Thuong hieu can mot landing page rieng de gioi thieu san pham va ho tro dat hang.

## Giai phap

Du an xay dung mot he thong gom nam phan co the trinh bay cong khai:

1. Knowledge base cho bay san pham MOCO Kitchen.
2. Huong dan brand voice va Content Generator bang Gemini.
3. Workflow hinh anh san pham: dung anh chup dien thoai cua banh that lam nguon, sau do dung AI de thu background, anh sang va bien the hinh anh.
4. Landing page gioi thieu san pham va cau chuyen thuong hieu.
5. Chatbot hoi dap ve san pham, thanh phan, bao quan va dat hang.

Mot so phan van hanh noi bo da duoc tach khoi repo cong khai de tranh dua du lieu nhay cam vao bai nop.

## Cong cu su dung

| Cong cu | Vai tro trong du an |
|---|---|
| NotebookLM | Doc va tong hop knowledge base san pham |
| Gemini | Ho tro viet content va tra loi cau hoi cua khach hang |
| Google Sheets + Apps Script | Tao Content Generator va quy trinh tao noi dung |
| Cong cu tao anh cua Google | Ho tro thu background, anh sang va bien the hinh anh san pham |
| Veo 3 | Thu nghiem y tuong video gioi thieu |
| Vercel | Deploy landing page |

## Ket qua chinh

- Chuan hoa thong tin cho bay san pham that.
- Xay dung landing page responsive.
- Tich hop chatbot qua serverless API, khong de lo API key trong frontend.
- Tao Content Generator ngay trong Google Sheets.
- Xay dung workflow hinh anh dua tren anh san pham chup thuc te.
- Chuan hoa tai lieu demo va bao cao tien do sau tuan.

## Cau truc du an

| Thu muc | Noi dung |
|---|---|
| `1_Research/` | Mo ta bai toan, nghien cuu thi truong, khach hang va canh tranh |
| `2_Knowledge_Base/` | Danh muc nguon su dung trong NotebookLM |
| `3_Content_Engine/` | Thong tin san pham, FAQ, lich noi dung va bai viet mau |
| `3_Creative_Content/` | He thong hinh anh va kich ban phan canh video |
| `4_App_Automation/` | Content Generator va huong dan Apps Script cho demo |
| `5_Landing_Page_Chatbot/` | Landing page va chatbot |
| `6_Deployment_Demo/` | Deployment guide va demo script |
| `_Deliverables/Weekly_Reports/` | Bao cao tien do sau tuan |

## Bat dau doc du an

1. [Bao cao tien do sau tuan](_Deliverables/Weekly_Reports/README.md)
2. [Mo ta bai toan](1_Research/problem_statement_RCGC.md)
3. [Design - Nhan dien thuong hieu](3_Creative_Content/design.md)
4. [Thong tin bay san pham](3_Content_Engine/moco_menu_products.md)
5. [Huong dan trien khai va trinh dien](6_Deployment_Demo/README.md)

## Luu y ve noi dung suc khoe

Tro ly cua MOCO chi cung cap thong tin ve san pham. Du an khong dua ra chan doan hoac loi khuyen dieu tri. Nguoi co benh nen, dang mang thai hoac co tien su di ung nen tham khao bac si hay chuyen gia dinh duong truoc khi lua chon thuc pham.
