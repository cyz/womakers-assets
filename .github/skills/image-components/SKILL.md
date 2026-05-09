---
name: image-components
description: "Use when adding or updating image generator components, banner formats, export flows, preview rendering, wizard steps, or history restore in this project. Good for new formats, input changes, step-flow changes, and export behavior updates in the React + TypeScript banner generator."
argument-hint: "Describe the format briefly: name, size, key inputs, and anything unusual about steps or export."
---

# Image Components

Use this skill when adding a new image generator format or updating an existing one.

Default to a short prompt. Infer project-standard behavior unless the request says otherwise.

## Mini Spec

Write this briefly before implementation:

- Generator name:
- Size:
- Required inputs:
- Visible steps:
- Notes only for non-default behavior:

Ask before coding only if one of these is missing:

- dimensions
- required inputs
- step flow
- export behavior when it is not the default project export

Do not ask for internal ids, blocker details, fallback behavior, filename patterns, or export scales unless the task depends on changing project defaults.

## Fast Path

1. Lock the spec in a few bullets:
   - format name
   - width and height
   - key required inputs
   - visible steps only if they differ from project defaults
   - export behavior only if it differs from project defaults
2. Implement the smallest valid change:
   - update typed state and defaults only if needed
   - register format metadata and selector UI
   - wire visible steps and `canProceed`
   - add or update the renderer branch
   - wire export and history restore
3. Reuse project rules:
   - uploads must be image-only and `<= 8 MB`
   - preview must survive missing optional images or backgrounds
   - recent exports stay restorable from `localStorage`
4. Verify:
   - `npm run lint`
   - `npm run build`
   - real browser flow for preview and export

## Default Assumptions

- Stack: React 19, TypeScript, Vite.
- UI: step wizard on the left, preview and history on the right.
- Rendering: async canvas render from typed state.
- Persistence: recent exports in `localStorage`.
- Existing minimal formats use only Format, Event, Export.
- `social_promo` skips Speakers.
- `speaker_banner` and `social_promo` require organizer logo to leave Event.
- Registration footer on `speaker_banner` or `social_promo` also requires registration URL.
- Speaker-based exports may generate one file per named speaker.
- Internal ids, fallback behavior, filename patterns, and export scales should follow existing project conventions unless the request says otherwise.

## Choose the Smallest Path

- Small tweak: edit the current branch only. Do not refactor.
- New format: extend the existing wizard and renderer. This is the default.
- New generator surface: only when inputs or rendering differ enough that keeping everything in the current flow would make `App.tsx` harder to reason about.

## Non-Negotiables

- Use explicit TypeScript types for new inputs.
- Keep step visibility and Next blocking correct.
- Keep exports deterministic.
- Keep history save and restore compatible.
- Keep fallback rendering when optional assets fail.
- Guard `JSON.parse` output before trusting it.
- Narrow `FileReader.result` before use.
- Prefer derived values over sync effects.
- Keep handlers simple.
- Finish with lint, build, and browser verification if app code changed.

## Done When

The format is selectable, preview renders with safe defaults, export matches preview, invalid uploads fail safely, history restore stays valid, and verification passes.

## Prompt Shape

Prefer prompts this short:

"Add a new image format for LinkedIn event cards, 1200x627, with title, date, organizer logo, and optional background image. Keep the existing wizard flow and default export behavior."

Also acceptable:

"Update social promo to support an optional sponsor badge without changing export behavior or history restore."
