/* ==========================================================================
   John & Widya — invitation logic
   You should not need to edit this file. All content lives in config.js.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.WEDDING_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var setAll = function (key, value) {
    var nodes = document.querySelectorAll('[data-c="' + key + '"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  var API_READY = !!(C.apiUrl && /^https?:\/\//.test(C.apiUrl) && C.apiUrl.indexOf("PASTE_") === -1);

  /* ── Parse the wedding date ─────────────────────────────────────── */
  var startISO = C.ceremonyStart || "2026-10-26T17:00:00+08:00";
  var parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(startISO) || [];
  var Y = +parts[1] || 2026, Mo = +parts[2] || 10, D = +parts[3] || 26;
  var startMs = new Date(startISO).getTime();
  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  /* ══ 1. Fill all text content ═══════════════════════════════════════ */
  function fillContent() {
    var g = C.groom || {}, b = C.bride || {}, v = C.venue || {}, cp = C.copy || {};

    setAll("eyebrow", cp.eyebrow || "The Wedding Of");
    setAll("groomShort", g.shortName || ""); setAll("brideShort", b.shortName || "");
    setAll("groomShort2", g.shortName || ""); setAll("brideShort2", b.shortName || "");
    setAll("groomShort3", g.shortName || ""); setAll("brideShort3", b.shortName || "");
    setAll("footNames", (g.shortName || "") + " & " + (b.shortName || ""));
    setAll("coverDate", D + " . " + String(Mo).padStart(2, "0") + " . " + Y);
    setAll("coverVenue", v.name || "");

    setAll("verse", cp.verse || ""); setAll("verseRef", cp.verseRef || "");
    setAll("invitation", cp.invitation || "");
    setAll("closingText", cp.closing || ""); setAll("thanks", cp.thanks || "Thank You");

    setAll("groomName", g.fullName || ""); setAll("brideName", b.fullName || "");
    setAll("groomOrder", g.childOrder || ""); setAll("brideOrder", b.childOrder || "");
    setAll("groomFather", g.father || ""); setAll("groomMother", g.mother || "");
    setAll("brideFather", b.father || ""); setAll("brideMother", b.mother || "");

    ["groom", "bride"].forEach(function (who) {
      var handle = (C[who] || {}).instagram;
      var el = document.querySelector('[data-c="' + who + 'Ig"]');
      if (el && handle) {
        el.hidden = false;
        el.href = "https://instagram.com/" + handle.replace(/^@/, "");
        el.textContent = "@" + handle.replace(/^@/, "");
      }
    });

    setAll("dateLabel", C.dateLabel || "");
    setAll("timeLabel", C.timeLabel || "");
    setAll("dressCode", C.dressCode || "");
    setAll("venueName", v.name || ""); setAll("venueHall", v.hall || "");
    setAll("venueAddr", v.address || ""); setAll("venueArea", v.area || "");
    setAll("deadline", C.rsvpDeadline || "");
    setAll("giftIntro", (C.gift || {}).intro || "");

    document.title = (g.shortName || "") + " & " + (b.shortName || "") + " — Wedding Invitation";
  }

  /* ══ 2. Media ═══════════════════════════════════════════════════════ */
  function fillMedia() {
    var m = C.media || {};
    var set = function (id, src, alt) {
      var el = $(id); if (!el) return;
      if (!src) { el.parentNode.style.background = "var(--paper-2)"; return; }
      el.src = src; el.alt = alt || "";
      el.onerror = function () { el.style.display = "none"; };
    };
    set("coverImg", m.cover, "");
    set("closingImg", m.closing, "");

    var p = m.portrait || {};
    initSlideshow("groom",  p.groom, (C.groom || {}).fullName);
    initSlideshow("bride",  p.bride, (C.bride || {}).fullName);
    initSlideshow("invite", m.invite, "");

    var gal = $("gal"), list = m.gallery || [];
    if (gal) {
      gal.innerHTML = list.map(function (src) {
        return '<figure><img src="' + esc(src) + '" alt="" loading="lazy"></figure>';
      }).join("");
    }
  }


  /* ══ Portrait slideshow ═════════════════════════════════════════════
     config.js → media.portrait.groom accepts either one filename or a
     list of them. With more than one, they slide across automatically.
     ================================================================== */
  var SLIDE_MS = (C.media && C.media.portraitInterval) || 3000;

  function initSlideshow(who, src, alt) {
    var track = $(who + "Slides"), dots = $(who + "Dots");
    if (!track) return;

    // Accept a plain string for backwards compatibility.
    var list = Array.isArray(src) ? src.slice() : (src ? [src] : []);
    list = list.filter(Boolean);
    if (!list.length) { track.parentNode.style.background = "var(--paper-2)"; return; }

    track.innerHTML = list.map(function (s, i) {
      return '<img src="' + esc(s) + '" alt="' + esc(i === 0 ? (alt || "") : "") +
             '" loading="' + (i === 0 ? "eager" : "lazy") + '">';
    }).join("");

    // A single photo needs no dots, no timer, no transition.
    if (list.length < 2) return;

    dots.hidden = false;
    dots.innerHTML = list.map(function (_, i) {
      return '<span' + (i === 0 ? ' class="is-active"' : '') + '></span>';
    }).join("");

    var i = 0, timer = null;
    var marks = [].slice.call(dots.children);

    function go(n) {
      i = (n + list.length) % list.length;
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      marks.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
    }
    function play() { if (!timer) timer = setInterval(function () { go(i + 1); }, SLIDE_MS); }
    function stop() { clearInterval(timer); timer = null; }

    // Tapping the photo advances it and restarts the timer.
    track.parentNode.addEventListener("click", function () { go(i + 1); stop(); play(); });

    // Only run while the page is actually on screen — saves battery and
    // means guests never land mid-transition.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? play() : stop();
      }, { threshold: 0.4 }).observe(track);
    } else play();

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : play();
    });
  }

  /* ══ 3. Cover / guest name / open ═══════════════════════════════════ */
  function initCover() {
    var q = new URLSearchParams(location.search);
    var to = q.get("to") || q.get("guest") || q.get("nama");
    if (to) {
      var name = decodeURIComponent(to.replace(/\+/g, " ")).trim().slice(0, 60);
      if (name) { $("guestName").textContent = name; $("guestBlock").hidden = false; }
    }

    $("openBtn").addEventListener("click", function () {
      $("cover").classList.add("is-gone");
      document.body.classList.remove("is-locked");
      scroller().scrollTop = 0;
      window.scrollTo(0, 0);
      setTimeout(function () {
        var d = $("dots"); if (d) d.classList.add("is-on");
        var h = $("hint"); if (h) h.classList.add("is-on");
      }, 900);
      startMusic();
      setTimeout(function () { revealScan(); }, 60);
      setTimeout(function () { $("cover").style.display = "none"; }, 1000);
    });
  }

  /* ══ 4. Calendar (the signature) ════════════════════════════════════ */
  function buildCalendar() {
    $("calMonth").textContent = MONTHS[Mo - 1] + " " + Y;

    var head = $("calHead");
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function (d) {
      head.insertAdjacentHTML("beforeend", "<span>" + d + "</span>");
    });

    var firstDow = new Date(Date.UTC(Y, Mo - 1, 1)).getUTCDay();
    var total = new Date(Date.UTC(Y, Mo, 0)).getUTCDate();
    var grid = $("calGrid"), html = "";

    for (var p = 0; p < firstDow; p++) html += '<div class="cal__cell cal__cell--pad">·</div>';
    for (var d = 1; d <= total; d++) {
      var dow = (firstDow + d - 1) % 7;
      var cls = "cal__cell cal__cell--day" + (dow === 0 ? " cal__cell--sun" : "");
      var ring = "";
      if (d === D) {
        ring = '<svg class="cal__ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
               '<path vector-effect="non-scaling-stroke" d="M52 10 C76 8 92 26 91 50 C90 74 72 92 49 92 C26 92 9 74 9 50 C9 28 25 11 55 9"/></svg>';
      }
      html += '<div class="' + cls + '">' + ring + '<span>' + d + '</span></div>';
    }
    grid.innerHTML = html;
  }

  /* ══ 5. Countdown ═══════════════════════════════════════════════════ */
  function tick() {
    var diff = startMs - Date.now();
    if (diff <= 0) {
      var cd = $("countdown");
      if (cd.classList.contains("is-done")) return;
      cd.classList.add("is-done");
      cd.innerHTML = '<div class="cd"><span class="cd__num" style="font-family:var(--display);font-size:26px">Today is the day</span></div>';
      return;
    }
    var s = Math.floor(diff / 1000);
    var pad = function (n, w) { return String(n).padStart(w || 2, "0"); };
    $("cdD").textContent = pad(Math.floor(s / 86400), 3);
    $("cdH").textContent = pad(Math.floor(s / 3600) % 24);
    $("cdM").textContent = pad(Math.floor(s / 60) % 60);
    $("cdS").textContent = pad(s % 60);
  }

  /* ══ 6. Maps + Google Calendar links ════════════════════════════════ */
  function initLinks() {
    var v = C.venue || {};
    var q = encodeURIComponent(v.mapsQuery || v.name || "");
    $("mapLink").href = "https://www.google.com/maps/search/?api=1&query=" + q;
    $("mapFrame").src = "https://maps.google.com/maps?q=" + q + "&z=15&output=embed";

    var fmt = function (iso) {
      return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };
    var title = (C.groom || {}).shortName + " & " + (C.bride || {}).shortName + " Wedding";
    var loc = [v.name, v.hall, v.address, v.area].filter(Boolean).join(", ");
    var details = "We would be honoured by your presence.\n\n" +
      (C.groom || {}).fullName + "\n" + (C.bride || {}).fullName + "\n\n" +
      (C.dateLabel || "") + " · " + (C.timeLabel || "") + "\n" + loc + "\n\n" + location.href;

    var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(title) +
      "&dates=" + fmt(C.ceremonyStart) + "/" + fmt(C.ceremonyEnd || C.ceremonyStart) +
      "&location=" + encodeURIComponent(loc) +
      "&details=" + encodeURIComponent(details) +
      "&ctz=Asia/Makassar";

    $("calBtn").addEventListener("click", function () { window.open(url, "_blank", "noopener"); });
    var cap = document.querySelector(".cal__caption");
    if (cap) {
      cap.style.cursor = "pointer";
      cap.title = "Add to Google Calendar";
      cap.addEventListener("click", function () { window.open(url, "_blank", "noopener"); });
    }
  }

  /* ══ 7. Schedule + gifts ════════════════════════════════════════════ */
  function buildSchedule() {
    var list = C.schedule || [];
    $("sched").innerHTML = list.map(function (r) {
      return '<li><span class="sched__time">' + esc(r.time) + '</span><span>' +
        '<span class="sched__title">' + esc(r.title) + '</span>' +
        (r.note ? '<span class="sched__note">' + esc(r.note) + '</span>' : '') +
        '</span></li>';
    }).join("");
  }

  function buildPalette() {
    var box = $("palette"), list = (C.dressPalette || []);
    if (!box) return;
    if (!list.length) { box.hidden = true; return; }
    box.innerHTML = list.map(function (c) {
      return '<div class="swatch">' +
        '<div class="swatch__chip" style="background:' + esc(c.hex) + '"></div>' +
        '<span class="swatch__name">' + esc(c.name) + '</span>' +
        '<span class="swatch__hex">' + esc(c.hex) + '</span></div>';
    }).join("");
  }

  function buildGift() {
    var g = C.gift || {}, out = "";
    (g.accounts || []).forEach(function (a, i) {
      out += '<div class="acct" data-acct><button class="acct__btn" type="button">' +
        esc(a.bank || ("Account " + (i + 1))) + '</button><div class="acct__body"><div class="acct__in">' +
        '<p class="acct__num">' + esc(a.number) + '</p>' +
        '<p class="acct__holder">' + esc(a.holder) + '</p>' +
        '<button class="copy" type="button" data-copy="' + esc(a.number) + '">Copy number</button>' +
        '</div></div></div>';
    });
    if (g.deliveryAddress) {
      out += '<div class="acct" data-acct><button class="acct__btn" type="button">Send a gift by post</button>' +
        '<div class="acct__body"><div class="acct__in">' +
        '<p class="acct__addr">' + esc(g.deliveryAddress) + '</p>' +
        '<button class="copy" type="button" data-copy="' + esc(g.deliveryAddress) + '">Copy address</button>' +
        '</div></div></div>';
    }
    $("giftList").innerHTML = out;

    $("giftList").addEventListener("click", function (e) {
      var head = e.target.closest(".acct__btn");
      if (head) { head.parentNode.classList.toggle("is-open"); return; }
      var cp = e.target.closest("[data-copy]");
      if (cp) copyText(cp.getAttribute("data-copy"));
    });
  }

  function copyText(text) {
    var done = function () { toast("Copied"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed"); }
      document.body.removeChild(ta);
    }
  }

  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2200);
  }


  /* ══ Snap scrolling ═════════════════════════════════════════════════
     config.js → scrollMode: "snap" gives one full screen per section.
     scrollMode: "free" gives ordinary continuous scrolling.
     ================================================================== */
  var SNAP = (C.scrollMode || "snap") === "snap";

  function scroller() {
    return document.scrollingElement || document.documentElement;
  }

  function initSnap() {
    var page = $("page");
    if (!SNAP) return;
    page.classList.add("snap");
    document.documentElement.classList.add("snap-mode");
    buildDots();
  }

  function buildDots() {
    var page = $("page"), nav = $("dots");
    if (!nav) return;
    var secs = [].slice.call(page.children).filter(function (el) {
      return !el.hidden;
    });

    nav.innerHTML = secs.map(function (el, i) {
      var label = el.getAttribute("data-page") || ("Section " + (i + 1));
      return '<button type="button" data-i="' + i + '" aria-label="Go to ' + esc(label) + '"></button>';
    }).join("");

    var dots = [].slice.call(nav.children);

    nav.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      secs[+b.getAttribute("data-i")].scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (!("IntersectionObserver" in window)) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        dots.forEach(function (d, n) { d.classList.toggle("is-active", n === i); });
        // dots turn white over the dark closing page
        var dark = en.target.classList.contains("closing");
        dots.forEach(function (d) { d.classList.toggle("on-dark", dark); });
        // the hint only belongs on the first page
        var h = $("hint");
        if (h) h.classList.toggle("is-on", i === 0);
      });
    }, { threshold: 0.55 });

    secs.forEach(function (el) { spy.observe(el); });
  }

  /* ══ 8. Reveal on scroll ════════════════════════════════════════════ */
  var io;
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      $("calendar").classList.add("is-drawn");
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        if (en.target.id === "calendar") en.target.classList.add("is-drawn");
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }
  function revealScan() {
    document.querySelectorAll(".reveal").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) {
        el.classList.add("is-in");
        if (el.id === "calendar") el.classList.add("is-drawn");
      }
    });
  }

  /* ══ 9. Music ═══════════════════════════════════════════════════════ */
  var audio, musicBtn;
  function initMusic() {
    var src = (C.media || {}).music;
    audio = $("bgm"); musicBtn = $("musicBtn");
    if (!src) return;
    audio.src = src; audio.volume = 0.55;
    musicBtn.hidden = false;
    musicBtn.addEventListener("click", function () {
      if (audio.paused) startMusic(); else stopMusic();
    });
  }
  function startMusic() {
    if (!audio || !audio.src) return;
    var p = audio.play();
    if (p && p.then) p.then(function () {
      musicBtn.classList.add("is-playing");
      musicBtn.setAttribute("aria-label", "Pause background music");
    }).catch(function () { /* browser blocked it; the button still works */ });
  }
  function stopMusic() {
    audio.pause();
    musicBtn.classList.remove("is-playing");
    musicBtn.setAttribute("aria-label", "Play background music");
  }

  /* ══ 10. Backend (Google Apps Script) ═══════════════════════════════ */
  function jsonp(params) {
    return new Promise(function (resolve, reject) {
      var cb = "wcb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
      var url = C.apiUrl + (C.apiUrl.indexOf("?") > -1 ? "&" : "?") +
        new URLSearchParams(Object.assign({ callback: cb }, params)).toString();
      var s = document.createElement("script");
      var timer = setTimeout(function () { cleanup(); reject(new Error("timeout")); }, 20000);
      function cleanup() {
        clearTimeout(timer);
        delete window[cb];
        if (s.parentNode) s.parentNode.removeChild(s);
      }
      window[cb] = function (data) { cleanup(); resolve(data); };
      s.onerror = function () { cleanup(); reject(new Error("network")); };
      s.src = url;
      document.head.appendChild(s);
    });
  }

  function apiPost(payload) {
    // Preferred: a real POST. text/plain avoids a CORS preflight Apps Script can't answer.
    return fetch(C.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); })
      // Fallback: JSONP GET, which always works cross-origin.
      .catch(function () {
        return jsonp(Object.assign({ action: "submit" }, payload));
      });
  }

  /* ══ 11. RSVP form ══════════════════════════════════════════════════ */
  var localWishes = [];   // used only when the backend isn't connected yet

  function initForm() {
    var sel = $("fGuests"), max = C.maxGuestsPerRsvp || 5;
    for (var i = 1; i <= max; i++) {
      sel.insertAdjacentHTML("beforeend",
        '<option value="' + i + '">' + i + (i === 1 ? " guest" : " guests") + "</option>");
    }

    var ta = $("fMessage");
    ta.addEventListener("input", function () { $("charCount").textContent = ta.value.length; });

    var gf = $("guestsField");
    document.querySelectorAll('input[name="attendance"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var no = r.value === "Not Attending" && r.checked;
        gf.classList.toggle("is-off", no);
        if (no) sel.value = "1";
      });
    });

    $("rsvpForm").addEventListener("submit", onSubmit);
  }

  function onSubmit(e) {
    e.preventDefault();
    var msgEl = $("formMsg"), btn = $("submitBtn");
    var name = $("fName").value.trim();
    var att = document.querySelector('input[name="attendance"]:checked');
    var attending = att ? att.value : "";
    var guests = attending === "Not Attending" ? 0 : +$("fGuests").value || 1;
    var message = $("fMessage").value.trim();

    msgEl.className = "form__msg";
    if (!name) { fail("Please enter your name.", $("fName")); return; }
    if (!att) { fail("Please tell us whether you can attend.", null); return; }
    if ($("fWebsite").value) { return; }  // honeypot tripped

    btn.disabled = true; btn.textContent = "Sending…";
    msgEl.textContent = "";

    var payload = {
      name: name, attendance: attending, guests: guests, message: message,
      page: location.href
    };

    var done = function (ok) {
      btn.disabled = false; btn.textContent = "Send RSVP";
      if (ok) {
        msgEl.textContent = attending === "Attending"
          ? "Thank you — we can't wait to see you."
          : "Thank you for letting us know. You'll be missed.";
        $("rsvpForm").reset();
        $("charCount").textContent = "0";
        $("guestsField").classList.remove("is-off");
        if (message) toast("Wish posted");
        setTimeout(loadWishes, 700);
      } else {
        msgEl.className = "form__msg is-err";
        msgEl.textContent = "That didn't send. Check your connection and try again.";
      }
    };

    if (!API_READY) {
      // Preview mode — the site works, nothing is saved yet.
      localWishes.unshift({
        name: name, attendance: attending, message: message, timestamp: new Date().toISOString()
      });
      renderWishes(localWishes);
      done(true);
      msgEl.textContent = "Saved on this device only — connect Google Sheets to store RSVPs.";
      return;
    }

    apiPost(payload)
      .then(function (res) { done(res && res.ok !== false); })
      .catch(function () { done(false); });

    function fail(text, el) {
      msgEl.className = "form__msg is-err";
      msgEl.textContent = text;
      if (el) { el.classList.add("is-bad"); el.focus(); setTimeout(function () { el.classList.remove("is-bad"); }, 2500); }
    }
  }

  /* ══ 12. Wishes feed ════════════════════════════════════════════════ */
  var PAGE = 8, shown = PAGE, cache = [];

  function loadWishes() {
    if (!API_READY) { renderWishes(localWishes); return; }
    jsonp({ action: "wishes" })
      .then(function (res) {
        cache = (res && res.data) || [];
        renderWishes(cache);
      })
      .catch(function () {
        if (!cache.length) {
          var empty = $("wishEmpty");
          if (empty) empty.textContent = "Wishes couldn't load right now.";
          $("wishCount").textContent = "—";
        }
      });
  }

  var CAROUSEL = (C.wishesStyle || "carousel") === "carousel";

  function renderWishes(items) {
    var list = $("wishList"), count = $("wishCount"), nav = $("wishNav");
    var withMsg = (items || []).filter(function (w) { return w && w.message; });
    count.textContent = withMsg.length;

    if (!withMsg.length) {
      list.className = "wishes";
      list.innerHTML = '<p class="wishes__empty">No wishes yet. Be the first to write one.</p>';
      $("moreBtn").hidden = true;
      if (nav) nav.hidden = true;
      return;
    }

    var slice = CAROUSEL ? withMsg : withMsg.slice(0, shown);

    list.className = CAROUSEL ? "wishes wishes--carousel" : "wishes";
    list.innerHTML = slice.map(function (w, i) {
      var tagCls = w.attendance === "Attending" ? "wish__tag" : "wish__tag wish__tag--no";
      var tag = w.attendance ? '<span class="' + tagCls + '">' + esc(w.attendance) + "</span>" : "";
      var inner =
        '<p class="wish__msg">' + esc(w.message) + "</p>" +
        '<div class="wish__head"><h3 class="wish__name">' + esc(w.name || "Guest") + "</h3>" + tag + "</div>" +
        '<span class="wish__time">' + esc(relTime(w.timestamp)) + "</span>";

      if (CAROUSEL) {
        return '<article class="wish"><div class="wish__card">' + inner + "</div></article>";
      }
      return '<article class="wish" style="animation-delay:' + Math.min(i, 8) * 40 + 'ms">' +
        '<div class="wish__head"><h3 class="wish__name">' + esc(w.name || "Guest") + "</h3>" + tag + "</div>" +
        '<p class="wish__msg">' + esc(w.message) + "</p>" +
        '<span class="wish__time">' + esc(relTime(w.timestamp)) + "</span></article>";
    }).join("");

    if (CAROUSEL) {
      $("moreBtn").hidden = true;
      initCarousel(withMsg.length);
      return;
    }

    var more = $("moreBtn");
    more.hidden = withMsg.length <= shown;
    more.onclick = function () { shown += PAGE; renderWishes(withMsg); };
  }

  /* ══ Wishes carousel ════════════════════════════════════════════════
     Native horizontal scroll-snap. Each swipe lands on exactly one card.
     overscroll-behavior-x:contain stops a swipe past the last wish from
     dragging the whole invitation sideways.
     ================================================================== */
  var carouselBound = false;

  function initCarousel(total) {
    var track = $("wishList"), nav = $("wishNav");
    if (!nav) return;

    nav.hidden = total < 2;
    $("wishTotal").textContent = total;

    function indexNow() {
      var slide = track.firstElementChild;
      if (!slide) return 0;
      return Math.round(track.scrollLeft / slide.getBoundingClientRect().width);
    }
    function sync() {
      var i = Math.min(Math.max(indexNow(), 0), total - 1);
      $("wishIdx").textContent = i + 1;
      $("wishPrev").disabled = i <= 0;
      $("wishNext").disabled = i >= total - 1;
    }
    function goTo(i) {
      var slide = track.firstElementChild;
      if (!slide) return;
      track.scrollTo({ left: i * slide.getBoundingClientRect().width, behavior: "smooth" });
    }

    if (!carouselBound) {
      carouselBound = true;
      var t;
      track.addEventListener("scroll", function () {
        clearTimeout(t); t = setTimeout(sync, 90);
      }, { passive: true });
      $("wishPrev").addEventListener("click", function () { goTo(indexNow() - 1); });
      $("wishNext").addEventListener("click", function () { goTo(indexNow() + 1); });
    }
    sync();
  }

  function relTime(iso) {
    if (!iso) return "";
    var t = new Date(iso).getTime();
    if (isNaN(t)) return "";
    var s = Math.floor((Date.now() - t) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " hr ago";
    if (s < 604800) return Math.floor(s / 86400) + " d ago";
    return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  /* ══ Boot ═══════════════════════════════════════════════════════════ */
  function boot() {
    document.body.classList.add("is-locked");
    fillContent();
    fillMedia();
    initSnap();
    initCover();
    buildCalendar();
    buildSchedule();
    buildPalette();
    buildGift();
    initLinks();
    initForm();
    initMusic();
    initReveal();
    tick(); setInterval(tick, 1000);
    loadWishes();
    setInterval(function () { if (!document.hidden) loadWishes(); }, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else boot();
})();
