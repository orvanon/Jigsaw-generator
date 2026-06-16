# project-card — Word Search Studio

> A word-search studio: create English/Hebrew puzzles, save them to a cloud library synced across devices, and play them on an iPad by dragging a finger across the letters to find the words.

## Stack
- Runtime: Browser (frontend) + Vercel Serverless Functions (Node, ESM)
- Framework: None — vanilla HTML/CSS/JS, no build step
- DB / storage: Vercel Blob (private store `jigsaw-library`), one blob per puzzle
- Key libs: `@vercel/blob`
- Hosting: Vercel (auto-deploys from GitHub branch `claude/jigsaw-puzzle-generator-6fX63`)

## File tree
```
Jigsaw-generator/
├── index.html          # frontend — Create / Library / Play views + all puzzle logic
├── api/
│   └── library.js      # serverless CRUD: GET/POST/DELETE, one private Blob per puzzle
├── package.json        # type:module, @vercel/blob dep
├── vercel.json         # (empty config)
├── CLAUDE.md           # behavioral guidelines + project notes
└── project-card.md     # this file
```

## Entry points
- Frontend: `index.html` (static). Local dev: `vercel dev` (serves API too). Opening the file directly works for Create, but Library/Play need the API.
- API: `/api/library` — `GET` (list), `POST` (create/update one puzzle), `DELETE ?id=` (remove one).

## Data model
- Puzzle: `{ id, name, lang('en'|'he'), rows, cols, grid:string[][], words:[{word, cells:["r,c",...]}], createdAt, updatedAt }`
- Stored at `puzzles/<id>.json` in the Blob store (isolated per-puzzle blobs — no shared read-modify-write).
- Play progress is per-device in `localStorage` key `jigsaw_play_<id>` (array of found words). Not synced.

## External APIs
- Vercel Blob (private store). Reads bust CDN cache (cache-busting query + `no-store`) so saves/deletes are seen immediately.

## Play interaction
- Drag across letters (Pointer Events). Straight 8-direction lines only; match is by exact cell-path equality (forward or reverse) against stored solution cells. Touch-action disabled on the grid to prevent scroll. RTL-safe via logical `data-r`/`data-c`.

## Known issues / notes
- The API is intentionally **open (no auth)** — a family tool on an obscure URL. `del`/`put` pathnames are derived from a server-prefixed `puzzles/<id>.json`; ids are validated against escaping the prefix.
- Very long words in small grids may fail to place (warning shown; failed words are not saved).
- Mixed Hebrew/English in a single puzzle is not supported (language is auto-detected for the whole list).

## Changelog
| Date | Change |
|------|--------|
| 2026-04-28 | Initial implementation: word search generator with Hebrew/English support |
| 2026-06-16 | v2: cloud library (Vercel Blob), Create/Library/Play views, iPad drag-to-find play, resume + win states |
