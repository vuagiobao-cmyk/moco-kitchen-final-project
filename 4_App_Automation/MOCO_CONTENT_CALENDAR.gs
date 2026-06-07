/**
 * MOCO_CONTENT_CALENDAR.gs — Lịch nội dung + Prompt ảnh Banana Pro cho MOCO Kitchen
 * Dự Án Cuối Khóa Google AI Bootcamp 2026
 *
 * Bổ sung cho MOCO_CONTENT_GEN.gs:
 *   1. Content Calendar — lên lịch bài theo Ngày đăng / Kênh, đẩy tự động sang "Content Brief".
 *   2. Banana Pro — chuyển "Idea ảnh" (tiếng Việt) thành prompt ảnh tiếng Anh chuẩn
 *      Nano Banana Pro để gen ảnh minh hoạ kèm bài.
 *
 * Dùng chung với MOCO_CONTENT_GEN.gs các global: GEMINI_API_URL, SHEET_BRIEF,
 * SHEET_OUTPUT, SHEET_LOG, appendLog(). Menu được nối qua buildContentAiMenu_().
 *
 * Version: 1.0 | 2026-06-07
 */

// ==================== CONFIG ====================

const SHEET_CALENDAR = 'Content Calendar';

// Vị trí cột (1-based) trong sheet Content Calendar
const CAL_COL_DATE     = 1; // Ngày đăng
const CAL_COL_CHANNEL  = 2; // Kênh
const CAL_COL_PRODUCT  = 3; // Sản phẩm
const CAL_COL_TYPE     = 4; // Loại bài
const CAL_COL_AUDIENCE = 5; // Đối tượng
const CAL_COL_HIGHLIGHT= 6; // Điểm nhấn / Occasion
const CAL_COL_NOTE     = 7; // Ghi chú thêm
const CAL_COL_PUSHED   = 8; // Đã đẩy?

const CAL_PUSHED_MARK = '✅ Đã đẩy';

// Cột "Banana Pro Prompt" sẽ thêm vào sheet Content Output (cột 7)
const OUTPUT_COL_BANANA = 7;

// ==================== SYSTEM PROMPT (BANANA PRO) ====================

const BANANA_SYSTEM_PROMPT = `You are a food photography art director for "MOCO Kitchen", a Vietnamese healthy/keto home bakery.
Convert the Vietnamese image ideas into ONE polished English image-generation prompt for "Nano Banana Pro".

Rules for the prompt:
- Subject first: the specific cake/bake, described appetizingly (texture, cut, garnish).
- Photography style: professional food photography, natural soft window light, shallow depth of field, 50mm look.
- Styling: warm, wholesome, artisanal; props that fit a cozy home kitchen (linen, wood board, ceramic plate, fresh ingredients nearby).
- Color palette: warm earthy tones — sage green, oatmeal beige, cocoa brown, milk white.
- Mood: honest, heart-healthy, soul-tasty. NOT over-glossy, NOT fake/plastic looking.
- Technical: high resolution, sharp focus on the cake, clean composition, no text, no watermark, no logo.
- Output ONLY the final English prompt as a single paragraph. No preamble, no bullet points, no quotes.`;

// ==================== CONTENT CALENDAR ====================

/**
 * Tạo sheet "Content Calendar" với header, dropdown và vài dòng mẫu.
 */
function setupContentCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let cal = ss.getSheetByName(SHEET_CALENDAR);
  if (!cal) cal = ss.insertSheet(SHEET_CALENDAR);
  cal.clearContents();

  const headers = [
    'Ngày đăng', 'Kênh', 'Sản phẩm', 'Loại bài',
    'Đối tượng', 'Điểm nhấn / Occasion', 'Ghi chú thêm', 'Đã đẩy?'
  ];
  cal.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#2d1b4e')
    .setFontColor('#ffffff');

  const today = new Date();
  const fmt = (d) => Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  const plus = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

  const sample = [
    [fmt(today),   'Facebook',  'Keto Tiramisu',          'Product Post',        'Người kiểm soát đường huyết', 'Nhấn mạnh Allulose, không đường trắng', '', ''],
    [fmt(plus(1)), 'Instagram', 'Carrot Cake Kem Hy Lạp', 'Education Post',       'Người ăn kiêng',              'Giải thích đường dừa vs đường trắng',   '', ''],
    [fmt(plus(3)), 'TikTok',    'Chuối Yến Mạch Choco',   'BTS / Storytelling',  'Mẹ bầu',                      'Quy trình làm thủ công',                '', ''],
  ];
  cal.getRange(2, 1, sample.length, sample[0].length).setValues(sample);

  // Dropdown: Kênh
  const channels = ['Facebook', 'Instagram', 'TikTok', 'Zalo', 'Website'];
  cal.getRange(2, CAL_COL_CHANNEL, 100, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(channels, true).setAllowInvalid(false).build()
  );

  // Dropdown: Loại bài (đồng bộ với Content Brief)
  const postTypes = ['Product Post', 'Education Post', 'BTS / Storytelling', 'Review / Social Proof', 'Seasonal / Event'];
  cal.getRange(2, CAL_COL_TYPE, 100, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(postTypes, true).setAllowInvalid(false).build()
  );

  // Dropdown: Đã đẩy?
  cal.getRange(2, CAL_COL_PUSHED, 100, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['', CAL_PUSHED_MARK], true).setAllowInvalid(true).build()
  );

  cal.setFrozenRows(1);
  cal.autoResizeColumns(1, headers.length);

  SpreadsheetApp.getUi().alert(
    '✅ Đã tạo sheet "Content Calendar".\n\n' +
    'Cách dùng:\n' +
    '1. Điền lịch: Ngày đăng, Kênh, Sản phẩm, Loại bài, Đối tượng, Điểm nhấn.\n' +
    '2. Menu 🍰 → 📅 Lịch nội dung → "Đẩy ... sang Brief".\n' +
    '3. Sang sheet "Content Brief" bấm "✨ Generate Content".\n\n' +
    'Bài đã đẩy sẽ được đánh dấu "' + CAL_PUSHED_MARK + '" để không đẩy trùng.'
  );
}

/**
 * Đẩy toàn bộ dòng lịch CHƯA đẩy sang Content Brief.
 */
function pushCalendarToBrief() {
  pushCalendarToBrief_(false);
}

/**
 * Chỉ đẩy các dòng có Ngày đăng <= hôm nay và chưa đẩy.
 */
function pushDueCalendarToBrief() {
  pushCalendarToBrief_(true);
}

/**
 * Lõi đẩy lịch sang brief.
 * @param {boolean} dueOnly - true: chỉ đẩy bài đến hạn (Ngày đăng <= hôm nay).
 */
function pushCalendarToBrief_(dueOnly) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const cal = ss.getSheetByName(SHEET_CALENDAR);
  const brief = ss.getSheetByName(SHEET_BRIEF);
  const logSheet = ss.getSheetByName(SHEET_LOG);

  if (!cal) {
    ui.alert('⚠️ Chưa có sheet "Content Calendar". Chạy "Setup Content Calendar" trước.');
    return;
  }
  if (!brief) {
    ui.alert('⚠️ Chưa có sheet "Content Brief". Chạy "Setup Sheets" trước.');
    return;
  }

  const lastRow = cal.getLastRow();
  if (lastRow < 2) {
    ui.alert('Lịch đang trống.');
    return;
  }

  const values = cal.getRange(2, 1, lastRow - 1, CAL_COL_PUSHED).getValues();
  const todayStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');

  const toPush = [];        // hàng cho Brief
  const pushedRowIdx = [];  // chỉ số dòng calendar (1-based) cần đánh dấu

  values.forEach((row, i) => {
    const calRowIdx = i + 2;
    const pushed = String(row[CAL_COL_PUSHED - 1] || '').trim();
    const product = String(row[CAL_COL_PRODUCT - 1] || '').trim();
    if (pushed === CAL_PUSHED_MARK || !product) return; // đã đẩy hoặc dòng rỗng

    if (dueOnly) {
      const dateStr = normalizeDate_(row[CAL_COL_DATE - 1]);
      if (!dateStr || dateStr > todayStr) return; // chưa tới hạn
    }

    const channel  = String(row[CAL_COL_CHANNEL - 1] || '').trim();
    const postType = String(row[CAL_COL_TYPE - 1] || '').trim();
    const audience = String(row[CAL_COL_AUDIENCE - 1] || '').trim();
    const highlight= String(row[CAL_COL_HIGHLIGHT - 1] || '').trim();
    let note       = String(row[CAL_COL_NOTE - 1] || '').trim();
    if (channel) note = (note ? note + ' | ' : '') + 'Kênh: ' + channel;

    // Brief: [Sản phẩm, Loại bài, Nhóm đối tượng, Điểm nhấn, Ghi chú, Trạng thái]
    toPush.push([product, postType, audience, highlight, note, 'Chờ xử lý']);
    pushedRowIdx.push(calRowIdx);
  });

  if (toPush.length === 0) {
    ui.alert(dueOnly
      ? 'Không có bài nào đến hạn hôm nay (hoặc đã đẩy hết).'
      : 'Không có bài mới nào để đẩy (tất cả đã đẩy).');
    return;
  }

  const startRow = brief.getLastRow() + 1;
  brief.getRange(startRow, 1, toPush.length, 6).setValues(toPush);

  // Đánh dấu đã đẩy trên calendar
  pushedRowIdx.forEach((r) => cal.getRange(r, CAL_COL_PUSHED).setValue(CAL_PUSHED_MARK));

  if (logSheet) appendLog(logSheet, 'CALENDAR_PUSH',
    (dueOnly ? '[đến hạn] ' : '') + toPush.length + ' bài → Brief', '✅ Thành công');

  ui.alert('✅ Đã đẩy ' + toPush.length + ' bài sang "Content Brief".\n\n' +
    'Sang sheet "Content Brief" và bấm "✨ Generate Content" để tạo nội dung.');
}

/**
 * Chuẩn hoá ngày về chuỗi yyyy-MM-dd để so sánh. Hỗ trợ cả Date và text.
 */
function normalizeDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  }
  const s = String(value || '').trim();
  const m = s.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) {
    const mm = ('0' + m[2]).slice(-2);
    const dd = ('0' + m[3]).slice(-2);
    return m[1] + '-' + mm + '-' + dd;
  }
  return '';
}

// ==================== BANANA PRO IMAGE PROMPTS ====================

/**
 * Đọc sheet Content Output, với mỗi bài CHƯA có prompt Banana Pro thì sinh prompt
 * tiếng Anh từ "Idea ảnh" + tên sản phẩm, ghi vào cột "Banana Pro Prompt".
 */
function generateBananaPrompts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const out = ss.getSheetByName(SHEET_OUTPUT);
  const logSheet = ss.getSheetByName(SHEET_LOG);

  if (!out) {
    ui.alert('⚠️ Chưa có sheet "Content Output". Hãy Generate Content trước.');
    return;
  }

  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    ui.alert('⚠️ Chưa cấu hình GEMINI_API_KEY trong Script Properties.');
    return;
  }

  ensureBananaColumn_(out);

  const lastRow = out.getLastRow();
  if (lastRow < 2) {
    ui.alert('Chưa có bài viết nào trong "Content Output".');
    return;
  }

  // Cột: 2=Sản phẩm, 6=Idea ảnh, 7=Banana Pro Prompt
  const data = out.getRange(2, 1, lastRow - 1, OUTPUT_COL_BANANA).getValues();
  let done = 0, fail = 0, skipped = 0;

  for (let i = 0; i < data.length; i++) {
    const rowIdx = i + 2;
    const product = String(data[i][1] || '').trim();
    const ideas   = String(data[i][5] || '').trim();
    const existing= String(data[i][OUTPUT_COL_BANANA - 1] || '').trim();

    if (existing) { skipped++; continue; }      // đã có prompt
    if (!product && !ideas) { skipped++; continue; }

    try {
      const userPrompt = 'Product: ' + product + '\nVietnamese image ideas:\n' + (ideas || '(none, infer from product)');
      const prompt = callGeminiText_(apiKey, BANANA_SYSTEM_PROMPT, userPrompt);
      out.getRange(rowIdx, OUTPUT_COL_BANANA).setValue(prompt)
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
      done++;
      if (logSheet) appendLog(logSheet, 'BANANA_PROMPT', product, '✅ Thành công');
    } catch (err) {
      out.getRange(rowIdx, OUTPUT_COL_BANANA).setValue('❌ Lỗi: ' + err.message);
      fail++;
      if (logSheet) appendLog(logSheet, 'BANANA_ERROR', product + ': ' + err.message, '❌ Thất bại');
    }
    Utilities.sleep(1500); // tránh rate limit
  }

  ui.alert('🎨 Banana Pro prompts hoàn tất!\n\n' +
    '• Tạo mới: ' + done + '\n• Bỏ qua (đã có): ' + skipped + '\n• Lỗi: ' + fail + '\n\n' +
    'Copy prompt ở cột "Banana Pro Prompt" → dán vào Nano Banana Pro để gen ảnh.');
}

/**
 * Đảm bảo sheet Content Output có cột "Banana Pro Prompt" (cột 7).
 */
function ensureBananaColumn_(out) {
  const header = out.getRange(1, OUTPUT_COL_BANANA).getValue();
  if (String(header || '').trim() !== 'Banana Pro Prompt') {
    out.getRange(1, OUTPUT_COL_BANANA)
      .setValue('Banana Pro Prompt')
      .setFontWeight('bold')
      .setBackground('#1a4a1a')
      .setFontColor('#ffffff');
    out.setColumnWidth(OUTPUT_COL_BANANA, 480);
  }
}

/**
 * Gọi Gemini trả về 1 đoạn text. Dùng chung endpoint/model với MOCO_CONTENT_GEN.gs.
 * Có retry khi model quá tải (429/500/503).
 */
function callGeminiText_(apiKey, systemPrompt, userPrompt) {
  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
      topP: 0.9,
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

  let res = UrlFetchApp.fetch(GEMINI_API_URL + '?key=' + apiKey, options);
  let code = res.getResponseCode();
  let body = res.getContentText();

  let attempt = 1;
  const maxAttempts = 3;
  while (code !== 200 && attempt < maxAttempts) {
    const isTransient = code === 429 || code === 500 || code === 503 ||
      /high demand|overloaded|try again later|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(body);
    if (!isTransient) break;
    Utilities.sleep(2500 * attempt);
    attempt++;
    res = UrlFetchApp.fetch(GEMINI_API_URL + '?key=' + apiKey, options);
    code = res.getResponseCode();
    body = res.getContentText();
  }

  if (code !== 200) {
    const err = JSON.parse(body);
    throw new Error(err.error && err.error.message ? err.error.message : ('HTTP ' + code));
  }

  const json = JSON.parse(body);
  const text = json.candidates && json.candidates[0] &&
    json.candidates[0].content && json.candidates[0].content.parts &&
    json.candidates[0].content.parts[0] ? json.candidates[0].content.parts[0].text : '';
  if (!text) {
    const reason = json.candidates && json.candidates[0] ? json.candidates[0].finishReason : 'không rõ';
    throw new Error('Model không trả về nội dung (finishReason: ' + reason + ')');
  }
  return text.trim().replace(/^["']|["']$/g, '');
}
