---
id: "20260514084755"
aliases: ["MOCO Handoff - Order Sync, Sheet Cleanup, Founder Focus UI"]
tags: ["#moco", "#google-ai"]
created: 2026-05-14
updated: 2026-05-16
---
# MOCO Handoff - Order Sync, Sheet Cleanup, Founder Focus UI

Date: 2026-05-14
Machine: Windows `C:\Antigravity\AI_Command_Center`
Owner Web App account: `vuagiobao@gmail.com`
Live spreadsheet: `1dZDkHLBRnZcD9FE-MVaRzIp1c0t69XhDNXxAY39vv4Y`

## Summary

This handoff records the MOCO Google Sheet/AppScript work completed on Windows before syncout to Mac.

Main result:

- `ĐƠN HÀNG` was updated directly from source tab `Bản sao của Đơn đặt hàng`.
- Extra staging sheets created during the cautious import attempt were removed.
- Obsolete name review sheets were removed.
- Founder-facing tabs were reduced to the core visible sheets.
- Apps Script was deployed through the owner Web App and helper commands were updated.

## Live Google Sheet Changes

### Order sync

Direct sync completed:

- Source: `Bản sao của Đơn đặt hàng`
- Target: `ĐƠN HÀNG`
- Copied range: `Bản sao của Đơn đặt hàng!A1:Q37`
- Backup created before overwrite: `BACKUP_DON_HANG_20260514_082941` hidden
- Copy mode: copied source content/format as-is; no automatic wording/name/product/ship normalization

Important: this is a live Google Sheet change, not only a repo change. On Mac, do not recreate staging sheets or try to re-import from an external file unless Sếp explicitly asks.

### Sheets deleted from live Google Sheet

Deleted because they were temporary/obsolete:

- `REVIEW TÊN HÀNG`
- `REVIEW TÊN HÀNG - AUDIT`
- `ORDER RAW - DÁN FOUNDER`
- `ORDER IMPORT REVIEW`

Reason:

- Name review is now covered by `Master NVL`, dropdowns, and naming rules.
- Order staging was unnecessary because Sếp wants direct update from `Bản sao của Đơn đặt hàng` to `ĐƠN HÀNG`.

### Sheets visible after cleanup

Only these sheets remain visible:

- `HOME`
- `MENU & GIÁ`
- `ĐƠN HÀNG`
- `COST & GIÁ`
- `VIỆC CẦN LÀM`
- `NHẬP HÀNG`
- `CÔNG THỨC`
- `THU CHI`
- `DASHBOARD`

### Sheets hidden after cleanup

Technical/source/backup/audit tabs were hidden, including:

- `DATA VALIDATION`
- `THÀNH PHẨM/MẺ`
- `HƯỚNG DẪN`
- `ORDER TMP`
- `COST CFG`
- `BOM MAP`
- `RECIPE MAP`
- `COST ACTION`
- `COST FLOW`
- `COST CALC`
- `COST REVIEW`
- `Master NVL`
- `Bản sao của COST DỰ KIẾN`
- all `BACKUP...` sheets, including `BACKUP_DON_HANG_20260514_082941`

## Apps Script / Helper Changes

Changed files in App Automation:

- `MOCO_NHAP_HANG_V2.gs`
  - Added `sync_order_sheet_from_source`
  - Added `delete_order_staging_sheets`
  - Added `focus_founder_sheets`
  - Added `delete_obsolete_name_review_sheets`
  - Kept helper audit/read actions, but current live workflow does not require external Drive reads
- `moco_web_app_call.js`
  - Added aliases:
    - `sync-orders`
    - `delete-order-staging`
    - `delete-name-review`
    - `focus`
- `appsscript.json`
  - Removed unused `drive.readonly` scope after switching to same-spreadsheet sync

Latest deployed Web App version after this batch:

- `@151` - `MOCO focus founder sheet tabs`

## Commands Run

Important live commands run successfully:

```powershell
.\MOCO.cmd sync-orders
.\MOCO.cmd delete-name-review
.\MOCO.cmd focus
.\MOCO.cmd status
.\MOCO.cmd issues
```

Validation results:

- `sync-orders`: `synced=true`, source `Bản sao của Đơn đặt hàng`, target `ĐƠN HÀNG`, copied `A1:Q37`
- `delete-name-review`: deleted `REVIEW TÊN HÀNG`, `REVIEW TÊN HÀNG - AUDIT`
- `focus`: visible 9 founder-facing sheets, hidden technical/backup sheets
- `issues`: `COST REVIEW` rows `0`
- `status`: `NHẬP HÀNG` still OK, `lastRow=119`

## Mac Receive Notes

On Mac after syncin:

1. Trust the handoff pointer branch/commit from `OneDrive/AI_CC_Data/.sync_handoff/latest.json`.
2. Pull the synced branch before editing.
3. Do not recreate deleted sheets:
   - `REVIEW TÊN HÀNG`
   - `REVIEW TÊN HÀNG - AUDIT`
   - `ORDER RAW - DÁN FOUNDER`
   - `ORDER IMPORT REVIEW`
4. If founder copies more data into `Bản sao của Đơn đặt hàng`, run:

```powershell
.\MOCO.cmd sync-orders
.\MOCO.cmd focus
```

5. If audit/debug is needed, hidden sheets can be shown from `HOME` or via script, but keep founder-facing view focused.

## QA_Thanh Notes

- Biggest risk is confusing live Google Sheet mutations with Git-only changes. The sheet deletions/hides above are live state and must be respected on Mac.
- `ĐƠN HÀNG` was copied as-is from source. Any product-name, wording, or ship-fee normalization still requires Sếp review before changing content.
- Backup exists in live sheet as hidden tab `BACKUP_DON_HANG_20260514_082941`.

---

## Related

- [[ANTIGRAVITY_HANDOFF_GOOGLE_SHEET_CONTROL]]
- [[APPS_SCRIPT_CONTENT_DEPLOY_GUIDE]]
- [[CODEX_TASK_DEPLOY_DASHBOARD_V2]]
- [[DEPLOY_GUIDE]]
- [[MOCO_HANDOFF_2026-05-13_COST_UI_DROPDOWN]]
