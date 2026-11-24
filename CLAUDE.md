# Word Search Studio (Jigsaw-generator)

General workflow (sizing, approvals, TDD, quality gates, verification, UI design rules, git, model choice) lives in `~/.claude/CLAUDE.md`. Follow it. This file holds only what is specific to this project. A rule here that differs from the global one is marked **Overrides global** and wins for this project.

## What it is

A word-search studio: create English/Hebrew puzzles, save them to a cloud library synced across devices, and play them on an iPad by dragging a finger across the letters. A family tool. Status: paused since 2026-06 (last commit 2026-06-16, v2 2.0.0).

## Stack

Vanilla HTML/CSS/JS (no framework, no build step), Vercel serverless function (Node, ESM), `@vercel/blob` (private store `jigsaw-library`), hosted on Vercel (`project-card.md`: auto-deploys from branch `claude/jigsaw-puzzle-generator-6fX63`). Repo: `github.com/orvanon/Jigsaw-generator` (`package.json`).

## Layout

| Path | What's there |
| --- | --- |
| `index.html` | Whole frontend: Create / Library / Play views and all puzzle logic |
| `api/library.js` | Serverless CRUD at `/api/library` (GET list, POST create/update, DELETE `?id=`) |
| `project-card.md` | Stack, data model, play interaction, known issues, changelog |

## Commands

```bash
npm install
vercel dev     # serves the frontend and the API locally
```

No test, build or lint scripts. Opening `index.html` directly works for Create only; Library and Play need the API (`project-card.md`).

## Verify

No automated checks. Run `vercel dev`, then in the browser: create a puzzle from a word list (English and Hebrew), save it, find it in Library on reload, play it by dragging across a word. Saving needs `BLOB_READ_WRITE_TOKEN` (see `.env*.local`, never commit it).

## Docs

`project-card.md`.

## Project-Specific Notes

> **Before making any changes, read and update `project-card.md` first.**


- Vanilla JS/HTML frontend (`index.html`, no framework, no build step) + Vercel serverless API (`api/library.js`) backed by a private Vercel Blob store. Deploys from the GitHub branch; `vercel dev` runs it locally.
- Three views in `index.html`: Create (generate + save), Library (cloud, synced), Play (iPad drag-to-find).
- Language detection (Hebrew vs English) is automatic based on input characters; the whole UI is RTL-aware.
- Word placement must only allow cell sharing when letters match (no silent overwrites).
- Keep the puzzle/generation/play algorithm in one `<script>` block inside `index.html`. Only persistence/sync lives in `api/`.
- Cloud library: ONE private Blob per puzzle at `puzzles/<id>.json` — never a single shared file (read-modify-write of a shared blob loses data under blob caching). Play progress is per-device in `localStorage` (`jigsaw_play_<id>`), not synced.
