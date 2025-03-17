
# Application Architecture

This document outlines the architecture of our application, focusing on folder structure, component organization, and best practices.

## Directory Structure

Our application follows a structured approach to organizing code:

```
src/
├── features/           # Feature modules organized by domain
│   ├── chakras/        # Chakra system feature
│   ├── meditation/     # Meditation practices feature
│   ├── journal/        # Dream journal feature
│   ├── astral/         # Astral projections feature
│   ├── profile/        # User profile feature
│   └── dashboard/      # Dashboard feature
│
├── shared/             # Shared code used across features
│   ├── components/     # Reusable UI components
│   ├── hooks/          # General-purpose React hooks
│   ├── utils/          # Utility functions
│   ├── constants/      # Application-wide constants
│   └── contexts/       # React context providers
│
├── services/           # Service modules for business logic
│   ├── api/            # API clients and services
│   ├── auth/           # Authentication services
│   ├── ai/             # AI-related services
│   └── storage/        # Data storage services
│
├── layouts/            # Page layouts and structure
│   ├── MainLayout.tsx  # Main authenticated layout 
│   ├── AuthLayout.tsx  # Layout for auth pages
│   └── EntryLayout.tsx # Layout for onboarding/entry
│
├── routes/             # Routing configuration
│   ├── index.tsx       # Main routing setup
│   ├── protected.tsx   # Protected routes
│   └── dev.tsx         # Development-only routes
│
├── pages/              # Page components for routes
│   ├── DashboardPage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── ...
│
└── dev/                # Development tools and demos
    ├── components/     # Dev-only components
    └── pages/          # Dev-only pages
```

## Feature Module Structure

Each feature follows a consistent internal structure:

```
features/chakras/
├── components/         # UI components for this feature
├── hooks/              # Feature-specific hooks
├── services/           # Feature-specific services
├── types/              # TypeScript types for this feature
└── utils/              # Feature-specific utilities
```

## Best Practices

### Component Organization

1. **Small, Focused Components**: Keep components small (under 200 lines) and focused on a single responsibility.
2. **Container/Presentation Pattern**: Separate data handling (containers) from UI rendering (presentation).
3. **Component Naming**: Use PascalCase for component names and match the filename.

### Hooks

1. **Custom Hooks**: Extract complex logic into custom hooks.
2. **Hook Naming**: Prefix custom hooks with `use` (e.g., `useAuth`).
3. **Hook Responsibilities**: Hooks should handle one primary concern.

### TypeScript

1. **Type vs Value Pattern**: Use separate entities for types and runtime values.
2. **Interface Consistency**: Create a single source of truth for interfaces.
3. **Proper Error Handling**: Use Result pattern for error handling.

### State Management

1. **Local State**: Use React's useState for component-specific state.
2. **Context**: Use React Context for shared state across components.
3. **React Query**: Use for data fetching, caching, and server state management.

### Error Handling

1. **Error Boundaries**: Use ErrorBoundary components to catch and handle errors.
2. **Result Pattern**: Return structured results with success/error information.
3. **Consistent Error Formats**: Standardize error objects across the application.

### Performance

1. **Code Splitting**: Use dynamic imports for code splitting.
2. **Memoization**: Use React.memo, useMemo, and useCallback appropriately.
3. **Performance Monitoring**: Use PerformanceContext to track and optimize performance.

### Testing

1. **Unit Tests**: Test individual components and functions.
2. **Integration Tests**: Test interactions between components.
3. **Test Coverage**: Aim for high test coverage of critical paths.

## Development Process

1. **Feature Development**: Develop new features in isolated feature modules.
2. **UI Component Development**: Create UI components with demo pages in `/dev`.
3. **Testing**: Write tests alongside code, not after.
4. **Documentation**: Document components, hooks, and complex logic.

## Environmental Separation

1. **Development Mode**: Extra tools and routes available in development.
2. **Production Mode**: Optimized build with no development tools.
3. **Configuration**: Environment-specific configuration via environment variables.

## Guidelines for Adding New Features

1. Create a new feature directory in `src/features/` if it's a major feature
2. Follow the established pattern for components, hooks, and services
3. Use shared components from `src/shared/` whenever possible
4. Create proper types for all new interfaces and data structures
5. Add routing in the appropriate routes file
6. Document key decisions and architecture in code comments

By following these guidelines, we maintain a consistent, maintainable, and scalable codebase.
