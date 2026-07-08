---
name: Daten Dashboards
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8dae2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fb'
  surface-container: '#ecedf6'
  surface-container-high: '#e7e8f0'
  surface-container-highest: '#e1e2ea'
  on-surface: '#191c21'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3037'
  inverse-on-surface: '#eff0f8'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#005db6'
  primary: '#00478d'
  on-primary: '#ffffff'
  primary-container: '#005eb8'
  on-primary-container: '#c8daff'
  inverse-primary: '#a9c7ff'
  secondary: '#575f67'
  on-secondary: '#ffffff'
  secondary-container: '#d8e1ea'
  on-secondary-container: '#5b646b'
  tertiary: '#793100'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f4300'
  on-tertiary-container: '#ffcfb9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468c'
  secondary-fixed: '#dbe4ed'
  secondary-fixed-dim: '#bfc8d0'
  on-secondary-fixed: '#141d23'
  on-secondary-fixed-variant: '#3f484f'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#f9f9ff'
  on-background: '#191c21'
  surface-variant: '#e1e2ea'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
  data-mono:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for high-stakes medical laboratory environments where data precision meets tactile comfort. The brand personality is **clinical, dependable, and futuristic**, balancing the cold efficiency of data with a soft, human-centric interface.

The design style is **Neomorphism (Soft UI)**. It leverages monochromatic depth through the interplay of light and shadow, making digital interfaces feel like physical control panels. This approach reduces cognitive load by mimicking real-world objects, providing a sense of stability and trust for laboratory technicians and clinicians. The aesthetic is "extruded" rather than "stacked," where components appear to be molded from the same material as the background.

## Colors
The palette is rooted in a neutral **off-white (#F0F2F5)** base, which serves as the "material" for the Neomorphic effects. This specific grey is essential for allowing white highlights and soft blue-grey shadows to remain visible.

- **Primary Blue:** A deep, authoritative medical blue used sparingly for primary actions, focus states, and key data points.
- **Status Colors:** These follow a strict traffic-light protocol for lab values. They should be used as accents (LED-like indicators or text colors) rather than large fill areas to maintain the soft aesthetic.
- **Surface Neutrals:** Depth is created not through color shifts, but through two specific shadow tokens: a light highlight (#FFFFFF) and a soft ambient shadow (#D1D9E6).

## Typography
The design system utilizes **Inter** for its exceptional legibility in data-dense environments. High contrast between text and the soft background is non-negotiable for medical safety.

- **Headlines:** Use Semi-Bold weights to establish clear hierarchy against the soft UI elements.
- **Data Display:** For lab results and numeric values, use the `data-mono` style. While Inter is not a true monospace, its tabular numbers feature should be enabled to ensure alignment in data columns.
- **Labels:** Small labels use slightly increased letter spacing and medium weights to remain legible at small sizes on medical monitors.

## Layout & Spacing
The layout follows a **fluid grid system** that prioritizes data density without feeling cluttered. 

- **Grid:** A 12-column grid is used for desktop dashboards, with content typically grouped into Neomorphic "panels."
- **Rhythm:** An 8px base unit governs all spacing. Because Neomorphic elements require larger margins to prevent shadow overlapping, the `md` (24px) spacing is the default for gutter and internal card padding.
- **Adaptivity:** On mobile, margins reduce to 16px, and 12-column layouts reflow into a single-column stack. Neomorphic depth should be slightly reduced on mobile screens to maintain clarity.

## Elevation & Depth
Depth is the core of this design system. Unlike traditional elevation, which uses "layers," this system uses **convex and concave surfaces**.

- **Raised Surfaces (Outer Shadows):** Used for buttons and cards. Created using two box-shadows: 
  - Top-Left: -8px -8px 16px #FFFFFF (Light)
  - Bottom-Right: 8px 8px 16px #D1D9E6 (Shadow)
- **Sunken Surfaces (Inner Shadows):** Used for input fields, search bars, and active button states.
  - Top-Left: inset -4px -4px 8px #FFFFFF
  - Bottom-Right: inset 4px 4px 8px #D1D9E6
- **Flat Surface:** Used only for the primary background. No elements should have harsh borders; transitions are defined purely by these gradients of light.

## Shapes
Shapes in this design system are organic yet structured. To achieve the "soft" medical look, sharp corners are strictly avoided.

- **Standard Elements:** Cards, buttons, and panels use a `rounded-lg` (16px) or `rounded-xl` (24px) radius. This high radius is essential for the Neomorphic shadow blur to wrap naturally around the corners.
- **Interactive Elements:** Input fields and small buttons use 12px-16px. 
- **Consistency:** All elements within a single dashboard view should share the same corner radius logic to maintain the "molded" appearance.

## Components
Consistent component behavior ensures the tactile metaphor remains convincing.

- **Buttons:** 
  - *Default:* Raised Neomorphic surface with primary blue text. 
  - *Primary:* Raised surface with primary blue fill and white text (use subtle shadows).
  - *Pressed:* Transition from an outer shadow to an inner (sunken) shadow.
- **Cards:** Large surfaces with 24px corner radius. Used to group related lab metrics. 
- **Input Fields:** Sunken/concave surfaces with 12px radius. The background of the input matches the page background, creating a "hollow" effect for text entry.
- **Status Chips:** Small pills that don't use Neomorphism for the fill. Instead, use a flat, high-contrast color (Green, Orange, Red) with white text, sitting *on top* of a raised Neomorphic card.
- **Data Tables:** Instead of row lines, use subtle horizontal "ridges" or place each row on its own subtly raised Neomorphic strip for maximum separation of sensitive patient data.