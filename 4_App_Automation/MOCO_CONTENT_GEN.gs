/**
 * MOCO_CONTENT_GEN.gs — Trợ lý Content AI cho MOCO Kitchen
 * Dự Án Cuối Khóa Google AI Bootcamp 2026
 *
 * Chức năng:
 *   - Đọc thông tin sản phẩm và brief từ sheet "Content Brief"
 *   - Gọi Gemini API để sinh bài viết Facebook/Instagram
 *   - Ghi kết quả vào sheet "Content Output"
 *
 * Cách dùng:
 *   1. Trong Script Editor: Extensions → Apps Script → paste file này
 *   2. Vào Project Settings → Script Properties → Thêm:
 *      GEMINI_API_KEY = AIza... (key từ aistudio.google.com/apikey)
 *   3. Chạy setupSheets() một lần để tạo sheets cần thiết
 *   4. Điền brief vào sheet "Content Brief" → Bấm nút "✨ Generate Content"
 *
 * Version: 1.1 | 2026-06-03 (đồng bộ model gemini-2.5-flash với chatbot landing)
 */

// ==================== CONFIG ====================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const SHEET_BRIEF   = 'Content Brief';
const SHEET_OUTPUT  = 'Content Output';
const SHEET_LOG     = 'Generation Log';

// ==================== SYSTEM PROMPT ====================

const SYSTEM_PROMPT = `Bạn là "Trợ lý Content MOCO Kitchen" — trợ lý AI chuyên viết bài đăng Facebook/Instagram cho thương hiệu bánh Healthy MOCO Kitchen.

## THÔNG TIN THƯƠNG HIỆU
- Tên: MOCO Kitchen | Slogan: "Heart-Healthy, Soul-Tasty"
- Lĩnh vực: Bánh Healthy online — 2 dòng sản phẩm

### DÒNG KETO (ít carb, dùng allulose + đường la hán):
1. Keto Tiramisu — mascarpone Anchor, cà phê, rum, Baileys, lady finger hạnh nhân tự làm
2. Keto Lemon Cheesecake — cream cheese, chanh vàng, đế bánh quy hạnh nhân

### DÒNG HEALTHY BAKING (giảm đường tinh luyện):
3. Chuối Yến Mạch Choco — ngọt tự nhiên từ chuối, không thêm đường, có socola chip
4. Bánh Mì Soda Nguyên Cám — kiểu Ireland, không cần men, bột nguyên cám, mè đen
5. Bông Lan Trứng Muối — trehalose, chà bông rong biển, vị mặn ngọt
6. Carrot Cake Kem Hy Lạp — cà rốt, óc chó, nho khô, quế, kem sữa chua Hy Lạp
7. Bánh Mì Cuộn Quế — bột hồ tangzhong, đường dừa, kem cream cheese

## GIỌNG VĂN BẮT BUỘC
- Xưng "chúng mình", gọi khách "Các bạn"/"Anh chị"
- Giọng: chân thành, tỉ mỉ, trân trọng nguyên liệu. KHÔNG "bốc phét"
- Emoji: tối đa 2-3/đoạn. Ưu tiên: 🤎 🍰 ☕ ✨ 🌿
- KHÔNG dùng từ lóng Gen Z, KHÔNG hô hào "MUA NGAY"
- KHÔNG tự tuyên bố "ngon nhất", "số 1"

## CẤU TRÚC BÀI VIẾT
A. Mở đầu (2-3 câu): Câu chuyện thật / nỗi trăn trở — tạo đồng cảm ngay
B. Thân bài (3-5 đoạn): Mô tả nguyên liệu gợi cảm giác, chi tiết kỹ thuật
C. Kết bài (1-2 câu): Lời mời nhẹ nhàng, tử tế

## LƯU Ý DINH DƯỠNG & AN TOÀN
- KHÔNG dùng: "chữa bệnh", "trị tiểu đường", "an toàn tuyệt đối", "ăn thoải mái"
- Khách tiểu đường/mẹ bầu/dị ứng: luôn khuyên hỏi bác sĩ
- Keto Tiramisu có rượu — không phù hợp trẻ em, mẹ bầu, người kiêng cồn

Sau bài viết, thêm "---" rồi gợi ý 2-3 idea ảnh minh họa.`;

// ==================== MENU ====================
// LƯU Ý: project Apps Script chỉ được có MỘT onOpen(). onOpen() chính nằm ở
// MOCO_NHAP_HANG_V2.gs và sẽ gọi buildContentAiMenu_() bên dưới (guarded).
// KHÔNG đặt tên hàm này là onOpen() để tránh trùng → vỡ menu vận hành.

function buildContentAiMenu_() {
  const ui = SpreadsheetApp.getUi();

  // Submenu Lịch nội dung (định nghĩa ở MOCO_CONTENT_CALENDAR.gs)
  const calendarMenu = ui.createMenu('📅 Lịch nội dung')
    .addItem('🆕 Setup Content Calendar', 'setupContentCalendar')
    .addItem('➡️ Đẩy toàn bộ lịch chưa xử lý sang Brief', 'pushCalendarToBrief')
    .addItem('📆 Chỉ đẩy bài đến hạn hôm nay', 'pushDueCalendarToBrief');

  ui.createMenu('🍰 MOCO Content AI')
    .addItem('✨ Generate Content', 'generateContentFromBrief')
    .addItem('📋 Setup Sheets', 'setupSheets')
    .addItem('🧹 Clear Output Sheet', 'clearOutputSheet')
    .addSeparator()
    .addSubMenu(calendarMenu)
    .addItem('🎨 Tạo prompt ảnh Banana Pro', 'generateBananaPrompts')
    .addSeparator()
    .addItem('ℹ️ Hướng dẫn sử dụng', 'showHelp')
    .addToUi();
}

/**
 * Hàm CHUYÊN để cấp quyền gọi API ngoài (UrlFetchApp → Gemini).
 * Chạy hàm này MỘT LẦN từ Apps Script editor (▶ Run) → Google sẽ hỏi quyền → bấm Allow.
 * Không gọi getUi() nên chạy được trong editor, không bị lỗi "from this context".
 */
function authorizeExternal() {
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models', { muteHttpExceptions: true });
  Logger.log('UrlFetchApp OK — HTTP ' + res.getResponseCode() + '. Quyền external_request đã được cấp.');
}

// ==================== SETUP ====================

/**
 * Tạo sheets cần thiết nếu chưa có.
 * Chạy một lần khi setup.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Sheet: Content Brief ---
  let briefSheet = ss.getSheetByName(SHEET_BRIEF);
  if (!briefSheet) {
    briefSheet = ss.insertSheet(SHEET_BRIEF);
  }
  briefSheet.clearContents();

  // Header row
  const briefHeaders = [
    'Sản phẩm',
    'Loại bài',
    'Nhóm đối tượng',
    'Điểm nhấn / Occasion',
    'Ghi chú thêm',
    'Trạng thái'
  ];
  briefSheet.getRange(1, 1, 1, briefHeaders.length)
    .setValues([briefHeaders])
    .setFontWeight('bold')
    .setBackground('#2d1b4e')
    .setFontColor('#ffffff');

  // Sample rows
  const sampleRows = [
    ['Keto Tiramisu', 'Product Post', 'Người kiểm soát đường huyết', 'Nhấn mạnh Allulose, không đường trắng', '', 'Chờ xử lý'],
    ['Carrot Cake Kem Hy Lạp', 'Education Post', 'Người ăn kiêng', 'Giải thích đường dừa vs đường trắng', '', 'Chờ xử lý'],
    ['Chuối Yến Mạch Choco', 'BTS / Storytelling', 'Mẹ bầu', 'Quy trình làm thủ công, không chất bảo quản', '', 'Chờ xử lý'],
  ];
  briefSheet.getRange(2, 1, sampleRows.length, sampleRows[0].length).setValues(sampleRows);

  // Dropdown cho cột "Loại bài"
  const postTypes = ['Product Post', 'Education Post', 'BTS / Storytelling', 'Review / Social Proof', 'Seasonal / Event'];
  const postTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(postTypes, true)
    .setAllowInvalid(false)
    .build();
  briefSheet.getRange(2, 2, 50, 1).setDataValidation(postTypeRule);

  // Dropdown cho cột "Trạng thái"
  const statusTypes = ['Chờ xử lý', '🔄 Đang tạo', '✅ Đã tạo', '❌ Lỗi'];
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusTypes, true)
    .setAllowInvalid(false)
    .build();
  briefSheet.getRange(2, 6, 50, 1).setDataValidation(statusRule);

  briefSheet.setFrozenRows(1);
  briefSheet.autoResizeColumns(1, briefHeaders.length);

  // --- Sheet: Content Output ---
  let outputSheet = ss.getSheetByName(SHEET_OUTPUT);
  if (!outputSheet) {
    outputSheet = ss.insertSheet(SHEET_OUTPUT);
  }
  outputSheet.clearContents();

  const outputHeaders = ['Timestamp', 'Sản phẩm', 'Loại bài', 'Đối tượng', 'Nội dung bài viết', 'Idea ảnh'];
  outputSheet.getRange(1, 1, 1, outputHeaders.length)
    .setValues([outputHeaders])
    .setFontWeight('bold')
    .setBackground('#1a4a1a')
    .setFontColor('#ffffff');

  outputSheet.setColumnWidth(5, 600); // Cột nội dung rộng hơn
  outputSheet.setColumnWidth(6, 300);
  outputSheet.setFrozenRows(1);

  // --- Sheet: Generation Log ---
  let logSheet = ss.getSheetByName(SHEET_LOG);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_LOG);
  }
  logSheet.clearContents();

  const logHeaders = ['Timestamp', 'Hành động', 'Chi tiết', 'Trạng thái'];
  logSheet.getRange(1, 1, 1, logHeaders.length)
    .setValues([logHeaders])
    .setFontWeight('bold')
    .setBackground('#4a3000')
    .setFontColor('#ffffff');
  logSheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert(
    '✅ Setup hoàn tất!\n\n' +
    'Sheets đã tạo:\n' +
    '• "Content Brief" — Điền brief vào đây\n' +
    '• "Content Output" — Xem kết quả ở đây\n' +
    '• "Generation Log" — Nhật ký hoạt động\n\n' +
    'Bước tiếp theo:\n' +
    '1. Vào Extensions → Apps Script → Project Settings\n' +
    '2. Thêm Script Property: GEMINI_API_KEY = [key của bạn]\n' +
    '3. Điền brief → Bấm "✨ Generate Content"'
  );
}

// ==================== MAIN GENERATOR ====================

/**
 * Đọc tất cả rows "Chờ xử lý" từ sheet Brief → gọi Gemini → ghi Output.
 */
function generateContentFromBrief() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const briefSheet = ss.getSheetByName(SHEET_BRIEF);
  const outputSheet = ss.getSheetByName(SHEET_OUTPUT);
  const logSheet = ss.getSheetByName(SHEET_LOG);

  if (!briefSheet || !outputSheet) {
    SpreadsheetApp.getUi().alert('⚠️ Chưa setup sheets. Hãy chạy "Setup Sheets" trước.');
    return;
  }

  // Lấy API Key từ Script Properties
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Chưa cấu hình API Key!\n\n' +
      'Vào: Extensions → Apps Script → Project Settings → Script Properties\n' +
      'Thêm property: GEMINI_API_KEY = AIza...\n\n' +
      'Lấy key miễn phí tại: aistudio.google.com/apikey'
    );
    return;
  }

  const data = briefSheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  // Lọc rows "Chờ xử lý"
  const pendingRows = rows.map((row, idx) => ({ row, idx: idx + 2 }))
    .filter(({ row }) => row[5] === 'Chờ xử lý' || row[5] === '');

  if (pendingRows.length === 0) {
    SpreadsheetApp.getUi().alert('✅ Không có brief nào cần xử lý.\n\nĐặt cột "Trạng thái" = "Chờ xử lý" để generate.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    `🍰 MOCO Content Generator`,
    `Tìm thấy ${pendingRows.length} brief cần tạo content.\n\nBắt đầu generate?`,
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  let successCount = 0;
  let errorCount = 0;

  pendingRows.forEach(({ row, idx }) => {
    const [product, postType, audience, highlight, extraNote] = row;

    // Đánh dấu "Đang tạo"
    briefSheet.getRange(idx, 6).setValue('🔄 Đang tạo');
    SpreadsheetApp.flush();

    try {
      const { content, imageIdeas } = callGeminiForContent(
        apiKey, product, postType, audience, highlight, extraNote
      );

      // Ghi vào Output sheet
      const timestamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm');
      outputSheet.appendRow([timestamp, product, postType, audience, content, imageIdeas]);

      // Format hàng mới
      const lastRow = outputSheet.getLastRow();
      outputSheet.getRange(lastRow, 5).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
      outputSheet.setRowHeight(lastRow, 200);

      // Cập nhật trạng thái Brief
      briefSheet.getRange(idx, 6).setValue('✅ Đã tạo');

      // Log
      appendLog(logSheet, 'GENERATE', `${product} / ${postType}`, '✅ Thành công');
      successCount++;

    } catch (err) {
      briefSheet.getRange(idx, 6).setValue('❌ Lỗi');
      appendLog(logSheet, 'ERROR', `${product}: ${err.message}`, '❌ Thất bại');
      errorCount++;
    }

    // Delay tránh rate limit
    if (pendingRows.length > 1) Utilities.sleep(1500);
  });

  ui.alert(
    `✅ Hoàn tất!\n\n` +
    `• Thành công: ${successCount} bài\n` +
    `• Lỗi: ${errorCount} bài\n\n` +
    `Xem kết quả tại sheet "Content Output".`
  );
}

// ==================== GEMINI API ====================

/**
 * Gọi Gemini API để sinh nội dung bài viết.
 * @returns {{ content: string, imageIdeas: string }}
 */
function callGeminiForContent(apiKey, product, postType, audience, highlight, extraNote) {
  const userPrompt = buildUserPrompt(product, postType, audience, highlight, extraNote);

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.75,
      topP: 0.9,
      // gemini-2.5-flash bật "thinking" mặc định → ăn hết token output làm bài bị cụt.
      // Đặt thinkingBudget = 0 để tắt thinking, dồn toàn bộ token cho nội dung bài.
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(`${GEMINI_API_URL}?key=${apiKey}`, options);
  let code = response.getResponseCode();
  let body = response.getContentText();

  // Tự động thử lại khi model quá tải / rate limit (429, 500, 503, "high demand").
  let attempt = 1;
  const maxAttempts = 3;
  while (code !== 200 && attempt < maxAttempts) {
    const isTransient = code === 429 || code === 500 || code === 503 ||
      /high demand|overloaded|try again later|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(body);
    if (!isTransient) break;
    Utilities.sleep(2500 * attempt); // chờ tăng dần: 2.5s rồi 5s
    attempt++;
    const retry = UrlFetchApp.fetch(`${GEMINI_API_URL}?key=${apiKey}`, options);
    code = retry.getResponseCode();
    body = retry.getContentText();
  }

  if (code !== 200) {
    const err = JSON.parse(body);
    throw new Error(err.error?.message || `HTTP ${code}`);
  }

  const json = JSON.parse(body);
  const fullText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!fullText) {
    const reason = json.candidates?.[0]?.finishReason || 'không rõ';
    throw new Error('Model không trả về nội dung (finishReason: ' + reason + ')');
  }

  // Tách bài viết và idea ảnh (phân cách bằng "---")
  const parts = fullText.split('---');
  const content    = parts[0]?.trim() || fullText;
  const imageIdeas = parts[1]?.trim() || '(Xem trong nội dung bài)';

  return { content, imageIdeas };
}

/**
 * Xây dựng user prompt từ brief.
 */
function buildUserPrompt(product, postType, audience, highlight, extraNote) {
  const typeGuides = {
    'Product Post':         'Viết bài giới thiệu sản phẩm. Tập trung nguyên liệu và cảm giác thưởng thức.',
    'Education Post':       'Viết bài giáo dục/thông tin. Giải thích một khái niệm liên quan đến sản phẩm theo cách dễ hiểu.',
    'BTS / Storytelling':   'Viết bài Behind-the-scenes. Kể câu chuyện quá trình làm bánh, nhấn mạnh sự tỉ mỉ thủ công.',
    'Review / Social Proof':'Viết bài dưới góc nhìn khách hàng. Kể trải nghiệm thật, không quảng cáo lộ liễu.',
    'Seasonal / Event':     'Viết bài theo sự kiện/mùa. Kết nối cảm xúc mùa vụ với sản phẩm.',
  };
  const guide = typeGuides[postType] || 'Viết bài Facebook giới thiệu sản phẩm.';

  let prompt = `${guide}\n\nSản phẩm: ${product}\nĐối tượng: ${audience}`;
  if (highlight) prompt += `\nĐiểm nhấn: ${highlight}`;
  if (extraNote) prompt += `\nGhi chú thêm: ${extraNote}`;
  prompt += '\n\nViết bài theo cấu trúc A-B-C. Tuân thủ 100% Brand Voice DNA.';

  return prompt;
}

// ==================== UTILITIES ====================

function appendLog(logSheet, action, detail, status) {
  const ts = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  logSheet.appendRow([ts, action, detail, status]);
}

function clearOutputSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const outputSheet = ss.getSheetByName(SHEET_OUTPUT);
  if (!outputSheet) return;

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '⚠️ Xác nhận xóa?',
    'Toàn bộ nội dung đã generate trong "Content Output" sẽ bị xóa.',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  const lastRow = outputSheet.getLastRow();
  if (lastRow > 1) {
    outputSheet.deleteRows(2, lastRow - 1);
  }
  ui.alert('✅ Đã xóa sạch Content Output.');
}

function showHelp() {
  const help =
    '🍰 MOCO Content Generator — Hướng dẫn nhanh\n\n' +
    '1. Chạy "Setup Sheets" để tạo sheets cần thiết\n' +
    '2. Thêm API Key:\n' +
    '   Extensions → Apps Script → Project Settings\n' +
    '   → Script Properties → GEMINI_API_KEY = AIza...\n' +
    '3. Điền brief vào sheet "Content Brief":\n' +
    '   - Sản phẩm: chọn từ menu MOCO\n' +
    '   - Loại bài: Product / Education / BTS / Review\n' +
    '   - Đối tượng & Điểm nhấn: mô tả ngắn\n' +
    '   - Trạng thái: để "Chờ xử lý"\n' +
    '4. Bấm "✨ Generate Content"\n' +
    '5. Xem kết quả tại sheet "Content Output"\n\n' +
    'Lấy API Key miễn phí: aistudio.google.com/apikey';

  SpreadsheetApp.getUi().alert('ℹ️ Hướng dẫn', help, SpreadsheetApp.getUi().ButtonSet.OK);
}
