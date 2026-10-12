# Petrichor Field Manual — Risk of Rain 2

> A fan-made beginner academy, survivor build planner and item codex. **65 distinct build paths for 21 survivors**, including four each for Acrid and Enforcer. Built for static deployment on **Vercel**.

This is a **fan project**, not affiliated with Hopoo Games, Gearbox, 2K, wiki.gg, or Risk of Rain 2's developers. Game names, art and trademarks belong to their respective owners.

## Highlights

| Section | Contents |
| --- | --- |
| **Build Lab** | A full **21-survivor portrait grid** (no survivor dropdown); 65 strategy paths; visual skill cards for **all 142 abilities** with descriptions and clickable choices; illustrated build presets; core items, stack targets, combat advice, and editable inventory. |
| **Survivors** | 21 selectable profiles (20 standard + secret Heretic), portrait cards, pictured skill options and multiple builds for each. |
| **Beginner Academy** | 20 guided lessons, vocabulary, first-run walkthrough, quiz and completion tracking. |
| **Items** | Searchable codex of curated regular items plus 11 Hallowed items, with rarities, explanations and links to detailed wiki pages. |
| **Hallowed Concepts** | All 14 Hexes, 11 Hallowed rewards, cleanse-trade explainer and interactive risk selector. |
| **N'tormat** | Seven usable ritual pages, usage tips and a simulated per-stage charge reset (not an actual gameplay engine). |
| **Bosses, trials & places** | Illustrated boss cards, directions, rewards, 20 destination cards and all 9 Winnowing trial challenges with wiki links. |
| **Proc Guide** | Coaching for all 21 survivors, verified coefficients on known abilities and an interactive Tri-Tip bleed-chance example. |
| **Skill deep dives** | Selected abilities display proc data, important notes, image, and build item synergies. Some wiki tables are incomplete for the newest skills. |
| **Inline Field Notes** | Hover, focus or tap unfamiliar terms on game pages to open a small explanation; also searchable in the Glossary. Covers Corruption, proc coefficient, item stacking, defense, boss and DLC mechanics. |

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
   git remote add origin https://github.com/thedarkrain/ror2-build-guide.git
   git push -u origin main
   ```

4. In [Vercel](https://vercel.com/new), choose **Add New Project → Import Git Repository**.
5. Select your repo. Project settings: **Framework Preset: Other**, **Build Command: `npm run build`**, **Output Directory: `dist`**, **Install Command: `npm install`** (or leave default).
6. Click **Deploy**. All game data is statically bundled; no API keys or environment variables required.

Vercel automatically redeploys on subsequent pushes.

## Wiki image sources and limitations

The interface **hotlinks wiki-hosted images** for survivor portraits, individual skills, items, Hexes, Hallowed items and N’tormat pages. It uses the wiki's direct thumbnail format:

```text
https://riskofrain2.wiki.gg/images/thumb/Infusion.png/128px-Infusion.png
```

The code creates these URLs from wiki filenames in `src/app.js` (`imageSources`), with alternate sizes and original-file URLs as fallbacks. There is **no image downloading or asset-sync command**. Images are loaded by the visitor's browser from `riskofrain2.wiki.gg`.

Some new DLC artwork may use a different file name or be temporarily unavailable. In these cases the interface shows a short text fallback. This environment could check the URL pattern but could **not** load and verify every remote image. Because hotlink availability depends on wiki.gg, keep its terms and image copyright in mind.

The project includes beginner-friendly editorial ability notes in `src/data/skill-notes.js`; check the wiki link for precise cooldowns, damage values, and unlock requirements. We verified the survivor roster and specific Operator ability names against the wiki.

**Artwork and rights:** Game images remain the property of their rights holders and relevant contributors. This is an independent fan reference site. Confirm the reuse/hotlink rules of wiki.gg and game publishers for public deployment; respect any takedown requests.

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
│       ├── skill-notes.js           # illustrated ability cards: concise descriptions
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


## Wiki artwork hotlinking

Game art is **not downloaded or stored in this repository**. Images load from `https://riskofrain2.wiki.gg/images/thumb/<filename>/128px-<filename>` (with larger-size/original fallbacks). Browsers need access to wiki.gg, and new image filenames may require maintaining the mapping in `src/app.js` (`imageSources`). Hotlink availability is controlled by the wiki, not Vercel. If an image is missing, the UI displays initials rather than showing a broken-image icon.

Run `npm run check && npm run smoke && npm run build` to validate locally, then push to GitHub; Vercel can automatically redeploy.


## October 2026 illustrated encounters and proc optimization update

The build lab includes a **Proc Optimization** panel for each of the 65 build presets.
It updates when the survivor, build and chosen abilities change. The new **Proc Guide** shows coaching cards for the complete 21-survivor roster, and a calculator demonstrates how Tri-Tip Dagger's bleed chance changes with **proc coefficient**, individual hit, and item stacks. For multi-hit skills, it deliberately reports a **per-hit** value rather than incorrectly multiplying it by the number of projectiles. Crit chance does not scale with proc coefficient.

**Bosses & places** now covers 11 notable fights, 20 stages / realms / destinations, and all nine N'kuhana trial objectives across Predation, Mortality and Survival. Cards link to relevant wiki pages with detailed mechanics. Wiki images remain remote and may fail on some networks; image-file availability varies, so the app retains labeled fallbacks.

### Deploy this update directly

In PowerShell, from the directory containing `package.json`:

```powershell
npm run check
npm run smoke
npm run build
npx vercel@latest --prod
```

If the Vercel project is already connected to GitHub, you can instead push to `main`.

**References:** [Proc Coefficient](https://riskofrain2.wiki.gg/wiki/Proc_Coefficient), [Engineer skills](https://riskofrain2.wiki.gg/wiki/Engineer), [N'kuhana Trials](https://riskofrain2.wiki.gg/wiki/N%27kuhana_Trials), [Environments](https://riskofrain2.wiki.gg/wiki/Map), [Soulbound Threshold](https://riskofrain2.wiki.gg/wiki/Soulbound_Threshold), and the relevant character, boss and stage pages linked from each card. These are wiki-informed editorial summaries, **not copies of entire wiki articles**.


## Reworked homepage + beginner definitions

The homepage now presents the base game and **all four expansions** with expansion rosters and links into playable survivor builds, plus a guided three-step entry for newcomers. The visual direction draws inspiration from the game's science-fiction atmosphere but uses original layout and CSS, not an official branded template.

**Field Notes glossary:** Hover a gold dotted term on desktop, press Tab and Enter on a focusable term, or tap it on mobile to see a brief beginner-friendly explanation. Close a pinned definition with Esc or by tapping elsewhere. Read or expand definitions in the Glossary navigation page. The explanatory content lives in `src/data/terms.js`; use this list to expand the vocabulary. **Void Fiend** has a visible Controlled-vs-Corrupted walkthrough, with example meter states, health costs, +100 armor and practical skill explanations. This illustrative meter is not connected to the game.

All survivor build paths and boss/DLC guides remain present in the update. Images continue to use wiki-hosted direct URLs, and require access to wiki.gg when a visitor loads the page.
