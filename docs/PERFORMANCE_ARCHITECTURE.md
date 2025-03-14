
# Performance Architecture

This document outlines the performance architecture of our application, providing a clear distinction between application performance and user performance metrics.

## Core Concepts

Our performance system is divided into two distinct areas:

1. **Application Performance**: Metrics and optimizations related to the technical performance of the app itself (render times, load times, network requests, etc.).
2. **User Performance**: Metrics and tracking related to how well users are performing tasks within the app (completion rates, proficiency levels, etc.).

## Application Performance Monitoring

The application performance system consists of:

### 1. PerformanceContext

Central provider for app-wide performance monitoring. Features include:
- Device capability detection
- Feature toggling based on device capability
- Performance metric tracking
- Core Web Vitals monitoring
- Adaptive rendering support

### 2. MetricsCollector

Service for collecting, buffering, and processing performance metrics:
- Collection of component render times
- Web Vitals tracking
- Network request monitoring
- Automatic batching and flushing of metrics

### 3. PerformanceMonitor Component

Component wrapper that measures render and interaction performance:
- Measures component render times
- Tracks user interactions
- Applies performance-based styling

### 4. Performance Utilities

Helper functions for performance optimization:
- Throttling and debouncing
- Device capability detection
- Conditional feature enabling

## User Performance Tracking

The user performance system consists of:

### 1. UserPerformanceTracker

Service for tracking user progress and performance:
- Activity completion tracking
- Progress monitoring
- Engagement metrics
- Chakra activation tracking
- Energy points management

### 2. UserProgressMetrics

Data structures for representing user performance:
- Activity metrics
- Progress metrics
- Engagement metrics

### 3. User Performance Database Tables

Tables for storing user performance data:
- user_activities
- user_progress
- chakra_systems
- user_energy_interactions
- energy_points_history

## Key Distinctions

| Application Performance | User Performance |
|------------------------|------------------|
| Technical metrics | User achievement metrics |
| Render times | Activity completion rates |
| Memory usage | Energy points earned |
| Network requests | Chakra activations |
| Frame rates | Progress milestones |
| Bundle sizes | Session engagement |

## Best Practices

1. **Clear Naming**: Always use descriptive names that differentiate between app performance and user performance:
   - `trackMetric` for app performance
   - `trackUserProgress` for user performance

2. **Separate Services**: Keep application performance and user performance services separate.

3. **Component Optimization**:
   - Use memoization for expensive components
   - Implement virtualization for long lists
   - Apply code-splitting for large feature sets

4. **Adaptive Rendering**:
   - Scale down visual effects on low-end devices
   - Reduce animation complexity when needed
   - Defer non-critical content loading

5. **Performance Budgets**:
   - Main bundle size: < 200KB
   - First Contentful Paint: < 2s
   - Time to Interactive: < 3.5s

## Integration with OpenAI API

The architecture supports delegating computational tasks to backend services, particularly through OpenAI API:

1. **Emotional Analysis**: Using GPT-4o for processing reflection entries rather than client-side analysis.

2. **Chakra Predictions**: Leveraging the AI to predict optimal chakra activations based on user history.

3. **Achievement Recommendations**: Using AI to suggest appropriate achievements and challenges.

4. **Content Personalization**: Processing user metrics to deliver personalized content experiences.

## Issue Resolution Strategy

When facing implementation issues:

1. **Root Cause Analysis**: Always apply a 5 Whys analysis to uncover and address the root cause of the issue instead of treating symptoms.

2. **Proactive Problem-Solving**: When facing an issue during implementation, step back and analyze the full context before proceeding with changes.

3. **Working with Protected Files**: When changes require modifying fundamental files that are protected:
   - Create alternative implementation paths that achieve the same functionality
   - Use composition and dependency injection instead of direct modification
   - Implement adapter patterns to interface with protected systems
   - Create wrapper services that provide the needed functionality

4. **Preserving Architecture Integrity**: Always ensure workarounds maintain:
   - Type safety
   - Consistent error handling
   - Performance characteristics
   - Architectural patterns of the original system

This architecture ensures clear separation between tracking technical app performance and measuring user progression, preventing confusion and enabling targeted optimizations.
