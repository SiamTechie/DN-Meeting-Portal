---
name: DN Meeting Room Booking System
description: A centralized platform for managing and booking meeting rooms.
colors:
  primary: "#6310a3"
  primary-container: "#f3e8ff"
  on-primary-container: "#2c004d"
  secondary: "#a884c4"
  secondary-container: "#faf5ff"
  on-secondary-container: "#6310a3"
  surface: "#ffffff"
  background: "#F5F5F4"
  on-surface: "#1c1917"
  on-surface-variant: "#78716c"
  outline-variant: "#e7e5e4"
  error: "#ef4444"
typography:
  display:
    fontFamily: "\"Roboto\", \"Noto Sans Thai\", sans-serif"
    fontWeight: 700
  body:
    fontFamily: "\"Roboto\", \"Noto Sans Thai\", sans-serif"
    fontWeight: 400
rounded:
  md: "8px"
spacing:
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: DN Meeting Room Booking System

## 1. Overview

**Creative North Star: "The Premium Command Center"**

This system represents reliability, structure, and premium corporate identity. It prioritizes clarity over cleverness, ensuring users can navigate, view, and book meeting rooms efficiently. It explicitly rejects chaotic, playful, or cheap MVP aesthetics. 

**Key Characteristics:**
- Professional and Stable
- High Contrast and Clear Hierarchy
- Minimal Clicks to Value

## 2. Colors

The palette is anchored by a deep, authoritative purple, balanced with clean, high-contrast neutral surfaces.

### Primary
- **Corporate Purple** (#6310a3): The main brand anchor. Used for primary actions, active states, and key highlights.

### Secondary
- **Muted Lavender** (#a884c4): Used for secondary accents and subtle highlights.

### Neutral
- **Clean White** (#ffffff): Primary surface color for cards and panels.
- **Off-White Paper** (#F5F5F4): The application background, providing subtle contrast against content cards.
- **Deep Ink** (#1c1917): Primary text color for maximum readability.

**The Contrast Rule.** Text must always maintain accessible contrast ratios against its background. Never use light gray text on off-white backgrounds.

## 3. Typography

**Display Font:** "Roboto", "Noto Sans Thai", sans-serif
**Body Font:** "Roboto", "Noto Sans Thai", sans-serif

**Character:** Clean, highly legible, and optimized for both Thai and English UI.

### Hierarchy
- **Display** (700, 2rem): Page titles and key metrics.
- **Title** (600, 1.25rem): Section headers and card titles.
- **Body** (400, 1rem): Standard UI text and descriptions.
- **Label** (500, 0.875rem): Form labels, metadata, and buttons.

## 4. Elevation

The system relies on crisp, subtle shadows (e.g., `0 1px 3px 0 rgba(0, 0, 0, 0.04)`) to separate content cards from the background. 

**The Crisp Card Rule.** Surfaces are generally flat. Shadows are tight and subtle to create a clean, organized hierarchy without feeling overly layered or detached.

## 5. Components

### Buttons
- **Shape:** Rounded (8px)
- **Primary:** Solid corporate purple background with white text.
- **Hover / Focus:** Deepens in color or shows a subtle focus ring.

### Cards / Containers
- **Corner Style:** Rounded (12px)
- **Background:** Clean White (#ffffff)
- **Shadow Strategy:** Subtle tight shadow.
- **Border:** Light outline variant (#e7e5e4).

### Inputs / Fields
- **Style:** Clean white background with a subtle border (#d6d3d1).
- **Focus:** Border shifts to primary corporate purple (#6310a3) with a subtle ring.

## 6. Do's and Don'ts

### Do:
- **Do** use high contrast text for readability in various lighting conditions.
- **Do** ensure error states are clearly visible (using #ef4444).
- **Do** prioritize clarity and efficiency in user flows.

### Don't:
- **Don't** use playful, overly colorful, or chaotic layouts.
- **Don't** use cheap or basic "MVP" aesthetics.
- **Don't** use consumer-oriented casual app vibes.
