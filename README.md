# Jogos Santa Casa Draw Archive

A machine-readable archive of Portuguese lottery draw results from [Jogos Santa Casa](https://www.jogossantacasa.pt), automatically updated after each draw.

## Games

### Totoloto — `totoloto.jsonl`

**Coverage:** draws 012/2011 through 044/2026 (1 589 draws)

**Format:**

```json
{"id": "14816", "draw": "044/2026", "date": "2026-06-03", "numbers": [7, 13, 24, 34, 43], "lucky": 13}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Sequential draw ID from Jogos Santa Casa |
| `draw` | string | Official draw reference (`NNN/YYYY`) |
| `date` | string | Draw date in ISO 8601 format (`YYYY-MM-DD`) |
| `numbers` | number[] | Five main numbers, sorted ascending (1–49) |
| `lucky` | number | Lucky number (1–9) |

Updated automatically at **22:30 UTC on Wednesdays and Saturdays**.

## TODO

Games to add:

- [ ] Euromilhões
- [ ] Eurodreams
- [ ] Totobola
- [ ] Totoloto (draws before 2011)

## Updates

Each game has a GitHub Actions workflow that scrapes the Jogos Santa Casa results page after each draw, appends any new result to the corresponding `.jsonl` file, and commits it. Workflows can also be triggered manually via `workflow_dispatch`.

## Source

Results are sourced from the official Jogos Santa Casa website.
