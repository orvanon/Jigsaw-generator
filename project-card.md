# project-card — Word Search Puzzle Generator

> A browser-based word search puzzle generator that supports English and Hebrew, with automatic language detection and a reveal-solution button.

## Stack
- Runtime: Browser (no server)
- Framework: None — vanilla HTML/CSS/JS
- DB: None
- Key libs: None

## File tree
```
Jigsaw-generator/
├── index.html        # entire app — UI + puzzle logic in one file
├── CLAUDE.md         # behavioral guidelines + project notes
└── project-card.md   # this file
```

## Entry points
- Open `index.html` directly in a browser (no build step needed)

## External APIs
- None

## Active tasks
- [ ] Add click-to-select word interaction (highlight cells on click-drag)
- [ ] Add print/export to PDF option

## Known issues
- Very long words in small grids may fail to place (user gets an error message)
- Mixed Hebrew/English word lists are not supported in a single puzzle

## Changelog
| Date | Change |
|------|--------|
| 2026-04-28 | Initial project-card created |
| 2026-04-28 | Initial implementation: word search generator with Hebrew/English support |
