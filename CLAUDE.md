# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A machine-readable archive of Portuguese lottery draw results from Jogos Santa Casa, stored as append-only JSONL files and auto-updated by a single GitHub Actions workflow.

## Running the update script locally

No install step — the script uses only Node.js built-ins (no `package.json`).

```sh
node .github/scripts/update-archive.mjs
```

Requires Node.js 24+ (uses top-level `await`).

## Architecture

### Data files

| File | Game | Updated (UTC) |
|---|---|---|
| `totoloto.jsonl` | Totoloto | Thu & Sun 01:00 |
| `euromillions.jsonl` | Euromilhões | Wed & Sat 01:00 |
| `eurodreams.jsonl` | Eurodreams | (untracked, not yet in workflow) |

Each file is an append-only newline-delimited JSON log. One JSON object per line, one draw per line. Lines are ordered chronologically.

### Update script (`.github/scripts/update-archive.mjs`)

Fetches the current draw from `jogossantacasa.pt`, parses it from the HTML (ISO-8859-1 encoded), then appends to the archive only if the `draw` field (e.g. `"044/2026"`) is not already present. Deduplication is by `draw`, not by `id`.

**Note:** the script does not fetch the `id` field, so records appended by the automated workflow will lack it. Older records in the archives have `id` from a prior bulk import.

### Workflow (`.github/workflows/update.yml`)

Runs on `schedule` (cron `0 1 * * 3,4,6,0`) and `workflow_dispatch`. After running the script, commits any changed `.jsonl` files with a message referencing the latest Totoloto draw number.

## Adding a new game

1. Add a `fetchGameName()` function in `update-archive.mjs` following the same pattern: `fetchHtml` → regex parse → return plain object.
2. Add a `updateArchive(PATH, await fetchGameName(), 'Label')` call at the bottom.
3. Add the new `.jsonl` file (pre-seeded or empty) and update the workflow's commit step to stage it.
4. Update the cron schedule in `update.yml` if the draw days differ from existing games.
5. Document the record format in `README.md`.
