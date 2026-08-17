/**
 * ============================================================================
 *  WEDDING RSVP BACKEND — Google Apps Script
 *  John Maximilian Silas & Widya Debora Kristiani Sihombing
 * ============================================================================
 *
 *  WHAT THIS DOES
 *    • Receives RSVP submissions from the invitation site and writes one row
 *      per submission into a Google Sheet.
 *    • Serves the public wishes feed back to the site.
 *
 *  SETUP (5 minutes) — full walkthrough is in README.md, Step 2.
 *    1. Create a Google Sheet. Copy its ID from the URL and paste below.
 *    2. Extensions → Apps Script. Delete the sample code, paste this file.
 *    3. Run the function `setup` once and accept the permission prompt.
 *    4. Deploy → New deployment → Web app
 *         Execute as:      Me
 *         Who has access:  Anyone
 *       Copy the /exec URL into assets/js/config.js → apiUrl.
 *
 *  IMPORTANT: every time you edit this file you must deploy again
 *  (Deploy → Manage deployments → pencil icon → Version: New version → Deploy).
 *  Otherwise the live site keeps running the old code.
 * ==========================================================================*/


/* ── 1. SETTINGS ─────────────────────────────────────────────────────── */

// Paste your Google Sheet ID here. It's the long string in the sheet URL:
// https://docs.google.com/spreadsheets/d/  THIS_PART  /edit
var SHEET_ID   = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
var SHEET_NAME = 'RSVP';

// Max wishes returned to the website at once.
var WISH_LIMIT = 300;

// Column order. Don't reorder these unless you also reorder the sheet.
var HEADERS = ['Timestamp', 'Name', 'Attendance', 'Guests', 'Message', 'Show', 'Source'];


/* ── 2. ONE-TIME SETUP ───────────────────────────────────────────────── */

/**
 * Run this once from the Apps Script editor.
 * Creates the RSVP tab, writes the header row and formats it.
 */
function setup() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  sh.clear();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sh.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#2B2E2C')
    .setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 170);  // Timestamp
  sh.setColumnWidth(2, 220);  // Name
  sh.setColumnWidth(3, 130);  // Attendance
  sh.setColumnWidth(4, 80);   // Guests
  sh.setColumnWidth(5, 420);  // Message
  sh.setColumnWidth(6, 70);   // Show
  sh.setColumnWidth(7, 240);  // Source

  Logger.log('Setup complete. Sheet "%s" is ready.', SHEET_NAME);
}


/* ── 3. WEB APP ENTRY POINTS ─────────────────────────────────────────── */

/**
 * GET — used for two things:
 *   ?action=wishes            → returns the public wishes feed
 *   ?action=submit&name=...   → JSONP fallback for writing an RSVP
 * Add &callback=fnName for a JSONP response.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || 'wishes';
  var out;

  try {
    if (action === 'submit') {
      out = writeRow(p);
    } else if (action === 'stats') {
      out = getStats();
    } else {
      out = { ok: true, data: getWishes() };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }

  return respond(out, p.callback);
}

/**
 * POST — the normal path used by the RSVP form.
 * Body is JSON sent as text/plain (avoids a CORS preflight).
 */
function doPost(e) {
  var out;
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); }
      catch (parseErr) { data = (e && e.parameter) || {}; }
    } else {
      data = (e && e.parameter) || {};
    }
    out = writeRow(data);
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return respond(out, null);
}


/* ── 4. CORE LOGIC ───────────────────────────────────────────────────── */

/** Appends one RSVP row. Returns { ok: true }. */
function writeRow(d) {
  // Bot honeypot — the form has a hidden "website" field people never see.
  if (d.website) return { ok: true, skipped: true };

  var name = clean(d.name, 80);
  if (!name) return { ok: false, error: 'Name is required' };

  var attendance = (String(d.attendance || '').indexOf('Not') === 0)
    ? 'Not Attending' : 'Attending';

  var guests = parseInt(d.guests, 10);
  if (isNaN(guests) || guests < 0) guests = attendance === 'Attending' ? 1 : 0;
  if (guests > 20) guests = 20;
  if (attendance === 'Not Attending') guests = 0;

  var message = clean(d.message, 500);

  // A short lock stops two simultaneous submissions overwriting each other.
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sh = getSheet();
    sh.appendRow([
      new Date(),
      name,
      attendance,
      guests,
      message,
      true,                       // Show — set to FALSE to hide a wish from the site
      clean(d.page, 250)
    ]);
  } finally {
    lock.releaseLock();
  }

  return { ok: true };
}

/** Returns the public wishes feed, newest first. */
function getWishes() {
  var sh = getSheet();
  var last = sh.getLastRow();
  if (last < 2) return [];

  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = [];

  for (var i = rows.length - 1; i >= 0 && out.length < WISH_LIMIT; i--) {
    var r = rows[i];
    var show = r[5];
    if (show === false || String(show).toUpperCase() === 'FALSE') continue;
    if (!r[4]) continue;                      // no message → not a wish

    out.push({
      name: String(r[1]),
      attendance: String(r[2]),
      message: String(r[4]),
      timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0])
    });
  }
  return out;
}

/** Quick totals — open the /exec URL with ?action=stats to see them. */
function getStats() {
  var sh = getSheet();
  var last = sh.getLastRow();
  if (last < 2) return { ok: true, rsvps: 0, attending: 0, notAttending: 0, headcount: 0 };

  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var attending = 0, no = 0, head = 0;

  rows.forEach(function (r) {
    if (String(r[2]) === 'Attending') { attending++; head += Number(r[3]) || 0; }
    else no++;
  });

  return { ok: true, rsvps: rows.length, attending: attending, notAttending: no, headcount: head };
}


/* ── 5. HELPERS ──────────────────────────────────────────────────────── */

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

/** Returns JSON, or JSONP when a callback name is supplied. */
function respond(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


/* ── 6. OPTIONAL: email yourself on every RSVP ───────────────────────────
   Uncomment the block below and put your email address in NOTIFY_EMAIL,
   then add notifyMe(...) inside writeRow() just before `return { ok: true }`.

var NOTIFY_EMAIL = 'you@example.com';

function notifyMe(name, attendance, guests, message) {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New RSVP — ' + name + ' (' + attendance + ')',
    body: name + '\n' + attendance + '\nGuests: ' + guests + '\n\n' + (message || '—')
  });
}
------------------------------------------------------------------------- */
