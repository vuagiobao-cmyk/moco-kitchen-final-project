/**
 * MOCO Kitchen — Thu-Chi Tự Động
 * Version: v2026.05.14.01
 *
 * Chức năng:
 * 1. MOCO_BACKFILL_THU() - Bổ sung ngược dòng THU cho đơn Done cũ
 * 2. onEdit trigger - Khi đơn mới "Đã nhận tiền" → tự ghi THU
 *
 * Cấu trúc Thu-Chi hiện tại:
 *   A: STT | B: NGÀY GD | C: MÔ TẢ GD | D: THU | E: CHI | F: SỐ DƯ
 *
 * Cấu trúc Đơn hàng chuẩn:
 *   A: Mã đơn | B: Ngày đặt | C: Ngày giao | D: Giờ giao | E: Tên KH
 *   F: SĐT | G: Địa chỉ | H: Tên bánh | I: SKU/Menu | J: SL
 *   K: Đơn giá | L: Thành tiền | M: Chiết khấu | N: Doanh thu sau CK
 *   O: TT sản xuất | P: TT giao hàng | Q: TT thanh toán | R: Ghi chú
 */

const TC_SHEET = 'THU CHI';
const ORDER_SHEET = 'ĐƠN HÀNG';
const TC_MARKER_PREFIX = 'AUTO-DON-';
const TC_HEADERS = ['STT', 'NGÀY GD', 'NHÓM', 'MÔ TẢ GD', 'THU', 'CHI', 'SỐ DƯ', 'NGUỒN', 'REF'];
const TC_CAPITAL_LABEL = 'TỔNG VỐN ĐẦU TƯ BAN ĐẦU';
const TC_CAPITAL_AMOUNT = 10000000;
const TC_OPENING_BALANCE = 16000000;

// Menu chính nằm trong MOCO_NHAP_HANG_V2.gs để tránh nhiều onOpen() ghi đè nhau.

// ═══════════════════════════════════════════════════════════════════════════════
// Chuẩn hóa lại Thu-Chi: backup, bỏ dòng trống giữa bảng, đánh lại STT/UI
// ═══════════════════════════════════════════════════════════════════════════════
function MOCO_REBUILD_THU_CHI() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(TC_SHEET);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + TC_SHEET);
  if (sheet.getRange(1, 1).getDisplayValue() === 'BẢNG THU' &&
      sheet.getRange(1, 9).getDisplayValue() === 'BẢNG CHI') {
    updateThuChiParallelSummary_(sheet);
    applyThuChiUi_(sheet, Math.max(findLastRealDataRow_(sheet) - 2, 1));
    return { ok: true, layout: 'parallel', note: 'THU CHI đã ở layout song song; chỉ refresh UI/tóm tắt.' };
  }

  const backupName = createThuChiBackup_(ss, sheet);
  const parsedRows = readThuChiRows_(sheet);
  const capital = findThuChiCapitalRow_(parsedRows);
  const rows = parsedRows.filter(row => !isThuChiCapitalRow_(row));
  rows.sort((a, b) => {
    const ad = tcDateSortVal_(a.date);
    const bd = tcDateSortVal_(b.date);
    if (ad !== bd) return ad - bd;
    return a.originalIndex - b.originalIndex;
  });

  const clearRows = Math.max(sheet.getMaxRows() - 1, 1);
  sheet.getRange(1, 1, clearRows + 1, TC_HEADERS.length)
    .clearContent()
    .clearNote()
    .clearFormat()
    .clearDataValidations();

  setupThuChiHeader_(sheet);

  sheet.getRange(2, 1, 1, TC_HEADERS.length).setValues([[
    TC_CAPITAL_LABEL,
    '',
    'Vốn',
    'Vốn đầu kỳ',
    capital.thu || TC_CAPITAL_AMOUNT,
    capital.chi || 0,
    capital.balance > 0 ? capital.balance : TC_OPENING_BALANCE,
    'Founder copy',
    'OPENING',
  ]]);

  if (rows.length) {
    const values = rows.map((row, idx) => [
      idx + 1,
      row.date || '',
      row.group || classifyThuChiGroup_(row),
      row.desc || '',
      row.thu || '',
      row.chi || '',
      '',
      row.source || '',
      row.ref || row.marker || '',
    ]);
    sheet.getRange(3, 1, values.length, TC_HEADERS.length).setValues(values);
    setThuChiMarkerNotes_(sheet, 3, rows.map(row => row.marker || ''));
    setBalanceFormulas_(sheet, 3, values.length);
  }

  applyThuChiUi_(sheet, Math.max(rows.length + 1, 1));

  try {
    SpreadsheetApp.getUi().alert(
      'Đã chuẩn hóa Thu - Chi.\n\n' +
      'Backup: ' + backupName + '\n' +
      'Số dòng giao dịch giữ lại: ' + rows.length + '\n' +
      'Đã đưa vốn ban đầu lên đầu bảng và tính lại SỐ DƯ.'
    );
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Backfill THU cho đơn Done cũ
// ═══════════════════════════════════════════════════════════════════════════════
function MOCO_BACKFILL_THU() {
  const ss = getMocoSpreadsheet_();
  const orderSheet = ss.getSheetByName(ORDER_SHEET);
  const tcSheet = ss.getSheetByName(TC_SHEET);

  if (!orderSheet) throw new Error('Không tìm thấy sheet: ' + ORDER_SHEET);
  if (!tcSheet) throw new Error('Không tìm thấy sheet: ' + TC_SHEET);

  // Đọc đơn hàng
  const orderLastRow = orderSheet.getLastRow();
  if (orderLastRow < 2) { logResult_('Không có đơn hàng nào.'); return; }
  const orderLastCol = Math.max(orderSheet.getLastColumn(), 13);
  const orderHeaders = orderSheet.getRange(1, 1, 1, orderLastCol).getDisplayValues()[0];
  const orderData = orderSheet.getRange(2, 1, orderLastRow - 1, orderLastCol).getValues();

  // Đọc Thu-Chi hiện có để tránh ghi trùng
  const tcLastRow = findLastRealDataRow_(tcSheet);
  const existingMarkers = collectExistingMarkers_(tcSheet);

  // Parse đơn hàng → gộp theo STT
  const orders = parseOrders_(orderData, orderHeaders);

  // Lọc đơn Done mà chưa có THU
  const doneOrders = orders.filter(o => {
    const status = o.status.toLowerCase().trim();
    return (status === 'done' || status === 'đã nhận tiền');
  });

  const newEntries = [];
  for (const order of doneOrders) {
    const orderKey = normalizeTcOrderId_(order.stt);
    const marker = canonicalTcMarker_(orderKey);
    const desc = buildThuDesc_(orderKey, order.customer);

    if (existingMarkers.has(marker)) continue; // đã ghi rồi

    const amount = order.totalAfterDiscount || order.totalBeforeDiscount || 0;
    if (amount <= 0) continue;

    newEntries.push({
      date: order.deliveryDate || order.orderDate || '',
      desc: desc,
      amount: amount,
      customer: order.customer,
      marker: marker,
    });
  }

  if (!newEntries.length) {
    try {
      SpreadsheetApp.getUi().alert('Không có đơn Done mới nào cần bổ sung THU.');
    } catch (err) {
      // Web App / API executions do not have an interactive spreadsheet UI.
    }
    return {
      inserted: 0,
      doneOrders: doneOrders.length,
      reason: 'Không có đơn Done mới nào cần bổ sung THU hoặc đơn đã tồn tại trong THU CHI.',
    };
  }

  const appendResult = appendThuChiIncomeRows_(tcSheet, newEntries);

  try {
    SpreadsheetApp.getUi().alert(
      'Đã bổ sung ' + appendResult.inserted + ' dòng THU cho đơn Done.\n\n' +
      'Dữ liệu đã ghi vào bảng THU bên trái của sheet THU CHI.'
    );
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
  return {
    inserted: appendResult.inserted,
    insertRow: appendResult.insertRow,
    doneOrders: doneOrders.length,
    markers: newEntries.map(entry => entry.marker),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// onEdit trigger: tự ghi THU khi đơn mới "Đã nhận tiền"
// ═══════════════════════════════════════════════════════════════════════════════
function MOCO_REPAIR_THU_CHI_ORDER_SYNC() {
  const ss = getMocoSpreadsheet_();
  const orderSheet = ss.getSheetByName(ORDER_SHEET);
  const tcSheet = ss.getSheetByName(TC_SHEET);
  if (!orderSheet) throw new Error('Khong tim thay sheet: ' + ORDER_SHEET);
  if (!tcSheet) throw new Error('Khong tim thay sheet: ' + TC_SHEET);
  if (typeof parseMocoThuChiAuditSheet_ !== 'function' || typeof writeMocoReconciledThuChi_ !== 'function') {
    throw new Error('Thieu helper parse/write Thu Chi reconciliation.');
  }

  const parsed = parseMocoThuChiAuditSheet_(tcSheet);
  const baseOpeningBalance = parsed.summary && Number(parsed.summary.openingBalance || 0)
    ? Number(parsed.summary.openingBalance || 0)
    : parseAmount_(tcSheet.getRange(2, 18).getDisplayValue());
  const backupName = createThuChiBackup_(ss, tcSheet);

  const currentRows = parsed.rows || [];
  const capitalThuRows = currentRows.filter(row => Number(row.thu || 0) > 0 && isThuChiCapitalLike_(row));
  const openingBalance = baseOpeningBalance + capitalThuRows.reduce((sum, row) => sum + Number(row.thu || 0), 0);
  const autoLikeThuRows = currentRows.filter(row => Number(row.thu || 0) > 0 && isThuChiOrderRevenueLike_(row));
  const manualThuRows = currentRows
    .filter(row => Number(row.thu || 0) > 0 && !isThuChiOrderRevenueLike_(row) && !isThuChiCapitalLike_(row))
    .map(row => buildThuChiRepairRow_(row, row.source || 'Founder copy', row.ref || 'MANUAL_ROW_' + row.row));
  const chiRows = currentRows
    .filter(row => Number(row.chi || 0) > 0)
    .map(row => buildThuChiRepairRow_(row, row.source || 'Founder copy', row.ref || 'CHI_ROW_' + row.row));

  const orderRows = buildPaidOrderThuRowsForRepair_(orderSheet);
  const combined = manualThuRows.concat(orderRows).concat(chiRows);
  combined.sort((a, b) => {
    const ad = tcDateSortVal_(a.date);
    const bd = tcDateSortVal_(b.date);
    if (ad !== bd) return ad - bd;
    if (a.source !== b.source) return a.source === 'Founder copy' ? -1 : 1;
    const ao = tcOrderSortValue_(a.ref || a.desc);
    const bo = tcOrderSortValue_(b.ref || b.desc);
    if (ao !== bo) return ao - bo;
    return String(a.ref || '').localeCompare(String(b.ref || ''));
  });

  writeMocoReconciledThuChi_(tcSheet, combined, openingBalance);
  return {
    backupSheet: backupName,
    movedCapitalRowsToOpeningBalance: capitalThuRows.length,
    removedOrderRevenueRows: autoLikeThuRows.length,
    keptManualThuRows: manualThuRows.length,
    rebuiltOrderRows: orderRows.length,
    keptChiRows: chiRows.length,
    openingBalance,
    totalThuAfterRepair: manualThuRows.concat(orderRows).reduce((sum, row) => sum + Number(row.thu || 0), 0),
    totalChiAfterRepair: chiRows.reduce((sum, row) => sum + Number(row.chi || 0), 0),
    sampleOrderRefs: orderRows.slice(0, 10).map(row => row.ref),
  };
}

function buildThuChiRepairRow_(row, source, ref) {
  return {
    date: normalizeThuChiDateForCell_(row.date),
    group: row.group || (Number(row.thu || 0) > 0 ? 'Thu khác' : 'Chi khác'),
    desc: row.desc || '',
    thu: Number(row.thu || 0),
    chi: Number(row.chi || 0),
    source,
    ref: ref || row.marker || '',
    marker: row.marker || '',
    row: row.row || 0,
  };
}

function buildPaidOrderThuRowsForRepair_(orderSheet) {
  const lastRow = orderSheet.getLastRow();
  if (lastRow < 2) return [];
  const lastCol = Math.max(orderSheet.getLastColumn(), 19);
  const headers = orderSheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const data = orderSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const orders = parseOrders_(data, headers);
  const seen = {};
  const rows = [];
  orders.forEach(order => {
    const status = normalizeThuChiText_(order.status || '');
    if (status !== 'done' && status !== 'da nhan tien') return;
    const orderKey = normalizeTcOrderId_(order.stt);
    if (!orderKey || seen[orderKey]) return;
    seen[orderKey] = true;
    const amount = Number(order.totalAfterDiscount || order.totalBeforeDiscount || 0);
    if (amount <= 0) return;
    const marker = canonicalTcMarker_(orderKey);
    rows.push({
      date: normalizeThuChiDateForCell_(order.deliveryDate || order.orderDate || ''),
      group: 'Đơn hàng',
      desc: buildThuDesc_(orderKey, order.customer),
      thu: amount,
      chi: 0,
      source: 'Đơn hàng sync',
      ref: marker,
      marker,
      row: 0,
    });
  });
  return rows;
}

function isThuChiOrderRevenueLike_(row) {
  if (!row) return false;
  if (row.marker || extractTcMarker_(row.ref)) return true;
  const key = normalizeThuChiText_([row.group, row.desc, row.source, row.ref].join(' '));
  return Number(row.thu || 0) > 0 && Number(row.chi || 0) === 0 && (
    key.indexOf('don hang sync') >= 0 ||
    key.indexOf('don hang') >= 0 ||
    /^don\s+\S+/.test(key) ||
    key.indexOf('khach dat hang') >= 0
  );
}

function isThuChiCapitalLike_(row) {
  if (!row) return false;
  const key = normalizeThuChiText_([row.group, row.desc, row.source, row.ref].join(' '));
  return Number(row.thu || 0) > 0 && Number(row.chi || 0) === 0 && (
    key.indexOf('von') >= 0 ||
    key.indexOf('dau ky') >= 0 ||
    key.indexOf('dau tu ban dau') >= 0
  );
}

function tcOrderSortValue_(value) {
  const marker = extractTcMarker_(value);
  const raw = marker || String(value || '');
  const match = raw.match(/(?:AUTO-DON-|#)\s*(\d+)/i);
  return match ? Number(match[1]) : 999999;
}

function onEditThuChi_(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== ORDER_SHEET) return;

  const col = e.range.getColumn();
  const lastCol = Math.max(sheet.getLastColumn(), 13);
  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const headerMap = getOrderHeaderMap_(headers);
  const isStandard = headerMap.orderId >= 0 && headerMap.paymentStatus >= 0;
  if (isStandard) {
    if (col !== headerMap.paymentStatus + 1) return;
    const newValue = normalizeThuChiText_(e.value || '');
    if (newValue !== 'da nhan tien') return;
    MOCO_BACKFILL_THU();
    return;
  }

  // Legacy layout: cột G = status/thời gian giao
  if (col !== 7) return;

  const newValue = String(e.value || '').toLowerCase().trim();
  if (newValue !== 'done' && newValue !== 'đã nhận tiền') return;

  const row = e.range.getRow();
  if (row < 2) return;

  // Lấy thông tin đơn hàng
  const orderRow = sheet.getRange(row, 1, 1, 13).getValues()[0];
  const stt = String(orderRow[0] || '').trim();
  if (!stt) return;

  const customer = String(orderRow[1] || '').trim();
  const totalAfterCK = parseAmount_(orderRow[12]); // Cột M: Giá sau CK
  const totalBeforeCK = parseAmount_(orderRow[10]); // Cột K: Thành tiền
  const amount = totalAfterCK || totalBeforeCK;
  if (amount <= 0) return;

  // Kiểm tra đã ghi chưa
  const ss = getMocoSpreadsheet_();
  const tcSheet = ss.getSheetByName(TC_SHEET);
  if (!tcSheet) return;

  const marker = canonicalTcMarker_(stt);
  if (collectExistingMarkers_(tcSheet).has(marker)) return; // đã ghi

  // Ghi THU
  const date = orderRow[5] || orderRow[4] || new Date(); // Ngày giao hoặc ngày đặt
  const desc = buildThuDesc_(stt, customer);
  appendThuChiIncomeRows_(tcSheet, [{
    date,
    desc,
    amount,
    customer,
    marker,
  }]);
}

function appendThuChiIncomeRows_(sheet, entries) {
  if (!entries || !entries.length) return { inserted: 0, insertRow: 0 };
  ensureThuChiParallelStructure_(sheet);
  const insertRow = findThuTableNextRow_(sheet);
  const lastStt = getLastThuTableStt_(sheet);
  const rows = entries.map((entry, idx) => [
    lastStt + idx + 1,
    normalizeThuChiDateForCell_(entry.date),
    'Đơn hàng',
    entry.desc || '',
    entry.amount || '',
    'Đơn hàng sync',
    entry.marker || '',
  ]);
  sheet.getRange(insertRow, 1, rows.length, 7).setValues(rows);
  sheet.getRange(insertRow, 4, rows.length, 1).setNotes(entries.map(entry => [entry.marker || '']));
  updateThuChiParallelSummary_(sheet);
  applyThuChiUi_(sheet, Math.max(findLastRealDataRow_(sheet) - 2, 1));
  return { inserted: rows.length, insertRow };
}

function ensureThuChiParallelStructure_(sheet) {
  const leftTitle = sheet.getRange(1, 1).getDisplayValue();
  const rightTitle = sheet.getRange(1, 9).getDisplayValue();
  if (leftTitle === 'BẢNG THU' && rightTitle === 'BẢNG CHI') return;
  if (typeof MOCO_RECONCILE_THU_CHI_FROM_COPY === 'function') {
    throw new Error('Sheet THU CHI chưa ở layout song song. Chạy reconcile Thu-Chi trước khi sync đơn mới.');
  }
  throw new Error('Sheet THU CHI chưa ở layout song song.');
}

function findThuTableNextRow_(sheet) {
  const maxRow = Math.max(sheet.getLastRow(), 3);
  const numRows = Math.max(maxRow - 2, 1);
  const display = sheet.getRange(3, 1, numRows, 7).getDisplayValues();
  for (let i = display.length - 1; i >= 0; i--) {
    if (display[i].some(cell => String(cell || '').trim())) return i + 4;
  }
  return 3;
}

function getLastThuTableStt_(sheet) {
  const nextRow = findThuTableNextRow_(sheet);
  if (nextRow <= 3) return 0;
  const values = sheet.getRange(3, 1, nextRow - 3, 1).getValues();
  return values.reduce((max, row) => Math.max(max, Number(row[0]) || 0), 0);
}

function updateThuChiParallelSummary_(sheet) {
  if (sheet.getRange(1, 17).getDisplayValue() !== 'TÓM TẮT') {
    sheet.getRange(1, 17, 1, 2).merge().setValue('TÓM TẮT');
    sheet.getRange(2, 17, 4, 2).setValues([
      ['Số dư đầu kỳ', 0],
      ['Tổng thu', ''],
      ['Tổng chi', ''],
      ['Số dư cuối', ''],
    ]);
  }
  sheet.getRange(3, 18).setFormula('=SUM(E3:E)');
  sheet.getRange(4, 18).setFormula('=SUM(M3:M)');
  sheet.getRange(5, 18).setFormula('=R2+R3-R4');
}

// ─── Parse đơn hàng (multi-row per order) ────────────────────────────────────
function parseOrders_(data, headers) {
  const headerMap = getOrderHeaderMap_(headers || []);
  if (headerMap.orderId >= 0 && headerMap.paymentStatus >= 0) {
    return parseStandardOrders_(data, headerMap);
  }
  return parseLegacyOrders_(data);
}

function parseStandardOrders_(data, headerMap) {
  const byOrder = {};
  const orderIds = [];
  for (const row of data) {
    const orderId = String(row[headerMap.orderId] || '').trim();
    if (!orderId) continue;
    if (!byOrder[orderId]) {
      byOrder[orderId] = {
        stt: orderId,
        customer: String(row[headerMap.customer] || '').trim(),
        orderDate: row[headerMap.orderDate],
        deliveryDate: row[headerMap.deliveryDate],
        status: String(row[headerMap.paymentStatus] || '').trim(),
        totalBeforeDiscount: 0,
        totalAfterDiscount: 0,
        items: [],
      };
      orderIds.push(orderId);
    }
    const order = byOrder[orderId];
    if (!order.customer && headerMap.customer >= 0) order.customer = String(row[headerMap.customer] || '').trim();
    if (!order.status && headerMap.paymentStatus >= 0) order.status = String(row[headerMap.paymentStatus] || '').trim();
    order.totalBeforeDiscount += parseAmount_(row[headerMap.lineTotal]);
    order.totalAfterDiscount += parseAmount_(row[headerMap.revenueAfterDiscount]);
    const itemName = String(row[headerMap.itemName] || '').trim();
    if (itemName) {
      order.items.push({
        name: itemName,
        qty: parseAmount_(row[headerMap.qty]),
        price: parseAmount_(row[headerMap.unitPrice]),
      });
    }
  }
  return orderIds.map(id => byOrder[id]);
}

function parseLegacyOrders_(data) {
  const orders = [];
  let current = null;

  for (const row of data) {
    const stt = String(row[0] || '').trim();

    if (stt && stt !== '') {
      // Dòng đầu của đơn mới
      if (current) orders.push(current);
      current = {
        stt: stt,
        customer: String(row[1] || '').trim(),
        address: String(row[2] || '').trim(),
        phone: String(row[3] || '').trim(),
        orderDate: row[4],
        deliveryDate: row[5],
        status: String(row[6] || '').trim(),
        items: [],
        totalBeforeDiscount: parseAmount_(row[10]),
        discount: String(row[11] || '').trim(),
        totalAfterDiscount: parseAmount_(row[12]),
      };
    }

    // Thêm item (cả dòng đầu lẫn dòng tiếp)
    if (current) {
      const itemName = String(row[7] || '').trim();
      if (itemName) {
        current.items.push({
          name: itemName,
          qty: Number(row[8]) || 0,
          price: parseAmount_(row[9]),
        });
      }
    }
  }

  if (current) orders.push(current);
  return orders;
}

function getOrderHeaderMap_(headers) {
  const normalized = (headers || []).map(value => normalizeThuChiText_(value));
  return {
    orderId: findOrderHeaderIndex_(normalized, ['ma don', 'stt']),
    orderDate: findOrderHeaderIndex_(normalized, ['ngay dat']),
    deliveryDate: findOrderHeaderIndex_(normalized, ['ngay giao']),
    customer: findOrderHeaderIndex_(normalized, ['ten kh', 'khach hang']),
    itemName: findOrderHeaderIndex_(normalized, ['ten banh', 'ten mon', 'tom tat mon']),
    qty: findOrderHeaderIndex_(normalized, ['sl', 'so luong']),
    unitPrice: findOrderHeaderIndex_(normalized, ['don gia', 'gia ban']),
    lineTotal: findOrderHeaderIndex_(normalized, ['thanh tien', 'tong tien mon']),
    revenueAfterDiscount: findOrderHeaderIndex_(normalized, ['doanh thu sau ck', 'gia sau ck']),
    paymentStatus: findOrderHeaderIndex_(normalized, ['tt thanh toan', 'trang thai thanh toan', 'tinh trang thanh toan']),
  };
}

function findOrderHeaderIndex_(headers, candidates) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || '';
    if (candidates.some(candidate => header.indexOf(candidate) >= 0)) return i;
  }
  return -1;
}

function parseAmount_(v) {
  if (typeof v === 'number') return v;
  const t = String(v || '').trim();
  if (!t) return 0;
  const d = t.replace(/[^\d]/g, '');
  return d ? Number(d) : 0;
}

function logResult_(msg) {
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {
    Logger.log(msg);
  }
}

function setBalanceFormulas_(sheet, startRow, numRows) {
  if (numRows <= 0) return;
  const formulas = [];
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    if (row <= 2) {
      formulas.push(['=E' + row + '-F' + row]);
    } else {
      formulas.push(['=G' + (row - 1) + '+E' + row + '-F' + row]);
    }
  }
  sheet.getRange(startRow, 7, numRows, 1).setFormulas(formulas);
}

function readThuChiRows_(sheet) {
  const lastRow = findLastRealDataRow_(sheet);
  if (lastRow < 2) return [];

  const numRows = lastRow - 1;
  const values = sheet.getRange(2, 1, numRows, TC_HEADERS.length).getValues();
  const display = sheet.getRange(2, 1, numRows, TC_HEADERS.length).getDisplayValues();
  const notes = sheet.getRange(2, 4, numRows, 1).getNotes();
  const rows = [];

  for (let i = 0; i < values.length; i++) {
    if (isBlankThuChiRow_(values[i], display[i], notes[i][0])) continue;

    const marker = extractTcMarker_(display[i][3]) || extractTcMarker_(display[i][8]) || extractTcMarker_(notes[i][0]);
    const parsed = {
      originalIndex: i,
      label: String(display[i][0] || values[i][0] || '').trim(),
      date: values[i][1] || display[i][1] || '',
      group: String(display[i][2] || values[i][2] || '').trim(),
      desc: cleanThuChiDesc_(values[i][3] || display[i][3] || '', marker),
      thu: parseAmount_(values[i][4] || display[i][4]),
      chi: parseAmount_(values[i][5] || display[i][5]),
      balance: parseAmount_(values[i][6] || display[i][6]),
      source: String(display[i][7] || values[i][7] || '').trim(),
      ref: String(display[i][8] || values[i][8] || '').trim(),
      marker: marker,
    };
    if (!parsed.date && !parsed.thu && !parsed.chi && !parsed.marker && !isThuChiCapitalRow_(parsed)) continue;
    rows.push(parsed);
  }

  return rows;
}

function isBlankThuChiRow_(row, displayRow, note) {
  const hasValue = displayRow.slice(0, 5).some(cell => String(cell || '').trim() !== '');
  const hasMarkerNote = String(note || '').indexOf(TC_MARKER_PREFIX) >= 0;
  return !hasValue && !hasMarkerNote;
}

function findThuChiCapitalRow_(rows) {
  return rows.find(row => isThuChiCapitalRow_(row)) || {
    thu: TC_CAPITAL_AMOUNT,
    chi: 0,
    balance: TC_OPENING_BALANCE,
  };
}

function isThuChiCapitalRow_(row) {
  const label = normalizeThuChiText_([row.label, row.desc].join(' '));
  if (label.indexOf('von') >= 0 || label.indexOf('dau tu ban dau') >= 0) return true;
  return !row.date && !row.desc && row.thu === TC_CAPITAL_AMOUNT;
}

function classifyThuChiGroup_(row) {
  if (isThuChiCapitalRow_(row)) return 'Vốn';
  if (row.marker || normalizeThuChiText_(row.desc).indexOf('don') === 0) return 'Đơn hàng';
  const key = normalizeThuChiText_(row.desc);
  if (key.indexOf('nvl') >= 0 || key.indexOf('nguyen lieu') >= 0) return 'Mua NVL';
  if (key.indexOf('ccdc') >= 0) return 'CCDC';
  if (key.indexOf('ttb') >= 0 || key.indexOf('thiet bi') >= 0) return 'TTB';
  if (row.chi > 0) return 'Chi khác';
  if (row.thu > 0) return 'Thu khác';
  return 'Khác';
}

function normalizeThuChiText_(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findLastRealDataRow_(sheet) {
  const maxRow = Math.max(sheet.getLastRow(), 3);
  const numRows = Math.max(maxRow - 2, 1);
  const display = sheet.getRange(3, 1, numRows, 15).getDisplayValues();
  const thuNotes = sheet.getRange(3, 4, numRows, 1).getNotes();
  const chiNotes = sheet.getRange(3, 12, numRows, 1).getNotes();

  for (let i = display.length - 1; i >= 0; i--) {
    const hasValue = display[i].some(cell => String(cell || '').trim() !== '');
    const hasMarkerNote = String(thuNotes[i][0] || '').indexOf(TC_MARKER_PREFIX) >= 0 ||
      String(chiNotes[i][0] || '').indexOf(TC_MARKER_PREFIX) >= 0;
    if (hasValue || hasMarkerNote) return i + 3;
  }
  return 2;
}

function collectExistingMarkers_(sheet) {
  const markers = new Set();
  const lastRow = findLastRealDataRow_(sheet);
  if (lastRow < 3) return markers;

  const numRows = lastRow - 2;
  const descs = sheet.getRange(3, 4, numRows, 1).getDisplayValues();
  const refs = sheet.getRange(3, 7, numRows, 1).getDisplayValues();
  const chiDescs = sheet.getRange(3, 12, numRows, 1).getDisplayValues();
  const chiRefs = sheet.getRange(3, 15, numRows, 1).getDisplayValues();
  const notes = sheet.getRange(3, 4, numRows, 1).getNotes();
  const chiNotes = sheet.getRange(3, 12, numRows, 1).getNotes();
  for (let i = 0; i < numRows; i++) {
    const marker = extractTcMarker_(descs[i][0]) ||
      extractTcMarker_(refs[i][0]) ||
      extractTcMarker_(notes[i][0]) ||
      extractTcMarker_(chiDescs[i][0]) ||
      extractTcMarker_(chiRefs[i][0]) ||
      extractTcMarker_(chiNotes[i][0]);
    if (marker) markers.add(marker);
  }
  return markers;
}

function extractTcMarker_(text) {
  const raw = String(text || '');
  const direct = raw.match(/AUTO-(?:DON|ĐƠN)-([^\s)]+)/i);
  if (direct) return canonicalTcMarker_(direct[1]);
  const key = normalizeThuChiText_(raw);
  const normalized = key.match(/auto don ([^\s)]+)/);
  return normalized ? canonicalTcMarker_(normalized[1]) : '';
}

function buildThuDesc_(stt, customer) {
  const name = String(customer || '').trim();
  return 'Đơn #' + normalizeTcOrderId_(stt) + (name ? ' - ' + name : '');
}

function canonicalTcMarker_(orderId) {
  const key = normalizeTcOrderId_(orderId);
  return key ? TC_MARKER_PREFIX + key : '';
}

function normalizeTcOrderId_(orderId) {
  let text = String(orderId || '').trim();
  text = text.replace(/^#/, '').replace(/\.0$/, '');
  return text;
}

function normalizeThuChiDateForCell_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const raw = String(value || '').trim();
  if (!raw) return '';
  const first = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean)[0] || raw;
  const serial = Number(first);
  if (isFinite(serial) && serial > 20000 && serial < 80000) {
    return Utilities.formatDate(new Date(1899, 11, 30 + Math.floor(serial)), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  let m = first.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return [m[1], m[2].padStart(2, '0'), m[3].padStart(2, '0')].join('-');
  m = first.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) {
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return [String(y), m[2].padStart(2, '0'), m[1].padStart(2, '0')].join('-');
  }
  return first;
}

function cleanThuChiDesc_(desc, marker) {
  let text = String(desc || '').trim();
  if (!text) return '';
  if (marker) text = text.replace(marker, '').trim();

  const oldAuto = text.match(/^THU\s*-\s*Đơn\s*#([^\s(]+)\s*(?:\(([^)]+)\))?/i);
  if (oldAuto) {
    return buildThuDesc_(oldAuto[1], oldAuto[2] || '');
  }

  return text.replace(/\s{2,}/g, ' ');
}

function setThuChiMarkerNotes_(sheet, startRow, markers) {
  if (!markers.length) return;
  const notes = markers.map(marker => [marker ? marker : '']);
  sheet.getRange(startRow, 4, markers.length, 1).setNotes(notes);
}

function setupThuChiHeader_(sheet) {
  sheet.getRange(1, 1, 1, TC_HEADERS.length)
    .setValues([TC_HEADERS])
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#1F4E79')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 38);
}

function applyThuChiUi_(sheet, dataRows) {
  if (sheet.getRange(1, 1).getDisplayValue() === 'BẢNG THU' &&
      sheet.getRange(1, 9).getDisplayValue() === 'BẢNG CHI' &&
      typeof applyMocoThuChiScientificUi_ === 'function') {
    const openingBalance = parseAmount_(sheet.getRange(2, 18).getDisplayValue());
    applyMocoThuChiScientificUi_(sheet, Math.max(dataRows, 1), openingBalance);
    return;
  }
  setupThuChiHeader_(sheet);

  const rows = Math.max(dataRows, 1);
  const uiCols = TC_HEADERS.length;
  const body = sheet.getRange(2, 1, rows, uiCols);
  body
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(1, 64);
  sheet.setColumnWidth(2, 116);
  sheet.setColumnWidth(3, 128);
  sheet.setColumnWidth(4, 320);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 130);
  sheet.setColumnWidth(9, 120);
  sheet.getRange(2, 8, rows, 2).setHorizontalAlignment('center').setFontColor('#5F6368');

  sheet.getRange(2, 1, rows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 2, rows, 1).setNumberFormat('dd/mm/yyyy').setHorizontalAlignment('center');
  sheet.getRange(2, 3, rows, 1).setHorizontalAlignment('center').setFontColor('#5F6368');
  sheet.getRange(2, 4, rows, 1).setWrap(true).setHorizontalAlignment('left');
  sheet.getRange(2, 5, rows, 3).setNumberFormat('#,##0').setHorizontalAlignment('right');
  const formatRows = Math.max(Math.min(Math.max(rows, 200), sheet.getMaxRows() - 1), 1);
  sheet.getRange(2, 4, formatRows, 1).clearDataValidations();

  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(1, 1, rows + 1, uiCols).createFilter();

  const rules = [];
  const fullRange = sheet.getRange(2, 1, formatRows, uiCols);
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$E2>0')
      .setBackground('#E8F5E9')
      .setRanges([fullRange])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$F2>0')
      .setBackground('#FFF8E1')
      .setRanges([fullRange])
      .build()
  );
  sheet.setConditionalFormatRules(rules);
}

function createThuChiBackup_(ss, sheet) {
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const name = uniqueSheetName_(ss, 'BACKUP_THU_CHI_' + stamp);
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function uniqueSheetName_(ss, baseName) {
  let name = baseName;
  let n = 2;
  while (ss.getSheetByName(name)) {
    name = baseName + '_' + n;
    n++;
  }
  return name;
}

function tcDateSortVal_(v) {
  if (v instanceof Date && !isNaN(v)) return v.getTime();
  const t = String(v || '').trim();
  const m = t.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/);
  if (!m) return 9999999999999;
  let y = m[3] ? Number(m[3]) : new Date().getFullYear();
  if (y < 100) y += 2000;
  return new Date(y, Number(m[2]) - 1, Number(m[1])).getTime();
}
