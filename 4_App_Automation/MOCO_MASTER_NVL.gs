/**
 * MOCO Kitchen — Master NVL (Nguyên Vật Liệu)
 *
 * Workflow:
 * 1. Chạy MOCO_GENERATE_NVL_REVIEW() → sinh sheet "📋 Review Tên NVL"
 * 2. Founder review + chỉnh tên ở cột C
 * 3. Chạy MOCO_CREATE_MASTER_NVL() → tạo sheet "Master NVL" chính thức
 * 4. Chạy MOCO_REFRESH_MASTER_NVL() bất kỳ lúc nào để cập nhật giá
 *
 * Thêm vào menu MOCO đã có từ V2.
 */

const NVL_NHAP_HANG = 'NHẬP HÀNG';
const NVL_REVIEW_SHEET = '📋 Review Tên NVL';
const NVL_NAME_SYNC_REVIEW_SHEET = 'REVIEW TÊN HÀNG';
const NVL_MASTER_SHEET = 'Master NVL';
const NVL_MASTER_WIDTH = 12;
const NVL_COST_INGREDIENT_CATEGORIES = ['Nguyên liệu khô', 'Sữa/bơ/kem', 'Sữa/bơ/kem/dầu/siro', 'Hạt', 'Trái cây', 'Trứng'];
const NVL_MASTER_HEADERS = [
  'STT',
  'Tên NVL',
  'Loại hàng',
  'Số lần nhập',
  'Đơn vị',
  'Đơn giá mới nhất / 1 ĐV',
  'Đơn giá TB / 1 ĐV',
  'Lần nhập cuối',
  'Trạng thái',
  'Ghi chú (tên cũ)',
  'Tính cost bánh?',
  'Vai trò trong cost',
];
const NVL_STATUS_VALUES = ['Đang dùng', 'Ngưng dùng', 'R&D'];
const NVL_COST_FLAG_VALUES = ['Có', 'Không'];
const NVL_COST_ROLE_VALUES = [
  'Nguyên liệu công thức',
  'Bao bì / vật tư bán hàng',
  'Dụng cụ / thiết bị',
  'Không tính vào cost bánh',
];
const NVL_NAME_REVIEW_ACTION_VALUES = [
  'Giữ nguyên',
  'Đổi cả NHẬP HÀNG + Master NVL theo cột I',
  'Đổi tên NHẬP HÀNG theo cột I',
  'Giữ làm tên mới',
  'Bỏ qua',
  'Cần hỏi lại',
];
const NVL_NAME_REVIEW_APPLY_ACTION_VALUES = [
  'Đổi cả NHẬP HÀNG + Master NVL theo cột I',
  'Đổi tên NHẬP HÀNG theo cột I',
];

// ─── Tên chuẩn hóa: gộp typo, viết tắt, khác quy cách ──────────────────────
const NVL_NAME_MAP = {
  'sưa chua không đường': 'Sữa chua không đường',
  'sữa chua không đường': 'Sữa chua không đường',
  'trứng gà (quả)': 'Trứng gà',
  'trứng gà': 'Trứng gà',
  'trứng': 'Trứng gà',
  'trứng vịt muối': 'Trứng muối',
  'trứng muối': 'Trứng muối',
  'giấm': 'dấm',
  'dấm': 'dấm',
  'giấm gạo trung thành': 'dấm',
  'dấm gạo trung thành': 'dấm',
  'sữa hy lạp': 'Sữa chua Hy Lạp',
  'sữa chua hy lạp': 'Sữa chua Hy Lạp',
  'carot': 'Cà rốt',
  'cà rốt': 'Cà rốt',
  'chanh vàng': 'Chanh vàng',
  'whipping cream anchor 1kg': 'Whipping Cream Anchor',
  'whipping anchor': 'Whipping Cream Anchor',
  'cream cheese anchor 1kg': 'Cream Cheese Anchor',
  'creamcheese anchor': 'Cream Cheese Anchor',
  'cream cheese avonmore 1kg': 'Cream Cheese Avonmore',
  'creamcheese dairymont 2kg': 'Cream Cheese Dairymont',
  'mascapone siterilgard ý': 'Mascarpone Sterilgarda',
  'mascapone tatua': 'Mascarpone Tatua',
  'mascapone': 'Mascarpone',
  'bơ lạt westgold 1kg': 'Bơ lạt Westgold',
  'bơ th 1kg': 'Bơ TH',
  'bột mỳ nguyên cám bob red mill': 'Bột mỳ nguyên cám Bob Red Mill',
  'bột mỳ nguyên cám': 'Bột mỳ nguyên cám',
  'bột yến mạch xuân sen nuts': 'Bột yến mạch',
  'bột yến mạch': 'Bột yến mạch',
  'siro lá phong không đường': 'Siro lá phong không đường',
  'sirup lá phong': 'Siro lá phong không đường',
  'đường ăn kiêng erhthritol': 'Đường Erythritol',
  'chà bông rong biển': 'Ruốc rong biển',
  'ruốc rong biển': 'Ruốc rong biển',
  'socola đen 100g 70% nguyên chất': 'Socola đen 70%',
  'vani syrup 500ml': 'Vani Syrup',
  'hũ thuỷ tinh 500ml': 'Hũ thuỷ tinh 500ml',
  'hũ thuỷ tinh 750ml': 'Hũ thuỷ tinh 750ml',
  'sữa tươi không đường th': 'Sữa tươi không đường TH',
  'sữa tươi không đường dudlady': 'Sữa tươi không đường Dudlady',
  'sữa tươi không đường': 'Sữa tươi không đường',
  'sữa tươi': 'Sữa tươi không đường',
  'cơm dừa sấy': 'Cơm dừa sấy',
  'cơm dừa mịn sấy': 'Cơm dừa mịn sấy',
  'hộp đựng đường, bột nở 750ml': 'Hộp đựng 750ml',
  'hộp nhựa vanfg, hồng': 'Hộp nhựa màu',
  'mua nvl làm vieo': '', // bỏ qua — không phải NVL
  'bắp cải, chanh leo, xoài, cần tây, mayone': '', // bỏ qua — combo không rõ
  'in tem nhãn': 'In tem nhãn',
  'vải chụp ảnh decor': 'Vải chụp ảnh decor',
};

// ─── Legacy menu helper ──────────────────────────────────────────────────────
// Menu chính nằm trong MOCO_NHAP_HANG_V2.gs để tránh nhiều onOpen() ghi đè nhau.
function MOCO_OPEN_NVL_MENU_LEGACY_() {
  SpreadsheetApp.getUi()
    .createMenu('MOCO')
    .addItem('Clean NHẬP HÀNG', 'MOCO_SETUP')
    .addItem('Refresh lịch sử giá', 'MOCO_REFRESH_HISTORY')
    .addSeparator()
    .addItem('1. Thêm hàng mới vào danh mục', 'MOCO_ADD_NEW_NHAP_HANG_NAMES_TO_MASTER')
    .addItem('2. Cập nhật giá danh mục', 'MOCO_REFRESH_MASTER_NVL')
    .addItem('3. Cập nhật dropdown tên hàng', 'MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN')
    .addItem('4. Cập nhật dropdown danh mục (giữ UI)', 'MOCO_APPLY_MASTER_NVL_VALIDATIONS_ONLY')
    .addItem('Review tên hàng cần chuẩn hóa', 'MOCO_CREATE_NHAP_MASTER_NAME_REVIEW')
    .addItem('Apply review đổi tên hàng', 'MOCO_APPLY_NAME_REVIEW_TO_NHAP_AND_MASTER')
    .addItem('Review tên hàng nâng cao', 'MOCO_GENERATE_NVL_REVIEW')
    .addToUi();
}

// ═══════════════════════════════════════════════════════════════════════════════
// BƯỚC 1: Sinh sheet Review cho Founder
// ═══════════════════════════════════════════════════════════════════════════════
function MOCO_GENERATE_NVL_REVIEW() {
  const ss = getMocoSpreadsheet_();
  const nhSheet = ss.getSheetByName(NVL_NHAP_HANG);
  if (!nhSheet) throw new Error('Không tìm thấy sheet: ' + NVL_NHAP_HANG);

  const lastRow = nhSheet.getLastRow();
  if (lastRow < 2) throw new Error('Sheet NHẬP HÀNG trống');

  // Lấy tên unique từ cột B
  const names = nhSheet.getRange(2, 2, lastRow - 1, 1).getValues()
    .map(r => String(r[0] || '').trim())
    .filter(Boolean);

  const uniqueNames = [...new Set(names)].sort((a, b) =>
    a.localeCompare(b, 'vi')
  );

  // Đề xuất tên chuẩn
  const rows = [];
  for (const name of uniqueNames) {
    const proposed = proposeName_(name);
    if (proposed === '') continue; // bỏ qua item rác
    rows.push([name, proposed, '']);
  }

  // Tạo/reset sheet review
  let rvSheet = ss.getSheetByName(NVL_REVIEW_SHEET);
  if (rvSheet) {
    rvSheet.clear();
  } else {
    rvSheet = ss.insertSheet(NVL_REVIEW_SHEET);
  }
  rvSheet.showSheet();

  // Header
  const headers = ['Tên cũ (từ NHẬP HÀNG)', 'Tên đề xuất (AI)', 'Founder chỉnh (để trống = OK)'];
  rvSheet.getRange(1, 1, 1, 3).setValues([headers])
    .setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#174EA6')
    .setHorizontalAlignment('center').setWrap(true);

  // Data
  if (rows.length) {
    rvSheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  // Format
  rvSheet.setColumnWidth(1, 280);
  rvSheet.setColumnWidth(2, 280);
  rvSheet.setColumnWidth(3, 280);
  rvSheet.setFrozenRows(1);

  // Highlight cột C (Founder chỉnh)
  rvSheet.getRange(2, 3, Math.max(rows.length, 50), 1)
    .setBackground('#FFFDE7');

  // Highlight rows where AI changed the name
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] !== rows[i][1]) {
      rvSheet.getRange(i + 2, 1, 1, 2).setBackground('#FFF3E0');
    }
  }

  // Note
  rvSheet.getRange(rows.length + 3, 1)
    .setValue('Sau khi review xong, chọn MOCO > Tạo danh mục nguyên liệu')
    .setFontStyle('italic').setFontColor('#0B8043');

  try {
    SpreadsheetApp.getUi().alert(
      'Đã tạo sheet "' + NVL_REVIEW_SHEET + '" với ' + rows.length + ' item.\n\n' +
      '→ Các dòng cam: AI đề xuất đổi tên.\n' +
      '→ Cột vàng: Founder ghi tên muốn dùng (để trống = đồng ý AI).\n' +
      '→ Xong thì chọn MOCO > Tạo danh mục nguyên liệu.'
    );
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
}

function MOCO_CREATE_NHAP_MASTER_NAME_REVIEW() {
  const ss = getMocoSpreadsheet_();
  const nhSheet = ss.getSheetByName(NVL_NHAP_HANG);
  const masterSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!nhSheet) throw new Error('Không tìm thấy sheet: ' + NVL_NHAP_HANG);
  if (!masterSheet) throw new Error('Không tìm thấy sheet: ' + NVL_MASTER_SHEET);

  const nhIdx = getNvlNhapHangIndexes_(nhSheet);
  const nhLastRow = nhSheet.getLastRow();
  const nhWidth = Math.max(nhSheet.getLastColumn(), 10);
  const nhRows = nhLastRow >= 2
    ? nhSheet.getRange(2, 1, nhLastRow - 1, nhWidth).getValues()
    : [];

  const masterRows = masterSheet.getLastRow() >= 2
    ? masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, Math.max(masterSheet.getLastColumn(), NVL_MASTER_WIDTH)).getValues()
    : [];
  const masterByName = {};
  const masterByNorm = {};
  const masterItems = [];
  masterRows.forEach(row => {
    const name = String(row[1] || '').trim();
    if (!name) return;
    const item = {
      name,
      norm: normNvlName_(name),
      category: String(row[2] || '').trim(),
      unit: String(row[4] || '').trim(),
      status: String(row[8] || '').trim(),
      costFlag: String(row[10] || '').trim(),
    };
    masterByName[name] = item;
    masterByNorm[item.norm] = item;
    masterItems.push(item);
  });

  const grouped = {};
  nhRows.forEach((row, idx) => {
    const name = String(row[nhIdx.name] || '').trim();
    if (!name) return;
    if (!grouped[name]) {
      grouped[name] = {
        name,
        rows: [],
        categories: {},
        suppliers: {},
        units: {},
      };
    }
    const item = grouped[name];
    item.rows.push(idx + 2);
    addReviewCount_(item.categories, row[nhIdx.category]);
    addReviewCount_(item.suppliers, nhIdx.supplier >= 0 ? row[nhIdx.supplier] : '');
    addReviewCount_(item.units, row[nhIdx.unit]);
  });

  const rows = Object.values(grouped)
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .map((item, idx) => {
      const exact = masterByName[item.name] || null;
      const norm = masterByNorm[normNvlName_(item.name)] || null;
      const suggestion = exact || norm || findClosestNvlMasterItem_(item.name, masterItems);
      const suggestionName = suggestion ? suggestion.name : '';
      const confidence = exact ? 'Khớp chính xác'
        : norm ? 'Khớp bỏ dấu/hoa thường'
          : suggestion ? 'Gợi ý gần đúng' : 'Chưa có gợi ý';
      const status = exact ? 'OK'
        : suggestion ? 'CẦN CHUẨN HÓA' : 'TÊN MỚI / CẦN THÊM';
      const action = exact ? 'Giữ nguyên'
        : suggestion ? 'Đổi tên NHẬP HÀNG theo cột I' : 'Giữ làm tên mới';
      return [
        idx + 1,
        item.name,
        item.rows.length,
        topReviewValues_(item.categories),
        topReviewValues_(item.suppliers),
        topReviewValues_(item.units),
        status,
        suggestionName,
        suggestionName || item.name,
        action,
        confidence,
        item.rows.slice(0, 12).join(', '),
      ];
    });

  let sheet = ss.getSheetByName(NVL_NAME_SYNC_REVIEW_SHEET);
  if (sheet) {
    sheet.clear().clearFormats().clearConditionalFormatRules();
  } else {
    sheet = ss.insertSheet(NVL_NAME_SYNC_REVIEW_SHEET);
  }
  sheet.showSheet();

  const headers = [[
    'STT',
    'Tên trong NHẬP HÀNG',
    'Số dòng',
    'Loại hàng đang dùng',
    'NCC/Brand gặp',
    'Đơn vị gặp',
    'Trạng thái',
    'Gợi ý từ Master NVL',
    'Tên chuẩn Founder chọn',
    'Hành động',
    'Ghi chú hệ thống',
    'Dòng trong NHẬP HÀNG',
  ]];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0B8043')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
  }

  const dataRows = Math.max(rows.length, 100);
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 190);
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 150);
  sheet.setColumnWidth(8, 250);
  sheet.setColumnWidth(9, 270);
  sheet.setColumnWidth(10, 210);
  sheet.setColumnWidth(11, 180);
  sheet.setColumnWidth(12, 160);
  sheet.getRange(2, 1, dataRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 3, dataRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 9, dataRows, 1).setBackground('#FFFDE7');

  if (masterSheet.getLastRow() >= 2) {
    const masterNameRange = masterSheet.getRange(2, 2, masterSheet.getLastRow() - 1, 1);
    sheet.getRange(2, 9, dataRows, 1).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInRange(masterNameRange, true)
        .setAllowInvalid(true)
        .setHelpText('Chọn tên đã có trong Master NVL hoặc gõ tên chuẩn mới nếu cần thêm vào danh mục.')
        .build()
    );
  }
  sheet.getRange(2, 10, dataRows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(NVL_NAME_REVIEW_ACTION_VALUES, true)
      .setAllowInvalid(true)
      .build()
  );

  const rules = [];
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('OK')
    .setBackground('#E6F4EA')
    .setRanges([sheet.getRange(2, 7, dataRows, 1)])
    .build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('CẦN CHUẨN HÓA')
    .setBackground('#FEF7E0')
    .setRanges([sheet.getRange(2, 7, dataRows, 1)])
    .build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('TÊN MỚI / CẦN THÊM')
    .setBackground('#FCE8E6')
    .setFontColor('#B3261E')
    .setRanges([sheet.getRange(2, 7, dataRows, 1)])
    .build());
  sheet.setConditionalFormatRules(rules);

  try {
    if (sheet.getFilter()) sheet.getFilter().remove();
    sheet.getRange(1, 1, Math.max(rows.length + 1, 2), headers[0].length).createFilter();
    sheet.getBandings().forEach(b => b.remove());
    const banding = sheet.getRange(1, 1, Math.max(rows.length + 1, 2), headers[0].length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREEN);
    banding.setHeaderRowColor('#0B8043');
  } catch (err) {}

  const stats = rows.reduce((acc, row) => {
    acc.total += 1;
    if (row[6] === 'OK') acc.ok += 1;
    else if (row[6] === 'CẦN CHUẨN HÓA') acc.needsReview += 1;
    else acc.newNames += 1;
    return acc;
  }, { total: 0, ok: 0, needsReview: 0, newNames: 0 });

  return Object.assign({ sheet: NVL_NAME_SYNC_REVIEW_SHEET }, stats);
}

function MOCO_REFRESH_NAME_REVIEW_ACTION_DROPDOWN() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(NVL_NAME_SYNC_REVIEW_SHEET);
  if (!sheet) {
    throw new Error('Chưa có sheet ' + NVL_NAME_SYNC_REVIEW_SHEET + '.');
  }

  const maxRows = Math.max(sheet.getMaxRows() - 1, 100);
  sheet.getRange(2, 10, maxRows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(NVL_NAME_REVIEW_ACTION_VALUES, true)
      .setAllowInvalid(true)
      .build()
  );

  return {
    sheet: NVL_NAME_SYNC_REVIEW_SHEET,
    range: 'J2:J' + sheet.getMaxRows(),
    actions: NVL_NAME_REVIEW_ACTION_VALUES,
  };
}

function MOCO_AUDIT_NAME_REVIEW_APPLY() {
  const ss = getMocoSpreadsheet_();
  const review = ss.getSheetByName(NVL_NAME_SYNC_REVIEW_SHEET);
  if (!review) throw new Error('Chưa có sheet ' + NVL_NAME_SYNC_REVIEW_SHEET + '.');

  const audit = auditNameReviewApply_(review);
  writeNameReviewAuditSheet_(ss, audit);
  return {
    okToApply: audit.suspicious.length === 0,
    applyRows: audit.applyRows.length,
    suspiciousRows: audit.suspicious.length,
    auditSheet: 'REVIEW TÊN HÀNG - AUDIT',
    suspicious: audit.suspicious.slice(0, 25),
  };
}

function MOCO_FIX_UNSAFE_NAME_REVIEW_SUGGESTIONS() {
  const ss = getMocoSpreadsheet_();
  const review = ss.getSheetByName(NVL_NAME_SYNC_REVIEW_SHEET);
  if (!review) throw new Error('Chưa có sheet ' + NVL_NAME_SYNC_REVIEW_SHEET + '.');

  const lastRow = review.getLastRow();
  if (lastRow < 2) return { fixed: 0 };

  const values = review.getRange(2, 1, lastRow - 1, 12).getValues();
  const fixed = [];
  values.forEach((row, idx) => {
    const oldName = String(row[1] || '').trim();
    const newName = String(row[8] || '').trim();
    const action = String(row[9] || '').trim();
    if (NVL_NAME_REVIEW_APPLY_ACTION_VALUES.indexOf(action) < 0 || !oldName || !newName) return;

    const oldNorm = normNvlName_(oldName);
    const newNorm = normNvlName_(newName);
    if (isPackagingLikeNvl_(oldNorm) && isIngredientLikeNvl_(newNorm)) {
      row[8] = oldName;
      row[9] = 'Giữ làm tên mới';
      row[10] = 'Đã tự chặn: bao bì/tem nhãn không map sang nguyên liệu';
      fixed.push({
        row: idx + 2,
        oldName,
        unsafeSuggestion: newName,
      });
    }
  });

  if (fixed.length) {
    review.getRange(2, 1, values.length, 12).setValues(values);
  }
  const audit = auditNameReviewApply_(review);
  writeNameReviewAuditSheet_(ss, audit);
  return {
    fixed: fixed.length,
    fixedRows: fixed,
    suspiciousRowsAfterFix: audit.suspicious.length,
  };
}

function MOCO_APPLY_NAME_REVIEW_TO_NHAP_AND_MASTER() {
  const ss = getMocoSpreadsheet_();
  const review = ss.getSheetByName(NVL_NAME_SYNC_REVIEW_SHEET);
  const nhSheet = ss.getSheetByName(NVL_NHAP_HANG);
  const masterSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!review) throw new Error('Chưa có sheet ' + NVL_NAME_SYNC_REVIEW_SHEET + '. Chạy Review tên hàng cần chuẩn hóa trước.');
  if (!nhSheet) throw new Error('Không tìm thấy sheet: ' + NVL_NHAP_HANG);
  if (!masterSheet) throw new Error('Không tìm thấy sheet: ' + NVL_MASTER_SHEET);

  const reviewLastRow = review.getLastRow();
  if (reviewLastRow < 2) return { applied: 0, message: 'Sheet review trống.' };

  const audit = auditNameReviewApply_(review);
  writeNameReviewAuditSheet_(ss, audit);
  if (audit.suspicious.length) {
    throw new Error(
      'Dừng apply: còn ' + audit.suspicious.length
      + ' dòng đổi tên rủi ro trong REVIEW TÊN HÀNG. Xem sheet REVIEW TÊN HÀNG - AUDIT trước khi apply.'
    );
  }

  const reviewRows = review.getRange(2, 1, reviewLastRow - 1, 12).getValues();
  const nameMap = {};
  const decisions = [];
  reviewRows.forEach(row => {
    const oldName = String(row[1] || '').trim();
    const newName = String(row[8] || '').trim();
    const action = String(row[9] || '').trim();
    const shouldApply = NVL_NAME_REVIEW_APPLY_ACTION_VALUES.indexOf(action) >= 0;
    if (!shouldApply || !oldName || !newName || oldName === newName) return;
    nameMap[oldName] = newName;
    decisions.push({ oldName, newName, action });
  });

  if (!decisions.length) {
    return {
      applied: 0,
      message: 'Không có dòng nào chọn hành động đổi tên.',
    };
  }

  const backupNh = copyNvlSheetBackup_(ss, nhSheet, 'BACKUP_APPLY_NAME_NHAP_');
  const backupMaster = copyNvlSheetBackup_(ss, masterSheet, 'BACKUP_APPLY_NAME_MASTER_');

  const nhIdx = getNvlNhapHangIndexes_(nhSheet);
  const nhLastRow = nhSheet.getLastRow();
  const nhWidth = Math.max(nhSheet.getLastColumn(), 10);
  const nhRange = nhSheet.getRange(2, 1, nhLastRow - 1, nhWidth);
  const nhRows = nhRange.getValues();
  let changedCells = 0;
  nhRows.forEach(row => {
    const current = String(row[nhIdx.name] || '').trim();
    if (nameMap[current]) {
      row[nhIdx.name] = nameMap[current];
      changedCells += 1;
    }
  });
  nhRange.setValues(nhRows);

  const preserve = buildMasterPreserveMap_(masterSheet, nameMap);
  rebuildMasterFromNhapHangPreserving_(ss, nhSheet, preserve);

  if (typeof MOCO_DISABLE_NHAP_HANG_NAME_DROPDOWN === 'function') {
    MOCO_DISABLE_NHAP_HANG_NAME_DROPDOWN();
  }
  if (typeof MOCO_BUILD_ONLINE_BAKERY_WORKFLOW === 'function') {
    MOCO_BUILD_ONLINE_BAKERY_WORKFLOW();
  }

  return {
    applied: decisions.length,
    changedNhapHangCells: changedCells,
    backupNhapHang: backupNh,
    backupMaster,
    note: 'Đã đổi tên trong NHẬP HÀNG, rebuild/gộp Master NVL, giữ dropdown tên hàng ở chế độ tắt để Founder tiếp tục chuẩn hóa.',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BƯỚC 2: Tạo Master NVL từ Review
// ═══════════════════════════════════════════════════════════════════════════════
function MOCO_CREATE_MASTER_NVL() {
  const ss = getMocoSpreadsheet_();

  // Đọc mapping từ Review sheet
  const nameMap = readReviewMapping_(ss);

  // Đọc data NHẬP HÀNG
  const nhSheet = ss.getSheetByName(NVL_NHAP_HANG);
  if (!nhSheet) throw new Error('Không tìm thấy sheet: ' + NVL_NHAP_HANG);

  const nvlMap = buildNvlGroupedFromNhapHang_(nhSheet, nameMap);

  // Build Master NVL rows
  const items = Object.values(nvlMap).sort((a, b) =>
    a.name.localeCompare(b.name, 'vi')
  );

  const masterRows = items.map((item, idx) => {
    const sorted = item.entries.sort((a, b) => dateVal_(b.date) - dateVal_(a.date));
    const latestPrice = sorted.length ? sorted[0].unitPrice : '';
    const avgPrice = sorted.length
      ? sorted.reduce((s, e) => s + e.unitPrice, 0) / sorted.length
      : '';
    const lastDate = sorted.length ? sorted[0].date : '';
    const count = item.count || sorted.length;
    const aliases = [...item.aliases].join(', ');

    return [
      idx + 1,
      item.name,
      item.category,
      count,
      item.unit,
      latestPrice,
      avgPrice ? Math.round(avgPrice) : '',
      lastDate,
      'Đang dùng',
      aliases,
      isNvlIngredientCostCategory_(item.category) ? 'Có' : 'Không',
      nvlCostRoleForCategory_(item.category),
    ];
  });

  // Tạo/reset Master NVL sheet
  let mSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (mSheet) {
    mSheet.clear();
  } else {
    mSheet = ss.insertSheet(NVL_MASTER_SHEET);
  }

  // Header
  mSheet.getRange(1, 1, 1, NVL_MASTER_HEADERS.length).setValues([NVL_MASTER_HEADERS])
    .setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#0B8043')
    .setHorizontalAlignment('center').setWrap(false);
  mSheet.setRowHeight(1, 36);
  mSheet.setFrozenRows(1);

  // Data
  if (masterRows.length) {
    mSheet.getRange(2, 1, masterRows.length, NVL_MASTER_HEADERS.length).setValues(masterRows);
  }

  MOCO_APPLY_MASTER_NVL_UI();

  // Named Range cho VLOOKUP cross-sheet
  const existingNames = ss.getNamedRanges().filter(n => n.getName() === 'Master_NVL');
  existingNames.forEach(n => n.remove());
  const namedRangeRows = Math.max(masterRows.length, 1);
  ss.setNamedRange('Master_NVL',
    mSheet.getRange(2, 1, namedRangeRows, NVL_MASTER_HEADERS.length));

  // Ẩn sheet NVL cũ nếu có
  const oldNvl = ss.getSheetByName('NVL');
  if (oldNvl) {
    try { oldNvl.hideSheet(); } catch (e) {}
  }

  if (typeof MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN === 'function') {
    MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN();
  }

  try {
    SpreadsheetApp.getUi().alert(
      'Đã tạo Master NVL với ' + masterRows.length + ' nguyên liệu.\n\n' +
      '• Named Range "Master_NVL" đã sẵn sàng cho VLOOKUP (chỉ vùng data, không gồm header).\n' +
      '• Sheet "NVL" cũ đã được ẩn (không xóa).\n' +
      '• Dropdown TÊN HÀNG HOÁ ở NHẬP HÀNG đã được cập nhật.\n' +
      '• Chạy MOCO > Cập nhật giá danh mục bất kỳ lúc nào để cập nhật giá.'
    );
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BƯỚC 3: Refresh giá trong Master NVL (không đổi tên, chỉ cập nhật số)
// ═══════════════════════════════════════════════════════════════════════════════
function MOCO_REFRESH_MASTER_NVL() {
  const ss = getMocoSpreadsheet_();
  const mSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!mSheet) throw new Error('Chưa có danh mục nguyên liệu. Chạy "Tạo danh mục nguyên liệu" trước.');
  MOCO_APPLY_MASTER_NVL_UI();

  const nhSheet = ss.getSheetByName(NVL_NHAP_HANG);
  if (!nhSheet) return;

  const nameMap = {};
  try {
    const map = readReviewMapping_(ss);
    Object.assign(nameMap, map);
  } catch (e) {
    // Nếu không có review sheet, dùng tên trực tiếp từ Master
  }

  const grouped = buildNvlGroupedFromNhapHang_(nhSheet, nameMap);

  // Update Master NVL rows
  const mLastRow = mSheet.getLastRow();
  if (mLastRow < 2) return;

  const masterData = mSheet.getRange(2, 1, mLastRow - 1, NVL_MASTER_WIDTH).getValues();
  const updates = [];

  for (let i = 0; i < masterData.length; i++) {
    const name = String(masterData[i][1] || '').trim();
    const item = grouped[name];

    if (!item) {
      updates.push(masterData[i]);
      continue;
    }

    const row = [...masterData[i]];
    if (item.category) row[2] = item.category;
    row[3] = item.count;
    if (item.unit) row[4] = item.unit;
    const sorted = item.entries.sort((a, b) => dateVal_(b.date) - dateVal_(a.date));
    if (sorted.length) {
      row[5] = sorted[0].unitPrice;
      row[6] = Math.round(sorted.reduce((s, e) => s + e.unitPrice, 0) / sorted.length);
      row[7] = cleanNvlMasterDate_(sorted[0].date);
    }
    if (!row[10]) row[10] = isNvlIngredientCostCategory_(row[2]) ? 'Có' : 'Không';
    if (!row[11]) row[11] = nvlCostRoleForCategory_(row[2]);
    updates.push(row);
  }

  mSheet.getRange(2, 1, updates.length, NVL_MASTER_WIDTH).setValues(updates);
  MOCO_APPLY_MASTER_NVL_UI();
  if (typeof MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN === 'function') {
    MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN();
  }
}

function MOCO_ADD_NEW_NHAP_HANG_NAMES_TO_MASTER() {
  const ss = getMocoSpreadsheet_();
  const nhSheet = ss.getSheetByName(NVL_NHAP_HANG);
  if (!nhSheet) throw new Error('Không tìm thấy sheet: ' + NVL_NHAP_HANG);

  let mSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!mSheet || mSheet.getLastRow() < 1) {
    MOCO_CREATE_MASTER_NVL();
    mSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  }
  if (!mSheet) throw new Error('Không tạo được danh mục nguyên liệu.');
  MOCO_APPLY_MASTER_NVL_UI();

  if (nhSheet.getLastRow() < 2) return { added: 0, names: [] };

  const existingNames = new Set(
    mSheet.getLastRow() >= 2
      ? mSheet.getRange(2, 2, mSheet.getLastRow() - 1, 1).getValues()
        .map(row => String(row[0] || '').trim())
        .filter(Boolean)
      : []
  );
  const grouped = buildNvlGroupedFromNhapHang_(nhSheet, {});
  const items = Object.values(grouped)
    .filter(item => !existingNames.has(item.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  if (!items.length) {
    if (typeof MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN === 'function') {
      MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN();
    }
    return { added: 0, names: [] };
  }

  const startRow = mSheet.getLastRow() + 1;
  const startIndex = Math.max(mSheet.getLastRow() - 1, 0);
  const rows = items.map((item, idx) => {
    const sorted = item.entries.sort((a, b) => dateVal_(b.date) - dateVal_(a.date));
    const latestPrice = sorted.length ? sorted[0].unitPrice : '';
    const avgPrice = sorted.length
      ? Math.round(sorted.reduce((sum, entry) => sum + entry.unitPrice, 0) / sorted.length)
      : '';
    return [
      startIndex + idx + 1,
      item.name,
      item.category,
      item.count || sorted.length,
      item.unit,
      latestPrice,
      avgPrice,
      cleanNvlMasterDate_(sorted.length ? sorted[0].date : ''),
      'Đang dùng',
      [...item.aliases].join(', '),
      isNvlIngredientCostCategory_(item.category) ? 'Có' : 'Không',
      nvlCostRoleForCategory_(item.category),
    ];
  });

  mSheet.getRange(startRow, 1, rows.length, NVL_MASTER_WIDTH).setValues(rows);
  MOCO_APPLY_MASTER_NVL_UI();

  const existingRanges = ss.getNamedRanges().filter(n => n.getName() === 'Master_NVL');
  existingRanges.forEach(n => n.remove());
  ss.setNamedRange('Master_NVL', mSheet.getRange(2, 1, Math.max(mSheet.getLastRow() - 1, 1), NVL_MASTER_WIDTH));

  if (typeof MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN === 'function') {
    MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN();
  }
  return {
    added: rows.length,
    names: rows.map(row => row[1]),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function auditNameReviewApply_(reviewSheet) {
  const lastRow = reviewSheet.getLastRow();
  const rows = lastRow >= 2
    ? reviewSheet.getRange(2, 1, lastRow - 1, 12).getDisplayValues()
    : [];
  const applyRows = [];
  const suspicious = [];

  rows.forEach((row, idx) => {
    const sheetRow = idx + 2;
    const oldName = String(row[1] || '').trim();
    const newName = String(row[8] || '').trim();
    const action = String(row[9] || '').trim();
    const note = String(row[10] || '').trim();
    if (NVL_NAME_REVIEW_APPLY_ACTION_VALUES.indexOf(action) < 0) return;
    if (!oldName || !newName || oldName === newName) return;

    const oldNorm = normNvlName_(oldName);
    const newNorm = normNvlName_(newName);
    const overlap = tokenOverlapNvl_(oldNorm, newNorm);
    const reasons = [];

    if (!newNorm) reasons.push('Tên chuẩn trống/không đọc được');
    if (oldNorm !== newNorm && oldNorm.replace(/\s+/g, '') !== newNorm.replace(/\s+/g, '') && overlap < 0.34) {
      reasons.push('Ít từ khóa trùng');
    }
    if (isPackagingLikeNvl_(oldNorm) && isIngredientLikeNvl_(newNorm)) {
      reasons.push('Bao bì/tem nhãn đang bị map sang nguyên liệu');
    }
    if (isIngredientLikeNvl_(oldNorm) && isPackagingLikeNvl_(newNorm)) {
      reasons.push('Nguyên liệu đang bị map sang bao bì/tem nhãn');
    }
    if (note === 'Gợi ý gần đúng' && overlap < 0.5) {
      reasons.push('Gợi ý tự động cần kiểm tra lại');
    }

    const item = {
      row: sheetRow,
      oldName,
      newName,
      action,
      note,
      overlap: Math.round(overlap * 100) + '%',
      reasons: reasons.join('; '),
    };
    applyRows.push(item);
    if (reasons.length) suspicious.push(item);
  });

  return { applyRows, suspicious };
}

function writeNameReviewAuditSheet_(ss, audit) {
  const name = 'REVIEW TÊN HÀNG - AUDIT';
  let sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear().clearFormats().clearConditionalFormatRules();
  } else {
    sheet = ss.insertSheet(name);
  }
  sheet.showSheet();

  const headers = [[
    'Dòng REVIEW',
    'Tên trong NHẬP HÀNG',
    'Tên chuẩn Founder chọn',
    'Hành động',
    'Ghi chú hệ thống',
    'Độ trùng từ khóa',
    'Lý do cần kiểm tra',
  ]];
  const rows = audit.suspicious.map(item => [
    item.row,
    item.oldName,
    item.newName,
    item.action,
    item.note,
    item.overlap,
    item.reasons,
  ]);

  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#B3261E')
    .setHorizontalAlignment('center')
    .setWrap(true);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
  } else {
    sheet.getRange(2, 1, 1, headers[0].length).setValues([[
      '',
      'Không thấy dòng đổi tên rủi ro.',
      '',
      '',
      '',
      '',
      'Có thể chạy Apply review đổi tên hàng.',
    ]]);
  }
  sheet.setFrozenRows(1);
  [80, 280, 280, 240, 160, 120, 360].forEach((width, i) => sheet.setColumnWidth(i + 1, width));
  sheet.getRange(1, 1, Math.max(rows.length + 1, 2), headers[0].length).setWrap(true).setVerticalAlignment('middle');
}

function tokenOverlapNvl_(oldNorm, newNorm) {
  const ignore = {
    moco: true,
    va: true,
    voi: true,
    cho: true,
    cua: true,
    hang: true,
    hoa: true,
    cai: true,
    chiec: true,
    hop: true,
    tui: true,
  };
  const oldTokens = oldNorm.split(' ').filter(t => t.length >= 2 && !ignore[t]);
  const newTokens = newNorm.split(' ').filter(t => t.length >= 2 && !ignore[t]);
  if (!oldTokens.length || !newTokens.length) return oldNorm === newNorm ? 1 : 0;
  const newSet = {};
  newTokens.forEach(t => { newSet[t] = true; });
  const matches = oldTokens.filter(t => newSet[t]).length;
  return matches / Math.max(oldTokens.length, newTokens.length);
}

function isPackagingLikeNvl_(norm) {
  return /\b(tem|decal|nhan|hop|tui|khay|ly|nap|muong|dia|dao|dai giay|bao bi|mang|mieng lot|giay)\b/.test(norm);
}

function isIngredientLikeNvl_(norm) {
  return /\b(bot|duong|sua|bo|cream|cheese|trung|dau|dieu|hanh nhan|yen mach|chuoi|carot|dua|chocolate|socola|gelatin|vani|muoi|baking|men|gao|hat|chanh|khoai|ruoc)\b/.test(norm);
}

function addReviewCount_(bucket, value) {
  const key = String(value || '').trim();
  if (!key) return;
  bucket[key] = (bucket[key] || 0) + 1;
}

function topReviewValues_(bucket) {
  return Object.keys(bucket)
    .sort((a, b) => bucket[b] - bucket[a] || a.localeCompare(b, 'vi'))
    .slice(0, 4)
    .map(key => key + (bucket[key] > 1 ? ' x' + bucket[key] : ''))
    .join(', ');
}

function normNvlName_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findClosestNvlMasterItem_(name, masterItems) {
  const key = normNvlName_(name);
  if (!key) return null;
  const tokens = key.split(' ').filter(t => t.length >= 2);
  let best = null;
  let bestScore = 0;
  masterItems.forEach(item => {
    const candidate = item.norm;
    if (!candidate) return;
    let score = 0;
    if (candidate === key) score += 100;
    if (candidate.indexOf(key) >= 0 || key.indexOf(candidate) >= 0) score += 40;
    tokens.forEach(token => {
      if (candidate.split(' ').indexOf(token) >= 0) score += 12;
      else if (candidate.indexOf(token) >= 0) score += 5;
    });
    const distance = levenshteinNvl_(key, candidate);
    const maxLen = Math.max(key.length, candidate.length, 1);
    score += Math.max(0, 30 - Math.round((distance / maxLen) * 30));
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });
  return bestScore >= 34 ? best : null;
}

function levenshteinNvl_(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function copyNvlSheetBackup_(ss, sheet, prefix) {
  const tz = Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const name = prefix + stamp;
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function buildMasterPreserveMap_(masterSheet, nameMap) {
  const out = {};
  if (!masterSheet || masterSheet.getLastRow() < 2) return out;
  const rows = masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, Math.max(masterSheet.getLastColumn(), NVL_MASTER_WIDTH)).getValues();
  rows.forEach(row => {
    const oldName = String(row[1] || '').trim();
    if (!oldName) return;
    const finalName = nameMap[oldName] || oldName;
    if (!out[finalName]) {
      out[finalName] = {
        category: String(row[2] || '').trim(),
        status: String(row[8] || '').trim(),
        noteParts: [],
        costFlag: String(row[10] || '').trim(),
        role: String(row[11] || '').trim(),
      };
    }
    const item = out[finalName];
    if (!item.category && row[2]) item.category = String(row[2]).trim();
    if (!item.status && row[8]) item.status = String(row[8]).trim();
    if (!item.costFlag && row[10]) item.costFlag = String(row[10]).trim();
    if (!item.role && row[11]) item.role = String(row[11]).trim();
    const note = String(row[9] || '').trim();
    if (note) item.noteParts.push(note);
    if (oldName !== finalName) item.noteParts.push(oldName);
  });
  return out;
}

function rebuildMasterFromNhapHangPreserving_(ss, nhSheet, preserve) {
  const nvlMap = buildNvlGroupedFromNhapHang_(nhSheet, {});
  const items = Object.values(nvlMap).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const rows = items.map((item, idx) => {
    const meta = preserve[item.name] || {};
    const sorted = item.entries.sort((a, b) => dateVal_(b.date) - dateVal_(a.date));
    const latestPrice = sorted.length ? sorted[0].unitPrice : '';
    const avgPrice = sorted.length
      ? Math.round(sorted.reduce((sum, entry) => sum + entry.unitPrice, 0) / sorted.length)
      : '';
    const category = meta.category || item.category;
    const aliases = [
      ...new Set([
        ...Array.from(item.aliases || []),
        ...(meta.noteParts || []),
      ].map(value => String(value || '').trim()).filter(Boolean)),
    ].join(', ');
    return [
      idx + 1,
      item.name,
      category,
      item.count || sorted.length,
      item.unit,
      latestPrice,
      avgPrice,
      cleanNvlMasterDate_(sorted.length ? sorted[0].date : ''),
      meta.status || 'Đang dùng',
      aliases,
      resolveNvlCostFlag_(meta, category),
      meta.role || nvlCostRoleForCategory_(category),
    ];
  });

  let masterSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!masterSheet) masterSheet = ss.insertSheet(NVL_MASTER_SHEET);
  masterSheet.clear().clearFormats().clearConditionalFormatRules();
  masterSheet.getRange(1, 1, 1, NVL_MASTER_HEADERS.length).setValues([NVL_MASTER_HEADERS]);
  if (rows.length) {
    masterSheet.getRange(2, 1, rows.length, NVL_MASTER_WIDTH).setValues(rows);
  }
  MOCO_APPLY_MASTER_NVL_UI();
  return rows.length;
}

function buildNvlGroupedFromNhapHang_(nhSheet, nameMap) {
  const lastRow = nhSheet.getLastRow();
  if (lastRow < 2) return {};

  if (typeof applyUnitPriceFormulas_ === 'function') {
    applyUnitPriceFormulas_(nhSheet, lastRow);
    SpreadsheetApp.flush();
  }

  const idx = getNvlNhapHangIndexes_(nhSheet);
  const width = Math.max(nhSheet.getLastColumn(), idx.unitPrice + 1);
  const data = nhSheet.getRange(2, 1, lastRow - 1, width).getValues();
  const grouped = {};

  data.forEach(row => {
    const rawName = String(row[idx.name] || '').trim();
    if (!rawName) return;

    const stdName = (nameMap && nameMap[rawName]) || proposeName_(rawName) || rawName;
    if (!stdName) return;

    if (!grouped[stdName]) {
      const category = String(row[idx.category] || '').trim();
      grouped[stdName] = {
        name: stdName,
        category,
        unit: String(row[idx.unit] || '').trim(),
        count: 0,
        aliases: new Set(),
        entries: [],
      };
    }

    const item = grouped[stdName];
    item.count += 1;
    if (rawName !== stdName) item.aliases.add(rawName);
    if (!item.category && row[idx.category]) item.category = String(row[idx.category]).trim();
    if (!item.unit && row[idx.unit]) item.unit = String(row[idx.unit]).trim();

    const unitPrice = Number(row[idx.unitPrice]) || 0;
    if (unitPrice > 0) {
      item.entries.push({
        date: row[idx.date],
        unitPrice,
        supplier: idx.supplier >= 0 ? String(row[idx.supplier] || '').trim() : '',
      });
    }
  });

  return grouped;
}

function getNvlNhapHangIndexes_(sheet) {
  const headers = sheet.getRange(1, 1, 1, 10).getDisplayValues()[0]
    .map(normNvlSheetHeader_);
  const hasSupplier = headers.some(h => h === 'ncc' || h === 'brand' || h.indexOf('nha cung cap') >= 0);
  return {
    date: findNvlHeaderIndex_(headers, h => h.indexOf('nhap') >= 0 || h.indexOf('ngay') >= 0, 0),
    name: findNvlHeaderIndex_(headers, h => h.indexOf('ten hang') >= 0 || h.indexOf('ten nvl') >= 0, 1),
    supplier: findNvlHeaderIndex_(headers, h => h === 'ncc' || h === 'brand' || h.indexOf('nha cung cap') >= 0, hasSupplier ? 2 : -1),
    category: findNvlHeaderIndex_(headers, h => h.indexOf('loai hang') >= 0, hasSupplier ? 3 : 2),
    unit: findNvlHeaderIndex_(headers, h => h === 'don vi', hasSupplier ? 6 : 5),
    unitPrice: findNvlHeaderIndex_(headers, h => h.indexOf('don gia') >= 0 && h.indexOf('1 dv') >= 0, hasSupplier ? 8 : 7, true),
  };
}

function findNvlHeaderIndex_(headers, predicate, fallback, fromEnd) {
  if (fromEnd) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (predicate(headers[i])) return i;
    }
    return fallback;
  }
  for (let i = 0; i < headers.length; i++) {
    if (predicate(headers[i])) return i;
  }
  return fallback;
}

function normNvlSheetHeader_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

function MOCO_APPLY_MASTER_NVL_UI() {
  const ss = getMocoSpreadsheet_();
  const mSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!mSheet) throw new Error('Không tìm thấy sheet: ' + NVL_MASTER_SHEET);

  const lastRow = Math.max(mSheet.getLastRow(), 1);
  const lastCol = Math.max(mSheet.getLastColumn(), NVL_MASTER_WIDTH);
  const oldHeaders = mSheet.getRange(1, 1, 1, lastCol).getValues()[0]
    .map(value => String(value || '').trim());
  const oldRows = lastRow > 1
    ? mSheet.getRange(2, 1, lastRow - 1, lastCol).getValues()
    : [];
  const headerMap = buildNvlMasterHeaderMap_(oldHeaders);

  const rows = oldRows.map((row, idx) => {
    const category = getNvlMasterValue_(row, headerMap, ['Loại hàng'], 2);
    const costFlag = getNvlMasterValue_(row, headerMap, ['Tính cost bánh?'], 10)
      || (isNvlIngredientCostCategory_(category) ? 'Có' : 'Không');
    return [
      getNvlMasterValue_(row, headerMap, ['STT'], 0) || idx + 1,
      getNvlMasterValue_(row, headerMap, ['Tên NVL', 'Tên nguyên liệu chuẩn'], 1),
      category,
      getNvlMasterValue_(row, headerMap, ['Số lần nhập'], 3),
      getNvlMasterValue_(row, headerMap, ['Đơn vị'], 4),
      getNvlMasterValue_(row, headerMap, ['Đơn giá mới nhất / 1 ĐV'], 5),
      getNvlMasterValue_(row, headerMap, ['Đơn giá TB / 1 ĐV'], 6),
      cleanNvlMasterDate_(getNvlMasterValue_(row, headerMap, ['Lần nhập cuối'], 7)),
      getNvlMasterValue_(row, headerMap, ['Trạng thái'], 8) || 'Đang dùng',
      getNvlMasterValue_(row, headerMap, ['Ghi chú (tên cũ)', 'Ghi chú'], 9),
      costFlag,
      getNvlMasterValue_(row, headerMap, ['Vai trò trong cost'], 11) || nvlCostRoleForCategory_(category),
    ];
  });

  mSheet.getRange(1, 1, Math.max(lastRow, 2), NVL_MASTER_WIDTH)
    .clearContent()
    .clearDataValidations();
  mSheet.getRange(1, 1, 1, NVL_MASTER_WIDTH).setValues([NVL_MASTER_HEADERS])
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0B8043')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(false);
  if (rows.length) {
    mSheet.getRange(2, 1, rows.length, NVL_MASTER_WIDTH).setValues(rows);
  }

  const dataRows = Math.max(rows.length, 100);
  mSheet.setFrozenRows(1);
  mSheet.setRowHeight(1, 34);
  [45, 260, 150, 90, 80, 150, 140, 120, 120, 260, 125, 180].forEach((width, idx) => {
    mSheet.setColumnWidth(idx + 1, width);
  });
  const formatWarnings = [];
  mSheet.getRange(2, 1, dataRows, 1).setHorizontalAlignment('center');
  mSheet.getRange(2, 4, dataRows, 1).setHorizontalAlignment('center');
  try {
    mSheet.getRange(2, 6, dataRows, 2).setNumberFormat('#,##0.00 [$đ-42A]').setHorizontalAlignment('right');
  } catch (err) {
    formatWarnings.push({ range: 'F:G', message: err && err.message ? err.message : String(err) });
    mSheet.getRange(2, 6, dataRows, 2).setHorizontalAlignment('right');
  }
  try {
    mSheet.getRange(2, 8, dataRows, 1).setNumberFormat('dd/mm/yyyy');
  } catch (err) {
    formatWarnings.push({ range: 'H:H', message: err && err.message ? err.message : String(err) });
  }
  mSheet.getRange(2, 9, dataRows, 1).setHorizontalAlignment('center');
  mSheet.getRange(2, 11, dataRows, 1).setHorizontalAlignment('center');

  const categoryValues = typeof CATEGORIES !== 'undefined'
    ? CATEGORIES
    : ['Nguyên liệu khô', 'Sữa/bơ/kem', 'Hạt', 'Trái cây', 'Trứng', 'Bao bì', 'Dụng cụ', 'Khác'];
  const tableDropdownResult = applyMocoMasterNvlTableDropdowns_(ss, mSheet, {
    categories: categoryValues,
    units: ['g', 'ml', 'quả', 'cái', 'bộ', 'túi'],
    statuses: NVL_STATUS_VALUES,
    costFlags: NVL_COST_FLAG_VALUES,
    costRoles: NVL_COST_ROLE_VALUES,
  });
  const standardValidationWarnings = [];
  if (!tableDropdownResult.applied) {
    safeSetNvlValidation_(mSheet, 2, 3, dataRows, categoryValues, true, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 5, dataRows, ['g', 'ml', 'quả', 'cái', 'bộ', 'túi'], true, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 9, dataRows, NVL_STATUS_VALUES, false, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 11, dataRows, NVL_COST_FLAG_VALUES, false, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 12, dataRows, NVL_COST_ROLE_VALUES, true, standardValidationWarnings);
  }

  try {
    if (mSheet.getFilter()) mSheet.getFilter().remove();
    mSheet.getRange(1, 1, Math.max(rows.length + 1, 2), NVL_MASTER_WIDTH).createFilter();
  } catch (err) {}

  try {
    mSheet.getBandings().forEach(b => b.remove());
    const banding = mSheet.getRange(1, 1, Math.max(rows.length + 1, 2), NVL_MASTER_WIDTH)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREEN);
    banding.setHeaderRowColor('#0B8043');
    banding.setFirstRowColor('#FFFFFF');
    banding.setSecondRowColor('#E8F5E9');
  } catch (err) {}

  const rules = [];
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($F2>0,$G2>0,$F2>$G2*1.2)')
      .setBackground('#FFEBEE')
      .setRanges([mSheet.getRange(2, 6, dataRows, 2)])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Không')
      .setBackground('#F1F3F4')
      .setFontColor('#5F6368')
      .setRanges([mSheet.getRange(2, 11, dataRows, 1)])
      .build()
  );
  mSheet.setConditionalFormatRules(rules);

  const existingRanges = ss.getNamedRanges().filter(n => n.getName() === 'Master_NVL');
  existingRanges.forEach(n => n.remove());
  ss.setNamedRange('Master_NVL', mSheet.getRange(2, 1, Math.max(rows.length, 1), NVL_MASTER_WIDTH));

  return {
    sheet: NVL_MASTER_SHEET,
    rows: rows.length,
    layout: NVL_MASTER_HEADERS,
    dropdownMode: tableDropdownResult.applied ? 'google_sheets_table_chip_dropdowns' : 'standard_data_validation',
    tableDropdown: tableDropdownResult,
    standardValidationWarnings,
    formatWarnings,
  };
}

function safeSetNvlValidation_(sheet, row, col, numRows, values, allowInvalid, warnings) {
  try {
    sheet.getRange(row, col, numRows, 1).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(values, true)
        .setAllowInvalid(allowInvalid === true)
        .build()
    );
    return true;
  } catch (err) {
    if (warnings) warnings.push({ col, message: err && err.message ? err.message : String(err) });
    return false;
  }
}

function MOCO_APPLY_MASTER_NVL_VALIDATIONS_ONLY() {
  const ss = getMocoSpreadsheet_();
  const mSheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!mSheet) throw new Error('Không tìm thấy sheet: ' + NVL_MASTER_SHEET);

  const dataRows = Math.max(mSheet.getLastRow() - 1, 1);
  const categoryValues = typeof CATEGORIES !== 'undefined'
    ? CATEGORIES
    : ['Nguyên liệu khô', 'Sữa/bơ/kem', 'Hạt', 'Trái cây', 'Trứng', 'Bao bì', 'Dụng cụ', 'Khác'];
  const tableDropdownResult = applyMocoMasterNvlTableDropdowns_(ss, mSheet, {
    categories: categoryValues,
    units: ['g', 'ml', 'quả', 'cái', 'bộ', 'túi'],
    statuses: NVL_STATUS_VALUES,
    costFlags: NVL_COST_FLAG_VALUES,
    costRoles: NVL_COST_ROLE_VALUES,
  });
  const standardValidationWarnings = [];
  if (!tableDropdownResult.applied) {
    safeSetNvlValidation_(mSheet, 2, 3, dataRows, categoryValues, true, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 5, dataRows, ['g', 'ml', 'quả', 'cái', 'bộ', 'túi'], true, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 9, dataRows, NVL_STATUS_VALUES, false, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 11, dataRows, NVL_COST_FLAG_VALUES, false, standardValidationWarnings);
    safeSetNvlValidation_(mSheet, 2, 12, dataRows, NVL_COST_ROLE_VALUES, true, standardValidationWarnings);
  }
  return {
    sheet: NVL_MASTER_SHEET,
    rows: dataRows,
    dropdownMode: tableDropdownResult.applied ? 'google_sheets_table_chip_dropdowns' : 'standard_data_validation',
    tableDropdown: tableDropdownResult,
    standardValidationWarnings,
    policy: 'Validation-only. Không sửa content, màu, header, filter, banding, conditional format hoặc column width.',
  };
}

function applyMocoMasterNvlTableDropdowns_(ss, sheet, lists) {
  if (typeof Sheets === 'undefined' || !Sheets.Spreadsheets) {
    return { applied: false, reason: 'Sheets advanced service is not enabled.' };
  }
  let spreadsheet;
  try {
    spreadsheet = Sheets.Spreadsheets.get(ss.getId(), {
      fields: 'sheets(properties(sheetId,title),tables(tableId,name,range,columnProperties))',
    });
  } catch (err) {
    return { applied: false, reason: err && err.message ? err.message : String(err) };
  }

  const apiSheet = (spreadsheet.sheets || []).find(item =>
    item.properties && item.properties.sheetId === sheet.getSheetId()
  );
  const tables = apiSheet && apiSheet.tables ? apiSheet.tables : [];
  const table = tables.find(t => {
    const range = t.range || {};
    return range.startRowIndex === 0 &&
      (range.startColumnIndex || 0) <= 0 &&
      (range.endColumnIndex || NVL_MASTER_WIDTH) >= NVL_MASTER_WIDTH;
  }) || tables[0];
  if (!table) return { applied: false, reason: 'Master NVL is not a Google Sheets table.' };

  const existingByIndex = {};
  (table.columnProperties || []).forEach(prop => {
    existingByIndex[prop.columnIndex] = prop;
  });
  const dropdowns = {
    2: lists.categories,
    4: lists.units,
    8: lists.statuses,
    10: lists.costFlags,
    11: lists.costRoles,
  };
  const columnTypes = {
    0: 'DOUBLE',
    1: 'TEXT',
    2: 'DROPDOWN',
    3: 'DOUBLE',
    4: 'DROPDOWN',
    5: 'CURRENCY',
    6: 'CURRENCY',
    7: 'DATE',
    8: 'DROPDOWN',
    9: 'TEXT',
    10: 'DROPDOWN',
    11: 'DROPDOWN',
  };
  const columnProperties = NVL_MASTER_HEADERS.map((name, idx) => {
    const prop = Object.assign({}, existingByIndex[idx] || {});
    prop.columnIndex = idx;
    prop.columnName = name;
    prop.columnType = columnTypes[idx] || 'TEXT';
    if (dropdowns[idx]) {
      prop.dataValidationRule = {
        condition: {
          type: 'ONE_OF_LIST',
          values: dropdowns[idx].map(value => ({ userEnteredValue: String(value) })),
        },
      };
    } else {
      delete prop.dataValidationRule;
    }
    return prop;
  });

  try {
    Sheets.Spreadsheets.batchUpdate({
      requests: [{
        updateTable: {
          table: {
            tableId: table.tableId,
            columnProperties,
          },
          fields: 'columnProperties',
        },
      }],
    }, ss.getId());
    return {
      applied: true,
      tableId: table.tableId,
      tableName: table.name || '',
      dropdownColumns: ['Loại hàng', 'Đơn vị', 'Trạng thái', 'Tính cost bánh?', 'Vai trò trong cost'],
    };
  } catch (err) {
    return { applied: false, tableId: table.tableId, reason: err && err.message ? err.message : String(err) };
  }
}

function buildNvlMasterHeaderMap_(headers) {
  const out = {};
  headers.forEach((header, idx) => {
    if (header) out[header] = idx;
  });
  return out;
}

function getNvlMasterValue_(row, headerMap, names, fallbackIndex) {
  for (const name of names) {
    if (headerMap.hasOwnProperty(name)) return row[headerMap[name]];
  }
  return row[fallbackIndex];
}

function isNvlIngredientCostCategory_(category) {
  return NVL_COST_INGREDIENT_CATEGORIES.indexOf(String(category || '').trim()) >= 0;
}

function resolveNvlCostFlag_(meta, category) {
  if (isNvlIngredientCostCategory_(category)) return 'Có';
  return meta.costFlag || 'Không';
}

function nvlCostRoleForCategory_(category) {
  const cat = String(category || '').trim();
  if (isNvlIngredientCostCategory_(cat)) return 'Nguyên liệu công thức';
  if (cat === 'Bao bì') return 'Bao bì / vật tư bán hàng';
  if (cat === 'Dụng cụ') return 'Dụng cụ / thiết bị';
  return 'Không tính vào cost bánh';
}

function ensureMocoMasterCostColumns_(mSheet) {
  return MOCO_APPLY_MASTER_NVL_UI();
}

function MOCO_NORMALIZE_MASTER_COST_FLAGS() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(NVL_MASTER_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { updated: 0 };
  const values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), NVL_MASTER_WIDTH)).getValues();
  const headerMap = buildNvlMasterHeaderMap_(values[0] || []);
  const categoryCol = headerMap['Loại hàng'] ?? 2;
  const flagCol = headerMap['Tính cost bánh?'] ?? 10;
  const roleCol = headerMap['Vai trò trong cost'] ?? 11;
  let updated = 0;
  for (let i = 1; i < values.length; i++) {
    const category = String(values[i][categoryCol] || '').trim();
    if (!isNvlIngredientCostCategory_(category)) continue;
    if (values[i][flagCol] !== 'Có') {
      values[i][flagCol] = 'Có';
      updated += 1;
    }
    if (values[i][roleCol] !== 'Nguyên liệu công thức') {
      values[i][roleCol] = 'Nguyên liệu công thức';
      updated += 1;
    }
  }
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  MOCO_APPLY_MASTER_NVL_UI();
  return { updated };
}

function cleanNvlMasterDate_(value) {
  if (!(value instanceof Date) || isNaN(value)) return value || '';
  if (value.getFullYear() < 2000) return '';
  return value;
}

function proposeName_(rawName) {
  const lower = rawName.toLowerCase().trim();
  if (NVL_NAME_MAP.hasOwnProperty(lower)) {
    return NVL_NAME_MAP[lower];
  }
  // Capitalize first letter, keep rest
  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}

function readReviewMapping_(ss) {
  const rvSheet = ss.getSheetByName(NVL_REVIEW_SHEET);
  // Nếu không có review sheet, trả mapping mặc định
  if (!rvSheet) {
    const defaultMap = {};
    // Dùng NVL_NAME_MAP làm fallback
    return defaultMap;
  }

  const lastRow = rvSheet.getLastRow();
  if (lastRow < 2) return {};

  const data = rvSheet.getRange(2, 1, lastRow - 1, 3).getValues();
  const map = {};

  for (const row of data) {
    const oldName = String(row[0] || '').trim();
    const proposed = String(row[1] || '').trim();
    const founderFix = String(row[2] || '').trim();

    if (!oldName) continue;
    // Ưu tiên: Founder chỉnh > AI đề xuất > giữ nguyên
    map[oldName] = founderFix || proposed || oldName;
  }

  return map;
}

function dateVal_(v) {
  if (v instanceof Date && !isNaN(v)) return v.getTime();
  return 0;
}
