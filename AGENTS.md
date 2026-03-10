# AGENTS.md

## Knowledge Base

This project uses **Obsidian** as a knowledge base in `knowledge-base/`. Open it in Obsidian to browse documentation, tasks, and architecture notes.

### Key Files

| File | Purpose |
|------|---------|
| `knowledge-base/Home.md` | Entry point / index |
| `knowledge-base/Roadmap.md` | Sprint planning overview |
| `knowledge-base/Tasks.base` | Task tracking views (open in Obsidian) |
| `knowledge-base/Tasks/*.md` | Individual task notes |
| `knowledge-base/Manual Test Checklist.md` | Pre-release test checklist |
| `knowledge-base/Releasing.md` | Release workflow guide |

### Task Tracking

Tasks are tracked as Obsidian notes with frontmatter properties:

```yaml
---
task_id: TASK-XXX
status: planned | partial | completed | duplicate
priority: P0 | P1 | P2
effort: S | M | L
area: player | ui | config | search
---
```

Open `knowledge-base/Tasks.base` in Obsidian to see task views: All Tasks, Backlog, In Progress, Completed.

## Tech Stack

- **Runtime**: Bun (not Node.js)
- **Player**: mpv via IPC
- **UI**: Terminal (blessed-like with ink)

## Commands

```bash
bun run src/index.ts    # Run the app
bun test                # Run tests
```

## Testing & Releasing

- **Manual Testing**: Before release, run through `knowledge-base/Manual Test Checklist.md` in Obsidian
- **Releasing**: Follow the guide in `knowledge-base/Releasing.md` for version bumping and publishing
