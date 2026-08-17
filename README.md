# John & Widya — Digital Wedding Invitation

A mobile-first digital wedding invitation with live RSVP, a public wishes wall,
a countdown, Google Maps directions and one-tap Save The Date.

**26 October 2026 · 5:00 PM WITA · Hilton Bali Resort, Uluwatu**

No build step, no framework, no server. Three files do the work:
`index.html`, `assets/css/style.css`, `assets/js/main.js` — plus
`assets/js/config.js`, which is the only file you ever need to edit.

---

## Contents

1. [Set up in 20 minutes](#1-set-up-in-20-minutes)
2. [Step 1 — Put the files on GitHub](#step-1--put-the-files-on-github)
3. [Step 2 — Connect Google Sheets](#step-2--connect-google-sheets)
4. [Step 3 — Turn on GitHub Pages](#step-3--turn-on-github-pages)
5. [Step 4 — Add your photos and music](#step-4--add-your-photos-and-music)
6. [Personalised guest links](#personalised-guest-links)
7. [Managing RSVPs day to day](#managing-rsvps-day-to-day)
8. [Editing the invitation later](#editing-the-invitation-later)
9. [Troubleshooting](#troubleshooting)
10. [File map](#file-map)

---

## 1. Set up in 20 minutes

| # | What you do | Time |
|---|---|---|
| 1 | Upload these files to a GitHub repository | 5 min |
| 2 | Create a Google Sheet + paste in the Apps Script, copy the URL into `config.js` | 8 min |
| 3 | Switch on GitHub Pages | 2 min |
| 4 | Drop in your photos and music, fill in the `XXX` values | 5 min |

Only you can do steps 1–3: they need your Google and GitHub logins.
Everything else is already built.

---

## Step 1 — Put the files on GitHub

1. Go to <https://github.com/new>.
2. Name it something like `wedding-invitation`. Set it to **Public**
   (GitHub Pages is free only for public repos on the free plan). Click
   **Create repository**.
3. On the next screen click **uploading an existing file**.
4. Drag in *everything* from this folder — keep the folder structure intact.
5. Click **Commit changes**.

> The `.nojekyll` file matters: it stops GitHub from ignoring folders.
> If your computer hides dotfiles, make sure it uploaded.

---

## Step 2 — Connect Google Sheets

### 2a. Create the sheet

1. Go to <https://sheets.new>. Name it **Wedding RSVP**.
2. Look at the address bar and copy the long ID between `/d/` and `/edit`:

   ```
   https://docs.google.com/spreadsheets/d/1AbC...xyz/edit
                                          ^^^^^^^^^^ this part
   ```

### 2b. Add the script

3. In the sheet: **Extensions → Apps Script**.
4. Delete whatever is in the editor. Open `google-apps-script/Code.gs`
   from this project, copy all of it, paste it in.
5. Near the top, replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the ID you copied.
6. Click the save icon.

### 2c. Run setup once

7. In the function dropdown at the top, choose **setup**, then click **Run**.
8. Google asks for permission. Click **Review permissions** → choose your account →
   **Advanced** → **Go to (project name) (unsafe)** → **Allow**.

   That "unsafe" warning is normal — it appears for any script Google hasn't
   formally reviewed. It's your own script, running in your own account.

9. Go back to the sheet. You should now see an **RSVP** tab with a formatted
   header row.

### 2d. Publish it as a web app

10. Back in Apps Script: **Deploy → New deployment**.
11. Click the gear next to "Select type" → **Web app**.
12. Set:
    - **Description:** `Wedding RSVP v1`
    - **Execute as:** `Me`
    - **Who has access:** **`Anyone`** ← this must be *Anyone*, not
      "Anyone with a Google account", or guests will be asked to log in.
13. Click **Deploy**, then copy the **Web app URL**. It ends in `/exec`.

### 2e. Tell the website about it

14. In your repo, open `assets/js/config.js` → click the pencil icon.
15. Replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with the URL you copied.
16. **Commit changes**.

Done. RSVPs now land in your sheet within a second, and wishes appear on the
site automatically.

---

## Step 3 — Turn on GitHub Pages

1. In your repo: **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
   (The included workflow at `.github/workflows/deploy.yml` handles the rest.)
   *Alternative:* choose **Deploy from a branch** → `main` → `/ (root)`.
   Both work; GitHub Actions gives you a deployment log.
3. Wait 1–2 minutes, then reload the page. Your URL appears at the top:

   ```
   https://YOUR-USERNAME.github.io/wedding-invitation/
   ```

Every future commit redeploys automatically.

---

## Step 4 — Add your photos and music

1. Upload your files into `assets/img/`, `assets/audio/`, `assets/video/`.
   Each of those folders has a README with recommended sizes.
2. Open `assets/js/config.js` and point `media` at your filenames:

   ```js
   media: {
     cover:   "assets/img/cover.webp",
     portrait:{ groom: "assets/img/john.webp", bride: "assets/img/widya.webp" },
     gallery: ["assets/img/01.webp", "assets/img/02.webp",
               "assets/img/03.webp", "assets/img/04.webp"],
     closing: "assets/img/closing.webp",
     video:   "",
     music:   "assets/audio/music.mp3"
   }
   ```

3. While you're in `config.js`, replace the remaining `XXX` values:
   parents' names, venue address and hall, bank accounts, gift address.

**Compress your photos before uploading.** Full-size camera JPEGs will make the
invitation slow on mobile data. <https://squoosh.app> is free — pick WebP at
quality 75 and aim for under 250 KB per photo.

---

## Personalised guest links

Add `?to=` and the guest's name to the end of your URL. Their name appears on
the cover under "Dear".

```
https://your-name.github.io/wedding-invitation/?to=Leonita%20Taya
```

Spaces become `%20` or `+`. For a batch, put this formula in a spreadsheet
column next to your guest list:

```
=CONCATENATE("https://your-name.github.io/wedding-invitation/?to=", ENCODEURL(A2))
```

Then copy each link into the WhatsApp message for that guest.

---

## Managing RSVPs day to day

Your sheet has one row per submission:

| Column | Meaning |
|---|---|
| **Timestamp** | When they submitted |
| **Name** | Guest's full name |
| **Attendance** | `Attending` or `Not Attending` |
| **Guests** | Headcount they're bringing (0 if not attending) |
| **Message** | Their wish — this is what shows on the website |
| **Show** | `TRUE` = visible on the site. Set to `FALSE` to hide that wish. |
| **Source** | The link they opened, useful for tracking which invite was used |

**Hide an inappropriate message:** change its `Show` cell to `FALSE`.
It disappears from the website within 30 seconds. Nothing is deleted.

**Live totals:** open your `/exec` URL with `?action=stats` on the end.
It returns total RSVPs, attending, not attending, and total headcount.

**Export:** **File → Download → Microsoft Excel** or **CSV**.

**Get an email for every RSVP:** the bottom of `Code.gs` has a ready-made
`notifyMe` block — uncomment it, add your address, redeploy.

---

## Editing the invitation later

Almost every change is a one-line edit in `assets/js/config.js`.

| To change | Edit |
|---|---|
| Names, parents, Instagram | `groom` / `bride` |
| Date, time, countdown target | `ceremonyStart`, `ceremonyEnd`, `dateLabel`, `timeLabel` |
| Venue, map pin | `venue` (set `mapsQuery` to `"-8.8196,115.2072"` for an exact pin) |
| Running order | `schedule` — add or remove rows freely |
| Bank details, gift address | `gift` |
| Photos, music, video | `media` |
| Verse, invitation wording | `copy` |
| RSVP deadline, max guests | `rsvpDeadline`, `maxGuestsPerRsvp` |

Changing the date automatically updates the countdown, the calendar grid, the
circled day and the Google Calendar link. You don't touch anything else.

**Colours** live at the top of `assets/css/style.css` under `:root` — change
`--celadon` to restyle every accent on the page at once.

> **If you edit `Code.gs`, you must redeploy:**
> Deploy → Manage deployments → pencil → Version: **New version** → Deploy.
> Keep the same deployment so the URL doesn't change.

---

## Troubleshooting

**RSVPs aren't reaching the sheet**
- Check `apiUrl` in `config.js` ends in `/exec`, not `/dev`.
- In Apps Script → Manage deployments, confirm **Who has access = Anyone**.
- Open the `/exec` URL in a browser. You should see `{"ok":true,"data":[...]}`.
  If you see a login screen, fix the access setting and redeploy.

**Wishes show "couldn't load"**
- Same causes as above. Also confirm `SHEET_ID` in `Code.gs` is correct.

**Music doesn't play**
- Phones block autoplay until someone taps. Tapping "Open Invitation" starts it.
  If it's still silent, tap the note button in the top right.

**The page is blank on GitHub Pages**
- Give it two minutes after the first deploy.
- Check `.nojekyll` uploaded and the `assets` folder kept its structure.

**Photos don't appear**
- Filenames are case-sensitive on GitHub. `Cover.JPG` ≠ `cover.jpg`.

**Someone submitted twice**
- Delete the extra row in the sheet. The site refreshes within 30 seconds.

---

## File map

```
wedding-invitation/
├── index.html                     Page structure
├── .nojekyll                      Tells GitHub Pages to serve all folders
├── README.md                      This guide
├── assets/
│   ├── css/style.css              All styling (colours at the top)
│   ├── js/config.js               ← THE ONLY FILE YOU EDIT
│   ├── js/main.js                 Countdown, calendar, RSVP, wishes
│   ├── img/                       Photos (+ placeholders)
│   ├── audio/                     Background music
│   └── video/                     Optional pre-wedding video
├── google-apps-script/Code.gs     Backend — paste into Apps Script
└── .github/workflows/deploy.yml   Auto-deploy on every commit
```

---

## Notes on how it works

- **No dependencies.** Only Google Fonts is loaded externally. Total page
  weight before your photos is roughly 40 KB.
- **RSVP transport.** The form POSTs JSON as `text/plain`, which avoids a CORS
  preflight that Apps Script can't answer. If that's blocked, it falls back to a
  JSONP GET automatically. Guests never see the difference.
- **Wishes refresh** every 30 seconds while the tab is open, and immediately
  after someone submits.
- **Spam.** A hidden honeypot field catches basic bots; the script drops those
  rows silently. Messages are capped at 500 characters and escaped before they
  render, so no one can inject HTML into your page.
- **Accessibility.** Keyboard focus is visible, the map has a title, and
  `prefers-reduced-motion` disables every animation.
