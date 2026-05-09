---
name: image-components
description: "Use when adding or updating the current image generator component, banner formats, preview rendering, export flows, or history restore in this project. Good for new formats, input changes, UI section changes, and export behavior updates in the React + TypeScript banner generator."
argument-hint: "Describe the format briefly: name, size, key inputs, affected UI sections, and anything unusual about save or export."
---

# Image Components

Use this skill when adding the first image generator component, extending an existing format, or adjusting export and restore behavior in this project.

Default to a short prompt. Infer the current project behavior from `src/App.tsx` unless the request says otherwise.

## Mini Spec

Write this briefly before implementation:

- Generator name:
- Size:
- Required inputs:
- UI sections used:
- Notes only for non-default behavior:

Ask before coding only if one of these is missing:

- dimensions
- required inputs
- which existing UI sections should change when it is not obvious
- export behavior when it differs from current `Salvar versão` or `Baixar PNG`

Do not ask for internal ids, localStorage keys, filename patterns, fallback visuals, or export scale unless the task depends on changing current defaults.

## Current Baseline

The first component in this repo is the current editor in `src/App.tsx`. Treat it as the reference implementation.

- Single-screen editor, not a multi-step wizard.
- Main structure: `Estrutura`, `Formato`, `Conteudo do evento`, `Conteudo da palestrante`, `Resumo atual`.
- Banner selection is driven by typed metadata: type, variation, platform and dimensions.
- Current formats: `Encontro Pocket`, `Encontro Anual`, `Meetup Presencial`, `Live`, `Imersão`.
- Current variation model: `Palestrante` and `Agenda`, but only Pocket and Anual expose both.
- Current platform preset: `Instagram Feed (1080x1350)`.
- Event inputs: title, city, date, location.
- Speaker inputs: name, role, talk, optional photo.
- Preview is DOM-based and exported with `html-to-image` via `toPng`.
- Save flow stores image plus editor state in `localStorage`.
- Restore flow must validate parsed JSON before trusting it.
- Speaker photo upload accepts image files only and rejects files above 8 MB.
- When the speaker photo is missing, preview falls back to initials.

## Fast Path

1. Lock the spec in a few bullets:
   - format name
   - width and height
   - key required inputs
   - UI sections affected only if they differ from the current editor
   - export behavior only if it differs from the current save/download flow
2. Implement the smallest valid change:
   - update typed state and defaults only if needed
   - register new format metadata in the selector model
   - add only the fields required by the new format
   - update the preview branch in the existing editor flow
   - keep save, download, undo/redo, reset and restore working
3. Reuse project rules:
   - uploads must be image-only and `<= 8 MB`
   - preview must survive missing optional images
   - saved versions stay restorable from `localStorage`
   - export output should match the on-screen preview
4. Verify:
   - `npm run lint`
   - `npm run build`
   - real browser flow for edit, preview, save, restore and export

## Default Assumptions

- Stack: React 19, TypeScript, Vite.
- UI: editor panel on the left, preview and saved history on the right.
- Rendering: DOM preview inside `previewFrameRef`, exported as PNG.
- Persistence: current editor state and saved images live in `localStorage`.
- Changes should stay centered in `src/App.tsx` unless the request clearly justifies extraction.
- New formats should reuse current selectors, typed unions and normalization helpers when possible.
- Export is one image at a time.
- Internal ids, fallback behavior, filename patterns and export scale should follow current conventions unless the request says otherwise.

## Choose the Smallest Path

- Small tweak: edit the current branch only. Do not refactor.
- New format: extend the existing selector model, editor state and preview inside `App.tsx`. This is the default.
- New component extraction: only when the prompt explicitly asks for it or when the first component becomes materially harder to reason about without splitting view pieces.

## Non-Negotiables

- Use explicit TypeScript types for new inputs.
- Keep selector state, normalization and restore compatibility correct.
- Keep exports deterministic.
- Keep history save and restore compatible.
- Keep fallback rendering when optional assets fail.
- Guard `JSON.parse` output before trusting it.
- Narrow `FileReader.result` before use.
- Prefer derived values over sync effects.
- Keep handlers simple.
- Finish with lint, build and browser verification if app code changed.

## Done When

The format is selectable, the editor inputs are enough to produce the layout, preview renders with safe defaults, export matches preview, invalid uploads fail safely, history restore stays valid, and verification passes.

## Prompt Shape

Prefer prompts this short:

"Add a new image format for LinkedIn event cards, 1200x627, with title, date, organizer logo, and optional background image. Keep the current editor flow and default save/export behavior."

Also acceptable:

"Update the current banner editor to support an optional sponsor badge without changing save, restore or export behavior."
