# BloomFlow Sidebar Modernization Design

## Scope

Modernize the existing Sidebar presentation and interaction without changing routes, role-based menu data, authentication, permissions, API usage, or application state management. Styling remains in the existing `src/nav.css` file, including the existing Navbar styles.

## Behavior

- Desktop defaults to expanded when no preference is stored.
- Tablet defaults to collapsed when no preference is stored.
- Desktop and tablet collapse state is persisted in `localStorage` under a dedicated BloomFlow Sidebar key.
- Mobile uses the existing drawer model and always renders the drawer expanded when opened.
- Mobile drawer closes from the toggle button, overlay click, or selecting a menu item.
- Existing `NavLink` routing and role-specific menu groups remain unchanged.

## Component Design

`AppLayout` keeps the existing menu definitions and role resolution. It adds a UI-only `isCollapsed` state for desktop/tablet and keeps mobile drawer visibility separate. The initial collapse value reads the stored boolean when available; otherwise it derives the default from the viewport breakpoint. Updates write the value to `localStorage`.

The Sidebar receives state through its existing layout component rather than introducing a new state-management layer. The floating toggle sits adjacent to the Sidebar's right edge near the top. Its icon and accessible label reflect the current state.

## Styling

The existing fixed Sidebar transitions between approximately `260px` expanded and `76px` collapsed. Its brand header is sticky, while the menu region owns vertical scrolling with hidden horizontal overflow and a thin custom scrollbar. Menu icons use a fixed-size alignment area so they do not shift between states.

Collapsed mode hides group labels and menu text, centers icons, and exposes each menu item's existing name through an animated tooltip. Tooltips use the existing `--accent` color, white semibold text, rounded corners, padding, and a subtle shadow. Active and hover states remain compatible with the existing theme variables.

Transitions use CSS with approximately 300ms `ease-in-out`. The mobile breakpoint keeps the drawer and scrim behavior, but the drawer width remains expanded and its labels remain visible.

## Accessibility and Verification

- The toggle uses a button with an accessible label and `aria-expanded` state.
- Tooltips are supplemental to the visible menu names and are not rendered in expanded mode.
- The overlay remains clickable and does not alter route behavior.
- Verify desktop, tablet, and mobile layouts; refresh persistence; independent Sidebar scrolling; tooltip visibility; active links; and existing production build output.
