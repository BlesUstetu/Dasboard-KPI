/**
 * KPI Dashboard API (Google Apps Script Web App)
 *
 * REQUIRED SHEETS:
 * - CONFIG   : A=key, B=value  -> API_KEY
 * - KPI      : kpi, unit, target, actual, delta, updated_at
 * - DIVISION : division, focus, score, target, updated_at
 *
 * TEST URL:
 *   /exec?action=all&key=YOUR_API_KEY
 */

function doGet(e) {
  try {
    const key = (e && e.parameter && e.parameter.key) ? String(e.parameter.key) : "";
    if (!isAuthorized_(key)) {
      return json_({ ok: false, error: "Unauthorized" });
    }

    const action = String((e.parameter.action || "all")).toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "asep") {
      return json_({
        ok: true,
        kpi: readTable_(ss, "ASEP"),
        ts: new Date().toISOString()
      });
    }

    if (action === "division") {
      return json_({
        ok: true,
        divisions: readTable_(ss, "DIVISION"),
        ts: new Date().toISOString()
      });
    }

    const kpi = readTable_(ss, "ASEP");
    const divisions = readTable_(ss, "DIVISION");

    return json_({
      ok: true,
      kpi,
      divisions,
      meta: {
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        lastUpdated: pickLatestUpdated_(kpi, divisions)
      },
      ts: new Date().toISOString()
    });

  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ===================== HELPERS ===================== */

function isAuthorized_(providedKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("CONFIG");
  if (!sh) return false;

  const values = sh.getRange(1, 1, sh.getLastRow(), 2).getValues();
  const map = {};
  values.forEach(r => {
    const k = String(r[0] || "").trim();
    const v = String(r[1] || "").trim();
    if (k) map[k] = v;
  });

  const expected = map["API_KEY"] || "";
  return Boolean(expected && providedKey && expected === providedKey);
}

function readTable_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error("Sheet not found: " + sheetName);

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const headers = sh
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(h => String(h).trim());

  const rows = sh
    .getRange(2, 1, lastRow - 1, lastCol)
    .getValues();

  return rows
    .filter(r => r.some(x => x !== "" && x !== null))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h || ("col" + (i + 1))] = normalize_(r[i]);
      });
      return obj;
    });
}

function normalize_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(
      v,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );
  }
  return v;
}

function pickLatestUpdated_(kpi, divisions) {
  const times = [];

  const push = (arr) => arr.forEach(o => {
    if (!o || !o.updated_at) return;
    const t = new Date(String(o.updated_at));
    if (!isNaN(t.getTime())) times.push(t.getTime());
  });

  push(kpi);
  push(divisions);

  if (!times.length) return null;
  return new Date(Math.max.apply(null, times)).toISOString();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
