# BloomFlow Sidebar Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished, responsive, collapsible BloomFlow Sidebar with persisted desktop/tablet preference while preserving all existing menu and routing behavior.

**Architecture:** Keep `AppLayout.jsx` as the single owner of Sidebar UI state. Add a separate desktop/tablet `isCollapsed` state persisted under a dedicated `localStorage` key, while retaining the existing mobile drawer state and forcing the mobile drawer to render expanded. Keep all visual changes in the existing `src/nav.css` file, using CSS transitions and existing theme variables.

**Tech Stack:** React 19, React Router `NavLink`, lucide-react, CSS in `src/nav.css`, browser `localStorage` and `matchMedia`.

## Global Constraints

- Do not change routes, API usage, auth, permissions, role resolution, menu definitions, or data fetching.
- Use the existing `src/nav.css` for Sidebar and Navbar styling; do not add a styling dependency.
- Use approximately `300ms ease-in-out` transitions.
- Desktop defaults expanded and tablet defaults collapsed only when no stored preference exists.
- Mobile drawer always renders expanded and closes from toggle, overlay, or menu selection.
- Preserve unrelated existing worktree changes in `src/components/ui.jsx`, `src/pages/Settings/index.jsx`, `src/layouts/AppLayout.jsx`, and `src/assets/Logo.png`.

---

### Task 1: Add Persisted Sidebar UI State

**Files:**
- Modify: `src/layouts/AppLayout.jsx:1-19,112-157`

**Interfaces:**
- Consumes: existing `menus`, `roleLabels`, `NavLink`, `useAuth`, and mobile `open` state.
- Produces: `isCollapsed` class/state for desktop and tablet, a floating toggle button, and the existing mobile drawer close behavior.

- [ ] **Step 1: Add the Sidebar preference constants and initializer**

Add a module-level key and initializer near the existing role constants. The initializer must be safe during normal browser rendering and use the viewport only as a fallback:

```jsx
const SIDEBAR_COLLAPSED_KEY = "bloomflow.sidebar.collapsed";

function getInitialSidebarCollapsed() {
  const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (stored === "true" || stored === "false") return stored === "true";
  return window.matchMedia("(max-width: 1024px)").matches;
}
```

- [ ] **Step 2: Add the persisted collapse state without changing menu state**

Inside `AppLayout`, keep the existing `open` state for the mobile drawer and add:

```jsx
const [isCollapsed, setIsCollapsed] = useState(getInitialSidebarCollapsed);

useEffect(() => {
  window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
}, [isCollapsed]);
```

Update the React import to include `useEffect`. The `open` state must remain the only state used for mobile drawer visibility.

- [ ] **Step 3: Add the Sidebar state classes and floating toggle**

Render the existing `aside` with classes that distinguish collapsed desktop/tablet state from mobile drawer state, while retaining `open` for the drawer:

```jsx
<aside className={`${isCollapsed ? "collapsed" : ""} ${open ? "open" : ""}`}>
```

Add a button immediately after the brand/header block and before the scrollable menu region. It must toggle only `isCollapsed` on non-mobile CSS layouts:

```jsx
<button
  className="sidebar-toggle"
  type="button"
  onClick={() => setIsCollapsed((value) => !value)}
  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  aria-expanded={!isCollapsed}
>
  {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
</button>
```

Import `ChevronLeft` and `ChevronRight` from `lucide-react`. The existing Navbar `onMenu={() => setOpen(true)}` remains unchanged.

- [ ] **Step 4: Add tooltip metadata without changing menu data**

Replace the existing `NavLink` opening element with the following complete element, preserving the current `key`, `to`, `end`, and click handler values:

```jsx
<NavLink
  className="sidebar-link"
  key={name}
  to={path}
  end={path === "/"}
  onClick={() => setOpen(false)}
  title={name}
  data-tooltip={name}
>
  <Icon size={18} />
  <span>{name}</span>
</NavLink>
```

Keep the existing `onClick={() => setOpen(false)}` so selecting any menu closes the mobile drawer. Do not alter `to`, `end`, item ordering, role menus, or labels.

- [ ] **Step 5: Run the production build**

Run from `BloomFLow-frontend`:

```bash
npm run build
```

Expected: Vite completes successfully without JSX, import, or lint-style compiler errors.

- [ ] **Step 6: Commit the state and markup change**

```bash
git add -- src/layouts/AppLayout.jsx
git commit -m "feat: add persisted sidebar collapse state"
```

### Task 2: Implement Sidebar Layout, Tooltip, Scroll, and Responsive Styling

**Files:**
- Modify: `src/nav.css:1-74,182-232`

**Interfaces:**
- Consumes: `.shell`, `.collapsed`, `.open`, `.sidebar-toggle`, `.sidebar-link`, existing theme variables, and existing Navbar/mobile classes from `AppLayout.jsx`.
- Produces: expanded/collapsed desktop and tablet layout, independent menu scrolling, sticky brand, tooltips, toggle animation, and mobile expanded drawer.

- [ ] **Step 1: Make the shell width track the Sidebar state**

Keep `.shell` as a two-column layout, but use a CSS variable and transition-capable Sidebar width. The main content must not be moved by a separate routing or layout mechanism:

```css
.shell {
  --sidebar-width: 260px;
  grid-template-columns: var(--sidebar-width) 1fr;
  transition: grid-template-columns 300ms ease-in-out;
}

.shell:has(aside.collapsed) {
  --sidebar-width: 76px;
}
```

Set `aside` width to `var(--sidebar-width)`, keep it fixed, and add `overflow: hidden` so hidden labels cannot extend into content.

- [ ] **Step 2: Split sticky brand from scrollable menu content**

Wrap the existing menu map in a `.sidebar-menu` element. Keep the brand outside that wrapper. Apply:

```css
.sidebar-menu {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 0 14px;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 999px;
}
```

Make `.brand` sticky within the Sidebar with `position: sticky; top: 0; z-index: 1;`, and give it the Sidebar background so content does not show through it. Remove the existing transparent spacer paragraph rather than relying on it for layout.

- [ ] **Step 3: Normalize icon and link alignment**

Use `.sidebar-link` as the link selector and give every icon a fixed alignment box:

```css
.sidebar-link {
  min-height: 42px;
  transition: background 180ms ease, color 180ms ease, transform 180ms ease;
}

.sidebar-link > svg {
  flex: 0 0 18px;
}

.sidebar-link:hover {
  transform: translateX(2px);
}
```

In `.collapsed`, center links, hide the text and group labels, and preserve a consistent 42px hit target:

```css
aside.collapsed .sidebar-link {
  justify-content: center;
  padding-inline: 0;
}

aside.collapsed .sidebar-link span,
aside.collapsed .nav-group > p {
  display: none;
}
```

- [ ] **Step 4: Add the floating toggle and collapsed tooltips**

Style `.sidebar-toggle` as a white circular button positioned just outside the Sidebar right edge near the top. Use `box-shadow`, a thin border, `z-index` above the Sidebar, and transitions for transform and scale. Rotate or swap the Lucide chevrons smoothly with a transform transition.

Use `title={name}` as the accessible/native fallback and create the visual tooltip from `data-tooltip` with `.sidebar-link::after { content: attr(data-tooltip); }`. The visual tooltip must be positioned to the right, use `var(--accent)`, white semibold text, `10px 14px` padding, `10px` radius, subtle shadow, and fade/slide animation. It must be disabled in expanded mode with `visibility: hidden` and `opacity: 0`.

- [ ] **Step 5: Preserve and refine mobile drawer behavior**

Keep the existing `@media (max-width: 760px)` drawer transform and scrim. Override the desktop collapsed presentation on mobile so an open drawer is always expanded:

```css
@media (max-width: 760px) {
  .shell {
    display: block;
  }

  .shell aside,
  .shell aside.collapsed {
    width: 260px;
    transform: translateX(-100%);
  }

  .shell aside.open {
    transform: translateX(0);
  }

  .shell aside.collapsed .sidebar-link {
    justify-content: flex-start;
    padding-inline: 13px;
  }

  .shell aside.collapsed .sidebar-link span,
  .shell aside.collapsed .nav-group > p {
    display: block;
  }
}
```

Ensure the floating collapse toggle does not compete with the mobile Navbar menu button; hide or reposition it on mobile while retaining the existing Navbar control for opening the drawer.

- [ ] **Step 6: Build and inspect all responsive behaviors**

Run:

```bash
npm run build
```

Expected: build succeeds. In a browser, verify at desktop width, tablet width, and mobile width that the Sidebar transition is smooth, menu scroll does not scroll the main page, brand stays visible, tooltip appears only collapsed, active links remain visible, and mobile drawer labels are always visible.

- [ ] **Step 7: Commit the styling change**

```bash
git add -- src/nav.css
git commit -m "feat: modernize responsive sidebar styling"
```

### Task 3: Verify Persistence and Regression Boundaries

**Files:**
- Test manually: `src/layouts/AppLayout.jsx`, `src/nav.css`
- Verify build artifact: `dist/`

**Interfaces:**
- Consumes: the completed Sidebar state and styling from Tasks 1-2.
- Produces: verified responsive UI with no route/menu regressions.

- [ ] **Step 1: Verify default and persisted states**

In browser DevTools, remove `bloomflow.sidebar.collapsed` and load at desktop width; confirm expanded. Remove it, load at tablet width; confirm collapsed. Toggle the Sidebar, refresh at the same width, and confirm the selected state remains.

- [ ] **Step 2: Verify mobile drawer semantics**

At mobile width, open the drawer from the existing Navbar menu button. Confirm it is expanded with icons and labels regardless of the stored desktop/tablet preference. Confirm toggle, scrim click, and selecting a `NavLink` each close it.

- [ ] **Step 3: Verify routing and menu invariants**

Click one item in each existing role menu group and confirm the URL and active state are unchanged. Confirm no menu label, ordering, or role-specific visibility changed.

- [ ] **Step 4: Verify final build and worktree scope**

Run:

```bash
npm run build
git status --short
```

Expected: build succeeds; only the intended Sidebar files and the already-existing unrelated worktree changes are present.
