/**
 * MOCO Kitchen - Cost from recipe
 * Version: v2026.05.14.00
 *
 * Source of truth:
 * - "CÔNG THỨC": recipe ingredients and quantities.
 * - "Master NVL": latest normalized unit prices.
 * - Right-side price table in "CÔNG THỨC": temporary prices entered by Duyên.
 * - "COST DỰ KIẾN": only non-ingredient context such as finished batch output, packaging notes, price hints.
 */

const MOCO_COST_RECIPE_SHEET = 'CÔNG THỨC';
const MOCO_COST_MASTER_SHEET = 'Master NVL';
const MOCO_COST_LEGACY_SHEET = 'COST DỰ KIẾN';
const MOCO_COST_OUTPUT_SHEET = 'COST CALC';
const MOCO_COST_REVIEW_SHEET = 'COST REVIEW';
const MOCO_COST_ACTION_SHEET = 'COST ACTION';
const MOCO_COST_FLOW_SHEET = 'COST FLOW';
const MOCO_GUIDE_SHEET = 'HƯỚNG DẪN';
const MOCO_HOME_SHEET = 'HOME';
const MOCO_MENU_ONLINE_SHEET = 'MENU & GIÁ';
const MOCO_ORDER_ONLINE_SHEET = 'ORDER TMP';
const MOCO_CUSTOMER_ORDER_SHEET = 'ĐƠN HÀNG';
const MOCO_PRICING_DASHBOARD_SHEET = 'COST & GIÁ';
const MOCO_FOUNDER_ACTION_SHEET = 'VIỆC CẦN LÀM';
const MOCO_YIELD_MAP_SHEET = 'THÀNH PHẨM/MẺ';
const MOCO_COST_CONFIG_SHEET = 'COST CFG';
const MOCO_COST_BOM_MAP_SHEET = 'BOM MAP';
const MOCO_COST_SUB_RECIPE_MAP_SHEET = 'RECIPE MAP';
const MOCO_FINANCE_NOTES_SHEET = 'Tài chính';
const MOCO_LEGACY_MENU_SHEET = 'Menu';
const MOCO_DATA_VALIDATION_SHEET = 'DATA VALIDATION';
const MOCO_DATA_VALIDATION_SCHEMA_VERSION = '2026.05.14.00';

function MOCO_BUILD_COST_FROM_RECIPE() {
  const ss = getMocoSpreadsheet_();
  const recipeSheet = ss.getSheetByName(MOCO_COST_RECIPE_SHEET);
  const masterSheet = ss.getSheetByName(MOCO_COST_MASTER_SHEET);
  if (!recipeSheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_RECIPE_SHEET);
  if (!masterSheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_MASTER_SHEET);

  const master = buildMocoCostMasterMap_(masterSheet);
  const reviewOverrides = buildMocoCostReviewOverrideMap_(ss.getSheetByName(MOCO_COST_REVIEW_SHEET), master);
  const legacyMeta = buildMocoLegacyCostMeta_(ss.getSheetByName(MOCO_COST_LEGACY_SHEET));
  const recipeData = recipeSheet.getDataRange().getValues();
  const recipePriceOverrides = buildMocoRecipeSidePriceMap_(recipeData);
  const firstPass = buildMocoCostRowsFromRecipeData_(recipeData, master, reviewOverrides, recipePriceOverrides, legacyMeta, {});
  const subRecipeMaster = buildMocoSubRecipeCostMasterFromSummaries_(firstPass.summaryRows);
  const finalPass = buildMocoCostRowsFromRecipeData_(recipeData, master, reviewOverrides, recipePriceOverrides, legacyMeta, subRecipeMaster);

  writeMocoCostOutput_(ss, mocoSummaryObjectsToRows_(finalPass.summaryRows), finalPass.detailRows);
  try {
    SpreadsheetApp.getUi().alert('Đã tạo sheet "' + MOCO_COST_OUTPUT_SHEET + '" từ CÔNG THỨC.');
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
}

function buildMocoCostRowsFromRecipeData_(recipeData, master, reviewOverrides, recipePriceOverrides, legacyMeta, subRecipeMaster) {
  const recipeYieldLookup = buildMocoRecipeYieldLookup_(recipeData);
  const detailRows = [];
  const summaryMap = {};
  let currentCake = '';
  let currentYield = '';

  for (let i = 1; i < recipeData.length; i++) {
    const row = recipeData[i];
    if (row[0]) {
      currentCake = String(row[0]).trim();
      currentYield = '';
    }
    if (!currentCake) continue;

    const ingredient = String(row[1] || '').trim();
    const rawQty = String(row[2] || '').trim();
    const yieldCandidates = getMocoYieldCandidatesFromRecipeRow_(row);
    yieldCandidates.forEach(yieldText => {
      if (isMocoBetterYieldText_(yieldText, currentYield)) currentYield = yieldText;
    });
    if (!ingredient || isMocoCostTotalRow_(ingredient)) continue;

    if (!summaryMap[currentCake]) {
      summaryMap[currentCake] = {
        cake: currentCake,
        total: 0,
        okRows: 0,
        issueRows: 0,
        yieldText: recipeYieldLookup[normMocoCostText_(currentCake)] || '',
        notes: legacyMeta[normMocoCostText_(currentCake)] || '',
      };
    }
    if (currentYield && !summaryMap[currentCake].yieldText) {
      summaryMap[currentCake].yieldText = currentYield;
    }

    const qty = parseMocoRecipeQty_(rawQty);
    const key = normMocoCostText_(ingredient);
    const match = findMocoSubRecipeCostItem_(subRecipeMaster, ingredient, currentCake) || findMocoMasterItem_(master, ingredient);
    const override = match && match.source === 'Công thức con'
      ? null
      : chooseMocoCostOverride_(reviewOverrides[key] || null, recipePriceOverrides[key] || null);
    const effectiveMatch = applyMocoCostOverride_(qty, match, override, ingredient);
    const calc = calcMocoLineCost_(qty, effectiveMatch);
    const hasOverridePrice = override && isMocoCostNumeric_(override.price);
    const hasLineCost = isMocoCostValue_(calc.cost);
    const displayStatus = hasOverridePrice && hasLineCost ? 'OK_TEMP_PRICE' : calc.status;
    const displayNote = hasOverridePrice
      ? joinMocoCostNotes_([calc.note, 'Dùng giá tạm từ ' + (override.source || 'COST REVIEW') + ': ' + (override.note || 'cần thay bằng giá nhập thật')])
      : calc.note;
    if (hasLineCost) {
      summaryMap[currentCake].total += calc.cost;
      summaryMap[currentCake].okRows += 1;
    } else {
      summaryMap[currentCake].issueRows += 1;
    }

    detailRows.push([
      currentCake,
      ingredient,
      rawQty,
      qty.amount || '',
      qty.unit || '',
      effectiveMatch ? effectiveMatch.name : '',
      effectiveMatch ? effectiveMatch.unit : '',
      effectiveMatch && isMocoCostNumeric_(effectiveMatch.price) ? effectiveMatch.price : '',
      hasLineCost ? calc.cost : '',
      displayStatus,
      displayNote,
    ]);
  }

  const summaryRows = Object.values(summaryMap).map(item => ({
    cake: item.cake,
    total: Math.round(item.total),
    okRows: item.okRows,
    issueRows: item.issueRows,
    yieldText: item.yieldText,
    notes: item.notes,
  }));
  return { summaryRows, detailRows };
}

function buildMocoRecipeYieldLookup_(recipeData) {
  const out = {};
  let currentCake = '';
  (recipeData || []).forEach((row, index) => {
    if (index === 0) return;
    if (row[0]) currentCake = String(row[0]).trim();
    if (!currentCake) return;
    const key = normMocoCostText_(currentCake);
    getMocoYieldCandidatesFromRecipeRow_(row).forEach(text => {
      if (isMocoBetterYieldText_(text, out[key] || '')) out[key] = text;
    });
  });
  return out;
}

function getMocoYieldCandidatesFromRecipeRow_(row) {
  const candidates = [];
  const maxCols = Math.min((row || []).length, 12);
  for (let col = 3; col < maxCols; col++) {
    const text = String(row[col] || '').trim();
    if (!text) continue;
    if (isMocoYieldCandidateText_(text, col)) candidates.push(text);
    const combined = [
      String(row[col - 1] || '').trim(),
      text,
      String(row[col + 1] || '').trim(),
      String(row[col + 2] || '').trim(),
    ].filter(Boolean).join(' ');
    const combinedKey = normMocoCostText_(combined);
    const combinedHasYieldLabel = combinedKey.indexOf('thanh pham') >= 0
      || combinedKey.indexOf('yield') >= 0
      || combinedKey.indexOf('ra duoc') >= 0
      || combinedKey.indexOf('duoc khoang') >= 0;
    if (combinedHasYieldLabel && isMocoYieldCandidateText_(combined, col)) candidates.push(combined);
  }
  return candidates;
}

function isMocoYieldCandidateText_(text, colIndex) {
  const key = normMocoCostText_(text);
  if (!key || !/\d/.test(String(text || ''))) return false;
  if (/\d+(?:[.,]\d+)?\s*(?:°|độ|do|p|phút|phut)\b/i.test(String(text || ''))) return false;
  if (key.indexOf('toc do') >= 0 || key.indexOf('lua') >= 0 || key.indexOf('dun') >= 0) return false;
  const hasExplicitOutputUnit = /\d+(?:[.,]\d+)?\s*(g|gram|kg|ml|l|lít|lit|chiếc|chiec|cái|cai|hộp|hop|phần|phan|bánh|banh|ổ|o|cuộn|cuon)\b/i.test(String(text || ''));
  if (isMocoPerUnitWeightText_(text)) return false;
  const hasYieldWords = key.indexOf('thanh pham') >= 0
    || key.indexOf('ct ') >= 0
    || key.indexOf('cong thuc') >= 0
    || key.indexOf('sau khi') >= 0
    || key.indexOf('ra duoc') >= 0
    || key.indexOf('duoc khoang') >= 0
    || key.indexOf('ra ') >= 0
    || key.indexOf('me ') >= 0
    || key.indexOf('moi chiec') >= 0
    || key.indexOf('moi hop') >= 0;
  if (hasYieldWords && hasExplicitOutputUnit) return true;
  if (colIndex === 4 && /^\s*\d+(?:[.,]\d+)?\s*(g|gram|kg|ml|l|chiếc|chiec|cái|cai|hộp|hop|phần|phan|bánh|banh|ổ|o|cuộn|cuon)\b/i.test(String(text || ''))) {
    return true;
  }
  return false;
}

function isMocoPerUnitWeightText_(text) {
  const key = normMocoCostText_(text);
  const raw = String(text || '');
  const hasPerUnitWord = key.indexOf('moi chiec') >= 0
    || key.indexOf('moi cai') >= 0
    || key.indexOf('moi hop') >= 0
    || key.indexOf('moi banh') >= 0
    || key.indexOf('moi phan') >= 0
    || key.indexOf('moi cuon') >= 0;
  if (!hasPerUnitWord) return false;
  const hasMassUnit = /\d+(?:[.,]\d+)?\s*(g|gram|kg|ml|l|lít|lit)\b/i.test(raw);
  if (!hasMassUnit) return false;
  const hasBatchYieldWord = key.indexOf('thanh pham') >= 0
    || key.indexOf('me ') >= 0
    || key.indexOf('ct ') >= 0
    || key.indexOf('cong thuc') >= 0
    || key.indexOf('ra duoc') >= 0
    || key.indexOf('duoc khoang') >= 0
    || key.indexOf('sau khi') >= 0;
  return !hasBatchYieldWord;
}

function buildMocoSubRecipeCostMasterFromSummaries_(summaryRows) {
  const out = {};
  (summaryRows || []).forEach(summary => {
    if (!summary || !summary.cake) return;
    const key = normMocoCostText_(summary.cake);
    const aliasKeys = getMocoSubRecipeAliasKeys_(summary.cake);
    if (!aliasKeys.length && isMocoSellableRecipeName_(summary.cake)) return;
    const yieldInfo = parseMocoYieldUnits_(summary.yieldText || summary.notes);
    if (!yieldInfo.units || !yieldInfo.unit || !summary.total) return;
    const price = summary.total / yieldInfo.units;
    const item = {
      name: summary.cake,
      key,
      aliases: aliasKeys,
      unit: yieldInfo.unit,
      price,
      source: 'Công thức con',
    };
    [key].concat(aliasKeys).forEach(alias => {
      if (alias) out[alias] = item;
    });
  });
  return out;
}

function isMocoBetterYieldText_(candidate, current) {
  const candidateKey = normMocoCostText_(candidate);
  const currentKey = normMocoCostText_(current);
  if (!currentKey) return true;
  const candidateHasNumber = /\d/.test(String(candidate || ''));
  const currentHasNumber = /\d/.test(String(current || ''));
  if (candidateHasNumber && !currentHasNumber) return true;
  const candidateRank = getMocoYieldTextRank_(candidate);
  const currentRank = getMocoYieldTextRank_(current);
  if (candidateRank !== currentRank) return candidateRank > currentRank;
  const candidateLooksFinished = candidateKey.indexOf('thanh pham') >= 0 || candidateKey.indexOf('khoang') >= 0 || candidateKey.indexOf('duoc') >= 0;
  const currentLooksFinished = currentKey.indexOf('thanh pham') >= 0 || currentKey.indexOf('khoang') >= 0 || currentKey.indexOf('duoc') >= 0;
  if (candidateHasNumber && candidateLooksFinished && !currentLooksFinished) return true;
  return false;
}

function getMocoYieldTextRank_(text) {
  if (!text) return 0;
  const parsed = parseMocoYieldUnits_(text);
  const unit = parsed.unit || '';
  const key = normMocoCostText_(text);
  const countUnits = ['chiếc', 'hộp', 'bánh', 'ổ', 'cuộn', 'phần'];
  let rank = 1;
  if (countUnits.indexOf(unit) >= 0) rank += 40;
  if (unit === 'g' || unit === 'ml') rank += 10;
  if (key.indexOf('thanh pham') >= 0 || key.indexOf('me ') >= 0 || key.indexOf('ct ') >= 0 || key.indexOf('cong thuc') >= 0) rank += 20;
  if (key.indexOf('ra duoc') >= 0 || key.indexOf('duoc khoang') >= 0 || key.indexOf('sau khi') >= 0) rank += 10;
  if (isMocoPerUnitWeightText_(text)) rank -= 50;
  return rank;
}

function getMocoSubRecipeAliasKeys_(recipeName) {
  const key = normMocoCostText_(recipeName);
  const aliases = [];
  if (key.indexOf('banh quy hanh nhan') >= 0) {
    aliases.push('banh quy hanh nhan', 'banh quy hanh nhan gion');
  }
  if (key.indexOf('lady finger hanh nhan') >= 0) {
    aliases.push('lady finger', 'lady finger hanh nhan');
  }
  if (key.indexOf('sua chua hy lap') >= 0) {
    aliases.push('sua chua hy lap', 'sua chua hy lap tu lam');
  }
  if (key.indexOf('cot bong lan') >= 0) {
    aliases.push('cot bong lan');
  }
  if (key.indexOf('kem trung') >= 0) {
    aliases.push('kem trung');
  }
  if (key.indexOf('sot kem pho mai') >= 0) {
    aliases.push('sot kem pho mai');
  }
  return aliases.filter((value, index, array) => value && array.indexOf(value) === index);
}

function findMocoSubRecipeCostItem_(subRecipeMaster, ingredient, currentCake) {
  const key = normMocoCostText_(ingredient);
  if (!key || !subRecipeMaster) return null;
  const currentCakeKey = normMocoCostText_(currentCake);
  const direct = subRecipeMaster[key] || null;
  if (direct && direct.key !== currentCakeKey) return direct;
  const candidates = Object.keys(subRecipeMaster)
    .filter(alias => alias.length >= 5 && (key.indexOf(alias) >= 0 || alias.indexOf(key) >= 0))
    .map(alias => subRecipeMaster[alias])
    .filter(item => item && item.key !== currentCakeKey);
  return candidates[0] || null;
}

function mocoSummaryObjectsToRows_(summaryRows) {
  return (summaryRows || []).map(item => [
    item.cake,
    item.total,
    item.okRows,
    item.issueRows,
    item.yieldText,
    item.notes,
  ]);
}

function MOCO_GENERATE_COST_REVIEW() {
  MOCO_BUILD_COST_FROM_RECIPE();

  const ss = getMocoSpreadsheet_();
  const costSheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  const masterSheet = ss.getSheetByName(MOCO_COST_MASTER_SHEET);
  if (!costSheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_OUTPUT_SHEET);
  if (!masterSheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_MASTER_SHEET);

  const master = buildMocoCostMasterMap_(masterSheet);
  const values = costSheet.getDataRange().getValues();
  const detailHeaderIndex = values.findIndex(row => row[0] === 'Tên bánh' && row[9] === 'Trạng thái');
  if (detailHeaderIndex < 0) throw new Error('Không tìm thấy bảng chi tiết trong ' + MOCO_COST_OUTPUT_SHEET);

  const issueMap = {};
  for (let i = detailHeaderIndex + 1; i < values.length; i++) {
    const row = values[i];
    const status = String(row[9] || '').trim();
    if (!status || status.indexOf('OK') === 0) continue;

    const ingredient = String(row[1] || '').trim();
    if (!ingredient) continue;
    const key = normMocoCostText_(ingredient) + '|' + status;
    if (!issueMap[key]) {
      issueMap[key] = {
        status,
        ingredient,
        count: 0,
        cakes: new Set(),
        sampleQty: String(row[2] || '').trim(),
        sampleUnit: String(row[4] || '').trim(),
        currentMatch: String(row[5] || '').trim(),
        masterUnit: String(row[6] || '').trim(),
        masterPrice: row[7] || '',
        note: String(row[10] || '').trim(),
      };
    }
    issueMap[key].count += 1;
    issueMap[key].cakes.add(String(row[0] || '').trim());
  }

  const rows = Object.values(issueMap)
    .map(item => {
      const suggestion = buildMocoFounderSuggestion_(item, master);
      return [
        suggestion.priority,
        suggestion.action,
        item.ingredient,
        [...item.cakes].slice(0, 5).join(', '),
        item.sampleQty,
        suggestion.fillThis,
        suggestion.reason,
        suggestion.defaultNvl,
        '',
        '',
        item.status,
        item.currentMatch,
        item.masterUnit,
        item.masterPrice,
      ];
    })
    .sort((a, b) => {
      const pa = getMocoCostPriorityRank_(a[10]);
      const pb = getMocoCostPriorityRank_(b[10]);
      if (pa !== pb) return pa - pb;
      return String(a[2]).localeCompare(String(b[2]), 'vi');
    });

  let review = ss.getSheetByName(MOCO_COST_REVIEW_SHEET);
  if (!review) review = ss.insertSheet(MOCO_COST_REVIEW_SHEET);
  review.clear().clearFormats();
  review.showColumns(1, review.getMaxColumns());

  review.getRange(1, 1, 1, 14).merge()
    .setValue('REVIEW COST - chỉ cần điền cột H hoặc I')
    .setFontWeight('bold')
    .setFontSize(14)
    .setBackground('#0B8043')
    .setFontColor('#FFFFFF');
  review.getRange(2, 1, 1, 14).merge()
    .setValue('Xử lý từ trên xuống. Nếu cột F gợi ý tên nguyên liệu chuẩn thì chọn/copy vào cột H. Nếu chưa có giá chuẩn thì điền giá quy về 1 đơn vị ở cột I, ví dụ giá/kg chia 1000 để ra giá/g.')
    .setBackground('#E6F4EA')
    .setFontColor('#174EA6')
    .setWrap(true);

  const headers = [[
    'Ưu tiên',
    'Việc cần làm',
    'Nguyên liệu trong CÔNG THỨC',
    'Bánh liên quan',
    'Định lượng mẫu',
    'Gợi ý điền ngay',
    'Vì sao',
    'Tôi chọn nguyên liệu này',
    'Giá tạm / 1 đơn vị',
    'Ghi chú của tôi',
    'Trạng thái kỹ thuật',
    'Nguyên liệu đang khớp',
    'Đơn vị chuẩn',
    'Đơn giá Master',
  ]];
  review.getRange(4, 1, 1, headers[0].length).setValues(headers)
    .setFontWeight('bold').setBackground('#B3261E').setFontColor('#FFFFFF');
  if (rows.length) {
    review.getRange(5, 1, rows.length, headers[0].length).setValues(rows);
    review.getRange(5, 9, rows.length, 1).setNumberFormat('#,##0.00 [$đ-42A]');
    review.getRange(5, 14, rows.length, 1).setNumberFormat('#,##0.00 [$đ-42A]');
    const masterLastRow = Math.max(masterSheet.getLastRow(), 2);
    const nvlRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(masterSheet.getRange(2, 2, masterLastRow - 1, 1), true)
      .setAllowInvalid(true)
      .build();
    review.getRange(5, 8, rows.length, 1).setDataValidation(nvlRule).setBackground('#FFF8E1');
    review.getRange(5, 9, rows.length, 1).setBackground('#FFF8E1');
  }

  review.setFrozenRows(4);
  review.setColumnWidths(1, headers[0].length, 140);
  review.setColumnWidth(2, 170);
  review.setColumnWidth(3, 220);
  review.setColumnWidth(4, 260);
  review.setColumnWidth(6, 360);
  review.setColumnWidth(7, 330);
  review.setColumnWidth(8, 240);
  review.setColumnWidth(10, 220);
  review.getRange(1, 1, Math.max(review.getLastRow(), 1), headers[0].length)
    .setVerticalAlignment('middle')
    .setWrap(true);
  applyMocoCostReviewFormatting_(review, rows.length);
  review.hideColumns(11, 4);

  try {
    SpreadsheetApp.getUi().alert('Đã tạo "' + MOCO_COST_REVIEW_SHEET + '" với ' + rows.length + ' vấn đề cần xử lý.');
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }

  return {
    reviewSheet: MOCO_COST_REVIEW_SHEET,
    issueCount: rows.length,
  };
}

function MOCO_CREATE_COST_ACTION_FLOW() {
  const ss = getMocoSpreadsheet_();
  const reviewSheet = ss.getSheetByName(MOCO_COST_REVIEW_SHEET);
  if (!reviewSheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_REVIEW_SHEET);

  const reviewRows = readMocoCostReviewRows_(reviewSheet);
  writeMocoCostActionSheet_(ss, reviewRows);
  writeMocoCostFlowSheet_(ss);

  try {
    SpreadsheetApp.getUi().alert('Đã tạo "' + MOCO_COST_ACTION_SHEET + '" và "' + MOCO_COST_FLOW_SHEET + '".');
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
  return {
    actionSheet: MOCO_COST_ACTION_SHEET,
    flowSheet: MOCO_COST_FLOW_SHEET,
    actionCount: reviewRows.length,
  };
}

function MOCO_FILL_COST_REVIEW_AI_TEMP_PRICES() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(MOCO_COST_REVIEW_SHEET);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_REVIEW_SHEET);

  const lastRow = sheet.getLastRow();
  if (lastRow < 5) return { updated: 0, skippedFounderNotes: 0, missingSuggestion: 0 };

  const tempPrices = getMocoAiTempPriceMap_();
  const values = sheet.getRange(5, 1, lastRow - 4, 14).getValues();
  const priceUpdates = [];
  const noteUpdates = [];
  let updated = 0;
  let skippedFounderNotes = 0;
  let missingSuggestion = 0;

  values.forEach(row => {
    const ingredient = String(row[2] || '').trim();
    const founderNote = String(row[9] || '').trim();
    const suggestion = tempPrices[normMocoCostText_(ingredient)] || null;
    if (!ingredient) {
      priceUpdates.push(['']);
      noteUpdates.push(['']);
      return;
    }
    if (founderNote) {
      priceUpdates.push([row[8] || '']);
      noteUpdates.push([row[9] || '']);
      skippedFounderNotes += 1;
      return;
    }
    if (!suggestion) {
      priceUpdates.push([row[8] || '']);
      noteUpdates.push(['Giá tham khảo 2026-05-11: chưa có giá tạm đủ tin cậy. Quỳnh/Duyên chỉ cần bổ sung giá nhập thật khi mua.']);
      missingSuggestion += 1;
      return;
    }
    priceUpdates.push([suggestion.price]);
    noteUpdates.push([suggestion.note]);
    updated += 1;
  });

  sheet.getRange(5, 9, priceUpdates.length, 1).setValues(priceUpdates).setNumberFormat('#,##0.00 [$đ-42A]');
  sheet.getRange(5, 10, noteUpdates.length, 1).setValues(noteUpdates).setWrap(true);

  return {
    updated,
    skippedFounderNotes,
    missingSuggestion,
  };
}

function MOCO_APPLY_P3_RECIPE_SIDE_PRICE_UPDATES() {
  const ss = getMocoSpreadsheet_();
  const reviewResult = applyMocoP3ReviewPriceUpdates_(ss);
  const bomResult = applyMocoP3BomAliasUpdates_(ss);
  MOCO_BUILD_COST_FROM_RECIPE();
  return {
    review: reviewResult,
    bomMap: bomResult,
    rebuilt: MOCO_COST_OUTPUT_SHEET,
  };
}

function applyMocoP3ReviewPriceUpdates_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_REVIEW_SHEET);
  if (!sheet || sheet.getLastRow() < 5) return { updated: 0, notedMissing: 0 };

  const decisions = getMocoP3RecipeSideDecisionMap_();
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, 14).getValues();
  let updated = 0;
  let notedMissing = 0;

  values.forEach(row => {
    const ingredient = String(row[2] || '').trim();
    const decision = decisions[normMocoCostText_(ingredient)] || null;
    if (!decision) return;

    if (decision.priceReady) {
      row[7] = decision.nvl;
      row[8] = decision.price;
      row[9] = decision.note;
      row[10] = 'OK_TEMP_PRICE';
      updated += 1;
      return;
    }

    row[7] = decision.nvl || row[7] || '';
    row[8] = '';
    row[9] = decision.note;
    row[10] = decision.status || 'NEEDS_PRICE_REVIEW';
    notedMissing += 1;
  });

  sheet.getRange(5, 1, values.length, 14).setValues(values);
  sheet.getRange(5, 9, values.length, 1).setNumberFormat('#,##0.00 [$đ-42A]');
  sheet.getRange(5, 10, values.length, 1).setWrap(true);
  return { updated, notedMissing };
}

function applyMocoP3BomAliasUpdates_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_BOM_MAP_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { updated: 0, notedMissing: 0 };

  const decisions = getMocoP3RecipeSideDecisionMap_();
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  let updated = 0;
  let notedMissing = 0;

  values.forEach(row => {
    const ingredient = String(row[0] || '').trim();
    const decision = decisions[normMocoCostText_(ingredient)] || null;
    if (!decision) return;

    if (decision.priceReady) {
      row[2] = 'CÔNG THỨC - Duyên';
      row[3] = decision.nvl;
      row[4] = decision.unit;
      row[5] = 'OK_TEMP_PRICE';
      row[6] = 'Không cần làm ngay. Dùng giá tạm từ cột phải CÔNG THỨC: ' + decision.source + '.';
      updated += 1;
      return;
    }

    row[5] = decision.status || row[5] || 'NEEDS_PRICE_REVIEW';
    row[6] = decision.note;
    notedMissing += 1;
  });

  sheet.getRange(2, 1, values.length, 7).setValues(values);
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 7).setWrap(true);
  return { updated, notedMissing };
}

function getMocoP3RecipeSideDecisionMap_() {
  const ready = [
    ['dầu dừa', 'dầu dừa', 50, 'ml', '50.000đ/l'],
    ['baking powder', 'baking powder', 140, 'g', '70.000đ/500g'],
    ['baking soda', 'baking soda', 72.687, 'g', '33.000đ/454g'],
    ['bột mì số 13', 'bột mì số 13', 30, 'g', '30.000đ/kg'],
    ['bột ngô', 'bột ngô', 28, 'g', '14.000đ/500g'],
    ['bột quế', 'bột quế', 240, 'g', '24.000đ/100g'],
    ['bột số 8', 'bột số 8', 30, 'g', '30.000đ/kg'],
    ['bột mì số 8', 'bột số 8', 30, 'g', '30.000đ/kg'],
    ['bơ', 'bơ', 233, 'g', '233.000đ/kg'],
    ['chà bông gà', 'chà bông rong biển', 430, 'g', '43.000đ/100g'],
    ['chà bông rong biển', 'chà bông rong biển', 430, 'g', '43.000đ/100g'],
    ['chocolate chip', 'socola chip', 169, 'g', '169.000đ/kg'],
    ['socola chip', 'socola chip', 169, 'g', '169.000đ/kg'],
    ['đường trehalose', 'đường trehalose', 119, 'g', '119.000đ/kg'],
    ['hạt bí', 'hạt bí', 200, 'g', '40.000đ/200g'],
    ['mascapone', 'mascapone', 250, 'g', '250.000đ/kg'],
    ['mascarpone', 'mascapone', 250, 'g', '250.000đ/kg'],
    ['mè đen', 'mè đen', 0, 'g', 'Free'],
    ['muối', 'muối', 20, 'g', '10.000đ/500g'],
    ['nho khô', 'nho khô', 120, 'g', '60.000đ/500g'],
    ['óc chó', 'óc chó', 250, 'g', '125.000đ/500g'],
    ['rượu rum', 'rượu rum', 178.571, 'ml', '125.000đ/700ml'],
    ['rượu baileys', 'rượu baileys', 750, 'ml', '75.000đ/100ml'],
    ['syrup maple', 'maple syrup', 394.366, 'ml', '140.000đ/355ml'],
    ['maple syrup', 'maple syrup', 394.366, 'ml', '140.000đ/355ml'],
    ['Tinh chất Vani', 'Vani', 466, 'ml', '233.000đ/500ml'],
    ['vani', 'Vani', 466, 'ml', '233.000đ/500ml'],
    ['whipping', 'whipping', 150, 'ml', '150.000đ/l'],
    ['whipping cream', 'whipping', 150, 'ml', '150.000đ/l'],
    ['gelatin', 'gelatin', 3400, 'lá', '17.000đ/5 lá'],
    ['sữa chua không đường', 'sữa chua không đường', 6000, 'hộp', '24.000đ/4 hộp'],
    ['sữa hạt', 'sữa yến mạch', 50, 'ml', '50.000đ/l'],
    ['sữa yến mạch', 'sữa yến mạch', 50, 'ml', '50.000đ/l'],
    ['chanh vàng', 'chanh vàng', 15000, 'quả', '15.000đ/quả'],
  ];
  const missing = [
    ['cà rốt', 'cà rốt', 'Cột phải CÔNG THỨC còn trống giá. Cần bổ sung giá / 1g hoặc hóa đơn nhập thật trước khi tính cost chuẩn.'],
    ['cà rốt bào sợi', 'cà rốt', 'Cột phải CÔNG THỨC chỉ có dòng "cà rốt" nhưng đang trống giá. Cần bổ sung giá / 1g hoặc hóa đơn nhập thật.'],
    ['sữa hy lạp', 'sữa hy lạp', 'Cột phải CÔNG THỨC chưa có giá; đang ghi "Tính cost từ công thức". Cần công thức con hoặc giá mua thật.'],
    ['giấm', 'giấm gạo Trung Thành', 'Có giá 21.000đ/chai nhưng thiếu dung tích chai để quy đổi ra đ/ml. Chưa dùng để tính cost.'],
    ['cốt chanh/ giấm', 'giấm gạo Trung Thành', 'Có giá 21.000đ/chai nhưng thiếu dung tích chai để quy đổi ra đ/ml. Chưa dùng để tính cost.'],
    ['cafe', 'cafe', 'Có giá 90.000đ/18 gói nhưng thiếu quy đổi gói sang lượng dùng trong công thức. Chưa dùng để tính cost.'],
  ];
  const out = {};
  ready.forEach(row => {
    const item = row[0];
    const nvl = row[1];
    const price = row[2];
    const unit = row[3];
    const source = row[4];
    out[normMocoCostText_(item)] = {
      priceReady: true,
      nvl,
      price,
      unit,
      source,
      note: 'Duyên nhập ở cột phải CÔNG THỨC: ' + source + ' => ' + price + 'đ/' + unit + '. Giá tạm để tính cost, cần thay bằng NHẬP HÀNG khi có hóa đơn thật.',
    };
  });
  missing.forEach(row => {
    out[normMocoCostText_(row[0])] = {
      priceReady: false,
      nvl: row[1],
      note: row[2],
      status: 'NEEDS_PRICE_REVIEW',
    };
  });
  return out;
}

function getMocoAiTempPriceMap_() {
  const notePrefix = 'Giá tham khảo 2026-05-11: ';
  const rows = [
    ['dầu dừa', 50, 'Duyên nhập ở cột phải CÔNG THỨC: 50.000đ/l => 50đ/ml; cần thay bằng hóa đơn thật khi mua.'],
    ['bột mì số 13', 30, 'Duyên nhập ở cột phải CÔNG THỨC: 30.000đ/kg => 30đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['bột ngô', 28, 'Duyên nhập ở cột phải CÔNG THỨC: 14.000đ/500g => 28đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['bột quế', 240, 'Duyên nhập ở cột phải CÔNG THỨC: 24.000đ/100g => 240đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['bột số 8', 30, 'bột mì số 8/cake flour 1kg tham khảo ~30.000đ => 30đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['bơ', 233, 'bơ làm bánh 1kg tham khảo ~233.000đ => 233đ/g; cần thay bằng đúng brand/quy cách khi mua.'],
    ['chà bông gà', 430, 'tạm dùng 430đ/g; chú ý nguyên liệu đang gợi ý có thể là chà bông rong biển, cần xác nhận lại khi mua chà bông gà thật.'],
    ['chocolate chip', 169, 'tạm dùng theo giá socola/chocolate chip hiện có ~169đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['đường tảo nhật', 130, 'đường tảo/trehalose Nhật tham khảo ~130.000đ/kg => 130đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['đường trehalose', 119, 'Duyên nhập ở cột phải CÔNG THỨC: 119.000đ/kg => 119đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['hạt bí', 200, 'Duyên nhập ở cột phải CÔNG THỨC: 40.000đ/200g => 200đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['kem trứng', 80, 'AI estimate tạm 80đ/g; chưa đủ chuẩn vì cần công thức con/định lượng kem trứng.'],
    ['lady finger hạnh nhân', 596, 'tạm lấy theo cost công thức con nếu 100g ~59.580đ => 596đ/g; cần xác nhận khối lượng thành phẩm.'],
    ['mascapone', 250, 'Duyên nhập ở cột phải CÔNG THỨC: 250.000đ/kg => 250đ/g; cần thay bằng đúng brand/quy cách khi mua.'],
    ['mascarpone', 250, 'Duyên nhập ở cột phải CÔNG THỨC: 250.000đ/kg => 250đ/g; cần thay bằng đúng brand/quy cách khi mua.'],
    ['mè đen', 0, 'Duyên nhập ở cột phải CÔNG THỨC: Free => 0đ/g; cần xác nhận lại nếu sau này mua thật.'],
    ['muối', 20, 'Duyên nhập ở cột phải CÔNG THỨC: 10.000đ/500g => 20đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['nho khô', 120, 'Duyên nhập ở cột phải CÔNG THỨC: 60.000đ/500g => 120đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['óc chó', 250, 'Duyên nhập ở cột phải CÔNG THỨC: 125.000đ/500g => 250đ/g; cần thay bằng hóa đơn thật khi mua.'],
    ['rượu baileys/ kahlua', 500, 'Kahlua/Baileys tham khảo ~350.000đ/700ml => 500đ/ml; giá thực tế biến động mạnh theo loại chai.'],
    ['rượu rum', 178.571, 'Duyên nhập ở cột phải CÔNG THỨC: 125.000đ/700ml => 178,571đ/ml; cần thay bằng đúng loại mua thật.'],
    ['sốt kem phô mai', 250, 'AI estimate tạm 250đ/g; chưa đủ chuẩn vì cần công thức con/định lượng sốt kem phô mai.'],
    ['syrup maple', 394.366, 'Duyên nhập ở cột phải CÔNG THỨC: 140.000đ/355ml => 394,366đ/ml; tạm coi 1g≈1ml nếu công thức dùng g.'],
    ['Tinh chất Vani', 466, 'Duyên nhập ở cột phải CÔNG THỨC: 233.000đ/500ml => 466đ/ml; cần thay bằng đúng loại mua thật.'],
    ['vani', 466, 'Duyên nhập ở cột phải CÔNG THỨC: 233.000đ/500ml => 466đ/ml; cần thay bằng đúng loại mua thật.'],
    ['vỏ chanh bào', 15000, 'tạm lấy theo chanh vàng ~15.000đ/quả; chỉ đúng nếu định lượng công thức là số quả dùng để lấy vỏ.'],
    ['whipping', 150, 'Duyên nhập ở cột phải CÔNG THỨC: 150.000đ/l => 150đ/ml; tạm coi 1g≈1ml nếu công thức dùng g.'],
    ['whipping cream', 150, 'Duyên nhập ở cột phải CÔNG THỨC: 150.000đ/l => 150đ/ml; tạm coi 1g≈1ml nếu công thức dùng g.'],
    ['gelatin', 3400, 'Duyên nhập ở cột phải CÔNG THỨC: 17.000đ/5 lá => 3.400đ/lá; nếu dùng bột phải đổi lại đơn vị.'],
    ['sữa chua không đường', 6000, 'Duyên nhập ở cột phải CÔNG THỨC: 24.000đ/4 hộp => 6.000đ/hộp; cần thay bằng đúng brand/quy cách khi mua.'],
    ['sữa hạt', 50, 'Alias sang sữa yến mạch theo cột phải CÔNG THỨC: 50.000đ/l => 50đ/ml; cần thay bằng đúng loại mua thật nếu khác.'],
  ];
  return rows.reduce((out, row) => {
    out[normMocoCostText_(row[0])] = { price: row[1], note: notePrefix + row[2] + ' Ghi chú: đây là giá tạm để tính cost, không phải giá nhập thật.' };
    return out;
  }, {});
}

function readMocoCostReviewRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 5) return [];
  const values = sheet.getRange(5, 1, lastRow - 4, 14).getDisplayValues();
  return values
    .filter(row => String(row[2] || '').trim())
    .map((row, index) => ({
      sourceRow: index + 5,
      priority: String(row[0] || '').trim(),
      action: String(row[1] || '').trim(),
      ingredient: String(row[2] || '').trim(),
      cakes: String(row[3] || '').trim(),
      sampleQty: String(row[4] || '').trim(),
      suggestion: String(row[5] || '').trim(),
      reason: String(row[6] || '').trim(),
      founderNvl: String(row[7] || '').trim(),
      founderPrice: String(row[8] || '').trim(),
      founderNote: String(row[9] || '').trim(),
      techStatus: String(row[10] || '').trim(),
      currentMatch: String(row[11] || '').trim(),
      masterUnit: String(row[12] || '').trim(),
      masterPrice: String(row[13] || '').trim(),
    }));
}

function writeMocoCostActionSheet_(ss, reviewRows) {
  let sheet = ss.getSheetByName(MOCO_COST_ACTION_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_COST_ACTION_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  sheet.showColumns(1, Math.max(sheet.getMaxColumns(), 1));

  const visibleHeaders = [
    'Ưu tiên',
    'Nguyên liệu',
    'Dùng cho bánh',
    'Quỳnh/Duyên cần làm',
    'Giá tạm / nguồn',
    'Ghi chú ngắn',
    'Trạng thái',
  ];
  const rows = reviewRows.map(row => {
    const action = classifyMocoFounderAction_(row);
    return [
      action.priority,
      row.ingredient,
      row.cakes,
      action.todo,
      action.currentValue,
      action.shortNote || row.founderNote,
      action.status,
    ];
  });

  sheet.getRange(1, 1, 1, visibleHeaders.length).merge()
    .setValue('COST ACTION')
    .setFontWeight('bold')
    .setFontSize(15)
    .setBackground('#0B8043')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, visibleHeaders.length).merge()
    .setValue('Quỳnh/Duyên chỉ cần nhìn cột "Quỳnh/Duyên cần làm". Giá tham khảo là giá tạm, không phải giá nhập thật.')
    .setBackground('#E6F4EA')
    .setFontColor('#174EA6')
    .setWrap(true);
  sheet.getRange(4, 1, 1, visibleHeaders.length).setValues([visibleHeaders])
    .setFontWeight('bold')
    .setBackground('#1F4E79')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setWrap(true);
  if (rows.length) {
    sheet.getRange(5, 1, rows.length, visibleHeaders.length).setValues(rows);
  }

  sheet.setFrozenRows(4);
  sheet.setColumnWidth(1, 110);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 280);
  sheet.setColumnWidth(4, 420);
  sheet.setColumnWidth(5, 190);
  sheet.setColumnWidth(6, 360);
  sheet.setColumnWidth(7, 170);
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), visibleHeaders.length)
    .setVerticalAlignment('middle')
    .setWrap(true);
  if (rows.length) {
    applyMocoActionFormatting_(sheet, rows.length);
  }
}

function classifyMocoFounderAction_(row) {
  const note = normMocoCostText_(row.founderNote);
  const ingredient = normMocoCostText_(row.ingredient);
  const hasAi = note.indexOf('ai search') >= 0;
  const hasTempPrice = !!row.founderPrice;
  const hasFounderNvl = !!row.founderNvl;
  const isMix = ingredient.indexOf('banh quy hanh nhan') >= 0 && ingredient.indexOf('cosy') >= 0;
  const shortNote = summarizeMocoFounderNote_(row.founderNote);

  if (note.indexOf('su dung dau dua') >= 0) {
    return {
      priority: 'P1',
      problem: 'Founder đã chọn nguyên liệu thay thế',
      todo: 'Không cần điền thêm. Hệ thống sẽ tính dòng này theo dầu dừa đã được ghi chú.',
      currentValue: 'Dầu dừa',
      shortNote,
      status: 'DÙNG DẦU DỪA',
      priceSource: 'Ghi chú Founder',
    };
  }

  if (isMix) {
    return {
      priority: 'P0',
      problem: 'Nguyên liệu mix',
      todo: 'Điền tỷ lệ mix: bánh quy hạnh nhân tự làm bao nhiêu g + bánh Cosy bao nhiêu g = ' + (row.sampleQty || 'tổng mix') + '.',
      currentValue: row.founderPrice || row.founderNvl || 'Cosy có giá tham khảo trong ghi chú',
      shortNote: shortNote || 'Chưa tính cho đến khi có tỷ lệ mix.',
      status: 'CẦN TỶ LỆ MIX',
      priceSource: hasAi ? 'Giá tham khảo' : 'Thiếu tỷ lệ',
    };
  }

  if (note.indexOf('da bo sung o sheet nhap hang') >= 0) {
    return {
      priority: 'P1',
      problem: 'Đã bổ sung vào NHẬP HÀNG',
      todo: 'Không cần nhập thêm. Chạy Refresh lịch sử giá + Cập nhật giá danh mục, rồi tính cost lại.',
      currentValue: row.founderPrice || row.founderNvl || '',
      shortNote,
      status: hasTempPrice ? 'CÓ GIÁ TẠM' : 'CHỜ REFRESH',
      priceSource: hasTempPrice ? 'Founder tạm' : 'NHẬP HÀNG',
    };
  }

  if (hasAi && hasTempPrice) {
    return {
      priority: 'P1',
      problem: 'Chưa có giá nhập thật',
      todo: 'Không cần làm ngay. Hệ thống dùng giá tham khảo để ra cost tạm; khi mua thật thì nhập lại ở NHẬP HÀNG.',
      currentValue: row.founderPrice,
      shortNote,
      status: 'DÙNG GIÁ AI TẠM',
      priceSource: 'Giá tham khảo',
    };
  }

  if (hasTempPrice) {
    return {
      priority: 'P2',
      problem: 'Có giá tạm founder nhập',
      todo: 'Không cần làm ngay. Dùng giá tạm này để ra cost; sau này thay bằng giá nhập thật.',
      currentValue: row.founderPrice,
      shortNote,
      status: 'CÓ GIÁ TẠM',
      priceSource: 'Founder tạm',
    };
  }

  if (hasFounderNvl) {
    return {
      priority: 'P2',
      problem: 'Có nguyên liệu founder chọn',
      todo: 'Kiểm tra tên nguyên liệu này có đúng không. Nếu là món tự làm thì cần công thức con, không đưa vào danh mục hàng mua.',
      currentValue: row.founderNvl,
      shortNote,
      status: 'CÓ NGUYÊN LIỆU CHỌN',
      priceSource: 'Danh mục nguyên liệu / công thức con',
    };
  }

  if (hasAi) {
    return {
      priority: 'P1',
      problem: 'Có ghi chú giá tham khảo nhưng chưa điền giá',
      todo: 'Chỉ cần quyết định có chấp nhận giá tham khảo không. Nếu là mix thì phải có tỷ lệ trước.',
      currentValue: '',
      shortNote,
      status: 'CẦN QUYẾT ĐỊNH',
      priceSource: 'Giá tham khảo',
    };
  }

  return {
    priority: 'P3',
    problem: row.techStatus || 'Cần review',
    todo: 'Cần giá tạm hoặc chọn đúng nguyên liệu. Không dùng gợi ý sai nếu tên không liên quan.',
    currentValue: row.founderNvl || row.founderPrice || row.currentMatch || '',
    shortNote,
    status: 'CẦN XỬ LÝ',
    priceSource: '',
  };
}

function summarizeMocoFounderNote_(note) {
  const text = String(note || '').trim();
  if (!text) return '';
  const firstLine = text.split(/\n/).map(v => v.trim()).filter(Boolean)[0] || text;
  return firstLine.length > 180 ? firstLine.slice(0, 177) + '...' : firstLine;
}

function applyMocoActionFormatting_(sheet, dataRows) {
  const range = sheet.getRange(5, 1, dataRows, 7);
  const values = range.getDisplayValues();
  const backgrounds = values.map(row => {
    const status = row[6];
    const color = status === 'CẦN TỶ LỆ MIX' ? '#FAD2CF'
      : status === 'DÙNG GIÁ AI TẠM' ? '#FEF7E0'
        : status === 'CÓ GIÁ TẠM' ? '#E8F0FE'
          : status === 'CHỜ REFRESH' ? '#FFF8E1'
            : status === 'CÓ NGUYÊN LIỆU CHỌN' ? '#E6F4EA'
              : '#FFFFFF';
    return Array.from({ length: 7 }, () => color);
  });
  range.setBackgrounds(backgrounds);
}

function writeMocoCostFlowSheet_(ss) {
  let sheet = ss.getSheetByName(MOCO_COST_FLOW_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_COST_FLOW_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();

  const rows = [
    ['1. Hệ thống tính cost như thế nào', '', '', '', ''],
    ['Bước', 'Hệ thống làm gì', 'Lấy dữ liệu từ đâu', 'Kết quả ra đâu', 'Nếu sai thì sửa ở đâu'],
    ['1', 'Đọc công thức: tên bánh, nguyên liệu, định lượng, thành phẩm/mẻ.', 'CÔNG THỨC', 'Danh sách nguyên liệu cần tính cho từng món.', 'Sửa tên bánh, nguyên liệu, định lượng hoặc thành phẩm/mẻ trong CÔNG THỨC.'],
    ['2', 'Tìm giá nguyên liệu: ưu tiên giá thật, nếu chưa có thì dùng giá tạm có ghi chú.', 'NHẬP HÀNG, bảng giá tạm bên phải CÔNG THỨC, COST REVIEW', 'Đơn giá quy về 1 g, 1 ml, 1 lá, 1 hộp...', 'Có hóa đơn thì nhập NHẬP HÀNG. Chưa có hóa đơn thì sửa bảng giá tạm hoặc COST REVIEW.'],
    ['3', 'Tính cost mẻ: cộng từng dòng nguyên liệu trong công thức.', 'COST CALC', 'Tổng cost nguyên liệu của 1 mẻ.', 'Nếu thiếu giá/thiếu định lượng, xem VIỆC CẦN LÀM để biết dòng cần sửa.'],
    ['4', 'Tính cost/đơn vị bán: chia cost mẻ cho số lượng thành phẩm bán được.', 'CÔNG THỨC, MENU & GIÁ', 'Cost nguyên liệu / đơn vị bán.', 'Sửa yield/thành phẩm trong CÔNG THỨC hoặc quy cách bán trong MENU & GIÁ.'],
    ['5', 'Gợi ý giá bán: tính nhiều cách để founder chọn hướng hợp lý.', 'COST CFG, MENU & GIÁ, COST & GIÁ', 'Giá theo food cost, giá theo lãi mục tiêu, food cost %, lãi gộp.', 'Sửa target food cost, target lãi, giá bán hiện tại hoặc cost nguyên liệu nguồn.'],
    ['6', 'Kiểm tra hòa vốn: xem với giá hiện tại cần bán bao nhiêu cái để bù fixed cost.', 'COST CFG, MENU & GIÁ, COST & GIÁ', 'Cần bán để hòa vốn/tháng.', 'Nếu số quá cao, thử tăng giá, giảm fixed cost, đổi target hoặc kiểm tra lại cost.'],
    ['', '', '', '', ''],
    ['2. Nguồn giá được ưu tiên ra sao', '', '', '', ''],
    ['Ưu tiên', 'Nguồn giá', 'Khi nào dùng', 'Kết quả ra đâu', 'Nếu sai thì sửa ở đâu'],
    ['1', 'Giá nhập thật từ NHẬP HÀNG', 'Dùng khi đã mua nguyên liệu thật và có số lượng/quy cách/tổng giá.', 'Master NVL và COST CALC', 'Sửa dòng nhập hàng: số lượng mua, quy cách, đơn vị, tổng giá.'],
    ['2', 'Giá tạm founder nhập ở COST REVIEW', 'Dùng khi founder đã chốt một giá tạm để tính trước.', 'COST CALC', 'Sửa cột giá tạm/ghi chú trong COST REVIEW.'],
    ['3', 'Giá tạm bên phải CÔNG THỨC', 'Dùng cho nhóm P3 chưa mua thật nhưng đã có giá tham khảo nội bộ.', 'COST CALC và dashboard', 'Sửa bảng giá tạm bên phải CÔNG THỨC. Không điền giá giả cho ô còn trống.'],
    ['4', 'Công thức con tự làm', 'Dùng khi nguyên liệu là bán thành phẩm tự làm như bánh quy, sốt, mix, sữa chua.', 'Cost công thức con đưa vào món cha.', 'Sửa công thức con, thành phẩm sau khi làm hoặc mapping trong RECIPE MAP.'],
    ['5', 'Thiếu giá hoặc thiếu quy đổi', 'Dùng để cảnh báo, không tính bừa nếu chưa đủ dữ liệu.', 'VIỆC CẦN LÀM và COST REVIEW', 'Bổ sung giá mua thật, dung tích/quy cách hoặc cách quy đổi.'],
    ['', '', '', '', ''],
    ['3. Muốn sửa số thì sửa ở đâu', '', '', '', ''],
    ['Vấn đề thấy trên dashboard', 'Cần kiểm tra gì', 'Sheet cần mở', 'Kết quả bị ảnh hưởng', 'Cách sửa nhanh'],
    ['Cost nguyên liệu quá cao/thấp', 'Định lượng và đơn giá nguyên liệu.', 'CÔNG THỨC, NHẬP HÀNG, COST REVIEW', 'Cost mẻ, cost/đơn vị, giá đề xuất.', 'Sửa định lượng nếu dùng sai. Sửa đơn giá nếu quy cách nhập hàng sai.'],
    ['Cost/đơn vị sai dù cost mẻ đúng', 'Số lượng thành phẩm bán được sau 1 mẻ.', 'CÔNG THỨC, MENU & GIÁ', 'Cost nguyên liệu / đơn vị bán.', 'Sửa yield/thành phẩm hoặc quy cách bán.'],
    ['Food cost % quá cao', 'Giá bán hiện tại so với cost nguyên liệu.', 'MENU & GIÁ, COST & GIÁ', 'Food cost %, lãi gộp sau nguyên liệu.', 'Tăng giá bán, giảm cost, hoặc đổi target food cost nếu chiến lược khác.'],
    ['Hòa vốn ra số quá lớn', 'Fixed cost tháng và lãi gộp mỗi cái.', 'COST CFG, MENU & GIÁ', 'Cần bán để hòa vốn/tháng.', 'Giảm fixed cost, tăng giá, chọn SKU lãi tốt hơn hoặc dùng kịch bản chưa phân bổ fixed cost.'],
    ['Dòng bị cảnh báo thiếu dữ liệu', 'Tên nguyên liệu, giá, quy đổi, công thức con.', 'VIỆC CẦN LÀM, COST REVIEW', 'Độ tin cậy của cost/pricing.', 'Xử lý theo ưu tiên P0/P1 trước, P3 có thể để note nếu chỉ là giá tạm.'],
    ['', '', '', '', ''],
    ['4. Các công thức chính', '', '', '', ''],
    ['Tên công thức', 'Cách tính dễ hiểu', 'Cần dữ liệu gì', 'Xem ở đâu', 'Ghi chú'],
    ['Cost dòng', 'Số lượng dùng x đơn giá 1 đơn vị.', 'Định lượng trong công thức và đơn giá nguyên liệu.', 'COST CALC', 'Ví dụ 10g bột x 30đ/g = 300đ.'],
    ['Cost mẻ', 'Tổng cost của tất cả dòng nguyên liệu trong 1 mẻ.', 'Tất cả cost dòng tính được.', 'COST CALC', 'Thiếu giá thì cost mẻ chưa đáng tin.'],
    ['Cost/đơn vị bán', 'Cost mẻ / số lượng thành phẩm bán được.', 'Cost mẻ và yield/thành phẩm.', 'COST & GIÁ', 'Dùng được trước khi biết tháng bán bao nhiêu.'],
    ['Giá theo food cost', 'Cost/đơn vị / target food cost.', 'Cost/đơn vị và target food cost %.', 'COST & GIÁ', 'Ví dụ cost 20.000đ, target 35% thì giá gợi ý khoảng 57.143đ.'],
    ['Hòa vốn', 'Fixed cost tháng / lãi gộp sau nguyên liệu mỗi cái.', 'Fixed cost, giá bán hiện tại, cost/đơn vị.', 'COST & GIÁ', 'Nếu lãi gộp mỗi cái thấp thì số hòa vốn sẽ rất lớn.'],
    ['', '', '', '', ''],
    ['Ghi chú kỹ thuật', 'Sheet này chỉ giải thích cách vận hành. Chi tiết kỹ thuật và trạng thái xử lý nằm trong các sheet ẩn như COST REVIEW, BOM MAP, COST CALC và trong Apps Script.', '', '', 'Founder không cần sửa công thức tính ở sheet này.'],
  ];

  sheet.getRange(1, 1, 1, 5).merge()
    .setValue('COST FLOW - CÁCH HỆ THỐNG TÍNH GIÁ')
    .setFontWeight('bold')
    .setFontSize(15)
    .setBackground('#174EA6')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(3, 1, rows.length, 5).setValues(rows);

  rows.forEach((row, index) => {
    const sheetRow = index + 3;
    const firstCell = String(row[0] || '');
    const isSection = /^[1-4]\. /.test(firstCell) || firstCell === 'Ghi chú kỹ thuật';
    const isHeader = ['Bước', 'Ưu tiên', 'Vấn đề thấy trên dashboard', 'Tên công thức'].includes(firstCell);
    if (isSection) {
      sheet.getRange(sheetRow, 1, 1, 5).merge()
        .setFontWeight('bold')
        .setFontColor('#FFFFFF')
        .setBackground(firstCell === 'Ghi chú kỹ thuật' ? '#5F6368' : '#185ABC')
        .setHorizontalAlignment('left');
    } else if (isHeader) {
      sheet.getRange(sheetRow, 1, 1, 5)
        .setFontWeight('bold')
        .setBackground('#E8F0FE')
        .setHorizontalAlignment('center');
    } else if (firstCell) {
      sheet.getRange(sheetRow, 1, 1, 1).setFontWeight('bold').setHorizontalAlignment('center');
    }
  });

  sheet.getRange(3, 1, rows.length, 5).setWrap(true);
  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 310);
  sheet.setColumnWidth(3, 310);
  sheet.setColumnWidth(4, 260);
  sheet.setColumnWidth(5, 340);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, sheet.getLastRow(), 5).setVerticalAlignment('middle');
}

function MOCO_BUILD_ONLINE_BAKERY_WORKFLOW() {
  MOCO_BUILD_COST_FROM_RECIPE();
  const ss = getMocoSpreadsheet_();
  writeMocoCostConfigSheet_(ss);
  writeMocoMenuOnlineSheet_(ss);
  writeMocoCostBomMapSheet_(ss);
  writeMocoCostSubRecipeMapSheet_(ss);
  writeMocoYieldMapSheet_(ss);
  writeMocoPricingDashboardSheet_(ss);
  writeMocoFounderActionSimpleSheet_(ss);
  writeMocoHomeSheet_(ss);
  writeMocoGuideSheet_(ss);
  refreshMocoDataValidationLists_(ss);
  applyMocoOperationalSheetNotes_(ss);
  applyMocoNewTableUiToExistingSheets_(ss);
  MOCO_ORGANIZE_SHEETS_FOR_FOUNDER();

  try {
    SpreadsheetApp.getUi().alert('Đã cập nhật hệ thống bán bánh online và sắp xếp sheet cho Quỳnh/Duyên.');
  } catch (err) {
    // Web App / API executions do not have an interactive spreadsheet UI.
  }
  return {
    guide: MOCO_HOME_SHEET,
    home: MOCO_HOME_SHEET,
    menu: MOCO_MENU_ONLINE_SHEET,
    yieldMap: MOCO_YIELD_MAP_SHEET,
    orders: MOCO_CUSTOMER_ORDER_SHEET,
    pricing: MOCO_PRICING_DASHBOARD_SHEET,
    founderAction: MOCO_FOUNDER_ACTION_SHEET,
  };
}

function MOCO_CREATE_ONLINE_BAKERY_SHEETS() {
  const ss = getMocoSpreadsheet_();
  writeMocoCostConfigSheet_(ss);
  writeMocoMenuOnlineSheet_(ss);
  writeMocoCostBomMapSheet_(ss);
  writeMocoCostSubRecipeMapSheet_(ss);
  writeMocoYieldMapSheet_(ss);
  writeMocoPricingDashboardSheet_(ss);
  writeMocoFounderActionSimpleSheet_(ss);
  writeMocoHomeSheet_(ss);
  writeMocoGuideSheet_(ss);
  refreshMocoDataValidationLists_(ss);
  applyMocoOperationalSheetNotes_(ss);
  applyMocoNewTableUiToExistingSheets_(ss);
  return {
    guide: MOCO_HOME_SHEET,
    menu: MOCO_MENU_ONLINE_SHEET,
    yieldMap: MOCO_YIELD_MAP_SHEET,
    orders: MOCO_CUSTOMER_ORDER_SHEET,
    pricing: MOCO_PRICING_DASHBOARD_SHEET,
    founderAction: MOCO_FOUNDER_ACTION_SHEET,
  };
}

function MOCO_APPLY_GUIDE_AND_NOTES() {
  const ss = getMocoSpreadsheet_();
  writeMocoHomeSheet_(ss);
  writeMocoGuideSheet_(ss);
  refreshMocoDataValidationLists_(ss);
  applyMocoOperationalSheetNotes_(ss);
  applyMocoNewTableUiToExistingSheets_(ss);
  return MOCO_ORGANIZE_SHEETS_FOR_FOUNDER();
}

function MOCO_APPLY_NEW_TABLE_UI() {
  const ss = getMocoSpreadsheet_();
  refreshMocoDataValidationLists_(ss);
  applyMocoOperationalSheetNotes_(ss);
  const result = applyMocoNewTableUiToExistingSheets_(ss);
  MOCO_ORGANIZE_SHEETS_FOR_FOUNDER();
  return result;
}

function MOCO_APPLY_COST_FLOW_LOGIC_GUIDE() {
  const ss = getMocoSpreadsheet_();
  writeMocoCostFlowSheet_(ss);
  writeMocoHomeSheet_(ss);
  refreshMocoDataValidationLists_(ss);
  applyMocoNewTableUiToExistingSheets_(ss);
  return MOCO_ORGANIZE_SHEETS_FOR_FOUNDER();
}

function MOCO_REFRESH_DATA_VALIDATION_LISTS() {
  const ss = getMocoSpreadsheet_();
  const result = refreshMocoDataValidationLists_(ss);
  applyMocoOperationalSheetNotes_(ss);
  applyMocoNewTableUiToExistingSheets_(ss);
  return result;
}

function MOCO_BOOTSTRAP_UI_ON_OPEN_() {
  const ss = getMocoSpreadsheet_();
  if (isMocoDataValidationCurrent_(ss)) return;
  refreshMocoDataValidationLists_(ss);
  applyMocoOperationalSheetNotes_(ss);
  applyMocoNewTableUiToExistingSheets_(ss);
  try {
    SpreadsheetApp.getActive().toast('Đã tự cập nhật dropdown/danh mục MOCO.', 'MOCO', 5);
  } catch (err) {}
}

function onEditMocoCost_(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const name = sheet.getName();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  const ss = sheet.getParent();

  if (handleMocoFounderActionEdit_(sheet, row, col)) return;
  if (handleMocoHomeVisibilityEdit_(ss, sheet, row, col)) return;
  const menuChanged = name === MOCO_MENU_ONLINE_SHEET && row >= 5 && col >= 1 && col <= 11;
  const configChanged = name === MOCO_COST_CONFIG_SHEET && row >= 2 && col >= 1 && col <= 2;
  if (!menuChanged && !configChanged) return;

  writeMocoYieldMapSheet_(ss);
  writeMocoPricingDashboardSheet_(ss);
  writeMocoFounderActionSimpleSheet_(ss);
}

function MOCO_APPLY_SHORT_SHEET_NAMES() {
  const ss = getMocoSpreadsheet_();
  const renamePairs = [
    ['MOCO HOME', MOCO_HOME_SHEET],
    ['Công thức bánh', MOCO_COST_RECIPE_SHEET],
    ['MENU ONLINE & GIÁ BÁN', MOCO_MENU_ONLINE_SHEET],
    ['COST DASHBOARD - PRICING', MOCO_PRICING_DASHBOARD_SHEET],
    ['FOUNDER ACTION', MOCO_FOUNDER_ACTION_SHEET],
    ['Đơn đặt hàng', MOCO_CUSTOMER_ORDER_SHEET],
    ['Thu - Chi', getMocoThuChiSheetName_()],
    ['📊 Dashboard', getMocoDashboardSheetName_()],
    ['MOCO HƯỚNG DẪN', MOCO_GUIDE_SHEET],
    ['COST CONFIG', MOCO_COST_CONFIG_SHEET],
    ['COST TỪ CÔNG THỨC', MOCO_COST_OUTPUT_SHEET],
    ['COST REVIEW CẦN XỬ LÝ', MOCO_COST_REVIEW_SHEET],
    ['COST ACTION - FOUNDER', MOCO_COST_ACTION_SHEET],
    ['COST FLOW - LOGIC', MOCO_COST_FLOW_SHEET],
    ['COST BOM MAP', MOCO_COST_BOM_MAP_SHEET],
    ['COST SUB-RECIPE MAP', MOCO_COST_SUB_RECIPE_MAP_SHEET],
    ['ORDER ONLINE', MOCO_ORDER_ONLINE_SHEET],
  ];
  const renamed = [];
  const skipped = [];
  renamePairs.forEach(pair => {
    const oldName = pair[0];
    const newName = pair[1];
    if (!oldName || !newName || oldName === newName) return;
    const oldSheet = ss.getSheetByName(oldName);
    if (!oldSheet) return;
    const newSheet = ss.getSheetByName(newName);
    if (newSheet && newSheet.getSheetId() !== oldSheet.getSheetId()) {
      skipped.push({ from: oldName, to: newName, reason: 'Tên mới đã tồn tại' });
      return;
    }
    oldSheet.setName(newName);
    renamed.push({ from: oldName, to: newName });
  });
  writeMocoHomeSheet_(ss);
  const ui = applyMocoNewTableUiToExistingSheets_(ss);
  const order = MOCO_ORGANIZE_SHEETS_FOR_FOUNDER();
  return { renamed, skipped, ui, order };
}

function getMocoThuChiSheetName_() {
  return (typeof TC_SHEET !== 'undefined') ? TC_SHEET : 'THU CHI';
}

function getMocoDashboardSheetName_() {
  return (typeof DASH_SHEET !== 'undefined') ? DASH_SHEET : 'DASHBOARD';
}

function MOCO_ORGANIZE_SHEETS_FOR_FOUNDER() {
  const ss = getMocoSpreadsheet_();
  const visibleNames = [
    MOCO_HOME_SHEET,
    MOCO_MENU_ONLINE_SHEET,
    MOCO_CUSTOMER_ORDER_SHEET,
    MOCO_PRICING_DASHBOARD_SHEET,
    MOCO_FOUNDER_ACTION_SHEET,
    'NHẬP HÀNG',
    MOCO_COST_RECIPE_SHEET,
    MOCO_YIELD_MAP_SHEET,
    getMocoThuChiSheetName_(),
    getMocoDashboardSheetName_(),
  ];
  const hiddenNames = [
    MOCO_GUIDE_SHEET,
    MOCO_COST_REVIEW_SHEET,
    MOCO_COST_OUTPUT_SHEET,
    MOCO_COST_FLOW_SHEET,
    MOCO_COST_ACTION_SHEET,
    MOCO_COST_BOM_MAP_SHEET,
    MOCO_COST_SUB_RECIPE_MAP_SHEET,
    MOCO_COST_CONFIG_SHEET,
    MOCO_ORDER_ONLINE_SHEET,
    MOCO_FINANCE_NOTES_SHEET,
    MOCO_LEGACY_MENU_SHEET,
    '📋 Review Tên NVL',
    'REVIEW TÊN HÀNG',
    'REVIEW TÊN HÀNG - AUDIT',
    MOCO_COST_MASTER_SHEET,
  ];

  visibleNames.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) sheet.showSheet();
  });
  hiddenNames.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && visibleNames.indexOf(name) < 0) sheet.hideSheet();
  });
  applyMocoHomeVisibilityMap_(ss);
  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    const key = normMocoCostText_(name);
    if ((key.indexOf('backup') >= 0 || key.indexOf('ban sao') >= 0 || key.indexOf('copy') >= 0) && visibleNames.indexOf(name) < 0) {
      try { sheet.hideSheet(); } catch (err) {}
    }
  });

  const order = visibleNames.filter(name => {
    const sheet = ss.getSheetByName(name);
    return sheet && !sheet.isSheetHidden();
  });
  order.slice().reverse().forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  });
  const home = ss.getSheetByName(MOCO_HOME_SHEET);
  if (home) ss.setActiveSheet(home);

  return {
    visible: order,
    hiddenConfigured: hiddenNames.filter(name => ss.getSheetByName(name)),
  };
}

function writeMocoHomeSheet_(ss) {
  let sheet = ss.getSheetByName(MOCO_HOME_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_HOME_SHEET);
  const existingVisibility = readMocoHomeVisibilityState_(sheet);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  if (typeof MOCO_COMPACT_HOME_FOR_FOUNDER === 'function') {
    MOCO_COMPACT_HOME_FOR_FOUNDER(ss, existingVisibility);
    return;
  }

  const siteRows = [
    ['Hub', 'HOME', 'Hiện', 'Bản đồ toàn bộ file: sheet nào dùng làm gì, điền gì để ra số gì, và sheet ẩn nào vẫn đang phục vụ tính toán.', 'Đọc trước khi thao tác. Click vào tên sheet để nhảy nhanh.', 'Không nhập dữ liệu nguồn ở đây.', 'Tất cả luồng vận hành.', 'Nếu số nào khó hiểu, quay lại đây để tìm nguồn dữ liệu.'],
    ['Nguồn cost', 'CÔNG THỨC', 'Hiện', 'Công thức/mẻ: tên bánh, nguyên liệu, định lượng, cách làm, thành phẩm sau khi làm. Bảng giá tạm nằm bên phải công thức.', 'Thêm/sửa công thức, định lượng, yield/thành phẩm, giá tạm P3 khi chưa có hóa đơn.', 'Tên bánh, nguyên liệu, định lượng, thành phẩm/mẻ, giá tạm bên phải nếu cần.', 'Cost nguyên liệu/mẻ, cost nguyên liệu/đơn vị, dòng thiếu dữ liệu.', 'Không cần biết tháng bán bao nhiêu để tính cost nguyên liệu.'],
    ['Audit yield', 'THÀNH PHẨM/MẺ', 'Hiện', 'Bảng kiểm tra rõ từng món: cost 1 mẻ, 1 mẻ ra bao nhiêu thành phẩm, 1 đơn vị bán dùng bao nhiêu thành phẩm, và cost/đơn vị bán.', 'Xem để audit vì sao giá đề xuất ra số đó. Không sửa tay ở đây; sửa nguồn ở CÔNG THỨC hoặc MENU & GIÁ.', 'CÔNG THỨC phải có thành phẩm/mẻ; MENU & GIÁ phải có số thành phẩm/đơn vị bán.', 'COST & GIÁ.', 'Nếu thiếu thành phẩm/mẻ thì hệ thống không tự đoán và sẽ đưa việc vào VIỆC CẦN LÀM.'],
    ['Nguồn giá thật', 'NHẬP HÀNG', 'Hiện', 'Lịch sử mua hàng và giá nhập thật: tên hàng, NCC, loại hàng, số lượng, quy cách, đơn vị, tổng giá.', 'Nhập hóa đơn/lần mua mới. Sửa quy cách nếu đơn giá bị sai.', 'Số lượng mua, quy cách, đơn vị, tổng giá nhập.', 'Master NVL, COST & GIÁ.', 'Giá thật ở đây được ưu tiên hơn giá tạm.'],
    ['Danh mục bán', 'MENU & GIÁ', 'Hiện', 'Danh sách SKU/món bán online, quy cách bán, giá bán hiện tại, trạng thái bán, ghi chú.', 'Nhập/sửa giá bán hiện tại, tên món bán, trạng thái, quy cách bán.', 'Giá bán hiện tại và SKU bán cho khách.', 'Food cost %, lãi gộp, giá đề xuất, hòa vốn.', 'Chỉ đưa món bán cho khách, không đưa công thức con.'],
    ['Kết quả pricing', 'COST & GIÁ', 'Hiện', 'Bảng kết quả chính: cost nguyên liệu, giá theo food cost, giá có fixed cost, lãi, hòa vốn, giá theo lãi mục tiêu, cảnh báo. Nhiều cột là công thức trong sheet để giá/target đổi là số tự nhảy.', 'Xem số, không sửa tay. Bấm link ở cột "Mở chỗ cần sửa" khi có cảnh báo.', 'Không nhập trực tiếp.', 'Founder dùng sheet này để ra quyết định giá.', 'Khi chưa bán, đọc cột Cost nguyên liệu / đơn vị và Giá theo food cost chỉ nguyên liệu trước.'],
    ['Việc cần làm', 'VIỆC CẦN LÀM', 'Hiện', 'Danh sách việc cần xử lý theo ưu tiên: thiếu định lượng, thiếu giá, lệch đơn vị, cần review giá bán.', 'Làm từ P0/P1 trước; mở link để sửa đúng nơi.', 'Không nhập dữ liệu nguồn trừ khi link dẫn sang sheet nguồn.', 'Giảm lỗi để cost/pricing đáng tin hơn.', 'P3 thường là giá tạm hoặc việc có thể xử lý sau.'],
    ['Đơn bán', 'ĐƠN HÀNG', 'Hiện', 'Đơn hàng từ kênh bán: món, số lượng, giá bán, trạng thái.', 'Nhập đơn khi bắt đầu bán thật.', 'Mỗi đơn một dòng, ghi rõ món/SKU, số lượng, giá, trạng thái.', 'Doanh thu, số đơn, top món bán chạy.', 'Không cần sheet này để tính cost ban đầu.'],
    ['Dòng tiền', 'THU CHI', 'Hiện', 'Các khoản thu chi vận hành phát sinh.', 'Nhập chi phí thực tế, thu khác, chi vận hành.', 'Ngày, nội dung, nhóm chi phí, số tiền.', 'Dashboard tài chính/dòng tiền.', 'Ghi rõ nội dung để phân loại lại được.'],
    ['Báo cáo bán hàng', 'DASHBOARD', 'Hiện', 'Tổng hợp doanh thu, đơn hàng, thu chi, chỉ số vận hành.', 'Xem kết quả sau khi có đơn và thu chi.', 'Không nhập trực tiếp.', 'Theo dõi vận hành sau khi bắt đầu bán.', 'Không phải nguồn tính cost nguyên liệu.'],
    ['Cấu hình tính giá', 'COST CFG', 'Ẩn', 'Target food cost, hao hụt, fixed cost tháng, sản lượng tháng nếu có, lãi mục tiêu, bước làm tròn giá.', 'Mở khi muốn đổi giả định tính giá hoặc mô phỏng hòa vốn.', 'Target food cost %, waste %, fixed cost, target gross margin %, planned units nếu đã có dữ liệu.', 'COST & GIÁ.', 'Sheet ẩn nhưng vẫn được dashboard đọc.'],
    ['Danh mục nguyên liệu', 'Master NVL', 'Ẩn', 'Danh mục nguyên liệu chuẩn và đơn giá mới nhất/trung bình từ NHẬP HÀNG.', 'Chỉ mở khi cần audit tên nguyên liệu hoặc đơn giá chuẩn.', 'Không sửa tay nếu chưa chắc; ưu tiên sửa từ NHẬP HÀNG.', 'COST CALC, COST & GIÁ.', 'Giữ chuẩn tên để tránh cùng một nguyên liệu có nhiều tên.'],
    ['Máy tính cost', 'COST CALC', 'Ẩn', 'Bảng máy tính chi tiết: tổng cost/mẻ, từng dòng nguyên liệu, đơn giá, thành tiền, trạng thái. Các cột tổng cost, số dòng OK/lỗi và thành tiền dòng dùng công thức trong sheet để dễ audit.', 'Mở khi muốn audit vì sao một món ra cost đó.', 'Không sửa tay; sửa ở CÔNG THỨC, NHẬP HÀNG hoặc COST REVIEW.', 'COST & GIÁ.', 'Đây là nguồn trung gian quan trọng nhất cho pricing.'],
    ['Map nguyên liệu', 'BOM MAP', 'Ẩn', 'Map tên nguyên liệu trong công thức sang tên chuẩn, alias, công thức con hoặc giá tạm.', 'Mở khi tên nguyên liệu bị lệch hoặc cần khai báo công thức con.', 'Alias/tên chuẩn/công thức con nếu cần review kỹ.', 'COST CALC.', 'Ví dụ whipping cream -> whipping, sữa hạt -> sữa yến mạch.'],
    ['Công thức con', 'RECIPE MAP', 'Ẩn', 'Map bán thành phẩm tự làm như bánh quy hạnh nhân, lady finger, sữa chua Hy Lạp.', 'Mở khi món cha dùng nguyên liệu tự làm.', 'Tên công thức con, thành phẩm sau 1 mẻ, đơn vị thành phẩm.', 'Cost công thức con đưa vào món cha.', 'Không đưa công thức con vào menu bán nếu không bán riêng.'],
    ['Review kỹ thuật', 'COST REVIEW', 'Ẩn', 'Bảng xử lý giá tạm, alias, dòng thiếu giá, note cần điều chỉnh sau.', 'Mở khi cần xử lý hàng loạt lỗi cost hoặc điền giá tạm có kiểm soát.', 'Cột H/I/J cho chọn NVL, giá tạm, ghi chú.', 'COST CALC.', 'Founder thường chỉ cần xem VIỆC CẦN LÀM.'],
    ['Logic tính', 'COST FLOW', 'Ẩn', 'Bản giải thích đơn giản: hệ thống lấy số từ đâu, tính theo thứ tự nào, và nếu số sai thì sửa ở đâu.', 'Mở khi cần audit hoặc hướng dẫn founder hiểu cách dashboard ra số.', 'Không nhập dữ liệu nguồn.', 'Hiểu vì sao dashboard ra cost, giá gợi ý, food cost và hòa vốn.', 'Sheet ẩn nhưng vẫn là tài liệu vận hành quan trọng.'],
  ];
  siteRows.forEach(row => {
    if (row[1] === MOCO_HOME_SHEET) {
      row[2] = 'Hiện';
    } else if (existingVisibility[row[1]] === 'Hiện' || existingVisibility[row[1]] === 'Ẩn') {
      row[2] = existingVisibility[row[1]];
    }
  });
  const questionRows = [
    ['Muốn biết cost nguyên liệu/đơn vị', 'CÔNG THỨC phải có nguyên liệu, định lượng, thành phẩm/mẻ. Giá lấy từ NHẬP HÀNG hoặc bảng giá tạm bên phải.', 'CÔNG THỨC, NHẬP HÀNG', 'Master NVL, COST CALC, BOM MAP', 'COST & GIÁ cột Cost nguyên liệu / đơn vị', 'Nếu sai, kiểm tra yield/thành phẩm và đơn giá nguyên liệu.'],
    ['Muốn biết 1 mẻ ra bao nhiêu chiếc và cost chia thế nào', 'CÔNG THỨC có thành phẩm/mẻ; MENU & GIÁ có số thành phẩm dùng cho 1 đơn vị bán.', 'CÔNG THỨC, MENU & GIÁ', 'COST CALC', 'THÀNH PHẨM/MẺ', 'Sheet này là nơi audit yield; không có yield thì không tính bừa.'],
    ['Muốn biết giá bán tối thiểu theo food cost', 'Có cost nguyên liệu/đơn vị và Target food cost % trong COST CFG.', 'CÔNG THỨC, COST CFG', 'COST CALC', 'COST & GIÁ cột Giá theo food cost chỉ nguyên liệu', 'Dùng trước khi chưa có doanh số thật.'],
    ['Muốn biết food cost % với giá đang bán', 'Có giá bán hiện tại của từng SKU.', 'MENU & GIÁ cột Giá bán hiện tại', 'COST & GIÁ', 'COST & GIÁ cột Food cost %', 'Nếu food cost cao hơn target, tăng giá hoặc giảm cost.'],
    ['Muốn biết muốn lãi X% thì giá cần như nào', 'Điền Target gross margin % trong COST CFG.', 'COST CFG', 'COST & GIÁ', 'COST & GIÁ cột Giá theo lãi mục tiêu', 'Đây là lãi gộp sau nguyên liệu, chưa phải lãi ròng.'],
    ['Muốn biết hòa vốn cần bán bao nhiêu cái', 'Có giá bán hiện tại và fixed cost tháng. Không bắt buộc có planned units.', 'MENU & GIÁ, COST CFG', 'COST & GIÁ', 'COST & GIÁ cột Cần bán để hòa vốn/tháng', 'Nếu số quá cao, giá hoặc mô hình chi phí chưa hợp lý.'],
    ['Muốn phân bổ fixed cost vào giá', 'Có fixed cost tháng và sản lượng bán dự kiến/tháng đủ thực tế.', 'COST CFG dòng Planned sellable units/month', 'COST & GIÁ', 'Cột Fixed cost / đơn vị và Giá theo food cost + fixed', 'Chỉ dùng khi đã có dữ liệu bán hoặc mục tiêu sản lượng đáng tin.'],
    ['Muốn cập nhật cost theo giá mua thật', 'Nhập hóa đơn mua nguyên liệu mới.', 'NHẬP HÀNG', 'Master NVL, COST CALC', 'COST & GIÁ', 'Giá thật sẽ thay giá tạm khi tên và đơn vị khớp.'],
    ['Muốn biết còn thiếu gì để số chuẩn hơn', 'Mở danh sách action.', 'VIỆC CẦN LÀM', 'COST CALC, COST REVIEW', 'VIỆC CẦN LÀM', 'Làm P0/P1 trước, P3 xử lý sau.'],
    ['Muốn xem doanh thu sau khi bán', 'Nhập đơn hàng và thu chi thực tế.', 'ĐƠN HÀNG, THU CHI', 'DASHBOARD', 'DASHBOARD', 'Không liên quan đến việc tính cost ban đầu.'],
  ];
  const processRows = [
    ['1', 'Nhập/sửa công thức', 'CÔNG THỨC', 'Tên bánh, nguyên liệu, định lượng, thành phẩm/mẻ.', 'COST CALC có đủ dữ liệu để tính mẻ.'],
    ['2', 'Bổ sung giá', 'NHẬP HÀNG hoặc bảng giá tạm bên phải CÔNG THỨC', 'Ưu tiên hóa đơn thật; nếu chưa mua thì dùng giá tạm có ghi chú.', 'Master NVL/giá tạm có đơn giá quy chuẩn.'],
    ['3', 'Chạy/tự cập nhật cost', 'Hệ thống', 'Đọc công thức, map nguyên liệu, công thức con, giá thật/giá tạm.', 'COST CALC và COST & GIÁ cập nhật.'],
    ['4', 'Khai báo món bán', 'MENU & GIÁ', 'SKU, tên món bán, quy cách bán, giá bán hiện tại nếu đã có.', 'Dashboard tính food cost, lãi, giá đề xuất.'],
    ['5', 'Đọc kết quả pricing', 'COST & GIÁ', 'Xem cost nguyên liệu trước, sau đó xem giá target, hòa vốn, lãi mục tiêu.', 'Founder có đủ số để quyết định giá bán thử.'],
    ['6', 'Xử lý cảnh báo', 'VIỆC CẦN LÀM', 'Làm dòng ưu tiên cao, mở link về đúng sheet nguồn.', 'Số cost/pricing sạch hơn.'],
    ['7', 'Sau khi bắt đầu bán', 'ĐƠN HÀNG, THU CHI, COST CFG', 'Nhập đơn, chi phí thực tế, rồi mới dùng planned units nếu cần phân bổ fixed cost.', 'Dashboard vận hành và mô phỏng fixed cost thực tế hơn.'],
  ];

  sheet.getRange(1, 1, 1, 8).merge()
    .setValue('MOCO KITCHEN - HOME HUB / SITEMAP')
    .setFontWeight('bold')
    .setFontSize(16)
    .setBackground('#0B8043')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, 8).merge()
    .setValue('Đọc trang này như bản đồ vận hành: mỗi sheet dùng làm gì, ai có thể làm gì, muốn ra số nào thì phải điền dữ liệu nào, và các sheet ẩn nào vẫn đang được hệ thống dùng để tính.')
    .setBackground('#E6F4EA').setFontColor('#174EA6').setWrap(true);

  const siteHeaders = ['Nhóm', 'Sheet', 'Hiện/Ẩn', 'Founder tìm thấy gì', 'Có thể làm gì', 'Cần điền/sửa gì', 'Kết quả liên quan', 'Lưu ý'];
  sheet.getRange(4, 1, 1, siteHeaders.length).setValues([siteHeaders])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF');
  sheet.getRange(5, 1, siteRows.length, siteHeaders.length).setValues(siteRows);
  siteRows.forEach((row, index) => {
    const target = ss.getSheetByName(row[1]);
    if (target) {
      sheet.getRange(5 + index, 2)
        .setFormula('=HYPERLINK("#gid=' + target.getSheetId() + '";"' + row[1] + '")');
    }
  });

  const questionStart = 5 + siteRows.length + 2;
  sheet.getRange(questionStart, 1, 1, 6).merge()
    .setValue('Muốn ra số nào thì cần điền gì')
    .setFontWeight('bold').setBackground('#B3261E').setFontColor('#FFFFFF');
  const questionHeaders = ['Founder cần ra số gì', 'Dữ liệu bắt buộc', 'Điền ở sheet nào', 'Sheet ẩn/hệ thống dùng', 'Xem kết quả ở đâu', 'Nếu số chưa đúng'];
  sheet.getRange(questionStart + 1, 1, 1, questionHeaders.length).setValues([questionHeaders])
    .setFontWeight('bold').setBackground('#FEF7E0');
  sheet.getRange(questionStart + 2, 1, questionRows.length, questionHeaders.length).setValues(questionRows);

  const processStart = questionStart + questionRows.length + 4;
  sheet.getRange(processStart, 1, 1, 5).merge()
    .setValue('Flow điền thông tin đến khi ra kết quả')
    .setFontWeight('bold').setBackground('#5F6368').setFontColor('#FFFFFF');
  const processHeaders = ['Bước', 'Việc làm', 'Làm ở sheet nào', 'Cần chuẩn bị/điền gì', 'Kết quả sau bước này'];
  sheet.getRange(processStart + 1, 1, 1, processHeaders.length).setValues([processHeaders])
    .setFontWeight('bold').setBackground('#F1F3F4');
  sheet.getRange(processStart + 2, 1, processRows.length, processHeaders.length).setValues(processRows);

  [150, 230, 110, 360, 320, 320, 300, 360].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 8).setWrap(true).setVerticalAlignment('middle');
  sheet.setFrozenRows(4);
  setMocoHeaderNotes_(sheet, 4, {
    1: 'Nhóm chức năng của sheet.',
    2: 'Click để nhảy đến sheet tương ứng nếu sheet tồn tại.',
    3: 'Hiện = founder thấy trên thanh tab. Ẩn = hệ thống vẫn dùng nhưng không đặt trước mắt founder.',
    4: 'Founder sẽ thấy thông tin gì khi mở sheet.',
    5: 'Các thao tác được phép hoặc nên làm.',
    6: 'Dữ liệu đầu vào cần điền/sửa.',
    7: 'Các chỉ số hoặc sheet kết quả liên quan.',
    8: 'Cảnh báo để tránh hiểu nhầm hoặc sửa nhầm.',
  });
  applyMocoHomeUi_(ss);
}

function writeMocoGuideSheet_(ss) {
  let sheet = ss.getSheetByName(MOCO_GUIDE_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_GUIDE_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  sheet.getRange(1, 1, 1, 3).merge()
    .setValue('HƯỚNG DẪN')
    .setFontWeight('bold').setFontSize(16)
    .setBackground('#0B8043').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, 3).merge()
    .setValue('Mở HOME để xem hướng dẫn sử dụng, link nội bộ và luồng thao tác chuẩn.')
    .setBackground('#E6F4EA').setFontColor('#174EA6').setWrap(true);
  sheet.getRange(4, 1).setFormula('=HYPERLINK("#gid=' + ss.getSheetByName(MOCO_HOME_SHEET).getSheetId() + '";"Mở HOME")');
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 220);
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 3).setWrap(true).setVerticalAlignment('middle');
}

function writeMocoCostConfigSheet_(ss) {
  let sheet = ss.getSheetByName(MOCO_COST_CONFIG_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_COST_CONFIG_SHEET);
  const existing = readMocoConfigMap_(sheet);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  const rows = [
    ['Target food cost %', existing['Target food cost %'] || 0.35, 'Mặc định 35% cho bánh bán online. Giá đề xuất = cost / target.'],
    ['Default waste %', existing['Default waste %'] || 0.07, 'Hao hụt/portion variance mặc định 7%.'],
    ['Monthly electricity/water', existing['Monthly electricity/water'] || 500000, 'Chi phí điện nước dự kiến/tháng theo note founder.'],
    ['Monthly marketing', existing['Monthly marketing'] || 4500000, 'Chi phí marketing dự kiến/tháng theo note founder.'],
    ['Monthly founder labor', existing['Monthly founder labor'] || 16000000, 'Lương công 2 founder: 8 triệu x 2.'],
    ['Monthly fixed wastage', existing['Monthly fixed wastage'] || 1000000, 'Hao hụt cố định dự kiến/tháng theo note founder.'],
    ['Planned sellable units/month', existing['Planned sellable units/month'] || '', 'Sản lượng bán dự kiến/tháng. Có số này mới phân bổ chi phí cố định vào giá đề xuất.'],
    ['Use reference temp price', existing['Use reference temp price'] || existing['Use AI temp price'] || 'TRUE', 'TRUE = cho phép dùng giá tham khảo để ra cost tạm.'],
    ['Allow g/ml assumption', existing['Allow g/ml assumption'] || 'TRUE', 'TRUE = cho phép tạm coi 1g≈1ml khi có ghi chú.'],
    ['Default pricing round', existing['Default pricing round'] || 1000, 'Làm tròn giá bán đề xuất lên bội số này.'],
    ['Target gross margin %', existing['Target gross margin %'] || 0.6, 'Dùng cho cột Giá theo lãi mục tiêu: Giá = cost nguyên liệu / (1 - margin). Ví dụ 60% nghĩa là còn 60% doanh thu sau nguyên liệu.'],
  ];
  sheet.getRange(1, 1, 1, 3).setValues([['Cấu hình', 'Giá trị', 'Ghi chú']])
    .setFontWeight('bold').setBackground('#174EA6').setFontColor('#FFFFFF');
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Tên tham số cấu hình pricing/cost.',
    2: 'Giá trị đang áp dụng. Chỉ sửa khi Quỳnh/Duyên thống nhất lại giả định.',
    3: 'Giải thích tác động của tham số lên cost và giá bán đề xuất.',
  });
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  sheet.getRange(2, 2, 2, 1).setNumberFormat('0.00%');
  sheet.getRange(12, 2, 1, 1).setNumberFormat('0.00%');
  sheet.getRange(4, 2, 4, 1).setNumberFormat('#,##0 [$đ-42A]');
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 620);
  sheet.getRange(1, 1, sheet.getLastRow(), 3).setWrap(true).setVerticalAlignment('middle');
  applyMocoCostConfigUi_(ss);
}

function writeMocoMenuOnlineSheet_(ss) {
  const summaries = readMocoSellableCostSummaries_(ss);
  const existing = readMocoMenuRows_(ss.getSheetByName(MOCO_MENU_ONLINE_SHEET));
  let sheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_MENU_ONLINE_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();

  const headers = ['Mã SKU', 'Tên món bán online', 'Tên công thức nội bộ', 'Quy cách bán', 'Số thành phẩm / đơn vị bán', 'Giá bán hiện tại', 'Cost / đơn vị', 'Food cost %', 'Giá bán đề xuất', 'Trạng thái bán', 'Ghi chú'];
  const menuItems = buildMocoSellableMenuItems_(summaries, existing);
  const rows = menuItems.map(item => {
    const existingRow = item.existingRow || {};
    return [
      item.sku,
      existingRow.onlineName || item.onlineName,
      item.recipeName,
      item.spec,
      item.saleQty,
      existingRow.price || item.price || '',
      '',
      '',
      '',
      existingRow.status || 'Đang review',
      existingRow.note || '',
    ];
  });

  sheet.getRange(1, 1, 1, headers.length).merge()
    .setValue('MENU & GIÁ')
    .setFontWeight('bold').setFontSize(15).setBackground('#0B8043').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, headers.length).merge()
    .setValue('Sheet quản lý menu bán online: chỉ gồm món/SKU bán cho khách. Giá bán là input founder sửa tay; các cột cost, food cost và giá đề xuất là công thức kéo từ COST & GIÁ.')
    .setBackground('#E6F4EA').setFontColor('#174EA6').setWrap(true);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF').setHorizontalAlignment('center');
  setMocoHeaderNotes_(sheet, 4, {
    1: 'Mã nội bộ cho từng món bán online. Dùng để kéo order và dashboard.',
    2: 'Tên hiển thị cho khách hàng trên kênh bán.',
    3: 'Tên công thức trong CÔNG THỨC để lấy cost.',
    4: 'Quy cách bán cho khách: 1 chiếc, 1 hộp, 1 bánh 10cm, 1 phần... Không nhập "mẻ" hoặc sản lượng công thức ở đây.',
    5: 'Số thành phẩm chuẩn dùng cho 1 đơn vị bán. Ví dụ bán 1 chiếc thì nhập 1; hộp 6 chiếc thì nhập 6. Với cheesecake theo size, hệ thống dùng tỷ lệ công thức riêng.',
    6: 'Giá Duyên đang bán cho khách. Sửa cột này khi đổi giá.',
    7: 'Công thức trong ô: kéo Cost nguyên liệu / đơn vị từ COST & GIÁ theo SKU. Không sửa tay.',
    8: 'Công thức trong ô: Cost / Giá bán hiện tại. Đổi giá bán ở cột F thì % tự nhảy.',
    9: 'Công thức trong ô: kéo Giá theo food cost chỉ nguyên liệu từ COST & GIÁ. Cột này dùng tốt trước khi chưa có dữ liệu bán thật.',
    10: 'Trạng thái kinh doanh của SKU.',
    11: 'Ghi chú marketing/vận hành cho SKU.',
  });
  if (rows.length) {
    sheet.getRange(5, 1, rows.length, headers.length).setValues(rows);
    for (let i = 0; i < rows.length; i++) {
      const r = i + 5;
      sheet.getRange(r, 7).setFormula('=IFERROR(VLOOKUP($A' + r + ';\'COST & GIÁ\'!$B:$F;2;FALSE);"")');
      sheet.getRange(r, 8).setFormula('=IFERROR(IF(OR($G' + r + '="";$F' + r + '="");"";$G' + r + '/$F' + r + ');"")');
      sheet.getRange(r, 9).setFormula('=IFERROR(VLOOKUP($A' + r + ';\'COST & GIÁ\'!$B:$F;5;FALSE);"")');
    }
    sheet.getRange(5, 5, rows.length, 1).setNumberFormat('0.00');
    sheet.getRange(5, 6, rows.length, 2).setNumberFormat('#,##0 [$đ-42A]');
    sheet.getRange(5, 8, rows.length, 1).setNumberFormat('0.00%');
    sheet.getRange(5, 9, rows.length, 1).setNumberFormat('#,##0 [$đ-42A]');
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Đang review', 'Đang bán', 'Tạm ngưng', 'Cần chốt giá'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(5, 10, rows.length, 1).setDataValidation(statusRule);
  }
  sheet.setFrozenRows(4);
  [120, 260, 260, 180, 150, 140, 140, 120, 150, 140, 320].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).setWrap(true).setVerticalAlignment('middle');
  applyMocoMenuOnlineUi_(ss);
}

function writeMocoPricingDashboardSheet_(ss) {
  const config = getMocoCostConfig_(ss);
  const summaries = readMocoSellableCostSummaries_(ss);
  const summariesByRecipe = summaries.reduce((out, item) => {
    out[normMocoCostText_(item.cake)] = item;
    return out;
  }, {});
  const statusMap = readMocoCostDetailStatusMap_(ss);
  const menu = readMocoMenuRows_(ss.getSheetByName(MOCO_MENU_ONLINE_SHEET));
  let sheet = ss.getSheetByName(MOCO_PRICING_DASHBOARD_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_PRICING_DASHBOARD_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();

  const headers = [
    'Tên món bán',
    'SKU',
    'Cost nguyên liệu / đơn vị',
    'Giá bán hiện tại',
    'Food cost %',
    'Giá theo food cost chỉ nguyên liệu',
    'Fixed cost / đơn vị',
    'Giá theo food cost + fixed',
    'Lãi gộp sau nguyên liệu',
    'Lãi sau fixed cost',
    'Cần bán để hòa vốn/tháng',
    'Giá theo lãi mục tiêu',
    'Nguồn giá',
    'Mở chỗ cần sửa',
    'Cảnh báo',
    'Công thức / nguồn dữ liệu',
  ];
  const menuRows = menu.rows.length ? menu.rows : buildMocoSellableMenuItems_(summaries, menu);
  const rows = menuRows.map(menuRow => {
    const item = summariesByRecipe[normMocoCostText_(menuRow.recipeName || menuRow.onlineName)] || {};
    const sku = menuRow.sku;
    const yieldInfo = getMocoMenuYieldInfo_(item, menuRow);
    const status = statusMap[normMocoCostText_(item.cake)] || { statuses: {}, tempCount: 0, issueCount: item.issueRows || 0 };
    const costPerUnit = calcMocoMenuCostPerUnit_(item, menuRow, config);
    const pricingCost = costPerUnit + config.fixedCostPerUnit;
    const price = parseMocoReviewPrice_(menuRow.price);
    const foodCost = price ? costPerUnit / price : '';
    const ingredientOnlySuggested = roundMocoPrice_(costPerUnit / config.targetFoodCost, config.round);
    const fixedSuggested = roundMocoPrice_(pricingCost / config.targetFoodCost, config.round);
    const gross = price ? price - costPerUnit : '';
    const breakEvenUnits = price && gross > 0 && config.fixedCostMonthly ? Math.ceil(config.fixedCostMonthly / gross) : '';
    const targetMarginPrice = roundMocoPrice_(costPerUnit / (1 - config.targetGrossMargin), config.round);
    const warning = buildMocoPricingWarning_(item, status, yieldInfo, price, foodCost, config);
    const netAfterFixed = price ? price - costPerUnit - config.fixedCostPerUnit : '';
    return [
      menuRow.onlineName || item.cake,
      sku,
      costPerUnit || '',
      price || '',
      foodCost || '',
      ingredientOnlySuggested || '',
      config.fixedCostPerUnit || '',
      fixedSuggested || '',
      gross || '',
      netAfterFixed || '',
      breakEvenUnits || '',
      targetMarginPrice || '',
      buildMocoPriceSourceLabel_(status),
      '',
      warning,
      buildMocoPricingFormulaNote_(item, menuRow, config),
    ];
  });

  sheet.getRange(1, 1, 1, headers.length).merge()
    .setValue('COST & GIÁ')
    .setFontWeight('bold').setFontSize(15).setBackground('#174EA6').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, headers.length).merge()
    .setValue('Cost nguyên liệu tính được ngay từ CÔNG THỨC, không cần dự báo bán bao nhiêu/tháng. Sản lượng tháng chỉ dùng cho mô phỏng fixed cost. Dùng các cột giá khác nhau để trả lời: giá vốn, giá theo food cost, hòa vốn, hoặc giá theo lãi mục tiêu.')
    .setBackground('#E8F0FE').setFontColor('#174EA6').setWrap(true);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF').setHorizontalAlignment('center');
  setMocoHeaderNotes_(sheet, 4, {
    1: 'Tên món bán online.',
    2: 'Mã SKU trong MENU & GIÁ.',
    3: 'Công thức trong ô: kéo Cost / đơn vị bán từ THÀNH PHẨM/MẺ theo SKU. THÀNH PHẨM/MẺ lại kéo cost chuẩn từ COST CALC.',
    4: 'Công thức trong ô: kéo Giá bán hiện tại từ MENU & GIÁ theo SKU. Founder đổi giá ở MENU, dashboard tự nhảy.',
    5: 'Công thức trong ô: Cost nguyên liệu / Giá bán hiện tại.',
    6: 'Công thức trong ô: Cost nguyên liệu / Target food cost %. Đây là cột dùng trước khi chưa có dữ liệu bán thật.',
    7: 'Công thức trong ô: tổng chi phí điện nước + marketing + lương founder + hao hụt cố định / sản lượng tháng. Nếu chưa có sản lượng tháng thì bằng 0.',
    8: 'Công thức trong ô: (Cost nguyên liệu + Fixed cost/đơn vị) / Target food cost %, làm tròn theo COST CFG.',
    9: 'Công thức trong ô: Giá bán hiện tại - Cost nguyên liệu.',
    10: 'Công thức trong ô: Giá bán hiện tại - Cost nguyên liệu - Fixed cost/đơn vị.',
    11: 'Công thức trong ô: fixed cost tháng / lãi gộp sau nguyên liệu. Cho biết cần bán bao nhiêu đơn vị/tháng để hòa vốn.',
    12: 'Công thức trong ô: Cost nguyên liệu / (1 - Target gross margin %). Dùng khi muốn hỏi lãi X% thì giá cần là bao nhiêu.',
    13: 'Nguồn giá nguyên liệu: giá thật, giá tạm Duyên nhập, giá tham khảo hoặc thiếu dữ liệu.',
    14: 'Click để mở đúng sheet/ô cần sửa cho cảnh báo quan trọng nhất.',
    15: 'Cảnh báo cần xử lý trước khi chốt giá bán.',
    16: 'Tóm tắt logic và các sheet nguồn đang được dùng.',
  });
  if (rows.length) {
    sheet.getRange(5, 1, rows.length, headers.length).setValues(rows);
    const fixLinkFormulas = [];
    for (let i = 0; i < rows.length; i++) {
      const r = i + 5;
      const menuRow = menuRows[i] || {};
      const item = summariesByRecipe[normMocoCostText_(menuRow.recipeName || menuRow.onlineName)] || {};
      const yieldInfo = getMocoMenuYieldInfo_(item, menuRow);
      const status = statusMap[normMocoCostText_(item.cake)] || { statuses: {}, tempCount: 0, issueCount: item.issueRows || 0 };
      const price = parseMocoReviewPrice_(menuRow.price);
      const foodCost = rows[i][4];
      const warning = rows[i][14];
      sheet.getRange(r, 3).setFormula('=IFERROR(INDEX(FILTER(\'THÀNH PHẨM/MẺ\'!$J:$J;\'THÀNH PHẨM/MẺ\'!$A:$A=$B' + r + ');1);"")');
      sheet.getRange(r, 4).setFormula('=IFERROR(VLOOKUP($B' + r + ';\'MENU & GIÁ\'!$A:$F;6;FALSE);"")');
      sheet.getRange(r, 5).setFormula('=IFERROR(IF(OR($C' + r + '="";$D' + r + '="");"";$C' + r + '/$D' + r + ');"")');
      sheet.getRange(r, 6).setFormula('=IFERROR(IF($C' + r + '="";"";CEILING($C' + r + '/\'COST CFG\'!$B$2;\'COST CFG\'!$B$11));"")');
      sheet.getRange(r, 7).setFormula('=IFERROR(IF(\'COST CFG\'!$B$8>0;SUM(\'COST CFG\'!$B$4:$B$7)/\'COST CFG\'!$B$8;0);"")');
      sheet.getRange(r, 8).setFormula('=IFERROR(IF($C' + r + '="";"";CEILING(($C' + r + '+$G' + r + ')/\'COST CFG\'!$B$2;\'COST CFG\'!$B$11));"")');
      sheet.getRange(r, 9).setFormula('=IFERROR(IF(OR($C' + r + '="";$D' + r + '="");"";$D' + r + '-$C' + r + ');"")');
      sheet.getRange(r, 10).setFormula('=IFERROR(IF(OR($C' + r + '="";$D' + r + '="");"";$D' + r + '-$C' + r + '-$G' + r + ');"")');
      sheet.getRange(r, 11).setFormula('=IFERROR(IF(OR($C' + r + '="";$D' + r + '="");"";IF($D' + r + '>$C' + r + ';ROUNDUP(SUM(\'COST CFG\'!$B$4:$B$7)/($D' + r + '-$C' + r + ');0);""));"")');
      sheet.getRange(r, 12).setFormula('=IFERROR(IF($C' + r + '="";"";CEILING($C' + r + '/(1-\'COST CFG\'!$B$12);\'COST CFG\'!$B$11));"")');
      fixLinkFormulas.push([buildMocoPricingFixTargetFormula_(ss, item, status, yieldInfo, price, foodCost, config, menuRow, warning)]);
    }
    sheet.getRange(5, 14, rows.length, 1).setFormulas(fixLinkFormulas);
    sheet.getRange(5, 3, rows.length, 2).setNumberFormat('#,##0 [$đ-42A]');
    sheet.getRange(5, 5, rows.length, 1).setNumberFormat('0.00%');
    sheet.getRange(5, 6, rows.length, 5).setNumberFormat('#,##0 [$đ-42A]');
    sheet.getRange(5, 11, rows.length, 1).setNumberFormat('#,##0');
    sheet.getRange(5, 12, rows.length, 1).setNumberFormat('#,##0 [$đ-42A]');
    applyMocoPricingFormatting_(sheet, rows.length);
  }
  sheet.setFrozenRows(4);
  [260, 120, 150, 150, 120, 170, 150, 170, 160, 160, 170, 170, 220, 260, 420, 520].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).setWrap(true).setVerticalAlignment('middle');
  applyMocoPricingDashboardUi_(ss);
}

function writeMocoOrderOnlineSheet_(ss) {
  let sheet = ss.getSheetByName(MOCO_ORDER_ONLINE_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_ORDER_ONLINE_SHEET);
  const existingValues = sheet.getLastRow() >= 5 ? sheet.getRange(5, 1, sheet.getLastRow() - 4, 14).getValues() : [];
  sheet.clear().clearFormats().clearConditionalFormatRules();

  const headers = ['Ngày đơn', 'Kênh', 'Mã đơn', 'Khách hàng', 'SĐT', 'SKU', 'Tên món', 'SL', 'Giá bán', 'Phí ship', 'Giảm giá', 'Doanh thu thực nhận', 'Trạng thái', 'Ghi chú'];
  sheet.getRange(1, 1, 1, headers.length).merge()
    .setValue('ORDER TMP')
    .setFontWeight('bold').setFontSize(15).setBackground('#0B8043').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, headers.length).merge()
    .setValue('Nhập đơn online thủ công. Chọn SKU để tự kéo tên món và giá bán từ MENU & GIÁ.')
    .setBackground('#E6F4EA').setFontColor('#174EA6').setWrap(true);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF').setHorizontalAlignment('center');

  const maxRows = Math.max(existingValues.length, 300);
  if (existingValues.length) {
    sheet.getRange(5, 1, existingValues.length, headers.length).setValues(existingValues);
  }
  for (let i = 0; i < maxRows; i++) {
    const r = i + 5;
    sheet.getRange(r, 7).setFormula('=IF($F' + r + '="";"";IFERROR(VLOOKUP($F' + r + ';\'MENU & GIÁ\'!$A$5:$K;2;FALSE);"SKU chưa có"))');
    sheet.getRange(r, 9).setFormula('=IF($F' + r + '="";"";IFERROR(VLOOKUP($F' + r + ';\'MENU & GIÁ\'!$A$5:$K;6;FALSE);""))');
    sheet.getRange(r, 12).setFormula('=IF($F' + r + '="";"";IFERROR($H' + r + '*$I' + r + '-$K' + r + '+$J' + r + ';0))');
  }

  const channelRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Facebook', 'Instagram', 'Zalo', 'Website', 'ShopeeFood', 'Khác'], true)
    .setAllowInvalid(false)
    .build();
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Mới', 'Đã xác nhận', 'Đang làm', 'Đã giao', 'Hủy'], true)
    .setAllowInvalid(false)
    .build();
  const menuSheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  if (menuSheet && menuSheet.getLastRow() >= 5) {
    const skuRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(menuSheet.getRange(5, 1, Math.max(menuSheet.getLastRow() - 4, 1), 1), true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(5, 6, maxRows, 1).setDataValidation(skuRule);
  }
  sheet.getRange(5, 2, maxRows, 1).setDataValidation(channelRule);
  sheet.getRange(5, 13, maxRows, 1).setDataValidation(statusRule);
  sheet.getRange(5, 1, maxRows, 1).setNumberFormat('dd/mm/yyyy');
  sheet.getRange(5, 8, maxRows, 1).setNumberFormat('#,##0');
  sheet.getRange(5, 9, maxRows, 4).setNumberFormat('#,##0 [$đ-42A]');
  sheet.setFrozenRows(4);
  [110, 120, 130, 180, 130, 120, 260, 80, 120, 110, 110, 160, 130, 280].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), maxRows + 4), headers.length).setWrap(true).setVerticalAlignment('middle');
  applyMocoOrderOnlineUi_(ss);
}

function writeMocoCostBomMapSheet_(ss) {
  const details = readMocoCostDetails_(ss);
  const seen = {};
  const rows = [];
  details.forEach(row => {
    const key = normMocoCostText_(row.ingredient);
    if (!key || seen[key]) return;
    seen[key] = true;
    const type = classifyMocoBomType_(row.ingredient);
    rows.push([
      row.ingredient,
      type.type,
      type.source,
      type.target,
      row.unit || row.masterUnit || '',
      row.status || '',
      buildMocoBomFounderAction_(row, type),
    ]);
  });

  let sheet = ss.getSheetByName(MOCO_COST_BOM_MAP_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_COST_BOM_MAP_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  const headers = ['Nguyên liệu trong CÔNG THỨC', 'Loại', 'Nguồn tính', 'Tên nguyên liệu chuẩn hoặc công thức con', 'Đơn vị chuẩn', 'Trạng thái', 'Quỳnh/Duyên cần làm'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF');
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Tên nguyên liệu xuất hiện trong CÔNG THỨC.',
    2: 'Phân loại cách tính: mua ngoài, tự làm, mix, packaging.',
    3: 'Nguồn cost nên dùng cho nguyên liệu này.',
    4: 'Tên nguyên liệu chuẩn trong danh mục hoặc tên công thức con cần khớp.',
    5: 'Đơn vị chuẩn để tính cost.',
    6: 'Trạng thái kỹ thuật từ COST CALC.',
    7: 'Việc Quỳnh/Duyên cần làm nếu dòng này chưa ổn.',
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  [260, 130, 180, 260, 110, 150, 420].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).setWrap(true).setVerticalAlignment('middle');
}

function writeMocoCostSubRecipeMapSheet_(ss) {
  const summaries = readMocoCostSummary_(ss);
  const byCake = summaries.reduce((out, item) => {
    out[normMocoCostText_(item.cake)] = item;
    return out;
  }, {});
  const seeds = [
    ['bánh quy hạnh nhân', 'bánh quy hạnh nhân giòn'],
    ['lady finger hạnh nhân', 'lady finger hạnh nhân ( bản điều chỉnh)'],
    ['cốt bông lan', ''],
    ['kem trứng', ''],
    ['sốt kem phô mai', ''],
    ['sữa chua Hy Lạp tự làm', 'SỮA CHUA HY LẠP'],
  ];
  const rows = seeds.map(seed => {
    const summary = byCake[normMocoCostText_(seed[1])] || null;
    const yieldInfo = summary ? parseMocoYieldUnits_(summary.yieldText) : { units: 0, unit: '', warning: 'Chưa có công thức con/thành phẩm sau khi làm' };
    const costUnit = summary && yieldInfo.units ? Math.round(summary.total / yieldInfo.units) : '';
    return [
      seed[0],
      seed[1],
      yieldInfo.units || '',
      yieldInfo.unit || '',
      summary ? summary.total : '',
      costUnit,
      summary && costUnit ? 'Đủ dữ liệu để đưa vào món chính' : 'Cần công thức con/thành phẩm sau khi làm',
    ];
  });

  let sheet = ss.getSheetByName(MOCO_COST_SUB_RECIPE_MAP_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_COST_SUB_RECIPE_MAP_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  const headers = ['Tên bán thành phẩm', 'Tên công thức con trong CÔNG THỨC', 'Thành phẩm sau 1 mẻ', 'Đơn vị thành phẩm', 'Cost / 1 mẻ', 'Cost / 1 đơn vị', 'Trạng thái'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF');
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Tên bán thành phẩm hoặc công thức con.',
    2: 'Tên công thức tương ứng trong CÔNG THỨC.',
    3: 'Số lượng thành phẩm sau một mẻ.',
    4: 'Đơn vị của thành phẩm sau khi làm: g, chiếc, hộp...',
    5: 'Tổng cost của một mẻ công thức con.',
    6: 'Cost quy về 1 đơn vị thành phẩm.',
    7: 'Cho biết công thức con đã đủ dữ liệu để đưa vào món chính hay còn thiếu thành phẩm/công thức.',
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 5, rows.length, 2).setNumberFormat('#,##0 [$đ-42A]');
  [220, 300, 130, 120, 140, 150, 260].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, sheet.getLastRow(), headers.length).setWrap(true).setVerticalAlignment('middle');
}

function writeMocoYieldMapSheet_(ss) {
  const config = getMocoCostConfig_(ss);
  const summaries = readMocoSellableCostSummaries_(ss);
  const summariesByRecipe = summaries.reduce((out, item) => {
    out[normMocoCostText_(item.cake)] = item;
    return out;
  }, {});
  const menu = readMocoMenuRows_(ss.getSheetByName(MOCO_MENU_ONLINE_SHEET));
  const menuRows = menu.rows.length ? menu.rows : buildMocoSellableMenuItems_(summaries, menu);
  const normalRows = [];
  const cheesecakeRows = [];
  const normalFormulaMeta = [];

  menuRows.forEach(menuRow => {
    const summary = summariesByRecipe[normMocoCostText_(menuRow.recipeName || menuRow.onlineName)] || {};
    const variant = getMocoMenuCostVariant_(menuRow);
    const parsedYield = parseMocoYieldUnits_(summary.yieldText || '');
    const saleQty = parseMocoMenuSaleQty_(menuRow.saleQty, menuRow.spec);
    const costPerSaleUnit = summary.total ? calcMocoMenuCostPerUnit_(summary, menuRow, config) : '';
    const warnings = [];
    if (!summary.cake) warnings.push('Chưa khớp tên công thức trong CÔNG THỨC');

    if (variant) {
      const costBeforeWaste = summary.total ? summary.total * variant.multiplier : '';
      cheesecakeRows.push([
        menuRow.sku || '',
        menuRow.onlineName || '',
        menuRow.recipeName || summary.cake || '',
        '1 chiếc size 14',
        summary.total || '',
        variant.displayRatio || variant.multiplier || '',
        'công thức chuẩn / 1 chiếc ' + (variant.size || ''),
        '1 chiếc',
        costBeforeWaste || '',
        costPerSaleUnit || '',
        'Cost quy chuẩn = VLOOKUP(Tên công thức; COST CALC!A:B; 2). 1 chiếc ' + variant.size + ' = ' + (variant.displayRatio || variant.multiplier) + ' công thức chuẩn size 14. Cost bán = cost chuẩn x hệ số x (1 + hao hụt từ COST CFG).',
        warnings.join(' | '),
      ]);
      return;
    }

    const yieldInfo = getMocoMenuYieldInfo_(summary, menuRow);
    if (yieldInfo.warning) warnings.push(yieldInfo.warning);
    if (menuRow.hasLegacyYieldSpec) warnings.push('MENU & GIÁ còn quy cách cũ có chữ mẻ/công thức; đã tách khỏi logic tính');
    const costBeforeWaste = summary.total && parsedYield.units
      ? (summary.total / parsedYield.units) * (saleQty || 1)
      : '';
    normalRows.push([
      menuRow.sku || '',
      menuRow.onlineName || '',
      menuRow.recipeName || summary.cake || '',
      '1 mẻ',
      summary.total || '',
      parsedYield.units || '',
      parsedYield.unit ? parsedYield.unit + ' / mẻ' : '',
      menuRow.spec || '',
      costBeforeWaste || '',
      costPerSaleUnit || '',
      'Cost quy chuẩn = VLOOKUP(Tên công thức; COST CALC!A:B; 2). Cost bán = Cost quy chuẩn / Sản lượng mỗi mẻ x Số thành phẩm trong 1 đơn vị bán x (1 + hao hụt từ COST CFG).',
      warnings.join(' | '),
    ]);
    normalFormulaMeta.push({ saleQty: saleQty || 1 });
  });

  let sheet = ss.getSheetByName(MOCO_YIELD_MAP_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_YIELD_MAP_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();

  const normalHeaders = [
    'SKU', 'Tên món bán', 'Tên công thức', 'Quy chuẩn', 'Cost quy chuẩn',
    'Sản lượng / hệ số', 'Đơn vị quy đổi', 'Đơn vị bán', 'Cost trước hao hụt', 'Cost / đơn vị bán',
    'Công thức tính', 'Cảnh báo',
  ];
  const cheesecakeHeaders = [
    'SKU', 'Tên món bán', 'Tên công thức', 'Quy chuẩn', 'Cost quy chuẩn',
    'Sản lượng / hệ số', 'Đơn vị quy đổi', 'Đơn vị bán', 'Cost trước hao hụt', 'Cost / đơn vị bán',
    'Công thức tính', 'Cảnh báo',
  ];
  const maxCols = Math.max(normalHeaders.length, cheesecakeHeaders.length);

  sheet.getRange(1, 1, 1, maxCols).merge()
    .setValue('THÀNH PHẨM/MẺ - AUDIT COST')
    .setFontWeight('bold').setFontSize(15).setBackground('#0B8043').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, maxCols).merge()
    .setValue('Tách 2 logic để founder dễ đọc: món thường trả lời "1 mẻ ra bao nhiêu đơn vị"; cheesecake dùng 1 chiếc size 14 làm công thức chuẩn rồi nhân hệ số theo size. Không sửa tay ở đây; sửa yield trong CÔNG THỨC và quy cách bán trong MENU & GIÁ.')
    .setBackground('#E6F4EA').setFontColor('#174EA6').setWrap(true);

  sheet.getRange(4, 1, 1, maxCols).merge()
    .setValue('BẢNG 1 - MÓN THƯỜNG: 1 MẺ RA BAO NHIÊU ĐƠN VỊ')
    .setFontWeight('bold').setBackground('#174EA6').setFontColor('#FFFFFF');
  sheet.getRange(5, 1, 1, normalHeaders.length).setValues([normalHeaders])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF').setHorizontalAlignment('center');
  if (normalRows.length) {
    sheet.getRange(6, 1, normalRows.length, normalHeaders.length).setValues(normalRows);
    const normalCostFormulas = [];
    const normalBeforeWasteFormulas = [];
    const normalAfterWasteFormulas = [];
    for (let i = 0; i < normalRows.length; i++) {
      const r = 6 + i;
      const saleQtyFactor = Number(normalFormulaMeta[i] && normalFormulaMeta[i].saleQty) || 1;
      normalCostFormulas.push(['=IFERROR(VLOOKUP($C' + r + ';\'COST CALC\'!$A:$F;2;FALSE);"")']);
      normalBeforeWasteFormulas.push(['=IFERROR(IF(OR($E' + r + '="";$F' + r + '="");"";$E' + r + '/$F' + r + '*' + saleQtyFactor + ');"")']);
      normalAfterWasteFormulas.push(['=IFERROR(IF($I' + r + '="";"";ROUND($I' + r + '*(1+\'COST CFG\'!$B$3);0));"")']);
    }
    sheet.getRange(6, 5, normalRows.length, 1).setFormulas(normalCostFormulas);
    sheet.getRange(6, 9, normalRows.length, 1).setFormulas(normalBeforeWasteFormulas);
    sheet.getRange(6, 10, normalRows.length, 1).setFormulas(normalAfterWasteFormulas);
    sheet.getRange(6, 5, normalRows.length, 1).setNumberFormat('#,##0 [$đ-42A]');
    sheet.getRange(6, 6, normalRows.length, 1).setNumberFormat('0.##');
    sheet.getRange(6, 9, normalRows.length, 2).setNumberFormat('#,##0 [$đ-42A]');
  }
  setMocoHeaderNotes_(sheet, 5, {
    4: 'Mốc chuẩn để tính cost: 1 mẻ với món thường.',
    5: 'Cost của mốc quy chuẩn.',
    6: 'Món thường: một mẻ ra bao nhiêu thành phẩm.',
    7: 'Đơn vị của sản lượng/hệ số.',
    8: 'Đơn vị bán cho khách trong MENU & GIÁ.',
    9: 'Cost cho 1 đơn vị bán trước hao hụt.',
    10: 'Cost cho 1 đơn vị bán sau hao hụt theo COST CFG.',
    11: 'Công thức logic đang áp dụng.',
    12: 'Cảnh báo dữ liệu nếu có.',
  });

  const cheesecakeTitleRow = 7 + normalRows.length;
  const cheesecakeHeaderRow = cheesecakeTitleRow + 1;
  const cheesecakeDataRow = cheesecakeHeaderRow + 1;
  sheet.getRange(cheesecakeTitleRow, 1, 1, maxCols).merge()
    .setValue('BẢNG 2 - CHEESECAKE: 1 CHIẾC SIZE 14 LÀ CÔNG THỨC CHUẨN')
    .setFontWeight('bold').setBackground('#8A4B00').setFontColor('#FFFFFF');
  sheet.getRange(cheesecakeHeaderRow, 1, 1, cheesecakeHeaders.length).setValues([cheesecakeHeaders])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF').setHorizontalAlignment('center');
  if (cheesecakeRows.length) {
    sheet.getRange(cheesecakeDataRow, 6, cheesecakeRows.length, 1).setNumberFormat('@');
    sheet.getRange(cheesecakeDataRow, 1, cheesecakeRows.length, cheesecakeHeaders.length).setValues(cheesecakeRows);
    const cheesecakeCostFormulas = [];
    const cheesecakeBeforeWasteFormulas = [];
    const cheesecakeAfterWasteFormulas = [];
    for (let i = 0; i < cheesecakeRows.length; i++) {
      const r = cheesecakeDataRow + i;
      const ratioFormula = 'IF(REGEXMATCH($F' + r + ';"/");VALUE(INDEX(SPLIT($F' + r + ';"/");1;1))/VALUE(INDEX(SPLIT($F' + r + ';"/");1;2));VALUE($F' + r + '))';
      cheesecakeCostFormulas.push(['=IFERROR(VLOOKUP($C' + r + ';\'COST CALC\'!$A:$F;2;FALSE);"")']);
      cheesecakeBeforeWasteFormulas.push(['=IFERROR(IF(OR($E' + r + '="";$F' + r + '="");"";$E' + r + '*' + ratioFormula + ');"")']);
      cheesecakeAfterWasteFormulas.push(['=IFERROR(IF($I' + r + '="";"";ROUND($I' + r + '*(1+\'COST CFG\'!$B$3);0));"")']);
    }
    sheet.getRange(cheesecakeDataRow, 5, cheesecakeRows.length, 1).setFormulas(cheesecakeCostFormulas);
    sheet.getRange(cheesecakeDataRow, 9, cheesecakeRows.length, 1).setFormulas(cheesecakeBeforeWasteFormulas);
    sheet.getRange(cheesecakeDataRow, 10, cheesecakeRows.length, 1).setFormulas(cheesecakeAfterWasteFormulas);
    sheet.getRange(cheesecakeDataRow, 5, cheesecakeRows.length, 1).setNumberFormat('#,##0 [$đ-42A]');
    sheet.getRange(cheesecakeDataRow, 9, cheesecakeRows.length, 2).setNumberFormat('#,##0 [$đ-42A]');
  }
  setMocoHeaderNotes_(sheet, cheesecakeHeaderRow, {
    4: 'Mốc chuẩn để tính cost cheesecake.',
    5: 'Cost của 1 chiếc size 14.',
    6: 'Hệ số nhân nguyên liệu so với size 14 cho đúng 1 chiếc size đang bán.',
    7: 'Đơn vị của sản lượng/hệ số.',
    8: 'Đơn vị bán cho khách trong MENU & GIÁ.',
    9: 'Cost trước hao hụt = cost chuẩn x hệ số.',
    10: 'Cost sau hao hụt theo COST CFG.',
    11: 'Công thức logic đang áp dụng.',
    12: 'Cảnh báo dữ liệu nếu có.',
  });

  sheet.setFrozenRows(5);
  [120, 260, 260, 150, 150, 130, 170, 130, 150, 150, 520, 420].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), maxCols).setWrap(true).setVerticalAlignment('middle');
  applyMocoYieldMapUi_(ss);
}

function writeMocoFounderActionSimpleSheet_(ss) {
  const details = readMocoCostDetails_(ss);
  const menu = readMocoMenuRows_(ss.getSheetByName(MOCO_MENU_ONLINE_SHEET));
  const summaries = readMocoSellableCostSummaries_(ss);
  const summariesByRecipe = summaries.reduce((out, item) => {
    out[normMocoCostText_(item.cake)] = item;
    return out;
  }, {});
  const config = getMocoCostConfig_(ss);
  const existingResponseMap = readMocoFounderActionResponseMap_(ss.getSheetByName(MOCO_FOUNDER_ACTION_SHEET));
  const rows = [];
  const seen = {};

  details.forEach(row => {
    const key = normMocoCostText_([row.ingredient, row.status, row.rawQty].join('|'));
    if (!row.ingredient || seen[key]) return;
    seen[key] = true;
    const action = buildMocoSimpleFounderActionFromDetail_(row);
    if (!action) return;
    rows.push(action);
  });

  const tempItems = details
    .filter(row => row.status === 'OK_TEMP_PRICE')
    .map(row => row.ingredient)
    .filter((value, index, array) => array.indexOf(value) === index);
  if (tempItems.length) {
    rows.push([
      'P3',
      'Không cần làm ngay',
      'Giá tham khảo/tạm cho ' + tempItems.length + ' nguyên liệu',
      'Nhiều món',
      'Sau khi mua thật thì nhập ở NHẬP HÀNG',
      tempItems.slice(0, 12).join(', ') + (tempItems.length > 12 ? '...' : ''),
      'ĐANG DÙNG GIÁ TẠM',
    ]);
  }

  const blankPriceItems = menu.rows.filter(row => !parseMocoReviewPrice_(row.price));
  if (blankPriceItems.length) {
    rows.unshift([
      'P1',
      'Nhập giá bán hiện tại',
      blankPriceItems.length + ' SKU chưa có giá bán',
      blankPriceItems.map(row => row.onlineName).slice(0, 5).join(', '),
      'MENU & GIÁ cột Giá bán hiện tại',
      'Có giá bán thì dashboard mới tính được food cost % và lãi gộp.',
      'CẦN GIÁ BÁN',
    ]);
  }

  if (config.fixedCostMonthly && !config.plannedUnitsMonth) {
    rows.unshift([
      'P0',
      'Nhập sản lượng bán dự kiến/tháng',
      'Lương founder + marketing + điện nước + hao hụt cố định',
      'Tất cả món bán',
      'COST CFG dòng Planned sellable units/month',
      'Đang có fixed cost dự kiến khoảng ' + Math.round(config.fixedCostMonthly).toLocaleString('vi-VN') + 'đ/tháng nhưng chưa có sản lượng để phân bổ vào giá.',
      'CẦN SẢN LƯỢNG THÁNG',
    ]);
  }

  menu.rows.forEach(menuRow => {
    const summary = summariesByRecipe[normMocoCostText_(menuRow.recipeName || menuRow.onlineName)] || {};
    if (!getMocoMenuCostVariant_(menuRow)) {
      const yieldInfo = parseMocoYieldUnits_(summary.yieldText || '');
      if (!yieldInfo.units) {
        rows.unshift([
          'P0',
          'Bổ sung thành phẩm sau 1 mẻ',
          menuRow.recipeName || menuRow.onlineName,
          menuRow.onlineName || 'Món trong MENU & GIÁ',
          'CÔNG THỨC - dòng thành phẩm/yield của công thức',
          'Không tính giá bừa: cần biết 1 mẻ công thức ra bao nhiêu chiếc/hộp/g/ml.',
          'CẦN THÀNH PHẨM/MẺ',
        ]);
      }
      if (!parseMocoMenuSaleQty_(menuRow.saleQty, menuRow.spec)) {
        rows.unshift([
          'P1',
          'Nhập số thành phẩm / đơn vị bán',
          menuRow.onlineName || menuRow.recipeName,
          menuRow.recipeName || '',
          'MENU & GIÁ cột Số thành phẩm / đơn vị bán',
          'Ví dụ bán 1 chiếc thì nhập 1; hộp 6 chiếc thì nhập 6.',
          'CẦN QUY CÁCH BÁN',
        ]);
      }
    }
    if (menuRow.hasLegacyYieldSpec) {
      rows.unshift([
        'P1',
        'Tách yield khỏi quy cách bán',
        menuRow.onlineName || menuRow.recipeName,
        menuRow.recipeName || '',
        'MENU & GIÁ cột Quy cách bán',
        'Quy cách bán không được chứa "/ mẻ ..."; yield phải nằm ở CÔNG THỨC.',
        'CẦN QUY CÁCH BÁN',
      ]);
    }
  });

  let sheet = ss.getSheetByName(MOCO_FOUNDER_ACTION_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_FOUNDER_ACTION_SHEET);
  sheet.clear().clearFormats().clearConditionalFormatRules();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();
  const headers = [
    'Ưu tiên',
    'Việc cần làm',
    'Nguyên liệu / món',
    'Ảnh hưởng đến món bán',
    'Quỳnh/Duyên điền ở đâu',
    'Ghi chú ngắn',
    'Trạng thái hệ thống',
    'Người xử lý',
    'Phản hồi / thắc mắc',
    'Tình trạng xử lý',
    'Cập nhật lúc',
  ];
  sheet.getRange(1, 1, 1, headers.length).merge()
    .setValue('VIỆC CẦN LÀM - QUỲNH / DUYÊN')
    .setFontWeight('bold').setFontSize(15).setBackground('#B3261E').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, headers.length).merge()
    .setValue('Quỳnh/Duyên xử lý P0/P1 trước. Nếu đã sửa, có thắc mắc, hoặc muốn Admin kiểm tra lại thì ghi ở cột Phản hồi / thắc mắc và chọn Tình trạng xử lý.')
    .setBackground('#FEF7E0').setFontColor('#8A4B00').setWrap(true);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF').setHorizontalAlignment('center');
  setMocoHeaderNotes_(sheet, 4, {
    1: 'Mức ưu tiên. P0/P1 làm trước.',
    2: 'Loại việc cần xử lý.',
    3: 'Nguyên liệu hoặc món bị ảnh hưởng.',
    4: 'Món bán/công thức liên quan.',
    5: 'Sheet và cột cần cập nhật.',
    6: 'Giải thích ngắn để biết cần sửa gì.',
    7: 'Trạng thái hệ thống tự tính. Không cần sửa tay.',
    8: 'Ai đang xử lý dòng này: Quỳnh, Duyên, Admin hoặc người khác.',
    9: 'Ghi ở đây nếu đã sửa, có thắc mắc, hoặc muốn Admin kiểm tra lại.',
    10: 'Chọn tình trạng xử lý của người dùng. Dòng đã sửa sẽ được kiểm tra lại khi chạy tính cost/pricing.',
    11: 'Tự cập nhật khi sửa cột Người xử lý, Phản hồi hoặc Tình trạng xử lý.',
  });
  if (rows.length) {
    rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const outputRows = rows.map(row => {
      const response = existingResponseMap[getMocoFounderActionKey_(row)]
        || existingResponseMap[getMocoFounderActionStableKey_(row)]
        || {};
      return row.concat([
        response.owner || '',
        response.comment || '',
        response.workflowStatus || classifyMocoFounderResponseStatus_(response.comment, ''),
        response.updatedAt || '',
      ]);
    });
    sheet.getRange(5, 1, outputRows.length, headers.length).setValues(outputRows);
    const targetFormulas = rows.map(row => [buildMocoFounderActionTargetFormula_(ss, row)]);
    sheet.getRange(5, 5, rows.length, 1).setFormulas(targetFormulas);
    applyMocoFounderSimpleFormatting_(sheet, rows.length);
  }
  sheet.setFrozenRows(4);
  [90, 220, 260, 300, 380, 420, 170, 120, 360, 210, 150].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).setWrap(true).setVerticalAlignment('middle');
  applyMocoFounderActionUi_(ss);
}

function getMocoFounderActionKey_(row) {
  return normMocoCostText_([row[1], row[2], row[3]].join('|'));
}

function getMocoFounderActionStableKey_(row) {
  return normMocoCostText_([row[2], row[3]].join('|'));
}

function readMocoFounderActionResponseMap_(sheet) {
  const out = {};
  if (!sheet || sheet.getLastRow() < 5) return out;
  const width = Math.max(sheet.getLastColumn(), 11);
  const values = sheet.getRange(4, 1, sheet.getLastRow() - 3, width).getDisplayValues();
  const headers = values[0].map(value => normMocoCostText_(value));
  const ownerIdx = findMocoHeaderIndex_(headers, ['nguoi xu ly']);
  const commentIdx = findMocoHeaderIndex_(headers, ['phan hoi', 'thac mac', 'comment']);
  const statusIdx = findMocoHeaderIndex_(headers, ['tinh trang xu ly']);
  const updatedIdx = findMocoHeaderIndex_(headers, ['cap nhat luc']);
  values.slice(1).forEach(row => {
    if (!row[1] && !row[2] && !row[3]) return;
    const key = getMocoFounderActionKey_(row);
    const legacyComments = row.slice(7).map(value => String(value || '').trim()).filter(Boolean);
    const comment = commentIdx >= 0 ? String(row[commentIdx] || '').trim() : legacyComments.join(' | ');
    const owner = ownerIdx >= 0 ? String(row[ownerIdx] || '').trim() : '';
    const workflowStatus = statusIdx >= 0 ? String(row[statusIdx] || '').trim() : classifyMocoFounderResponseStatus_(comment, '');
    const updatedAt = updatedIdx >= 0 ? String(row[updatedIdx] || '').trim() : '';
    const normalizedOwner = owner === 'Codex' ? 'Admin' : owner;
    const normalizedWorkflowStatus = workflowStatus.replace('Codex', 'Admin');
    if (normalizedOwner || comment || normalizedWorkflowStatus || updatedAt) {
      const response = { owner: normalizedOwner, comment, workflowStatus: normalizedWorkflowStatus, updatedAt };
      out[key] = response;
      const stableKey = getMocoFounderActionStableKey_(row);
      if (stableKey && !out[stableKey]) out[stableKey] = response;
    }
  });
  return out;
}

function findMocoHeaderIndex_(headers, candidates) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || '';
    if (candidates.some(candidate => header.indexOf(candidate) >= 0)) return i;
  }
  return -1;
}

function classifyMocoFounderResponseStatus_(comment, fallback) {
  const text = normMocoCostText_(comment);
  if (fallback) return fallback;
  if (!text) return 'Chưa xử lý';
  if (text.indexOf('da sua') >= 0 || text.indexOf('da giai quyet') >= 0 || text.indexOf('done') >= 0 || text.indexOf('xong') >= 0) {
    return 'Đã xử lý - chờ kiểm tra lại';
  }
  if (text.indexOf('khong hieu') >= 0 || text.indexOf('ko hieu') >= 0 || text.indexOf('?') >= 0 || text.indexOf('thac mac') >= 0) {
    return 'Cần Admin phản hồi';
  }
  return 'Có phản hồi';
}

function MOCO_REFRESH_FOUNDER_ACTION() {
  const ss = getMocoSpreadsheet_();
  writeMocoFounderActionSimpleSheet_(ss);
  return {
    sheet: MOCO_FOUNDER_ACTION_SHEET,
    rows: Math.max((ss.getSheetByName(MOCO_FOUNDER_ACTION_SHEET) || { getLastRow: () => 4 }).getLastRow() - 4, 0),
  };
}

function MOCO_DEBUG_FOUNDER_ACTION_ROWS() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(MOCO_FOUNDER_ACTION_SHEET);
  if (!sheet || sheet.getLastRow() < 5) {
    return { sheet: MOCO_FOUNDER_ACTION_SHEET, rows: [] };
  }
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, Math.min(sheet.getLastColumn(), 11)).getDisplayValues();
  return {
    sheet: MOCO_FOUNDER_ACTION_SHEET,
    rows: values
      .map((row, index) => ({
        rowNumber: index + 5,
        priority: row[0],
        action: row[1],
        item: row[2],
        affected: row[3],
        target: row[4],
        note: row[5],
        systemStatus: row[6],
        owner: row[7],
        response: row[8],
        workflowStatus: row[9],
        updatedAt: row[10],
      }))
      .filter(row => row.priority || row.action || row.item || row.response || row.workflowStatus),
  };
}

function MOCO_DEBUG_RECIPE_YIELD_CANDIDATES() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(MOCO_COST_RECIPE_SHEET);
  if (!sheet) return { sheet: MOCO_COST_RECIPE_SHEET, rows: [] };
  const data = sheet.getDataRange().getDisplayValues();
  const lookup = buildMocoRecipeYieldLookup_(data);
  const targets = ['BÁNH MÌ CUỘN QUẾ', 'KETO TIRAMISU'];
  const rows = [];
  let currentCake = '';
  data.forEach((row, index) => {
    if (index === 0) return;
    if (row[0]) currentCake = String(row[0]).trim();
    const currentKey = normMocoCostText_(currentCake);
    if (!targets.some(target => currentKey === normMocoCostText_(target))) return;
    const joined = row.slice(0, 12).join(' ');
    const key = normMocoCostText_(joined);
    const hasYieldSignal = key.indexOf('thanh pham') >= 0
      || key.indexOf('yield') >= 0
      || key.indexOf('me') >= 0
      || key.indexOf('hop') >= 0
      || key.indexOf('chiec') >= 0
      || key.indexOf('banh') >= 0;
    if (!hasYieldSignal && index + 1 !== 93) return;
    rows.push({
      rowNumber: index + 1,
      currentCake,
      cellsAtoL: row.slice(0, 12),
      candidates: getMocoYieldCandidatesFromRecipeRow_(row),
    });
  });
  return {
    sheet: MOCO_COST_RECIPE_SHEET,
    parsed: targets.map(target => ({
      cake: target,
      yieldText: lookup[normMocoCostText_(target)] || '',
    })),
    rows,
  };
}

function MOCO_DEBUG_VINEGAR_STATE() {
  const ss = getMocoSpreadsheet_();
  const targetKeys = ['giấm', 'dấm', 'vinegar', 'trung thành', 'trung thanh'].map(normMocoCostText_);
  const hasVinegarKey = value => {
    const key = normMocoCostText_(value);
    return targetKeys.some(targetKey => key.indexOf(targetKey) >= 0);
  };
  const output = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  const master = ss.getSheetByName(MOCO_COST_MASTER_SHEET);
  const nhap = ss.getSheetByName(getMocoNhapHangSheetName_());
  const costRows = readMocoCostDetails_(ss)
    .filter(row => hasVinegarKey([row.ingredient, row.match, row.note].join(' ')))
    .map(row => ({
      cake: row.cake,
      ingredient: row.ingredient,
      rawQty: row.rawQty,
      parsedAmount: row.amount,
      parsedUnit: row.unit,
      match: row.match,
      masterUnit: row.masterUnit,
      unitPrice: row.unitPrice,
      lineCost: row.lineCost,
      status: row.status,
      note: row.note,
    }));
  const masterRows = master && master.getLastRow() >= 2
    ? master.getRange(2, 1, master.getLastRow() - 1, Math.min(master.getLastColumn(), 12)).getDisplayValues()
      .filter(row => hasVinegarKey(row.join(' ')))
    : [];
  const nhapRows = nhap && nhap.getLastRow() >= 2
    ? nhap.getRange(2, 1, nhap.getLastRow() - 1, Math.min(nhap.getLastColumn(), 10)).getDisplayValues()
      .map((row, index) => ({ rowNumber: index + 2, values: row }))
      .filter(item => hasVinegarKey(item.values.join(' ')))
    : [];
  return {
    costCalcSheet: output ? output.getName() : MOCO_COST_OUTPUT_SHEET,
    costRows,
    masterRows,
    nhapRows,
  };
}

function MOCO_DEBUG_ONLINE_BAKERY_STATE() {
  const ss = getMocoSpreadsheet_();
  const menuSheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  const founderSheet = ss.getSheetByName(MOCO_FOUNDER_ACTION_SHEET);
  const detailRows = readMocoCostDetails_(ss);

  const menuNames = menuSheet && menuSheet.getLastRow() >= 5
    ? menuSheet.getRange(5, 2, menuSheet.getLastRow() - 4, 2).getDisplayValues()
      .filter(row => row[0] || row[1])
      .map(row => ({ onlineName: row[0], recipeName: row[1] }))
    : [];
  const founderRows = founderSheet && founderSheet.getLastRow() >= 5
    ? founderSheet.getRange(5, 1, founderSheet.getLastRow() - 4, Math.min(founderSheet.getLastColumn(), 11)).getDisplayValues()
      .filter(row => row.some(Boolean))
      .map(row => ({
        priority: row[0],
        action: row[1],
        item: row[2],
        cake: row[3],
        target: row[4],
        systemStatus: row[6],
        owner: row[7],
        response: row[8],
        workflowStatus: row[9],
        updatedAt: row[10],
      }))
    : [];

  return {
    menuCount: menuNames.length,
    menuHasSuaChuaHyLap: menuNames.some(row => normMocoCostText_(row.onlineName + ' ' + row.recipeName).indexOf('sua chua hy lap') >= 0),
    menuNames,
    masterCreamRows: debugMocoMasterRowsByKeyword_(ss, 'cream'),
    founderRows: founderRows.filter(row => {
      const key = normMocoCostText_(row.item + ' ' + row.cake + ' ' + row.action);
      return key.indexOf('banh quy hanh nhan') >= 0 || key.indexOf('sua chua hy lap') >= 0 || key.indexOf('cream') >= 0;
    }),
    costDetails: detailRows.filter(row => {
      const key = normMocoCostText_(row.ingredient + ' ' + row.cake + ' ' + row.match);
      return key.indexOf('banh quy hanh nhan') >= 0 || key.indexOf('sua chua hy lap') >= 0;
    }).map(row => ({
      cake: row.cake,
      ingredient: row.ingredient,
      rawQty: row.rawQty,
      match: row.match,
      masterUnit: row.masterUnit,
      unitPrice: row.unitPrice,
      lineCost: row.lineCost,
      status: row.status,
      note: row.note,
    })),
  };
}

function debugMocoMasterRowsByKeyword_(ss, keyword) {
  const sheet = ss.getSheetByName(MOCO_COST_MASTER_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const idx = getMocoCostMasterHeaderIndexes_(values[0] || []);
  const key = normMocoCostText_(keyword);
  return values.slice(1)
    .filter(row => normMocoCostText_(row[idx.name]).indexOf(key) >= 0)
    .map(row => ({
      name: row[idx.name],
      category: row[idx.category],
      unit: row[idx.unit],
      latest: row[idx.latest],
      avg: row[idx.avg],
      costFlag: row[idx.costFlag],
    }));
}

function MOCO_DEBUG_LADY_FINGER_STATE() {
  const ss = getMocoSpreadsheet_();
  const detailRows = readMocoCostDetails_(ss).filter(row => {
    const key = normMocoCostText_(row.ingredient + ' ' + row.cake + ' ' + row.match);
    return key.indexOf('lady finger') >= 0;
  });
  return {
    costDetails: detailRows,
    subRecipeRows: debugMocoSheetRowsByKeyword_(ss, MOCO_COST_SUB_RECIPE_MAP_SHEET, 'lady finger'),
    bomRows: debugMocoSheetRowsByKeyword_(ss, MOCO_COST_BOM_MAP_SHEET, 'lady finger'),
    masterRows: debugMocoSheetRowsByKeyword_(ss, MOCO_COST_MASTER_SHEET, 'lady finger'),
    reviewRows: debugMocoSheetRowsByKeyword_(ss, MOCO_COST_REVIEW_SHEET, 'lady finger'),
  };
}

function MOCO_DEBUG_PRICING_DASHBOARD_STATE() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(MOCO_PRICING_DASHBOARD_SHEET);
  if (!sheet) return { exists: false };
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const dataRows = Math.max(lastRow - 4, 0);
  const summaries = readMocoCostSummary_(ss);
  const detailRows = readMocoCostDetails_(ss);
  const sampleRows = dataRows
    ? sheet.getRange(5, 1, Math.min(dataRows, 12), Math.min(lastCol, 13)).getDisplayValues()
    : [];
  const sampleFormulas = dataRows
    ? sheet.getRange(5, 1, Math.min(dataRows, 3), Math.min(lastCol, 13)).getFormulas()
    : [];
  return {
    exists: true,
    lastRow,
    lastCol,
    note: sheet.getRange(2, 1).getDisplayValue(),
    headers: sheet.getRange(4, 1, 1, Math.min(lastCol, 13)).getDisplayValues()[0],
    sampleRows,
    sampleFormulas,
    sourceSummaries: summaries.filter(item => isMocoSellableRecipeName_(item.cake)).map(item => ({
      cake: item.cake,
      total: item.total,
      okRows: item.okRows,
      issueRows: item.issueRows,
      yieldText: item.yieldText,
      parsedYield: parseMocoYieldUnits_(item.yieldText || item.notes),
    })),
    tiramisuDetails: detailRows.filter(row => normMocoCostText_(row.cake) === 'keto tiramisu').map(row => ({
      ingredient: row.ingredient,
      rawQty: row.rawQty,
      match: row.match,
      masterUnit: row.masterUnit,
      unitPrice: row.unitPrice,
      lineCost: row.lineCost,
      status: row.status,
      note: row.note,
    })),
  };
}

function debugMocoSheetRowsByKeyword_(ss, sheetName, keyword) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 1) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const key = normMocoCostText_(keyword);
  return values
    .map((row, index) => ({ row: index + 1, values: row }))
    .filter(item => normMocoCostText_(item.values.join(' ')).indexOf(key) >= 0)
    .slice(0, 20);
}

function buildMocoFounderActionTargetFormula_(ss, row) {
  const action = String(row[1] || '');
  const item = String(row[2] || '');
  const cake = String(row[3] || '');
  const fallbackText = String(row[4] || 'Mở sheet liên quan');
  let target = null;

  if (action === 'Nhập sản lượng bán dự kiến/tháng') {
    target = {
      sheet: ss.getSheetByName(MOCO_COST_CONFIG_SHEET),
      range: 'B8',
      label: 'Mở COST CFG B8 - nhập sản lượng bán dự kiến/tháng',
    };
  } else if (action === 'Nhập giá bán hiện tại') {
    target = findMocoMenuPriceTarget_(ss, cake) || {
      sheet: ss.getSheetByName(MOCO_MENU_ONLINE_SHEET),
      range: 'E5:E',
      label: 'Mở MENU & GIÁ cột F - điền Giá bán hiện tại',
    };
  } else if (action === 'Quy đổi đơn vị') {
    target = findMocoRecipeTarget_(ss, cake, stripMocoFounderItemQty_(item), 'C', 'sửa định lượng/quy đổi đơn vị');
  } else if (action === 'Điền định lượng') {
    target = findMocoRecipeTarget_(ss, cake, item, 'C', 'điền định lượng');
  } else if (action === 'Điền tỷ lệ mix') {
    target = findMocoBomTarget_(ss, item, 'A:G', 'điền tỷ lệ mix hoặc ghi rõ công thức con');
  } else if (action === 'Khớp nguyên liệu/công thức con') {
    target = findMocoBomTarget_(ss, item, 'D', 'chọn nguyên liệu chuẩn/công thức con');
  } else if (action === 'Bổ sung giá giấm theo ml') {
    target = findMocoNhapHangTarget_(ss, item) || {
      sheet: ss.getSheetByName(getMocoNhapHangSheetName_()),
      range: 'A:J',
      label: 'Mở NHẬP HÀNG - thêm giấm/dấm/vinegar với đơn vị ml và giá nhập',
    };
  } else if (action === 'Kiểm tra giá/quy cách') {
    target = findMocoNhapHangTarget_(ss, item) || {
      sheet: ss.getSheetByName(getMocoNhapHangSheetName_()),
      range: 'B:H',
      label: 'Mở NHẬP HÀNG - kiểm tra tên, quy cách, đơn vị, giá nhập',
    };
  } else if (action === 'Không cần làm ngay') {
    target = {
      sheet: ss.getSheetByName(getMocoNhapHangSheetName_()),
      range: 'A:J',
      label: 'Mở NHẬP HÀNG - sau khi mua thật thì nhập giá tại đây',
    };
  } else if (action === 'Review thủ công') {
    target = findMocoCostDetailTarget_(ss, cake, item) || {
      sheet: ss.getSheetByName(MOCO_COST_OUTPUT_SHEET),
      range: 'A:K',
      label: 'Mở COST CALC - xem dòng lỗi chi tiết',
    };
  }

  if (!target || !target.sheet) {
    return '="' + escapeMocoFormulaText_(fallbackText) + '"';
  }
  return buildMocoInternalLinkFormula_(target.sheet, target.range, target.label || fallbackText);
}

function buildMocoInternalLinkFormula_(sheet, range, label) {
  const safeRange = String(range || 'A1').replace(/"/g, '');
  return '=HYPERLINK("#gid=' + sheet.getSheetId() + '&range=' + safeRange + '";"' + escapeMocoFormulaText_(label) + '")';
}

function escapeMocoFormulaText_(value) {
  return String(value || '').replace(/"/g, '""');
}

function stripMocoFounderItemQty_(value) {
  return String(value || '').replace(/\s*\([^)]*\)\s*$/g, '').trim();
}

function findMocoRecipeTarget_(ss, cake, ingredient, column, taskLabel) {
  const sheet = ss.getSheetByName(MOCO_COST_RECIPE_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getRange(1, 1, sheet.getLastRow(), Math.min(sheet.getLastColumn(), 3)).getDisplayValues();
  const cakeKey = normMocoCostText_(cake);
  const ingredientKey = normMocoCostText_(ingredient);
  let currentCake = '';
  for (let i = 1; i < values.length; i++) {
    const cakeCell = String(values[i][0] || '').trim();
    if (cakeCell) currentCake = cakeCell;
    const ingredientCell = String(values[i][1] || '').trim();
    if (!ingredientCell) continue;
    const sameCake = !cakeKey || normMocoCostText_(currentCake) === cakeKey;
    const ingredientNorm = normMocoCostText_(ingredientCell);
    const sameIngredient = ingredientNorm === ingredientKey || ingredientNorm.indexOf(ingredientKey) >= 0 || ingredientKey.indexOf(ingredientNorm) >= 0;
    if (sameCake && sameIngredient) {
      const rowNumber = i + 1;
      const range = String(column || 'C') + rowNumber;
      return {
        sheet,
        range,
        label: 'Mở CÔNG THỨC ' + range + ' - ' + taskLabel + ' cho "' + ingredientCell + '"',
      };
    }
  }
  return {
    sheet,
    range: 'A:C',
    label: 'Mở CÔNG THỨC - tìm món "' + cake + '" và sửa "' + ingredient + '"',
  };
}

function findMocoBomTarget_(ss, ingredient, columnOrRange, taskLabel) {
  const sheet = ss.getSheetByName(MOCO_COST_BOM_MAP_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getRange(1, 1, sheet.getLastRow(), Math.min(sheet.getLastColumn(), 7)).getDisplayValues();
  const ingredientKey = normMocoCostText_(stripMocoFounderItemQty_(ingredient));
  for (let i = 1; i < values.length; i++) {
    const name = String(values[i][0] || '').trim();
    if (!name) continue;
    const nameKey = normMocoCostText_(name);
    if (nameKey === ingredientKey || nameKey.indexOf(ingredientKey) >= 0 || ingredientKey.indexOf(nameKey) >= 0) {
      const rowNumber = i + 1;
      const range = columnOrRange === 'A:G' ? 'A' + rowNumber + ':G' + rowNumber : String(columnOrRange || 'D') + rowNumber;
      return {
        sheet,
        range,
        label: 'Mở BOM MAP ' + range + ' - ' + taskLabel + ' cho "' + name + '"',
      };
    }
  }
  return {
    sheet,
    range: 'A:G',
    label: 'Mở BOM MAP - tìm "' + ingredient + '" để ' + taskLabel,
  };
}

function findMocoNhapHangTarget_(ss, ingredient) {
  const sheet = ss.getSheetByName(getMocoNhapHangSheetName_());
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getRange(1, 1, sheet.getLastRow(), Math.min(sheet.getLastColumn(), 10)).getDisplayValues();
  const ingredientKey = normMocoCostText_(stripMocoFounderItemQty_(ingredient));
  for (let i = 1; i < values.length; i++) {
    const name = String(values[i][1] || '').trim();
    if (!name) continue;
    const nameKey = normMocoCostText_(name);
    if (nameKey === ingredientKey || nameKey.indexOf(ingredientKey) >= 0 || ingredientKey.indexOf(nameKey) >= 0) {
      const rowNumber = i + 1;
      return {
        sheet,
        range: 'B' + rowNumber + ':I' + rowNumber,
        label: 'Mở NHẬP HÀNG dòng ' + rowNumber + ' - kiểm tra quy cách/đơn vị/giá nhập cho "' + name + '"',
      };
    }
  }
  return null;
}

function getMocoNhapHangSheetName_() {
  return typeof NVL_NHAP_HANG !== 'undefined' ? NVL_NHAP_HANG : 'NHẬP HÀNG';
}

function findMocoMenuPriceTarget_(ss, cakeListText) {
  const sheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  if (!sheet || sheet.getLastRow() < 5) return null;
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, 10).getDisplayValues();
  const cakeNames = String(cakeListText || '').split(',').map(s => normMocoCostText_(s)).filter(Boolean);
  for (let i = 0; i < values.length; i++) {
    const price = String(values[i][4] || '').trim();
    const onlineName = normMocoCostText_(values[i][1]);
    const recipeName = normMocoCostText_(values[i][2]);
    const mentioned = !cakeNames.length || cakeNames.some(name => onlineName.indexOf(name) >= 0 || recipeName.indexOf(name) >= 0 || name.indexOf(onlineName) >= 0);
    if (!price && mentioned) {
      const rowNumber = i + 5;
      return {
        sheet,
        range: 'E' + rowNumber,
        label: 'Mở MENU & GIÁ F' + rowNumber + ' - nhập giá bán hiện tại',
      };
    }
  }
  return null;
}

function findMocoCostDetailTarget_(ss, cake, ingredient) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getDataRange().getDisplayValues();
  const cakeKey = normMocoCostText_(cake);
  const ingredientKey = normMocoCostText_(ingredient);
  for (let i = 0; i < values.length; i++) {
    const rowCake = normMocoCostText_(values[i][0]);
    const rowIngredient = normMocoCostText_(values[i][1]);
    if ((!cakeKey || rowCake === cakeKey) && rowIngredient === ingredientKey) {
      const rowNumber = i + 1;
      return {
        sheet,
        range: 'A' + rowNumber + ':K' + rowNumber,
        label: 'Mở COST CALC dòng ' + rowNumber + ' - xem lỗi chi tiết',
      };
    }
  }
  return null;
}

function findMocoFirstCostIssueTarget_(ss, cake) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getDataRange().getDisplayValues();
  const cakeKey = normMocoCostText_(cake);
  for (let i = 0; i < values.length; i++) {
    const rowCake = normMocoCostText_(values[i][0]);
    const status = String(values[i][9] || '').trim();
    if (cakeKey && rowCake !== cakeKey) continue;
    if (status && status.indexOf('OK') !== 0 && status !== 'Trạng thái') {
      const rowNumber = i + 1;
      return {
        sheet,
        range: 'A' + rowNumber + ':K' + rowNumber,
        label: 'Mở COST CALC dòng ' + rowNumber + ' - sửa "' + String(values[i][1] || '').trim() + '"',
      };
    }
  }
  return findMocoCostSummaryTarget_(ss, cake);
}

function findMocoFirstCostTempPriceTarget_(ss, cake) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getDataRange().getDisplayValues();
  const cakeKey = normMocoCostText_(cake);
  for (let i = 0; i < values.length; i++) {
    const rowCake = normMocoCostText_(values[i][0]);
    const status = String(values[i][9] || '').trim();
    if (cakeKey && rowCake !== cakeKey) continue;
    if (status === 'OK_TEMP_PRICE') {
      const rowNumber = i + 1;
      return {
        sheet,
        range: 'A' + rowNumber + ':K' + rowNumber,
        label: 'Mở COST CALC dòng ' + rowNumber + ' - xem giá tạm của "' + String(values[i][1] || '').trim() + '"',
      };
    }
  }
  return null;
}

function findMocoCostSummaryTarget_(ss, cake) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getDataRange().getDisplayValues();
  const cakeKey = normMocoCostText_(cake);
  for (let i = 1; i < values.length; i++) {
    const rowCake = normMocoCostText_(values[i][0]);
    if (!rowCake || rowCake === 'ten banh') break;
    if (rowCake === cakeKey) {
      const rowNumber = i + 1;
      return {
        sheet,
        range: 'A' + rowNumber + ':F' + rowNumber,
        label: 'Mở COST CALC dòng ' + rowNumber + ' - xem tổng cost mẻ',
      };
    }
  }
  return {
    sheet,
    range: 'A:F',
    label: 'Mở COST CALC - xem tổng cost mẻ',
  };
}

function findMocoMenuSkuTarget_(ss, sku, column, taskLabel) {
  const sheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  if (!sheet || !sku || sheet.getLastRow() < 5) return null;
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, 2).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === sku) {
      const rowNumber = i + 5;
      const col = column || 'A';
      return {
        sheet,
        range: col + rowNumber,
        label: 'Mở MENU & GIÁ ' + col + rowNumber + ' - ' + (taskLabel || 'xem SKU ' + sku),
      };
    }
  }
  return null;
}

function readMocoConfigMap_(sheet) {
  const out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  values.forEach(row => {
    const key = String(row[0] || '').trim();
    if (key) out[key] = row[1];
  });
  return out;
}

function getMocoCostConfig_(ss) {
  const map = readMocoConfigMap_(ss.getSheetByName(MOCO_COST_CONFIG_SHEET));
  const fixedCostMonthly = (Number(map['Monthly electricity/water']) || 0)
    + (Number(map['Monthly marketing']) || 0)
    + (Number(map['Monthly founder labor']) || 0)
    + (Number(map['Monthly fixed wastage']) || 0);
  const plannedUnitsMonth = Number(map['Planned sellable units/month']) || 0;
  return {
    targetFoodCost: Number(map['Target food cost %']) || 0.35,
    waste: Number(map['Default waste %']) || 0.07,
    targetGrossMargin: Number(map['Target gross margin %']) || 0.6,
    round: Number(map['Default pricing round']) || 1000,
    fixedCostMonthly,
    plannedUnitsMonth,
    fixedCostPerUnit: plannedUnitsMonth ? fixedCostMonthly / plannedUnitsMonth : 0,
  };
}

function readMocoCostSummary_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const cake = String(values[i][0] || '').trim();
    if (!cake) break;
    if (cake === 'Tên bánh') break;
    out.push({
      cake,
      total: Number(values[i][1]) || 0,
      okRows: Number(values[i][2]) || 0,
      issueRows: Number(values[i][3]) || 0,
      yieldText: String(values[i][4] || '').trim(),
      notes: String(values[i][5] || '').trim(),
    });
  }
  return out;
}

function readMocoSellableCostSummaries_(ss) {
  return readMocoCostSummary_(ss).filter(item => isMocoSellableRecipeName_(item.cake));
}

function readMocoCostDetails_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headerIndex = values.findIndex(row => String(row[0] || '').trim() === 'Tên bánh' && String(row[1] || '').trim() === 'Nguyên liệu');
  if (headerIndex < 0) return [];
  const out = [];
  for (let i = headerIndex + 1; i < values.length; i++) {
    const cake = String(values[i][0] || '').trim();
    const ingredient = String(values[i][1] || '').trim();
    if (!cake && !ingredient) continue;
    out.push({
      cake,
      ingredient,
      rawQty: String(values[i][2] || '').trim(),
      amount: Number(values[i][3]) || 0,
      unit: String(values[i][4] || '').trim(),
      match: String(values[i][5] || '').trim(),
      masterUnit: String(values[i][6] || '').trim(),
      unitPrice: Number(values[i][7]) || 0,
      lineCost: Number(values[i][8]) || 0,
      status: String(values[i][9] || '').trim(),
      note: String(values[i][10] || '').trim(),
    });
  }
  return out;
}

function readMocoCostDetailStatusMap_(ss) {
  const out = {};
  readMocoCostDetails_(ss).forEach(row => {
    const key = normMocoCostText_(row.cake);
    if (!key) return;
    if (!out[key]) out[key] = { statuses: {}, tempCount: 0, issueCount: 0 };
    out[key].statuses[row.status] = (out[key].statuses[row.status] || 0) + 1;
    if (row.status === 'OK_TEMP_PRICE') out[key].tempCount += 1;
    if (row.status && row.status.indexOf('OK') !== 0) out[key].issueCount += 1;
  });
  return out;
}

function readMocoMenuRows_(sheet) {
  const out = { rows: [], bySku: {}, byRecipe: {} };
  if (!sheet || sheet.getLastRow() < 5) return out;
  const width = Math.max(sheet.getLastColumn(), 11);
  const headers = sheet.getRange(4, 1, 1, width).getDisplayValues()[0].map(value => normMocoCostText_(value));
  const skuIdx = findMocoHeaderIndex_(headers, ['ma sku']);
  const onlineIdx = findMocoHeaderIndex_(headers, ['ten mon ban online']);
  const recipeIdx = findMocoHeaderIndex_(headers, ['ten cong thuc noi bo']);
  const specIdx = findMocoHeaderIndex_(headers, ['quy cach ban']);
  const saleQtyIdx = findMocoHeaderIndex_(headers, ['so thanh pham']);
  const priceIdx = findMocoHeaderIndex_(headers, ['gia ban hien tai']);
  const statusIdx = findMocoHeaderIndex_(headers, ['trang thai ban']);
  const noteIdx = findMocoHeaderIndex_(headers, ['ghi chu']);
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, width).getValues();
  values.forEach(row => {
    const rawSpec = String(row[specIdx >= 0 ? specIdx : 3] || '').trim();
    const saleQty = parseMocoMenuSaleQty_(row[saleQtyIdx >= 0 ? saleQtyIdx : -1], rawSpec);
    const item = {
      sku: String(row[skuIdx >= 0 ? skuIdx : 0] || '').trim(),
      onlineName: String(row[onlineIdx >= 0 ? onlineIdx : 1] || '').trim(),
      recipeName: String(row[recipeIdx >= 0 ? recipeIdx : 2] || '').trim(),
      spec: normalizeMocoMenuSaleSpec_(rawSpec),
      rawSpec,
      saleQty,
      price: row[priceIdx >= 0 ? priceIdx : 4],
      status: String(row[statusIdx >= 0 ? statusIdx : 8] || '').trim(),
      note: String(row[noteIdx >= 0 ? noteIdx : 9] || '').trim(),
      hasLegacyYieldSpec: isMocoLegacyMenuYieldSpec_(rawSpec),
    };
    if (!item.sku && !item.recipeName) return;
    if (item.recipeName && !isMocoSellableRecipeName_(item.recipeName)) return;
    out.rows.push(item);
    if (item.sku) out.bySku[item.sku] = item;
    if (item.recipeName) out.byRecipe[normMocoCostText_(item.recipeName)] = item;
  });
  return out;
}

function normalizeMocoMenuSaleSpec_(spec) {
  const raw = String(spec || '').trim();
  if (!raw) return '';
  const parts = raw.split('/');
  if (parts.length > 1) {
    return parts[0].replace(/\s+/g, ' ').trim();
  }
  return raw
    .replace(/\s*\/\s*(?:mẻ|me)\s*\d+(?:[.,]\d+)?\s*[^\n\r]*/i, '')
    .replace(/\s*\/\s*\d+(?:[.,]\d+)?\s*(?:\/\s*\d+(?:[.,]\d+)?)?\s*(?:công thức|cong thuc)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMocoLegacyMenuYieldSpec_(spec) {
  const raw = String(spec || '').toLowerCase();
  const key = normMocoCostText_(spec);
  return raw.indexOf('/') >= 0 && (
    raw.indexOf('mẻ') >= 0 ||
    raw.indexOf('me') >= 0 ||
    raw.indexOf('công thức') >= 0 ||
    raw.indexOf('cong thuc') >= 0 ||
    key.indexOf('/ me') >= 0 ||
    key.indexOf(' cong thuc') >= 0
  );
}

function parseMocoMenuSaleQty_(value, spec) {
  if (isMocoCostNumeric_(value) && Number(value) > 0) return Number(value);
  const clean = normMocoCostText_(normalizeMocoMenuSaleSpec_(spec));
  const combo = clean.match(/(?:hop|combo|set|phan)\s*(\d+(?:[.,]\d+)?)\s*(?:chiec|cai|banh|hop|phan|o|cuon)\b/);
  if (combo) return Number(combo[1].replace(',', '.')) || '';
  const leading = clean.match(/^(\d+(?:[.,]\d+)?)\s*(?:chiec|cai|banh|hop|phan|o|cuon)\b/);
  if (leading) return Number(leading[1].replace(',', '.')) || 1;
  const numbers = clean.match(/\d+(?:[.,]\d+)?/g) || [];
  if (numbers.length) {
    const picked = numbers.length > 1 && clean.indexOf('cm') < 0 ? numbers[numbers.length - 1] : numbers[0];
    return Number(picked.replace(',', '.')) || '';
  }
  return '';
}

function getMocoDefaultSaleQtyFromYield_(summary) {
  const yieldInfo = parseMocoYieldUnits_((summary && summary.yieldText) || '');
  if (!yieldInfo.units) return '';
  return ['chiếc', 'bánh', 'hộp', 'phần', 'ổ', 'cuộn'].indexOf(yieldInfo.unit) >= 0 ? 1 : '';
}

function buildMocoSellableMenuItems_(summaries, existing) {
  const items = [];
  summaries.forEach((summary, index) => {
    const recipeKey = normMocoCostText_(summary.cake);
    if (recipeKey === 'keto lemon cheesecake') {
      const genericExisting = existing.byRecipe[recipeKey] || existing.bySku[buildMocoSku_(index + 1)] || {};
      [
        { sku: 'MOCO-003-10', onlineName: 'KETO LEMON CHEESECAKE 10cm', spec: '1 bánh 10cm / 1/3 công thức', price: genericExisting.price || 140000 },
        { sku: 'MOCO-003-12', onlineName: 'KETO LEMON CHEESECAKE 12cm', spec: '1 bánh 12cm / 2/3 công thức', price: 220000 },
        { sku: 'MOCO-003-14', onlineName: 'KETO LEMON CHEESECAKE 14cm', spec: '1 bánh 14cm / 1 công thức', price: 280000 },
        { sku: 'MOCO-003-16', onlineName: 'KETO LEMON CHEESECAKE 16cm', spec: '1 bánh 16cm / 1.25 công thức', price: 350000 },
      ].forEach(variant => {
        items.push({
          sku: variant.sku,
          onlineName: variant.onlineName,
          recipeName: summary.cake,
          spec: normalizeMocoMenuSaleSpec_((existing.bySku[variant.sku] || {}).spec || variant.spec),
          saleQty: (existing.bySku[variant.sku] || {}).saleQty || 1,
          price: variant.price,
          existingRow: existing.bySku[variant.sku] || {},
        });
      });
      return;
    }

    const fallbackSku = buildMocoSku_(index + 1);
    const existingRow = existing.byRecipe[recipeKey] || existing.bySku[fallbackSku] || {};
    const spec = chooseMocoMenuSpec_(existingRow.spec, summary);
    items.push({
      sku: existingRow.sku || fallbackSku,
      onlineName: existingRow.onlineName || summary.cake,
      recipeName: summary.cake,
      spec,
      saleQty: existingRow.saleQty || getMocoDefaultSaleQtyFromYield_(summary),
      price: '',
      existingRow,
    });
  });
  return items;
}

function chooseMocoMenuSpec_(existingSpec, summary) {
  const spec = normalizeMocoMenuSaleSpec_(existingSpec);
  const fallbackInfo = parseMocoYieldUnits_(summary.yieldText || summary.notes);
  const fallback = buildMocoDefaultSpec_(summary.yieldText || summary.notes);
  if (spec && spec !== '1 phần' && !isMocoBadGeneratedMenuSpec_(spec, summary)) return spec;
  if (spec === '1 phần' && (fallbackInfo.unit === 'g' || fallbackInfo.unit === 'ml')) return spec;
  if (isMocoBadGeneratedMenuSpec_(spec, summary)) return '1 phần';
  return fallback || spec || '1 phần';
}

function isMocoBadGeneratedMenuSpec_(spec, summary) {
  const specKey = normMocoCostText_(spec);
  const sourceKey = normMocoCostText_([summary && summary.yieldText, summary && summary.notes].join(' '));
  return specKey.indexOf(' me 400 o') >= 0 && (sourceKey.indexOf('400g') >= 0 || sourceKey.indexOf('400 g') >= 0);
}

function isMocoSellableRecipeName_(recipeName) {
  const key = normMocoCostText_(recipeName);
  if (!key) return false;
  if (key === 'banh quy hanh nhan gion') return false;
  if (key === 'sua chua hy lap') return false;
  if (key.indexOf('lady finger hanh nhan') >= 0) return false;
  return true;
}

function buildMocoSku_(index) {
  return 'MOCO-' + String(index).padStart(3, '0');
}

function buildMocoDefaultSpec_(yieldText) {
  const text = String(yieldText || '').trim();
  if (!text) return '1 phần';
  const yieldInfo = parseMocoYieldUnits_(text);
  if (yieldInfo.units && yieldInfo.unit && yieldInfo.unit !== 'g' && yieldInfo.unit !== 'ml') return '1 ' + yieldInfo.unit;
  return '1 phần';
}

function parseMocoYieldUnits_(text) {
  const raw = String(text || '').trim();
  if (!raw) return { units: 0, unit: '', warning: 'Chưa có thành phẩm/mẻ trong CÔNG THỨC' };
  const lower = normMocoCostText_(raw);
  const labeledYield = raw.match(/(?:thành\s*phẩm|thanh\s*pham|ra\s*được|ra\s*duoc|được|duoc|đc|dc)\s*(?:khoảng|khoang|khoarng)?[^\d]{0,40}(\d+(?:[.,]\d+)?)\s*(g|gram|kg|ml|l|lít|lit|chiếc|chiec|cái|cai|hộp|hop|phần|phan|bánh|banh|ổ|o|cuộn|cuon)\b/i);
  const amountWithUnit = labeledYield || raw.match(/(\d+(?:[.,]\d+)?)\s*(g|gram|kg|ml|l|lít|lit|chiếc|chiec|cái|cai|hộp|hop|phần|phan|bánh|banh|ổ|o|cuộn|cuon)\b/i);
  const match = amountWithUnit || raw.match(/(\d+(?:[.,]\d+)?)/);
  const units = match ? Number(match[1].replace(',', '.')) : 0;
  let unit = amountWithUnit ? normalizeMocoYieldUnitToken_(amountWithUnit[2]) : 'phần';
  if (!amountWithUnit) {
    if (/(^|\s)(chiec|cai)(\s|$)/.test(lower)) unit = 'chiếc';
    else if (/(^|\s)hop(\s|$)/.test(lower)) unit = 'hộp';
    else if (/(^|\s)banh(\s|$)/.test(lower)) unit = 'bánh';
    else if (/(^|\s)o(\s|$)/.test(lower)) unit = 'ổ';
    else if (/(^|\s)cuon(\s|$)/.test(lower)) unit = 'cuộn';
  }
  return { units: units || 0, unit: units ? unit : '', warning: match ? '' : 'Chưa đọc được thành phẩm/mẻ trong CÔNG THỨC' };
}

function getMocoMenuYieldInfo_(summary, menuRow) {
  const variant = getMocoMenuCostVariant_(menuRow);
  if (variant) return { units: 1, unit: variant.unit, saleQty: 1, warning: '' };
  const yieldInfo = parseMocoYieldUnits_((summary && summary.yieldText) || '');
  const saleQty = parseMocoMenuSaleQty_(menuRow && menuRow.saleQty, menuRow && menuRow.spec);
  const warnings = [];
  if (yieldInfo.warning) warnings.push(yieldInfo.warning);
  if (!saleQty) warnings.push('Chưa có Số thành phẩm / đơn vị bán trong MENU & GIÁ');
  if (isMocoLegacyMenuYieldSpec_(menuRow && (menuRow.rawSpec || menuRow.spec))) warnings.push('Quy cách bán còn lẫn chữ "mẻ"; đã bỏ khỏi logic tính');
  return {
    units: yieldInfo.units,
    unit: yieldInfo.unit,
    saleQty,
    warning: warnings.join(' | '),
  };
}

function parseMocoMenuSpecYield_(text) {
  const raw = String(text || '').trim();
  if (!raw) return { units: 0, unit: '', warning: '' };
  const match = raw.match(/(?:mẻ|me)\s*(\d+(?:[.,]\d+)?)\s*(g|gram|kg|ml|l|lít|lit|chiếc|chiec|cái|cai|hộp|hop|phần|phan|bánh|banh|ổ|o|cuộn|cuon)\b/i);
  if (!match) return { units: 0, unit: '', warning: '' };
  return {
    units: Number(match[1].replace(',', '.')) || 0,
    unit: normalizeMocoYieldUnitToken_(match[2]),
    warning: '',
  };
}

function normalizeMocoYieldUnitToken_(unit) {
  const key = normMocoCostText_(unit);
  if (key === 'g' || key === 'gram' || key === 'kg') return 'g';
  if (key === 'ml' || key === 'l' || key === 'lit') return 'ml';
  if (key === 'chiec' || key === 'cai') return 'chiếc';
  if (key === 'hop') return 'hộp';
  if (key === 'banh') return 'bánh';
  if (key === 'o') return 'ổ';
  if (key === 'cuon') return 'cuộn';
  return 'phần';
}

function calcMocoMenuCostPerUnit_(summary, menuRow, config) {
  if (!summary || !summary.total) return 0;
  const variant = getMocoMenuCostVariant_(menuRow);
  if (variant) return Math.round(summary.total * variant.multiplier * (1 + config.waste));
  const yieldInfo = getMocoMenuYieldInfo_(summary, menuRow);
  if (!yieldInfo.units || !yieldInfo.saleQty) return 0;
  const baseCost = summary.total / yieldInfo.units * yieldInfo.saleQty;
  return Math.round(baseCost * (1 + config.waste));
}

function getMocoMenuCostVariant_(menuRow) {
  const recipeKey = normMocoCostText_(menuRow && menuRow.recipeName);
  const sku = String(menuRow && menuRow.sku || '').trim();
  if (recipeKey !== 'keto lemon cheesecake') return null;
  if (sku === 'MOCO-003-10') return { multiplier: 1 / 3, displayRatio: '1/3', size: '10cm', unit: 'bánh 10cm', label: '1/3 công thức' };
  if (sku === 'MOCO-003-12') return { multiplier: 2 / 3, displayRatio: '2/3', size: '12cm', unit: 'bánh 12cm', label: '2/3 công thức' };
  if (sku === 'MOCO-003-14') return { multiplier: 1, displayRatio: '1', size: '14cm', unit: 'bánh 14cm', label: '1 công thức' };
  if (sku === 'MOCO-003-16') return { multiplier: 1.25, displayRatio: '5/4', size: '16cm', unit: 'bánh 16cm', label: '5/4 công thức' };
  return null;
}

function buildMocoPricingWarning_(summary, status, yieldInfo, price, foodCost, config) {
  const warnings = [];
  if (summary && summary.issueRows) warnings.push('Còn ' + summary.issueRows + ' dòng thiếu dữ liệu');
  if (status.tempCount) warnings.push('Có ' + status.tempCount + ' dòng giá tham khảo/tạm');
  if (yieldInfo.warning) warnings.push(yieldInfo.warning);
  if (!price) warnings.push('Chưa nhập giá bán hiện tại');
  if (foodCost && foodCost > config.targetFoodCost) warnings.push('Food cost cao hơn target ' + Math.round(config.targetFoodCost * 100) + '%');
  if (config.fixedCostMonthly && !config.plannedUnitsMonth) warnings.push('Chưa có sản lượng tháng; vẫn xem được cost nguyên liệu, chỉ chưa phân bổ fixed cost/đơn vị');
  return warnings.length ? warnings.join(' | ') : 'Có thể review giá bán';
}

function buildMocoPricingFormulaNote_(summary, menuRow, config) {
  const recipe = (menuRow && menuRow.recipeName) || (summary && summary.cake) || '';
  const variant = getMocoMenuCostVariant_(menuRow);
  const yieldInfo = getMocoMenuYieldInfo_(summary, menuRow);
  const costLogic = variant
    ? 'Cost NL kéo từ THÀNH PHẨM/MẺ theo SKU. Tại đó: cost chuẩn = COST CALC của "' + recipe + '"; cost bán = cost chuẩn x hệ số size ' + variant.displayRatio + ' x (1 + hao hụt từ COST CFG).'
    : 'Cost NL kéo từ THÀNH PHẨM/MẺ theo SKU. Tại đó: cost chuẩn = COST CALC của "' + recipe + '"; cost bán = cost chuẩn / ' + (yieldInfo.units || '?') + ' ' + (yieldInfo.unit || 'thành phẩm') + ' mỗi mẻ x ' + (yieldInfo.saleQty || '?') + ' thành phẩm/đơn vị bán x (1 + hao hụt từ COST CFG).';
  return costLogic
    + ' Giá theo nguyên liệu = Cost NL / Target food cost %. Giá có fixed = (Cost NL + Fixed cost/đv) / Target food cost %. Hòa vốn = fixed cost tháng / (giá bán - Cost NL). '
    + 'Nguồn: CÔNG THỨC, Master NVL/NHẬP HÀNG, COST CFG, MENU & GIÁ.';
}

function buildMocoPricingFixTargetFormula_(ss, summary, status, yieldInfo, price, foodCost, config, menuRow, warning) {
  const recipe = (menuRow && menuRow.recipeName) || (summary && summary.cake) || '';
  const sku = String(menuRow && menuRow.sku || '').trim();
  let target = null;
  let fallbackText = 'Không cần sửa ngay';

  if (summary && summary.issueRows) {
    target = findMocoFirstCostIssueTarget_(ss, recipe);
    fallbackText = 'Mở COST CALC - xem dòng thiếu dữ liệu';
  } else if (status && status.issueCount) {
    target = findMocoFirstCostIssueTarget_(ss, recipe);
    fallbackText = 'Mở COST CALC - xem dòng lỗi';
  } else if (yieldInfo && yieldInfo.warning) {
    if (String(yieldInfo.warning).indexOf('Số thành phẩm') >= 0) {
      target = findMocoMenuSkuTarget_(ss, sku, 'E', 'nhập Số thành phẩm / đơn vị bán');
      fallbackText = 'Mở MENU & GIÁ - nhập số thành phẩm/đơn vị bán';
    } else {
      target = findMocoRecipeTarget_(ss, recipe, '', 'bổ sung thành phẩm sau khi làm');
      fallbackText = 'Mở CÔNG THỨC - bổ sung thành phẩm/mẻ';
    }
  } else if (!price) {
    target = findMocoMenuSkuTarget_(ss, sku, 'F', 'nhập giá bán hiện tại');
    fallbackText = 'Mở MENU ONLINE - nhập giá bán';
  } else if (config.fixedCostMonthly && !config.plannedUnitsMonth) {
    target = {
      sheet: ss.getSheetByName(MOCO_COST_CONFIG_SHEET),
      range: 'B8',
      label: 'Mở COST CFG B8 - nhập sản lượng bán dự kiến/tháng',
    };
    fallbackText = 'Mở COST CFG - nhập sản lượng tháng';
  } else if (foodCost && foodCost > config.targetFoodCost) {
    target = findMocoMenuSkuTarget_(ss, sku, 'F', 'xem/sửa giá bán hiện tại')
      || findMocoCostSummaryTarget_(ss, recipe);
    fallbackText = 'Mở MENU ONLINE - xem lại giá bán';
  } else if (status && status.tempCount) {
    target = findMocoFirstCostTempPriceTarget_(ss, recipe) || findMocoCostSummaryTarget_(ss, recipe);
    fallbackText = 'Mở COST CALC - xem giá tạm';
  }

  if (target && target.sheet) {
    return buildMocoInternalLinkFormula_(target.sheet, target.range, target.label || fallbackText);
  }
  return '="' + escapeMocoFormulaText_(fallbackText) + '"';
}

function buildMocoPriceSourceLabel_(status) {
  if (!status) return '';
  if (status.tempCount) return 'Có giá tham khảo/tạm';
  if (status.issueCount) return 'Thiếu dữ liệu';
  return 'Danh mục nguyên liệu / giá thật';
}

function roundMocoPrice_(value, roundTo) {
  const price = Number(value) || 0;
  const unit = Number(roundTo) || 1000;
  return price ? Math.ceil(price / unit) * unit : '';
}

function applyMocoPricingFormatting_(sheet, dataRows) {
  const colCount = 16;
  const values = sheet.getRange(5, 1, dataRows, colCount).getDisplayValues();
  const backgrounds = values.map(row => {
    const warning = row[14] || '';
    const color = warning.indexOf('Food cost cao') >= 0 || warning.indexOf('thiếu') >= 0 || warning.indexOf('Chưa') >= 0 ? '#FCE8E6'
      : warning.indexOf('AI') >= 0 || warning.indexOf('tạm') >= 0 ? '#FEF7E0'
        : '#E6F4EA';
    return Array.from({ length: colCount }, () => color);
  });
  sheet.getRange(5, 1, dataRows, colCount).setBackgrounds(backgrounds);
}

function classifyMocoBomType_(ingredient) {
  const key = normMocoCostText_(ingredient);
  if (key.indexOf('banh quy hanh nhan') >= 0 && key.indexOf('cosy') >= 0) return { type: 'Mix', source: 'Mix formula', target: 'bánh quy hạnh nhân + Cosy' };
  if (key.indexOf('banh quy hanh nhan') >= 0) return { type: 'Tự làm', source: 'Công thức con', target: 'bánh quy hạnh nhân giòn' };
  if (key.indexOf('lady finger') >= 0) return { type: 'Tự làm', source: 'Công thức con', target: 'lady finger hạnh nhân ( bản điều chỉnh)' };
  if (key.indexOf('sua chua hy lap') >= 0) return { type: 'Tự làm', source: 'Công thức con', target: 'SỮA CHUA HY LẠP' };
  if (key.indexOf('cot bong lan') >= 0) return { type: 'Tự làm', source: 'Công thức con', target: 'cốt bông lan' };
  if (key.indexOf('kem trung') >= 0 || key.indexOf('sot kem pho mai') >= 0) return { type: 'Tự làm', source: 'Công thức con', target: ingredient };
  if (key.indexOf('tui') >= 0 || key.indexOf('hop') >= 0 || key.indexOf('tem') >= 0 || key.indexOf('de banh') >= 0) return { type: 'Packaging', source: 'Bao bì trực tiếp', target: ingredient };
  return { type: 'Mua ngoài', source: 'Danh mục nguyên liệu / Cost Review', target: ingredient };
}

function buildMocoBomFounderAction_(row, type) {
  if (type.type === 'Mix') return 'Điền tỷ lệ từng phần nếu muốn tính mix chính xác.';
  if (type.type === 'Tự làm' && (!row.lineCost || row.status.indexOf('OK') !== 0)) return 'Cần công thức con và thành phẩm sau khi làm để tính tiếp vào món chính.';
  if (row.status === 'UNSUPPORTED_UNIT') return 'Quy đổi ' + row.rawQty + ' sang g/ml/quả/lá.';
  if (row.status === 'MISSING_QTY') return 'Điền định lượng trong CÔNG THỨC.';
  if (row.status === 'MISSING_MASTER') return 'Khớp đúng nguyên liệu chuẩn hoặc khai báo là công thức con tự làm.';
  if (row.status === 'SUSPECT_UNIT_PRICE') return 'Kiểm tra quy cách/giá nhập.';
  return 'Không cần làm ngay.';
}

function buildMocoSimpleFounderActionFromDetail_(row) {
  if (!row.status || row.status.indexOf('OK') === 0) return null;
  if (row.status === 'UNSUPPORTED_UNIT') {
    return ['P1', 'Quy đổi đơn vị', row.ingredient + ' (' + row.rawQty + ')', row.cake, 'CÔNG THỨC', 'Cân hoặc đổi tsp/nhúm/số thiếu đơn vị sang g/ml/quả/lá.', 'CẦN QUY ĐỔI'];
  }
  if (row.status === 'MISSING_QTY') {
    return ['P0', 'Điền định lượng', row.ingredient, row.cake, 'CÔNG THỨC', 'Dòng này thiếu lượng dùng nên chưa thể tính cost.', 'CẦN ĐỊNH LƯỢNG'];
  }
  if (row.status === 'MISSING_MASTER') {
    const ingredientKey = normMocoCostText_(row.ingredient);
    if (ingredientKey === 'giam' || ingredientKey.indexOf('giam') >= 0) {
      return ['P1', 'Bổ sung giá giấm theo ml', row.ingredient, row.cake, 'NHẬP HÀNG', 'CÔNG THỨC đang dùng ml, không quy ra g. Hiện chưa thấy giấm/dấm/vinegar trong NHẬP HÀNG/Master NVL để lấy đơn giá đ/ml.', 'CẦN QUY ĐỔI'];
    }
    const type = classifyMocoBomType_(row.ingredient);
    if (type.type === 'Mix') {
      return ['P0', 'Điền tỷ lệ mix', row.ingredient, row.cake, 'BOM MAP hoặc CÔNG THỨC', 'Ví dụ 100g mix = 70g bánh quy tự làm + 30g Cosy.', 'CẦN TỶ LỆ MIX'];
    }
    return ['P1', 'Khớp nguyên liệu/công thức con', row.ingredient, row.cake, 'BOM MAP', 'Chọn nguyên liệu chuẩn đúng hoặc khai báo là công thức con tự làm.', 'CẦN KHỚP NGUYÊN LIỆU'];
  }
  if (row.status === 'SUSPECT_UNIT_PRICE') {
    return ['P1', 'Kiểm tra giá/quy cách', row.ingredient, row.cake, 'NHẬP HÀNG', row.note || 'Đơn giá đang bất thường.', 'CẦN KIỂM TRA GIÁ'];
  }
  return ['P2', 'Review thủ công', row.ingredient, row.cake, 'VIỆC CẦN LÀM', row.note || row.status, 'CẦN REVIEW'];
}

function applyMocoFounderSimpleFormatting_(sheet, dataRows) {
  const colCount = Math.min(sheet.getLastColumn(), 11);
  const values = sheet.getRange(5, 1, dataRows, colCount).getDisplayValues();
  const backgrounds = values.map(row => {
    const priority = row[0];
    const baseColor = priority === 'P0' ? '#FAD2CF'
      : priority === 'P1' ? '#FEF7E0'
        : priority === 'P2' ? '#E8F0FE'
          : '#E6F4EA';
    const workflowStatus = row[9] || '';
    const workflowColor = workflowStatus.indexOf('Đã xử lý') === 0 ? '#DFF5E1'
      : workflowStatus === 'Cần Admin phản hồi' ? '#FCE8E6'
        : workflowStatus === 'Đang xử lý' ? '#E8F0FE'
          : '#FFFFFF';
    return Array.from({ length: colCount }, (_, idx) => idx >= 7 ? workflowColor : baseColor);
  });
  sheet.getRange(5, 1, dataRows, colCount).setBackgrounds(backgrounds);
}

function buildMocoFounderSuggestion_(item, master) {
  const candidates = suggestMocoMasterCandidates_(master, item.ingredient, item.sampleUnit);
  const top = candidates[0] || null;
  const sampleUnit = item.sampleUnit || 'đơn vị';
  const matched = item.currentMatch || (top ? top.name : '');

  if (item.status === 'MISSING_MASTER') {
    if (top) {
      return {
        priority: '1 - Chọn nguyên liệu',
        action: 'Chọn đúng nguyên liệu',
        fillThis: 'Cột H: chọn "' + top.name + '". Nếu sai, chọn tên gần đúng hơn trong dropdown.',
        reason: 'Tên trong CÔNG THỨC chưa khớp danh mục nguyên liệu chuẩn. Gợi ý dựa trên tên gần giống và đơn vị ' + sampleUnit + '.',
        defaultNvl: top.name,
      };
    }
    return {
      priority: '1 - Chọn nguyên liệu',
      action: 'Thêm hoặc chọn nguyên liệu',
      fillThis: 'Chưa thấy nguyên liệu gần giống. Thêm nguyên liệu này vào NHẬP HÀNG rồi cập nhật danh mục nguyên liệu, hoặc chọn thủ công ở cột H.',
      reason: 'Không có tên đủ giống trong danh mục nguyên liệu chuẩn nên hệ thống không tự tính được.',
      defaultNvl: '',
    };
  }

  if (item.status === 'MISSING_PRICE') {
    return {
      priority: '2 - Thiếu giá',
      action: 'Bổ sung giá chuẩn',
      fillThis: 'Cột I: nhập giá / 1 ' + (item.masterUnit || sampleUnit) + ' cho "' + matched + '". Hoặc bổ sung dòng nhập hàng rồi cập nhật danh mục nguyên liệu.',
      reason: 'Đã nhận diện được nguyên liệu nhưng danh mục chưa có đơn giá quy chuẩn.',
      defaultNvl: matched,
    };
  }

  if (item.status === 'SUSPECT_UNIT_PRICE') {
    const unit = item.masterUnit || sampleUnit;
    const convertHint = unit === 'g'
      ? 'Nếu giá gốc là giá/kg thì lấy giá/kg chia 1000 để ra giá/g.'
      : unit === 'ml'
        ? 'Nếu giá gốc là giá/L thì lấy giá/L chia 1000 để ra giá/ml.'
        : 'Kiểm tra lại giá đã quy về 1 ' + unit + '.';
    return {
      priority: '0 - Sửa giá bất thường',
      action: 'Sửa quy cách hoặc nhập giá đúng',
      fillThis: 'Kiểm tra "' + matched + '". ' + convertHint + ' Có thể nhập nhanh giá đúng ở cột I.',
      reason: 'Đơn giá / 1 ' + unit + ' đang quá cao nên nếu tính tiếp sẽ làm cost sai lớn.',
      defaultNvl: matched,
    };
  }

  if (item.status === 'UNIT_MISMATCH') {
    if (top) {
      return {
        priority: '3 - Lệch đơn vị',
        action: 'Chọn nguyên liệu cùng đơn vị',
        fillThis: 'Cột H: thử chọn "' + top.name + '". Nếu vẫn lệch, sửa định lượng trong CÔNG THỨC sang cùng đơn vị.',
        reason: 'Công thức đang dùng ' + sampleUnit + ' nhưng danh mục nguyên liệu đang dùng ' + (item.masterUnit || 'đơn vị khác') + '.',
        defaultNvl: top.name,
      };
    }
    return {
      priority: '3 - Lệch đơn vị',
      action: 'Quy đổi đơn vị',
      fillThis: 'Sửa định lượng mẫu "' + item.sampleQty + '" trong CÔNG THỨC sang đơn vị của Master, hoặc nhập giá tạm ở cột I.',
      reason: 'Đơn vị công thức và đơn vị giá không cùng hệ nên không thể nhân trực tiếp.',
      defaultNvl: matched,
    };
  }

  if (item.status === 'UNSUPPORTED_UNIT') {
    return {
      priority: '4 - Quy đổi công thức',
      action: 'Đổi định lượng sang g/ml/quả',
      fillThis: 'Sửa "' + item.sampleQty + '" trong CÔNG THỨC thành g/ml/quả. Ví dụ tsp/nhúm/lá cần cân thực tế một lần.',
      reason: 'Đơn vị này không có tỷ lệ quy đổi cố định đủ tin cậy để tự tính cost.',
      defaultNvl: matched,
    };
  }

  return {
    priority: '5 - Review',
    action: 'Kiểm tra thủ công',
    fillThis: suggestMocoCostFix_(item),
    reason: item.note || 'Cần kiểm tra lại dòng này.',
    defaultNvl: matched,
  };
}

function getMocoCostPriorityRank_(status) {
  const ranks = {
    SUSPECT_UNIT_PRICE: 0,
    MISSING_MASTER: 1,
    MISSING_PRICE: 2,
    UNIT_MISMATCH: 3,
    UNSUPPORTED_UNIT: 4,
  };
  return ranks[status] === undefined ? 9 : ranks[status];
}

function suggestMocoMasterCandidates_(master, ingredient, unit) {
  const key = normMocoCostText_(ingredient);
  const tokens = key.split(' ').filter(token => token.length >= 3);
  if (!tokens.length) return [];

  return master.items
    .map(item => {
      let score = 0;
      tokens.forEach(token => {
        if (item.key === token) score += 8;
        else if (item.key.indexOf(token) >= 0) score += 4;
      });
      if (item.key.indexOf(key) >= 0 || key.indexOf(item.key) >= 0) score += 10;
      if (unit && item.unit === unit) score += 3;
      if (item.price) score += 1;
      return { item, score };
    })
    .filter(result => result.score >= 4)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'vi'))
    .slice(0, 3)
    .map(result => result.item);
}

function buildMocoCostMasterMap_(sheet) {
  const values = sheet.getDataRange().getValues();
  const idx = getMocoCostMasterHeaderIndexes_(values[0] || []);
  const items = [];
  const byName = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const name = String(row[idx.name] || '').trim();
    if (!name) continue;
    if (!isMocoCostIngredientCatalogRow_(row, idx)) continue;
    const category = String(row[idx.category] || '').trim();
    const unit = String(row[idx.unit] || '').trim();
    const latest = Number(row[idx.latest]) || 0;
    const avg = Number(row[idx.avg]) || 0;
    const price = latest || avg || 0;
    const item = { name, key: normMocoCostText_(name), category, unit, price };
    items.push(item);
    byName[item.key] = item;
  }

  const aliases = {
    'chuoi': 'chuoi',
    'chuoi tieu': 'chuoi',
    'trung': 'trung ga',
    'trung ga': 'trung ga',
    'bot mi': 'bot my 11',
    'bot my': 'bot my 11',
    'bot mi so 13': 'bot my so 13',
    'bot my so 13': 'bot my so 13',
    'bot nguyen cam': 'bot my nguyen cam',
    'bot mi nguyen cam': 'bot my nguyen cam',
    'bot my nguyen cam': 'bot my nguyen cam',
    'bot yen mach': 'bot yen mach',
    'bot yem mach': 'bot yen mach',
    'duong allulose': 'duong an kieng allulose',
    'duong alulose': 'duong an kieng allulose',
    'allulose': 'duong an kieng allulose',
    'creamcheese': ['cream cheese', 'cream cheese anchor', 'cream cheese avonmore', 'cream cheese dairymont'],
    'cream cheese': ['cream cheese', 'cream cheese anchor', 'cream cheese avonmore', 'cream cheese dairymont'],
    'whipping': ['whipping cream', 'whipping cream anchor'],
    'sua tuoi': 'sua tuoi khong duong th',
    'sua tuoi ko duong': 'sua tuoi khong duong th',
    'sua tuoi khong duong': 'sua tuoi khong duong th',
    'sua khong duong': 'sua tuoi khong duong th',
    'sua chua hy lap': 'sua chua hy lap',
    'sua hy lap': 'sua chua hy lap',
    'duong trehalose': 'duong trehalose',
    'duong tảo nhật': 'duong tao nhat',
    'duong tao nhat': 'duong tao nhat',
    'duong la han': 'duong la han',
    'baking soda': 'baking soda',
    'baking powder': 'baking powder',
    'vani': 'vani',
    'tinh chat vani': 'vani',
    'syrup maple': 'syrup maple',
    'maple syrup': 'syrup maple',
    'socola chip': 'chocolate chip',
    'chocochip': 'chocolate chip',
    'chocolate chip': 'chocolate chip',
    'giam': 'dam',
    'dam': 'dam',
    'giam gao trung thanh': 'dam',
    'dam gao trung thanh': 'dam',
  };

  return { items, byName, aliases };
}

function getMocoCostMasterHeaderIndexes_(headers) {
  const map = {};
  headers.forEach((header, idx) => {
    const key = String(header || '').trim();
    if (key) map[key] = idx;
  });
  return {
    name: map['Tên NVL'] ?? map['Tên nguyên liệu chuẩn'] ?? 1,
    category: map['Loại hàng'] ?? 2,
    unit: map['Đơn vị'] ?? 4,
    latest: map['Đơn giá mới nhất / 1 ĐV'] ?? 5,
    avg: map['Đơn giá TB / 1 ĐV'] ?? 6,
    costFlag: map['Tính cost bánh?'] ?? 10,
  };
}

function isMocoCostIngredientCatalogRow_(row, idx) {
  const explicitFlag = normMocoCostText_(row[idx.costFlag] || '');
  if (explicitFlag) {
    return ['co', 'yes', 'true', '1', 'y'].indexOf(explicitFlag) >= 0;
  }

  const category = normMocoCostText_(row[idx.category] || '');
  return [
    'nguyen lieu kho',
    'sua bo kem',
    'hat',
    'trai cay',
    'trung',
  ].indexOf(category) >= 0;
}

function buildMocoCostReviewOverrideMap_(sheet, master) {
  const out = {};
  if (!sheet || sheet.getLastRow() < 5) return out;
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, 14).getValues();
  values.forEach(row => {
    const ingredient = String(row[2] || '').trim();
    if (!ingredient) return;
    const founderNvl = String(row[7] || '').trim();
    const founderPriceInput = row[8];
    const founderPrice = parseMocoReviewPrice_(founderPriceInput);
    const hasFounderPrice = hasMocoReviewPriceInput_(founderPriceInput);
    const founderNote = String(row[9] || '').trim();
    const noteKey = normMocoCostText_(founderNote);
    const forceCoconutOil = noteKey.indexOf('su dung dau dua') >= 0;
    if (!hasFounderPrice && !forceCoconutOil) return;

    let masterItem = null;
    if (forceCoconutOil) {
      masterItem = master.byName['dau dua'] || null;
    } else if (founderNvl) {
      const key = normMocoCostText_(founderNvl);
      masterItem = master.byName[key] || null;
    }

    out[normMocoCostText_(ingredient)] = {
      ingredient,
      founderNvl: forceCoconutOil || (hasFounderPrice && noteKey.indexOf('ai search') < 0) ? (forceCoconutOil ? 'Dầu dừa' : founderNvl) : '',
      price: hasFounderPrice ? founderPrice : 0,
      note: founderNote,
      source: founderNote && normMocoCostText_(founderNote).indexOf('ai search') >= 0 ? 'Giá tham khảo' : 'Founder/Cost Review',
      masterItem,
    };
  });
  return out;
}

function buildMocoRecipeSidePriceMap_(recipeData) {
  const out = {};
  (recipeData || []).forEach(row => {
    const ingredient = String(row[8] || '').trim();
    const priceSpec = String(row[9] || '').trim();
    if (!ingredient || !priceSpec || normMocoCostText_(ingredient).indexOf('ten nvl') >= 0) return;

    const parsed = parseMocoRecipeSidePrice_(priceSpec);
    if (!parsed || !isMocoCostNumeric_(parsed.price)) return;
    if (['chai', 'đơn vị'].indexOf(parsed.unit) >= 0) return;

    const override = {
      ingredient,
      founderNvl: ingredient,
      price: parsed.price,
      note: 'Duyên nhập ở CÔNG THỨC: ' + priceSpec + ' => khoảng ' + Math.round(parsed.price) + 'đ/' + parsed.unit + '. Cần thay bằng NHẬP HÀNG khi có hóa đơn thật.',
      source: 'CÔNG THỨC - Duyên',
      masterItem: {
        name: ingredient,
        key: normMocoCostText_(ingredient),
        unit: parsed.unit,
        price: parsed.price,
      },
    };
    expandMocoRecipePriceKeys_(ingredient).forEach(key => {
      out[key] = override;
    });
  });
  return out;
}

function parseMocoRecipeSidePrice_(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (normMocoCostText_(raw) === 'free') {
    return {
      price: 0,
      unit: 'g',
    };
  }
  const priceMatch = raw.match(/(\d[\d.,]*)\s*(?:đ|d|vnd)?/i);
  if (!priceMatch) return null;
  const totalPrice = parseMocoReviewPrice_(priceMatch[1]);
  if (!totalPrice) return null;

  const parts = raw.split('/');
  const denom = parts.length > 1 ? parts.slice(1).join('/').trim() : '';
  const parsedDenom = parseMocoRecipePriceDenominator_(denom);
  return {
    unit: parsedDenom.unit,
    price: totalPrice / parsedDenom.amount,
  };
}

function parseMocoRecipePriceDenominator_(denom) {
  const raw = String(denom || '').trim();
  const key = normMocoCostText_(raw);
  const amount = parseMocoFractionNumber_(raw) || 1;
  if (!raw) return { amount: 1, unit: 'đơn vị' };
  if (raw.toLowerCase().indexOf('gói') >= 0 || key.indexOf('goi') >= 0) return { amount, unit: 'gói' };
  if (key.indexOf('kg') >= 0) return { amount: amount * 1000, unit: 'g' };
  if (key.indexOf('g') >= 0 && key.indexOf('goi') < 0) return { amount, unit: 'g' };
  if (key.indexOf('lit') >= 0 || key === 'l' || /\bl\b/.test(key)) return { amount: amount * 1000, unit: 'ml' };
  if (key.indexOf('ml') >= 0) return { amount, unit: 'ml' };
  if (key.indexOf('hop') >= 0) return { amount, unit: 'hộp' };
  if (key.indexOf('chai') >= 0) return { amount, unit: 'chai' };
  if (key.indexOf('qua') >= 0) return { amount, unit: 'quả' };
  if (key.indexOf('cai') >= 0) return { amount, unit: 'cái' };
  if (key.indexOf('la') >= 0) return { amount, unit: 'lá' };
  return { amount, unit: raw };
}

function expandMocoRecipePriceKeys_(ingredient) {
  const key = normMocoCostText_(ingredient);
  const aliases = {
    'socola chip': ['socola chip', 'chocolate chip', 'chocochip'],
    'giấm gạo trung thành': ['giấm gạo trung thành', 'giấm', 'cốt chanh/ giấm'],
    'dau dua': ['dau dua', 'dau an'],
    'bot mi so 13': ['bot mi so 13', 'bot my so 13', 'bot mi', 'bot my'],
    'bot so 8': ['bot so 8', 'bot mi so 8', 'bot my so 8'],
    'sua yen mach': ['sua yen mach', 'sua hat'],
    'vani': ['vani', 'tinh chat vani'],
    'whipping': ['whipping', 'whipping cream'],
    'maple syrup': ['maple syrup', 'syrup maple'],
    'mascapone': ['mascapone', 'mascarpone'],
    'cha bong rong bien': ['cha bong rong bien', 'cha bong ga'],
    'duong trehalose': ['duong trehalose', 'duong tao nhat'],
  };
  const keys = aliases[key] || [key];
  return keys.map(normMocoCostText_).filter(Boolean);
}

function chooseMocoCostOverride_(reviewOverride, recipeOverride) {
  if (!recipeOverride) return reviewOverride;
  if (!reviewOverride) return recipeOverride;
  const reviewKey = normMocoCostText_([reviewOverride.note, reviewOverride.source].join(' '));
  if (reviewKey.indexOf('ai search') >= 0) return recipeOverride;
  return reviewOverride;
}

function applyMocoCostOverride_(qty, match, override, ingredient) {
  if (!override) return match;
  const hasOverridePrice = isMocoCostNumeric_(override.price);
  if (override.masterItem && isMocoCostNumeric_(override.masterItem.price) && !hasOverridePrice) return override.masterItem;
  if (!hasOverridePrice) return match || override.masterItem;

  const preferredUnit = qty && qty.unit
    ? qty.unit
    : (override.masterItem && override.masterItem.unit) || (match && match.unit) || '';
  return {
    name: override.founderNvl || (match && match.name) || ingredient,
    key: normMocoCostText_(override.founderNvl || (match && match.name) || ingredient),
    unit: preferredUnit,
    price: override.price,
  };
}

function isMocoCostNumeric_(value) {
  if (value === '' || value === null || value === undefined) return false;
  return Number.isFinite(Number(value));
}

function isMocoCostValue_(value) {
  return isMocoCostNumeric_(value);
}

function hasMocoReviewPriceInput_(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  const text = String(value || '').trim();
  if (!text) return false;
  if (normMocoCostText_(text) === 'free') return true;
  return /-?\d/.test(text);
}

function parseMocoReviewPrice_(value) {
  if (typeof value === 'number') return value || 0;
  const text = String(value || '').trim();
  if (!text) return 0;
  if (normMocoCostText_(text) === 'free') return 0;
  const cleaned = text
    .replace(/[^\d,.\-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function joinMocoCostNotes_(notes) {
  return notes
    .map(note => String(note || '').trim())
    .filter(Boolean)
    .join(' | ');
}

function findMocoMasterItem_(master, ingredient) {
  const key = normMocoCostText_(ingredient);
  const aliases = Array.isArray(master.aliases[key])
    ? master.aliases[key]
    : [master.aliases[key] || key];
  for (let i = 0; i < aliases.length; i++) {
    if (master.byName[aliases[i]]) return master.byName[aliases[i]];
  }
  if (master.byName[key]) return master.byName[key];

  const alias = aliases[0] || key;
  const exactContained = master.items.filter(item => {
    if (item.key === key || aliases.indexOf(item.key) >= 0) return true;
    if (item.key.length < 5) return false;
    return aliases.some(candidate => {
      if (!candidate || candidate.length < 5) return false;
      return item.key.indexOf(candidate) >= 0 || candidate.indexOf(item.key) >= 0;
    }) || item.key.indexOf(key) >= 0 || key.indexOf(item.key) >= 0;
  });
  if (exactContained.length === 1) return exactContained[0];
  return null;
}

function parseMocoRecipeQty_(raw) {
  const text = String(raw || '').trim();
  if (!text) return { amount: '', unit: '', status: 'MISSING_QTY', note: 'Thiếu định lượng' };
  const lower = text.toLowerCase();
  const amount = parseMocoFractionNumber_(lower);
  if (!amount) return { amount: '', unit: '', status: 'UNSUPPORTED_QTY', note: 'Không đọc được số lượng: ' + text };

  if (lower.indexOf('lòng đỏ') >= 0) return { amount, unit: 'quả', status: 'OK_ASSUMED', note: 'Tạm tính 1 lòng đỏ = 1 quả trứng' };
  if (lower.indexOf('lít') >= 0 || /\d\s*l\s*$/.test(lower)) return { amount: amount * 1000, unit: 'ml', status: 'OK', note: '' };
  if (lower.indexOf('ml') >= 0) return { amount, unit: 'ml', status: 'OK', note: '' };
  if (lower.indexOf('gói') >= 0 || lower.indexOf('goi') >= 0) return { amount, unit: 'gói', status: 'OK', note: '' };
  if (lower.indexOf('kg') >= 0) return { amount: amount * 1000, unit: 'g', status: 'OK', note: '' };
  if (lower.indexOf('g') >= 0) return { amount, unit: 'g', status: 'OK', note: '' };
  if (lower.indexOf('quả') >= 0) return { amount, unit: 'quả', status: 'OK', note: '' };
  if (lower.indexOf('hộp') >= 0) return { amount, unit: 'hộp', status: 'OK', note: '' };
  if (lower.indexOf('hũ') >= 0) return { amount, unit: 'hũ', status: 'OK', note: '' };
  if (lower.indexOf('lá') >= 0) return { amount, unit: 'lá', status: 'OK', note: '' };
  if (lower.indexOf('tsp') >= 0 || lower.indexOf('nhúm') >= 0) {
    return { amount, unit: '', status: 'UNSUPPORTED_UNIT', note: 'Cần quy đổi thủ công đơn vị: ' + text };
  }
  return { amount, unit: '', status: 'UNSUPPORTED_UNIT', note: 'Thiếu đơn vị chuẩn: ' + text };
}

function parseMocoFractionNumber_(text) {
  const frac = String(text || '').match(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/);
  if (frac) {
    const a = Number(frac[1].replace(',', '.'));
    const b = Number(frac[2].replace(',', '.'));
    return b ? a / b : 0;
  }
  const num = String(text || '').match(/(\d+(?:[.,]\d+)?)/);
  return num ? Number(num[1].replace(',', '.')) : 0;
}

function calcMocoLineCost_(qty, match) {
  if (!match) return { cost: '', status: 'MISSING_MASTER', note: 'Chưa khớp được với tên nguyên liệu chuẩn' };
  if (!isMocoCostNumeric_(match.price)) return { cost: '', status: 'MISSING_PRICE', note: 'Danh mục nguyên liệu chưa có đơn giá chuẩn' };
  const unitPrice = Number(match.price);
  if ((match.unit === 'g' || match.unit === 'ml') && unitPrice > 5000) {
    return {
      cost: '',
      status: 'SUSPECT_UNIT_PRICE',
      note: 'Đơn giá / 1 ' + match.unit + ' quá cao; kiểm tra lại quy cách trong NHẬP HÀNG',
    };
  }
  if (qty.status === 'MISSING_QTY' || qty.status === 'UNSUPPORTED_QTY' || qty.status === 'UNSUPPORTED_UNIT') {
    return { cost: '', status: qty.status, note: qty.note };
  }

  const qUnit = String(qty.unit || '').trim();
  const mUnit = String(match.unit || '').trim();
  if (qUnit === mUnit) {
    return { cost: qty.amount * unitPrice, status: qty.status || 'OK', note: qty.note || '' };
  }
  if ((qUnit === 'g' && mUnit === 'ml') || (qUnit === 'ml' && mUnit === 'g')) {
    return {
      cost: qty.amount * unitPrice,
      status: 'OK_G_ML_ASSUMED',
      note: 'Tạm tính 1g ≈ 1ml, cần xác nhận nếu muốn chính xác cao',
    };
  }
  return {
    cost: '',
    status: 'UNIT_MISMATCH',
    note: 'Định lượng dùng "' + qUnit + '" nhưng danh mục nguyên liệu dùng "' + mUnit + '"',
  };
}

function buildMocoLegacyCostMeta_(sheet) {
  const out = {};
  if (!sheet) return out;
  const values = sheet.getDataRange().getDisplayValues();
  let cake = '';
  values.slice(1).forEach(row => {
    if (row[0]) cake = String(row[0]).trim();
    if (!cake) return;
    const notes = [row[5], row[6], row[7]]
      .map(v => String(v || '').trim())
      .filter(v => v && !/^cost nguyên liệu/i.test(v));
    if (!notes.length) return;
    const key = normMocoCostText_(cake);
    out[key] = out[key] ? out[key] + ' | ' + notes.join(' | ') : notes.join(' | ');
  });
  return out;
}

function applyMocoOperationalSheetNotes_(ss) {
  applyMocoRecipeSheetNotes_(ss.getSheetByName(MOCO_COST_RECIPE_SHEET));
  applyMocoCustomerOrderNotes_(ss.getSheetByName(MOCO_CUSTOMER_ORDER_SHEET));
  applyMocoNhapHangNotes_(ss.getSheetByName(SHEET_NAME));
}

function applyMocoRecipeSheetNotes_(sheet) {
  if (!sheet) return;
  const ss = sheet.getParent();
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Tên bánh/công thức. Chỉ nhập ở dòng đầu của mỗi công thức, các dòng dưới để trống để gom cùng món.',
    2: 'Nguyên liệu Quỳnh dùng trong công thức. Tên càng giống danh mục nguyên liệu chuẩn thì cost càng tự khớp tốt.',
    3: 'Định lượng cho từng nguyên liệu. Ưu tiên g/ml/quả/hộp/lá; tsp/nhúm cần quy đổi thủ công.',
    4: 'Cách làm/ghi chú bếp, không dùng để tính cost.',
    5: 'Thành phẩm sau khi làm xong một mẻ. Dashboard pricing dùng để chia cost/mẻ ra cost/đơn vị bán.',
    6: 'Thông tin dinh dưỡng nếu có, không dùng để tính cost.',
    7: 'Ghi chú bảo quản/marketing/bếp.',
  });
  if (sheet.getMaxColumns() >= 10) {
    sheet.getRange(3, 9, 1, 2).setNotes([[
      'Tên nguyên liệu Duyên đang có giá tạm. Nên gõ gần giống tên nguyên liệu trong cột B để hệ thống dùng được.',
      'Giá/quy cách tạm, ví dụ 70.000đ/500g, 50.000đ/l, 90.000đ/18 gói. Khi có hóa đơn thật thì nhập vào NHẬP HÀNG.',
    ]]);
  }
  const rows = Math.max(sheet.getMaxRows() - 1, 300);
  applyMocoDropdownNamedRange_(
    sheet,
    2,
    2,
    rows,
    ss,
    'LIST_INGREDIENT_OR_RECIPE',
    true,
    'Nên chọn nguyên liệu/công thức con từ danh sách chuẩn. Nếu là nguyên liệu mới, có thể gõ tạm rồi chuẩn hóa sau.'
  );
}

function applyMocoCustomerOrderNotes_(sheet) {
  if (!sheet) return;
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Mã đơn duy nhất. Một đơn nhiều sản phẩm thì lặp lại mã đơn ở nhiều dòng.',
    2: 'Ngày khách đặt đơn.',
    3: 'Ngày giao dự kiến/thực tế.',
    4: 'Giờ giao, ví dụ 8h30. Không nhập trạng thái thanh toán vào đây.',
    5: 'Tên khách hàng.',
    6: 'Số điện thoại khách hàng.',
    7: 'Địa chỉ giao hàng.',
    8: 'Tên bánh khách đặt. Dashboard gom top bánh theo cột này.',
    9: 'Mã SKU/Menu nếu match được với MENU & GIÁ.',
    10: 'Số lượng từng sản phẩm.',
    11: 'Đơn giá mỗi sản phẩm.',
    12: 'Thành tiền trước chiết khấu của dòng sản phẩm.',
    13: 'Chiết khấu áp dụng cho đơn/dòng.',
    14: 'Doanh thu sau chiết khấu phân bổ theo dòng. Dashboard tổng doanh thu đọc cột này.',
    15: 'Trạng thái bếp/sản xuất.',
    16: 'Trạng thái giao hàng.',
    17: 'Trạng thái thanh toán. THU CHI chỉ backfill khi là Đã nhận tiền.',
    18: 'Ghi chú vận hành.',
  });
}

function applyMocoNhapHangNotes_(sheet) {
  if (!sheet) return;
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Ngày mua/nhập hàng.',
    2: 'Tên hàng hóa/nguyên liệu. Nên chọn từ dropdown tên chuẩn; nếu là hàng mới thì gõ tạm rồi cập nhật danh mục nguyên liệu.',
    3: 'Nhóm loại hàng để dashboard chi tiêu phân loại.',
    4: 'Số gói/hộp/túi mua trong lần nhập.',
    5: 'Quy cách mỗi gói/hộp/túi, ví dụ 500g hoặc 1000ml.',
    6: 'Đơn vị chuẩn: g, ml, quả, cái, bộ, túi...',
    7: 'Tổng giá nhập theo hóa đơn.',
    8: 'Đơn giá tự quy đổi về 1 đơn vị, không sửa tay nếu đang có công thức.',
    9: 'Nhà cung cấp.',
    10: 'Ghi chú kiểm tra quy cách/đơn vị nếu có.',
  });
}

function setMocoHeaderNotes_(sheet, headerRow, noteMap) {
  if (!sheet || !noteMap) return;
  const maxCol = sheet.getMaxColumns();
  Object.keys(noteMap).forEach(key => {
    const col = Number(key);
    if (!col || col > maxCol) return;
    sheet.getRange(headerRow, col).setNote(noteMap[key]);
  });
}

function refreshMocoDataValidationLists_(ss) {
  const lists = buildMocoDataValidationLists_(ss);
  let sheet = ss.getSheetByName(MOCO_DATA_VALIDATION_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_DATA_VALIDATION_SHEET);

  const names = Object.keys(lists);
  if (sheet.getMaxColumns() < names.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), names.length - sheet.getMaxColumns());
  }
  sheet.clear().clearFormats().clearConditionalFormatRules();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
    .clearDataValidations();
  sheet.getRange(1, 1, 1, names.length).setValues([names])
    .setFontWeight('bold')
    .setBackground('#5F6368')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setWrap(true);
  sheet.getRange(1, 1).setNote('MOCO_DATA_VALIDATION_SCHEMA_VERSION=' + MOCO_DATA_VALIDATION_SCHEMA_VERSION);

  const counts = {};
  names.forEach((name, idx) => {
    const values = lists[name];
    const col = idx + 1;
    const body = values.length ? values.map(value => [value]) : [['']];
    sheet.getRange(2, col, body.length, 1).setValues(body);
    sheet.setColumnWidth(col, Math.min(Math.max(150, name.length * 8), 320));
    const range = sheet.getRange(2, col, Math.max(values.length, 1), 1);
    setMocoNamedRange_(ss, name, range);
    counts[name] = values.length;
  });

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), names.length).setVerticalAlignment('middle');
  try {
    sheet.showSheet();
  } catch (err) {}

  return {
    sheet: MOCO_DATA_VALIDATION_SHEET,
    lists: counts,
    mode: 'danh sách văn bản; không dùng danh sách chọn trong DATA VALIDATION',
    validationCells: countMocoDataValidationCells_(sheet),
  };
}

function MOCO_FIX_VALIDATION_SHEETS_UI() {
  const ss = getMocoSpreadsheet_();
  const dvSheet = ss.getSheetByName(MOCO_DATA_VALIDATION_SHEET);
  if (dvSheet) {
    dvSheet.getRange(1, 1, dvSheet.getMaxRows(), dvSheet.getMaxColumns())
      .clearDataValidations();
    dvSheet.getRange(1, 1).setNote(
      'DATA VALIDATION là danh sách nguồn. Nhập hoặc sửa văn bản trực tiếp, không dùng danh sách chọn trong chính trang này.'
    );
  }
  const masterResult = typeof MOCO_APPLY_MASTER_NVL_VALIDATIONS_ONLY === 'function'
    ? MOCO_APPLY_MASTER_NVL_VALIDATIONS_ONLY()
    : null;
  return {
    dataValidation: {
      sheet: MOCO_DATA_VALIDATION_SHEET,
      validationCells: dvSheet ? countMocoDataValidationCells_(dvSheet) : null,
      mode: 'danh sách văn bản',
      policy: 'Không rebuild DATA VALIDATION để tránh ghi đè text user đã sửa.',
    },
    masterNvl: masterResult,
  };
}

function countMocoDataValidationCells_(sheet) {
  if (!sheet) return 0;
  const rows = Math.max(sheet.getLastRow(), 1);
  const cols = Math.max(sheet.getLastColumn(), 1);
  const validations = sheet.getRange(1, 1, rows, cols).getDataValidations();
  let count = 0;
  validations.forEach(row => row.forEach(rule => { if (rule) count += 1; }));
  return count;
}

function buildMocoDataValidationLists_(ss) {
  const recipeNames = collectMocoRecipeNames_(ss);
  const masterNames = collectMocoMasterNvlNames_(ss);
  const subRecipes = collectMocoSubRecipeNames_(ss, recipeNames);
  const recipeTempPriceNames = collectMocoRecipeSidePriceNames_(ss);
  const menuSkus = collectMocoMenuSkus_(ss);
  const menuNames = collectMocoMenuNames_(ss);
  const suppliers = collectMocoNhapHangSuppliers_(ss);
  const units = uniqueMocoList_([
    'g', 'ml', 'quả', 'cái', 'bộ', 'túi', 'hộp', 'chiếc', 'phần', 'ổ', 'lá', 'gói', 'set',
  ].concat(typeof UNITS !== 'undefined' ? UNITS : []));
  const ingredientTypes = uniqueMocoList_([
    'Mua ngoài', 'Tự làm', 'Mix', 'Packaging',
    'Danh mục nguyên liệu / Cost Review', 'Công thức con', 'Mix formula', 'Bao bì trực tiếp',
  ]);
  const status = uniqueMocoList_([
    'Đang review', 'Đang bán', 'Tạm ngưng', 'Cần chốt giá',
    'Mới', 'Đã xác nhận', 'Đang làm', 'Đã giao', 'Hủy',
    'Chưa xử lý', 'Đang xử lý', 'Đã xử lý - chờ kiểm tra lại', 'Đã xử lý', 'Cần Admin phản hồi', 'Bỏ qua / không cần', 'Có phản hồi',
  ]);
  const categories = uniqueMocoList_((typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).concat([
    'Nguyên liệu khô', 'Sữa/bơ/kem', 'Sữa/bơ/kem/dầu/siro', 'Hạt', 'Trái cây', 'Trứng',
    'Bao bì', 'In ấn/tem nhãn', 'Dụng cụ', 'Thiết bị', 'Marketing/content', 'Vận hành', 'Decor/chụp ảnh', 'Khác',
  ]));

  return {
    LIST_RECIPE_NAMES: recipeNames,
    LIST_MASTER_NVL: masterNames,
    LIST_SUB_RECIPES: subRecipes,
    LIST_RECIPE_TEMP_PRICE_NAMES: recipeTempPriceNames,
    LIST_INGREDIENT_OR_RECIPE: uniqueMocoList_(masterNames.concat(subRecipes, recipeTempPriceNames)),
    LIST_MENU_SKU: menuSkus,
    LIST_MENU_NAMES: menuNames,
    LIST_UNITS: units,
    LIST_SUPPLIERS: suppliers,
    LIST_STATUS: status,
    LIST_INGREDIENT_TYPES: ingredientTypes,
    LIST_INGREDIENT_CATEGORIES: categories,
    LIST_MENU_SALE_SPECS: uniqueMocoList_(['1 chiếc', '1 hộp', '1 phần', '1 bánh 10cm', '1 bánh 12cm', '1 bánh 14cm', '1 bánh 16cm', '1 ổ', '1 set', 'combo']),
    LIST_OWNER: uniqueMocoList_(['Quỳnh', 'Duyên', 'Admin', 'Khác']),
    LIST_PRIORITY: uniqueMocoList_(['P0', 'P1', 'P2', 'P3']),
  };
}

function MOCO_AUDIT_RECIPE_INGREDIENT_NAMES() {
  return auditMocoRecipeIngredientNames_(false);
}

function MOCO_FIX_RECIPE_INGREDIENT_NAMES() {
  return auditMocoRecipeIngredientNames_(true);
}

function auditMocoRecipeIngredientNames_(applyFix) {
  const ss = getMocoSpreadsheet_();
  const recipeSheet = ss.getSheetByName(MOCO_COST_RECIPE_SHEET);
  if (!recipeSheet) throw new Error('Không tìm thấy sheet: ' + MOCO_COST_RECIPE_SHEET);

  const lists = buildMocoDataValidationLists_(ss);
  const allowedNames = lists.LIST_INGREDIENT_OR_RECIPE || [];
  const allowedByExact = {};
  const allowedByNorm = {};
  allowedNames.forEach(name => {
    const clean = String(name || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    allowedByExact[clean] = clean;
    const key = normMocoCostText_(clean);
    if (key && !allowedByNorm[key]) allowedByNorm[key] = clean;
  });

  const values = recipeSheet.getDataRange().getDisplayValues();
  const fixes = [];
  const unresolved = [];
  const ok = [];
  let currentCake = '';

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0]) currentCake = String(row[0]).trim();
    const ingredient = String(row[1] || '').replace(/\s+/g, ' ').trim();
    if (!ingredient || isMocoCostTotalRow_(ingredient)) continue;

    const rowNumber = i + 1;
    if (allowedByExact[ingredient]) {
      ok.push({ row: rowNumber, cake: currentCake, ingredient });
      continue;
    }

    const suggestion = suggestMocoRecipeIngredientCanonicalName_(ingredient, allowedNames, allowedByNorm);
    const item = {
      row: rowNumber,
      cell: 'B' + rowNumber,
      cake: currentCake,
      current: ingredient,
      suggested: suggestion.name || '',
      confidence: suggestion.confidence,
      reason: suggestion.reason,
      candidates: suggestion.candidates,
    };
    if (suggestion.applySafe) {
      fixes.push(item);
    } else {
      unresolved.push(item);
    }
  }

  let backupSheet = '';
  if (applyFix && fixes.length) {
    backupSheet = createBackup_(ss, recipeSheet);
    fixes.forEach(fix => {
      recipeSheet.getRange(fix.row, 2).setValue(fix.suggested);
    });
    MOCO_REFRESH_DATA_VALIDATION_LISTS();
    applyMocoRecipeSheetNotes_(recipeSheet);
  }

  return {
    sheet: MOCO_COST_RECIPE_SHEET,
    checkedRows: ok.length + fixes.length + unresolved.length,
    validRows: ok.length,
    fixableRows: fixes.length,
    unresolvedRows: unresolved.length,
    applied: applyFix ? fixes.length : 0,
    backupSheet,
    fixes,
    unresolved,
  };
}

function suggestMocoRecipeIngredientCanonicalName_(ingredient, allowedNames, allowedByNorm) {
  const key = normMocoCostText_(ingredient);
  if (!key) return { name: '', confidence: 0, reason: 'Tên trống', candidates: [], applySafe: false };

  if (allowedByNorm[key]) {
    return {
      name: allowedByNorm[key],
      confidence: 100,
      reason: 'Khớp tên chuẩn sau khi bỏ dấu/case/khoảng trắng',
      candidates: [allowedByNorm[key]],
      applySafe: true,
    };
  }

  const aliases = getMocoRecipeIngredientNameAliases_();
  const aliasTarget = aliases[key] || '';
  const aliasTargetKey = normMocoCostText_(aliasTarget);
  if (aliasTarget && allowedByNorm[aliasTargetKey]) {
    return {
      name: allowedByNorm[aliasTargetKey],
      confidence: 95,
      reason: 'Alias nghiệp vụ đã xác nhận',
      candidates: [allowedByNorm[aliasTargetKey]],
      applySafe: true,
    };
  }

  const candidates = rankMocoAllowedIngredientNameCandidates_(key, allowedNames).slice(0, 3);
  return {
    name: candidates.length ? candidates[0].name : '',
    confidence: candidates.length ? candidates[0].score : 0,
    reason: candidates.length ? 'Có tên gần giống nhưng cần xác nhận thủ công' : 'Không tìm thấy tên gần giống trong danh mục chuẩn',
    candidates: candidates.map(candidate => candidate.name),
    applySafe: false,
  };
}

function getMocoRecipeIngredientNameAliases_() {
  return {
    'bot mi nguyen cam': 'Bột mỳ nguyên cám',
    'bot mi so 8': 'bột số 8',
    'bot nguyen cam': 'Bột mỳ nguyên cám',
    'ca rot bao soi': 'Cà rốt',
    'cha bong rong bien': 'Ruốc rong biển',
    'creamcheese': 'Cream Cheese',
    'duong trehalose': 'Đường trehalose',
    'mascapone': 'Mascarpone',
    'sua hy lap': 'Sữa chua hy lạp',
    'sua hat': 'Sữa yến mạch',
    'sua chua hy lap': 'Sữa chua hy lạp',
    'tinh chat vani': 'Vani',
    'trung': 'Trứng gà',
    'whipping': 'Whipping Cream',
  };
}

function rankMocoAllowedIngredientNameCandidates_(key, allowedNames) {
  const tokens = key.split(' ').filter(token => token.length >= 3);
  if (!tokens.length) return [];
  return (allowedNames || [])
    .map(name => {
      const candidateKey = normMocoCostText_(name);
      let score = 0;
      if (candidateKey.indexOf(key) >= 0 || key.indexOf(candidateKey) >= 0) score += 20;
      tokens.forEach(token => {
        if (candidateKey === token) score += 10;
        else if (candidateKey.indexOf(token) >= 0) score += 5;
      });
      return { name, score };
    })
    .filter(candidate => candidate.score >= 5)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'vi'));
}

function isMocoDataValidationCurrent_(ss) {
  const sheet = ss.getSheetByName(MOCO_DATA_VALIDATION_SHEET);
  if (!sheet) return false;
  const note = String(sheet.getRange(1, 1).getNote() || '');
  if (note.indexOf('MOCO_DATA_VALIDATION_SCHEMA_VERSION=' + MOCO_DATA_VALIDATION_SCHEMA_VERSION) < 0) return false;
  return !!getMocoNamedRange_(ss, 'LIST_MASTER_NVL')
    && !!getMocoNamedRange_(ss, 'LIST_RECIPE_NAMES')
    && !!getMocoNamedRange_(ss, 'LIST_INGREDIENT_OR_RECIPE');
}

function collectMocoRecipeNames_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_RECIPE_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
  return uniqueMocoList_(values.map(row => row[0]));
}

function collectMocoMasterNvlNames_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_MASTER_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const idx = getMocoCostMasterHeaderIndexes_(values[0] || []);
  return uniqueMocoList_(values.slice(1).map(row => row[idx.name]));
}

function collectMocoSubRecipeNames_(ss, recipeNames) {
  const seeded = [];
  const mapSheet = ss.getSheetByName(MOCO_COST_SUB_RECIPE_MAP_SHEET);
  if (mapSheet && mapSheet.getLastRow() >= 2) {
    const values = mapSheet.getRange(2, 1, mapSheet.getLastRow() - 1, Math.min(mapSheet.getLastColumn(), 2)).getDisplayValues();
    values.forEach(row => {
      seeded.push(row[0]);
      seeded.push(row[1]);
    });
  }
  return uniqueMocoList_(seeded.concat((recipeNames || []).filter(name => !isMocoSellableRecipeName_(name))));
}

function collectMocoRecipeSidePriceNames_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_RECIPE_SHEET);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 10) return [];
  const values = sheet.getRange(2, 9, sheet.getLastRow() - 1, 2).getDisplayValues();
  return uniqueMocoList_(values
    .filter(row => {
      const ingredient = String(row[0] || '').trim();
      const priceSpec = String(row[1] || '').trim();
      return ingredient && priceSpec && normMocoCostText_(ingredient).indexOf('ten nvl') < 0;
    })
    .map(row => row[0]));
}

function collectMocoMenuSkus_(ss) {
  const menu = readMocoMenuRows_(ss.getSheetByName(MOCO_MENU_ONLINE_SHEET));
  return uniqueMocoList_(menu.rows.map(row => row.sku));
}

function collectMocoMenuNames_(ss) {
  const menu = readMocoMenuRows_(ss.getSheetByName(MOCO_MENU_ONLINE_SHEET));
  return uniqueMocoList_(menu.rows.map(row => row.onlineName || row.recipeName));
}

function collectMocoNhapHangSuppliers_(ss) {
  const sheetName = typeof SHEET_NAME !== 'undefined' ? SHEET_NAME : 'NHẬP HÀNG';
  const sheet = ss.getSheetByName(sheetName);
  const seeded = ['Trung Thành'];
  if (!sheet || sheet.getLastRow() < 2) return uniqueMocoList_(seeded);

  const headers = sheet.getRange(1, 1, 1, Math.min(Math.max(sheet.getLastColumn(), 10), 12))
    .getDisplayValues()[0]
    .map(normMocoCostText_);
  const supplierIdx = headers.findIndex(header => header === 'ncc' || header === 'brand' || header.indexOf('nha cung cap') >= 0);
  if (supplierIdx < 0) return uniqueMocoList_(seeded);

  const values = sheet.getRange(2, supplierIdx + 1, sheet.getLastRow() - 1, 1).getDisplayValues()
    .map(row => String(row[0] || '').trim())
    .filter(Boolean);
  return uniqueMocoList_(seeded.concat(values));
}

function uniqueMocoList_(values) {
  const seen = {};
  return (values || [])
    .map(value => String(value || '').replace(/\s+/g, ' ').trim())
    .filter(value => {
      const key = normMocoCostText_(value);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    })
    .sort((a, b) => a.localeCompare(b, 'vi'));
}

function setMocoNamedRange_(ss, name, range) {
  ss.getNamedRanges().forEach(namedRange => {
    if (namedRange.getName() === name) namedRange.remove();
  });
  ss.setNamedRange(name, range);
}

function getMocoNamedRange_(ss, name) {
  try {
    return ss.getRangeByName(name);
  } catch (err) {
    return null;
  }
}

function applyMocoDropdownNamedRange_(sheet, row, col, numRows, ss, name, allowInvalid, helpText) {
  const sourceRange = getMocoNamedRange_(ss, name);
  if (!sourceRange) return false;
  applyMocoDropdownRange_(sheet, row, col, numRows, sourceRange, allowInvalid, helpText);
  return true;
}

function applyMocoNewTableUiToExistingSheets_(ss) {
  const applied = [];
  const runners = [
    () => applyMocoHomeUi_(ss),
    () => applyMocoMenuOnlineUi_(ss),
    () => applyMocoYieldMapUi_(ss),
    () => applyMocoPricingDashboardUi_(ss),
    () => applyMocoFounderActionUi_(ss),
    () => applyMocoCostConfigUi_(ss),
    () => applyMocoOrderOnlineUi_(ss),
    () => applyMocoCostReviewUi_(ss),
    () => applyMocoCostBomMapUi_(ss),
    () => applyMocoCostSubRecipeMapUi_(ss),
    () => applyMocoCostOutputUi_(ss),
    () => applyMocoCostFlowUi_(ss),
  ];
  runners.forEach(run => {
    const name = run();
    if (name) applied.push(name);
  });
  return {
    applied,
    note: 'Đã cập nhật table filter, màu cột input/công thức/link và dropdown cho các sheet có cấu trúc phù hợp.',
  };
}

function applyMocoTableUi_(sheet, headerRow, colCount, options) {
  if (!sheet || !headerRow || !colCount) return false;
  const opts = options || {};
  const lastRow = Math.max(sheet.getLastRow(), headerRow);
  const dataRows = Math.max(Number(opts.dataRows || 0), lastRow - headerRow);
  const bodyRows = Math.max(dataRows, 1);
  const endRow = headerRow + bodyRows;

  sheet.getRange(headerRow, 1, 1, colCount)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground(opts.headerColor || '#1F4E79')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet.getRange(headerRow, 1, bodyRows + 1, colCount)
    .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(1, 1, Math.max(lastRow, endRow), colCount)
    .setVerticalAlignment('middle')
    .setWrap(true);

  if (opts.bandRows !== false && dataRows > 0) {
    const colors = [];
    for (let i = 0; i < dataRows; i++) {
      colors.push(Array.from({ length: colCount }, () => i % 2 ? '#FFFFFF' : '#F8FAFD'));
    }
    sheet.getRange(headerRow + 1, 1, dataRows, colCount).setBackgrounds(colors);
  }

  colorMocoColumns_(sheet, headerRow, bodyRows, opts.inputCols || [], '#FFF8E1');
  colorMocoColumns_(sheet, headerRow, bodyRows, opts.formulaCols || [], '#F1F3F4');
  colorMocoColumns_(sheet, headerRow, bodyRows, opts.linkCols || [], '#E8F0FE');
  colorMocoColumns_(sheet, headerRow, bodyRows, opts.warningCols || [], '#FEF7E0');

  if (opts.filter !== false && dataRows > 0) {
    try {
      const filter = sheet.getFilter();
      if (filter) filter.remove();
      sheet.getRange(headerRow, 1, dataRows + 1, colCount).createFilter();
    } catch (err) {}
  }
  sheet.setFrozenRows(headerRow);
  return true;
}

function colorMocoColumns_(sheet, headerRow, bodyRows, cols, color) {
  if (!cols || !cols.length || bodyRows <= 0) return;
  cols.forEach(col => {
    if (!col) return;
    sheet.getRange(headerRow + 1, col, bodyRows, 1).setBackground(color);
  });
}

function applyMocoDropdownList_(sheet, row, col, numRows, values, allowInvalid, helpText) {
  if (!sheet || !values || !values.length || numRows <= 0) return;
  const builder = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(allowInvalid === true);
  if (helpText) builder.setHelpText(helpText);
  const rule = builder.build();
  sheet.getRange(row, col, numRows, 1).setDataValidation(rule);
}

function applyMocoDropdownRange_(sheet, row, col, numRows, sourceRange, allowInvalid, helpText) {
  if (!sheet || !sourceRange || numRows <= 0) return;
  const builder = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sourceRange, true)
    .setAllowInvalid(allowInvalid === true);
  if (helpText) builder.setHelpText(helpText);
  const rule = builder.build();
  sheet.getRange(row, col, numRows, 1).setDataValidation(rule);
}

function removeMocoSheetActionControl_(sheet, title, subtitle) {
  if (!sheet) return;
  const commandCol = 26;
  const visibleCols = Math.max(Math.min(sheet.getLastColumn(), commandCol - 1), 4);
  const existingTitle = title || sheet.getName();
  const existingSubtitle = subtitle || '';
  try { sheet.getRange(1, 1, 2, visibleCols).breakApart(); } catch (err) {}
  sheet.getRange(1, 1, 2, visibleCols).clearContent().clearFormat().clearDataValidations().clearNote();
  sheet.getRange(3, 1, 1, 2).clearContent().clearFormat().clearDataValidations().clearNote();
  if (sheet.getMaxColumns() >= commandCol) {
    sheet.getRange(1, commandCol, 3, 1).clearContent().clearFormat();
    try { sheet.hideColumns(commandCol); } catch (err) {}
  }
  sheet.getRange(1, 1, 1, visibleCols).merge()
    .setValue(existingTitle)
    .setFontWeight('bold')
    .setFontSize(15)
    .setBackground('#0B8043')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  if (existingSubtitle) {
    sheet.getRange(2, 1, 1, visibleCols).merge()
      .setValue(existingSubtitle)
      .setBackground('#E6F4EA')
      .setFontColor('#174EA6')
      .setWrap(true)
      .setVerticalAlignment('middle');
  }
}

function handleMocoFounderActionEdit_(sheet, row, col) {
  if (!sheet || sheet.getName() !== MOCO_FOUNDER_ACTION_SHEET || row < 5 || col < 8 || col > 10) return false;
  sheet.getRange(row, 11)
    .setValue(new Date())
    .setNumberFormat('yyyy-mm-dd hh:mm');
  const rows = Math.max(sheet.getLastRow() - 4, 0);
  if (rows > 0) applyMocoFounderSimpleFormatting_(sheet, rows);
  return true;
}

function applyMocoHomeVisibilityMap_(ss) {
  const home = ss.getSheetByName(MOCO_HOME_SHEET);
  if (!home) return;
  const rows = getMocoHomeSiteRowCount_(home);
  if (!rows) return;
  const values = home.getRange(5, 2, rows, 2).getDisplayValues();
  values.forEach(row => {
    const sheetName = String(row[0] || '').trim();
    const status = String(row[1] || '').trim();
    if (!sheetName || (status !== 'Hiện' && status !== 'Ẩn')) return;
    const target = ss.getSheetByName(sheetName);
    if (!target) return;
    if (sheetName === MOCO_HOME_SHEET) {
      target.showSheet();
    } else if (status === 'Hiện') {
      target.showSheet();
    } else {
      try { target.hideSheet(); } catch (err) {}
    }
  });
}

function handleMocoHomeVisibilityEdit_(ss, sheet, row, col) {
  if (!sheet || sheet.getName() !== MOCO_HOME_SHEET || col !== 3 || row < 5) return false;
  const status = String(sheet.getRange(row, col).getDisplayValue() || '').trim();
  if (status !== 'Hiện' && status !== 'Ẩn') return false;
  const sheetName = String(sheet.getRange(row, 2).getDisplayValue() || '').trim();
  if (!sheetName || sheetName.indexOf('=') === 0) return false;
  const target = ss.getSheetByName(sheetName);
  if (!target) return false;

  if (sheetName === MOCO_HOME_SHEET && status === 'Ẩn') {
    sheet.getRange(row, col).setValue('Hiện');
    applyMocoHomeStatusBlockUi_(sheet, getMocoHomeSiteRowCount_(sheet));
    try {
      ss.toast('HOME không thể tự ẩn vì đây là trang điều khiển.', 'MOCO', 5);
    } catch (err) {}
    return true;
  }

  if (status === 'Hiện') {
    target.showSheet();
  } else {
    target.hideSheet();
  }
  applyMocoHomeStatusBlockUi_(sheet, getMocoHomeSiteRowCount_(sheet));
  try {
    ss.toast(sheetName + ' đã chuyển sang: ' + status, 'MOCO', 4);
  } catch (err) {}
  return true;
}

function getMocoHomeSiteRowCount_(sheet) {
  if (!sheet || sheet.getLastRow() < 5) return 0;
  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    const value = String(values[i][0] || '').trim();
    if (!value || value === 'Muốn ra số nào thì cần điền gì' || value === 'Flow điền thông tin đến khi ra kết quả') {
      return i;
    }
  }
  return values.length;
}

function readMocoHomeVisibilityState_(sheet) {
  const out = {};
  const rows = getMocoHomeSiteRowCount_(sheet);
  if (!rows) return out;
  const values = sheet.getRange(5, 2, rows, 2).getDisplayValues();
  values.forEach(row => {
    const name = String(row[0] || '').trim();
    const status = String(row[1] || '').trim();
    if (name && (status === 'Hiện' || status === 'Ẩn')) out[name] = status;
  });
  return out;
}

function applyMocoHomeStatusBlockUi_(sheet, siteRows) {
  if (!sheet || siteRows <= 0) return;
  const range = sheet.getRange(5, 3, siteRows, 1);
  const values = range.getDisplayValues();
  const backgrounds = [];
  const fontColors = [];
  const fontWeights = [];
  values.forEach(row => {
    const status = String(row[0] || '').trim();
    if (status === 'Hiện') {
      backgrounds.push(['#DFF5E1']);
      fontColors.push(['#137333']);
      fontWeights.push(['bold']);
    } else if (status === 'Ẩn') {
      backgrounds.push(['#F1F3F4']);
      fontColors.push(['#5F6368']);
      fontWeights.push(['bold']);
    } else {
      backgrounds.push(['#FFFFFF']);
      fontColors.push(['#202124']);
      fontWeights.push(['normal']);
    }
  });
  range
    .setBackgrounds(backgrounds)
    .setFontColors(fontColors)
    .setFontWeights(fontWeights)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setColumnWidth(3, 92);
}

function applyMocoHomeUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_HOME_SHEET);
  if (!sheet) return '';
  const siteRows = getMocoHomeSiteRowCount_(sheet);
  applyMocoTableUi_(sheet, 4, 8, { dataRows: siteRows, inputCols: [3], linkCols: [2], filter: true });
  if (siteRows > 0) {
    applyMocoDropdownList_(sheet, 5, 3, siteRows, ['Hiện', 'Ẩn'], false);
    applyMocoHomeStatusBlockUi_(sheet, siteRows);
  }
  const lastRow = sheet.getLastRow();
  for (let r = 1; r <= lastRow; r++) {
    const title = String(sheet.getRange(r, 1).getDisplayValue() || '');
    if (title === 'Muốn ra số nào thì cần điền gì') {
      applyMocoTableUi_(sheet, r + 1, 6, { filter: false, headerColor: '#8A4B00', bandRows: true });
    }
    if (title === 'Flow điền thông tin đến khi ra kết quả') {
      applyMocoTableUi_(sheet, r + 1, 5, { filter: false, headerColor: '#5F6368', bandRows: true });
    }
  }
  return MOCO_HOME_SHEET;
}

function applyMocoMenuOnlineUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 4, 0);
  applyMocoTableUi_(sheet, 4, 11, {
    dataRows,
    inputCols: [2, 4, 5, 6, 10, 11],
    formulaCols: [7, 8, 9],
    bandRows: true,
  });
  const rowsForDropdown = Math.max(dataRows, 100);
  applyMocoDropdownNamedRange_(sheet, 5, 3, rowsForDropdown, ss, 'LIST_RECIPE_NAMES', true, 'Chọn tên công thức đúng trong sheet CÔNG THỨC để kéo cost.');
  applyMocoDropdownNamedRange_(sheet, 5, 4, rowsForDropdown, ss, 'LIST_MENU_SALE_SPECS', true, 'Quy cách bán cho khách, không nhập sản lượng/mẻ ở đây.');
  applyMocoDropdownList_(sheet, 5, 10, rowsForDropdown, ['Đang review', 'Đang bán', 'Tạm ngưng', 'Cần chốt giá'], false);
  removeMocoSheetActionControl_(sheet, 'MENU & GIÁ', 'Sheet quản lý menu bán online: chỉ gồm món/SKU bán cho khách. Giá bán là input founder sửa tay; các cột cost, food cost và giá đề xuất là công thức kéo từ COST & GIÁ.');
  return MOCO_MENU_ONLINE_SHEET;
}

function applyMocoYieldMapUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_YIELD_MAP_SHEET);
  if (!sheet) return '';
  try {
    const filter = sheet.getFilter();
    if (filter) filter.remove();
  } catch (err) {}
  const values = sheet.getDataRange().getDisplayValues();
  const normalTitleIndex = values.findIndex(row => String(row[0] || '').indexOf('BẢNG 1 - MÓN THƯỜNG') === 0);
  const normalHeaderIndex = values.findIndex(row => row[0] === 'SKU' && row.indexOf('Cost quy chuẩn') >= 0);
  const cheesecakeTitleIndex = values.findIndex(row => String(row[0] || '').indexOf('BẢNG 2 - CHEESECAKE') === 0);
  const cheesecakeHeaderIndex = cheesecakeTitleIndex >= 0 ? cheesecakeTitleIndex + 1 : -1;
  if (normalHeaderIndex >= 0) {
    const normalHeaderRow = normalHeaderIndex + 1;
    const normalEndRow = cheesecakeHeaderIndex > normalHeaderIndex ? cheesecakeHeaderIndex - 2 : sheet.getLastRow();
    const normalRows = Math.max(normalEndRow - normalHeaderRow, 0);
    applyMocoTableUi_(sheet, normalHeaderRow, 12, {
      dataRows: normalRows,
      formulaCols: [5, 6, 9, 10, 11],
      linkCols: [1, 3],
      warningCols: [12],
      bandRows: true,
      filter: false,
    });
    if (normalRows > 0) {
      const range = sheet.getRange(normalHeaderRow + 1, 12, normalRows, 1);
      const warnings = range.getDisplayValues();
      range.setBackgrounds(warnings.map(row => [row[0] ? '#FCE8E6' : '#E6F4EA']));
      range.setFontColors(warnings.map(row => [row[0] ? '#A50E0E' : '#137333']));
    }
  }
  if (cheesecakeHeaderIndex >= 0) {
    const cheesecakeHeaderRow = cheesecakeHeaderIndex + 1;
    const cheesecakeRows = Math.max(sheet.getLastRow() - cheesecakeHeaderRow, 0);
    applyMocoTableUi_(sheet, cheesecakeHeaderRow, 12, {
      dataRows: cheesecakeRows,
      formulaCols: [5, 6, 9, 10, 11],
      linkCols: [1],
      warningCols: [12],
      bandRows: true,
      filter: false,
      headerColor: '#8A4B00',
    });
    if (cheesecakeRows > 0) {
      const range = sheet.getRange(cheesecakeHeaderRow + 1, 12, cheesecakeRows, 1);
      const warnings = range.getDisplayValues();
      range.setBackgrounds(warnings.map(row => [row[0] ? '#FCE8E6' : '#E6F4EA']));
      range.setFontColors(warnings.map(row => [row[0] ? '#A50E0E' : '#137333']));
    }
  }
  if (normalTitleIndex >= 0) {
    const titleRow = normalTitleIndex + 1;
    const title = values[normalTitleIndex][0];
    const titleRange = sheet.getRange(titleRow, 1, 1, 12);
    try { titleRange.breakApart(); } catch (err) {}
    titleRange
      .setBackground('#174EA6')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle');
    titleRange.merge().setValue(title);
  }
  if (cheesecakeTitleIndex >= 0) {
    const titleRow = cheesecakeTitleIndex + 1;
    const title = values[cheesecakeTitleIndex][0];
    const titleRange = sheet.getRange(titleRow, 1, 1, 12);
    try { titleRange.breakApart(); } catch (err) {}
    titleRange
      .setBackground('#8A4B00')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle');
    titleRange.merge().setValue(title);
  }
  sheet.setFrozenRows(5);
  removeMocoSheetActionControl_(sheet, 'THÀNH PHẨM/MẺ - AUDIT COST', 'Sheet này tách 2 bảng: món thường theo thành phẩm/mẻ; cheesecake theo công thức chuẩn size 14 và hệ số từng size. Không sửa tay ở đây; sửa yield trong CÔNG THỨC và quy cách bán trong MENU & GIÁ.');
  return MOCO_YIELD_MAP_SHEET;
}

function applyMocoPricingDashboardUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_PRICING_DASHBOARD_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 4, 0);
  applyMocoTableUi_(sheet, 4, 16, {
    dataRows,
    formulaCols: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    linkCols: [14],
    warningCols: [15],
    bandRows: false,
  });
  if (dataRows > 0) applyMocoPricingFormatting_(sheet, dataRows);
  colorMocoColumns_(sheet, 4, Math.max(dataRows, 1), [14], '#E8F0FE');
  colorMocoColumns_(sheet, 4, Math.max(dataRows, 1), [15], '#FEF7E0');
  removeMocoSheetActionControl_(sheet, 'COST & GIÁ', 'Cost nguyên liệu tính được ngay từ CÔNG THỨC, không cần dự báo bán bao nhiêu/tháng. Sản lượng tháng chỉ dùng cho mô phỏng fixed cost. Dùng các cột giá khác nhau để trả lời: giá vốn, giá theo food cost, hòa vốn, hoặc giá theo lãi mục tiêu.');
  return MOCO_PRICING_DASHBOARD_SHEET;
}

function applyMocoFounderActionUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_FOUNDER_ACTION_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 4, 0);
  applyMocoTableUi_(sheet, 4, 11, {
    dataRows,
    linkCols: [5],
    inputCols: [8, 9, 10],
    warningCols: [1, 7, 10],
    bandRows: false,
  });
  if (dataRows > 0) {
    applyMocoFounderSimpleFormatting_(sheet, dataRows);
    colorMocoColumns_(sheet, 4, dataRows, [5], '#E8F0FE');
    colorMocoColumns_(sheet, 4, dataRows, [8, 9, 10], '#FFFFFF');
    applyMocoDropdownNamedRange_(sheet, 5, 1, dataRows, ss, 'LIST_PRIORITY', true, 'Ưu tiên xử lý. P0/P1 làm trước.');
    applyMocoDropdownList_(sheet, 5, 7, dataRows, [
      'CẦN SẢN LƯỢNG THÁNG',
      'CẦN GIÁ BÁN',
      'CẦN ĐỊNH LƯỢNG',
      'CẦN QUY ĐỔI',
      'CẦN KHỚP NGUYÊN LIỆU',
      'CẦN TỶ LỆ MIX',
      'CẦN KIỂM TRA GIÁ',
      'CẦN REVIEW',
      'CẦN THÀNH PHẨM/MẺ',
      'CẦN QUY CÁCH BÁN',
      'ĐANG DÙNG GIÁ TẠM',
    ], true);
    applyMocoDropdownNamedRange_(sheet, 5, 8, dataRows, ss, 'LIST_OWNER', true, 'Người đang xử lý hoặc cần phản hồi.');
    applyMocoDropdownList_(sheet, 5, 10, dataRows, [
      'Chưa xử lý',
      'Đang xử lý',
      'Đã xử lý - chờ kiểm tra lại',
      'Đã xử lý',
      'Cần Admin phản hồi',
      'Bỏ qua / không cần',
      'Có phản hồi',
    ], false);
    sheet.getRange(5, 11, dataRows, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  }
  removeMocoSheetActionControl_(sheet, 'VIỆC CẦN LÀM - QUỲNH / DUYÊN', 'Quỳnh/Duyên xử lý P0/P1 trước. Nếu đã sửa, có thắc mắc, hoặc muốn Admin kiểm tra lại thì ghi ở cột Phản hồi / thắc mắc và chọn Tình trạng xử lý.');
  return MOCO_FOUNDER_ACTION_SHEET;
}

function applyMocoCostConfigUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_CONFIG_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 1, 0);
  applyMocoTableUi_(sheet, 1, 3, { dataRows, inputCols: [2], warningCols: [3], bandRows: true });
  applyMocoDropdownList_(sheet, 9, 2, 2, ['TRUE', 'FALSE'], false);
  return MOCO_COST_CONFIG_SHEET;
}

function applyMocoOrderOnlineUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_ORDER_ONLINE_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 4, 300);
  applyMocoTableUi_(sheet, 4, 14, {
    dataRows,
    inputCols: [1, 2, 3, 4, 5, 6, 8, 10, 11, 13, 14],
    formulaCols: [7, 9, 12],
    bandRows: true,
  });
  const menuSheet = ss.getSheetByName(MOCO_MENU_ONLINE_SHEET);
  if (!applyMocoDropdownNamedRange_(sheet, 5, 6, dataRows, ss, 'LIST_MENU_SKU', true, 'Chọn SKU từ MENU & GIÁ để tự kéo tên món và giá bán.') && menuSheet && menuSheet.getLastRow() >= 5) {
    applyMocoDropdownRange_(sheet, 5, 6, dataRows, menuSheet.getRange(5, 1, Math.max(menuSheet.getLastRow() - 4, 1), 1), true);
  }
  applyMocoDropdownList_(sheet, 5, 2, dataRows, ['Facebook', 'Instagram', 'Zalo', 'Website', 'ShopeeFood', 'Khác'], false);
  applyMocoDropdownList_(sheet, 5, 13, dataRows, ['Mới', 'Đã xác nhận', 'Đang làm', 'Đã giao', 'Hủy'], false);
  return MOCO_ORDER_ONLINE_SHEET;
}

function applyMocoCostReviewUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_REVIEW_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 4, 0);
  applyMocoTableUi_(sheet, 4, Math.min(sheet.getLastColumn(), 14), {
    dataRows,
    inputCols: [8, 9, 10],
    warningCols: [1, 7, 11],
    bandRows: true,
  });
  const masterSheet = ss.getSheetByName(MOCO_COST_MASTER_SHEET);
  if (dataRows > 0 && !applyMocoDropdownNamedRange_(sheet, 5, 8, dataRows, ss, 'LIST_MASTER_NVL', true, 'Chọn tên nguyên liệu chuẩn từ Master NVL. Có thể gõ tạm nếu danh mục còn thiếu.') && masterSheet && masterSheet.getLastRow() >= 2) {
    applyMocoDropdownRange_(sheet, 5, 8, dataRows, masterSheet.getRange(2, 2, Math.max(masterSheet.getLastRow() - 1, 1), 1), true);
  }
  return MOCO_COST_REVIEW_SHEET;
}

function applyMocoCostBomMapUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_BOM_MAP_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 1, 0);
  applyMocoTableUi_(sheet, 1, 7, { dataRows, inputCols: [2, 3, 4, 7], warningCols: [6], bandRows: true });
  if (dataRows > 0) {
    applyMocoDropdownList_(sheet, 2, 2, dataRows, ['Mua ngoài', 'Tự làm', 'Mix', 'Packaging'], true);
    applyMocoDropdownList_(sheet, 2, 3, dataRows, ['Danh mục nguyên liệu / Cost Review', 'Công thức con', 'Mix formula', 'Bao bì trực tiếp'], true);
    applyMocoDropdownNamedRange_(sheet, 2, 4, dataRows, ss, 'LIST_INGREDIENT_OR_RECIPE', true, 'Chọn tên nguyên liệu chuẩn hoặc tên công thức con.');
    applyMocoDropdownNamedRange_(sheet, 2, 5, dataRows, ss, 'LIST_UNITS', true, 'Đơn vị chuẩn để tính cost.');
  }
  return MOCO_COST_BOM_MAP_SHEET;
}

function applyMocoCostSubRecipeMapUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_SUB_RECIPE_MAP_SHEET);
  if (!sheet) return '';
  const dataRows = Math.max(sheet.getLastRow() - 1, 0);
  applyMocoTableUi_(sheet, 1, 7, { dataRows, formulaCols: [5, 6], warningCols: [7], bandRows: true });
  if (dataRows > 0) {
    applyMocoDropdownNamedRange_(sheet, 2, 2, dataRows, ss, 'LIST_RECIPE_NAMES', true, 'Chọn tên công thức con đúng trong sheet CÔNG THỨC.');
    applyMocoDropdownNamedRange_(sheet, 2, 4, dataRows, ss, 'LIST_UNITS', true, 'Đơn vị thành phẩm sau khi làm.');
  }
  return MOCO_COST_SUB_RECIPE_MAP_SHEET;
}

function applyMocoCostOutputUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet) return '';
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return '';
  const summaryRows = Math.max(findMocoDetailHeaderRow_(sheet) - 4, 0);
  applyMocoTableUi_(sheet, 1, 7, { dataRows: summaryRows, formulaCols: [2, 3, 4, 7], warningCols: [7], bandRows: true, filter: false });
  if (summaryRows > 0) {
    const statusRange = sheet.getRange(2, 7, summaryRows, 1);
    const statuses = statusRange.getDisplayValues();
    statusRange
      .setBackgrounds(statuses.map(row => [String(row[0] || '').indexOf('Cần xử lý') === 0 ? '#FCE8E6' : '#E6F4EA']))
      .setFontColors(statuses.map(row => [String(row[0] || '').indexOf('Cần xử lý') === 0 ? '#A50E0E' : '#137333']))
      .setFontWeight('bold');
  }
  try {
    sheet.hideColumns(3, 2);
    sheet.hideColumns(6);
  } catch (err) {}
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 170);
  sheet.setColumnWidth(5, 360);
  sheet.setColumnWidth(7, 150);
  const detailHeader = findMocoDetailHeaderRow_(sheet);
  if (detailHeader > 0) {
    applyMocoTableUi_(sheet, detailHeader, 11, { dataRows: Math.max(lastRow - detailHeader, 0), formulaCols: [9], warningCols: [10, 11], bandRows: true });
    applyMocoCostDetailGroupColors_(sheet);
  }
  return MOCO_COST_OUTPUT_SHEET;
}

function applyMocoCostFlowUi_(ss) {
  const sheet = ss.getSheetByName(MOCO_COST_FLOW_SHEET);
  if (!sheet) return '';
  applyMocoTableUi_(sheet, 2, 5, { dataRows: Math.max(sheet.getLastRow() - 2, 0), warningCols: [5], bandRows: true });
  return MOCO_COST_FLOW_SHEET;
}

function findMocoDetailHeaderRow_(sheet) {
  if (!sheet || sheet.getLastRow() < 1) return 0;
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '') === 'Tên bánh' && i > 0) return i + 1;
  }
  return 0;
}

function writeMocoCostOutput_(ss, summaryRows, detailRows) {
  let sheet = ss.getSheetByName(MOCO_COST_OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(MOCO_COST_OUTPUT_SHEET);
  sheet.clear().clearFormats();

  const summaryHeader = [[
    'Tên bánh',
    'Tổng cost / mẻ',
    'OK kỹ thuật',
    'Cần xử lý kỹ thuật',
    'Thành phẩm từ CÔNG THỨC',
    'Ghi chú nguồn/yield phụ',
    'Trạng thái',
  ]];
  sheet.getRange(1, 1, 1, summaryHeader[0].length).setValues(summaryHeader)
    .setFontWeight('bold').setBackground('#1A73E8').setFontColor('#FFFFFF');
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Tên công thức/món trong CÔNG THỨC.',
    2: 'Công thức trong ô: SUMIF thành tiền từng dòng nguyên liệu của món này.',
    3: 'Cột kỹ thuật đã ẩn: đếm số dòng trạng thái OK/OK_TEMP_PRICE/OK_G_ML_ASSUMED.',
    4: 'Cột kỹ thuật đã ẩn: tổng dòng nguyên liệu trừ số dòng OK, tức số dòng cần xử lý.',
    5: 'Yield/thành phẩm đọc từ CÔNG THỨC.',
    6: 'Cột kỹ thuật đã ẩn: thông tin fallback/yield phụ, không phải nguồn nguyên liệu chính.',
    7: 'Founder chỉ cần nhìn cột này: OK hoặc Cần xử lý X dòng.',
  });
  if (summaryRows.length) {
    sheet.getRange(2, 1, summaryRows.length, 6).setValues(summaryRows);
    sheet.getRange(2, 2, summaryRows.length, 1).setNumberFormat('#,##0 [$đ-42A]');
  }

  const detailStart = summaryRows.length + 4;
  const detailHeader = [[
    'Tên bánh', 'Nguyên liệu', 'Định lượng gốc', 'SL quy đổi', 'Đơn vị quy đổi',
    'Tên nguyên liệu khớp', 'Đơn vị chuẩn', 'Đơn giá / 1 ĐV', 'Thành tiền', 'Trạng thái', 'Ghi chú',
  ]];
  sheet.getRange(detailStart, 1, 1, detailHeader[0].length).setValues(detailHeader)
    .setFontWeight('bold').setBackground('#188038').setFontColor('#FFFFFF');
  setMocoHeaderNotes_(sheet, detailStart, {
    1: 'Tên công thức/món.',
    2: 'Nguyên liệu đọc từ CÔNG THỨC.',
    3: 'Định lượng gốc Quỳnh nhập.',
    4: 'Số lượng đã parse để tính.',
    5: 'Đơn vị đã parse: g/ml/quả/hộp/lá...',
    6: 'Tên nguyên liệu hoặc nguồn giá đang được khớp.',
    7: 'Đơn vị giá đang dùng.',
    8: 'Đơn giá quy về 1 đơn vị.',
    9: 'Công thức trong ô: SL quy đổi x Đơn giá nếu trạng thái OK. Giúp audit trực tiếp trên sheet.',
    10: 'Trạng thái tính cost.',
    11: 'Ghi chú nguồn giá hoặc việc cần sửa.',
  });
  if (detailRows.length) {
    sheet.getRange(detailStart + 1, 1, detailRows.length, detailHeader[0].length).setValues(detailRows);
    const detailDataStart = detailStart + 1;
    const detailDataEnd = detailStart + detailRows.length;
    const lineCostFormulas = [];
    for (let i = 0; i < detailRows.length; i++) {
      const r = detailDataStart + i;
      lineCostFormulas.push(['=IF(LEFT($J' + r + ';2)="OK";IFERROR($D' + r + '*$H' + r + ';"");"")']);
    }
    sheet.getRange(detailDataStart, 9, detailRows.length, 1).setFormulas(lineCostFormulas);
    sheet.getRange(detailStart + 1, 8, detailRows.length, 2).setNumberFormat('#,##0.00 [$đ-42A]');
    sheet.getRange(detailStart + 1, 4, detailRows.length, 1).setNumberFormat('#,##0.##');
  }
  if (summaryRows.length && detailRows.length) {
    const detailDataStart = detailStart + 1;
    const detailDataEnd = detailStart + detailRows.length;
    const firstIssueRowByCake = {};
    detailRows.forEach((row, index) => {
      const cake = String(row[0] || '').trim();
      const status = String(row[9] || '').trim();
      if (!cake || !status || status.indexOf('OK') === 0 || firstIssueRowByCake[cake]) return;
      firstIssueRowByCake[cake] = detailDataStart + index;
    });
    const summaryFormulas = [];
    for (let i = 0; i < summaryRows.length; i++) {
      const r = i + 2;
      summaryFormulas.push([
        '=IFERROR(SUMIF($A$' + detailDataStart + ':$A$' + detailDataEnd + ';$A' + r + ';$I$' + detailDataStart + ':$I$' + detailDataEnd + ');"")',
        '=IFERROR(COUNTIFS($A$' + detailDataStart + ':$A$' + detailDataEnd + ';$A' + r + ';$J$' + detailDataStart + ':$J$' + detailDataEnd + ';"OK*");0)',
        '=IFERROR(COUNTIF($A$' + detailDataStart + ':$A$' + detailDataEnd + ';$A' + r + ')-$C' + r + ';0)',
      ]);
    }
    sheet.getRange(2, 2, summaryRows.length, 3).setFormulas(summaryFormulas);
    const statusFormulas = [];
    const sheetId = sheet.getSheetId();
    for (let i = 0; i < summaryRows.length; i++) {
      const r = i + 2;
      const issueRow = firstIssueRowByCake[String(summaryRows[i][0] || '').trim()] || detailDataStart;
      statusFormulas.push(['=IF($D' + r + '>0;HYPERLINK("#gid=' + sheetId + '&range=A' + issueRow + '";"Cần xử lý "&$D' + r + '&" dòng");"OK")']);
    }
    sheet.getRange(2, 7, summaryRows.length, 1).setFormulas(statusFormulas);
  }

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, detailHeader[0].length);
  try {
    sheet.hideColumns(3, 2);
    sheet.hideColumns(6);
  } catch (err) {}
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 170);
  sheet.setColumnWidth(5, 360);
  sheet.setColumnWidth(7, 150);
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), Math.max(sheet.getLastColumn(), 1))
    .setVerticalAlignment('middle')
    .setWrap(true);
  applyMocoCostDetailGroupColors_(sheet);
  SpreadsheetApp.flush();
}

function applyMocoCostDetailGroupColors_(sheet) {
  const detailHeader = findMocoDetailHeaderRow_(sheet);
  if (!detailHeader) return;
  const dataRows = Math.max(sheet.getLastRow() - detailHeader, 0);
  if (!dataRows) return;
  const values = sheet.getRange(detailHeader + 1, 1, dataRows, 11).getDisplayValues();
  const palette = ['#F8FAFD', '#F3F7FF', '#F7F3FF', '#F2F8F5', '#FFF8F0', '#F6F8EA', '#FDF3F2'];
  const cakeColorMap = {};
  let colorIndex = 0;
  const backgrounds = values.map(row => {
    const cake = String(row[0] || '').trim();
    if (cake && !cakeColorMap[cake]) {
      cakeColorMap[cake] = palette[colorIndex % palette.length];
      colorIndex += 1;
    }
    return Array.from({ length: 11 }, () => cakeColorMap[cake] || '#FFFFFF');
  });
  sheet.getRange(detailHeader + 1, 1, dataRows, 11).setBackgrounds(backgrounds);

  const statusColors = values.map(row => {
    const status = String(row[9] || '');
    if (!status) return ['#FFFFFF', '#FFFFFF'];
    if (status.indexOf('OK') === 0) return ['#E6F4EA', '#E6F4EA'];
    if (status === 'MISSING_MASTER' || status === 'UNIT_MISMATCH' || status === 'UNSUPPORTED_UNIT') return ['#FCE8E6', '#FCE8E6'];
    return ['#FEF7E0', '#FEF7E0'];
  });
  const statusFonts = values.map(row => {
    const status = String(row[9] || '');
    if (status.indexOf('OK') === 0) return ['#137333', '#137333'];
    if (status) return ['#A50E0E', '#A50E0E'];
    return ['#202124', '#202124'];
  });
  sheet.getRange(detailHeader + 1, 10, dataRows, 2)
    .setBackgrounds(statusColors)
    .setFontColors(statusFonts);
}

function suggestMocoCostFix_(item) {
  if (item.status === 'MISSING_MASTER') {
    return 'Chọn nguyên liệu chuẩn ở cột J hoặc thêm nguyên liệu này vào NHẬP HÀNG rồi cập nhật danh mục.';
  }
  if (item.status === 'MISSING_PRICE') {
    return 'Bổ sung giá nhập/quy cách cho nguyên liệu này trong NHẬP HÀNG hoặc nhập giá tạm ở cột K.';
  }
  if (item.status === 'SUSPECT_UNIT_PRICE') {
    return 'Kiểm tra quy cách trong NHẬP HÀNG. Giá / 1 ' + (item.masterUnit || 'đơn vị') + ' đang bất thường.';
  }
  if (item.status === 'UNSUPPORTED_UNIT') {
    return 'Quy đổi định lượng tsp/nhúm/lá/hộp sang g/ml/quả hoặc nhập giá tạm ở cột K.';
  }
  if (item.status === 'UNIT_MISMATCH') {
    return 'Chọn nguyên liệu khác có cùng đơn vị, hoặc quy đổi đơn vị trong công thức/danh mục.';
  }
  return 'Review thủ công.';
}

function applyMocoCostReviewFormatting_(sheet, dataRows) {
  if (!dataRows) return;
  const statusRange = sheet.getRange(5, 11, dataRows, 1);
  const statuses = statusRange.getDisplayValues();
  const colors = statuses.map(row => {
    const status = row[0];
    if (status === 'MISSING_MASTER') return ['#FCE8E6'];
    if (status === 'MISSING_PRICE') return ['#FEF7E0'];
    if (status === 'SUSPECT_UNIT_PRICE') return ['#FAD2CF'];
    if (status === 'UNSUPPORTED_UNIT') return ['#E8F0FE'];
    if (status === 'UNIT_MISMATCH') return ['#F3E8FD'];
    return ['#FFFFFF'];
  });
  sheet.getRange(5, 1, dataRows, 1).setBackgrounds(colors);
}

function isMocoCostTotalRow_(text) {
  const n = normMocoCostText_(text);
  return n.indexOf('tong') === 0 || n.indexOf('cost') === 0 || n === '-';
}

function normMocoCostText_(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
