/**
 * MOCO Kitchen - NHAP HANG v2
 * Plan C: SL MUA + QUY CACH split + improved UI
 *
 * Column structure (A:J = 10 cols):
 *   A: NGAY NHAP
 *   B: TEN HANG HOA
 *   C: LOAI HANG
 *   D: SL MUA      ← so goi/hop mua
 *   E: QUY CACH    ← kl/tt moi goi (g hoac ml)
 *   F: DON VI
 *   G: GIA NHAP
 *   H: DON GIA / 1 DV ← tu tinh = G / (D * E) voi g/ml, hoac G / D voi qua/cai
 *   I: NHA CUNG CAP
 *   J: GHI CHU
 *
 * Price history: L:U (cols 12-21), selector at M2
 */

const SHEET_NAME = 'NHẬP HÀNG';
const MOCO_SPREADSHEET_ID = '1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y';
const WEB_APP_TOKEN_PROPERTY = 'MOCO_WEB_APP_TOKEN';
const TEMP_WEB_APP_TOKEN = '';
const CLEAN_CONFIRM_PHRASE = 'RUN_CLEAN_NHAP_HANG';

const HEADERS = [
  'NHẬP','TÊN HÀNG HOÁ','NCC','LOẠI HÀNG',
  'SL','QUY CÁCH','ĐƠN VỊ',
  'GIÁ NHẬP','ĐƠN GIÁ / 1 ĐV','GHI CHÚ',
];

const HEADER_NOTES = {
  2: 'TÊN HÀNG HOÁ: NHẬP HÀNG là sổ mua mọi thứ. Ưu tiên chọn từ dropdown danh mục chuẩn. Nếu gõ tên ngoài danh mục, ô sẽ đỏ. Nếu đó là hàng mới thật, chạy MOCO > Thêm hàng mới vào danh mục. Cost bánh chỉ đọc các hàng được đánh dấu là nguyên liệu công thức trong danh mục.',
  5: 'SL: Số gói/hộp/túi/chai đã mua trong 1 lần nhập hàng.',
  6: 'QUY CÁCH: Khối lượng hoặc thể tích mỗi gói (g hoặc ml). Để trống với dụng cụ/bao bì hoặc đơn vị đã là chai/hộp/cái.',
  9: 'ĐƠN GIÁ / 1 ĐV: Quy về cùng đơn vị để so sánh giá. Với g/ml = Giá nhập ÷ (SL × Quy cách). Với quả/cái/bộ/túi/chai = Giá nhập ÷ SL.',
};

const CATEGORIES = [
  'Nguyên liệu khô','Sữa/bơ/kem','Hạt','Trái cây','Trứng',
  'Bao bì','In ấn/tem nhãn','Dụng cụ','Thiết bị','Marketing/content','Vận hành','Decor/chụp ảnh','Khác',
];
const UNITS = ['g','ml','kg','l','quả','cái','bộ','túi','gói','hộp','chai','lá'];

function getMocoSpreadsheet_() {
  if (MOCO_SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(MOCO_SPREADSHEET_ID);
    } catch (err) {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) return active;
      throw err;
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

const CAT_COLORS = {
  'Nguyên liệu khô': { bg: '#FFF8E1', fg: '#E65100' },
  'Sữa/bơ/kem':     { bg: '#E3F2FD', fg: '#0D47A1' },
  'Hạt':            { bg: '#E8F5E9', fg: '#1B5E20' },
  'Trái cây':       { bg: '#FFF3E0', fg: '#BF360C' },
  'Trứng':          { bg: '#FFFDE7', fg: '#F57F17' },
  'Bao bì':         { bg: '#F3E5F5', fg: '#4A148C' },
  'In ấn/tem nhãn': { bg: '#F3E5F5', fg: '#4A148C' },
  'Dụng cụ':        { bg: '#FCE4EC', fg: '#880E4F' },
  'Thiết bị':       { bg: '#EDE7F6', fg: '#4527A0' },
  'Marketing/content': { bg: '#E0F2F1', fg: '#004D40' },
  'Vận hành':       { bg: '#ECEFF1', fg: '#263238' },
  'Decor/chụp ảnh': { bg: '#FCE4EC', fg: '#880E4F' },
  'Khác':           { bg: '#FAFAFA', fg: '#616161' },
};

// ─── Menu ────────────────────────────────────────────────────────────────────
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const advancedMenu = ui.createMenu('Nâng cao - admin')
    .addItem('Refresh lịch sử giá NHẬP HÀNG', 'MOCO_REFRESH_HISTORY')
    .addItem('Cập nhật giá danh mục', 'MOCO_REFRESH_MASTER_NVL')
    .addItem('Cập nhật dropdown/danh mục', 'MOCO_REFRESH_DATA_VALIDATION_LISTS')
    .addItem('Cập nhật giao diện bảng', 'MOCO_APPLY_NEW_TABLE_UI')
    .addItem('Cập nhật hướng dẫn & ghi chú', 'MOCO_APPLY_GUIDE_AND_NOTES')
    .addItem('Sắp xếp sheet cho Founder', 'MOCO_ORGANIZE_SHEETS_FOR_FOUNDER');

  ui.createMenu('MOCO')
    .addItem('Nhập đơn mới', 'MOCO_SHOW_ORDER_FORM')
    .addItem('Update toàn bộ data', 'MOCO_UPDATE_ALL_DATA')
    .addItem('Cập nhật việc cần làm', 'MOCO_REFRESH_FOUNDER_ACTION')
    .addSeparator()
    .addSubMenu(advancedMenu)
    .addToUi();

  if (typeof buildContentAiMenu_ === 'function') {
    buildContentAiMenu_();
  }

  if (typeof MOCO_BOOTSTRAP_UI_ON_OPEN_ === 'function') {
    MOCO_BOOTSTRAP_UI_ON_OPEN_();
  }
}

function MOCO_UPDATE_ALL_DATA() {
  const ss = getMocoSpreadsheet_();
  const nhapHang = ss.getSheetByName(SHEET_NAME);
  if (nhapHang && typeof setNhapHangHistoryTitle_ === 'function') {
    setNhapHangHistoryTitle_(nhapHang);
  }
  if (typeof MOCO_REFRESH_HISTORY === 'function') {
    MOCO_REFRESH_HISTORY();
  }
  if (typeof MOCO_REFRESH_MASTER_NVL === 'function') {
    MOCO_REFRESH_MASTER_NVL();
  }
  const validationLists = typeof MOCO_REFRESH_DATA_VALIDATION_LISTS === 'function'
    ? MOCO_REFRESH_DATA_VALIDATION_LISTS()
    : null;
  const workflow = typeof MOCO_BUILD_ONLINE_BAKERY_WORKFLOW === 'function'
    ? MOCO_BUILD_ONLINE_BAKERY_WORKFLOW()
    : null;
  if (nhapHang && typeof setNhapHangHistoryTitle_ === 'function') {
    setNhapHangHistoryTitle_(nhapHang);
  }
  try {
    SpreadsheetApp.getActive().toast('Đã update toàn bộ data.', 'MOCO', 5);
  } catch (err) {}
  return {
    refreshedHistory: typeof MOCO_REFRESH_HISTORY === 'function',
    refreshedMasterNvl: typeof MOCO_REFRESH_MASTER_NVL === 'function',
    validationLists,
    workflow,
  };
}

function onEdit(e) {
  if (!e || !e.range) return;
  if (typeof onEditThuChi_ === 'function') {
    onEditThuChi_(e);
  }
  if (typeof onEditMocoCost_ === 'function') {
    onEditMocoCost_(e);
  }
  if (typeof onEditMocoOrderUi_ === 'function') {
    onEditMocoOrderUi_(e);
  }
  if (typeof onEditMocoYieldUi_ === 'function') {
    onEditMocoYieldUi_(e);
  }

  const s = e.range.getSheet();
  if (s.getName() !== SHEET_NAME) return;
  const r = e.range.getRow(), c = e.range.getColumn();
  if ((r === 2 && c === 13) || (r >= 2 && c >= 1 && c <= 10)) {
    MOCO_REFRESH_HISTORY();
  }
}

// ─── Web App endpoint ────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = parseWebAppPayload_(e);
    assertWebAppToken_(payload.token);

    const action = String(payload.action || 'status').trim();
    if (action === 'status') {
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'set_web_app_token') {
      const result = setWebAppToken_(payload.newToken);
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'refresh_history') {
      MOCO_REFRESH_HISTORY();
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'update_from_nhap_hang') {
      const result = MOCO_UPDATE_FROM_NHAP_HANG();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'update_all_data') {
      const result = MOCO_UPDATE_ALL_DATA();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'create_dashboard') {
      MOCO_CREATE_DASHBOARD();
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'debug_dashboard_snapshot') {
      const result = MOCO_DEBUG_DASHBOARD_SNAPSHOT();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_menu_snapshot') {
      const result = MOCO_DEBUG_MENU_SNAPSHOT();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'build_cost_from_recipe') {
      MOCO_BUILD_COST_FROM_RECIPE();
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'generate_cost_review') {
      const result = MOCO_GENERATE_COST_REVIEW();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'create_cost_action_flow') {
      const result = MOCO_CREATE_COST_ACTION_FLOW();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'fill_cost_review_ai_temp_prices') {
      const result = MOCO_FILL_COST_REVIEW_AI_TEMP_PRICES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_p3_recipe_side_price_updates') {
      const result = MOCO_APPLY_P3_RECIPE_SIDE_PRICE_UPDATES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'create_online_bakery_sheets') {
      const result = MOCO_CREATE_ONLINE_BAKERY_SHEETS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'build_online_bakery_workflow') {
      const result = MOCO_BUILD_ONLINE_BAKERY_WORKFLOW();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'refresh_founder_action') {
      const result = MOCO_REFRESH_FOUNDER_ACTION();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_online_bakery_state') {
      const result = MOCO_DEBUG_ONLINE_BAKERY_STATE();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_founder_action_rows') {
      const result = MOCO_DEBUG_FOUNDER_ACTION_ROWS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_recipe_yield_candidates') {
      const result = MOCO_DEBUG_RECIPE_YIELD_CANDIDATES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_vinegar_state') {
      const result = MOCO_DEBUG_VINEGAR_STATE();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_order_import_audit') {
      const result = MOCO_DEBUG_ORDER_IMPORT_AUDIT(payload.query || '', payload.sourceSpreadsheetId || '');
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_current_order_sheet') {
      const result = MOCO_DEBUG_CURRENT_ORDER_SHEET();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_order_audit_notes') {
      const result = MOCO_APPLY_ORDER_AUDIT_NOTES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'setup_order_copy_buffer') {
      const result = MOCO_SETUP_ORDER_COPY_BUFFER();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'sync_order_sheet_from_source') {
      const result = MOCO_SYNC_ORDER_SHEET_FROM_SOURCE(payload.sourceSheetName || '');
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'standardize_orders') {
      const result = MOCO_STANDARDIZE_ORDERS(payload.dryRun !== false, payload);
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'repair_order_source_channel') {
      const result = MOCO_REPAIR_ORDER_SOURCE_CHANNEL({
        dryRun: payload.dryRun !== false,
        confirm: payload.confirm,
        sourceTabsData: payload.sourceTabsData || null,
      });
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'apply_founder_order_view') {
      const result = MOCO_APPLY_FOUNDER_ORDER_VIEW({
        dryRun: payload.dryRun !== false,
        confirm: payload.confirm,
        sourceTabsData: payload.sourceTabsData || null,
      });
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'debug_order_form_data') {
      const result = MOCO_GET_ORDER_FORM_DATA();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_order_ui_safe') {
      const result = MOCO_APPLY_ORDER_UI_SAFE(payload.dryRun !== false);
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'sync_order_dropdown_ui') {
      const result = MOCO_SYNC_ORDER_DROPDOWN_UI(payload.dryRun !== false);
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'sync_yield_item_ui') {
      const result = MOCO_SYNC_YIELD_ITEM_UI(payload.dryRun !== false);
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'audit_thu_chi_copy') {
      const result = MOCO_AUDIT_THU_CHI_COPY(payload.sourceSheetName || '');
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'reconcile_thu_chi_copy') {
      const result = MOCO_RECONCILE_THU_CHI_FROM_COPY(payload.dryRun !== false, payload.sourceSheetName || '');
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'debug_thu_chi_parallel') {
      const result = MOCO_DEBUG_THU_CHI_PARALLEL();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'compact_home_founder') {
      const result = MOCO_COMPACT_HOME_FOR_FOUNDER();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_home_sheet') {
      const result = MOCO_DEBUG_HOME_SHEET();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'fix_home_scroll') {
      const result = MOCO_FIX_HOME_SCROLL(payload.dryRun !== false);
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'delete_order_staging_sheets') {
      const result = MOCO_DELETE_ORDER_STAGING_SHEETS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_lady_finger_state') {
      const result = MOCO_DEBUG_LADY_FINGER_STATE();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_pricing_dashboard_state') {
      const result = MOCO_DEBUG_PRICING_DASHBOARD_STATE();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'organize_sheets_for_founder') {
      const result = MOCO_ORGANIZE_SHEETS_FOR_FOUNDER();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'focus_founder_sheets') {
      const result = MOCO_FOCUS_FOUNDER_SHEETS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_guide_and_notes') {
      const result = MOCO_APPLY_GUIDE_AND_NOTES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_new_table_ui') {
      const result = MOCO_APPLY_NEW_TABLE_UI();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'refresh_data_validation_lists') {
      const result = MOCO_REFRESH_DATA_VALIDATION_LISTS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'audit_recipe_ingredient_names') {
      const result = MOCO_AUDIT_RECIPE_INGREDIENT_NAMES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'fix_recipe_ingredient_names') {
      const result = MOCO_FIX_RECIPE_INGREDIENT_NAMES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'append_vinegar_purchase') {
      const result = MOCO_APPEND_VINEGAR_PURCHASE();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'moco_quick_fix_cost_links') {
      const result = MOCO_QUICK_FIX_COST_LINKS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'cost_review_snapshot') {
      const result = MOCO_COST_REVIEW_SNAPSHOT();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_short_sheet_names') {
      const result = MOCO_APPLY_SHORT_SHEET_NAMES();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_cost_flow_logic_guide') {
      const result = MOCO_APPLY_COST_FLOW_LOGIC_GUIDE();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'create_master_nvl') {
      MOCO_CREATE_MASTER_NVL();
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'refresh_master_nvl') {
      MOCO_REFRESH_MASTER_NVL();
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'apply_nhap_hang_name_dropdown') {
      const result = MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'disable_nhap_hang_name_dropdown') {
      const result = MOCO_DISABLE_NHAP_HANG_NAME_DROPDOWN();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'debug_nhap_hang_recovery') {
      const result = MOCO_DEBUG_NHAP_HANG_RECOVERY_();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'restore_nhap_hang_prices') {
      const result = MOCO_RESTORE_NHAP_HANG_PRICES_(payload.sourceSheetName || '');
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_master_nvl_ui') {
      const result = MOCO_APPLY_MASTER_NVL_UI();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'fix_validation_sheets_ui') {
      const result = MOCO_FIX_VALIDATION_SHEETS_UI();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'normalize_master_cost_flags') {
      const result = MOCO_NORMALIZE_MASTER_COST_FLAGS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'create_nhap_master_name_review') {
      const result = MOCO_CREATE_NHAP_MASTER_NAME_REVIEW();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'refresh_name_review_action_dropdown') {
      const result = MOCO_REFRESH_NAME_REVIEW_ACTION_DROPDOWN();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'audit_name_review_apply') {
      const result = MOCO_AUDIT_NAME_REVIEW_APPLY();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'fix_unsafe_name_review_suggestions') {
      const result = MOCO_FIX_UNSAFE_NAME_REVIEW_SUGGESTIONS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'apply_name_review_to_nhap_and_master') {
      const result = MOCO_APPLY_NAME_REVIEW_TO_NHAP_AND_MASTER();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'add_new_nhap_hang_names_to_master') {
      const result = MOCO_ADD_NEW_NHAP_HANG_NAMES_TO_MASTER();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'delete_obsolete_name_review_sheets') {
      const result = MOCO_DELETE_OBSOLETE_NAME_REVIEW_SHEETS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'rebuild_thu_chi') {
      MOCO_REBUILD_THU_CHI();
      return jsonResponse_({ ok: true, action, data: getStatus_() });
    }

    if (action === 'backfill_thu_chi') {
      const result = MOCO_BACKFILL_THU();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'repair_thu_chi_order_sync') {
      const result = MOCO_REPAIR_THU_CHI_ORDER_SYNC();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'cleanup_order_hidden_sheets') {
      const result = MOCO_CLEANUP_ORDER_HIDDEN_SHEETS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'audit_temp_sheets') {
      const result = MOCO_AUDIT_TEMP_SHEETS();
      return jsonResponse_({ ok: true, action, data: result });
    }

    if (action === 'cleanup_temp_sheets') {
      const result = MOCO_CLEANUP_TEMP_SHEETS({
        dryRun: payload.dryRun !== false,
        confirm: payload.confirm,
      });
      return jsonResponse_({ ok: true, action, dryRun: payload.dryRun !== false, data: result });
    }

    if (action === 'clean_nhap_hang') {
      const dryRun = payload.dryRun !== false;
      const result = runCleanNhapHang_({
        dryRun,
        confirm: payload.confirm,
        preserveUi: payload.preserveUi !== false,
        sourceMode: payload.sourceMode || 'current',
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    if (action === 'import_public_source_tabs' || action === 'merge_public_source_tabs') {
      const dryRun = payload.dryRun !== false;
      const result = MOCO_IMPORT_PUBLIC_SOURCE_TABS({
        dryRun,
        confirm: payload.confirm,
        sourceSpreadsheetId: payload.sourceSpreadsheetId || '',
        sourceTabsData: payload.sourceTabsData || null,
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    if (action === 'repair_public_source_merge') {
      const dryRun = payload.dryRun !== false;
      const result = MOCO_REPAIR_PUBLIC_SOURCE_MERGE({
        dryRun,
        confirm: payload.confirm,
        sourceTabsData: payload.sourceTabsData || null,
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    if (action === 'repair_direct_source_tabs') {
      const dryRun = payload.dryRun !== false;
      const result = MOCO_REPAIR_DIRECT_SOURCE_TABS({
        dryRun,
        confirm: payload.confirm,
        sourceSpreadsheetId: payload.sourceSpreadsheetId || '',
        sourceTabsData: payload.sourceTabsData || null,
        tabs: payload.tabs || null,
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    if (action === 'dedupe_nhap_hang_merge_keys') {
      const dryRun = payload.dryRun !== false;
      const result = MOCO_DEDUPE_NHAP_HANG_MERGE_KEYS({
        dryRun,
        confirm: payload.confirm,
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    if (action === 'dedupe_nhap_hang_strict_keys') {
      const dryRun = payload.dryRun !== false;
      const result = MOCO_DEDUPE_NHAP_HANG_STRICT_KEYS({
        dryRun,
        confirm: payload.confirm,
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    if (action === 'validate_nhap_hang_ai_fix') {
      const dryRun = payload.dryRun !== false;
      const result = MOCO_VALIDATE_NHAP_HANG_AI_FIX({
        dryRun,
        confirm: payload.confirm,
      });
      return jsonResponse_({ ok: true, action, dryRun, data: result });
    }

    throw new Error('Unsupported action: ' + action);
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

// ─── Main entry ──────────────────────────────────────────────────────────────
function MOCO_SETUP() {
  runCleanNhapHang_({
    dryRun: false,
    confirm: CLEAN_CONFIRM_PHRASE,
    preserveUi: false,
    sourceMode: 'latest_backup',
  });
}

function runCleanNhapHang_(options) {
  const opts = options || {};
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + SHEET_NAME);

  // Menu setup can rebuild from an older raw backup. Web App defaults to current
  // sheet so fresh founder edits are not overwritten by stale backup data.
  const sourceSheet = opts.sourceMode === 'latest_backup'
    ? (findLatestBackup_(ss) || sheet)
    : sheet;
  const range = sourceSheet.getDataRange();
  const values = range.getValues();
  const display = range.getDisplayValues();
  const records = normalizeRows_(values, display);
  const preview = buildCleanPreview_(ss, sheet, sourceSheet, records);

  if (opts.dryRun !== false) {
    return preview;
  }

  if (opts.confirm !== CLEAN_CONFIRM_PHRASE) {
    throw new Error('Missing confirm phrase for write action: ' + CLEAN_CONFIRM_PHRASE);
  }

  const backupName = createBackup_(ss, sheet);

  writeTable_(sheet, records, { preserveUi: opts.preserveUi !== false });
  setupHistoryUi_(sheet, records, { preserveUi: opts.preserveUi !== false });
  MOCO_REFRESH_HISTORY();

  return Object.assign({}, preview, {
    backupName,
    written: true,
    preserveUi: opts.preserveUi !== false,
  });
}

/** Tìm sheet backup có data gốc (cột KHỐI LƯỢNG riêng, chưa bị v1 gộp) */
function findLatestBackup_(ss) {
  const backups = ss.getSheets()
    .filter(s => s.getName().startsWith('BACKUP'))
    .sort((a, b) => b.getName().localeCompare(a.getName()));

  // Scan TẤT CẢ backups (mới → cũ) tìm bản có cột KHỐI LƯỢNG
  for (const bk of backups) {
    const lastCol = bk.getLastColumn();
    if (lastCol < 2) continue;
    const hdr = bk.getRange(1, 1, 1, lastCol).getValues()[0]
      .map(c => normText_(c));
    if (hdr.some(h => h.includes('khoi luong'))) {
      return bk;
    }
  }
  return null; // Không tìm thấy backup gốc → dùng sheet hiện tại
}

// ─── Price history refresh ────────────────────────────────────────────────────
function MOCO_REFRESH_HISTORY() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  const item = String(sheet.getRange('M2').getValue() || '').trim();
  const maxR = Math.max(sheet.getMaxRows() - 4, 1);
  setNhapHangHistoryTitle_(sheet);
  sheet.getRange('L4:U4').setValues([[
    'Ngày nhập','SL Mua','Quy Cách','Đơn vị',
    'Giá nhập','Đơn giá / 1 ĐV','Nhà cung cấp',
    'Chênh lệch / 1 ĐV','%','Trạng thái',
  ]]).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#3C4043')
     .setHorizontalAlignment('center');
  sheet.getRange(5, 12, maxR, 10).clearContent().clearFormat();

  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    applyUnitPriceFormulas_(sheet, lastRow);
    SpreadsheetApp.flush();
  }
  if (!item || lastRow < 2) return;

  const idx = getNhapHangFormulaIndexes_(sheet);
  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  const rows = data
    .filter(r => String(r[idx.nameCol] || '').trim() === item)
    .map(r => ({
      date:      r[idx.dateCol],
      slMua:     Number(r[idx.qtyCol]) || '',
      quyCach:   Number(r[idx.packCol]) || '',
      unit:      String(r[idx.unitCol] || '').trim(),
      price:     Number(r[idx.priceCol]) || '',
      unitPrice: Number(r[idx.unitPriceCol]) || '',
      supplier:  idx.supplierCol >= 0 ? r[idx.supplierCol] : '',
    }))
    .sort((a, b) => dateSortVal_(a.date) - dateSortVal_(b.date));

  const prevByUnit = {};
  const out = rows.map(r => {
    let delta = '', pct = '', status = 'Không đủ dữ liệu';
    if (r.unit && r.unitPrice) {
      const prev = prevByUnit[r.unit];
      if (!prev) {
        status = 'Lần đầu';
      } else {
        delta = r.unitPrice - prev;
        pct = prev ? delta / prev : '';
        status = Math.abs(delta) < 0.0001 ? 'Không đổi' : delta > 0 ? '🔺 Tăng' : '🔻 Giảm';
      }
      prevByUnit[r.unit] = r.unitPrice;
    }
    return [r.date, r.slMua, r.quyCach, r.unit, r.price, r.unitPrice, r.supplier, delta, pct, status];
  });

  if (!out.length) return;

  const tgt = sheet.getRange(5, 12, out.length, 10);
  tgt.setValues(out);

  // Format
  sheet.getRange(5, 12, out.length, 1).setNumberFormat('dd/mm/yyyy');
  sheet.getRange(5, 16, out.length, 1).setNumberFormat('#,##0 [$đ-42A]');
  sheet.getRange(5, 17, out.length, 1).setNumberFormat('#,##0.00 [$đ-42A]');
  sheet.getRange(5, 19, out.length, 1).setNumberFormat('+#,##0.00;-#,##0.00;0');
  sheet.getRange(5, 20, out.length, 1).setNumberFormat('+0.00%;-0.00%;0.00%');
  tgt.setBorder(true,true,true,true,true,true,'#d9e2f3', SpreadsheetApp.BorderStyle.SOLID);

  // Color status column
  const statusRange = sheet.getRange(5, 21, out.length, 1);
  const bgColors = out.map(r => {
    const s = String(r[9]);
    if (s.includes('Tăng')) return ['#FFEBEE'];
    if (s.includes('Giảm')) return ['#E8F5E9'];
    if (s === 'Lần đầu') return ['#E3F2FD'];
    return ['#FFFFFF'];
  });
  statusRange.setBackgrounds(bgColors);
}

function MOCO_UPDATE_FROM_NHAP_HANG() {
  return MOCO_UPDATE_ALL_DATA();
}

function setNhapHangHistoryTitle_(sheet) {
  if (!sheet) return;
  try { sheet.getRange('L1:U1').breakApart(); } catch (err) {}
  sheet.getRange('L1:U1').clearContent().clearFormat().clearDataValidations().clearNote();
  sheet.getRange('L1:U1').merge();
  sheet.getRange('L1')
    .setValue('📊 TRA CỨU BIẾN ĐỘNG GIÁ NHẬP')
    .setFontWeight('bold').setFontColor('#FFFFFF')
    .setBackground('#0B8043').setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}

// ─── Normalize rows ───────────────────────────────────────────────────────────
function normalizeRows_(values, displayValues) {
  if (!values.length) return [];

  const hdr = values[0].map(c => normText_(c));

  // Detect format: raw (có KHỐI LƯỢNG) vs v1-cleaned (SỐ LƯỢNG đã gộp)
  const hasKhoiLuong = hdr.some(h => h.includes('khoi luong'));
  const isV1Cleaned  = !hasKhoiLuong && hdr.some(h => h.includes('don vi'));

  const idx = {
    date:     findCol_(hdr, ['ngay nhap']),
    name:     findCol_(hdr, ['ten hang hoa','ten hang']),
    category: findCol_(hdr, ['loai hang']),
    sl:       findCol_(hdr, ['sl mua','so luong']),
    qc:       findCol_(hdr, hasKhoiLuong ? ['khoi luong'] : ['quy cach']),
    unit:     findCol_(hdr, ['don vi']),
    price:    findCol_(hdr, ['gia nhap']),
    supplier: findCol_(hdr, ['nha cung cap']),
    note:     findCol_(hdr, ['ghi chu']),
  };

  const records = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r], dis = displayValues[r];
    const rawName = getCell_(row, dis, idx.name);
    if (!rawName) continue;

    const rawDate     = getCell_(row, dis, idx.date);
    const rawPrice    = getCell_(row, dis, idx.price);
    const rawSupplier = getCell_(row, dis, idx.supplier);
    const rawNote     = getCell_(row, dis, idx.note);
    const rawSl       = getCell_(row, dis, idx.sl);
    const rawQc       = getCell_(row, dis, idx.qc);
    const rawUnit     = getCell_(row, dis, idx.unit);

    const category = getCell_(row, dis, idx.category) || classifyItem_(rawName);
    let slMua, quyCach, unit, qcNote;

    if (hasKhoiLuong) {
      // === FORMAT GỐC: SỐ LƯỢNG + KHỐI LƯỢNG riêng ===
      ({slMua, quyCach, unit, note: qcNote} = parseSlAndQc_(rawSl, rawQc, rawName, category));
    } else if (isV1Cleaned) {
      // === FORMAT V1: SỐ LƯỢNG = tổng KL đã quy đổi, ĐƠN VỊ có sẵn ===
      // v1 đã gộp: SỐ LƯỢNG=1000 (total), ĐƠN VỊ=ml → SL MUA=1, QUY CÁCH=1000
      const totalVal = parseNumber_(rawSl);
      unit = String(rawUnit || '').trim();
      if (unit === 'g' || unit === 'ml') {
        slMua = 1;
        quyCach = totalVal || '';
      } else {
        // quả, cái, bộ, túi → SL MUA = totalVal, QUY CÁCH trống
        slMua = totalVal || '';
        quyCach = '';
      }
      qcNote = unit ? '' : 'Cần kiểm tra: thiếu đơn vị';
    } else {
      // === FORMAT KHÁC (chưa biết) ===
      ({slMua, quyCach, unit, note: qcNote} = parseSlAndQc_(rawSl, rawQc, rawName, category));
    }

    const price = parsePrice_(rawPrice);
    const unitPrice = calcBaseUnitPrice_(price, slMua, quyCach, unit);

    const notes = [];
    if (rawNote) notes.push(rawNote);
    if (qcNote)  notes.push(qcNote);
    if (!price)  notes.push('Cần kiểm tra: thiếu giá nhập');

    records.push([
      parseDate_(rawDate),
      String(rawName).trim(),
      rawSupplier || '',
      category,
      slMua  || '',
      quyCach || '',
      unit   || '',
      price  || '',
      unitPrice || '',
      uniqueNotes_(notes),
    ]);
  }
  return records;
}

// ─── Parse SL MUA + QUY CACH ─────────────────────────────────────────────────
function parseSlAndQc_(rawSl, rawKl, itemName, category) {
  const klText  = String(rawKl  || '').trim();
  const slText  = String(rawSl || '').trim();
  const slNum   = parseNumber_(String(rawSl || '').trim());

  if (klText) {
    const parsed = parseWeightText_(klText);
    if (parsed.quantity && parsed.unit) {
      // If SL > 1, quyCach = total / SL (per package)
      const sl = slNum > 1 ? slNum : 1;
      const qcPerPack = parsed.quantity / sl;
      return { slMua: sl, quyCach: qcPerPack, unit: parsed.unit, note: '' };
    }
    // weight text exists but couldn't fully parse
    if (parsed.quantity) {
      const sl = slNum > 1 ? slNum : 1;
      return {
        slMua: sl,
        quyCach: parsed.quantity / sl,
        unit: inferUnit_(itemName, category),
        note: 'Cần kiểm tra: thiếu đơn vị',
      };
    }
  }

  // No weight text — use SL as piece count
  const parsedSlText = parseWeightText_(slText);
  if (parsedSlText.quantity && parsedSlText.unit) {
    if (parsedSlText.unit === 'g' || parsedSlText.unit === 'ml') {
      return { slMua: 1, quyCach: parsedSlText.quantity, unit: parsedSlText.unit, note: '' };
    }
    return { slMua: parsedSlText.quantity, quyCach: '', unit: parsedSlText.unit, note: '' };
  }

  if (slNum) {
    const unit = inferUnit_(itemName, category);
    return { slMua: slNum, quyCach: '', unit, note: unit ? '' : 'Cần kiểm tra: thiếu đơn vị' };
  }

  const unit = inferUnit_(itemName, category);
  return { slMua: '', quyCach: '', unit, note: 'Cần kiểm tra: thiếu số lượng/đơn vị' };
}

// ─── Write table ─────────────────────────────────────────────────────────────
function writeTable_(sheet, records, options) {
  const preserveUi = options && options.preserveUi;
  const totalCols = 19; // A:J + K(sep) + L:U
  const numRows   = Math.max(sheet.getMaxRows(), records.length + 20);
  if (preserveUi) {
    sheet.getRange(2, 1, Math.max(numRows - 1, 1), HEADERS.length)
         .clearContent().clearDataValidations();
  } else {
    sheet.getRange(1, 1, numRows, totalCols)
         .clearContent().clearFormat().clearDataValidations();
  }

  // Headers
  if (!preserveUi) {
    const hRow = sheet.getRange(1, 1, 1, HEADERS.length);
    hRow.setValues([HEADERS])
        .setFontWeight('bold')
        .setFontColor('#FFFFFF')
        .setBackground('#174EA6')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setWrap(false);
    sheet.setRowHeight(1, 36);

    // Header tooltips
    Object.entries(HEADER_NOTES).forEach(([col, note]) => {
      sheet.getRange(1, Number(col)).setNote(note);
    });
  }

  // Data rows
  if (records.length) {
    sheet.getRange(2, 1, records.length, HEADERS.length).setValues(records);
  }

  if (!preserveUi) {
    // Row banding
    try {
      sheet.getBandings().forEach(b => b.remove());
    } catch(e) {}
    const bandRange = sheet.getRange(1, 1, Math.max(records.length + 1, 2), HEADERS.length);
    const banding = bandRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    banding.setHeaderRowColor('#174EA6');
    banding.setFirstRowColor('#FFFFFF');
    banding.setSecondRowColor('#F0F4FF');

    // Freeze row 1
    sheet.setFrozenRows(1);
  }

  // Column formats
  const dataRows = Math.max(records.length, 1);
  if (!preserveUi) {
    sheet.getRange(2, 1, dataRows, 1).setNumberFormat('dd/mm/yyyy');       // A: date
    sheet.getRange(2, 4, dataRows, 1).setNumberFormat('#,##0.##');          // D: SL MUA
    sheet.getRange(2, 5, dataRows, 1).setNumberFormat('#,##0.##');          // E: QUY CACH
    sheet.getRange(2, 7, dataRows, 1).setNumberFormat('#,##0 [$đ-42A]');    // G: GIA NHAP
    sheet.getRange(2, 8, dataRows, 1).setNumberFormat('#,##0.00 [$đ-42A]');  // H: DON GIA / 1 DV
  }

  if (!preserveUi) {
    // DON GIA column — light green bg (auto-calculated)
    sheet.getRange(1, 8, dataRows + 1, 1).setBackground('#E6F4EA');
    sheet.getRange(1, 8).setBackground('#174EA6').setFontColor('#FFFFFF'); // keep header dark
  }

  if (!preserveUi) {
    // Alignment
    sheet.getRange(2, 4, dataRows, 5).setHorizontalAlignment('right');   // D:H numbers right
    sheet.getRange(2, 3, dataRows, 1).setHorizontalAlignment('center');   // C: category center
  }

  if (!preserveUi) {
    // Column widths
    sheet.setColumnWidth(1, 100);   // A: date
    sheet.setColumnWidth(2, 250);   // B: name
    sheet.setColumnWidth(3, 130);   // C: category
    sheet.setColumnWidth(4, 75);    // D: SL MUA
    sheet.setColumnWidth(5, 90);    // E: QUY CACH
    sheet.setColumnWidth(6, 70);    // F: DON VI
    sheet.setColumnWidth(7, 115);   // G: GIA NHAP
    sheet.setColumnWidth(8, 110);   // H: DON GIA
    sheet.setColumnWidth(9, 140);   // I: NHA CUNG CAP
    sheet.setColumnWidth(10, 220);  // J: GHI CHU
    sheet.setColumnWidth(11, 16);   // K: separator (narrow)
  }

  // Dropdowns
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CATEGORIES, true).setAllowInvalid(false).build();
  sheet.getRange(2, 3, Math.max(records.length, 200), 1).setDataValidation(catRule);

  const unitRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(UNITS, true).setAllowInvalid(true).build();
  sheet.getRange(2, 6, Math.max(records.length, 200), 1).setDataValidation(unitRule);

  applyNhapHangNameDropdown_(sheet);

  if (!preserveUi) {
    // Outer border
    sheet.getRange(1, 1, dataRows + 1, HEADERS.length)
         .setBorder(true,true,true,true,false,false,'#174EA6', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  // Conditional formatting
  if (!preserveUi) {
    applyCategoryFormatting_(sheet, Math.max(records.length, 200));
  }
  applyNhapHangNameWarningFormatting_(sheet);
}

function MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + SHEET_NAME);
  return {
    name: applyNhapHangNameDropdown_(sheet),
    structured: applyNhapHangStructuredDropdowns_(sheet),
  };
}

function MOCO_DISABLE_NHAP_HANG_NAME_DROPDOWN() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + SHEET_NAME);
  const rows = Math.max(sheet.getMaxRows() - 1, 300);
  const target = sheet.getRange(2, 2, rows, 1);
  target.clearDataValidations();
  applyNhapHangNameWarningFormatting_(sheet);
  sheet.getRange(1, 2).setNote(
    'TÊN HÀNG HOÁ: đang ở chế độ chỉnh tên tự do. Ô đỏ nghĩa là tên chưa có trong danh mục chuẩn. Sau khi chuẩn hóa xong, chạy MOCO > 1. Thêm hàng mới vào danh mục nếu có tên mới thật, rồi chạy MOCO > 3. Cập nhật dropdown tên hàng.'
  );
  return {
    applied: true,
    mode: 'free_text_with_red_warning',
    targetRange: 'B2:B' + (rows + 1),
  };
}

function MOCO_DEBUG_NHAP_HANG_RECOVERY_() {
  const ss = getMocoSpreadsheet_();
  return ss.getSheets()
    .map(sheet => {
      const headers = sheet.getRange(1, 1, 1, Math.min(Math.max(sheet.getLastColumn(), 10), 12))
        .getDisplayValues()[0];
      const indexes = getGenericNhapHangIndexes_(sheet);
      let priceCount = 0;
      let sample = [];
      if (sheet.getLastRow() >= 2 && indexes.price >= 0) {
        const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 10)).getValues();
        values.forEach(row => {
          const price = parsePrice_(row[indexes.price]);
          if (price) {
            priceCount += 1;
            if (sample.length < 5) sample.push({
              date: row[indexes.date],
              name: row[indexes.name],
              supplier: indexes.supplier >= 0 ? row[indexes.supplier] : '',
              price,
            });
          }
        });
      }
      return {
        sheet: sheet.getName(),
        rows: Math.max(sheet.getLastRow() - 1, 0),
        headers,
        priceColumn: indexes.price >= 0 ? indexes.price + 1 : '',
        priceCount,
        sample,
      };
    })
    .filter(info => info.sheet === SHEET_NAME || info.sheet.indexOf('BACKUP') === 0 || info.priceCount > 0)
    .sort((a, b) => b.priceCount - a.priceCount || a.sheet.localeCompare(b.sheet));
}

function MOCO_RESTORE_NHAP_HANG_PRICES_(sourceSheetName) {
  const ss = getMocoSpreadsheet_();
  const target = ss.getSheetByName(SHEET_NAME);
  if (!target) throw new Error('Không tìm thấy sheet: ' + SHEET_NAME);

  const sources = sourceSheetName
    ? [ss.getSheetByName(sourceSheetName)].filter(Boolean)
    : ss.getSheets()
      .filter(sheet => sheet.getName() !== SHEET_NAME)
      .map(sheet => {
        const indexes = getGenericNhapHangIndexes_(sheet);
        return { sheet, indexes, score: countGenericPriceRows_(sheet, indexes) };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.sheet);
  if (!sources.length) {
    return { restored: 0, reason: 'Không tìm thấy sheet nguồn có cột giá để khôi phục.' };
  }

  const source = sources[0];
  const sourceIndex = buildPriceRestoreIndex_(source);
  const sourceIdx = getGenericNhapHangIndexes_(source);
  const sourceRows = source.getLastRow() >= 2
    ? source.getRange(2, 1, source.getLastRow() - 1, Math.max(source.getLastColumn(), 10)).getValues()
    : [];
  const targetIdx = getGenericNhapHangIndexes_(target);
  const lastRow = target.getLastRow();
  if (lastRow < 2) return { restored: 0, sourceSheet: source.getName() };
  const targetWidth = Math.max(target.getLastColumn(), 10);
  const rows = target.getRange(2, 1, lastRow - 1, targetWidth).getValues();
  const priceRange = target.getRange(2, targetIdx.price + 1, rows.length, 1);
  const currentPrices = priceRange.getValues();

  let restored = 0;
  rows.forEach((row, i) => {
    const current = parsePrice_(currentPrices[i][0]);
    if (current) return;
    const key = restoreKey_(row, targetIdx, true);
    const looseKey = restoreKey_(row, targetIdx, false);
    const match = sourceIndex[key] || sourceIndex[looseKey];
    const rowOrderPrice = sourceRows[i] ? parsePrice_(sourceRows[i][sourceIdx.price]) : '';
    const restoredPrice = match ? match.price : rowOrderPrice;
    if (!restoredPrice) return;
    currentPrices[i][0] = restoredPrice;
    restored += 1;
  });

  if (restored) {
    priceRange.setValues(currentPrices);
    applyUnitPriceFormulas_(target, lastRow);
    SpreadsheetApp.flush();
  }

  return {
    restored,
    sourceSheet: source.getName(),
    targetPriceColumn: targetIdx.price + 1,
  };
}

function buildPriceRestoreIndex_(sheet) {
  const idx = getGenericNhapHangIndexes_(sheet);
  const out = {};
  if (sheet.getLastRow() < 2 || idx.price < 0) return out;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 10)).getValues();
  values.forEach(row => {
    const price = parsePrice_(row[idx.price]);
    if (!price) return;
    const fullKey = restoreKey_(row, idx, true);
    const looseKey = restoreKey_(row, idx, false);
    if (fullKey && !out[fullKey]) out[fullKey] = { price };
    if (looseKey && !out[looseKey]) out[looseKey] = { price };
  });
  return out;
}

function countGenericPriceRows_(sheet, idx) {
  if (sheet.getLastRow() < 2 || idx.price < 0 || idx.name < 0) return 0;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 10)).getValues();
  return values.filter(row => row[idx.name] && parsePrice_(row[idx.price])).length;
}

function restoreKey_(row, idx, includeSupplier) {
  const parts = [
    dateKey_(row[idx.date]),
    normText_(row[idx.name]),
    Number(row[idx.qty]) || '',
    Number(row[idx.pack]) || '',
    normText_(row[idx.unit]),
  ];
  if (includeSupplier && idx.supplier >= 0) parts.splice(2, 0, normText_(row[idx.supplier]));
  return parts.join('|');
}

function getGenericNhapHangIndexes_(sheet) {
  const width = Math.min(Math.max(sheet.getLastColumn(), 10), 12);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0].map(normHeader_);
  const hasSupplier = headers.some(h => h === 'ncc' || h === 'brand' || h.indexOf('nha cung cap') >= 0);
  return {
    date: findHeaderIndex_(headers, h => h.indexOf('nhap') >= 0 || h.indexOf('ngay') >= 0, 0),
    name: findHeaderIndex_(headers, h => h.indexOf('ten hang') >= 0 || h.indexOf('ten nvl') >= 0, 1),
    supplier: findHeaderIndex_(headers, h => h === 'ncc' || h === 'brand' || h.indexOf('nha cung cap') >= 0, hasSupplier ? 2 : -1),
    qty: findHeaderIndex_(headers, h => h === 'sl' || h.indexOf('sl mua') >= 0 || h.indexOf('so luong') >= 0, hasSupplier ? 4 : 3),
    pack: findHeaderIndex_(headers, h => h.indexOf('quy cach') >= 0 || h.indexOf('khoi luong') >= 0, hasSupplier ? 5 : 4),
    unit: findHeaderIndex_(headers, h => h === 'don vi', hasSupplier ? 6 : 5),
    price: findHeaderIndex_(headers, h => h.indexOf('gia nhap') >= 0, hasSupplier ? 7 : 6),
  };
}

function dateKey_(value) {
  if (value instanceof Date && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value || '').trim();
}

function applyNhapHangNameDropdown_(sheet) {
  const ss = sheet.getParent();
  const master = ss.getSheetByName('Master NVL');
  const rows = Math.max(sheet.getMaxRows() - 1, 300);
  const target = sheet.getRange(2, 2, rows, 1);

  sheet.getRange(1, 2).setNote(HEADER_NOTES[2]);
  target.clearDataValidations();

  if (!master || master.getLastRow() < 2) {
    applyNhapHangNameWarningFormatting_(sheet);
    return {
      applied: false,
      reason: 'Chưa có Master NVL để làm danh mục tên chuẩn.',
    };
  }

  const source = ss.getRangeByName('LIST_MASTER_NVL') || master.getRange(2, 2, master.getLastRow() - 1, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(source, true)
    .setAllowInvalid(true)
    .setHelpText('Nên chọn tên chuẩn từ dropdown. Nếu là hàng mới, có thể gõ tạm rồi chạy MOCO > Thêm hàng mới vào danh mục.')
    .build();
  target.setDataValidation(rule);
  applyNhapHangNameWarningFormatting_(sheet);
  return {
    applied: true,
    sourceSheet: source.getSheet().getName(),
    sourceRange: source.getA1Notation(),
    targetRange: 'B2:B' + (rows + 1),
    mode: 'dropdown_with_red_warning',
  };
}

function applyNhapHangStructuredDropdowns_(sheet) {
  const ss = sheet.getParent();
  const rows = Math.max(sheet.getMaxRows() - 1, 300);
  const idx = getNhapHangFormulaIndexes_(sheet);
  const extra = getMocoNhapHangExtraIndexes_(sheet);
  const applied = [];

  if (idx.supplierCol >= 0) {
    applied.push(applyNhapHangNamedRangeDropdown_(sheet, idx.supplierCol + 1, rows, 'LIST_SUPPLIERS', 'Chọn NCC/brand. Không ghép NCC vào tên hàng hoá.'));
  }
  if (extra.categoryCol >= 0) {
    applied.push(applyNhapHangNamedRangeDropdown_(sheet, extra.categoryCol + 1, rows, 'LIST_INGREDIENT_CATEGORIES', 'Chọn loại hàng để Master NVL và cost phân loại đúng.'));
  }
  if (idx.unitCol >= 0) {
    applied.push(applyNhapHangNamedRangeDropdown_(sheet, idx.unitCol + 1, rows, 'LIST_UNITS', 'Chọn đơn vị chuẩn. Với chai/hộp có quy cách ml/g, nhập ĐƠN VỊ là ml/g và QUY CÁCH tương ứng.'));
  }

  return {
    applied: applied.filter(Boolean),
    source: ss.getSheetByName('DATA VALIDATION') ? 'DATA VALIDATION' : '',
  };
}

function applyNhapHangNamedRangeDropdown_(sheet, col, rows, namedRange, helpText) {
  const ss = sheet.getParent();
  const source = ss.getRangeByName(namedRange);
  if (!source) return null;
  const target = sheet.getRange(2, col, rows, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(source, true)
    .setAllowInvalid(true)
    .setHelpText(helpText)
    .build();
  target.clearDataValidations().setDataValidation(rule);
  return {
    column: col,
    namedRange,
    sourceRange: source.getSheet().getName() + '!' + source.getA1Notation(),
  };
}

function applyNhapHangNameWarningFormatting_(sheet) {
  const range = sheet.getRange(2, 2, Math.max(sheet.getMaxRows() - 1, 300), 1);
  const formula = '=AND($B2<>"",COUNTIF(\'Master NVL\'!$B:$B,$B2)=0)';
  const rules = sheet.getConditionalFormatRules()
    .filter(rule => !rule.getRanges().some(r => r.getColumn() === 2 && r.getNumColumns() === 1));
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(formula)
      .setBackground('#FCE8E6')
      .setFontColor('#B3261E')
      .setRanges([range])
      .build()
  );
  sheet.setConditionalFormatRules(rules);
}

// ─── Category conditional formatting ─────────────────────────────────────────
function applyCategoryFormatting_(sheet, numRows) {
  const rules = [];
  const extra = getMocoNhapHangExtraIndexes_(sheet);
  const catCol = sheet.getRange(2, extra.categoryCol + 1, numRows, 1);

  // Category chip colors
  Object.entries(CAT_COLORS).forEach(([cat, col]) => {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(cat)
        .setBackground(col.bg)
        .setFontColor(col.fg)
        .setRanges([catCol])
        .build()
    );
  });

  // "Can kiem tra" rows highlight (amber)
  const dataRange = sheet.getRange(2, 1, numRows, 10);
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISNUMBER(SEARCH("Cần kiểm tra",$J2))')
      .setBackground('#FFF3CD')
      .setRanges([dataRange])
      .build()
  );

  sheet.setConditionalFormatRules(rules);
}

// ─── Price history UI ─────────────────────────────────────────────────────────
function setupHistoryUi_(sheet, records, options) {
  const preserveUi = options && options.preserveUi;
  if (preserveUi) {
    setNhapHangHistoryTitle_(sheet);
    const lastDataRow = Math.max(records.length + 1, 2);
    const itemRange = sheet.getRange(2, 2, lastDataRow - 1, 1);
    const itemRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(itemRange, true).setAllowInvalid(false).build();
    sheet.getRange('M2').setDataValidation(itemRule);

    const currentItem = String(sheet.getRange('M2').getValue() || '').trim();
    const defaultItem = chooseDefault_(records);
    if (!currentItem && defaultItem) sheet.getRange('M2').setValue(defaultItem);
    return;
  }

  setNhapHangHistoryTitle_(sheet);

  // Label + selector
  sheet.getRange('L2').setValue('Chọn item:').setFontWeight('bold').setHorizontalAlignment('right');
  sheet.getRange('M2').setBackground('#E6F4EA').setFontWeight('bold');

  // Column headers row 4
  sheet.getRange('L4:U4').setValues([[
    'Ngày nhập','SL Mua','Quy Cách','Đơn vị',
    'Giá nhập','Đơn giá / 1 ĐV','Nhà cung cấp',
    'Chênh lệch','%','Trạng thái',
  ]]).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#3C4043')
     .setHorizontalAlignment('center');

  // Column widths for history
  [12,13,14,15,16,17,18,19,20,21].forEach((col, i) => {
    const widths = [100,65,75,65,110,110,125,110,90,110];
    sheet.setColumnWidth(col, widths[i]);
  });

  // Row 3 label
  sheet.getRange('L3').setValue('(chọn tên item để xem lịch sử biến động giá)')
       .setFontStyle('italic').setFontColor('#888888');
  sheet.getRange('L3:U3').merge();

  // Dropdown for item selector at M2
  const lastDataRow = Math.max(records.length + 1, 2);
  const itemRange = sheet.getRange(2, 2, lastDataRow - 1, 1);
  const itemRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(itemRange, true).setAllowInvalid(false).build();
  sheet.getRange('M2').setDataValidation(itemRule);

  const defaultItem = chooseDefault_(records);
  if (defaultItem) sheet.getRange('M2').setValue(defaultItem);
}

// ─── Backup ───────────────────────────────────────────────────────────────────
function createBackup_(ss, sheet) {
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const name = 'BACKUP_' + stamp;
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function MOCO_APPEND_VINEGAR_PURCHASE() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + SHEET_NAME);

  const marker = 'MOCO_DAM_2026-05-13';
  const oldMarker = 'MOCO_VINEGAR_2026-05-13';
  const targetRow = 119;
  const lastRow = Math.max(sheet.getLastRow(), targetRow);
  const width = Math.max(sheet.getLastColumn(), 10);
  const idx = getNhapHangFormulaIndexes_(sheet);
  const extra = getMocoNhapHangExtraIndexes_(sheet);
  const clearedRows = [];

  if (lastRow >= 2) {
    const values = sheet.getRange(2, 1, lastRow - 1, Math.min(width, 10)).getDisplayValues();
    values.forEach((row, index) => {
      const rowNumber = index + 2;
      if (rowNumber === targetRow) return;
      const nameKey = normText_(row[idx.nameCol]);
      const note = extra.noteCol >= 0 ? String(row[extra.noteCol] || '') : '';
      const isDamRow = nameKey === 'giam'
        || nameKey === 'dam'
        || nameKey.indexOf('giam gao') >= 0
        || nameKey.indexOf('dam gao') >= 0
        || note.indexOf(marker) >= 0
        || note.indexOf(oldMarker) >= 0;
      if (!isDamRow) return;
      sheet.getRange(rowNumber, 1, 1, Math.min(width, 10)).clearContent().clearDataValidations();
      clearedRows.push(rowNumber);
    });
  }

  writeMocoVinegarPurchaseRow_(sheet, targetRow, width, idx, extra, marker);
  applyUnitPriceFormulas_(sheet, lastRow);
  const clearedEmptyRows = clearMocoEmptyNhapHangInputRows_(sheet, targetRow + 1, lastRow, width, idx, extra);
  applyNhapHangStructuredDropdowns_(sheet);
  SpreadsheetApp.flush();

  return {
    appended: true,
    updated: true,
    row: targetRow,
    item: 'dấm',
    supplier: 'Trung Thành',
    qty: 1,
    pack: 500,
    unit: 'ml',
    price: 21000,
    clearedRows,
    clearedEmptyRows,
    marker,
  };
}

function writeMocoVinegarPurchaseRow_(sheet, rowNumber, width, idx, extra, marker) {
  const row = new Array(width).fill('');
  row[idx.dateCol] = new Date();
  row[idx.nameCol] = 'dấm';
  if (idx.supplierCol >= 0) row[idx.supplierCol] = 'Trung Thành';
  if (extra.categoryCol >= 0) row[extra.categoryCol] = 'Nguyên liệu khô';
  row[idx.qtyCol] = 1;
  row[idx.packCol] = 500;
  row[idx.unitCol] = 'ml';
  row[idx.priceCol] = 21000;
  if (extra.noteCol >= 0) {
    row[extra.noteCol] = marker + ' - bổ sung 1 chai dấm; NCC tách riêng Trung Thành; quy cách tạm tính 500ml/chai';
  }

  sheet.getRange(rowNumber, 1, 1, Math.min(width, 10)).clearDataValidations();
  sheet.getRange(rowNumber, 1, 1, width).setValues([row]);
  if (rowNumber > 2) {
    const formatWidth = Math.min(width, 10);
    sheet.getRange(rowNumber - 1, 1, 1, formatWidth)
      .copyTo(sheet.getRange(rowNumber, 1, 1, formatWidth), { formatOnly: true });
  }
}

function clearMocoEmptyNhapHangInputRows_(sheet, startRow, endRow, width, idx, extra) {
  if (endRow < startRow) return [];
  const clearWidth = Math.min(width, 10);
  const rows = sheet.getRange(startRow, 1, endRow - startRow + 1, clearWidth).getDisplayValues();
  const cleared = [];
  rows.forEach((row, index) => {
    const hasInput = [
      idx.dateCol,
      idx.nameCol,
      idx.supplierCol,
      extra.categoryCol,
      idx.qtyCol,
      idx.packCol,
      idx.unitCol,
      idx.priceCol,
      extra.noteCol,
    ].some(col => col >= 0 && String(row[col] || '').trim());
    if (hasInput) return;
    const rowNumber = startRow + index;
    sheet.getRange(rowNumber, 1, 1, clearWidth).clearContent().clearDataValidations();
    cleared.push(rowNumber);
  });
  return cleared;
}

function MOCO_QUICK_FIX_COST_LINKS() {
  const ss = getMocoSpreadsheet_();
  const renameStats = replaceMocoTextInSheets_(ss, [
    'NHẬP HÀNG',
    'Master NVL',
    'CÔNG THỨC',
    'COST REVIEW',
    'COST CALC',
    'COST ACTION',
    'BOM MAP',
    'RECIPE MAP',
    'DATA VALIDATION',
  ], [
    { from: 'Giấm gạo Trung Thành', to: 'dấm', matchEntireCell: true },
    { from: 'giấm gạo Trung Thành', to: 'dấm', matchEntireCell: true },
    { from: 'Dấm gạo Trung Thành', to: 'dấm', matchEntireCell: true },
    { from: 'dấm gạo Trung Thành', to: 'dấm', matchEntireCell: true },
    { from: 'Giấm', to: 'Dấm', matchEntireCell: false },
    { from: 'giấm', to: 'dấm', matchEntireCell: false },
  ]);

  const validationBefore = typeof MOCO_REFRESH_DATA_VALIDATION_LISTS === 'function'
    ? MOCO_REFRESH_DATA_VALIDATION_LISTS()
    : null;
  const vinegar = MOCO_APPEND_VINEGAR_PURCHASE();
  const dropdowns = MOCO_APPLY_NHAP_HANG_NAME_DROPDOWN();
  const masterNames = typeof MOCO_ADD_NEW_NHAP_HANG_NAMES_TO_MASTER === 'function'
    ? MOCO_ADD_NEW_NHAP_HANG_NAMES_TO_MASTER()
    : null;
  const masterRefresh = typeof MOCO_REFRESH_MASTER_NVL === 'function'
    ? MOCO_REFRESH_MASTER_NVL()
    : null;
  const flags = typeof MOCO_NORMALIZE_MASTER_COST_FLAGS === 'function'
    ? MOCO_NORMALIZE_MASTER_COST_FLAGS()
    : null;
  const costReview = typeof MOCO_GENERATE_COST_REVIEW === 'function'
    ? MOCO_GENERATE_COST_REVIEW()
    : null;
  const validationLists = typeof MOCO_REFRESH_DATA_VALIDATION_LISTS === 'function'
    ? MOCO_REFRESH_DATA_VALIDATION_LISTS()
    : null;
  const founderAction = typeof MOCO_REFRESH_FOUNDER_ACTION === 'function'
    ? MOCO_REFRESH_FOUNDER_ACTION()
    : null;

  return {
    vinegar,
    renameStats,
    validationBefore,
    dropdowns,
    masterNames,
    masterRefresh,
    flags,
    costReview,
    validationLists,
    founderAction,
  };
}

function replaceMocoTextInSheets_(ss, sheetNames, replacements) {
  const stats = [];
  sheetNames.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    let changed = 0;
    replacements.forEach(rep => {
      const finder = sheet.createTextFinder(rep.from).matchCase(true);
      if (rep.matchEntireCell) finder.matchEntireCell(true);
      changed += finder.replaceAllWith(rep.to);
    });
    if (changed) stats.push({ sheet: name, changed });
  });
  return stats;
}

function getMocoNhapHangExtraIndexes_(sheet) {
  const headers = sheet.getRange(1, 1, 1, Math.min(Math.max(sheet.getLastColumn(), 10), 12))
    .getDisplayValues()[0]
    .map(normHeader_);
  return {
    categoryCol: findHeaderIndex_(headers, h => h.indexOf('loai hang') >= 0, 3),
    noteCol: findHeaderIndex_(headers, h => h.indexOf('ghi chu') >= 0, 9),
  };
}

function replaceMocoExactTextInSheets_(ss, sheetNames, replacements) {
  return replaceMocoTextInSheets_(ss, sheetNames, replacements.map(rep => Object.assign({}, rep, { matchEntireCell: true })));
}
function MOCO_COST_REVIEW_SNAPSHOT() {
  const ss = getMocoSpreadsheet_();
  const sheetName = typeof MOCO_COST_REVIEW_SHEET !== 'undefined' ? MOCO_COST_REVIEW_SHEET : 'COST REVIEW';
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 5) {
    return { sheet: sheetName, rows: 0, statusCounts: {}, issues: [] };
  }

  const values = sheet.getRange(5, 1, sheet.getLastRow() - 4, 14).getDisplayValues();
  const statusCounts = {};
  const issues = [];
  values.forEach((row, index) => {
    if (!String(row[2] || '').trim()) return;
    const status = String(row[10] || '').trim();
    statusCounts[status || '(blank)'] = (statusCounts[status || '(blank)'] || 0) + 1;
    issues.push({
      row: index + 5,
      priority: row[0],
      action: row[1],
      ingredient: row[2],
      cakes: row[3],
      sampleQty: row[4],
      suggestion: row[5],
      reason: row[6],
      chosenNvl: row[7],
      tempPrice: row[8],
      note: row[9],
      status,
      currentMatch: row[11],
      masterUnit: row[12],
      masterPrice: row[13],
    });
  });
  return {
    sheet: sheetName,
    rows: issues.length,
    statusCounts,
    issues: issues.slice(0, 80),
  };
}

// ─── Web App helpers ─────────────────────────────────────────────────────────
function MOCO_DEBUG_ORDER_IMPORT_AUDIT(query, sourceSpreadsheetId) {
  const target = getMocoSpreadsheet_();
  const targetOrderSheet = target.getSheetByName('ĐƠN HÀNG');
  const sourceQuery = String(query || 'Bản sao của Đơn đặt hàng').trim();
  const candidates = sourceSpreadsheetId ? [] : searchMocoOrderSourceSpreadsheets_(sourceQuery);
  const sourceId = sourceSpreadsheetId || (candidates[0] && candidates[0].id) || '';
  const source = sourceId ? SpreadsheetApp.openById(sourceId) : null;

  return {
    query: sourceQuery,
    target: summarizeMocoOrderSheet_(target, targetOrderSheet),
    sourceCandidates: candidates,
    selectedSource: source ? summarizeMocoSourceSpreadsheet_(source) : null,
    importPolicy: {
      mode: 'read_only_audit',
      contentRule: 'Không tự sửa câu chữ/nội dung khác biệt; chỉ đề xuất mapping và chờ duyệt.',
      namingRule: 'Tên món/SKU/nguyên liệu giữ theo danh mục chuẩn hiện có; sai khác phải đưa vào danh sách cần duyệt.',
    },
  };
}

function MOCO_DEBUG_CURRENT_ORDER_SHEET() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('ĐƠN HÀNG');
  return {
    target: summarizeMocoOrderSheet_(ss, sheet),
    importPolicy: {
      mode: 'target_only_read',
      contentRule: 'Không tự sửa câu chữ/nội dung khác biệt; chỉ đề xuất mapping và chờ duyệt.',
    },
  };
}

function MOCO_APPLY_ORDER_AUDIT_NOTES() {
  const ss = getMocoSpreadsheet_();
  const orderSheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!orderSheet) throw new Error('Không tìm thấy sheet ĐƠN HÀNG');
  const auditSheetName = 'ORDER IMPORT REVIEW';
  let auditSheet = ss.getSheetByName(auditSheetName);
  if (!auditSheet) auditSheet = ss.insertSheet(auditSheetName);
  auditSheet.clear().clearFormats().clearNotes().clearConditionalFormatRules();

  const title = 'ORDER IMPORT REVIEW - CHỜ DUYỆT MAPPING TRƯỚC KHI GHI VÀO ĐƠN HÀNG';
  const rows = [
    [title, '', '', '', '', ''],
    ['Trạng thái', 'Chưa nhập dữ liệu vì tài khoản hiện tại chưa có quyền đọc tệp nguồn.', '', '', '', ''],
    ['Nguyên tắc', 'Không tự sửa câu chữ hoặc tên món trong dữ liệu nguồn. Chỉ ghi sang ĐƠN HÀNG sau khi người vận hành duyệt các sai khác.', '', '', '', ''],
    ['Quy tắc đặt tên', 'Tên món phải khớp MENU & GIÁ/SKU. Tên chưa thống nhất chỉ được chuẩn hóa sau khi người vận hành duyệt.', '', '', '', ''],
    ['Rule tiền/ship', 'Tách doanh thu bánh, phí ship khách trả, phí ship thực tế, shop bù ship. Không gộp ship vào giá bánh nếu chưa có rule rõ.', '', '', '', ''],
    ['Vấn đề hiện tại', 'ĐƠN HÀNG đang trộn bảng đơn chính A:M, summary phụ O:Q, nhiều merged cells và cột G vừa là giờ giao vừa là trạng thái.', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Hạng mục', 'Hiện trạng/rủi ro', 'Đề xuất xử lý', 'Có tự sửa không?', 'Cần duyệt?', 'Ghi chú'],
    ['Nguồn đơn hàng', 'File nguồn chưa đọc được do quyền Google', 'Dùng URL/ID nguồn hoặc owner authorize Drive/Sheets scope rồi chạy import dry-run', 'Không', 'Có', 'Chỉ đọc trước, chưa ghi'],
    ['Cấu trúc dòng', 'Một đơn có nhiều dòng sản phẩm và một số ô được gộp', 'Tách thông tin chung của đơn và từng sản phẩm thành các dòng rõ ràng', 'Không', 'Có', 'Không thay đổi dữ liệu nguồn'],
    ['Tên món', 'Nhiều biến thể tên món', 'Map qua SKU/menu chuẩn, giữ raw name ở cột riêng', 'Không', 'Có', 'Không tự đổi câu chữ'],
    ['Trạng thái', 'Cột G lẫn done/Done/Chưa tt/giờ giao', 'Tách Payment status, Fulfillment status, Delivery time', 'Không', 'Có', 'Giảm lỗi dashboard/thu chi'],
    ['Giá/CK', 'Tiền là text; CK lẫn %, k', 'Tách discount type/value và tính tiền bằng công thức chuẩn', 'Không', 'Có', 'Không sửa số gốc'],
    ['Ship', 'Chưa có schema tối ưu ship', 'Thêm ship collected, actual ship, shop subsidy, carrier, district, delivery slot', 'Không', 'Có', 'Tính lãi sau ship'],
  ];

  auditSheet.getRange(1, 1, rows.length, 6).setValues(rows);
  auditSheet.getRange(1, 1, 1, 6).merge()
    .setFontWeight('bold')
    .setFontSize(13)
    .setBackground('#B31412')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setNote('Tiêu đề cố ý ghi rõ trạng thái CHỜ DUYỆT để tránh nhầm là dữ liệu đã được nhập/sửa tự động.');
  auditSheet.getRange(2, 1, 5, 1).setFontWeight('bold').setBackground('#FCE8E6');
  auditSheet.getRange(8, 1, 1, 6).setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF');
  auditSheet.getRange(1, 1, rows.length, 6).setWrap(true).setVerticalAlignment('middle');
  [180, 360, 360, 120, 130, 280].forEach((width, idx) => auditSheet.setColumnWidth(idx + 1, width));
  auditSheet.setFrozenRows(8);

  orderSheet.getRange('A1').setNote('ĐƠN HÀNG hiện chứa dữ liệu gốc. Không tự ghi đè từ nguồn nếu chưa qua bước kiểm tra.');
  orderSheet.getRange('G1').setNote('Cột này đang lẫn giờ giao và trạng thái thanh toán/giao hàng. Cần tách status trước khi tối ưu dashboard/thu chi.');
  orderSheet.getRange('H1').setNote('Tên bánh phải đối chiếu với MENU & GIÁ/SKU. Không tự đổi câu chữ nếu chưa được người vận hành duyệt.');
  orderSheet.getRange('J1:M1').setNote('Giá/chiết khấu đang có text, khoảng trắng, ký hiệu đ, %, k. Khi import cần giữ raw value và tính bằng cột chuẩn riêng.');
  orderSheet.getRange('O1').setNote('Khối O:Q là summary phụ, không nên trộn với bảng đơn raw khi import/sync.');

  return {
    applied: true,
    auditSheet: auditSheetName,
    title,
    notesAppliedTo: ['ĐƠN HÀNG!A1', 'ĐƠN HÀNG!G1', 'ĐƠN HÀNG!H1', 'ĐƠN HÀNG!J1:M1', 'ĐƠN HÀNG!O1'],
    sourceImportStatus: 'blocked_until_source_url_or_authorization',
  };
}

function MOCO_SETUP_ORDER_COPY_BUFFER() {
  const ss = getMocoSpreadsheet_();
  const bufferName = 'ORDER RAW - DÁN FOUNDER';
  let sheet = ss.getSheetByName(bufferName);
  if (!sheet) sheet = ss.insertSheet(bufferName);
  sheet.clear().clearFormats().clearNotes().clearConditionalFormatRules();

  const title = 'ORDER RAW - DÁN DATA FOUNDER VÀO ĐÂY, CHƯA TỰ ĐỔ VÀO ĐƠN HÀNG';
  const headers = [
    'RAW STT',
    'RAW tên KH',
    'RAW địa chỉ',
    'RAW SĐT',
    'RAW ngày đặt',
    'RAW ngày giao',
    'RAW giờ/trạng thái',
    'RAW tên bánh',
    'RAW SL',
    'RAW giá bán',
    'RAW thành tiền',
    'RAW chiết khấu',
    'RAW giá sau CK',
    'RAW phí ship/ghi chú ship',
    'RAW ghi chú khác',
  ];
  const guideRows = [
    [title, '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['CÁCH DÙNG', 'Sao chép dữ liệu nguồn và dán từ dòng 6 trở xuống. Giữ nguyên câu chữ ban đầu; không cần tự sửa tên bánh, giá hoặc phí giao hàng tại đây.', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['NGUYÊN TẮC', 'Sheet này là vùng raw/staging. Hệ thống chỉ đọc để lập ORDER IMPORT REVIEW; chưa tự ghi sang ĐƠN HÀNG nếu chưa có duyệt mapping.', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['CẢNH BÁO', 'Tên món khác danh mục, cách ghi chiết khấu hoặc phí giao hàng chưa thống nhất sẽ được đưa vào bước kiểm tra trước khi chuẩn hóa.', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    headers,
  ];
  sheet.getRange(1, 1, guideRows.length, headers.length).setValues(guideRows);
  sheet.getRange(1, 1, 1, headers.length).merge()
    .setFontWeight('bold')
    .setFontSize(13)
    .setBackground('#B31412')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setNote('Tiêu đề khóa trạng thái: đây là vùng dán raw, không phải sheet vận hành chính.');
  sheet.getRange(2, 1, 3, 1).setFontWeight('bold').setBackground('#FCE8E6');
  sheet.getRange(5, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1F4E79')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setWrap(true);
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 100), headers.length)
    .setWrap(true)
    .setVerticalAlignment('middle');
  [80, 180, 260, 130, 110, 110, 160, 220, 70, 120, 130, 120, 130, 190, 260]
    .forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.setFrozenRows(5);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['raw - chưa review', 'đã đưa vào review', 'đã nhập sang ĐƠN HÀNG', 'bỏ qua'], true)
    .setAllowInvalid(true)
    .build();
  if (sheet.getMaxColumns() < 16) sheet.insertColumnsAfter(sheet.getMaxColumns(), 16 - sheet.getMaxColumns());
  sheet.getRange(5, 16).setValue('TRẠNG THÁI REVIEW')
    .setFontWeight('bold')
    .setBackground('#1F4E79')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setNote('Cột trạng thái nội bộ cho quá trình import. Không sửa dữ liệu raw.');
  sheet.getRange(6, 16, Math.max(sheet.getMaxRows() - 5, 1), 1).setDataValidation(statusRule);
  sheet.setColumnWidth(16, 170);

  const auditResult = MOCO_APPLY_ORDER_AUDIT_NOTES();
  return {
    applied: true,
    bufferSheet: bufferName,
    title,
    pasteStartCell: bufferName + '!A6',
    auditSheet: auditResult.auditSheet,
    nextAction: 'Sau khi dán dữ liệu nguồn từ dòng 6, chạy bước kiểm tra và đối chiếu trong cùng tệp.',
  };
}

function MOCO_DELETE_OBSOLETE_NAME_REVIEW_SHEETS() {
  const ss = getMocoSpreadsheet_();
  const names = ['REVIEW TÊN HÀNG', 'REVIEW TÊN HÀNG - AUDIT'];
  const deleted = [];
  const notFound = [];
  names.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      notFound.push(name);
      return;
    }
    ss.deleteSheet(sheet);
    deleted.push(name);
  });
  return {
    deleted,
    notFound,
    reason: 'Đã thay bằng Master NVL, dropdown chuẩn và ORDER IMPORT REVIEW cho luồng đơn hàng.',
    canRecreateWith: 'MOCO_CREATE_NHAP_MASTER_NAME_REVIEW / MOCO_AUDIT_NAME_REVIEW_APPLY nếu cần debug lại tên hàng.',
  };
}

function MOCO_DELETE_ORDER_STAGING_SHEETS() {
  const ss = getMocoSpreadsheet_();
  const names = ['ORDER RAW - DÁN FOUNDER', 'ORDER IMPORT REVIEW'];
  const deleted = [];
  const notFound = [];
  names.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      notFound.push(name);
      return;
    }
    ss.deleteSheet(sheet);
    deleted.push(name);
  });
  return {
    deleted,
    notFound,
    reason: 'Không dùng vùng dữ liệu tạm riêng; cập nhật trực tiếp từ trang nguồn sang ĐƠN HÀNG theo quy trình đã thống nhất.',
  };
}

const MOCO_ORDER_STANDARD_HEADERS = [
  'Mã đơn',
  'Ngày đặt',
  'Ngày giao',
  'Giờ giao',
  'Tên KH',
  'SĐT',
  'Địa chỉ',
  'Tên bánh',
  'SKU/Menu',
  'SL',
  'Đơn giá',
  'Thành tiền',
  'Chiết khấu',
  'Doanh thu sau CK',
  'TT sản xuất',
  'TT giao hàng',
  'TT thanh toán',
  'Ghi chú',
  'Nguồn khách',
];

const MOCO_ORDER_FOUNDER_HEADERS = [
  'Mã đơn',
  'Nguồn khách',
  'Ngày đặt',
  'Ngày giao',
  'Giờ giao',
  'Tên KH',
  'SĐT',
  'Địa chỉ',
  'Tóm tắt món (tự động)',
  'Tổng SL',
  'Tổng tiền món',
  'Khuyến mại',
  'Ship',
  'Bù ship',
  'Doanh thu sau CK',
  'TT sản xuất',
  'TT giao hàng',
  'TT thanh toán',
  'Ghi chú',
];

const MOCO_ORDER_DETAIL_SHEET = 'ĐƠN HÀNG - CHI TIẾT';
const MOCO_ORDER_ITEM_SHEET = 'ĐƠN HÀNG - MÓN';

function MOCO_SHOW_ORDER_FORM() {
  const html = HtmlService.createHtmlOutputFromFile('MOCO_Order_Form')
    .setTitle('Nhập đơn mới')
    .setWidth(860)
    .setHeight(720);
  SpreadsheetApp.getUi().showModelessDialog(html, 'Nhập đơn mới');
}

function MOCO_GET_ORDER_FORM_DATA() {
  const ss = getMocoSpreadsheet_();
  const menuMap = buildMocoOrderMenuMap_(ss);
  const menu = (menuMap.rows || [])
    .filter(row => row.onlineName)
    .map(row => ({
      name: row.onlineName,
      sku: row.sku || '',
      price: parseMocoOrderAmount_(row.price),
      spec: row.spec || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return {
    menu,
    nextOrderId: nextMocoOrderId_(ss),
    today: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    sourceOptions: ['IG', 'Threads', 'Bạn', 'Facebook', 'Khách cũ', 'Khác'],
    productionStatuses: ['Chưa làm', 'Đang làm', 'Xong', 'Hủy'],
    deliveryStatuses: ['Chưa giao', 'Đang giao', 'Đã giao', 'Hủy'],
    paymentStatuses: ['Chưa thanh toán', 'Đã cọc', 'Đã nhận tiền', 'Hoàn tiền/Hủy'],
  };
}

function MOCO_SAVE_ORDER_FROM_FORM(payload) {
  const ss = getMocoSpreadsheet_();
  const orderSheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!orderSheet) throw new Error('Không tìm thấy sheet ĐƠN HÀNG.');
  const itemSheet = ss.getSheetByName(MOCO_ORDER_ITEM_SHEET) || ss.insertSheet(MOCO_ORDER_ITEM_SHEET);
  const menuMap = buildMocoOrderMenuMap_(ss);
  const data = payload || {};
  const orderId = normalizeMocoOrderIdForForm_(data.orderId || nextMocoOrderId_(ss));
  if (!orderId) throw new Error('Thiếu mã đơn.');
  const items = normalizeMocoOrderFormItems_(data.items, menuMap);
  if (!items.length) throw new Error('Đơn phải có ít nhất 1 món.');

  const existingIds = collectMocoFounderOrderIds_(orderSheet);
  if (existingIds[orderId]) throw new Error('Mã đơn #' + orderId + ' đã tồn tại. Hãy tải lại form để lấy mã mới.');

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const itemTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountText = String(data.discount || '').trim();
  const shipText = String(data.ship || '').trim();
  const shipAmount = parseMocoOrderAmount_(shipText);
  const revenueAfterDiscount = Math.max(itemTotal - calcMocoOrderDiscountAmount_(discountText, itemTotal) + shipAmount, 0);
  const summary = items.map(item => mocoFormatCompactQty_(item.qty) + ' x ' + item.name).join('\n');

  const row = [
    orderId,
    String(data.sourceChannel || '').trim(),
    formatMocoOrderDateForDisplay_(data.orderDate || ''),
    formatMocoOrderDateForDisplay_(data.deliveryDate || ''),
    String(data.deliveryTime || '').trim(),
    String(data.customer || '').trim(),
    formatMocoPhoneForDisplay_(data.phone || ''),
    String(data.address || '').trim(),
    summary,
    totalQty,
    itemTotal,
    discountText,
    shipText,
    String(data.shipSubsidy || '').trim(),
    revenueAfterDiscount,
    String(data.productionStatus || 'Chưa làm').trim(),
    String(data.deliveryStatus || 'Chưa giao').trim(),
    String(data.paymentStatus || 'Chưa thanh toán').trim(),
    String(data.note || '').trim(),
  ];

  const nextRow = Math.max(orderSheet.getLastRow() + 1, 2);
  orderSheet.getRange(nextRow, 1, 1, MOCO_ORDER_FOUNDER_HEADERS.length).setValues([row]);
  orderSheet.getRange(nextRow, 1, 1, 2).setNumberFormat('@');
  orderSheet.getRange(nextRow, 3, 1, 2).setNumberFormat('dd/mm/yyyy');
  orderSheet.getRange(nextRow, 7, 1, 1).setNumberFormat('@');
  orderSheet.getRange(nextRow, 11, 1, 1).setNumberFormat('#,##0 [$đ-42A]');
  orderSheet.getRange(nextRow, 15, 1, 1).setNumberFormat('#,##0 [$đ-42A]');
  orderSheet.getRange(nextRow, 9, 1, 1).setWrap(true);

  if (itemSheet.getLastRow() < 1) {
    writeMocoStandardOrderSheetPlain_(ss, itemSheet, []);
  }
  const detailRows = items.map(item => [
    orderId,
    row[2],
    row[3],
    row[4],
    row[5],
    row[6],
    row[7],
    item.name,
    item.sku,
    item.qty,
    item.unitPrice,
    item.lineTotal,
    discountText,
    itemTotal ? Math.round(revenueAfterDiscount * item.lineTotal / itemTotal) : 0,
    row[15],
    row[16],
    row[17],
    row[18],
    row[1],
  ]);
  const detailStart = Math.max(itemSheet.getLastRow() + 1, 2);
  itemSheet.getRange(detailStart, 1, detailRows.length, MOCO_ORDER_STANDARD_HEADERS.length).setValues(detailRows);
  itemSheet.hideSheet();

  try {
    if (row[17] === 'Đã nhận tiền' && typeof MOCO_BACKFILL_THU === 'function') MOCO_BACKFILL_THU();
  } catch (err) {
    orderSheet.getRange(nextRow, 1).setNote('Đơn đã lưu nhưng sync THU CHI cần kiểm tra: ' + err.message);
  }

  return {
    orderId,
    row: nextRow,
    itemRows: detailRows.length,
    totalQty,
    itemTotal,
    revenueAfterDiscount,
  };
}

function normalizeMocoOrderFormItems_(items, menuMap) {
  const out = [];
  (items || []).forEach(item => {
    const name = String(item && item.name || '').trim();
    const qty = parseMocoOrderNumber_(item && item.qty);
    if (!name || qty <= 0) return;
    if (Math.floor(qty) !== qty) {
      throw new Error('Số lượng "' + name + '" phải là số nguyên lớn hơn 0.');
    }
    const menuItem = findMocoOrderMenuMatch_(menuMap, name) || {};
    const unitPrice = parseMocoOrderAmount_(item && item.unitPrice) || parseMocoOrderAmount_(menuItem.price);
    out.push({
      name,
      sku: menuItem.sku || String(item && item.sku || '').trim(),
      qty,
      unitPrice,
      lineTotal: unitPrice ? Math.round(qty * unitPrice) : 0,
    });
  });
  return out;
}

function nextMocoOrderId_(ss) {
  const sheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!sheet || sheet.getLastRow() < 2) return '1';
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
  let maxId = 0;
  values.forEach(row => {
    const n = Number(normalizeMocoOrderIdForForm_(row[0]));
    if (isFinite(n)) maxId = Math.max(maxId, n);
  });
  return String(maxId + 1);
}

function collectMocoFounderOrderIds_(sheet) {
  const ids = {};
  if (!sheet || sheet.getLastRow() < 2) return ids;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().forEach(row => {
    const id = normalizeMocoOrderIdForForm_(row[0]);
    if (id) ids[id] = true;
  });
  return ids;
}

function normalizeMocoOrderIdForForm_(value) {
  return String(value || '').trim().replace(/^#/, '').replace(/\.0$/, '');
}

function calcMocoOrderDiscountAmount_(discountText, total) {
  const text = String(discountText || '').trim().toLowerCase();
  if (!text) return 0;
  if (text.indexOf('%') >= 0) return Math.round(total * parseMocoOrderNumber_(text) / 100);
  const num = parseMocoOrderNumber_(text);
  if (num > 0 && num < 1) return Math.round(total * num);
  return parseMocoOrderAmount_(text);
}

function MOCO_STANDARDIZE_ORDERS(dryRun, options) {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!sheet) throw new Error('Không tìm thấy sheet ĐƠN HÀNG');

  options = options || {};
  let sourceSheet = sheet;
  if (options.fromBackup === true) {
    const backupSource = findLatestMocoOrderStandardizeBackupSheet_(ss);
    if (!backupSource) throw new Error('Không tìm thấy BACKUP_DON_HANG_STANDARDIZE_* để migrate lại.');
    sourceSheet = backupSource;
  }
  let values = sourceSheet.getDataRange().getValues();
  let display = sourceSheet.getDataRange().getDisplayValues();
  let alreadyStandard = isMocoStandardOrderSheet_(display[0] || []);
  const menuMap = buildMocoOrderMenuMap_(ss);
  let migration = alreadyStandard
    ? readMocoStandardOrderRowsForAudit_(values, display)
    : migrateMocoLegacyOrderRows_(values, display, menuMap);
  let sourceSheetName = sourceSheet.getName();
  if (!alreadyStandard && migration.rows.length === 0) {
    const backupSource = findLatestMocoOrderStandardizeBackupSheet_(ss);
    if (backupSource) {
      sourceSheet = backupSource;
      sourceSheetName = sourceSheet.getName();
      values = sourceSheet.getDataRange().getValues();
      display = sourceSheet.getDataRange().getDisplayValues();
      alreadyStandard = isMocoStandardOrderSheet_(display[0] || []);
      migration = alreadyStandard
        ? readMocoStandardOrderRowsForAudit_(values, display)
        : migrateMocoLegacyOrderRows_(values, display, menuMap);
    }
  }
  const audit = auditMocoStandardOrderRows_(migration.rows);

  if (dryRun) {
    return {
      dryRun: true,
      alreadyStandard,
      sourceSheet: sourceSheetName,
      uniqueOrders: audit.uniqueOrders,
      migratedRows: migration.rows.length,
      missing: audit.missing,
      warnings: migration.warnings,
      sampleRows: migration.rows.slice(0, 10),
    };
  }

  const backupSheet = sourceSheet.getName() === sheet.getName()
    ? backupMocoOrderStandardizeSheet_(ss, sheet)
    : sourceSheet.getName();
  if (typeof refreshMocoDataValidationLists_ === 'function') {
    refreshMocoDataValidationLists_(ss);
  }
  writeMocoStandardOrderSheet_(ss, sheet, migration.rows);
  return {
    dryRun: false,
    backupSheet,
    alreadyStandard,
    sourceSheet: sourceSheetName,
    uniqueOrders: audit.uniqueOrders,
    migratedRows: migration.rows.length,
    missing: audit.missing,
    warnings: migration.warnings,
  };
}

function isMocoStandardOrderSheet_(headerRow) {
  const normalized = (headerRow || []).map(value => normText_(value));
  return (normalized.indexOf(normText_('Mã đơn')) >= 0 || normalized.indexOf(normText_('STT')) >= 0)
    && (normalized.indexOf(normText_('TT thanh toán')) >= 0 || normalized.indexOf(normText_('Tình trạng thanh toán')) >= 0)
    && normalized.indexOf(normText_('Doanh thu sau CK')) >= 0;
}

function migrateMocoLegacyOrderRows_(values, display, menuMap) {
  const orders = [];
  const warnings = [];
  let current = null;

  for (let i = 2; i < display.length; i++) {
    const row = values[i] || [];
    const drow = display[i] || [];
    const orderId = String(drow[0] || row[0] || '').trim();
    if (orderId) {
      current = {
        orderId,
        customer: String(drow[1] || row[1] || '').trim(),
        address: String(drow[2] || row[2] || '').trim(),
        phone: String(drow[3] || row[3] || '').trim(),
        orderDate: '',
        sourceChannel: String(drow[4] || row[4] || '').trim(),
        deliveryDate: row[5] || drow[5] || '',
        rawStatus: String(drow[6] || row[6] || '').trim(),
        discount: String(drow[11] || row[11] || '').trim(),
        orderTotalBeforeDiscount: parseMocoOrderAmount_(row[10] || drow[10]),
        orderRevenueAfterDiscount: parseMocoOrderAmount_(row[14] || drow[14]),
        lines: [],
        firstRow: i + 1,
      };
      orders.push(current);
    }
    if (!current) continue;

    const itemName = String(drow[7] || row[7] || '').replace(/\s+/g, ' ').trim();
    if (!itemName) continue;

    const lineStatus = String(drow[6] || row[6] || current.rawStatus || '').trim();
    const statusInfo = classifyMocoOrderStatusAndTime_(lineStatus);
    const qty = parseMocoOrderNumber_(row[8] || drow[8]);
    const unitPrice = parseMocoOrderAmount_(row[9] || drow[9]);
    const lineTotal = qty && unitPrice ? qty * unitPrice : 0;
    const menu = findMocoOrderMenuMatch_(menuMap, itemName);
    current.lines.push({
      orderId: current.orderId,
      orderDate: current.orderDate,
      deliveryDate: row[5] || drow[5] || current.deliveryDate,
      deliveryTime: statusInfo.deliveryTime,
      customer: current.customer,
      phone: current.phone,
      address: current.address,
      sourceChannel: current.sourceChannel,
      itemName,
      sku: menu ? menu.sku : '',
      qty,
      unitPrice,
      lineTotal,
      discount: current.discount,
      revenueAfterDiscount: 0,
      productionStatus: statusInfo.productionStatus,
      deliveryStatus: statusInfo.deliveryStatus,
      paymentStatus: statusInfo.paymentStatus,
      note: menu ? '' : 'Chưa match MENU & GIÁ',
      sourceRow: i + 1,
    });
  }

  const rows = [];
  orders.forEach(order => {
    const lineSum = order.lines.reduce((sum, line) => sum + (line.lineTotal || 0), 0);
    const revenueAfterDiscount = order.orderRevenueAfterDiscount || order.orderTotalBeforeDiscount || lineSum;
    order.lines.forEach(line => {
      const allocated = lineSum > 0 ? Math.round((line.lineTotal || 0) * revenueAfterDiscount / lineSum) : 0;
      line.revenueAfterDiscount = allocated || line.lineTotal || revenueAfterDiscount || 0;
      rows.push(mocoOrderLineToStandardRow_(line));
    });
    if (!order.lines.length) {
      warnings.push('Đơn ' + order.orderId + ' không có dòng Tên bánh.');
    }
  });

  return { rows, warnings };
}

function readMocoStandardOrderRowsForAudit_(values, display) {
  const rows = [];
  const headerMap = buildMocoStandardOrderHeaderMap_(display[0] || values[0] || []);
  for (let i = 1; i < display.length; i++) {
    const row = values[i] || [];
    const drow = display[i] || [];
    if (!String(drow[0] || row[0] || '').trim() && !String(drow[7] || row[7] || '').trim()) continue;
    rows.push(normalizeMocoStandardOrderRow_(row, drow, headerMap));
  }
  return { rows, warnings: [] };
}

function buildMocoStandardOrderHeaderMap_(headers) {
  const normalized = (headers || []).map(value => normText_(value));
  return {
    orderId: findMocoOrderUiHeaderIndex_(normalized, ['ma don', 'stt']),
    orderDate: findMocoOrderUiHeaderIndex_(normalized, ['ngay dat']),
    deliveryDate: findMocoOrderUiHeaderIndex_(normalized, ['ngay giao']),
    deliveryTime: findMocoOrderUiHeaderIndex_(normalized, ['gio giao']),
    customer: findMocoOrderUiHeaderIndex_(normalized, ['ten kh', 'khach hang']),
    phone: findMocoOrderUiHeaderIndex_(normalized, ['sdt', 'so dt']),
    address: findMocoOrderUiHeaderIndex_(normalized, ['dia chi']),
    itemName: findMocoOrderUiHeaderIndex_(normalized, ['ten banh', 'ten mon']),
    sku: findMocoOrderUiHeaderIndex_(normalized, ['sku', 'sku menu']),
    qty: findMocoOrderUiHeaderIndex_(normalized, ['sl', 'so luong']),
    unitPrice: findMocoOrderUiHeaderIndex_(normalized, ['don gia', 'gia ban']),
    lineTotal: findMocoOrderUiHeaderIndex_(normalized, ['thanh tien']),
    discount: findMocoOrderUiHeaderIndex_(normalized, ['chiet khau', 'khuyen mai']),
    revenueAfterDiscount: findMocoOrderUiHeaderIndex_(normalized, ['doanh thu sau ck', 'gia sau ck']),
    productionStatus: findMocoOrderUiHeaderIndex_(normalized, ['tt san xuat', 'trang thai san xuat', 'tinh trang san xuat']),
    deliveryStatus: findMocoOrderUiHeaderIndex_(normalized, ['tt giao hang', 'trang thai giao hang', 'tinh trang giao hang']),
    paymentStatus: findMocoOrderUiHeaderIndex_(normalized, ['tt thanh toan', 'trang thai thanh toan', 'tinh trang thanh toan']),
    note: findMocoOrderUiHeaderIndex_(normalized, ['ghi chu']),
    sourceChannel: findMocoOrderUiHeaderIndex_(normalized, ['nguon khach', 'mang xh', 'kenh']),
  };
}

function getMocoOrderCellByHeader_(row, drow, idx) {
  return idx >= 0 ? (row[idx] || drow[idx] || '') : '';
}

function normalizeMocoStandardOrderRow_(row, drow, map) {
  const orderDate = getMocoOrderCellByHeader_(row, drow, map.orderDate);
  let sourceChannel = getMocoOrderCellByHeader_(row, drow, map.sourceChannel);
  let normalizedOrderDate = orderDate;
  const orderDateKey = normText_(orderDate);
  if (!sourceChannel && /^(ig|fb|facebook|threads|ban|khach|zalo|tiktok)$/.test(orderDateKey)) {
    sourceChannel = orderDate;
    normalizedOrderDate = '';
  }
  return [
    getMocoOrderCellByHeader_(row, drow, map.orderId),
    normalizedOrderDate,
    getMocoOrderCellByHeader_(row, drow, map.deliveryDate),
    getMocoOrderCellByHeader_(row, drow, map.deliveryTime),
    getMocoOrderCellByHeader_(row, drow, map.customer),
    getMocoOrderCellByHeader_(row, drow, map.phone),
    getMocoOrderCellByHeader_(row, drow, map.address),
    getMocoOrderCellByHeader_(row, drow, map.itemName),
    getMocoOrderCellByHeader_(row, drow, map.sku),
    getMocoOrderCellByHeader_(row, drow, map.qty),
    getMocoOrderCellByHeader_(row, drow, map.unitPrice),
    getMocoOrderCellByHeader_(row, drow, map.lineTotal),
    getMocoOrderCellByHeader_(row, drow, map.discount),
    getMocoOrderCellByHeader_(row, drow, map.revenueAfterDiscount),
    getMocoOrderCellByHeader_(row, drow, map.productionStatus),
    getMocoOrderCellByHeader_(row, drow, map.deliveryStatus),
    getMocoOrderCellByHeader_(row, drow, map.paymentStatus),
    getMocoOrderCellByHeader_(row, drow, map.note),
    sourceChannel,
  ];
}

function mocoOrderLineToStandardRow_(line) {
  return [
    line.orderId,
    formatMocoOrderDateForDisplay_(line.orderDate),
    formatMocoOrderDateForDisplay_(line.deliveryDate),
    line.deliveryTime,
    line.customer,
    formatMocoPhoneForDisplay_(line.phone),
    line.address,
    line.itemName,
    line.sku,
    line.qty || '',
    line.unitPrice || '',
    line.lineTotal || '',
    line.discount,
    line.revenueAfterDiscount || '',
    line.productionStatus,
    line.deliveryStatus,
    line.paymentStatus,
    line.note,
    line.sourceChannel || '',
  ];
}

function auditMocoStandardOrderRows_(rows) {
  const orderIds = {};
  const missing = [];
  (rows || []).forEach((row, idx) => {
    const rowNumber = idx + 2;
    const orderId = String(row[0] || '').trim();
    if (orderId) orderIds[orderId] = true;
    if (!orderId) missing.push('Dòng ' + rowNumber + ': thiếu Mã đơn');
    if (!String(row[7] || '').trim()) missing.push('Dòng ' + rowNumber + ': thiếu Tên bánh');
    if (!parseMocoOrderNumber_(row[9])) missing.push('Dòng ' + rowNumber + ': thiếu SL');
    if (!parseMocoOrderAmount_(row[10])) missing.push('Dòng ' + rowNumber + ': thiếu Đơn giá');
    if (!parseMocoOrderAmount_(row[13])) missing.push('Dòng ' + rowNumber + ': thiếu Doanh thu sau CK');
  });
  return {
    uniqueOrders: Object.keys(orderIds).length,
    missing,
  };
}

function writeMocoStandardOrderSheet_(ss, sheet, rows) {
  const minRows = Math.max(rows.length + 1, 100);
  const width = MOCO_ORDER_STANDARD_HEADERS.length;
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();
  sheet.getRange(1, 1, maxRows, maxCols).breakApart();
  sheet.clear();
  sheet.clearNotes();
  sheet.clearFormats();
  sheet.clearConditionalFormatRules();
  sheet.getRange(1, 1, maxRows, maxCols).clearDataValidations();
  if (sheet.getMaxRows() < minRows) sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < width) sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());
  sheet.getRange(1, 1, 1, width).setNumberFormat('@');
  sheet.getRange(1, 1, 1, width).setValues([MOCO_ORDER_STANDARD_HEADERS]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 4, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 6, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 13, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 18, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 1, rows.length, width).setValues(rows);
  }

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.getRange(1, 1, 1, width)
    .setFontWeight('bold')
    .setBackground('#1F4E79')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.getRange(1, 1, Math.max(rows.length + 1, 2), width)
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID);

  const widths = [90, 110, 110, 90, 180, 130, 260, 220, 120, 70, 110, 120, 110, 140, 130, 130, 150, 260, 120];
  widths.forEach((widthPx, idx) => sheet.setColumnWidth(idx + 1, widthPx));
  if (rows.length) {
    sheet.getRange(2, 2, rows.length, 2).setNumberFormat('dd/mm/yyyy');
    sheet.getRange(2, 10, rows.length, 1).setNumberFormat('0.##');
    sheet.getRange(2, 11, rows.length, 2).setNumberFormat('#,##0 [$đ-42A]');
    sheet.getRange(2, 14, rows.length, 1).setNumberFormat('#,##0 [$đ-42A]');
    try {
      applyMocoOrderDropdowns_(ss, sheet, rows.length);
    } catch (err) {
      sheet.getRange('A1').setNote('Đã ghi dữ liệu đơn hàng, nhưng bỏ qua dropdown validation do lỗi nguồn danh sách: ' + (err && err.message ? err.message : err));
    }
  }
  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(1, 1, Math.max(rows.length + 1, 2), width).createFilter();
  setMocoStandardOrderHeaderNotes_(sheet);
}

function writeMocoStandardOrderSheetPlain_(ss, sheet, rows) {
  const width = MOCO_ORDER_STANDARD_HEADERS.length;
  const minRows = Math.max(rows.length + 1, 100);
  const warnings = [];
  const paddedRows = (rows || []).map(row => {
    const out = (row || []).slice(0, width);
    while (out.length < width) out.push('');
    return out;
  });
  const values = [MOCO_ORDER_STANDARD_HEADERS].concat(paddedRows);

  if (sheet.getMaxRows() < minRows) sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < width) sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());

  try {
    const filter = sheet.getFilter();
    if (filter) filter.remove();
  } catch (err) {
    warnings.push('Khong go duoc filter cu: ' + err.message);
  }

  const clearRows = Math.max(sheet.getLastRow(), values.length, 1);
  const clearCols = Math.max(sheet.getLastColumn(), width, 1);
  for (let col = 1; col <= clearCols; col++) {
    try {
      sheet.getRange(1, col, clearRows, 1).clearContent().clearDataValidations();
    } catch (err) {
      warnings.push('Khong clear duoc cot ' + col + ': ' + err.message);
    }
  }

  try {
    sheet.getRange(1, 1, values.length, width).setValues(values);
  } catch (err) {
    warnings.push('Ghi block don hang bi loi, chuyen sang ghi tung cot: ' + err.message);
    for (let col = 1; col <= width; col++) {
      const colValues = values.map(row => [row[col - 1]]);
      sheet.getRange(1, col, values.length, 1).setValues(colValues);
    }
  }

  try {
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
  } catch (err) {
    warnings.push('Khong freeze duoc header: ' + err.message);
  }
  try {
    sheet.getRange(1, 1, 1, width)
      .setFontWeight('bold')
      .setBackground('#1F4E79')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(true);
  } catch (err) {
    warnings.push('Khong format duoc header: ' + err.message);
  }
  try {
    sheet.getRange(1, 1, values.length, width)
      .setVerticalAlignment('middle')
      .setWrap(true)
      .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID);
  } catch (err) {
    warnings.push('Khong format duoc bang don hang: ' + err.message);
  }

  const widths = [90, 110, 110, 90, 180, 130, 260, 220, 120, 70, 110, 120, 110, 140, 130, 130, 150, 260, 120];
  widths.forEach((widthPx, idx) => {
    try {
      sheet.setColumnWidth(idx + 1, widthPx);
    } catch (err) {
      warnings.push('Khong set width cot ' + (idx + 1) + ': ' + err.message);
    }
  });

  if (paddedRows.length) {
    [
      { col: 2, format: 'dd/mm/yyyy' },
      { col: 3, format: 'dd/mm/yyyy' },
      { col: 10, format: '0.##' },
      { col: 11, format: '#,##0 [$đ-42A]' },
      { col: 12, format: '#,##0 [$đ-42A]' },
      { col: 14, format: '#,##0 [$đ-42A]' },
    ].forEach(spec => {
      try {
        sheet.getRange(2, spec.col, paddedRows.length, 1).setNumberFormat(spec.format);
      } catch (err) {
        warnings.push('Khong set number format cot ' + spec.col + ': ' + err.message);
      }
    });
  }

  try {
    setMocoStandardOrderHeaderNotes_(sheet);
  } catch (err) {
    warnings.push('Khong gan duoc note header: ' + err.message);
  }
  if (warnings.length) {
    try {
      sheet.getRange('A1').setNote('Ghi bang don hang o che do plain, bo qua dropdown/validation. Canh bao: ' + warnings.slice(0, 5).join(' | '));
    } catch (err) {}
  }
  return { warnings };
}

function applyMocoOrderDropdowns_(ss, sheet, rowCount) {
  if (rowCount <= 0) return;
  applyMocoDropdownNamedRange_(sheet, 2, 8, rowCount, ss, 'LIST_MENU_NAMES', true, 'Chọn tên bánh từ MENU & GIÁ nếu phù hợp.');
  applyMocoDropdownNamedRange_(sheet, 2, 9, rowCount, ss, 'LIST_MENU_SKU', true, 'Mã SKU trong MENU & GIÁ.');
  applyMocoDropdownList_(sheet, 2, 15, rowCount, ['Chưa làm', 'Đang làm', 'Xong', 'Hủy'], false);
  applyMocoDropdownList_(sheet, 2, 16, rowCount, ['Chưa giao', 'Đang giao', 'Đã giao', 'Hủy'], false);
  applyMocoDropdownList_(sheet, 2, 17, rowCount, ['Chưa thanh toán', 'Đã cọc', 'Đã nhận tiền', 'Hoàn tiền/Hủy'], false);
}

function setMocoStandardOrderHeaderNotes_(sheet) {
  setMocoHeaderNotes_(sheet, 1, {
    1: 'Mã đơn duy nhất. Một đơn nhiều sản phẩm thì lặp lại mã đơn ở nhiều dòng.',
    4: 'Giờ giao, ví dụ 8h30. Không nhập trạng thái thanh toán vào đây.',
    8: 'Tên bánh khách đặt. Nên khớp MENU & GIÁ để dashboard gom đúng.',
    9: 'Mã SKU/Menu nếu match được. Có thể để trống nếu tên món chưa chuẩn.',
    14: 'Doanh thu sau chiết khấu phân bổ theo từng dòng sản phẩm.',
    15: 'Trạng thái bếp/sản xuất.',
    16: 'Trạng thái giao hàng.',
    17: 'Trạng thái thanh toán. THU CHI chỉ backfill khi là Đã nhận tiền.',
    19: 'Nguồn khách từ sheet gốc, ví dụ IG, Threads, Bạn.',
  });
}

function MOCO_REPAIR_ORDER_SOURCE_CHANNEL(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!sheet) throw new Error('Không tìm thấy sheet ĐƠN HÀNG');

  const sourceTabsData = opts.sourceTabsData || {};
  const sourceRows = (sourceTabsData['Đơn đặt hàng'] || sourceTabsData.orders || []).map(row => {
    if (Array.isArray(row)) return row;
    if (row && Array.isArray(row.value)) return row.value;
    return [];
  });
  const sourceValues = normalizeMocoImportedRows_(sourceRows);
  if (!sourceValues.length) throw new Error('Thiếu dữ liệu nguồn tab Đơn đặt hàng');

  const menuMap = buildMocoOrderMenuMap_(ss);
  const migration = migrateMocoLegacyOrderRows_(sourceValues, sourceValues, menuMap);
  const audit = auditMocoStandardOrderRows_(migration.rows);
  const sourceChannels = {};
  migration.rows.forEach(row => {
    const channel = String(row[18] || '').trim();
    if (channel) sourceChannels[channel] = true;
  });

  const report = {
    dryRun,
    targetSheet: 'ĐƠN HÀNG',
    sourceRows: sourceValues.length,
    migratedRows: migration.rows.length,
    uniqueOrders: audit.uniqueOrders,
    missing: audit.missing.slice(0, 30),
    sourceChannels: Object.keys(sourceChannels).sort(),
    sampleRows: migration.rows.slice(0, 5),
    warnings: migration.warnings.slice(0, 30),
    backup: '',
  };
  if (dryRun) return report;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for order source channel repair: ' + requiredConfirm);

  report.backup = backupMocoOrderStandardizeSheet_(ss, sheet);
  const writeResult = writeMocoStandardOrderSheetPlain_(ss, sheet, migration.rows);
  if (writeResult && writeResult.warnings && writeResult.warnings.length) {
    report.writeWarnings = writeResult.warnings.slice(0, 30);
  }
  if (typeof MOCO_BACKFILL_THU === 'function') {
    try {
      report.thuChiBackfill = MOCO_BACKFILL_THU();
    } catch (err) {
      report.thuChiWarning = err.message;
    }
  }
  return report;
}

function MOCO_APPLY_FOUNDER_ORDER_VIEW(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const target = ss.getSheetByName('ĐƠN HÀNG');
  if (!target) throw new Error('Không tìm thấy sheet ĐƠN HÀNG');

  const sourceValues = getMocoOrderSourceRowsFromTabs_(opts.sourceTabsData || {});
  if (!sourceValues.length) throw new Error('Thiếu dữ liệu nguồn tab Đơn đặt hàng');

  const menuMap = buildMocoOrderMenuMap_(ss);
  const detailMigration = migrateMocoLegacyOrderRows_(sourceValues, sourceValues, menuMap);
  const compactRows = buildMocoFounderOrderRows_(sourceValues);
  const sourceShipValues = {};
  compactRows.forEach(row => {
    const ship = String(row[12] || '').trim();
    const subsidy = String(row[13] || '').trim();
    if (ship) sourceShipValues[ship] = true;
    if (subsidy) sourceShipValues[subsidy] = true;
  });

  const report = {
    dryRun,
    targetSheet: 'ĐƠN HÀNG',
    detailSheet: MOCO_ORDER_ITEM_SHEET,
    sourceRows: sourceValues.length,
    compactOrders: compactRows.length,
    detailRows: detailMigration.rows.length,
    sourceShipValues: Object.keys(sourceShipValues).sort(),
    sampleRows: compactRows.slice(0, 5),
    warnings: detailMigration.warnings.slice(0, 30),
    backup: '',
  };
  if (dryRun) return report;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for founder order view: ' + requiredConfirm);

  report.backup = backupMocoOrderStandardizeSheet_(ss, target);
  let founderSheet = target;
  try {
    writeMocoFounderOrderSheet_(ss, founderSheet, compactRows);
  } catch (err) {
    report.recreateWarning = err.message;
    const targetIndex = target.getIndex();
    ss.deleteSheet(target);
    founderSheet = ss.insertSheet('ĐƠN HÀNG', Math.max(targetIndex - 1, 0));
    writeMocoFounderOrderSheet_(ss, founderSheet, compactRows);
  }
  let detailSheet = ss.getSheetByName(MOCO_ORDER_ITEM_SHEET);
  if (!detailSheet) detailSheet = ss.insertSheet(MOCO_ORDER_ITEM_SHEET);
  const writeResult = writeMocoStandardOrderSheetPlain_(ss, detailSheet, detailMigration.rows);
  detailSheet.hideSheet();
  try {
    applyMocoOrderDropdowns_(ss, detailSheet, detailMigration.rows.length);
    applyMocoFounderOrderStatusColors_(detailSheet, detailMigration.rows.length);
  } catch (err) {
    report.detailUiWarning = err.message;
  }
  const oldDetailSheet = ss.getSheetByName(MOCO_ORDER_DETAIL_SHEET);
  if (oldDetailSheet && oldDetailSheet.getSheetId() !== detailSheet.getSheetId()) {
    oldDetailSheet.hideSheet();
  }
  if (writeResult && writeResult.warnings && writeResult.warnings.length) {
    report.detailWriteWarnings = writeResult.warnings.slice(0, 30);
  }
  return report;
}

function MOCO_CLEANUP_ORDER_HIDDEN_SHEETS() {
  const ss = getMocoSpreadsheet_();
  const deleted = [];
  const kept = [];
  const deleteNames = {};

  const oldDetail = ss.getSheetByName(MOCO_ORDER_DETAIL_SHEET);
  if (oldDetail) deleteNames[oldDetail.getName()] = 'old duplicated order detail sheet';

  const prefixes = [
    'BACKUP_DON_HANG_STANDARDIZE_',
    'BACKUP_THU_CHI_RECONCILE_',
    'BACKUP_THU_CHI_',
  ];
  prefixes.forEach(prefix => {
    const matches = ss.getSheets()
      .map(sheet => sheet.getName())
      .filter(name => name.indexOf(prefix) === 0)
      .sort();
    if (matches.length <= 1) {
      if (matches.length === 1) kept.push(matches[0]);
      return;
    }
    const latest = matches[matches.length - 1];
    kept.push(latest);
    matches.slice(0, -1).forEach(name => {
      deleteNames[name] = 'old hidden backup';
    });
  });

  Object.keys(deleteNames).sort().forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    if (ss.getSheets().length <= 1) return;
    ss.deleteSheet(sheet);
    deleted.push({ name, reason: deleteNames[name] });
  });

  const itemSheet = ss.getSheetByName(MOCO_ORDER_ITEM_SHEET);
  if (itemSheet) {
    itemSheet.hideSheet();
    kept.push(MOCO_ORDER_ITEM_SHEET + ' (hidden data for dashboard)');
  }
  return {
    deletedCount: deleted.length,
    deleted,
    kept,
  };
}

function MOCO_AUDIT_TEMP_SHEETS() {
  return buildMocoTempSheetCleanupPlan_(getMocoSpreadsheet_());
}

function MOCO_CLEANUP_TEMP_SHEETS(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_CLEAN_TEMP_SHEETS';
  const ss = getMocoSpreadsheet_();
  const plan = buildMocoTempSheetCleanupPlan_(ss);
  if (dryRun) return plan;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for temp sheet cleanup: ' + requiredConfirm);

  const deleted = [];
  const skipped = [];
  plan.deleteCandidates.forEach(item => {
    const sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      skipped.push({ name: item.name, reason: 'not found' });
      return;
    }
    if (ss.getSheets().length <= 1) {
      skipped.push({ name: item.name, reason: 'refuse to delete last sheet' });
      return;
    }
    ss.deleteSheet(sheet);
    deleted.push(item);
  });

  const itemSheet = ss.getSheetByName(MOCO_ORDER_ITEM_SHEET);
  if (itemSheet) itemSheet.hideSheet();
  const after = buildMocoTempSheetCleanupPlan_(ss);
  return {
    dryRun: false,
    deletedCount: deleted.length,
    deleted,
    skipped,
    remainingTempCount: after.deleteCandidates.length,
    remainingTemp: after.deleteCandidates,
    keptTechnical: after.keptTechnical,
    keptOperational: after.keptOperational,
  };
}

function buildMocoTempSheetCleanupPlan_(ss) {
  const deleteCandidates = [];
  const keptOperational = [];
  const keptTechnical = [];
  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    const item = {
      name,
      hidden: sheet.isSheetHidden(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn(),
    };
    const classification = classifyMocoTempSheet_(name);
    if (classification.delete) {
      deleteCandidates.push(Object.assign({}, item, { reason: classification.reason }));
    } else if (classification.technical) {
      keptTechnical.push(Object.assign({}, item, { reason: classification.reason }));
    } else {
      keptOperational.push(item);
    }
  });
  return {
    dryRun: true,
    deleteCount: deleteCandidates.length,
    deleteCandidates,
    keptTechnical,
    keptOperational,
    note: 'Delete candidates are regenerated source copies, backups, and old staging/audit sheets. Operational tabs and required hidden data sheets are kept.',
  };
}

function classifyMocoTempSheet_(name) {
  const raw = String(name || '').trim();
  const key = normText_(raw);
  const operational = {
    home: true,
    'menu & gia': true,
    'don hang': true,
    'cost & gia': true,
    'viec can lam': true,
    'nhap hang': true,
    'cong thuc': true,
    'thanh pham/me': true,
    'thu chi': true,
    dashboard: true,
    ttb: true,
    nvl: true,
    'tai chinh': true,
    'cost cfg': true,
    'master nvl': true,
    'ai validate review': true,
  };
  if (operational[key]) return { delete: false, technical: false, reason: 'operational sheet' };
  if (raw === MOCO_ORDER_ITEM_SHEET) return { delete: false, technical: true, reason: 'required hidden item-level order data' };

  const exactDeletes = {
    'ORDER RAW - DÁN FOUNDER': 'old manual order import staging',
    'ORDER IMPORT REVIEW': 'old order import review',
    'REVIEW TÊN HÀNG': 'obsolete name review',
    'REVIEW TÊN HÀNG - AUDIT': 'obsolete name review audit',
    'Bản sao của Đơn đặt hàng': 'copied source order tab',
    'Đơn đặt hàng': 'copied source order tab',
    'Don dat hang': 'copied source order tab',
    'Thu - Chi': 'copied source cashflow tab',
    'NHAP HANG': 'copied source purchase tab',
    MOCO_ORDER_DETAIL_SHEET: 'old duplicated order detail sheet',
  };
  if (exactDeletes[raw]) return { delete: true, technical: false, reason: exactDeletes[raw] };

  const deletePrefixes = [
    ['SOURCE_', 'source import staging'],
    ['ORDER_SOURCE_COPY_', 'order source copy'],
    ['BACKUP_', 'old automatic backup'],
    ['BACKUP_DON_HANG_', 'old order backup'],
    ['BACKUP_DON_HANG_STANDARDIZE_', 'old order standardize backup'],
    ['BACKUP_THU_CHI_', 'old thu chi backup'],
    ['BACKUP_THU_CHI_RECONCILE_', 'old thu chi reconcile backup'],
    ['BACKUP_IMPORT_', 'old direct import backup'],
    ['BACKUP_REPAIR_', 'old repair backup'],
  ];
  for (let i = 0; i < deletePrefixes.length; i++) {
    if (raw.indexOf(deletePrefixes[i][0]) === 0) {
      return { delete: true, technical: false, reason: deletePrefixes[i][1] };
    }
  }
  if (raw.indexOf('SOURCE') >= 0 || raw.indexOf('BACKUP') >= 0) {
    return { delete: true, technical: false, reason: 'temporary source/backup sheet' };
  }
  return { delete: false, technical: true, reason: 'unclassified technical/support sheet; kept by default' };
}

function getMocoOrderSourceRowsFromTabs_(sourceTabsData) {
  const rawRows = (sourceTabsData['Đơn đặt hàng'] || sourceTabsData.orders || []).map(row => {
    if (Array.isArray(row)) return row;
    if (row && Array.isArray(row.value)) return row.value;
    return [];
  });
  return normalizeMocoImportedRows_(rawRows);
}

function buildMocoFounderOrderRows_(sourceValues) {
  const orders = [];
  let current = null;
  for (let i = 2; i < sourceValues.length; i++) {
    const row = sourceValues[i] || [];
    const orderId = String(row[0] || '').trim();
    if (orderId) {
      current = {
        orderId,
        customer: String(row[1] || '').trim(),
        address: String(row[2] || '').trim(),
        phone: formatMocoPhoneForDisplay_(row[3]),
        sourceChannel: String(row[4] || '').trim(),
        deliveryDate: row[5] || '',
        statuses: [],
        discount: String(row[11] || '').trim(),
        ship: String(row[12] || '').trim(),
        shipSubsidy: row[13] || '',
        totalBeforeDiscount: parseMocoOrderAmount_(row[10]),
        revenueAfterDiscount: parseMocoOrderAmount_(row[14]),
        items: [],
      };
      orders.push(current);
    }
    if (!current) continue;
    const itemName = String(row[7] || '').replace(/\s+/g, ' ').trim();
    const rawStatus = String(row[6] || '').trim();
    if (rawStatus) current.statuses.push(rawStatus);
    if (!itemName) continue;
    const qty = parseMocoOrderNumber_(row[8]);
    const unitPrice = parseMocoOrderAmount_(row[9]);
    const lineTotal = qty && unitPrice ? qty * unitPrice : 0;
    current.items.push({
      itemName,
      qty,
      unitPrice,
      lineTotal,
      deliveryDate: row[5] || current.deliveryDate || '',
      status: rawStatus,
    });
  }

  return orders
    .filter(order => order.orderId && order.items.length)
    .map(order => mocoFounderOrderToRow_(order));
}

function mocoFounderOrderToRow_(order) {
  const lineSum = order.items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const totalQty = order.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const deliveryDates = uniqueMocoTextValues_(
    order.items.map(item => formatMocoOrderDateForDisplay_(item.deliveryDate || order.deliveryDate))
  );
  const statusInfo = summarizeMocoFounderOrderStatus_(order.statuses);
  const itemsText = order.items.map(item => {
    const qtyText = item.qty ? mocoFormatCompactQty_(item.qty) + ' x ' : '';
    return qtyText + item.itemName;
  }).join('\n');

  return [
    order.orderId,
    order.sourceChannel,
    '',
    deliveryDates.join('\n') || formatMocoOrderDateForDisplay_(order.deliveryDate),
    statusInfo.deliveryTime,
    order.customer,
    order.phone,
    order.address,
    itemsText,
    totalQty || '',
    order.totalBeforeDiscount || lineSum || '',
    order.discount,
    order.ship,
    order.shipSubsidy,
    order.revenueAfterDiscount || order.totalBeforeDiscount || lineSum || '',
    statusInfo.productionStatus,
    statusInfo.deliveryStatus,
    statusInfo.paymentStatus,
    '',
  ];
}

function summarizeMocoFounderOrderStatus_(statuses) {
  const values = uniqueMocoTextValues_(statuses);
  const joined = values.join(' | ');
  const anyPaid = values.some(value => {
    const key = normText_(value);
    return key === 'done' || key === 'donee' || key.indexOf('da nhan tien') >= 0 || key.indexOf('da thanh toan') >= 0;
  });
  const anyUnpaid = values.some(value => {
    const key = normText_(value);
    return key.indexOf('chua tt') >= 0 || key.indexOf('chua thanh toan') >= 0;
  });
  const timeValues = values.filter(value => {
    const key = normText_(value);
    if (key === 'done' || key === 'donee' || key.indexOf('da nhan tien') >= 0 || key.indexOf('da thanh toan') >= 0) return false;
    if (key.indexOf('chua tt') >= 0 || key.indexOf('chua thanh toan') >= 0) return false;
    return /\d{1,2}\s*h(?:\s*\d{1,2})?/i.test(value)
      || /\d{1,2}:\d{2}/.test(value)
      || /\d{1,2}\s*-\s*\d{1,2}\s*h/i.test(value);
  });
  return {
    deliveryTime: timeValues.join('\n'),
    productionStatus: anyPaid ? 'Xong' : 'Chưa làm',
    deliveryStatus: anyPaid ? 'Đã giao' : 'Chưa giao',
    paymentStatus: anyPaid ? 'Đã nhận tiền' : (anyUnpaid ? 'Chưa thanh toán' : 'Chưa thanh toán'),
    raw: joined,
  };
}

function writeMocoFounderOrderSheet_(ss, sheet, rows) {
  const width = MOCO_ORDER_FOUNDER_HEADERS.length;
  const minRows = Math.max(rows.length + 1, 100);
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).breakApart();
  sheet.clearConditionalFormatRules();
  for (let col = 1; col <= sheet.getMaxColumns(); col++) {
    try {
      sheet.getRange(1, col, sheet.getMaxRows(), 1)
        .clearContent()
        .clearNote()
        .clearFormat()
        .clearDataValidations();
    } catch (err) {}
  }
  if (sheet.getMaxRows() < minRows) sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < width) sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());

  sheet.getRange(1, 1, 1, width).setNumberFormat('@').setValues([MOCO_ORDER_FOUNDER_HEADERS]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 2, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 7, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 22, rows.length, 3).setNumberFormat('@');
    sheet.getRange(2, 1, rows.length, width).setValues(rows);
  }

  sheet.showSheet();
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.getRange(1, 1, 1, width)
    .setFontWeight('bold')
    .setBackground('#1F4E79')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.getRange(1, 1, Math.max(rows.length + 1, 2), width)
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID);
  const widths = [90, 110, 110, 110, 90, 180, 130, 280, 300, 80, 130, 110, 90, 90, 130, 120, 120, 140, 240];
  widths.forEach((widthPx, idx) => sheet.setColumnWidth(idx + 1, widthPx));
  const bodyRows = Math.max(minRows - 1, 1);
  sheet.getRange(2, 1, bodyRows, 1).setNumberFormat('@');
  sheet.getRange(2, 2, bodyRows, 1).setNumberFormat('@');
  sheet.getRange(2, 3, bodyRows, 2).setNumberFormat('dd/mm/yyyy');
  sheet.getRange(2, 7, bodyRows, 1).setNumberFormat('@');
  sheet.getRange(2, 9, bodyRows, 3).setBackground('#F8F9FA');
  sheet.getRange(2, 11, bodyRows, 1).setNumberFormat('#,##0 [$đ-42A]');
  sheet.getRange(2, 12, bodyRows, 3).setNumberFormat('@');
  sheet.getRange(2, 15, bodyRows, 1).setNumberFormat('#,##0 [$đ-42A]');
  applyMocoDropdownList_(sheet, 2, 16, bodyRows, ['Chưa làm', 'Đang làm', 'Xong', 'Hủy'], false);
  applyMocoDropdownList_(sheet, 2, 17, bodyRows, ['Chưa giao', 'Đang giao', 'Đã giao', 'Hủy'], false);
  applyMocoDropdownList_(sheet, 2, 18, bodyRows, ['Chưa thanh toán', 'Đã cọc', 'Đã nhận tiền', 'Hoàn tiền/Hủy'], false);
  applyMocoFounderOrderStatusColors_(sheet, bodyRows);
  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(1, 1, Math.max(rows.length + 1, 2), width).createFilter();
  setMocoHeaderNotes_(sheet, 1, {
    9: 'Tự sinh từ form Nhập đơn mới. Không nhập tay cột này.',
    11: 'Tổng tiền món. Form tính theo giá trong MENU & GIÁ khi nhập đơn mới.',
    13: 'Phí ship/ghi chú ship.',
    14: 'Phần shop bù ship hoặc ghi chú bù ship.',
    15: 'Tổng doanh thu sau khuyến mại/ship.',
  });
}

function applyMocoFounderOrderStatusColors_(sheet, rowCount) {
  const rows = Math.max(Number(rowCount || 0), 1);
  const ranges = [sheet.getRange(2, 16, rows, 3)];
  const rules = [];
  [
    ['Xong', '#D9EAD3', '#274E13'],
    ['Đã', '#D9EAD3', '#274E13'],
    ['Chưa', '#FFF2CC', '#7F6000'],
    ['Đang', '#D9EAF7', '#0B5394'],
    ['Hủy', '#F4CCCC', '#990000'],
    ['Hoàn tiền', '#F4CCCC', '#990000'],
  ].forEach(config => {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains(config[0])
        .setBackground(config[1])
        .setFontColor(config[2])
        .setRanges(ranges)
        .build()
    );
  });
  sheet.setConditionalFormatRules(rules);
}

function uniqueMocoTextValues_(values) {
  const seen = {};
  const out = [];
  (values || []).forEach(value => {
    const text = String(value || '').trim();
    if (!text) return;
    const key = normText_(text);
    if (seen[key]) return;
    seen[key] = true;
    out.push(text);
  });
  return out;
}

function formatMocoOrderDateForDisplay_(value) {
  if (!value) return '';
  const type = Object.prototype.toString.call(value);
  const tz = Session.getScriptTimeZone();
  if (type === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, tz, 'dd/MM/yyyy');
  }

  const text = String(value || '').trim();
  if (!text) return '';
  const serial = Number(text);
  if (isFinite(serial) && serial > 20000 && serial < 80000) {
    const date = new Date(1899, 11, 30 + Math.floor(serial));
    return Utilities.formatDate(date, tz, 'dd/MM/yyyy');
  }
  return text;
}

function formatMocoPhoneForDisplay_(value) {
  if (!value) return '';
  let text = String(value || '').trim();
  if (!text) return '';
  if (/^\d+(?:\.\d+)?e\+?\d+$/i.test(text) || typeof value === 'number') {
    const num = Number(value);
    if (isFinite(num)) text = String(Math.round(num));
  }
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return text;
  if (digits.length === 9) return '0' + digits;
  if (digits.length === 10) return digits;
  return text;
}

function mocoFormatCompactQty_(value) {
  const num = Number(value || 0);
  if (!num) return '';
  return String(Math.round(num * 100) / 100).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function mocoFormatVndText_(value) {
  const num = Number(value || 0);
  if (!num) return '';
  return Math.round(num).toLocaleString('vi-VN') + 'đ';
}

function classifyMocoOrderStatusAndTime_(rawStatus) {
  const raw = String(rawStatus || '').trim();
  const key = normText_(raw);
  const isPaid = key === 'done' || key.indexOf('da nhan tien') >= 0 || key.indexOf('da thanh toan') >= 0;
  const isUnpaid = key.indexOf('chua tt') >= 0 || key.indexOf('chua thanh toan') >= 0;
  const looksLikeTime = /\d{1,2}\s*h(?:\s*\d{1,2})?/i.test(raw) || /\d{1,2}:\d{2}/.test(raw);
  return {
    deliveryTime: looksLikeTime ? raw : '',
    productionStatus: isPaid ? 'Xong' : 'Chưa làm',
    deliveryStatus: isPaid ? 'Đã giao' : 'Chưa giao',
    paymentStatus: isPaid ? 'Đã nhận tiền' : (isUnpaid ? 'Chưa thanh toán' : 'Chưa thanh toán'),
  };
}

function buildMocoOrderMenuMap_(ss) {
  const menuSheet = ss.getSheetByName('MENU & GIÁ');
  const menu = typeof readMocoMenuRows_ === 'function' ? readMocoMenuRows_(menuSheet) : { rows: [] };
  const byName = {};
  (menu.rows || []).forEach(item => {
    if (item.onlineName) byName[normText_(item.onlineName)] = item;
    if (item.recipeName) byName[normText_(item.recipeName)] = item;
  });
  return { rows: menu.rows || [], byName };
}

function findMocoOrderMenuMatch_(menuMap, itemName) {
  const key = normText_(itemName);
  return (menuMap && menuMap.byName && menuMap.byName[key]) || null;
}

function parseMocoOrderAmount_(value) {
  if (typeof value === 'number') return value;
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const key = raw.toLowerCase().replace(/\s+/g, '');
  const kMatch = key.match(/^(\d+(?:[.,]\d+)?)k$/);
  if (kMatch) return Math.round(Number(kMatch[1].replace(',', '.')) * 1000);
  if (/^-?\d+(?:[.,]\d+)?$/.test(key)) {
    const sep = key.indexOf(',') >= 0 ? ',' : (key.indexOf('.') >= 0 ? '.' : '');
    if (!sep) return Number(key);
    const parts = key.split(sep);
    if (parts.length === 2 && parts[1] === '0' && parts[0].length >= 4) return Number(parts[0]);
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) return Number(parts.join(''));
    return Number(key.replace(',', '.'));
  }
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function parseMocoOrderNumber_(value) {
  if (typeof value === 'number') return value;
  const raw = String(value || '').trim().replace(',', '.');
  const match = raw.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function backupMocoOrderStandardizeSheet_(ss, sheet) {
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const name = uniqueSheetName_(ss, 'BACKUP_DON_HANG_STANDARDIZE_' + stamp);
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function findLatestMocoOrderStandardizeBackupSheet_(ss) {
  const prefix = 'BACKUP_DON_HANG_STANDARDIZE_';
  const matches = ss.getSheets()
    .map(sheet => sheet.getName())
    .filter(name => name.indexOf(prefix) === 0)
    .sort();
  if (!matches.length) return null;
  return ss.getSheetByName(matches[matches.length - 1]);
}

function MOCO_DEBUG_DASHBOARD_SNAPSHOT() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('DASHBOARD');
  if (!sheet) throw new Error('Không tìm thấy sheet DASHBOARD');
  const rows = Math.min(Math.max(sheet.getLastRow(), 1), 40);
  const cols = Math.min(Math.max(sheet.getLastColumn(), 1), 10);
  const range = sheet.getRange(1, 1, rows, cols);
  const display = range.getDisplayValues();
  const formulas = range.getFormulas();
  const errors = [];
  display.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (/^#/.test(String(value || '').trim())) {
        errors.push({
          cell: mocoColumnToLetter_(cIdx + 1) + (rIdx + 1),
          value,
          formula: formulas[rIdx][cIdx] || '',
        });
      }
    });
  });
  return {
    sheet: 'DASHBOARD',
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn(),
    checkedRange: 'A1:' + mocoColumnToLetter_(cols) + rows,
    errors,
    preview: display,
  };
}

function mocoColumnToLetter_(col) {
  let letter = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

function MOCO_DEBUG_MENU_SNAPSHOT() {
  const ss = getMocoSpreadsheet_();
  const menu = buildMocoOrderMenuMap_(ss);
  return {
    sheet: 'MENU & GIÁ',
    count: menu.rows.length,
    rows: menu.rows.map(row => ({
      sku: row.sku,
      onlineName: row.onlineName,
      recipeName: row.recipeName,
      spec: row.spec || row.rawSpec || '',
      price: row.price,
      status: row.status,
    })),
  };
}

function MOCO_APPLY_ORDER_UI_SAFE(dryRun) {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!sheet) throw new Error('Không tìm thấy sheet ĐƠN HÀNG');
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) {
    return { dryRun, updatedRows: 0, renamed: [], unmatched: [], note: 'ĐƠN HÀNG chưa có dòng dữ liệu.' };
  }

  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const map = getMocoOrderUiHeaderMap_(headers);
  const required = ['itemName', 'productionStatus', 'deliveryStatus', 'paymentStatus'];
  const missingHeaders = required.filter(key => map[key] < 0);
  if (missingHeaders.length) {
    throw new Error('Thiếu header trong ĐƠN HÀNG: ' + missingHeaders.join(', '));
  }

  const menuMap = buildMocoOrderMenuMap_(ss);
  const dataRows = lastRow - 1;
  const values = sheet.getRange(2, 1, dataRows, lastCol).getValues();
  const display = sheet.getRange(2, 1, dataRows, lastCol).getDisplayValues();
  const itemCol = map.itemName + 1;
  const skuCol = map.sku + 1;
  const noteCol = map.note + 1;
  const renamed = [];
  const unmatched = [];

  const itemValues = [];
  const skuValues = [];
  const noteValues = [];
  const itemBackgrounds = [];
  const statusBackgrounds = [];
  const statusFontColors = [];

  for (let i = 0; i < dataRows; i++) {
    const row = values[i] || [];
    const drow = display[i] || [];
    const rawName = String(drow[map.itemName] || row[map.itemName] || '').trim();
    const rawSku = map.sku >= 0 ? String(drow[map.sku] || row[map.sku] || '').trim() : '';
    const rawNote = map.note >= 0 ? String(drow[map.note] || row[map.note] || '').trim() : '';
    const match = findMocoOrderCanonicalMenu_(menuMap, rawName, rawSku);
    let finalName = rawName;
    let finalSku = rawSku;
    let finalNote = rawNote;

    if (match) {
      finalName = match.onlineName || match.recipeName || rawName;
      finalSku = match.sku || rawSku;
      finalNote = removeMocoOrderUiMarkerNote_(rawNote);
      if (rawName && normText_(rawName) !== normText_(finalName)) {
        renamed.push({ row: i + 2, from: rawName, to: finalName, sku: finalSku });
      } else if (!rawSku && finalSku) {
        renamed.push({ row: i + 2, from: rawName, to: finalName, sku: finalSku, type: 'filledSku' });
      }
    } else if (rawName) {
      finalNote = ensureMocoOrderUiMarkerNote_(rawNote);
      unmatched.push({ row: i + 2, name: rawName });
    }

    itemValues.push([finalName]);
    if (map.sku >= 0) skuValues.push([finalSku]);
    if (map.note >= 0) noteValues.push([finalNote]);
    itemBackgrounds.push([mocoOrderCakeColor_(finalName)]);

    const production = getMocoOrderStatusStyle_(row[map.productionStatus] || drow[map.productionStatus], 'production');
    const delivery = getMocoOrderStatusStyle_(row[map.deliveryStatus] || drow[map.deliveryStatus], 'delivery');
    const payment = getMocoOrderStatusStyle_(row[map.paymentStatus] || drow[map.paymentStatus], 'payment');
    statusBackgrounds.push([production.bg, delivery.bg, payment.bg]);
    statusFontColors.push([production.fg, delivery.fg, payment.fg]);
  }

  const summary = {
    dryRun,
    dataRows,
    renamedCount: renamed.length,
    unmatchedCount: unmatched.length,
    renamed: renamed.slice(0, 50),
    unmatched: unmatched.slice(0, 50),
    warnings: [],
    skuDecision: 'SKU/Menu không cần để founder nhập tay. Giữ làm khóa kỹ thuật, tự điền nếu match MENU & GIÁ và ẩn cột để UI gọn.',
    uiPolicy: 'Không clear/rebuild sheet; chỉ cập nhật giá trị tên/SKU/note, dropdown, màu cột Tên bánh và 3 cột tình trạng.',
  };
  if (dryRun) return summary;

  sheet.getRange(2, itemCol, dataRows, 1).setValues(itemValues);
  try {
    sheet.getRange(2, itemCol, dataRows, 1).setBackgrounds(itemBackgrounds);
  } catch (err) {
    summary.warnings.push('Không tô được màu cột Tên bánh: ' + err.message);
  }
  if (map.sku >= 0) {
    sheet.getRange(2, skuCol, dataRows, 1).setValues(skuValues);
    try {
      sheet.getRange(1, skuCol, Math.max(dataRows + 1, 2), 1).setBackground('#F1F3F4').setFontColor('#5F6368');
      sheet.hideColumns(skuCol, 1);
    } catch (err) {
      summary.warnings.push('Không ẩn/tô được cột SKU do table UI của Google Sheets: ' + err.message);
    }
  }
  if (map.note >= 0) sheet.getRange(2, noteCol, dataRows, 1).setValues(noteValues);

  const statusStartCol = Math.min(map.productionStatus, map.deliveryStatus, map.paymentStatus) + 1;
  try {
    if (statusStartCol > 0 && map.productionStatus + 1 === statusStartCol && map.deliveryStatus + 1 === statusStartCol + 1 && map.paymentStatus + 1 === statusStartCol + 2) {
      sheet.getRange(2, statusStartCol, dataRows, 3)
        .setBackgrounds(statusBackgrounds)
        .setFontColors(statusFontColors)
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
    } else {
      applyMocoOrderStatusColumnColors_(sheet, dataRows, map.productionStatus + 1, statusBackgrounds.map(row => [row[0]]), statusFontColors.map(row => [row[0]]));
      applyMocoOrderStatusColumnColors_(sheet, dataRows, map.deliveryStatus + 1, statusBackgrounds.map(row => [row[1]]), statusFontColors.map(row => [row[1]]));
      applyMocoOrderStatusColumnColors_(sheet, dataRows, map.paymentStatus + 1, statusBackgrounds.map(row => [row[2]]), statusFontColors.map(row => [row[2]]));
    }
  } catch (err) {
    summary.warnings.push('Không tô được màu 3 cột tình trạng: ' + err.message);
  }

  try {
    applyMocoOrderUiDropdowns_(ss, sheet, map, dataRows);
  } catch (err) {
    summary.warnings.push('Không áp dụng được dropdown vì sheet đang dùng typed columns/table UI: ' + err.message);
  }
  try {
    applyMocoOrderUiConditionalFormats_(sheet, map, dataRows, menuMap.rows);
  } catch (err) {
    summary.warnings.push('Không áp dụng được conditional formatting động: ' + err.message);
  }
  return summary;
}

function getMocoOrderUiHeaderMap_(headers) {
  const normalized = (headers || []).map(value => normText_(value));
  return {
    orderId: findMocoOrderUiHeaderIndex_(normalized, ['ma don', 'stt']),
    itemName: findMocoOrderUiHeaderIndex_(normalized, ['ten banh', 'ten mon']),
    sku: findMocoOrderUiHeaderIndex_(normalized, ['sku', 'sku menu']),
    productionStatus: findMocoOrderUiHeaderIndex_(normalized, ['tt san xuat', 'tinh trang san xuat', 'trang thai san xuat']),
    deliveryStatus: findMocoOrderUiHeaderIndex_(normalized, ['tt giao hang', 'tinh trang giao hang', 'trang thai giao hang']),
    paymentStatus: findMocoOrderUiHeaderIndex_(normalized, ['tt thanh toan', 'tinh trang thanh toan', 'trang thai thanh toan']),
    note: findMocoOrderUiHeaderIndex_(normalized, ['ghi chu']),
  };
}

function findMocoOrderUiHeaderIndex_(headers, candidates) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || '';
    if (candidates.some(candidate => header.indexOf(candidate) >= 0)) return i;
  }
  return -1;
}

function findMocoOrderCanonicalMenu_(menuMap, rawName, rawSku) {
  if (!menuMap || !rawName) return null;
  const rows = menuMap.rows || [];
  if (rawSku) {
    const skuMatch = rows.find(row => normText_(row.sku) === normText_(rawSku));
    if (skuMatch) return skuMatch;
  }
  const exact = findMocoOrderMenuMatch_(menuMap, rawName);
  if (exact) return exact;
  const key = normText_(rawName);
  if (!key) return null;

  if (key.indexOf('cheese') >= 0 || key.indexOf('cheesecake') >= 0) {
    if (key.indexOf('10') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, 'MOCO-003-10', ['cheesecake 10', 'cheese cake 10']);
    if (key.indexOf('12') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, 'MOCO-003-12', ['cheesecake 12', 'cheese cake 12']);
    if (key.indexOf('14') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, 'MOCO-003-14', ['cheesecake 14', 'cheese cake 14']);
    if (key.indexOf('16') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, 'MOCO-003-16', ['cheesecake 16', 'cheese cake 16']);
  }
  if (key.indexOf('soda') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, '', ['soda']);
  if (key.indexOf('chuoi') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, '', ['chuoi']);
  if (key.indexOf('cuon que') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, '', ['cuon que']);
  if (key.indexOf('tiramisu') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, '', ['tiramisu']);
  if (key.indexOf('bong lan trung muoi') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, '', ['bong lan trung muoi']);
  if (key.indexOf('ca rot') >= 0 || key.indexOf('carrot') >= 0) return findMocoOrderMenuBySkuOrNeedle_(rows, '', ['carrot', 'ca rot']);
  return null;
}

function findMocoOrderMenuBySkuOrNeedle_(rows, sku, needles) {
  if (sku) {
    const bySku = rows.find(row => normText_(row.sku) === normText_(sku));
    if (bySku) return bySku;
  }
  const normalizedNeedles = (needles || []).map(value => normText_(value));
  return rows.find(row => {
    const haystack = normText_([row.onlineName, row.recipeName, row.sku].join(' '));
    return normalizedNeedles.some(needle => haystack.indexOf(needle) >= 0);
  }) || null;
}

function removeMocoOrderUiMarkerNote_(note) {
  return String(note || '')
    .replace(/Chưa match MENU & GIÁ/g, '')
    .replace(/\s+\|\s+$/g, '')
    .replace(/^\s+\|\s+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function ensureMocoOrderUiMarkerNote_(note) {
  const raw = String(note || '').trim();
  if (!raw) return 'Chưa match MENU & GIÁ';
  return raw.indexOf('Chưa match MENU & GIÁ') >= 0 ? raw : raw + ' | Chưa match MENU & GIÁ';
}

function mocoOrderCakeColor_(name) {
  const key = normText_(name);
  if (key.indexOf('chuoi') >= 0) return '#FFF7D6';
  if (key.indexOf('cuon que') >= 0) return '#FCE4D6';
  if (key.indexOf('soda') >= 0) return '#E2F0D9';
  if (key.indexOf('tiramisu') >= 0) return '#EADCF8';
  if (key.indexOf('cheesecake 10') >= 0 || key.indexOf('cheese cake 10') >= 0) return '#DDEBFF';
  if (key.indexOf('cheesecake 12') >= 0 || key.indexOf('cheese cake 12') >= 0) return '#E6F4EA';
  if (key.indexOf('cheesecake 14') >= 0 || key.indexOf('cheese cake 14') >= 0) return '#FFF2CC';
  if (key.indexOf('cheesecake 16') >= 0 || key.indexOf('cheese cake 16') >= 0) return '#F4CCCC';
  if (key.indexOf('bong lan trung muoi') >= 0) return '#FFE5B4';
  if (key.indexOf('ca rot') >= 0 || key.indexOf('carrot') >= 0) return '#FAD7A0';
  const palette = ['#E8F0FE', '#E6F4EA', '#FEF7E0', '#FCE8E6', '#F3E8FD', '#E0F7FA'];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % palette.length;
  return palette[hash];
}

function getMocoOrderStatusStyle_(value, type) {
  const key = normText_(value);
  const neutral = { bg: '#F1F3F4', fg: '#5F6368' };
  if (key.indexOf('huy') >= 0 || key.indexOf('hoan tien') >= 0) return { bg: '#F4CCCC', fg: '#A50E0E' };
  if (type === 'production') {
    if (key === normText_('Xong')) return { bg: '#D9EAD3', fg: '#137333' };
    if (key === normText_('Đang làm')) return { bg: '#FFF2CC', fg: '#8A4B00' };
    return neutral;
  }
  if (type === 'delivery') {
    if (key === normText_('Đã giao')) return { bg: '#D9EAD3', fg: '#137333' };
    if (key === normText_('Đang giao')) return { bg: '#DDEBFF', fg: '#174EA6' };
    return neutral;
  }
  if (type === 'payment') {
    if (key === normText_('Đã nhận tiền')) return { bg: '#D9EAD3', fg: '#137333' };
    if (key === normText_('Đã cọc')) return { bg: '#FFF2CC', fg: '#8A4B00' };
    if (key === normText_('Chưa thanh toán')) return { bg: '#FCE8E6', fg: '#A50E0E' };
  }
  return neutral;
}

function applyMocoOrderStatusColumnColors_(sheet, dataRows, col, backgrounds, fontColors) {
  if (!col || dataRows <= 0) return;
  sheet.getRange(2, col, dataRows, 1)
    .setBackgrounds(backgrounds)
    .setFontColors(fontColors)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
}

function applyMocoOrderUiDropdowns_(ss, sheet, map, dataRows) {
  if (dataRows <= 0) return;
  applyMocoDropdownNamedRange_(sheet, 2, map.itemName + 1, dataRows, ss, 'LIST_MENU_NAMES', true, 'Chọn tên bánh chuẩn từ MENU & GIÁ.');
  if (map.sku >= 0) applyMocoDropdownNamedRange_(sheet, 2, map.sku + 1, dataRows, ss, 'LIST_MENU_SKU', true, 'SKU kỹ thuật, tự điền theo tên bánh nếu match.');
  applyMocoDropdownList_(sheet, 2, map.productionStatus + 1, dataRows, ['Chưa làm', 'Đang làm', 'Xong', 'Hủy'], false);
  applyMocoDropdownList_(sheet, 2, map.deliveryStatus + 1, dataRows, ['Chưa giao', 'Đang giao', 'Đã giao', 'Hủy'], false);
  applyMocoDropdownList_(sheet, 2, map.paymentStatus + 1, dataRows, ['Chưa thanh toán', 'Đã cọc', 'Đã nhận tiền', 'Hoàn tiền/Hủy'], false);
}

function applyMocoOrderUiConditionalFormats_(sheet, map, dataRows, menuRows) {
  if (dataRows <= 0) return;
  const rules = sheet.getConditionalFormatRules();
  const itemRange = sheet.getRange(2, map.itemName + 1, dataRows, 1);
  const prodRange = sheet.getRange(2, map.productionStatus + 1, dataRows, 1);
  const deliveryRange = sheet.getRange(2, map.deliveryStatus + 1, dataRows, 1);
  const paymentRange = sheet.getRange(2, map.paymentStatus + 1, dataRows, 1);
  const nextRules = rules.slice();

  uniqueMocoList_((menuRows || []).map(row => row.onlineName || row.recipeName).filter(Boolean)).forEach(name => {
    nextRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(name)
      .setBackground(mocoOrderCakeColor_(name))
      .setRanges([itemRange])
      .build());
  });

  [
    { value: 'Chưa làm', range: prodRange, style: getMocoOrderStatusStyle_('Chưa làm', 'production') },
    { value: 'Đang làm', range: prodRange, style: getMocoOrderStatusStyle_('Đang làm', 'production') },
    { value: 'Xong', range: prodRange, style: getMocoOrderStatusStyle_('Xong', 'production') },
    { value: 'Hủy', range: prodRange, style: getMocoOrderStatusStyle_('Hủy', 'production') },
    { value: 'Chưa giao', range: deliveryRange, style: getMocoOrderStatusStyle_('Chưa giao', 'delivery') },
    { value: 'Đang giao', range: deliveryRange, style: getMocoOrderStatusStyle_('Đang giao', 'delivery') },
    { value: 'Đã giao', range: deliveryRange, style: getMocoOrderStatusStyle_('Đã giao', 'delivery') },
    { value: 'Hủy', range: deliveryRange, style: getMocoOrderStatusStyle_('Hủy', 'delivery') },
    { value: 'Chưa thanh toán', range: paymentRange, style: getMocoOrderStatusStyle_('Chưa thanh toán', 'payment') },
    { value: 'Đã cọc', range: paymentRange, style: getMocoOrderStatusStyle_('Đã cọc', 'payment') },
    { value: 'Đã nhận tiền', range: paymentRange, style: getMocoOrderStatusStyle_('Đã nhận tiền', 'payment') },
    { value: 'Hoàn tiền/Hủy', range: paymentRange, style: getMocoOrderStatusStyle_('Hoàn tiền/Hủy', 'payment') },
  ].forEach(rule => {
    nextRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(rule.value)
      .setBackground(rule.style.bg)
      .setFontColor(rule.style.fg)
      .setRanges([rule.range])
      .build());
  });

  sheet.setConditionalFormatRules(nextRules);
}

function MOCO_IMPORT_PUBLIC_SOURCE_TABS(options) {
  const opts = options || {};
  const sourceSpreadsheetId = String(opts.sourceSpreadsheetId || '').trim();
  const sourceTabsData = opts.sourceTabsData || null;
  if (!sourceSpreadsheetId && !sourceTabsData) throw new Error('Missing sourceSpreadsheetId or sourceTabsData');
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const report = {
    dryRun,
    mode: 'merge_only_no_tab_overwrite',
    sourceSpreadsheetId,
    imported: [],
    backups: [],
    rebuilt: [],
    warnings: [],
  };

  const sourceTabs = [
    { source: 'Don dat hang', sourceSheetName: 'Đơn đặt hàng', target: 'ĐƠN HÀNG', mode: 'orders' },
    { source: 'Thu - Chi', sourceSheetName: 'Thu - Chi', target: 'THU CHI', mode: 'thu_chi' },
    { source: 'NHAP HANG', sourceSheetName: 'NHẬP HÀNG', target: 'NHẬP HÀNG', mode: 'nhap_hang' },
    { source: 'TTB', sourceSheetName: 'TTB', target: 'TTB', mode: 'direct' },
    { source: 'NVL', sourceSheetName: 'NVL', target: 'NVL', mode: 'direct' },
  ];

  const staged = sourceTabs.map(spec => {
    const providedValues = sourceTabsData && (sourceTabsData[spec.sourceSheetName] || sourceTabsData[spec.mode] || sourceTabsData[spec.target]);
    const values = providedValues
      ? normalizeMocoImportedRows_(providedValues)
      : fetchMocoPublicSourceCsv_(sourceSpreadsheetId, spec.sourceSheetName);
    const nonEmptyRows = values.filter(row => row.some(cell => String(cell || '').trim())).length;
    const width = values.reduce((max, row) => Math.max(max, row.length), 0);
    const stagingName = 'SOURCE_' + spec.mode.toUpperCase() + '_' + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    report.imported.push({
      sourceSheet: spec.sourceSheetName,
      targetSheet: spec.target,
      mode: spec.mode,
      rows: values.length,
      nonEmptyRows,
      columns: width,
      stagingSheet: dryRun ? '' : stagingName,
    });
    return Object.assign({}, spec, { values, nonEmptyRows, width, stagingName });
  });

  if (dryRun) return report;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for write action: ' + requiredConfirm);

  staged.forEach(spec => {
    const staging = writeMocoSourceStagingSheet_(ss, spec.stagingName, spec.values);
    try { staging.hideSheet(); } catch (err) {}

    if (spec.mode === 'orders') {
      const target = ss.getSheetByName(spec.target);
      if (!target) throw new Error('Target sheet not found: ' + spec.target);
      const menuMap = buildMocoOrderMenuMap_(ss);
      const sourceValues = staging.getDataRange().getValues();
      const sourceDisplay = staging.getDataRange().getDisplayValues();
      const migration = migrateMocoLegacyOrderRows_(sourceValues, sourceDisplay, menuMap);
      const targetValues = target.getDataRange().getValues();
      const targetDisplay = target.getDataRange().getDisplayValues();
      const current = readMocoStandardOrderRowsForAudit_(targetValues, targetDisplay).rows;
      const existingOrderIds = current.reduce((out, row) => {
        const id = String(row[0] || '').trim();
        if (id) out[id] = true;
        return out;
      }, {});
      const missing = migration.rows.filter(row => {
        const id = String(row[0] || '').trim();
        return id && !existingOrderIds[id];
      });
      if (missing.length) {
        report.backups.push({ sheet: spec.target, backup: backupMocoOrderStandardizeSheet_(ss, target) });
        const writeResult = writeMocoStandardOrderSheetPlain_(ss, target, current.concat(missing));
        if (writeResult && writeResult.warnings && writeResult.warnings.length) {
          report.warnings = report.warnings.concat(writeResult.warnings.slice(0, 20));
        }
      }
      report.rebuilt.push({
        sheet: spec.target,
        sourceRows: migration.rows.length,
        existingRows: current.length,
        appendedRows: missing.length,
        appendedOrderIds: missing.reduce((out, row) => {
          const id = String(row[0] || '').trim();
          if (id && out.indexOf(id) < 0) out.push(id);
          return out;
        }, []),
        warnings: migration.warnings.slice(0, 20),
      });
      if (migration.warnings.length) report.warnings = report.warnings.concat(migration.warnings.slice(0, 20));
      return;
    }

    if (spec.mode === 'thu_chi') {
      const result = MOCO_RECONCILE_THU_CHI_FROM_COPY(false, staging.getName());
      report.backups.push({ sheet: spec.target, backup: result.backupSheet || '' });
      report.rebuilt.push({
        sheet: spec.target,
        importedFounderRows: result.importedFounderRows,
        keptOrderSyncRows: result.keptOrderSyncRows,
        resultRows: result.resultRows,
        resultTotals: result.resultTotals,
      });
      return;
    }

    if (spec.mode === 'nhap_hang') {
      const target = ss.getSheetByName(spec.target);
      if (!target) throw new Error('Target sheet not found: ' + spec.target);
      const sourceRecords = normalizeRows_(staging.getDataRange().getValues(), staging.getDataRange().getDisplayValues());
      const currentRecords = readMocoCurrentNhapHangRecords_(target);
      const existingKeys = currentRecords.reduce((out, row) => {
        out[buildMocoNhapHangMergeKey_(row)] = true;
        return out;
      }, {});
      const missing = sourceRecords.filter(row => {
        const key = buildMocoNhapHangMergeKey_(row);
        return key && !existingKeys[key];
      });
      if (missing.length) {
        const backupName = createBackup_(ss, target);
        const merged = currentRecords.concat(missing);
        writeTable_(target, merged, { preserveUi: true });
        setupHistoryUi_(target, merged, { preserveUi: true });
        MOCO_REFRESH_HISTORY();
        report.backups.push({ sheet: spec.target, backup: backupName });
      }
      report.rebuilt.push({
        sheet: spec.target,
        sourceRecords: sourceRecords.length,
        existingRecords: currentRecords.length,
        appendedRows: missing.length,
      });
      return;
    }

    const target = ss.getSheetByName(spec.target) || ss.insertSheet(spec.target);
    const currentValues = target.getDataRange().getValues();
    const merge = buildMocoDirectAppendRows_(currentValues, spec.values);
    if (merge.rows.length) {
      const backupName = copyMocoSheetBackup_(ss, target, 'BACKUP_IMPORT_' + spec.target.replace(/[^\w]+/g, '_') + '_');
      const startRow = Math.max(target.getLastRow() + 1, 2);
      const width = Math.max(target.getLastColumn(), merge.width);
      if (target.getMaxColumns() < width) target.insertColumnsAfter(target.getMaxColumns(), width - target.getMaxColumns());
      if (target.getMaxRows() < startRow + merge.rows.length - 1) {
        target.insertRowsAfter(target.getMaxRows(), startRow + merge.rows.length - 1 - target.getMaxRows());
      }
      target.getRange(startRow, 1, merge.rows.length, width).setValues(padMocoRows_(merge.rows, width));
      report.backups.push({ sheet: spec.target, backup: backupName });
    }
    report.rebuilt.push({ sheet: spec.target, sourceRows: spec.values.length, appendedRows: merge.rows.length, copiedColumns: merge.width });
  });

  if (typeof MOCO_REFRESH_MASTER_NVL === 'function') {
    try {
      MOCO_REFRESH_MASTER_NVL();
      report.rebuilt.push({ sheet: 'Master NVL', action: 'refresh_master_nvl' });
    } catch (err) {
      report.warnings.push('Khong refresh duoc Master NVL sau merge: ' + err.message);
    }
  }
  if (typeof MOCO_BUILD_ONLINE_BAKERY_WORKFLOW === 'function') {
    try {
      MOCO_BUILD_ONLINE_BAKERY_WORKFLOW();
      report.rebuilt.push({ action: 'build_online_bakery_workflow' });
    } catch (err) {
      report.warnings.push('Khong build duoc workflow sau merge: ' + err.message);
    }
  } else if (typeof MOCO_UPDATE_ALL_DATA === 'function') {
    try {
      MOCO_UPDATE_ALL_DATA();
      report.rebuilt.push({ action: 'update_all_data' });
    } catch (err) {
      report.warnings.push('Khong update duoc all data sau merge: ' + err.message);
    }
  }

  return report;
}

function MOCO_REPAIR_PUBLIC_SOURCE_MERGE(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const restorePlan = [
    { target: 'NHẬP HÀNG', backup: 'BACKUP_20260527_235336' },
    { target: 'TTB', backupPrefix: 'BACKUP_IMPORT_TTB_20260527_2353' },
    { target: 'NVL', backupPrefix: 'BACKUP_IMPORT_NVL_20260527_2353' },
  ];
  const report = {
    dryRun,
    restored: [],
    merge: null,
  };

  restorePlan.forEach(item => {
    const target = ss.getSheetByName(item.target);
    const backup = item.backup ? ss.getSheetByName(item.backup) : findMocoSheetByPrefix_(ss, item.backupPrefix);
    if (!target) throw new Error('Target sheet not found: ' + item.target);
    if (!backup) throw new Error('Backup sheet not found for: ' + item.target);
    const values = backup.getDataRange().getValues();
    report.restored.push({
      target: item.target,
      backup: backup.getName(),
      rows: values.length,
      columns: values.reduce((max, row) => Math.max(max, row.length), 0),
    });
    if (!dryRun) {
      if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for repair action: ' + requiredConfirm);
      writeMocoPlainValuesToSheet_(target, values);
    }
  });

  if (!dryRun && opts.sourceTabsData) {
    report.merge = MOCO_IMPORT_PUBLIC_SOURCE_TABS({
      dryRun: false,
      confirm: requiredConfirm,
      sourceTabsData: opts.sourceTabsData,
    });
  }
  return report;
}

function MOCO_REPAIR_DIRECT_SOURCE_TABS(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const sourceSpreadsheetId = String(opts.sourceSpreadsheetId || '').trim();
  const sourceTabsData = opts.sourceTabsData || {};
  const requestedTabs = Array.isArray(opts.tabs) && opts.tabs.length
    ? opts.tabs
    : ['TTB', 'NVL'];
  const allowedTabs = { TTB: true, NVL: true };
  const report = {
    dryRun,
    repaired: [],
    skipped: [],
    warnings: [],
  };

  requestedTabs.forEach(tabName => {
    const targetName = String(tabName || '').trim();
    if (!allowedTabs[targetName]) {
      report.warnings.push('Skipped unsupported direct tab: ' + targetName);
      return;
    }
    const providedValues = sourceTabsData[targetName] || null;
    const sourceValues = normalizeMocoImportedRows_(providedValues || (sourceSpreadsheetId ? fetchMocoPublicSourceCsv_(sourceSpreadsheetId, targetName) : []));
    if (!sourceValues.length) {
      report.warnings.push('Missing source data for direct tab: ' + targetName);
      return;
    }
    const target = ss.getSheetByName(targetName) || ss.insertSheet(targetName);
    const currentValues = target.getDataRange().getValues();
    const audit = auditMocoDirectSourceTab_(targetName, currentValues, sourceValues);
    if (!audit.repairNeeded) {
      report.skipped.push(audit);
      return;
    }
    if (dryRun) {
      report.repaired.push(audit);
      return;
    }
    if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for direct tab repair: ' + requiredConfirm);
    audit.backup = copyMocoSheetBackup_(ss, target, 'BACKUP_REPAIR_' + targetName + '_');
    writeMocoPlainValuesToSheet_(target, sourceValues);
    try {
      target.setFrozenRows(1);
      target.getRange(1, 1, 1, Math.max(sourceValues[0].length, 1))
        .setFontWeight('bold')
        .setBackground('#E8F0FE');
    } catch (err) {
      audit.formatWarning = err.message;
    }
    report.repaired.push(audit);
  });

  return report;
}

function auditMocoDirectSourceTab_(tabName, currentValues, sourceValues) {
  const currentHeader = (currentValues[0] || []).map(cell => String(cell || '').trim());
  const sourceHeader = (sourceValues[0] || []).map(cell => String(cell || '').trim());
  const currentRows = (currentValues || []).filter(row => row.some(cell => String(cell || '').trim())).length;
  const sourceRows = (sourceValues || []).filter(row => row.some(cell => String(cell || '').trim())).length;
  const headerMismatch = normalizeMocoHeaderRow_(currentHeader) !== normalizeMocoHeaderRow_(sourceHeader);
  const rowGap = Math.abs(currentRows - sourceRows);
  const suspiciousFirstCell = tabName === 'NVL'
    && normText_(currentHeader[0]).indexOf('ten nvl') < 0
    && normText_(sourceHeader[0]).indexOf('ten nvl') >= 0;
  return {
    sheet: tabName,
    repairNeeded: headerMismatch || suspiciousFirstCell || rowGap > 3,
    headerMismatch,
    suspiciousFirstCell,
    currentRows,
    sourceRows,
    rowGap,
    currentHeader: currentHeader.slice(0, 10),
    sourceHeader: sourceHeader.slice(0, 10),
  };
}

function normalizeMocoHeaderRow_(headers) {
  const normalized = (headers || []).slice(0, 10).map(cell => normText_(cell));
  while (normalized.length && !normalized[normalized.length - 1]) normalized.pop();
  return normalized.join('|');
}

function MOCO_DEDUPE_NHAP_HANG_MERGE_KEYS(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('NHẬP HÀNG');
  if (!sheet) throw new Error('Target sheet not found: NHẬP HÀNG');

  const records = readMocoCurrentNhapHangRecords_(sheet);
  const seen = {};
  const deduped = [];
  const removed = [];
  records.forEach((row, idx) => {
    const key = buildMocoNhapHangMergeKey_(row);
    if (key && seen[key]) {
      removed.push({ row: idx + 2, key, item: row[1], price: row[7] });
      return;
    }
    if (key) seen[key] = true;
    deduped.push(row);
  });

  const report = {
    dryRun,
    sheet: 'NHẬP HÀNG',
    beforeRows: records.length,
    afterRows: deduped.length,
    removedRows: removed.length,
    removedSample: removed.slice(0, 30),
    backup: '',
  };
  if (dryRun || !removed.length) return report;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for dedupe action: ' + requiredConfirm);

  report.backup = createBackup_(ss, sheet);
  writeTable_(sheet, deduped, { preserveUi: true });
  try {
    setupHistoryUi_(sheet, deduped, { preserveUi: true });
  } catch (err) {
    report.historyWarning = err.message;
  }
  try {
    MOCO_REFRESH_HISTORY();
  } catch (err) {
    report.refreshWarning = err.message;
  }
  return report;
}

function MOCO_DEDUPE_NHAP_HANG_STRICT_KEYS(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('NHẬP HÀNG');
  if (!sheet) throw new Error('Target sheet not found: NHẬP HÀNG');

  const records = readMocoCurrentNhapHangRecords_(sheet);
  const seen = {};
  const deduped = [];
  const removed = [];
  records.forEach((row, idx) => {
    const key = buildMocoNhapHangStrictKey_(row);
    if (key && seen[key]) {
      removed.push({ row: idx + 2, key, item: row[1], date: row[0], price: row[7] });
      return;
    }
    if (key) seen[key] = true;
    deduped.push(row);
  });

  const report = {
    dryRun,
    sheet: 'NHẬP HÀNG',
    mode: 'strict_date_name_qty_pack_unit_price',
    beforeRows: records.length,
    afterRows: deduped.length,
    removedRows: removed.length,
    removedSample: removed.slice(0, 30),
    backup: '',
  };
  if (dryRun || !removed.length) return report;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for strict dedupe action: ' + requiredConfirm);

  report.backup = createBackup_(ss, sheet);
  writeTable_(sheet, deduped, { preserveUi: true });
  try {
    setupHistoryUi_(sheet, deduped, { preserveUi: true });
  } catch (err) {
    report.historyWarning = err.message;
  }
  try {
    MOCO_REFRESH_HISTORY();
  } catch (err) {
    report.refreshWarning = err.message;
  }
  return report;
}

function buildMocoNhapHangStrictKey_(row) {
  if (!row) return '';
  const date = normalizeMocoMergeCell_(row[0]);
  const name = normalizeMocoMergeItemName_(row[1] || '');
  const qty = normalizeMocoMergeCell_(row[4]);
  const pack = normalizeMocoMergeCell_(row[5]);
  const unit = normalizeMocoMergeCell_(row[6]);
  const price = normalizeMocoMergeCell_(row[7]);
  if (!date && !name && !price) return '';
  return [date, name, qty, pack, unit, price].join('|');
}

function MOCO_VALIDATE_NHAP_HANG_AI_FIX(options) {
  const opts = options || {};
  const dryRun = opts.dryRun !== false;
  const confirm = String(opts.confirm || '');
  const requiredConfirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('NHẬP HÀNG');
  if (!sheet) throw new Error('Target sheet not found: NHẬP HÀNG');

  const records = readMocoCurrentNhapHangRecords_(sheet);
  const masterSheet = ss.getSheetByName('Master NVL');
  const master = buildMocoNhapHangMasterLookup_(masterSheet);
  const report = {
    dryRun,
    beforeRows: records.length,
    afterRows: 0,
    fixedRows: 0,
    movedToReviewRows: 0,
    fixedSample: [],
    reviewSample: [],
    backup: '',
    reviewSheet: 'AI VALIDATE REVIEW',
  };
  const fixed = [];
  const review = [];

  records.forEach((row, index) => {
    const next = row.slice(0, 10);
    while (next.length < 10) next.push('');
    const original = next.join('\u0001');
    const rowNumber = index + 2;
    const nameKey = normText_(next[1]);
    const hasPrice = Number(next[7] || 0) > 0;
    const hasQty = Number(next[4] || 0) > 0;

    applyMocoAiNameCanonical_(next, master);
    applyMocoAiCategoryAndUnit_(next, master);
    if (!hasQty && hasPrice && shouldMocoAiDefaultQtyOne_(nameKey)) next[4] = 1;
    if (!next[6]) next[6] = inferMocoAiMissingUnit_(next[1], next[3], next[5]);
    if (!next[3]) next[3] = inferMocoAiCategory_(next[1]);

    const finalHasPrice = Number(next[7] || 0) > 0;
    const finalHasQty = Number(next[4] || 0) > 0;
    const finalHasUnit = String(next[6] || '').trim() !== '';
    const finalUnitKey = normText_(next[6]);
    const finalNeedsPack = finalUnitKey === 'g' || finalUnitKey === 'ml';
    const finalHasPack = !finalNeedsPack || Number(next[5] || 0) > 0;
    if (!finalHasPrice || !finalHasQty || !finalHasUnit || !finalHasPack) {
      review.push([
        rowNumber,
        'Cần duyệt tay',
        finalHasPrice ? '' : 'Thiếu giá nhập',
        finalHasQty ? '' : 'Thiếu SL',
        finalHasUnit ? (finalHasPack ? '' : 'Thiếu quy cách') : 'Thiếu đơn vị',
      ].concat(next));
      report.reviewSample.push({ row: rowNumber, item: next[1], reason: [finalHasPrice ? '' : 'missing_price', finalHasQty ? '' : 'missing_qty', finalHasUnit ? '' : 'missing_unit', finalHasPack ? '' : 'missing_pack'].filter(Boolean).join(',') });
      return;
    }

    next[8] = calcBaseUnitPrice_(next[7], next[4], next[5], next[6]) || '';
    next[9] = removeMocoAiReviewNotes_(next[9]);
    fixed.push(next);
    if (next.join('\u0001') !== original) {
      report.fixedRows += 1;
      if (report.fixedSample.length < 30) report.fixedSample.push({ row: rowNumber, from: row, to: next });
    }
  });

  report.afterRows = fixed.length;
  report.movedToReviewRows = review.length;
  if (dryRun) return report;
  if (confirm !== requiredConfirm) throw new Error('Missing confirm phrase for AI validate action: ' + requiredConfirm);

  report.backup = createBackup_(ss, sheet);
  writeTable_(sheet, fixed, { preserveUi: true });
  try {
    setupHistoryUi_(sheet, fixed, { preserveUi: true });
  } catch (err) {
    report.historyWarning = err.message;
  }
  writeMocoAiValidateReview_(ss, report.reviewSheet, review);
  try {
    MOCO_REFRESH_HISTORY();
  } catch (err) {
    report.refreshWarning = err.message;
  }
  if (typeof MOCO_REFRESH_MASTER_NVL === 'function') {
    try { MOCO_REFRESH_MASTER_NVL(); } catch (err) { report.masterWarning = err.message; }
  }
  return report;
}

function buildMocoNhapHangMasterLookup_(sheet) {
  const out = { byKey: {}, categories: {}, units: {} };
  if (!sheet || sheet.getLastRow() < 2) return out;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.min(sheet.getLastColumn(), 12)).getValues();
  values.forEach(row => {
    const name = String(row[1] || '').trim();
    if (!name) return;
    const key = normText_(name);
    out.byKey[key] = name;
    out.categories[key] = row[2] || '';
    out.units[key] = row[4] || '';
    String(row[9] || '').split(/[;,|]/).forEach(alias => {
      const aliasKey = normText_(alias);
      if (aliasKey) {
        out.byKey[aliasKey] = name;
        out.categories[aliasKey] = row[2] || '';
        out.units[aliasKey] = row[4] || '';
      }
    });
  });
  return out;
}

function applyMocoAiNameCanonical_(row, master) {
  const key = normText_(row[1]);
  const aliases = {
    whipping: 'Whipping Cream',
    'whipping cream coconus': 'Whipping Cream',
    creamcheese: 'Cream Cheese',
    'cream cheese anchor 1kg': 'Cream Cheese',
    'cream cheese dairymont': 'Cream Cheese',
    'cream cheese dairymont 2kg': 'Cream Cheese',
    mascapone: 'Mascarpone',
    trung: 'Trứng gà',
    carot: 'Cà rốt',
    'bot bap': 'bột ngô',
    'bot mi so 8': 'Bột mỳ số 8',
    'bot my so 8': 'Bột mỳ số 8',
    'bot mi so 13': 'bột mì số 13',
    'bot my so 13': 'bột mì số 13',
    'duon tao nhat': 'Đường trehalose',
    'duong tao nhat': 'Đường trehalose',
    'gelatin la': 'Gelatin',
    giam: 'dấm',
  };
  const target = aliases[key] || '';
  const targetKey = normText_(target);
  if (target && master.byKey[targetKey]) row[1] = master.byKey[targetKey];
  else if (master.byKey[key]) row[1] = master.byKey[key];
}

function applyMocoAiCategoryAndUnit_(row, master) {
  const key = normText_(row[1]);
  if (master.categories[key]) row[3] = master.categories[key];
  if (!row[6] && isMocoAiAllowedUnit_(master.units[key])) row[6] = master.units[key];
}

function applyMocoAiCategoryAndUnitFallback_(row) {
  if (!row[3]) row[3] = inferMocoAiCategory_(row[1]);
  if (!row[6]) row[6] = inferMocoAiMissingUnit_(row[1], row[3], row[5]);
}

function inferMocoAiCategory_(name) {
  const key = normText_(name);
  if (key.indexOf('tem') >= 0 || key.indexOf('in ') >= 0) return 'In ấn/tem nhãn';
  if (key.indexOf('hoa trang tri') >= 0 || key.indexOf('vai chup') >= 0) return 'Decor/chụp ảnh';
  return classifyItem_(name);
}

function inferMocoAiMissingUnit_(name, category, packSize) {
  const key = normText_(name);
  if (packSize && (key.indexOf('ca rot') >= 0 || key.indexOf('chanh') >= 0 || key.indexOf('sua chua') >= 0)) return 'g';
  if (key.indexOf('chuoi') >= 0 || key.indexOf('chanh') >= 0) return 'quả';
  if (key.indexOf('sua chua') >= 0) return 'hộp';
  if (key.indexOf('hoa trang tri') >= 0 || key.indexOf('mua nvl') >= 0) return 'set';
  if (key.indexOf('tem') >= 0 || key.indexOf('hop giay') >= 0 || key.indexOf('mica') >= 0 || key.indexOf('bang keo') >= 0) return 'cái';
  if (category === 'Bao bì' || category === 'Dụng cụ' || category === 'Decor/chụp ảnh' || category === 'Vận hành' || category === 'Khác') return 'cái';
  return '';
}

function isMocoAiAllowedUnit_(unit) {
  const key = normText_(unit || '');
  return ['g', 'ml', 'kg', 'l', 'qua', 'cai', 'bo', 'tui', 'goi', 'hop', 'chai', 'la', 'set', 'chiec', 'o', 'phan'].indexOf(key) >= 0;
}

function shouldMocoAiDefaultQtyOne_(nameKey) {
  return nameKey.indexOf('mua nvl') >= 0
    || nameKey.indexOf('hoa trang tri') >= 0
    || nameKey.indexOf('hop giay') >= 0;
}

function removeMocoAiReviewNotes_(note) {
  return String(note || '')
    .split('|')
    .map(part => part.trim())
    .filter(part => part && part.indexOf('Cần kiểm tra') < 0)
    .join(' | ');
}

function writeMocoAiValidateReview_(ss, name, rows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const header = ['Dòng gốc', 'Trạng thái', 'Thiếu giá', 'Thiếu SL', 'Thiếu đơn vị'].concat(HEADERS);
  const values = [header].concat(rows || []);
  writeMocoPlainValuesToSheet_(sheet, values);
  try {
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold').setBackground('#FCE8E6');
  } catch (err) {}
}

function findMocoSheetByPrefix_(ss, prefix) {
  const matches = ss.getSheets()
    .map(sheet => sheet.getName())
    .filter(name => String(name).indexOf(prefix) === 0)
    .sort();
  return matches.length ? ss.getSheetByName(matches[matches.length - 1]) : null;
}

function fetchMocoPublicSourceCsv_(spreadsheetId, sheetName) {
  if (typeof Sheets === 'undefined' || !Sheets.Spreadsheets || !Sheets.Spreadsheets.Values) {
    throw new Error('Advanced Sheets service is not enabled in Apps Script.');
  }
  const range = "'" + String(sheetName).replace(/'/g, "''") + "'!A:AZ";
  const result = Sheets.Spreadsheets.Values.get(spreadsheetId, range, {
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
  });
  return normalizeMocoImportedRows_(result.values || []);
}

function normalizeMocoImportedRows_(rows) {
  const width = (rows || []).reduce((max, row) => Math.max(max, row.length), 0);
  return (rows || []).map(row => {
    const out = row.slice();
    while (out.length < width) out.push('');
    return out;
  });
}

function readMocoCurrentNhapHangRecords_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const width = Math.min(Math.max(sheet.getLastColumn(), 10), 10);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  return values
    .filter(row => row.slice(0, 10).some(cell => String(cell || '').trim()))
    .map(row => {
      const out = row.slice(0, 10);
      while (out.length < 10) out.push('');
      return out;
    });
}

function buildMocoNhapHangMergeKey_(row) {
  if (!row) return '';
  const name = normalizeMocoMergeItemName_(row[1] || '');
  const qty = normalizeMocoMergeCell_(row[4]);
  const pack = normalizeMocoMergeCell_(row[5]);
  const unit = normalizeMocoMergeCell_(row[6]);
  const price = normalizeMocoMergeCell_(row[7]);
  if (!name && !price) return '';
  return [name, qty, pack, unit, price].join('|');
}

function buildMocoDirectAppendRows_(currentValues, sourceValues) {
  const currentKeys = (currentValues || []).slice(1).reduce((out, row) => {
    const key = buildMocoDirectRowKey_(row);
    if (key) out[key] = true;
    return out;
  }, {});
  const rows = [];
  (sourceValues || []).slice(1).forEach(row => {
    if (!row.some(cell => String(cell || '').trim())) return;
    const key = buildMocoDirectRowKey_(row);
    if (!key || currentKeys[key]) return;
    currentKeys[key] = true;
    rows.push(row);
  });
  return {
    rows,
    width: rows.reduce((max, row) => Math.max(max, row.length), 1),
  };
}

function buildMocoDirectRowKey_(row) {
  const source = row || [];
  const values = [source[0], source[1], source[2], source[4], source[5], source[6]]
    .map(value => normalizeMocoMergeCell_(value));
  if (!values.some(Boolean)) return '';
  return values.join('|');
}

function normalizeMocoMergeCell_(value) {
  if (value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return String(Math.floor((value.getTime() - Date.UTC(1899, 11, 30)) / 86400000));
  }
  if (typeof value === 'number' && isFinite(value)) {
    return String(Math.round(value * 1000000000) / 1000000000).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }
  const raw = String(value || '').trim();
  if (/^-?\d+(?:\.0+)?$/.test(raw)) return String(Number(raw));
  if (/^-?\d+\.\d+$/.test(raw)) return String(Math.round(Number(raw) * 1000000000) / 1000000000).replace(/(\.\d*?)0+$/, '$1');
  return normText_(raw);
}

function normalizeMocoMergeItemName_(value) {
  let key = normText_(value || '');
  key = key.replace(/\bbot\s+(mi|my)\s+/g, 'bot ');
  key = key.replace(/\bso\s+/g, '');
  key = key.replace(/\s+/g, ' ').trim();
  return key;
}

function padMocoRows_(rows, width) {
  return (rows || []).map(row => {
    const out = row.slice(0, width);
    while (out.length < width) out.push('');
    return out;
  });
}

function writeMocoSourceStagingSheet_(ss, name, values) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  writeMocoPlainValuesToSheet_(sheet, values);
  return sheet;
}

function writeMocoPlainValuesToSheet_(sheet, values) {
  sheet.clear().clearFormats().clearNotes().clearConditionalFormatRules();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();
  const rows = Math.max((values || []).length, 1);
  const cols = Math.max((values || []).reduce((max, row) => Math.max(max, row.length), 0), 1);
  if (sheet.getMaxRows() < rows) sheet.insertRowsAfter(sheet.getMaxRows(), rows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < cols) sheet.insertColumnsAfter(sheet.getMaxColumns(), cols - sheet.getMaxColumns());
  if (values && values.length) sheet.getRange(1, 1, values.length, cols).setValues(values);
  if (sheet.getMaxRows() > rows) sheet.deleteRows(rows + 1, sheet.getMaxRows() - rows);
  if (sheet.getMaxColumns() > cols) sheet.deleteColumns(cols + 1, sheet.getMaxColumns() - cols);
}

function copyMocoSheetBackup_(ss, sheet, prefix) {
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const name = uniqueSheetName_(ss, prefix + stamp);
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function MOCO_SYNC_ORDER_DROPDOWN_UI(dryRun) {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('ĐƠN HÀNG');
  if (!sheet) throw new Error('Không tìm thấy sheet ĐƠN HÀNG');
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return { dryRun, updatedRows: 0, note: 'ĐƠN HÀNG đang trống.' };

  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const map = getMocoOrderUiHeaderMap_(headers);
  if (map.itemName < 0) throw new Error('Không tìm thấy cột Tên bánh/Tên món trong ĐƠN HÀNG');

  const desiredRows = Math.max(lastRow + 24, 60);
  const rowsToInsert = Math.max(0, desiredRows + 1 - sheet.getMaxRows());
  const targetRows = Math.max(sheet.getMaxRows() - 1, desiredRows);
  const dataRows = Math.max(lastRow - 1, 0);
  const existingNames = dataRows > 0
    ? sheet.getRange(2, map.itemName + 1, dataRows, 1).getDisplayValues()
    : [];
  const existingBackgrounds = existingNames.map(row => {
    const name = String(row[0] || '').trim();
    return [name ? mocoOrderCakeColor_(name) : '#FFFFFF'];
  });
  const summary = {
    dryRun,
    itemColumn: map.itemName + 1,
    validationRows: targetRows,
    rowsToInsert,
    coloredExistingRows: existingBackgrounds.length,
    warnings: [],
    note: 'Đồng bộ dropdown và màu ô cột Tên bánh/Tên món. Màu trong popup dropdown của Google Sheets không được Apps Script expose; onEdit sẽ tô lại màu ô sau khi chọn.',
  };
  if (dryRun) return summary;

  if (rowsToInsert > 0) sheet.insertRowsAfter(sheet.getMaxRows(), rowsToInsert);
  summary.warnings.push('Bỏ qua ghi data validation vì cột Tên bánh đang là Google Sheets typed column; chỉ đồng bộ màu ô và onEdit.');
  if (existingBackgrounds.length) {
    try {
      sheet.getRange(2, map.itemName + 1, existingBackgrounds.length, 1)
        .setBackgrounds(existingBackgrounds)
        .setFontColor('#202124')
        .setVerticalAlignment('middle');
    } catch (err) {
      summary.warnings.push('Không tô lại được màu ô Tên bánh: ' + err.message);
    }
  }
  try {
    sheet.getRange(1, map.itemName + 1)
      .setBackground('#2F6B53')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  } catch (err) {
    summary.warnings.push('Không tô lại được header Tên bánh: ' + err.message);
  }
  return summary;
}

function onEditMocoOrderUi_(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (!sheet || sheet.getName() !== 'ĐƠN HÀNG') return;
  if (e.range.getRow() < 2) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const map = getMocoOrderUiHeaderMap_(headers);
  const editedCol = e.range.getColumn();
  const firstRow = e.range.getRow();
  const rowCount = e.range.getNumRows();
  if (map.itemName >= 0 && editedCol <= map.itemName + 1 && editedCol + e.range.getNumColumns() - 1 >= map.itemName + 1) {
    const names = sheet.getRange(firstRow, map.itemName + 1, rowCount, 1).getDisplayValues();
    const backgrounds = names.map(row => {
      const name = String(row[0] || '').trim();
      return [name ? mocoOrderCakeColor_(name) : '#FFFFFF'];
    });
    sheet.getRange(firstRow, map.itemName + 1, rowCount, 1).setBackgrounds(backgrounds);
  }

  const statusColumns = [
    { col: map.productionStatus + 1, type: 'production' },
    { col: map.deliveryStatus + 1, type: 'delivery' },
    { col: map.paymentStatus + 1, type: 'payment' },
  ].filter(item => item.col > 0);
  statusColumns.forEach(item => {
    if (editedCol > item.col || editedCol + e.range.getNumColumns() - 1 < item.col) return;
    const values = sheet.getRange(firstRow, item.col, rowCount, 1).getDisplayValues();
    const backgrounds = values.map(row => [getMocoOrderStatusStyle_(row[0], item.type).bg]);
    const fontColors = values.map(row => [getMocoOrderStatusStyle_(row[0], item.type).fg]);
    sheet.getRange(firstRow, item.col, rowCount, 1)
      .setBackgrounds(backgrounds)
      .setFontColors(fontColors)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  });
}

function MOCO_SYNC_YIELD_ITEM_UI(dryRun) {
  const ss = getMocoSpreadsheet_();
  const sheet = findMocoYieldMapSheet_(ss);
  if (!sheet) throw new Error('Yield map sheet not found.');

  const targets = findMocoYieldItemColumns_(sheet);
  const summary = {
    dryRun,
    sheet: sheet.getName(),
    targetColumns: targets.map(item => ({
      headerRow: item.headerRow,
      column: item.col,
      header: item.header,
      rows: item.rows,
    })),
    coloredCells: 0,
    validationRanges: [],
    warnings: [],
    note: 'Sync item-name cell colors and dropdown source with ORDER item-name UI.',
  };
  if (!targets.length) {
    summary.warnings.push('No item-name column found. Expected headers like Ten banh, Ten mon ban.');
    return summary;
  }
  if (dryRun) return summary;

  targets.forEach(target => {
    try {
      sheet.getRange(target.headerRow, target.col)
        .setBackground('#2F6B53')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
    } catch (err) {
      summary.warnings.push('Cannot style header R' + target.headerRow + 'C' + target.col + ': ' + err.message);
    }

    if (target.rows > 0) {
      try {
        const range = sheet.getRange(target.headerRow + 1, target.col, target.rows, 1);
        const names = range.getDisplayValues();
        const backgrounds = names.map(row => {
          const name = String(row[0] || '').trim();
          return [name ? mocoOrderCakeColor_(name) : '#FFFFFF'];
        });
        range
          .setBackgrounds(backgrounds)
          .setFontColor('#202124')
          .setVerticalAlignment('middle');
        summary.coloredCells += backgrounds.filter(row => row[0] !== '#FFFFFF').length;
      } catch (err) {
        summary.warnings.push('Cannot color item cells R' + (target.headerRow + 1) + 'C' + target.col + ': ' + err.message);
      }
    }

    const validationRows = Math.max(target.rows, 80);
    try {
      const ok = applyMocoDropdownNamedRange_(sheet, target.headerRow + 1, target.col, validationRows, ss, 'LIST_MENU_NAMES', true, 'Choose the canonical menu item name.');
      if (ok === false) {
        summary.warnings.push('Named range LIST_MENU_NAMES not found for dropdown source.');
      } else {
        summary.validationRanges.push(mocoColumnToLetter_(target.col) + (target.headerRow + 1) + ':' + mocoColumnToLetter_(target.col) + (target.headerRow + validationRows));
      }
    } catch (err) {
      summary.warnings.push('Cannot apply dropdown to C' + target.col + '. Google Sheets typed column/table UI may block Apps Script validation: ' + err.message);
    }
  });

  return summary;
}

function onEditMocoYieldUi_(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (!sheet || !isMocoYieldMapSheetName_(sheet.getName())) return;

  const targets = findMocoYieldItemColumns_(sheet);
  if (!targets.length) return;
  const editedStartCol = e.range.getColumn();
  const editedEndCol = editedStartCol + e.range.getNumColumns() - 1;
  const editedStartRow = e.range.getRow();
  const editedEndRow = editedStartRow + e.range.getNumRows() - 1;

  targets.forEach(target => {
    if (editedStartCol > target.col || editedEndCol < target.col) return;
    const startRow = Math.max(editedStartRow, target.headerRow + 1);
    const endRow = Math.min(editedEndRow, target.headerRow + target.rows);
    if (endRow < startRow) return;
    const rows = endRow - startRow + 1;
    const range = sheet.getRange(startRow, target.col, rows, 1);
    const names = range.getDisplayValues();
    const backgrounds = names.map(row => {
      const name = String(row[0] || '').trim();
      return [name ? mocoOrderCakeColor_(name) : '#FFFFFF'];
    });
    range.setBackgrounds(backgrounds).setFontColor('#202124').setVerticalAlignment('middle');
  });
}

function findMocoYieldItemColumns_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return [];
  const scanRows = Math.min(lastRow, 80);
  const values = sheet.getRange(1, 1, scanRows, lastCol).getDisplayValues();
  const hits = [];
  const seen = {};

  values.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      const key = mocoAuditNorm_(value);
      if (!key) return;
      const isItemName =
        key.indexOf('ten banh') >= 0 ||
        key.indexOf('ten mon ban') >= 0 ||
        key === 'ten mon' ||
        key.indexOf('mon ban') >= 0;
      const isRecipeOnly = key.indexOf('cong thuc') >= 0 || key.indexOf('nguyen lieu') >= 0;
      if (!isItemName || isRecipeOnly) return;
      const id = (rIdx + 1) + ':' + (cIdx + 1);
      if (seen[id]) return;
      seen[id] = true;
      hits.push({
        headerRow: rIdx + 1,
        col: cIdx + 1,
        header: String(value || '').trim(),
      });
    });
  });

  return hits.map((hit, idx) => {
    const nextHeader = hits
      .filter(other => other.col === hit.col && other.headerRow > hit.headerRow)
      .map(other => other.headerRow)
      .sort((a, b) => a - b)[0];
    const maxEnd = nextHeader ? nextHeader - 2 : lastRow;
    return {
      headerRow: hit.headerRow,
      col: hit.col,
      header: hit.header,
      rows: Math.max(maxEnd - hit.headerRow, 0),
      index: idx,
    };
  });
}

function findMocoYieldMapSheet_(ss) {
  if (typeof MOCO_YIELD_MAP_SHEET !== 'undefined') {
    const byConst = ss.getSheetByName(MOCO_YIELD_MAP_SHEET);
    if (byConst) return byConst;
  }
  return ss.getSheets().find(sheet => isMocoYieldMapSheetName_(sheet.getName())) || null;
}

function isMocoYieldMapSheetName_(name) {
  const key = mocoAuditNorm_(name);
  return key.indexOf('thanh pham') >= 0 && key.indexOf('me') >= 0;
}

function MOCO_DEBUG_HOME_SHEET() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('HOME');
  if (!sheet) return { exists: false, note: 'Không tìm thấy sheet HOME.' };
  return summarizeMocoHomeSheet_(sheet);
}

function MOCO_FIX_HOME_SCROLL(dryRun) {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('HOME');
  if (!sheet) throw new Error('Không tìm thấy sheet HOME');
  const before = summarizeMocoHomeSheet_(sheet);
  const actions = [];
  if (before.frozenRows > 1) actions.push('setFrozenRows(1)');
  if (before.frozenColumns > 0) actions.push('setFrozenColumns(0)');
  if (before.maxRows < 80) actions.push('insertRowsAfter(' + before.maxRows + ', ' + (80 - before.maxRows) + ')');
  if (before.maxColumns < 18) actions.push('insertColumnsAfter(' + before.maxColumns + ', ' + (18 - before.maxColumns) + ')');

  if (!dryRun) {
    if (before.frozenRows > 1) sheet.setFrozenRows(1);
    if (before.frozenColumns > 0) sheet.setFrozenColumns(0);
    if (before.maxRows < 80) sheet.insertRowsAfter(before.maxRows, 80 - before.maxRows);
    if (before.maxColumns < 18) sheet.insertColumnsAfter(before.maxColumns, 18 - before.maxColumns);
    ss.setActiveSheet(sheet);
  }

  return {
    dryRun,
    before,
    actions,
    after: dryRun ? null : summarizeMocoHomeSheet_(sheet),
    note: 'Patch chỉ giảm freeze và tăng grid trống cho HOME; không clear/rebuild nội dung.',
  };
}

function summarizeMocoHomeSheet_(sheet) {
  const maxRows = sheet.getMaxRows();
  const maxColumns = sheet.getMaxColumns();
  const hiddenRows = [];
  const hiddenColumns = [];
  for (let r = 1; r <= Math.min(maxRows, 120); r++) {
    let hidden = false;
    try { hidden = sheet.isRowHiddenByUser(r) || sheet.isRowHiddenByFilter(r); } catch (err) {
      try { hidden = sheet.isRowHiddenByUser(r); } catch (err2) {}
    }
    if (hidden) hiddenRows.push(r);
  }
  for (let c = 1; c <= Math.min(maxColumns, 40); c++) {
    try {
      if (sheet.isColumnHiddenByUser(c)) hiddenColumns.push(c);
    } catch (err) {}
  }
  return {
    exists: true,
    sheetName: sheet.getName(),
    sheetId: sheet.getSheetId(),
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn(),
    maxRows,
    maxColumns,
    frozenRows: sheet.getFrozenRows(),
    frozenColumns: sheet.getFrozenColumns(),
    hiddenRowsSample: hiddenRows.slice(0, 50),
    hiddenColumnsSample: hiddenColumns.slice(0, 30),
    mergedRangesSample: sheet.getRange(1, 1, Math.min(maxRows, 40), Math.min(maxColumns, 18))
      .getMergedRanges()
      .map(range => range.getA1Notation())
      .slice(0, 40),
  };
}

function MOCO_AUDIT_THU_CHI_COPY(sourceSheetName) {
  const ss = getMocoSpreadsheet_();
  const targetName = typeof TC_SHEET !== 'undefined' ? TC_SHEET : 'THU CHI';
  const targetSheet = ss.getSheetByName(targetName);
  if (!targetSheet) throw new Error('Target sheet not found: ' + targetName);

  const sourceSheet = findMocoThuChiCopySheet_(ss, sourceSheetName, targetSheet.getName());
  if (!sourceSheet) {
    return {
      ok: false,
      targetSheet: targetSheet.getName(),
      sourceSheet: '',
      availableSheets: ss.getSheets().map(sheet => sheet.getName()),
      note: 'No probable Thu-Chi copy sheet found. Pass --source-sheet with the exact sheet name.',
    };
  }

  const target = parseMocoThuChiAuditSheet_(targetSheet);
  const source = parseMocoThuChiAuditSheet_(sourceSheet);
  const comparison = compareMocoThuChiAudit_(source, target);
  const totalsDiff = {
    thu: target.summary.totalThu - source.summary.totalThu,
    chi: target.summary.totalChi - source.summary.totalChi,
    finalBalance: target.summary.finalBalance - source.summary.finalBalance,
  };
  const dailyDiffs = buildMocoThuChiDailyDiffs_(source.rows, target.rows);
  const financialTotalsAligned = totalsDiff.thu === 0 && totalsDiff.chi === 0 && totalsDiff.finalBalance === 0 && dailyDiffs.length === 0;
  const isParallelLayout = target.summary.layout === 'parallel';

  return {
    ok: true,
    targetSheet: target.sheetName,
    sourceSheet: source.sheetName,
    targetSummary: target.summary,
    sourceSummary: source.summary,
    totalsDiff,
    dailyDiffs,
    isFinanciallyAligned: isParallelLayout ? financialTotalsAligned : comparison.missingInTarget.length === 0 &&
      comparison.extraInTarget.length === 0 &&
      comparison.amountMismatches.length === 0 &&
      target.summary.totalThu === source.summary.totalThu &&
      target.summary.totalChi === source.summary.totalChi,
    isRowSequenceAligned: comparison.sequenceMismatches.length === 0 &&
      target.summary.rowCount === source.summary.rowCount,
    comparison,
    policy: 'Read-only audit. No Thu-Chi data was changed.',
  };
}

function findMocoThuChiCopySheet_(ss, sourceSheetName, targetName) {
  if (sourceSheetName) {
    const exact = ss.getSheetByName(sourceSheetName);
    if (exact) return exact;
    throw new Error('Không tìm thấy sheet nguồn Thu-Chi đúng tên: ' + sourceSheetName);
  }
  const targetKey = mocoAuditNorm_(targetName);
  const scored = ss.getSheets()
    .filter(sheet => mocoAuditNorm_(sheet.getName()) !== targetKey)
    .map(sheet => {
      const name = sheet.getName();
      const key = mocoAuditNorm_(name);
      let score = 0;
      if (key.indexOf('backup') >= 0 || key.indexOf('reconcile') >= 0) return { sheet, name, score: -999 };
      if (key.indexOf('thu') >= 0) score += 2;
      if (key.indexOf('chi') >= 0) score += 2;
      if (key.indexOf('ban sao') >= 0 || key.indexOf('copy') >= 0) score += 4;
      if (key.indexOf('founder') >= 0) score += 3;
      if (key.indexOf('thu chi') >= 0 || key.indexOf('thu - chi') >= 0) score += 2;
      return { sheet, name, score };
    })
    .filter(item => item.score >= 6)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return scored.length ? scored[0].sheet : null;
}

function parseMocoThuChiAuditSheet_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const width = Math.max(Math.min(lastCol, 18), 6);
  if (lastRow < 1) {
    return { sheetName: sheet.getName(), rows: [], byKey: {}, duplicateKeys: [], summary: emptyMocoThuChiSummary_(sheet) };
  }
  const values = sheet.getRange(1, 1, lastRow, width).getValues();
  const display = sheet.getRange(1, 1, lastRow, width).getDisplayValues();
  if (isMocoThuChiParallelDisplay_(display)) {
    return parseMocoThuChiParallelAuditSheet_(sheet, values, display, lastCol);
  }
  const header = findMocoThuChiAuditHeader_(display);
  const rows = [];
  const byKey = {};
  const duplicates = {};

  for (let r = header.row + 1; r < display.length; r++) {
    const drow = display[r] || [];
    const vrow = values[r] || [];
    const active = drow.slice(0, 6).some(value => String(value || '').trim());
    if (!active) continue;
    const desc = String(drow[header.map.desc] || vrow[header.map.desc] || '').trim();
    const thu = parseMocoAuditMoney_(vrow[header.map.thu] !== '' ? vrow[header.map.thu] : drow[header.map.thu]);
    const chi = parseMocoAuditMoney_(vrow[header.map.chi] !== '' ? vrow[header.map.chi] : drow[header.map.chi]);
    const balance = parseMocoAuditMoney_(vrow[header.map.balance] !== '' ? vrow[header.map.balance] : drow[header.map.balance]);
    if (!desc && thu === 0 && chi === 0) continue;
    const marker = (typeof extractTcMarker_ === 'function' ? extractTcMarker_(desc) : mocoAuditExtractMarker_(desc));
    const type = marker ? 'auto_order' : (mocoAuditNorm_(desc).indexOf('von') >= 0 ? 'capital_or_opening' : 'manual');
    const row = {
      row: r + 1,
      stt: String(drow[header.map.stt] || vrow[header.map.stt] || '').trim(),
      date: mocoAuditDateKey_(vrow[header.map.date], drow[header.map.date]),
      desc,
      descNorm: mocoAuditNorm_(desc),
      thu,
      chi,
      balance,
      marker,
      type,
    };
    row.key = buildMocoThuChiAuditKey_(row);
    rows.push(row);
    if (!byKey[row.key]) byKey[row.key] = [];
    byKey[row.key].push(row);
    if (byKey[row.key].length > 1) duplicates[row.key] = byKey[row.key].length;
  }

  return {
    sheetName: sheet.getName(),
    lastRow,
    lastColumn: lastCol,
    header,
    rows,
    byKey,
    duplicateKeys: Object.keys(duplicates).map(key => ({ key, count: duplicates[key] })).slice(0, 50),
    summary: summarizeMocoThuChiAuditRows_(sheet, rows, header),
  };
}

function isMocoThuChiParallelDisplay_(display) {
  const titleRow = display[0] || [];
  const headerRow = display[1] || [];
  return String(titleRow[0] || '').trim() === 'BẢNG THU' ||
    String(titleRow[8] || '').trim() === 'BẢNG CHI' ||
    String(headerRow[1] || '').trim() === 'NGÀY THU' ||
    String(headerRow[9] || '').trim() === 'NGÀY CHI';
}

function parseMocoThuChiParallelAuditSheet_(sheet, values, display, lastCol) {
  const rows = [];
  const byKey = {};
  const duplicates = {};
  const pushRow = (parsed) => {
    parsed.descNorm = mocoAuditNorm_(parsed.desc);
    parsed.type = parsed.marker ? 'auto_order' :
      (mocoAuditNorm_(parsed.desc + ' ' + parsed.group).indexOf('von') >= 0 ? 'capital_or_opening' : 'manual');
    parsed.key = buildMocoThuChiAuditKey_(parsed);
    rows.push(parsed);
    if (!byKey[parsed.key]) byKey[parsed.key] = [];
    byKey[parsed.key].push(parsed);
    if (byKey[parsed.key].length > 1) duplicates[parsed.key] = byKey[parsed.key].length;
  };

  for (let r = 2; r < display.length; r++) {
    const td = display[r] || [];
    const tv = values[r] || [];
    const thuActive = td.slice(0, 7).some(value => String(value || '').trim());
    if (thuActive) {
      const desc = String(td[3] || tv[3] || '').trim();
      const ref = String(td[6] || tv[6] || '').trim();
      const thu = parseMocoAuditMoney_(tv[4] !== '' ? tv[4] : td[4]);
      if (desc || thu) {
        pushRow({
          row: r + 1,
          stt: String(td[0] || tv[0] || '').trim(),
          date: mocoAuditDateKey_(tv[1], td[1]),
          group: String(td[2] || tv[2] || '').trim(),
          desc,
          thu,
          chi: 0,
          balance: 0,
          marker: (typeof extractTcMarker_ === 'function' ? extractTcMarker_(ref + ' ' + desc) : mocoAuditExtractMarker_(ref + ' ' + desc)),
        });
      }
    }

    const chiActive = td.slice(8, 15).some(value => String(value || '').trim());
    if (chiActive) {
      const desc = String(td[11] || tv[11] || '').trim();
      const ref = String(td[14] || tv[14] || '').trim();
      const chi = parseMocoAuditMoney_(tv[12] !== '' ? tv[12] : td[12]);
      if (desc || chi) {
        pushRow({
          row: r + 1,
          stt: String(td[8] || tv[8] || '').trim(),
          date: mocoAuditDateKey_(tv[9], td[9]),
          group: String(td[10] || tv[10] || '').trim(),
          desc,
          thu: 0,
          chi,
          balance: 0,
          marker: (typeof extractTcMarker_ === 'function' ? extractTcMarker_(ref + ' ' + desc) : mocoAuditExtractMarker_(ref + ' ' + desc)),
        });
      }
    }
  }

  return {
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
    lastColumn: lastCol,
    header: { row: 1, rowNumber: 2, map: { stt: 0, date: 1, desc: 3, thu: 4, chi: 12, balance: 17 }, layout: 'parallel' },
    rows,
    byKey,
    duplicateKeys: Object.keys(duplicates).map(key => ({ key, count: duplicates[key] })).slice(0, 50),
    summary: summarizeMocoThuChiParallelAuditRows_(sheet, rows),
  };
}

function summarizeMocoThuChiParallelAuditRows_(sheet, rows) {
  const base = summarizeMocoThuChiAuditRows_(sheet, rows, { rowNumber: 2 });
  const finalBalance = parseMocoAuditMoney_(sheet.getRange(5, 18).getDisplayValue());
  const openingBalance = parseMocoAuditMoney_(sheet.getRange(2, 18).getDisplayValue());
  base.finalBalance = finalBalance || openingBalance + base.net;
  base.layout = 'parallel';
  return base;
}

function findMocoThuChiAuditHeader_(display) {
  const scanRows = Math.min(display.length, 30);
  for (let r = 0; r < scanRows; r++) {
    const normalized = (display[r] || []).map(value => mocoAuditNorm_(value));
    const map = buildMocoThuChiHeaderMap_(normalized);
    if (map.stt >= 0 && map.date >= 0 && map.desc >= 0 && map.thu >= 0 && map.chi >= 0) {
      return { row: r, rowNumber: r + 1, map };
    }
  }
  return { row: 0, rowNumber: 1, map: { stt: 0, date: 1, desc: 2, thu: 3, chi: 4, balance: 5 } };
}

function buildMocoThuChiHeaderMap_(headers) {
  return {
    stt: findMocoAuditHeader_(headers, ['stt', 'ma gd', 'id']),
    date: findMocoAuditHeader_(headers, ['ngay gd', 'ngay giao dich', 'ngay']),
    desc: findMocoAuditHeader_(headers, ['mo ta gd', 'mo ta', 'noi dung', 'dien giai']),
    thu: findMocoAuditHeader_(headers, ['thu']),
    chi: findMocoAuditHeader_(headers, ['chi']),
    balance: findMocoAuditHeader_(headers, ['so du', 'balance']),
  };
}

function findMocoAuditHeader_(headers, candidates) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || '';
    if (candidates.some(candidate => header === candidate || header.indexOf(candidate) >= 0)) return i;
  }
  return -1;
}

function summarizeMocoThuChiAuditRows_(sheet, rows, header) {
  const totalThu = rows.reduce((sum, row) => sum + row.thu, 0);
  const totalChi = rows.reduce((sum, row) => sum + row.chi, 0);
  const lastWithBalance = rows.slice().reverse().find(row => row.balance !== 0) || rows[rows.length - 1] || { balance: 0 };
  return {
    sheetName: sheet.getName(),
    headerRow: header.rowNumber,
    rowCount: rows.length,
    autoOrderRows: rows.filter(row => row.type === 'auto_order').length,
    manualRows: rows.filter(row => row.type === 'manual').length,
    capitalOrOpeningRows: rows.filter(row => row.type === 'capital_or_opening').length,
    totalThu,
    totalChi,
    net: totalThu - totalChi,
    finalBalance: lastWithBalance ? lastWithBalance.balance : 0,
    firstDataRow: rows.length ? rows[0].row : null,
    lastDataRow: rows.length ? rows[rows.length - 1].row : null,
  };
}

function emptyMocoThuChiSummary_(sheet) {
  return {
    sheetName: sheet.getName(),
    headerRow: 0,
    rowCount: 0,
    autoOrderRows: 0,
    manualRows: 0,
    capitalOrOpeningRows: 0,
    totalThu: 0,
    totalChi: 0,
    net: 0,
    finalBalance: 0,
    firstDataRow: null,
    lastDataRow: null,
  };
}

function compareMocoThuChiAudit_(source, target) {
  const missingInTarget = [];
  const extraInTarget = [];
  const amountMismatches = [];
  const dateMismatches = [];
  const balanceMismatches = [];
  const sequenceMismatches = [];

  Object.keys(source.byKey).forEach(key => {
    if (!target.byKey[key]) {
      missingInTarget.push(slimMocoThuChiAuditRow_(source.byKey[key][0]));
      return;
    }
    const sourceRow = source.byKey[key][0];
    const targetRow = target.byKey[key][0];
    if (sourceRow.thu !== targetRow.thu || sourceRow.chi !== targetRow.chi) {
      amountMismatches.push({ key, source: slimMocoThuChiAuditRow_(sourceRow), target: slimMocoThuChiAuditRow_(targetRow) });
    }
    if (sourceRow.date !== targetRow.date) {
      dateMismatches.push({ key, sourceDate: sourceRow.date, targetDate: targetRow.date, sourceRow: sourceRow.row, targetRow: targetRow.row });
    }
    if (sourceRow.balance !== targetRow.balance) {
      balanceMismatches.push({ key, sourceBalance: sourceRow.balance, targetBalance: targetRow.balance, sourceRow: sourceRow.row, targetRow: targetRow.row });
    }
  });

  Object.keys(target.byKey).forEach(key => {
    if (!source.byKey[key]) extraInTarget.push(slimMocoThuChiAuditRow_(target.byKey[key][0]));
  });

  const maxRows = Math.max(source.rows.length, target.rows.length);
  for (let i = 0; i < maxRows; i++) {
    const sourceRow = source.rows[i];
    const targetRow = target.rows[i];
    const sourceSig = sourceRow ? buildMocoThuChiSequenceSignature_(sourceRow) : '';
    const targetSig = targetRow ? buildMocoThuChiSequenceSignature_(targetRow) : '';
    if (sourceSig !== targetSig) {
      sequenceMismatches.push({
        index: i + 1,
        source: sourceRow ? slimMocoThuChiAuditRow_(sourceRow) : null,
        target: targetRow ? slimMocoThuChiAuditRow_(targetRow) : null,
      });
      if (sequenceMismatches.length >= 50) break;
    }
  }

  return {
    missingInTarget: missingInTarget.slice(0, 100),
    extraInTarget: extraInTarget.slice(0, 100),
    amountMismatches: amountMismatches.slice(0, 100),
    dateMismatches: dateMismatches.slice(0, 100),
    balanceMismatches: balanceMismatches.slice(0, 100),
    duplicateKeys: {
      source: source.duplicateKeys,
      target: target.duplicateKeys,
    },
    sequenceMismatches,
    counts: {
      missingInTarget: missingInTarget.length,
      extraInTarget: extraInTarget.length,
      amountMismatches: amountMismatches.length,
      dateMismatches: dateMismatches.length,
      balanceMismatches: balanceMismatches.length,
      sequenceMismatches: sequenceMismatches.length,
    },
  };
}

function buildMocoThuChiAuditKey_(row) {
  if (row.marker) return 'marker:' + mocoAuditNorm_(row.marker);
  if (row.type === 'capital_or_opening') return 'capital:' + row.date + ':' + row.thu + ':' + row.chi + ':' + row.descNorm;
  return ['manual', row.date, row.descNorm, row.thu, row.chi].join('|');
}

function buildMocoThuChiSequenceSignature_(row) {
  return [row.date, row.descNorm, row.thu, row.chi, row.balance].join('|');
}

function buildMocoThuChiDailyDiffs_(sourceRows, targetRows) {
  const source = bucketMocoThuChiByDate_(sourceRows);
  const target = bucketMocoThuChiByDate_(targetRows);
  const dates = {};
  Object.keys(source).forEach(date => { dates[date] = true; });
  Object.keys(target).forEach(date => { dates[date] = true; });
  return Object.keys(dates).sort().map(date => {
    const s = source[date] || { thu: 0, chi: 0, count: 0 };
    const t = target[date] || { thu: 0, chi: 0, count: 0 };
    return {
      date,
      sourceThu: s.thu,
      targetThu: t.thu,
      diffThu: t.thu - s.thu,
      sourceChi: s.chi,
      targetChi: t.chi,
      diffChi: t.chi - s.chi,
      sourceRows: s.count,
      targetRows: t.count,
    };
  }).filter(row => row.diffThu !== 0 || row.diffChi !== 0 || row.sourceRows !== row.targetRows);
}

function bucketMocoThuChiByDate_(rows) {
  const out = {};
  (rows || []).forEach(row => {
    const date = row.date || '(blank)';
    if (!out[date]) out[date] = { thu: 0, chi: 0, count: 0 };
    out[date].thu += row.thu;
    out[date].chi += row.chi;
    out[date].count += 1;
  });
  return out;
}

function slimMocoThuChiAuditRow_(row) {
  return {
    row: row.row,
    date: row.date,
    desc: row.desc,
    thu: row.thu,
    chi: row.chi,
    balance: row.balance,
    marker: row.marker,
    type: row.type,
  };
}

function parseMocoAuditMoney_(value) {
  if (typeof value === 'number') return Math.round(value);
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const negative = /^-/.test(raw) || /\(.+\)/.test(raw);
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const amount = Number(digits);
  return negative ? -amount : amount;
}

function mocoAuditDateKey_(value, displayValue) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    const tz = Session.getScriptTimeZone();
    return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  }
  return String(displayValue || value || '').trim();
}

function mocoAuditExtractMarker_(text) {
  const match = String(text || '').match(/AUTO-[^\s)]+/);
  return match ? match[0] : '';
}

function mocoAuditNorm_(value) {
  if (typeof normText_ === 'function') return normText_(value);
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function MOCO_RECONCILE_THU_CHI_FROM_COPY(dryRun, sourceSheetName) {
  const ss = getMocoSpreadsheet_();
  const targetSheet = ss.getSheetByName('THU CHI');
  if (!targetSheet) throw new Error('Không tìm thấy sheet THU CHI');
  const sourceSheet = findMocoThuChiCopySheet_(ss, sourceSheetName || '', 'THU CHI');
  if (!sourceSheet) throw new Error('Không tìm thấy bản sao Thu - Chi để đối soát.');

  const source = parseMocoThuChiAuditSheet_(sourceSheet);
  const target = parseMocoThuChiAuditSheet_(targetSheet);
  const sourceOpeningBalance = source.summary.finalBalance - source.summary.net;
  const sourceNameKey = mocoAuditNorm_(sourceSheet.getName());
  const sourceIsReconcileBackup = sourceNameKey.indexOf('backup thu chi reconcile') >= 0 ||
    sourceNameKey.indexOf('backup_thu_chi_reconcile') >= 0;
  const targetOrderRows = target.rows
    .filter(isMocoThuChiOrderSyncRow_)
    .map(row => buildMocoThuChiMergeRow_(row, 'Đơn hàng sync', deriveMocoThuChiOrderMarker_(row)));
  const founderRows = source.rows
    .filter(row => sourceIsReconcileBackup || !isMocoThuChiFounderOrderRevenueRow_(row))
    .filter(row => row.desc || row.thu !== 0 || row.chi !== 0)
    .map(row => buildMocoThuChiMergeRow_(row, sourceIsReconcileBackup && isMocoThuChiOrderSyncRow_(row) ? 'Đơn hàng sync' : 'Founder copy', 'COPY_ROW_' + row.row));

  const combined = founderRows.concat(targetOrderRows);
  combined.sort((a, b) => {
    if (a.isOpening !== b.isOpening) return a.isOpening ? -1 : 1;
    const ad = mocoThuChiDateSortValue_(a.date);
    const bd = mocoThuChiDateSortValue_(b.date);
    if (ad !== bd) return ad - bd;
    if (a.source !== b.source) return a.source === 'Founder copy' ? -1 : 1;
    return a.originalRow - b.originalRow;
  });

  const totalThu = combined.reduce((sum, row) => sum + row.thu, 0);
  const totalChi = combined.reduce((sum, row) => sum + row.chi, 0);
  const finalBalance = sourceOpeningBalance + totalThu - totalChi;
  const skippedFounderRevenue = sourceIsReconcileBackup ? [] : source.rows.filter(isMocoThuChiFounderOrderRevenueRow_);
  const summary = {
    dryRun,
    targetSheet: target.sheetName,
    sourceSheet: source.sheetName,
    sourceOpeningBalance,
    keptOrderSyncRows: targetOrderRows.length,
    importedFounderRows: founderRows.length,
    skippedFounderRevenueRows: skippedFounderRevenue.length,
    skippedFounderRevenueSample: skippedFounderRevenue.slice(0, 20).map(slimMocoThuChiAuditRow_),
    resultRows: combined.length,
    resultTotals: {
      thu: totalThu,
      chi: totalChi,
      net: totalThu - totalChi,
      finalBalance,
    },
    note: 'Giữ dòng Đơn #... từ THU CHI hiện tại; lấy các dòng không phải doanh thu đơn hàng từ bản sao founder; bỏ dòng founder kiểu Khách đặt hàng để tránh trùng doanh thu.',
  };
  if (dryRun) return summary;

  const backupName = createMocoThuChiSheetBackup_(ss, targetSheet, 'BACKUP_THU_CHI_RECONCILE_');
  writeMocoReconciledThuChi_(targetSheet, combined, sourceOpeningBalance);
  summary.backupSheet = backupName;
  summary.written = true;
  return summary;
}

function buildMocoThuChiMergeRow_(row, source, ref) {
  return {
    date: row.date || '',
    group: classifyMocoThuChiGroup_(row, source),
    desc: row.desc || '',
    thu: row.thu || 0,
    chi: row.chi || 0,
    source,
    ref: ref || '',
    marker: source === 'Đơn hàng sync' ? deriveMocoThuChiOrderMarker_(row) : '',
    originalRow: row.row || 0,
    isOpening: isMocoThuChiOpeningRow_(row),
  };
}

function classifyMocoThuChiGroup_(row, source) {
  if (source === 'Đơn hàng sync' || isMocoThuChiOrderSyncRow_(row)) return 'Đơn hàng';
  if (isMocoThuChiOpeningRow_(row)) return 'Vốn';
  const key = row.descNorm || mocoAuditNorm_(row.desc);
  if (key.indexOf('nvl') >= 0 || key.indexOf('nguyen lieu') >= 0) return 'Mua NVL';
  if (key.indexOf('ccdc') >= 0) return 'CCDC';
  if (key.indexOf('ttb') >= 0 || key.indexOf('thiet bi') >= 0) return 'TTB';
  if (row.chi > 0) return 'Chi khác';
  if (row.thu > 0) return 'Thu khác';
  return 'Khác';
}

function isMocoThuChiOpeningRow_(row) {
  if (!row) return false;
  const key = row.descNorm || mocoAuditNorm_(row.desc);
  return (!row.date && row.thu > 0 && row.chi === 0) ||
    key.indexOf('von') >= 0 ||
    key.indexOf('dau ky') >= 0 ||
    key.indexOf('dau tu ban dau') >= 0;
}

function isMocoThuChiOrderSyncRow_(row) {
  if (!row) return false;
  if (row.marker) return true;
  const key = row.descNorm || mocoAuditNorm_(row.desc);
  return row.thu > 0 && row.chi === 0 && /^don\s+\S+/.test(key);
}

function isMocoThuChiFounderOrderRevenueRow_(row) {
  if (!row) return false;
  const key = row.descNorm || mocoAuditNorm_(row.desc);
  if (isMocoThuChiOrderSyncRow_(row)) return true;
  return row.thu > 0 && row.chi === 0 && (
    key.indexOf('khach dat hang') >= 0 ||
    key.indexOf('don hang') >= 0 ||
    /^don\s+\S+/.test(key)
  );
}

function deriveMocoThuChiOrderMarker_(row) {
  if (row && row.marker) return row.marker;
  const raw = String(row && row.desc || '');
  const direct = raw.match(/#\s*([^\s-]+)/);
  if (direct) return 'AUTO-ĐƠN-' + direct[1];
  const key = mocoAuditNorm_(raw);
  const normalized = key.match(/^don\s+([^\s]+)/);
  return normalized ? 'AUTO-ĐƠN-' + normalized[1] : '';
}

function writeMocoReconciledThuChi_(sheet, rows, openingBalance) {
  const thuRows = rows.filter(row => Number(row.thu || 0) > 0);
  const chiRows = rows.filter(row => Number(row.chi || 0) > 0);
  const dataRows = Math.max(thuRows.length, chiRows.length, 1);
  const width = 18;
  const requiredRows = dataRows + 6;
  if (sheet.getMaxRows() < requiredRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < width) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());
  }
  const maxRows = Math.max(sheet.getMaxRows(), dataRows + 6);
  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();
  sheet.getRange(1, 1, maxRows, width).breakApart();
  sheet.getRange(1, 1, maxRows, width)
    .clearContent()
    .clearNote()
    .clearFormat()
    .clearDataValidations();

  sheet.getRange(1, 1, 1, 7).merge().setValue('BẢNG THU');
  sheet.getRange(1, 9, 1, 7).merge().setValue('BẢNG CHI');
  sheet.getRange(1, 17, 1, 2).merge().setValue('TÓM TẮT');
  sheet.getRange(2, 1, 1, 7).setValues([['STT', 'NGÀY THU', 'NHÓM THU', 'MÔ TẢ THU', 'SỐ TIỀN THU', 'NGUỒN', 'REF']]);
  sheet.getRange(2, 9, 1, 7).setValues([['STT', 'NGÀY CHI', 'NHÓM CHI', 'MÔ TẢ CHI', 'SỐ TIỀN CHI', 'NGUỒN', 'REF']]);
  sheet.getRange(2, 17, 4, 2).setValues([
    ['Số dư đầu kỳ', Number(openingBalance || 0)],
    ['Tổng thu', ''],
    ['Tổng chi', ''],
    ['Số dư cuối', ''],
  ]);
  sheet.getRange(3, 18).setFormula('=SUM(E3:E)');
  sheet.getRange(4, 18).setFormula('=SUM(M3:M)');
  sheet.getRange(5, 18).setFormula('=R2+R3-R4');

  if (thuRows.length) {
    const thuValues = thuRows.map((row, idx) => [
      idx + 1,
      row.date || '',
      row.group || '',
      row.desc || '',
      row.thu || '',
      row.source || '',
      row.ref || '',
    ]);
    sheet.getRange(3, 1, thuValues.length, 7).setValues(thuValues);
    sheet.getRange(3, 4, thuRows.length, 1).setNotes(thuRows.map(row => [row.marker || '']));
  }
  if (chiRows.length) {
    const chiValues = chiRows.map((row, idx) => [
      idx + 1,
      row.date || '',
      row.group || '',
      row.desc || '',
      row.chi || '',
      row.source || '',
      row.ref || '',
    ]);
    sheet.getRange(3, 9, chiValues.length, 7).setValues(chiValues);
    sheet.getRange(3, 12, chiRows.length, 1).setNotes(chiRows.map(row => [row.marker || '']));
  }
  try {
    applyMocoThuChiScientificUi_(sheet, dataRows, openingBalance);
  } catch (err) {
    sheet.getRange('A1').setNote('Da ghi du lieu THU CHI nhung bo qua mot phan dinh dang/UI do typed column: ' + err.message);
  }
}

function applyMocoThuChiScientificUi_(sheet, dataRows, openingBalance) {
  const rows = Math.max(dataRows, 1);
  sheet.getRange(1, 1, 1, 7)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#2F6B53')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(1, 9, 1, 7)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#8A4B00')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(1, 17, 1, 2)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#1F4E79')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(2, 1, 1, 7)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#2F6B53')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(2, 9, 1, 7)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#8A4B00')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(2, 17, 4, 2)
    .setFontWeight('bold')
    .setBackground('#E8F0FE')
    .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setFrozenRows(2);
  sheet.setRowHeight(1, 34);
  sheet.setRowHeight(2, 42);
  const thuBody = sheet.getRange(3, 1, rows, 7);
  const chiBody = sheet.getRange(3, 9, rows, 7);
  [thuBody, chiBody].forEach(body => body
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#DADCE0', SpreadsheetApp.BorderStyle.SOLID));
  sheet.getRange(3, 1, rows, 7).setBackground('#EAF5EF');
  sheet.getRange(3, 9, rows, 7).setBackground('#FFF6E5');
  [56, 108, 110, 300, 120, 118, 110, 24, 56, 108, 110, 300, 120, 118, 110, 24, 130, 130]
    .forEach((w, idx) => sheet.setColumnWidth(idx + 1, w));
  sheet.getRange(3, 1, rows, 1).setHorizontalAlignment('center');
  sheet.getRange(3, 9, rows, 1).setHorizontalAlignment('center');
  sheet.getRange(3, 2, rows, 1).setNumberFormat('yyyy-mm-dd').setHorizontalAlignment('center');
  sheet.getRange(3, 10, rows, 1).setNumberFormat('yyyy-mm-dd').setHorizontalAlignment('center');
  sheet.getRange(3, 3, rows, 1).setHorizontalAlignment('center').setFontColor('#5F6368');
  sheet.getRange(3, 11, rows, 1).setHorizontalAlignment('center').setFontColor('#5F6368');
  sheet.getRange(3, 4, rows, 1).setWrap(true).setHorizontalAlignment('left');
  sheet.getRange(3, 12, rows, 1).setWrap(true).setHorizontalAlignment('left');
  sheet.getRange(3, 5, rows, 1).setNumberFormat('#,##0').setHorizontalAlignment('right');
  sheet.getRange(3, 13, rows, 1).setNumberFormat('#,##0').setHorizontalAlignment('right');
  sheet.getRange(3, 6, rows, 2).setHorizontalAlignment('center').setFontColor('#5F6368');
  sheet.getRange(3, 14, rows, 2).setHorizontalAlignment('center').setFontColor('#5F6368');
  sheet.getRange(2, 18, 4, 1).setNumberFormat('#,##0').setHorizontalAlignment('right');

  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(2, 1, rows + 1, 15).createFilter();

  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$F3="Đơn hàng sync"')
      .setBackground('#E8F0FE')
      .setRanges([sheet.getRange(3, 1, rows, 7)])
      .build(),
  ];
  sheet.setConditionalFormatRules(rules);
  setMocoHeaderNotes_(sheet, 2, {
    2: 'Ngày phát sinh khoản thu. Dùng filter để xem theo ngày/tháng.',
    3: 'Nhóm thu: Vốn, Đơn hàng, Thu khác.',
    4: 'Mô tả khoản thu. Dòng Đơn #... được đồng bộ từ ĐƠN HÀNG.',
    5: 'Số tiền vào. Tổng thu nằm ở ô R3.',
    10: 'Ngày phát sinh khoản chi.',
    11: 'Nhóm chi: Mua NVL, CCDC, TTB, Chi khác.',
    12: 'Mô tả khoản chi theo bản founder.',
    13: 'Số tiền ra. Tổng chi nằm ở ô R4.',
    18: 'Số dư cuối = Số dư đầu kỳ + Tổng thu - Tổng chi. Số dư đầu kỳ đang dùng: ' + Number(openingBalance || 0).toLocaleString('vi-VN') + '.',
  });
}

function MOCO_DEBUG_THU_CHI_PARALLEL() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName('THU CHI');
  if (!sheet) throw new Error('Không tìm thấy sheet THU CHI');
  return summarizeMocoThuChiParallelSheet_(sheet);
}

function summarizeMocoThuChiParallelSheet_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 3);
  const numRows = Math.max(lastRow - 2, 1);
  const thuDisplay = sheet.getRange(3, 1, numRows, 7).getDisplayValues();
  const thuValues = sheet.getRange(3, 1, numRows, 7).getValues();
  const chiDisplay = sheet.getRange(3, 9, numRows, 7).getDisplayValues();
  const chiValues = sheet.getRange(3, 9, numRows, 7).getValues();
  const thuRows = thuDisplay.filter(row => row.some(cell => String(cell || '').trim())).length;
  const chiRows = chiDisplay.filter(row => row.some(cell => String(cell || '').trim())).length;
  const thuRefCounts = {};
  const duplicateThuRefs = [];
  thuDisplay.forEach(row => {
    const ref = String(row[6] || '').trim();
    if (!ref) return;
    thuRefCounts[ref] = (thuRefCounts[ref] || 0) + 1;
  });
  Object.keys(thuRefCounts).forEach(ref => {
    if (thuRefCounts[ref] > 1) duplicateThuRefs.push({ ref, count: thuRefCounts[ref] });
  });
  const totalThu = thuValues.reduce((sum, row, idx) => {
    if (!thuDisplay[idx].some(cell => String(cell || '').trim())) return sum;
    return sum + parseMocoAuditMoney_(row[4] !== '' ? row[4] : thuDisplay[idx][4]);
  }, 0);
  const totalChi = chiValues.reduce((sum, row, idx) => {
    if (!chiDisplay[idx].some(cell => String(cell || '').trim())) return sum;
    return sum + parseMocoAuditMoney_(row[4] !== '' ? row[4] : chiDisplay[idx][4]);
  }, 0);
  const summaryValues = sheet.getRange(2, 17, 4, 2).getDisplayValues();
  return {
    sheetName: sheet.getName(),
    sideBySide: sheet.getRange(1, 1).getDisplayValue() === 'BẢNG THU' &&
      sheet.getRange(1, 9).getDisplayValue() === 'BẢNG CHI',
    leftTitle: sheet.getRange(1, 1).getDisplayValue(),
    rightTitle: sheet.getRange(1, 9).getDisplayValue(),
    thuHeader: sheet.getRange(2, 1, 1, 7).getDisplayValues()[0],
    chiHeader: sheet.getRange(2, 9, 1, 7).getDisplayValues()[0],
    thuRows,
    chiRows,
    totalThu,
    totalChi,
    net: totalThu - totalChi,
    sampleThuRows: thuDisplay
      .map((row, idx) => ({ rowNumber: idx + 3, row }))
      .filter(item => item.row.some(cell => String(cell || '').trim()))
      .slice(0, 40),
    duplicateThuRefs: duplicateThuRefs.slice(0, 30),
    summary: {
      openingBalance: parseMocoAuditMoney_(summaryValues[0][1]),
      totalThu: parseMocoAuditMoney_(summaryValues[1][1]),
      totalChi: parseMocoAuditMoney_(summaryValues[2][1]),
      finalBalance: parseMocoAuditMoney_(summaryValues[3][1]),
    },
    frozenRows: sheet.getFrozenRows(),
    filterRange: sheet.getFilter() ? sheet.getFilter().getRange().getA1Notation() : '',
  };
}

function mocoThuChiDateSortValue_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) return value.getTime();
  const raw = String(value || '').trim();
  let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  m = raw.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/);
  if (m) {
    let y = m[3] ? Number(m[3]) : new Date().getFullYear();
    if (y < 100) y += 2000;
    return new Date(y, Number(m[2]) - 1, Number(m[1])).getTime();
  }
  return 9999999999999;
}

function createMocoThuChiSheetBackup_(ss, sheet, prefix) {
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const base = (prefix || 'BACKUP_THU_CHI_') + stamp;
  const name = typeof uniqueSheetName_ === 'function' ? uniqueSheetName_(ss, base) : base;
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function MOCO_COMPACT_HOME_FOR_FOUNDER(ssArg, visibilityArg) {
  const ss = ssArg || getMocoSpreadsheet_();
  let sheet = ss.getSheetByName('HOME');
  if (!sheet) sheet = ss.insertSheet('HOME');
  const visibility = visibilityArg || (typeof readMocoHomeVisibilityState_ === 'function' ? readMocoHomeVisibilityState_(sheet) : {});
  sheet.clear().clearFormats().clearConditionalFormatRules();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();

  const rows = [
    ['Bắt đầu', 'ĐƠN HÀNG', visibility['ĐƠN HÀNG'] || 'Hiện', 'Nhập/xem đơn bán', 'Tên món, SL, giá, trạng thái thanh toán', 'Tạo doanh thu sync sang THU CHI', 'Founder thao tác', 'Tên món dùng dropdown/menu chuẩn.'],
    ['Bắt đầu', 'NHẬP HÀNG', visibility['NHẬP HÀNG'] || 'Hiện', 'Nhập hóa đơn mua NVL', 'Tên hàng, NCC, SL, quy cách, giá nhập', 'Cập nhật giá vốn nguyên liệu', 'Founder thao tác', 'Giá thật ưu tiên hơn giá tạm.'],
    ['Công thức', 'CÔNG THỨC', visibility['CÔNG THỨC'] || 'Hiện', 'Khai báo mẻ bánh', 'Nguyên liệu, định lượng, thành phẩm/mẻ', 'Làm nền cho cost', 'Founder/R&D', 'Sửa nguồn ở đây nếu cost sai do yield.'],
    ['Menu', 'MENU & GIÁ', visibility['MENU & GIÁ'] || 'Hiện', 'Quản lý món bán', 'SKU, tên món bán, quy cách, giá bán', 'Tính food cost/lãi', 'Founder thao tác', 'Chỉ đưa món bán cho khách.'],
    ['Audit', 'THÀNH PHẨM/MẺ', visibility['THÀNH PHẨM/MẺ'] || 'Hiện', 'Kiểm tra yield/cost theo món', 'Không nhập tay nếu không cần audit', 'Giải thích cost/mẻ', 'Xem/audit', 'Tên món đã đồng bộ màu/dropdown.'],
    ['Kết quả', 'COST & GIÁ', visibility['COST & GIÁ'] || 'Hiện', 'Xem giá/cost/lãi', 'Không nhập trực tiếp', 'Ra quyết định giá', 'Founder xem', 'Nếu có cảnh báo, mở VIỆC CẦN LÀM.'],
    ['Action', 'VIỆC CẦN LÀM', visibility['VIỆC CẦN LÀM'] || 'Hiện', 'Danh sách lỗi cần xử lý', 'Làm P0/P1 trước', 'Số liệu sạch hơn', 'Founder thao tác', 'Mở link để sửa đúng sheet nguồn.'],
    ['Tài chính', 'THU CHI', visibility['THU CHI'] || 'Hiện', 'Theo dõi dòng tiền', 'Chi phí từ founder, doanh thu từ đơn hàng sync', 'Dashboard tài chính', 'Founder thao tác', 'Không nhập trùng doanh thu ĐƠN HÀNG.'],
    ['Báo cáo', 'DASHBOARD', visibility['DASHBOARD'] || 'Hiện', 'Xem tổng hợp vận hành', 'Không nhập trực tiếp', 'Theo dõi doanh thu/thu chi', 'Founder xem', 'Đọc sau khi dữ liệu nguồn sạch.'],
    ['Cấu hình', 'COST CFG', visibility['COST CFG'] || 'Ẩn', 'Giả định tính giá', 'Target food cost, fixed cost, margin', 'Ảnh hưởng COST & GIÁ', 'Admin', 'Ẩn để founder không bị quá tải.'],
  ];
  rows.forEach(row => {
    if (row[1] === 'HOME') row[2] = 'Hiện';
    if (visibility[row[1]] === 'Hiện' || visibility[row[1]] === 'Ẩn') row[2] = visibility[row[1]];
  });

  sheet.getRange(1, 1, 1, 8).merge()
    .setValue('MOCO KITCHEN - FOUNDER HOME')
    .setFontWeight('bold')
    .setFontSize(16)
    .setBackground('#2F6B53')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 1, 1, 8).merge()
    .setValue('Trang này chỉ là bảng điều hướng. Hướng dẫn chi tiết đã chuyển về note/header trong từng sheet.')
    .setBackground('#E6F4EA')
    .setFontColor('#174EA6')
    .setWrap(true);
  const headers = ['Nhóm', 'Sheet', 'Hiện/Ẩn', 'Dùng để làm gì', 'Nhập/sửa gì', 'Kết quả', 'Ai dùng', 'Lưu ý ngắn'];
  sheet.getRange(4, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(5, 1, rows.length, headers.length).setValues(rows);
  rows.forEach((row, index) => {
    const target = ss.getSheetByName(row[1]);
    if (target) sheet.getRange(5 + index, 2).setFormula('=HYPERLINK("#gid=' + target.getSheetId() + '";"' + row[1] + '")');
  });
  const quickStartRow = 5 + rows.length + 2;
  const quickRows = [
    ['Hôm nay bán hàng', 'ĐƠN HÀNG', 'Nhập đơn và trạng thái thanh toán.'],
    ['Hôm nay mua nguyên liệu', 'NHẬP HÀNG', 'Nhập hóa đơn để cost tự cập nhật.'],
    ['Muốn xem giá/cost', 'COST & GIÁ', 'Xem kết quả, không sửa tay.'],
    ['Muốn xử lý lỗi', 'VIỆC CẦN LÀM', 'Làm P0/P1 trước.'],
    ['Muốn xem tiền', 'THU CHI', 'Doanh thu đơn sync, chi phí theo founder.'],
  ];
  sheet.getRange(quickStartRow, 1, 1, 3).merge()
    .setValue('Mở nhanh theo nhu cầu')
    .setFontWeight('bold')
    .setBackground('#F1F3F4');
  sheet.getRange(quickStartRow + 1, 1, 1, 3).setValues([['Nhu cầu', 'Mở sheet', 'Ghi chú']]).setFontWeight('bold');
  sheet.getRange(quickStartRow + 2, 1, quickRows.length, 3).setValues(quickRows);
  quickRows.forEach((row, index) => {
    const target = ss.getSheetByName(row[1]);
    if (target) sheet.getRange(quickStartRow + 2 + index, 2).setFormula('=HYPERLINK("#gid=' + target.getSheetId() + '";"' + row[1] + '")');
  });

  [130, 210, 90, 260, 300, 240, 130, 300].forEach((width, idx) => sheet.setColumnWidth(idx + 1, width));
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 8).setWrap(true).setVerticalAlignment('middle');
  sheet.setFrozenRows(4);
  setMocoHeaderNotes_(sheet, 4, {
    1: 'Nhóm chức năng để founder định hướng nhanh.',
    2: 'Click để mở sheet.',
    3: 'Hiện/Ẩn tab. HOME không tự ẩn.',
    4: 'Mục đích ngắn, không thay hướng dẫn chi tiết.',
    5: 'Dữ liệu cần nhập/sửa tại sheet đó.',
    6: 'Kết quả liên quan.',
    7: 'Vai trò thường dùng sheet.',
    8: 'Cảnh báo ngắn để tránh sửa nhầm.',
  });
  if (typeof applyMocoHomeUi_ === 'function') applyMocoHomeUi_(ss);
  applyMocoInlineGuidanceNotes_(ss);
  return {
    sheet: 'HOME',
    mode: 'compact_founder_home',
    rows: rows.length,
    quickRows: quickRows.length,
    notesApplied: true,
  };
}

function applyMocoInlineGuidanceNotes_(ss) {
  const specs = [
    {
      sheet: 'ĐƠN HÀNG',
      row: 1,
      notes: {
        1: 'Mã đơn. Một đơn nhiều món có thể lặp mã ở nhiều dòng.',
        8: 'Tên bánh/món bán. Chọn từ dropdown để khớp MENU & GIÁ.',
        14: 'Doanh thu sau chiết khấu. THU CHI đọc cột này khi trạng thái là Đã nhận tiền.',
        17: 'Khi chuyển sang Đã nhận tiền, hệ thống sync doanh thu sang THU CHI.',
      },
    },
    {
      sheet: 'THU CHI',
      row: 1,
      notes: {
        3: 'Nhóm giao dịch để lọc nhanh.',
        4: 'Doanh thu đơn hàng giữ từ ĐƠN HÀNG sync. Chi phí và thu/chi khác lấy theo bản founder.',
        5: 'Không nhập trùng doanh thu từ ĐƠN HÀNG.',
        6: 'Chi phí/NVL/vận hành có thể nhập hoặc lấy từ bản founder.',
        8: 'Nguồn giúp audit: Đơn hàng sync hoặc Founder copy.',
        9: 'Mã tham chiếu để chống trùng khi sync.',
      },
    },
    {
      sheet: 'NHẬP HÀNG',
      row: 1,
      notes: {
        2: 'Tên hàng hóa nên dùng thống nhất để Master NVL nhận diện đúng.',
        5: 'Số lượng mua thực tế.',
        6: 'Quy cách mua, ví dụ 1kg/gói/chai.',
        8: 'Tổng giá nhập của lần mua.',
      },
    },
    {
      sheet: 'CÔNG THỨC',
      row: 1,
      notes: {
        1: 'Tên công thức/món làm.',
        3: 'Nguyên liệu phải khớp Master NVL hoặc alias.',
        5: 'Định lượng theo 1 mẻ.',
        8: 'Thành phẩm/mẻ là đầu vào quan trọng để tính cost đơn vị bán.',
      },
    },
    {
      sheet: 'MENU & GIÁ',
      row: 4,
      notes: {
        2: 'Tên món bán cho khách. Đây là tên dùng trong ĐƠN HÀNG.',
        4: 'Quy cách bán, ví dụ hộp/miếng/size.',
        5: 'Giá bán hiện tại founder có thể sửa.',
        10: 'Trạng thái bán: đang bán, review, tạm ngưng.',
      },
    },
    {
      sheet: 'THÀNH PHẨM/MẺ',
      row: 5,
      notes: {
        2: 'Tên món bán đã đồng bộ dropdown/màu với ĐƠN HÀNG.',
        5: 'Thành phẩm từ công thức. Nếu sai, sửa ở CÔNG THỨC.',
        12: 'Cảnh báo kỹ thuật cần xử lý trước khi tin số cost.',
      },
    },
    {
      sheet: 'COST & GIÁ',
      row: 4,
      notes: {
        1: 'SKU/món bán.',
        4: 'Cost nguyên liệu tính từ công thức và giá nhập.',
        7: 'Food cost % theo giá bán hiện tại.',
        14: 'Link mở nơi cần sửa nếu có cảnh báo.',
      },
    },
    {
      sheet: 'VIỆC CẦN LÀM',
      row: 4,
      notes: {
        1: 'Ưu tiên xử lý. Làm P0/P1 trước.',
        4: 'Việc cần làm cụ thể.',
        5: 'Link đến đúng sheet nguồn để sửa.',
        7: 'Trạng thái/cảnh báo hiện tại.',
      },
    },
  ];
  const applied = [];
  specs.forEach(spec => {
    const sheet = ss.getSheetByName(spec.sheet);
    if (!sheet) return;
    setMocoHeaderNotes_(sheet, spec.row, spec.notes);
    applied.push(spec.sheet);
  });
  return applied;
}

function MOCO_SYNC_ORDER_SHEET_FROM_SOURCE(sourceSheetName) {
  const ss = getMocoSpreadsheet_();
  const source = findMocoOrderSourceSheet_(ss, sourceSheetName);
  if (!source) throw new Error('Không tìm thấy sheet nguồn: ' + (sourceSheetName || 'Bản sao của Đơn đặt hàng'));
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const copyName = uniqueSheetName_(ss, 'ORDER_SOURCE_COPY_' + stamp);
  const copy = source.copyTo(ss).setName(copyName);
  try { copy.hideSheet(); } catch (err) {}

  return {
    synced: false,
    sourceSheet: source.getName(),
    copiedToHiddenSheet: copyName,
    targetSheet: 'ĐƠN HÀNG',
    note: 'Không ghi đè trực tiếp ĐƠN HÀNG nữa. Dùng standardize-orders để migrate sang form chuẩn.',
  };
}

function MOCO_FOCUS_FOUNDER_SHEETS() {
  const ss = getMocoSpreadsheet_();
  const visibleNames = [
    'HOME',
    'ĐƠN HÀNG',
    'NHẬP HÀNG',
    'CÔNG THỨC',
    'MENU & GIÁ',
    'COST & GIÁ',
    'VIỆC CẦN LÀM',
    'THU CHI',
    'DASHBOARD',
  ];
  const visibleSet = visibleNames.reduce((out, name) => {
    out[normText_(name)] = true;
    return out;
  }, {});
  const visible = [];
  const hidden = [];
  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    if (visibleSet[normText_(name)]) {
      sheet.showSheet();
      visible.push(name);
      return;
    }
    try {
      sheet.hideSheet();
      hidden.push(name);
    } catch (err) {}
  });

  visibleNames.slice().reverse().forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet || sheet.isSheetHidden()) return;
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  });
  const home = ss.getSheetByName('HOME') || ss.getSheetByName('ĐƠN HÀNG');
  if (home) ss.setActiveSheet(home);

  return {
    visible,
    hidden,
    mode: 'founder_focus',
    note: 'Chỉ hiện sheet nhập/xem chính; sheet kỹ thuật, backup, source copy và audit được ẩn.',
  };
}

function findMocoOrderSourceSheet_(ss, preferredName) {
  const exactNames = [];
  if (preferredName) exactNames.push(String(preferredName).trim());
  exactNames.push('Bản sao của Đơn đặt hàng', 'Đơn đặt hàng', 'Don dat hang');
  for (let i = 0; i < exactNames.length; i++) {
    const name = exactNames[i];
    if (!name) continue;
    const sheet = ss.getSheetByName(name);
    if (sheet) return sheet;
  }
  const targetKey = normText_('Đơn đặt hàng');
  return ss.getSheets().find(sheet => {
    const key = normText_(sheet.getName());
    return key !== normText_('ĐƠN HÀNG') && key.indexOf(targetKey) >= 0;
  }) || null;
}

function backupMocoOrderSheet_(ss, sheet) {
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  const name = 'BACKUP_DON_HANG_' + stamp;
  sheet.copyTo(ss).setName(name).hideSheet();
  return name;
}

function searchMocoOrderSourceSpreadsheets_(query) {
  const safe = String(query || '').replace(/'/g, "\\'");
  const files = DriveApp.searchFiles(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and title contains '" + safe + "'"
  );
  const out = [];
  while (files.hasNext() && out.length < 10) {
    const file = files.next();
    out.push({
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl(),
      lastUpdated: file.getLastUpdated(),
      owner: file.getOwner() ? file.getOwner().getEmail() : '',
    });
  }
  return out;
}

function summarizeMocoSourceSpreadsheet_(ss) {
  const sheets = ss.getSheets().map(sheet => summarizeMocoOrderSheet_(ss, sheet));
  return {
    id: ss.getId(),
    name: ss.getName(),
    url: ss.getUrl(),
    sheets,
  };
}

function summarizeMocoOrderSheet_(ss, sheet) {
  if (!sheet) return null;
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  const readRows = Math.min(Math.max(lastRow, 1), 25);
  const readCols = Math.min(Math.max(lastColumn, 1), 20);
  const values = sheet.getRange(1, 1, readRows, readCols).getDisplayValues();
  const formulaFlags = sheet.getRange(1, 1, readRows, readCols).getFormulas()
    .map(row => row.map(value => Boolean(value)));
  const mergedRanges = sheet.getRange(1, 1, readRows, readCols).getMergedRanges()
    .map(range => range.getA1Notation());
  const nonEmptyRows = values
    .map((row, index) => ({ rowNumber: index + 1, row }))
    .filter(item => item.row.some(cell => String(cell || '').trim()));
  return {
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    sheetName: sheet.getName(),
    sheetId: sheet.getSheetId(),
    lastRow,
    lastColumn,
    mergedRanges,
    previewRange: sheet.getName() + '!A1:' + colLetter_(readCols) + readRows,
    nonEmptyRows,
    formulaFlags,
  };
}

function parseWebAppPayload_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('Invalid JSON payload');
  }
}

function assertWebAppToken_(providedToken) {
  const expectedToken = PropertiesService.getScriptProperties()
    .getProperty(WEB_APP_TOKEN_PROPERTY);
  if (!expectedToken && !TEMP_WEB_APP_TOKEN) {
    throw new Error('Web App token is not configured in Script Properties: ' + WEB_APP_TOKEN_PROPERTY);
  }
  const provided = String(providedToken || '');
  if (!provided || (String(expectedToken || '') !== provided && String(TEMP_WEB_APP_TOKEN || '') !== provided)) {
    throw new Error('Unauthorized: invalid token');
  }
}

function setWebAppToken_(newToken) {
  const token = String(newToken || '').trim();
  if (token.length < 32) {
    throw new Error('New Web App token must be at least 32 characters.');
  }
  PropertiesService.getScriptProperties().setProperty(WEB_APP_TOKEN_PROPERTY, token);
  return {
    property: WEB_APP_TOKEN_PROPERTY,
    configured: true,
    tokenLength: token.length,
  };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStatus_() {
  const ss = getMocoSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + SHEET_NAME);

  const lastCol = Math.min(sheet.getLastColumn(), 21);
  const header = lastCol
    ? sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0]
    : [];
  const selectedItem = String(sheet.getRange('M2').getDisplayValue() || '').trim();

  return {
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn(),
    selectedItem,
    header,
    timestamp: new Date().toISOString(),
  };
}

function buildCleanPreview_(ss, sheet, sourceSheet, records) {
  const issueRows = records.filter(r => String(r[9] || '').indexOf('Cần kiểm tra') >= 0).length;
  const sourceName = sourceSheet ? sourceSheet.getName() : sheet.getName();
  const header = sheet.getLastColumn()
    ? sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 21)).getDisplayValues()[0]
    : [];

  return {
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    sheetName: sheet.getName(),
    sourceSheetName: sourceName,
    currentRows: Math.max(sheet.getLastRow() - 1, 0),
    normalizedRows: records.length,
    rowsNeedReview: issueRows,
    currentHeader: header,
    sampleRows: records.slice(0, 5),
    written: false,
    timestamp: new Date().toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseWeightText_(text) {
  const src = String(text || '').trim();
  const m = src.match(/([\d.,]+)\s*([^\d\s]*)/i);
  if (!m) return { quantity: '', unit: '', note: 'Cần kiểm tra' };

  const amt = parseNumber_(m[1]);
  if (!amt) return { quantity: '', unit: '' };

  const rawUnit = normText_(m[2] || '');
  if (['kg','kilogram','kilogam'].includes(rawUnit)) return { quantity: amt * 1000, unit: 'g' };
  if (['g','gr','gram'].includes(rawUnit)) return { quantity: amt, unit: 'g' };
  if (['l','lit','litre','liter','lit'].includes(rawUnit) || src.toLowerCase().includes('lít')) {
    return { quantity: amt * 1000, unit: 'ml' };
  }
  if (['ml','mililit'].includes(rawUnit)) return { quantity: amt, unit: 'ml' };
  if (['q'].includes(rawUnit)) return { quantity: amt, unit: '\u0071\u0075\u1ea3' };
  if (['c','vien'].includes(rawUnit)) return { quantity: amt, unit: 'c\u00e1i' };
  if (['goi'].includes(rawUnit)) return { quantity: amt, unit: 'g\u00f3i' };
  if (['h','hop'].includes(rawUnit)) return { quantity: amt, unit: 'h\u1ed9p' };
  if (['chai'].includes(rawUnit)) return { quantity: amt, unit: 'chai' };
  if (['la'].includes(rawUnit)) return { quantity: amt, unit: 'l\u00e1' };
  if (['qua'].includes(rawUnit)) return { quantity: amt, unit: 'quả' };
  if (['cai'].includes(rawUnit)) return { quantity: amt, unit: 'cái' };
  if (['bo'].includes(rawUnit)) return { quantity: amt, unit: 'bộ' };
  if (['tui'].includes(rawUnit)) return { quantity: amt, unit: 'túi' };

  // No unit parsed but number found — return amount with no unit
  return { quantity: amt, unit: '' };
}

function parsePrice_(v) {
  if (typeof v === 'number') return v;
  const t = String(v || '').trim();
  if (!t) return '';
  const d = t.replace(/[^\d]/g, '');
  return d ? Number(d) : '';
}

function calcBaseUnitPrice_(price, slMua, quyCach, unit) {
  const totalPrice = Number(price) || 0;
  const packs = Number(slMua) || 0;
  const packSize = Number(quyCach) || 0;
  const u = String(unit || '').trim().toLowerCase();
  if (!totalPrice || !packs) return '';
  if (!u) return '';
  if ((u === 'g' || u === 'ml') && packSize) {
    return totalPrice / (packs * packSize);
  }
  if (u === 'g' || u === 'ml') return '';
  return totalPrice / packs;
}

function applyUnitPriceFormulas_(sheet, lastRow) {
  const rowCount = Math.max((lastRow || sheet.getLastRow()) - 1, 0);
  if (!rowCount) return;

  const idx = getNhapHangFormulaIndexes_(sheet);
  sheet.getRange(1, idx.priceCol + 1).setValue('GIÁ NHẬP');
  sheet.getRange(1, idx.unitPriceCol + 1).setValue('ĐƠN GIÁ / 1 ĐV');
  if (idx.priceCol !== idx.unitPriceCol) {
    const priceRange = sheet.getRange(2, idx.priceCol + 1, rowCount, 1);
    const priceValues = priceRange.getValues();
    const priceFormulas = priceRange.getFormulas();
    let changed = false;
    for (let i = 0; i < priceValues.length; i++) {
      if (priceFormulas[i][0]) {
        priceValues[i][0] = '';
        changed = true;
      }
    }
    if (changed) priceRange.setValues(priceValues);
  }

  const formulas = [];
  for (let row = 2; row <= rowCount + 1; row++) {
    const name = '$' + colLetter_(idx.nameCol + 1) + row;
    const price = '$' + colLetter_(idx.priceCol + 1) + row;
    const qty = '$' + colLetter_(idx.qtyCol + 1) + row;
    const packSize = '$' + colLetter_(idx.packCol + 1) + row;
    const unit = '$' + colLetter_(idx.unitCol + 1) + row;
    formulas.push([
      '=IF(' + name + '="";"";IF(OR(' + price + '="";' + qty + '="";' + unit + '="");NA();IF(OR(LOWER(' + unit + ')="g";LOWER(' + unit + ')="ml");IF(' + packSize + '="";NA();' + price + '/(' + qty + '*' + packSize + '));' + price + '/' + qty + ')))',
    ]);
  }
  sheet.getRange(2, idx.unitPriceCol + 1, rowCount, 1).setFormulas(formulas);
}

function getNhapHangFormulaIndexes_(sheet) {
  const headers = sheet.getRange(1, 1, 1, 10).getDisplayValues()[0]
    .map(normHeader_);
  const hasBrand = headers.some(h => h === 'ncc' || h === 'brand' || h.indexOf('nha cung cap') >= 0);
  return {
    dateCol: findHeaderIndex_(headers, h => h.indexOf('nhap') >= 0 || h.indexOf('ngay') >= 0, 0),
    nameCol: findHeaderIndex_(headers, h => h.indexOf('ten hang') >= 0 || h.indexOf('ten nvl') >= 0, 1),
    supplierCol: findHeaderIndex_(headers, h => h === 'ncc' || h === 'brand' || h.indexOf('nha cung cap') >= 0, hasBrand ? 2 : -1),
    qtyCol: findHeaderIndex_(headers, h => h === 'sl' || h.indexOf('sl mua') >= 0, hasBrand ? 4 : 3),
    packCol: findHeaderIndex_(headers, h => h.indexOf('quy cach') >= 0, hasBrand ? 5 : 4),
    unitCol: findHeaderIndex_(headers, h => h === 'don vi', hasBrand ? 6 : 5),
    priceCol: findHeaderIndex_(headers, h => h.indexOf('gia nhap') >= 0, hasBrand ? 7 : 6),
    unitPriceCol: findHeaderIndex_(headers, h => h.indexOf('don gia') >= 0 && h.indexOf('1 dv') >= 0, hasBrand ? 8 : 7, true),
  };
}

function findHeaderIndex_(headers, predicate, fallback, fromEnd) {
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

function normHeader_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

function colLetter_(col) {
  let out = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    col = Math.floor((col - 1) / 26);
  }
  return out;
}

function parseNumber_(v) {
  if (typeof v === 'number') return v;
  const t = String(v || '').trim();
  if (!t) return '';
  const n = Number(t.replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : '';
}

function classifyItem_(name) {
  const n = normText_(name);
  if (hasAny_(n,['mang boc','tui','hop','giay','khay'])) return 'Bao bì';
  if (hasAny_(n,['can ','may ','nhiet','dao','ra ','thot','khuon','au ','bay','ep '])) return 'Dụng cụ';
  if (hasAny_(n,['trung'])) return 'Trứng';
  if (hasAny_(n,['sua','bo lat','whipping','cream','cheese','mascap','mascarp','yogurt'])) return 'Sữa/bơ/kem';
  if (hasAny_(n,['chuoi','chanh','cam','tao','xoai','dau tay','viet quat','carot','ca rot','buoi'])) return 'Trái cây';
  if (hasAny_(n,['hanh nhan','dieu','hat chia','hat bi','oc cho','mac ca','me den','me trang','dieu'])) return 'Hạt';
  if (hasAny_(n,['bot','duong','cacao','socola','chocolate','vani','syrup','siro','dau dua','rong bien','yen mach','xanthan','men '])) return 'Nguyên liệu khô';
  return 'Khác';
}

function inferUnit_(name, cat) {
  const n = normText_(name);
  if (hasAny_(n,['trung'])) return 'quả';
  if (cat === 'Bao bì') return hasAny_(n,['tui']) ? 'túi' : 'cái';
  if (cat === 'Dụng cụ') return hasAny_(n,['bo ']) ? 'bộ' : 'cái';
  return '';
}

function chooseDefault_(records) {
  const counts = {};
  records.forEach(r => { const n = r[1]; counts[n] = (counts[n]||0)+1; });
  const pref = ['Đường ăn kiêng Allulose','Bột hạnh nhân','Sữa tươi không đường TH','Whipping Cream Anchor 1kg'];
  for (const p of pref) if (counts[p]) return p;
  return Object.keys(counts).find(k => counts[k] > 1) || (records[0] ? records[0][1] : '');
}

function parseDate_(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  const t = String(v||'').trim();
  const m = t.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/);
  if (!m) return v || '';
  let y = m[3] ? Number(m[3]) : new Date().getFullYear();
  if (y < 100) y += 2000;
  return new Date(y, Number(m[2])-1, Number(m[1]));
}

function dateSortVal_(v) {
  if (v instanceof Date && !isNaN(v)) return v.getTime();
  const p = parseDate_(v);
  return p instanceof Date && !isNaN(p) ? p.getTime() : 0;
}

function getCell_(row, dis, idx) {
  if (idx < 0) return '';
  const v = row[idx];
  return (v !== '' && v !== null && v !== undefined) ? v : (dis[idx] || '');
}

function findCol_(headers, candidates) {
  for (const c of candidates) {
    const i = headers.findIndex(h => h.includes(normText_(c)));
    if (i >= 0) return i;
  }
  return -1;
}

function normText_(v) {
  return String(v||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/\s+/g,' ').trim();
}

function hasAny_(text, needles) {
  return needles.some(n => text.includes(n));
}

function uniqueNotes_(notes) {
  return [...new Set(notes.filter(Boolean).map(n => String(n).trim()))].join(' | ');
}
