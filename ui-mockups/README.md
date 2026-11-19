# Castellan UI mockups

Castellan is a small componentized UI mock for the coding-platform blueprint. No framework, no build dependencies, no network calls. The light palette is **Parchment**; the dark palette is **Graphite**.

## Generated pages

| File | What it is |
| --- | --- |
| `app.html` | **Castellan app UI only** — no browser chrome, no title bar. Full-height rails, explorer, tabs and views. Embedded in the blueprint. |
| `console-shell.html` | **Castellan in a browser window** — the same UI inside separate browser chrome. |

The two shell pages and `app.js` are **generated**. Edit the markup or the JS source fragments, then run:

```bash
python3 ui-mockups/build.py
```

`app.js` is a build artifact: the files in `scripts/` are concatenated in filename order inside one strict-mode closure and written back to `app.js`. Edit `scripts/*.js`, not `app.js`. CSS files under `styles/` are linked directly and do not need a rebuild.

## Components

```
components/
├─ browser-window.html     traffic lights and URL only
├─ app-shell.html          full-height three-pane body + slots
├─ left-rail.html          working / workspaces / temporary
├─ right-rail.html         tab strip, plus menu, Explorer and file panes
└─ views/
   ├─ all.html             includes the eight views in order
   ├─ task-auth.html
   ├─ task-rate.html
   ├─ dashboard.html
   ├─ temp-new.html
   ├─ temp-existing.html
   ├─ working.html
   ├─ new-task.html
   └─ archived.html
```

The browser chrome owns no app controls. The left rail has its own brand/collapse header; the right rail has its tab strip and close button. Both rails run the full height of the app. When the left rail is collapsed it leaves a 26 px strip with the Castellan mark; click it to reopen. The Workspaces section has its own chevron and remembers its collapsed state. When the context rail is closed it leaves a 26 px reopen strip.

## Styles and behavior

| File | Responsibility |
| --- | --- |
| `mockup.css` | Shared Castellan tokens (Parchment / Graphite), base page, pills and focus ring. |
| `browser.css` | Browser chrome: window frame, traffic lights, URL. |
| `styles/app-layout.css` | Stage, shell, panes, rails and resizers. |
| `styles/left-rail.css` | Brand, sections, workspace/task rows and the bottom Archive link. |
| `styles/views.css` | Shared view chrome, task/chat cards, approvals and empty states. |
| `styles/right-rail.css` | Context tabs, Explorer, file viewer, previews and terminal. |
| `styles/dashboard.css` | Workspace dashboard widgets and dev-server card. |
| `styles/temp.css` | Temporary-chat intro and context setup. |
| `styles/composer.css` | Composer shell, model/effort toolbar and context chips. |
| `styles/pickers.css` | Add menu, Upload, Remote chooser and model/effort popovers. |
| `styles/archive.css` | Archive cards, bottom rail link and blurred confirmations. |
| `styles/responsive.css` | All media queries, loaded last. |
| `scripts/00-store.js` | State, workspace data, DOM refs, small helpers. |
| `scripts/05-theme.js` | Rail theme toggle, `castellan.theme` persistence and parent sync. |
| `scripts/10-dashboard.js` | Workspace dashboard and dev-server state. |
| `scripts/15-left-rail.js` | Workspace selection and unread cleanup. |
| `scripts/20-right-rail.js` | Context tab strip and pane behavior. |
| `scripts/25-explorer.js` | File tree, file tabs, Markdown/SVG previews, diffs and context sync. |
| `scripts/30-temp.js` | Temporary-chat workspace/folder context. |
| `scripts/40-archive.js` | Archive list, restore/delete, confirmations and Delete all. |
| `scripts/50-navigation.js` | View switching and active rail state. |
| `scripts/60-bindings.js` | Global event bindings and menu wiring. |
| `scripts/70-composer.js` | Model/effort state, composer toolbar and chips. |
| `scripts/80-pickers.js` | Add menu, Upload, Remote chooser, selectors and positioning. |
| `scripts/90-resizing.js` | Left/right rail drag sizing. |
| `scripts/99-init.js` | Boot sequence. |
| `files.js` | Demo file tree, file contents, Markdown, SVG and static-site payloads. |
| `../logo/LogoLight.svg` | Castellan castle mark for the light palette. |
| `../logo/LogoDark.svg` | Castellan castle mark for the dark palette. |
| `models.js` | Codex model list, supported reasoning efforts and defaults used by every composer. |
| `app.js` | Generated bundle; never edit directly. |
| `plan.css` / `plan.js` | Blueprint styles and behavior, extracted from the root HTML. |

## Composer controls

Every chat input has the same controls:

- **Model** picker — GPT-5.3 Codex, GPT-5.2 Codex, GPT-5.1 Codex Max, GPT-5.1 Codex Mini, GPT-5.1 and o3.
- **Reasoning effort** picker — only the efforts the selected model supports (`none`, `low`, `medium`, `high`, `xhigh`). Changing models clamps an unsupported effort to that model's default.
- **＋ context** — opens a two-choice menu: **Upload** (pick one or more local files from this device) or **Remote** (open a searchable file chooser for the remote machine).
- **Remote** opens a file browser at the workspace root with the same path bar and expandable tree as the Context Explorer. A single click expands a folder; double-click **opens** it (the path bar updates and Up returns to the parent). Search, multi-select and an Attach button are included. Task/new-task composers use the fixed workspace; temporary chats can switch workspace in the same dialog.
- Local uploads and remote files appear as removable chips above the input. Remote selections are staged until **Attach**; Cancel discards them. Model, effort and attachments are per composer.

The model list is demo data in `models.js`. The real app should hydrate it from app-server `model/list`.

## Temporary chat

- A temporary chat is a normal empty chat with a composer: no workspace/folder setup block.
- Use **＋ → Remote** to choose a workspace and browse folders/files. Choosing a workspace also opens the Context rail on the Explorer; selected remote files become chips. **＋ → Upload** adds local files.
- No branch, no commit, read-only, 7-day expiry, or promote with **Keep as task**.

## Right rail: Explorer + file tabs

- Starts with an **Explorer** tab. The path bar sits directly under the tabs, e.g. `/home/manuel/Downloads/random_projects/codingPlatform`.
- `components/` and `public/` start expanded; every other folder expands on click. Refresh re-reads the tree without collapsing it.
- Folders are a tree: clicking one expands or collapses it in place, with the path bar staying at the workspace root. Files open in **new context tabs**. The Explorer itself never shows file contents.
- File tabs are shared by code, rendered **Markdown**, **images**, and **static HTML** rendered in a sandboxed iframe.
- The **＋** menu in the rail adds Explorer, Terminal, Diff or Preview. Tabs close individually; closing the active one activates its neighbour.
- Closing the rail leaves a 26 px context strip; clicking it reopens the rail with the existing tabs.
- Dashboard actions (*Open preview*, *Logs*, *Open diff*, *Browse files*) add or activate the matching tab.
- There are two different plus buttons: **composer ＋** opens Upload/Remote; **rail ＋** adds a Context tab (Explorer, Terminal, Diff, Preview).

## Archive

- Each task and temporary-chat row in the left rail has a small **archive `⇩`** button next to it.
- Clicking archive opens a centered confirmation dialog over an unfocused, blurred workspace. **Cancel** leaves it alone; **Archive** hides the item from the rail and opens the **Archive** view.
- The rail has a muted **Archive** link pinned to the bottom, just above the user footer, with the count inline. No section header and no prominent button treatment.
- The Archive view also has **Delete all**, which is only shown when there is archived work. It opens the same full-window blurred confirmation and permanently clears the archive.
- Archived tasks/chats are listed with workspace, type and archived time. **Restore** puts the item back in the rail and opens it; **Delete** removes it permanently from the archive.
- Archiving a task also clears the active task from its workspace dashboard; restoring puts it back.

## Full height and resizing

- No global title bar. The left rail, central view and context rail span the app height and each owns its own header.
- Drag the divider on either side of the central view to resize the left and right rails. Widths are clamped so the central pane stays usable and are remembered in `localStorage`.
- Left rail collapse and context close leave slim reopen strips rather than disappearing entirely.

## Sizes

- The app is designed at **920 px** wide, compact below 900 px, and usable down to **800 px**.
- `app.html` is **592 px** tall; the browser-wrapped page is **632 px** tall. The blueprint embeds `app.html` in a 592 px frame with `min-width: 800px`; its wrapper scrolls horizontally below that.

## Theme handshake

Both generated pages post a theme request and listen for:

```js
{ type: "mock-theme", theme: "light" | "dark" }
```

The blueprint sends its current theme to both iframes. The app rail has its own light/dark button: it stores the choice in `castellan.theme`, updates the logos, and — when embedded — posts `{ type: "mock-theme-change", theme }` to the blueprint. The blueprint applies and persists that choice, then syncs the frames. Standalone pages start from the saved `castellan.theme`, falling back to the OS color scheme.

## Editing

- Markup changes: edit `components/` and run `python3 ui-mockups/build.py`.
- JS changes: edit `scripts/*.js` and run `python3 ui-mockups/build.py` so `app.js` is regenerated.
- CSS changes: edit `styles/*.css` and refresh; no rebuild needed.
- File data and sample content lives in `files.js`; add a tree node and a `files` entry to add a file.
- The sample SVG (`public/og-card.svg` in the mock tree) is embedded in `files.js` and rendered from its content; there is no separate asset file.
- Blueprint plan changes: edit `plan.css` / `plan.js` at the project root; the root HTML links both.
- The blueprint embeds `app.html` relative to its own folder; `console-shell.html` is there for the browser-window preview. Keep `ui-mockups/` next to the blueprint.
- The two logos switch with `data-theme`: `LogoLight.svg` for Parchment, `LogoDark.svg` for Graphite, in the left rail and the blueprint header.

## Print

The plan is print-friendly for text and tables. The shell mockup is hidden in print because it needs a wide interactive canvas; the plan still prints.
