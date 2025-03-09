
# Seed of Life Portal

This folder contains the components for the Seed of Life Portal experience, which serves as the gateway to the user's consciousness journey.

## Components:

- **SeedOfLifePortal**: The main portal component that manages the state and transitions
- **SeedOfLifeGeometry**: Renders the sacred geometry pattern with energy visualization
- **PortalTransition**: Handles the transition animation when entering the portal
- **ConsciousnessView**: The view shown after entering the portal

## Usage

```jsx
import SeedOfLifePortal from '@/components/seed-of-life/SeedOfLifePortal';

function HomePage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SeedOfLifePortal />
    </div>
  );
}
```

## Features

1. Interactive portal with energy accumulation
2. Resonance levels that enhance visual effects
3. Smooth transition animation when entering
4. Tabbed view of consciousness data
5. Backend persistence of portal state

## Backend Integration

The portal state is persisted using the `update-portal-interaction` edge function, which stores:

- Portal energy level
- Interaction count
- Resonance level
- Last interaction time

Additionally, achievements are automatically awarded based on interaction milestones.
