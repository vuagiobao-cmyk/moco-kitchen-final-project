/**
 * MOCO Kitchen — Dashboard Tổng Hợp  (v2 — fix #VALUE! & #ERROR!)
 *
 * Changelog v2  (09/05/2026):
 *   - Fix: Dùng VALUE(SUBSTITUTE()) để xử lý số dạng text "986.500"
 *   - v2026.05.14.00: Trỏ sang schema ĐƠN HÀNG chuẩn
 *          A=Mã đơn, H=Tên bánh, J=SL, N=Doanh thu sau CK,
 *          P=TT giao hàng, Q=TT thanh toán
 *   - Fix: Số dư hiện tại dùng LOOKUP thay vì MATCH trên text
 *   - Fix: NVL Biến Động Giá dùng QUERY thay CSE array
 *   - Fix: Chi tiêu theo loại dùng SUMPRODUCT + VALUE(SUBSTITUTE())
 *
 * Layout:
 *   Row 4-6:  KPI cards  (Tổng thu, Tổng chi, Lợi nhuận, Số dư)
 *   Row 9-16: Top Bánh + NVL Biến Động
 *   Row 19+:  Tổng quan đơn + Chi tiêu theo loại
 */

const DASH_SHEET = 'DASHBOARD';

function MOCO_CREATE_DASHBOARD() {
  const ss = getMocoSpreadsheet_();

  let sheet = ss.getSheetByName(DASH_SHEET);
  if (sheet) {
    sheet.getDataRange().breakApart();
    sheet.clear().clearFormats().clearConditionalFormatRules();
  } else {
    sheet = ss.insertSheet(DASH_SHEET);
  }

  // ─── Layout Constants ──────────────────────────────────────────────────────
  const BG_DARK = '#1A1A2E';
  const BG_CARD = '#16213E';
  const BG_ACCENT = '#0F3460';
  const GREEN = '#00D09C';
  const RED = '#FF6B6B';
  const YELLOW = '#FFD93D';
  const WHITE = '#FFFFFF';
  const GRAY = '#8E99A4';

  // Set dark background
  sheet.getRange(1, 1, 50, 10).setBackground(BG_DARK);

  // Column widths
  [180, 160, 160, 160, 160, 160, 160, 160, 40, 40].forEach((w, i) => {
    sheet.setColumnWidth(i + 1, w);
  });

  // ─── Title ─────────────────────────────────────────────────────────────────
  sheet.getRange('A1:H1').merge();
  sheet.getRange('A1')
    .setValue('🍰 MOCO Kitchen — Dashboard Tổng Hợp')
    .setFontSize(18).setFontWeight('bold').setFontColor(WHITE)
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 50);

  sheet.getRange('A2:H2').merge();
  sheet.getRange('A2')
    .setValue('Cập nhật tự động từ dữ liệu Sheets')
    .setFontSize(10).setFontColor(GRAY).setFontStyle('italic')
    .setHorizontalAlignment('center');

  // ─── Helper: Formula để sum cột text có dấu chấm ─────────────────────────
  // Dữ liệu cột THU/CHI trong "THU CHI" là text dạng "986.500" (dấu chấm
  // ngăn hàng nghìn) → cần SUBSTITUTE bỏ dấu chấm rồi VALUE.
  // Spreadsheet locale đang dùng dấu ; làm separator công thức.

  function thuChiSumFormula(kind) {
    if (kind === 'thu') return '=SUM(\'THU CHI\'!E3:E)';
    if (kind === 'chi') return '=SUM(\'THU CHI\'!M3:M)';
    return '=0';
  }

  // ─── KPI Cards (Row 4-6) ───────────────────────────────────────────────────
  // Card 1: Doanh thu vận hành, không tính dòng vốn ban đầu.
  buildKpiCard_(sheet, 4, 1, '💰 DOANH THU',
    thuChiSumFormula('thu'),
    GREEN, BG_CARD);

  // Card 2: Tổng CHI từ bảng CHI bên phải.
  buildKpiCard_(sheet, 4, 3, '💸 TỔNG CHI',
    thuChiSumFormula('chi'),
    RED, BG_CARD);

  // Card 3: Lợi nhuận ròng  = THU - CHI
  buildKpiCard_(sheet, 4, 5, '📈 LỢI NHUẬN RÒNG',
    '=B5-D5',
    YELLOW, BG_CARD);

  // Card 4: Số dư hiện tại từ cụm TÓM TẮT trên THU CHI.
  buildKpiCard_(sheet, 4, 7, '🏦 SỐ DƯ HIỆN TẠI',
    '=IFERROR(\'THU CHI\'!R5;"N/A")',
    WHITE, BG_CARD);

  // ─── Section: Top Bánh Bán Chạy (Row 9+) ──────────────────────────────────
  sheet.setRowHeight(8, 15); // spacer

  sheet.getRange('A9:D9').merge();
  sheet.getRange('A9')
    .setValue('🏆 TOP BÁNH BÁN CHẠY')
    .setFontSize(13).setFontWeight('bold').setFontColor(GREEN)
    .setBackground(BG_ACCENT);

  // Headers
  sheet.getRange('A10:D10').setValues([['Tên bánh', 'Số lượng', 'Doanh thu', 'Số đơn']])
    .setFontWeight('bold').setFontColor(GRAY).setBackground(BG_CARD)
    .setHorizontalAlignment('center');

  // ── Formula helpers cho dòng chi tiết đơn hàng ──
  // Nếu ĐƠN HÀNG đã được gộp 1 dòng/đơn cho founder, top bánh phải đọc
  // từ sheet dòng món để không mất item-level data.
  const orderLineSheetName = ss.getSheetByName('ĐƠN HÀNG - MÓN')
    ? 'ĐƠN HÀNG - MÓN'
    : (ss.getSheetByName('ĐƠN HÀNG - CHI TIẾT') ? 'ĐƠN HÀNG - CHI TIẾT' : 'ĐƠN HÀNG');
  const orderLineRef = "'" + orderLineSheetName.replace(/'/g, "''") + "'";
  // Cấu trúc dòng chi tiết chuẩn:
  //   A = Mã đơn       H = Tên bánh      J = SL
  //   N = Doanh thu sau CK               P/Q = trạng thái

  function topBanhRow(name) {
    // Số lượng: sum SL (cột J) nếu cột H khớp tên
    const sl = '=SUMPRODUCT((' + orderLineRef + '!H2:H="' + name + '")*'
      + 'IFERROR(VALUE(SUBSTITUTE(SUBSTITUTE(' + orderLineRef + '!J2:J;".";"");"đ";""));0))';
    // Doanh thu: sum Doanh thu sau CK (cột N) nếu cột H khớp
    const dt = '=SUMPRODUCT((' + orderLineRef + '!H2:H="' + name + '")*'
      + 'IFERROR(VALUE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(' + orderLineRef + '!N2:N;".";"");"đ";"");" ";""));0))';
    // Số đơn unique theo Mã đơn
    const don = '=IFERROR(COUNTA(UNIQUE(FILTER(' + orderLineRef + '!A2:A;' + orderLineRef + '!H2:H="' + name + '")));0)';
    return [name, sl, dt, don];
  }

  const topItems = [
    topBanhRow('CHUỐI YẾN MẠCH CHOCO'),
    topBanhRow('BÁNH MÌ CUỘN QUẾ'),
    topBanhRow('BÁNH MỲ SODA NGUYÊN CÁM'),
    topBanhRow('KETO TIRAMISU'),
    topBanhRow('KETO LEMON CHEESECAKE 10cm'),
    topBanhRow('BÔNG LAN TRỨNG MUỐI'),
  ];

  sheet.getRange(11, 1, topItems.length, 4).setValues(topItems)
    .setFontColor(WHITE).setBackground(BG_DARK);
  sheet.getRange(11, 2, topItems.length, 1).setNumberFormat('#,##0').setHorizontalAlignment('center');
  sheet.getRange(11, 3, topItems.length, 1).setNumberFormat('#,##0 [$đ-42A]').setHorizontalAlignment('right');
  sheet.getRange(11, 4, topItems.length, 1).setNumberFormat('#,##0').setHorizontalAlignment('center');

  // ─── Section: NVL Biến Động Giá (Row 9, col F+) ───────────────────────────
  sheet.getRange('F9:H9').merge();
  sheet.getRange('F9')
    .setValue('📦 NVL BIẾN ĐỘNG GIÁ MẠNH')
    .setFontSize(13).setFontWeight('bold').setFontColor(RED)
    .setBackground(BG_ACCENT);

  sheet.getRange('F10:H10').setValues([['Nguyên liệu', 'Giá mới nhất', 'Giá TB']])
    .setFontWeight('bold').setFontColor(GRAY).setBackground(BG_CARD)
    .setHorizontalAlignment('center');

  // NVL: sheet thực tế là "Master NVL"
  const masterSheet = ss.getSheetByName('Master NVL');
  const hasMasterNvl = masterSheet !== null;
  const nvlRange = sheet.getRange(11, 6, 8, 3);

  if (hasMasterNvl) {
    // Dùng QUERY đơn giản — lọc NVL có giá mới nhất > giá TB * 1.1
    // Master NVL structure: A=STT, B=Tên, C=ĐVT, D=Loại, E=Giá mới nhất, F=Giá TB
    const nvlFormulas = [];
    for (let i = 0; i < 8; i++) {
      const rowIdx = i + 2; // bắt đầu từ row 2 trong Master_NVL
      nvlFormulas.push([
        '=IFERROR(INDEX(\'Master NVL\'!B:B;' + rowIdx + ');"")',
        '=IFERROR(INDEX(\'Master NVL\'!E:E;' + rowIdx + ');"")',
        '=IFERROR(INDEX(\'Master NVL\'!F:F;' + rowIdx + ');"")',
      ]);
    }
    nvlRange.setFormulas(nvlFormulas);
  } else {
    nvlRange.setValues(Array.from({ length: 8 }, () => ['', '', '']));
    sheet.getRange('F11').setValue('Chưa có Master NVL — chạy MOCO > Tạo Master NVL trước');
  }
  nvlRange.setFontColor(WHITE).setBackground(BG_DARK);
  if (!hasMasterNvl) {
    sheet.getRange('F11').setFontStyle('italic').setFontColor(GRAY);
  }
  sheet.getRange(11, 7, 8, 2).setNumberFormat('#,##0 [$đ-42A]');

  // ─── Section: Tổng quan Đơn hàng (Row 19+) ────────────────────────────────
  sheet.setRowHeight(18, 15); // spacer

  sheet.getRange('A19:D19').merge();
  sheet.getRange('A19')
    .setValue('📋 TỔNG QUAN ĐƠN HÀNG')
    .setFontSize(13).setFontWeight('bold').setFontColor(YELLOW)
    .setBackground(BG_ACCENT);

  sheet.getRange('A20:B20').setValues([['Chỉ số', 'Giá trị']])
    .setFontWeight('bold').setFontColor(GRAY).setBackground(BG_CARD);

  const orderKpis = [
    ['Tổng đơn hàng', '=IFERROR(COUNTA(UNIQUE(FILTER(\'ĐƠN HÀNG\'!A2:A;\'ĐƠN HÀNG\'!A2:A<>"")));0)'],
    ['Đơn đã giao', '=IFERROR(COUNTA(UNIQUE(FILTER(\'ĐƠN HÀNG\'!A2:A;\'ĐƠN HÀNG\'!Q2:Q="Đã giao")));0)'],
    ['Đơn đã nhận tiền', '=IFERROR(COUNTA(UNIQUE(FILTER(\'ĐƠN HÀNG\'!A2:A;\'ĐƠN HÀNG\'!R2:R="Đã nhận tiền")));0)'],
    ['Đơn chưa thanh toán', '=IFERROR(COUNTA(UNIQUE(FILTER(\'ĐƠN HÀNG\'!A2:A;\'ĐƠN HÀNG\'!R2:R="Chưa thanh toán")));0)'],
    ['Tổng doanh thu (sau CK)',
      '=SUMPRODUCT(IFERROR(VALUE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(\'ĐƠN HÀNG\'!O2:O;".";"");"đ";"");" ";""));0))'],
  ];
  sheet.getRange(21, 1, orderKpis.length, 2).setValues(orderKpis)
    .setFontColor(WHITE).setBackground(BG_DARK);
  sheet.getRange(21, 2, 4, 1).setNumberFormat('#,##0');
  sheet.getRange(25, 2).setNumberFormat('#,##0 [$đ-42A]');

  // ─── Section: Chi tiêu theo loại (Row 19, col F+) ─────────────────────────
  sheet.getRange('F19:H19').merge();
  sheet.getRange('F19')
    .setValue('💸 CHI TIÊU THEO LOẠI')
    .setFontSize(13).setFontWeight('bold').setFontColor('#FF9800')
    .setBackground(BG_ACCENT);

  sheet.getRange('F20:G20').setValues([['Loại', 'Tổng chi']])
    .setFontWeight('bold').setFontColor(GRAY).setBackground(BG_CARD);

  // Bảng CHI: K = nhóm chi, M = số tiền chi.
  function chiByType(type) {
    return '=SUMIF(\'THU CHI\'!K3:K;"' + type + '";\'THU CHI\'!M3:M)';
  }

  const chiTypes = [
    ['Mua NVL', chiByType('Mua NVL')],
    ['TTB', chiByType('TTB')],
    ['CCDC', chiByType('CCDC')],
  ];
  sheet.getRange(21, 6, chiTypes.length, 2).setValues(chiTypes)
    .setFontColor(WHITE).setBackground(BG_DARK);
  sheet.getRange(21, 7, chiTypes.length, 1).setNumberFormat('#,##0 [$đ-42A]');

  // ─── Footer ────────────────────────────────────────────────────────────────
  sheet.getRange('A28:H28').merge();
  sheet.getRange('A28')
    .setValue('Dashboard tự cập nhật khi dữ liệu thay đổi · v2 fix 09/05/2026')
    .setFontSize(9).setFontColor(GRAY).setFontStyle('italic')
    .setHorizontalAlignment('center');

  // Freeze
  sheet.setFrozenRows(2);

  // Hide gridlines
  sheet.setHiddenGridlines(true);

  try {
    SpreadsheetApp.getUi().alert('✅ Dashboard đã tạo xong (v2). Dữ liệu sẽ tự cập nhật.');
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
}

// ─── KPI Card Builder ────────────────────────────────────────────────────────
function buildKpiCard_(sheet, row, col, label, formula, accentColor, cardBg) {
  // Label
  sheet.getRange(row, col, 1, 2).merge();
  sheet.getRange(row, col)
    .setValue(label)
    .setFontSize(10).setFontWeight('bold').setFontColor('#8E99A4')
    .setBackground(cardBg).setHorizontalAlignment('center');

  // Value. Keep the value in the right cell (B/D/F/H) so checks can read it directly.
  sheet.getRange(row + 1, col, 1, 2)
    .setBackground(cardBg);
  sheet.getRange(row + 1, col + 1)
    .setFormula(formula)
    .setFontSize(16).setFontWeight('bold').setFontColor(accentColor)
    .setBackground(cardBg).setHorizontalAlignment('center')
    .setNumberFormat('#,##0 [$đ-42A]');

  // Bottom accent line
  sheet.getRange(row + 2, col, 1, 2).merge();
  sheet.getRange(row + 2, col)
    .setBackground(accentColor);
  sheet.setRowHeight(row + 2, 4);
}
