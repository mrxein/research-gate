# Paper Atlas
`npm install && npm run dev`

- Add a paper: drop a JSON file in `data/papers/` (see `lib/types.ts` for the schema; `limitations[].theme` drives gap detection).
- Sample papers are fictional placeholders. Replace them with real data.
- Workspace state (status, notes, tags, evidence, validations, questions) is saved in browser localStorage. Replace `update` in `lib/workspace.tsx` to persist elsewhere.
- Gap detection (`lib/gaps.ts`) is heuristic and unvalidated until you add a validation note.
