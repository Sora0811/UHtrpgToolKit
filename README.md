HEAD
# UH TRPG Tool Library

Web-based collection of small, independent tools for UH TRPG players and GMs.

## Structure

```
UHtrpg-Tools/
├─ index.html          # Library landing page
├─ README.md
├─ shared/             # Shared code used by multiple tools
│  ├─ styles.css
│  └─ common.js
└─ tools/              # One directory per independent tool
   └─ example/         # Minimal example tool (validates the library)
      ├─ index.html
      ├─ style.css
      └─ script.js
```

## Principles (see spec v0.1)

- Each tool under `tools/<name>/` is a standalone web app.
- Tools must open and work on their own, without other tools present.
- Shared code lives in `shared/` and is only extracted when reuse is real.
- No game rules, formulas, accounts, sync, or external services are implemented here.

## Detaching / forking a single tool later

Yes — every tool is designed to be separable. To split one tool into its own project:

1. Copy `tools/<tool-name>/` to the new project root.
2. If it uses shared code, copy the needed files from `shared/` alongside it (or vendor them), and update the relative import paths in the tool's HTML/JS (e.g. `../../shared/styles.css` → `./shared/styles.css`).
3. Update the landing link on this library's `index.html` if the tool is removed from the library.
4. Verify the detached tool opens and works on its own (desktop + mobile widths).

Tools never depend on other tools or on the library's page structure, so detachment does not break them. Shared code is optional: a tool that does not import from `shared/` can be moved as-is.

## Adding a tool

1. Create `tools/<tool-name>/` with its own `index.html`.
2. Reuse `shared/` only when needed; keep the tool independently runnable.
3. Add a link on the root `index.html`.
4. Verify on desktop and mobile widths.

origin/main
