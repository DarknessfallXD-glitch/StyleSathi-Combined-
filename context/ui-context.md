# StyleSathi — UI Context

## Theme System

The app has light and dark themes delivered by `ThemeContext` (`src/Context/ThemeContext.tsx`). Access colors only through the `useTheme()` hook — never hardcode hex values in components. A single palette (`primary`) `#FF6B8A` is shared across both themes; the rest differ.

### Light Theme Tokens

| Token           | Hex        |
| --------------- | ---------- |
| background      | `#F4F4F4`  |
| surface         | `#FFFFFF`  |
| text            | `#2F343A`  |
| textSecondary   | `#888888`  |
| border          | `#E5E5E5`  |
| card            | `#FFFFFF`  |
| inputBackground | `#EDEDED`  |
| inputText       | `#333333`  |
| placeholder     | `#999999`  |
| primary         | `#FF6B8A`  |
| icon            | `#666666`  |
| tabBar          | `#FFFFFF`  |
| tabBarBorder    | `#EEEEEE`  |
| error           | `#FF4444`  |
| success         | `#4CAF50`  |

### Dark Theme Tokens

| Token           | Hex        |
| --------------- | ---------- |
| background      | `#121212`  |
| surface         | `#1E1E1E`  |
| text            | `#FFFFFF`  |
| textSecondary   | `#AAAAAA`  |
| border          | `#333333`  |
| card            | `#1E1E1E`  |
| inputBackground | `#2C2C2C`  |
| inputText       | `#FFFFFF`  |
| placeholder     | `#666666`  |
| primary         | `#FF6B8A`  |
| icon            | `#CCCCCC`  |
| tabBar          | `#1E1E1E`  |
| tabBarBorder    | `#333333`  |
| error           | `#FF6B6B`  |
| success         | `#4CAF50`  |

## Typography

- Headings: bold (600–700), e.g. section titles `fontSize: 18, fontWeight: "600"`, page/user names `fontSize: 24, fontWeight: "700"`.
- Body: 14px default for inputs/labels; product names 13px/500; prices 14px/700.
- Secondary/helper text uses `textSecondary` color.
- Use `ThemedText` (with `type="secondary"` support) for text that must respect the theme.

## Radius and Spacing Scale

- Chips / search pills: `borderRadius: 20–30` (fully rounded).
- Cards: `borderRadius: 16`.
- Buttons/primary CTAs: `borderRadius: 25`.
- Horizontal section spacing: `marginBottom: 24–28`.
- Scroll content padding: `horizontal 20, top 50, bottom 80` (bottom reserved for tab bar).

## Layout Patterns

- **Home**: scrollable `ScrollView` with header (welcome text + user name + theme toggle), a rounded search bar, a horizontal "Recent Searches" chip row, a "Featured Collections" row of colorful cards, and a horizontal "Just For You" product list.
- **Bottom navigation**: `BottomTab` component with `active="home|style|saved|profile"`; reserve bottom padding above it.
- **Product cards**: fixed-width (160) cards with rounded image, name, price, optional "AI" try-on tag, and wishlist toggle.
- **Loading**: skeleton components (`Skeleton`) while data loads; never flash raw empty content.
- **Empty states**: one empty-state component per section with an icon, title, and helper text.
- **Error states**: centered card with icon, title, message, and a `Retry` button that calls the loader.

## Icons

- Use `@expo/vector-icons` (FontAwesome, Octicons).
- Common: `search`, `arrow-right`, `calendar` (recent searches), `times` (delete chip), `shopping-bag` (empty), `star` (featured empty), `history` (recent empty), `sun`/`moon` (theme toggle), `exclamation-triangle` (error).
- Icon colors come from theme tokens (`primary`, `placeholder`, `textSecondary`, `icon`).

## Component Conventions

- Screens compose primitives from `src/comp/`; do not duplicate card/skeleton logic in each screen.
- Use `ProductCard` for product listings and `Skeleton` for load placeholders.
- Use `NetworkStatus` and `ErrorBoundary` already wired in `_layout.tsx`; don't add a second global error system.
- Honor light/dark via `useTheme()` colors everywhere.
