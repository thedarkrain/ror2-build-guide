# Petrichor Field Manual — Risk of Rain 2

> A fan-made beginner academy, survivor build planner and item codex. **65 distinct build paths for 21 survivors**, including four each for Acrid and Enforcer. Built for static deployment on **Vercel**.

This is a **fan project**, not affiliated with Hopoo Games, Gearbox, 2K, wiki.gg, or Risk of Rain 2's developers. Game names, art and trademarks belong to their respective owners.

## Highlights

| Section | Contents |
| --- | --- |
| **Build Lab** | 65 strategy paths; 3–4 per survivor; skill loadout changes with preset; core item priorities; real item art; why each item helps; rough stack targets; combat rotation; downsides; editable item inventory and JSON export/import. |
| **Survivors** | 21 selectable profiles (20 standard + secret Heretic), skill alternatives and multiple builds for each. |
| **Beginner Academy** | 20 guided lessons, vocabulary, first-run walkthrough, quiz and completion tracking. |
| **Items** | Searchable codex of curated regular items plus 11 Hallowed items, with rarities, explanations and links to detailed wiki pages. |
| **Hallowed Concepts** | All 14 Hexes, 11 Hallowed rewards, cleanse-trade explainer and interactive risk selector. |
| **N'tormat** | Seven usable ritual pages, usage tips and a simulated per-stage charge reset (not an actual gameplay engine). |
| **DLC & Bosses** | Base game and four DLC summaries, ending paths, notable bosses and Karma overview. |
| **Glossary** | Plain-language explanations of combat mechanics and terms. |

**Important distinction:** Mechanics are explained using wiki information. The build priorities, suggestions and target stacks are **editorial recommendations**, **not verified global optima**. Some new October 2026 Hallowed Concepts interactions are still being documented. Check individual wiki pages for exact numbers and patches.

## Quick start

Requires **Node.js 20+**. There are **zero runtime npm dependencies**.

```bash
npm run dev
```

Open **http://localhost:4173**.

For a production build:

```bash
npm run check
npm run smoke
npm run build
npm run preview
```

The `dist/` directory contains the static deployable website.

## Deploy to Vercel

1. Create a new GitHub repository, for example `ror2-field-manual`.
2. Copy all the project files into it (keep `src/`, `scripts/`, `public/`, `vercel.json`, and `package.json`).
3. Push it to GitHub:

   ```bash
   git init
   git add .
   git commit -m "Initial Petrichor Field Manual"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ror2-field-manual.git
   git push -u origin main
   ```

4. In [Vercel](https://vercel.com/new), choose **Add New Project → Import Git Repository**.
5. Select your repo. Project settings: **Framework Preset: Other**, **Build Command: `npm run build`**, **Output Directory: `dist`**, **Install Command: `npm install`** (or leave default).
6. Click **Deploy**. All game data is statically bundled; no API keys or environment variables required.

Vercel automatically redeploys on subsequent pushes.

## Actual game icons and portraits

This project deliberately uses **real game icon/portrait URLs**, rather than fabricated emoji substitutes:

- Primary item and survivor image source: [MattieTK/ror.tk.gg](https://github.com/MattieTK/ror.tk.gg)'s publicly hosted game-image paths. That project's README says its art was derived from the [Risk of Rain 2 wiki](https://riskofrain2.wiki.gg/).
- Missing or newly added images fall back to wiki.gg `Special:Redirect/file` paths.
- Game artwork is **loaded remotely**; the project ZIP does **not** redistribute the image files. If an image host blocks requests or a file is not yet available, a legible item-name fallback appears.
- Expansion hero artwork is linked to a promotional image hosted by Epic Games.

Please check each asset's use conditions before launching a public/commercial site. Remote URLs are not guaranteed permanent. If you later secure permission for hosting local artwork, change `imageSources` in `src/app.js` to your own public asset directory.

## Folder map

```text
ror2-field-manual/
├── .github/workflows/validate.yml  # validates builds on GitHub push
├── public/favicon.svg
├── src/
│   ├── app.js                       # browser UI / user interactions
│   ├── style.css                    # responsive design
│   └── data/
│       ├── game.json                # survivors, builds, items, Hexes, spells
│       ├── extra.js                 # curated additional item definitions
│       └── learn.js                 # lessons, glossary, quizzes, boss guides
├── scripts/
│   ├── dev.mjs                      # local static server
│   ├── build.mjs                    # copies deploy assets into dist/
│   ├── check.mjs                    # data integrity checks
│   ├── smoke.mjs                    # dependency-free simulated UI test
│   └── enrich_builds.py             # optional regeneration of editorial build fields
├── index.html
├── package.json
├── vercel.json
└── README.md
```

## Updating and improving builds

Every survivor in `src/data/game.json` has a `builds` array. Each build contains:

- `title`, `style`, `desc`, `difficulty`
- `skillChoices`: zero-based indices into the survivor's `skills` option lists, auto-selected in the UI
- `items`, `core` (top 3), and `priority` (one entry per item with `why` and `target`)
- `how`: combat rotation
- `risk`: what makes the strategy fail

For day-to-day edits, update **`src/data/game.json` directly** and rerun `npm run check`. `scripts/enrich_builds.py` is optional provenance for the editorial recommendations and **may regenerate existing build metadata**; don't run it after hand-editing data unless you want that regeneration.

The inventory, chosen survivor, loadout, quiz progress and lessons are persisted in **browser localStorage**. There is no account login or game sync.

## References and attribution

The reference source requested for this guide is the community wiki:

- [Risk of Rain 2 Wiki — home](https://riskofrain2.wiki.gg/)
- [Acrid (skill mechanics)](https://riskofrain2.wiki.gg/wiki/Acrid)
- [Enforcer](https://riskofrain2.wiki.gg/wiki/Enforcer)
- [Item Stacking](https://riskofrain2.wiki.gg/wiki/Item_Stacking)
- [Proc Coefficient](https://riskofrain2.wiki.gg/wiki/Proc_Coefficient)
- [Hallowed Concepts](https://riskofrain2.wiki.gg/wiki/Hallowed_Concepts)
- [Hallowed Shrine](https://riskofrain2.wiki.gg/wiki/Hallowed_Shrine)
- [The N'tormat](https://riskofrain2.wiki.gg/wiki/The_N%27tormat)

Text is an independently written, simplified guide. It does **not** republish the wiki's full article text or an offline wiki mirror. Some details may become out of date after patches.

## License

The original website **source code** in this repository is MIT-licensed; see `LICENSE`. That license does **not** apply to any external game assets, trademarks, wiki content, or third-party repositories.
