# Development Guide for Dev Toolbox

## Project Architecture

This is a **Tauri desktop application** with a React frontend that provides developer utility tools. The app uses a sidebar navigation with categorized tools, each implementing common developer workflows (encoding, hashing, crypto, etc.).

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite
- Desktop: Tauri v2 (Rust backend)
- UI: shadcn/ui + Radix UI + Tailwind CSS v4
- Routing: React Router v7
- Theming: next-themes (dark/light/system)

## Key Architectural Patterns

### Route-Based Tool Organization
All tools are defined in `src/lib/routes.ts` as a centralized route configuration:
```typescript
export const routes: RouteConfig[] = [
  { path: '/encoders/json', title: 'JSON 格式化', category: '编码工具' },
  // ...
]
```

The sidebar (`src/components/app-sidebar.tsx`) dynamically generates navigation from these routes using `getRoutesByCategory()`.

### Tool Page Structure
Each tool follows this pattern:
1. **Page Component**: `src/pages/{category}/{ToolName}Page.tsx` - implements the tool logic
2. **Route Registration**: Add to `src/components/AppRoutes.tsx` and `src/lib/routes.ts`
3. **Wrapper**: Use `<ToolPage>` component for consistent layout and page structure

Example implementation in `src/pages/encoders/JsonFormatterPage.tsx`:
```tsx
export function JsonFormatterPage() {
  return (
    <ToolPage title="JSON 格式化" description="格式化、压缩和验证 JSON 数据">
      <Tabs defaultValue="format">
        {/* Tool implementation */}
      </Tabs>
    </ToolPage>
  );
}
```

### Theme System
- Uses `next-themes` with React Context pattern in `src/components/theme-provider.tsx`
- Theme toggle in `src/components/mode-toggle.tsx` with smooth transitions
- Default theme is "dark", stored in localStorage as "vite-ui-theme"

### Component Organization
- **UI Components**: `src/components/ui/` - shadcn/ui components
- **Layout Components**: `src/components/` - app-specific components (sidebar, header)
- **Navigation**: Dynamic sidebar with collapsible categories based on route configuration

## Development Workflows

### Adding a New Tool
1. Add route config to `src/lib/routes.ts`
2. Create page component in `src/pages/{category}/{ToolName}Page.tsx`
3. Register route in `src/components/AppRoutes.tsx`
4. The sidebar will automatically include it in the appropriate category

### Running the Application
```bash
pnpm dev        # Start Vite dev server (frontend only)
pnpm tauri dev  # Start Tauri app with hot reload
pnpm build      # Build for production
```

### Tauri Integration
- **Commands**: Define Rust functions in `src-tauri/src/lib.rs` with `#[tauri::command]`
- **Frontend API**: Import from `@tauri-apps/api` to call Rust commands
- **Window Config**: Modify `src-tauri/tauri.conf.json` for app settings

## Project Conventions

### Code Standards
- **All comments must be written in English** - this includes code comments, JSDoc, TODO comments, and any inline documentation
- Use clear, descriptive English for variable names, function names, and class names
- Keep Chinese text only for user-facing content (UI labels, error messages, etc.)

### File Naming
- React components: PascalCase (e.g., `JsonFormatterPage.tsx`)
- Utility files: kebab-case (e.g., `routes.ts`)
- Folders: kebab-case (e.g., `src/pages/encoders/`)

### Import Aliases
Uses `@/` prefix for src imports (configured in `vite.config.ts`):
```typescript
import { ToolPage } from '@/components/tool-page'
import { routes } from '@/lib/routes'
```

### UI Patterns
- **Cards**: Use `Card` components for tool sections
- **Tabs**: Multi-function tools use `Tabs` for feature separation
- **Icons**: Prefer `@tabler/icons-react` for consistent iconography
- **Spacing**: Use Tailwind's space-y-* classes for vertical spacing

### Placeholder Implementation
Tools not yet implemented use `ComingSoonPage` component in `AppRoutes.tsx` for consistent user experience.

## Critical Integration Points

### Sidebar-Route Coupling
The sidebar navigation is tightly coupled to the route configuration. When adding tools:
- Route changes automatically update sidebar
- Categories are dynamically generated from route data
- Icons are mapped in `app-sidebar.tsx` data structure

### Theme Integration
All components should respect the theme system:
- Use semantic color tokens (e.g., `text-foreground`, `bg-background`)
- Theme toggle is globally available via `useTheme()` hook
- Transitions are handled automatically by the CSS classes
