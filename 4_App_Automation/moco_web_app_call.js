#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIRM = 'RUN_CLEAN_NHAP_HANG';
const DEFAULT_ENV_FILE = path.join(__dirname, 'moco_web_app.env');
const ACTION_ALIASES = {
  ping: 'status',
  dropdown: 'refresh_data_validation_lists',
  dropdowns: 'refresh_data_validation_lists',
  lists: 'refresh_data_validation_lists',
  'audit-recipe-names': 'audit_recipe_ingredient_names',
  'fix-recipe-names': 'fix_recipe_ingredient_names',
  'backfill-thu': 'backfill_thu_chi',
  'update-thu-chi': 'backfill_thu_chi',
  history: 'refresh_history',
  master: 'refresh_master_nvl',
  founder: 'refresh_founder_action',
  focus: 'focus_founder_sheets',
  guide: 'apply_guide_and_notes',
  ui: 'apply_new_table_ui',
  vinegar: 'append_vinegar_purchase',
  fixcost: 'moco_quick_fix_cost_links',
  'fix-cost': 'moco_quick_fix_cost_links',
  issues: 'cost_review_snapshot',
  'dashboard-current': 'debug_dashboard_snapshot',
  'menu-current': 'debug_menu_snapshot',
  'order-audit': 'debug_order_import_audit',
  'order-current': 'debug_current_order_sheet',
  'order-ui': 'apply_order_ui_safe',
  'order-dropdown-ui': 'sync_order_dropdown_ui',
  'order-notes': 'apply_order_audit_notes',
  'order-buffer': 'setup_order_copy_buffer',
  'home-current': 'debug_home_sheet',
  'home-scroll': 'fix_home_scroll',
  'yield-ui': 'sync_yield_item_ui',
  'validation-ui': 'fix_validation_sheets_ui',
  'fix-validation-ui': 'fix_validation_sheets_ui',
  'audit-thu-chi': 'audit_thu_chi_copy',
  'thu-chi-audit': 'audit_thu_chi_copy',
  'thu-chi-current': 'debug_thu_chi_parallel',
  'thu-chi-layout': 'debug_thu_chi_parallel',
  'repair-thu-chi-orders': 'repair_thu_chi_order_sync',
  'cleanup-hidden-sheets': 'cleanup_order_hidden_sheets',
  'audit-temp-sheets': 'audit_temp_sheets',
  'cleanup-temp-sheets': 'cleanup_temp_sheets',
  'reconcile-thu-chi': 'reconcile_thu_chi_copy',
  'compact-home': 'compact_home_founder',
  'sync-orders': 'sync_order_sheet_from_source',
  'import-source': 'import_public_source_tabs',
  'merge-source': 'merge_public_source_tabs',
  'repair-source-merge': 'repair_public_source_merge',
  'repair-direct-tabs': 'repair_direct_source_tabs',
  'dedupe-nhap': 'dedupe_nhap_hang_merge_keys',
  'dedupe-nhap-strict': 'dedupe_nhap_hang_strict_keys',
  'validate-nhap-ai': 'validate_nhap_hang_ai_fix',
  'standardize-orders': 'standardize_orders',
  'repair-order-source': 'repair_order_source_channel',
  'founder-order-view': 'apply_founder_order_view',
  'delete-order-staging': 'delete_order_staging_sheets',
  'delete-name-review': 'delete_obsolete_name_review_sheets',
  all: 'update_all_data',
};

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function readArg(name) {
  const i = process.argv.indexOf(name);
  if (i < 0 || i + 1 >= process.argv.length) return '';
  return process.argv[i + 1];
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function usage() {
  console.error([
    'Usage:',
    '  .\\MOCO.cmd status',
    '  .\\MOCO.cmd dropdowns',
    '  .\\MOCO.cmd fixcost',
    '  .\\MOCO.cmd ui',
    '  .\\MOCO.cmd order-audit',
    '  .\\MOCO.cmd order-current',
    '  .\\MOCO.cmd merge-source --source-id <spreadsheetId>',
    '  .\\MOCO.cmd all',
    '',
    'Aliases:',
    '  ping=status, dropdowns=refresh_data_validation_lists, vinegar=append_vinegar_purchase, fixcost=moco_quick_fix_cost_links, issues=cost_review_snapshot, order-audit=debug_order_import_audit, order-current=debug_current_order_sheet, merge-source=merge_public_source_tabs, import-source=import_public_source_tabs, history=refresh_history, master=refresh_master_nvl, founder=refresh_founder_action, guide=apply_guide_and_notes, ui=apply_new_table_ui, all=update_all_data',
    '',
    '  node moco_web_app_call.js status',
    '  node moco_web_app_call.js refresh_data_validation_lists',
    '  node moco_web_app_call.js set_web_app_token --new-token <token>',
    '',
    'Config:',
    '  Defaults are read from local moco_web_app.env if present.',
    '  MOCO_WEB_APP_URL="https://script.google.com/macros/s/..." MOCO_WEB_APP_TOKEN="..." node moco_web_app_call.js status',
    '  MOCO_WEB_APP_URL="..." MOCO_WEB_APP_TOKEN="..." node moco_web_app_call.js refresh_history',
    '  MOCO_WEB_APP_URL="..." MOCO_WEB_APP_TOKEN="..." node moco_web_app_call.js refresh_data_validation_lists',
    '  MOCO_WEB_APP_URL="..." MOCO_WEB_APP_TOKEN="..." node moco_web_app_call.js clean_nhap_hang',
    '  MOCO_WEB_APP_URL="..." MOCO_WEB_APP_TOKEN="..." node moco_web_app_call.js clean_nhap_hang --write',
    '',
    'Options:',
    '  --url <url>       Override MOCO_WEB_APP_URL.',
    '  --token <token>   Override MOCO_WEB_APP_TOKEN.',
    '  --new-token <t>   Token to store via set_web_app_token.',
    '  --write           Run clean_nhap_hang for real. Default is dry-run.',
    '  --reset-ui        Allow setup to reset sheet UI/format. Default preserves UI.',
    '  --source <mode>   current or latest_backup. Default is current.',
  ].join('\n'));
}

async function main() {
  loadLocalEnv(DEFAULT_ENV_FILE);

  const actionArg = process.argv[2];
  if (!actionArg || actionArg === '-h' || actionArg === '--help') {
    usage();
    process.exit(actionArg ? 0 : 1);
  }
  const action = ACTION_ALIASES[actionArg] || actionArg;

  const url = readArg('--url') || process.env.MOCO_WEB_APP_URL;
  const token = readArg('--token') || process.env.MOCO_WEB_APP_TOKEN;
  if (!url || !token) {
    usage();
    throw new Error('Missing MOCO_WEB_APP_URL or MOCO_WEB_APP_TOKEN');
  }

  const write = hasFlag('--write');
  const payload = {
    token,
    action,
  };

  if (action === 'clean_nhap_hang') {
    payload.dryRun = !write;
    payload.preserveUi = !hasFlag('--reset-ui');
    payload.sourceMode = readArg('--source') || 'current';
    if (write) payload.confirm = DEFAULT_CONFIRM;
  }

  if (action === 'cleanup_temp_sheets') {
    payload.dryRun = !write;
    if (write) payload.confirm = 'RUN_CLEAN_TEMP_SHEETS';
  }

  if (action === 'set_web_app_token') {
    payload.newToken = readArg('--new-token') || process.env.MOCO_WEB_APP_NEW_TOKEN || '';
  }

  if (action === 'debug_order_import_audit') {
    payload.query = readArg('--query') || process.env.MOCO_ORDER_SOURCE_QUERY || '';
    payload.sourceSpreadsheetId = readArg('--source-id') || process.env.MOCO_ORDER_SOURCE_SPREADSHEET_ID || '';
  }

  if (action === 'sync_order_sheet_from_source') {
    payload.sourceSheetName = readArg('--source-sheet') || process.env.MOCO_ORDER_SOURCE_SHEET || '';
  }

  if (action === 'import_public_source_tabs' || action === 'merge_public_source_tabs' || action === 'repair_public_source_merge' || action === 'repair_direct_source_tabs' || action === 'dedupe_nhap_hang_merge_keys' || action === 'dedupe_nhap_hang_strict_keys' || action === 'validate_nhap_hang_ai_fix' || action === 'repair_order_source_channel' || action === 'apply_founder_order_view') {
    payload.dryRun = !write;
    payload.sourceSpreadsheetId = readArg('--source-id') || process.env.MOCO_SOURCE_SPREADSHEET_ID || '';
    const sourceJson = readArg('--source-json') || '';
    if (sourceJson) {
      payload.sourceTabsData = JSON.parse(fs.readFileSync(sourceJson, 'utf8').replace(/^\uFEFF/, ''));
    }
    const tabs = readArg('--tabs');
    if (tabs) {
      payload.tabs = tabs.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (write) payload.confirm = 'RUN_MERGE_PUBLIC_SOURCE_TABS';
  }

  if (action === 'standardize_orders') {
    payload.dryRun = !write;
    payload.fromBackup = hasFlag('--from-backup');
  }

  if (action === 'apply_order_ui_safe') {
    payload.dryRun = !write;
  }

  if (action === 'sync_order_dropdown_ui' || action === 'fix_home_scroll' || action === 'sync_yield_item_ui') {
    payload.dryRun = !write;
  }

  if (action === 'audit_thu_chi_copy') {
    payload.sourceSheetName = readArg('--source-sheet') || process.env.MOCO_THU_CHI_SOURCE_SHEET || '';
  }

  if (action === 'reconcile_thu_chi_copy') {
    payload.dryRun = !write;
    payload.sourceSheetName = readArg('--source-sheet') || process.env.MOCO_THU_CHI_SOURCE_SHEET || '';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch (err) {
    console.log(text);
  }

  if (!res.ok) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
