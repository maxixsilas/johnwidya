/* ============================================================================
   CONFIG — This is the ONLY file you need to edit.
   Everything on the invitation reads from here.
   Replace the "XXX" values, save, commit. Nothing else needs to change.
   ========================================================================== */

window.WEDDING_CONFIG = {

  /* ---- 1. THE COUPLE -------------------------------------------------- */
  groom: {
    fullName: "John Maximilian Silas",
    shortName: "John",
    father: "XXX",              // Groom's father
    mother: "XXX",              // Groom's mother
    childOrder: "The son of",   // e.g. "The first son of", "The only son of"
    instagram: ""               // e.g. "johnsilas" — leave "" to hide the icon
  },
  bride: {
    fullName: "Widya Debora Kristiani Sihombing",
    shortName: "Widya",
    father: "XXX",              // Bride's father
    mother: "XXX",              // Bride's mother
    childOrder: "The daughter of",
    instagram: ""
  },

  /* ---- 2. DATE & TIME -------------------------------------------------- */
  // Bali runs on WITA = UTC+08:00. Keep the +08:00 offset.
  // Format: YYYY-MM-DDTHH:MM:SS+08:00
  ceremonyStart: "2026-10-26T17:00:00+08:00",
  ceremonyEnd:   "2026-10-26T22:00:00+08:00",
  dateLabel:     "Monday, 26 October 2026",
  timeLabel:     "5:00 PM — until finished (WITA)",

  /* ---- 3. VENUE -------------------------------------------------------- */
  venue: {
    name: "Hilton Bali Resort",
    hall: "XXX",                                    // Ballroom / lawn / chapel name
    address: "XXX",                                 // Full street address
    area: "Nusa Dua, near Pandawa Beach, Bali",
    // Used for the Google Maps link + embedded map.
    // Easiest: leave as the venue name. Most precise: paste "-8.8196,115.2072".
    mapsQuery: "Hilton Bali Resort, Nusa Dua"
  },

  /* ---- 4. EVENT SCHEDULE (shown in Event Details) ---------------------- */
  // Add or remove rows freely.
  schedule: [
    { time: "17:00", title: "Holy Matrimony",  note: "Please be seated by 16:45" },
    { time: "18:30", title: "Reception",       note: "Dinner & celebration" },
    { time: "20:00", title: "Dancing",         note: "" }
  ],
  dressCode: "Formal · Earth tones & pastels",

  /* ---- 5. GIFTS -------------------------------------------------------- */
  gift: {
    intro: "Your presence is the greatest gift of all. For those who wish to send a token of love, we have provided the details below.",
    accounts: [
      { bank: "XXX Bank", number: "XXX", holder: "XXX" },
      { bank: "XXX Bank", number: "XXX", holder: "XXX" }
    ],
    deliveryAddress: "XXX"    // Address for physical gifts
  },

  /* ---- 6. RSVP BACKEND ------------------------------------------------- */
  // Paste the Google Apps Script Web App URL here after deploying it.
  // See README.md → "Step 2". It looks like:
  // https://script.google.com/macros/s/AKfycb..................../exec
  apiUrl: "https://script.google.com/macros/s/AKfycbzxOyjGTzaP81Po6A6jNmZoYRFokLnm0G8QIuC2qjr2T5LeAQA-TPhLqmHqx-l7ValEvw/exec",
  rsvpDeadline: "12 October 2026",
  maxGuestsPerRsvp: 5,

  /* ---- 7. MEDIA -------------------------------------------------------- */
  // Drop your files into assets/img, assets/audio, assets/video and
  // update the filenames below. Placeholder art is used until you do.
  media: {
    cover:   "assets/img/cover.webp",

    // Each person can have several photos. They slide across automatically.
    // One photo is fine too — just leave a single item in the list.
    portrait:{
      groom: ["assets/img/placeholder-groom.svg",
              "assets/img/placeholder-01.svg",
              "assets/img/placeholder-03.svg"],
      bride: ["assets/img/placeholder-bride.svg",
              "assets/img/placeholder-02.svg",
              "assets/img/placeholder-04.svg"]
    },
    portraitInterval: 3000,   // milliseconds between portrait photos
    gallery: [
      "assets/img/placeholder-01.svg",
      "assets/img/placeholder-02.svg",
      "assets/img/placeholder-03.svg",
      "assets/img/placeholder-04.svg"
    ],
    closing: "assets/img/placeholder-closing.svg",
    // Optional pre-wedding video. Leave "" to hide the video section.
    video:   "",
    videoPoster: "assets/img/placeholder-01.svg",
    // Background music. Leave "" to hide the music button.
    music:   "assets/audio/music.mp3"
  },

  /* ---- 8. SCROLLING -----------------------------------------------------
     "snap" = one full screen per section, like flipping a page (PowerPoint feel).
     "free" = ordinary continuous scrolling.
     Change this one word and reload. Nothing else needs to change.      */
  scrollMode: "snap",

  /* ---- 9. WISHES DISPLAY -------------------------------------------------
     "carousel" = one wish per swipe, left and right.
     "list"     = all wishes stacked vertically.                          */
  wishesStyle: "carousel",

  /* ---- 10. WORDS -------------------------------------------------------- */
  copy: {
    eyebrow: "The Wedding Of",
    verse: "So they are no longer two, but one flesh.\nWhat God has joined together,\nlet no one separate.",
    verseRef: "Matthew 19:6",
    invitation: "With hearts full of gratitude, and with the blessing of our families, we invite you to share in the joy of our wedding day.",
    closing: "Thank you for being part of our story. Your prayers and presence mean the world to us.",
    thanks: "Thank You"
  }
};
