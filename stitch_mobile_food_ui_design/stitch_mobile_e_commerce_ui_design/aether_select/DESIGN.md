# Design System Document

## 1. Overview & Creative North Star: "The Digital Atelier"
This design system is built upon the concept of **The Digital Atelier**. Unlike standard e-commerce templates that rely on rigid grids and heavy containment, this system treats the mobile viewport as a curated gallery space. It merges the high-conversion logic of SaaS platforms with the tactile elegance of a physical flagship store.

**The Creative North Star** is defined by "Breathable Precision." We achieve a premium feel through intentional asymmetry, overlapping elements that create a sense of movement, and a "No-Line" philosophy that uses tonal shifts rather than structural strokes to define space. The result is a native experience that feels fluid, expensive, and deeply intuitive.

---

## 2. Colors: Tonal Depth & The No-Line Rule
Our palette is rooted in a sophisticated deep blue, supported by a spectrum of "living whites" and functional neutrals.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or card definition. Boundaries must be defined solely through background color shifts.
*   *Example:* A product card (`surface_container_lowest`) sitting atop a category section (`surface_container_low`).

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
*   **Background (`#fbf9fb`):** The base canvas.
*   **Surface Container Low (`#f5f3f6`):** Used for large secondary sections or grouping related items.
*   **Surface Container Lowest (`#ffffff`):** The highest "lift." Used for primary interactive cards to make them pop against the background.

### Signature Textures & Glassmorphism
*   **The Glass Rule:** Floating elements (like Sticky Bottom Navs or Top Search Bars) must use `surface` or `surface_container` tokens at 85% opacity with a `24px` backdrop blur. This ensures the content "bleeds" through, creating an integrated, high-end feel.
*   **The Soulful Gradient:** For primary CTAs, use a subtle linear gradient from `primary` (#031632) to `primary_container` (#1a2b48) at a 135-degree angle. This adds a "weighted" feel that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
The pairing of **Manrope** and **Inter** creates a dialogue between brand authority and functional clarity.

*   **Manrope (Display & Headlines):** Used for "Editorial Moments"—product names, category headers, and hero banners. The wider stance of Manrope suggests confidence.
    *   *Headline-LG:* 2rem (Manrope) – For high-impact brand statements.
*   **Inter (Title & Body):** Used for all functional data. It is the "workhorse" that ensures high conversion and readability.
    *   *Title-MD:* 1.125rem (Inter) – For product names in cards.
    *   *Body-MD:* 0.875rem (Inter) – For descriptions and secondary metadata.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a sign of "lazy" depth. In this design system, we prioritize **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface_container_highest` element placed on a `surface` background provides all the "lift" necessary for a premium experience.
*   **Ambient Shadows:** If a floating effect is required (e.g., a "Buy Now" bottom sheet), use an extra-diffused shadow:
    *   *X: 0, Y: 12, Blur: 32, Opacity: 4%* using the `on_surface` color as the tint.
*   **The Ghost Border:** If a boundary is strictly required for accessibility, use the `outline_variant` token at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Primary Buttons (The "Conversion Engine")
*   **Style:** `primary` background with the "Soulful Gradient."
*   **Radius:** `full` (pill-shaped) for high-action items like "Add to Cart."
*   **Typography:** `label-md` (Inter), Semi-bold, All-caps for a SaaS-hybrid feel.

### Product Cards
*   **Container:** `surface_container_lowest` (White) with a `DEFAULT` (16px) or `md` (24px) radius.
*   **Spacing:** Minimum `1.5rem` internal padding to create "luxury whitespace."
*   **Constraint:** No dividers. Use `surface_container_low` as a background for the image area to separate it from the product title.

### Sticky Bottom Navigation
*   **Visual:** Glassmorphic (`surface` at 85% opacity + Blur).
*   **Indicators:** Use a subtle `primary_container` dot or a small tonal shift in the icon color. Avoid heavy "active state" boxes.

### Input Fields & Search Bars
*   **Visual:** `surface_container_high` background.
*   **Radius:** `md` (24px).
*   **State:** On focus, transition the background to `surface_container_lowest` and add a `Ghost Border` using the `primary` token at 20% opacity.

---

## 6. Do's and Don'ts

### Do:
*   **Use Intentional Asymmetry:** Align text to the left but allow product images to bleed off the right edge of the screen to create a sense of "infinite" catalog.
*   **Embrace Whitespace:** If you think there is enough space, add 8px more. Space is the ultimate luxury signifier.
*   **Layer Surfaces:** Place `surface_container_lowest` elements on `surface_container_low` backgrounds for a soft, premium "pop."

### Don't:
*   **Don't use Divider Lines:** Never use a 1px line to separate list items. Use vertical spacing (`1rem` to `1.5rem`) or alternating surface tones.
*   **Don't use Pure Black Shadows:** Always tint your shadows with the `on_surface` color to maintain a natural, ambient light feel.
*   **Don't Over-round Small Elements:** Use `sm` (8px) for small items like tags or chips; reserve `xl` (48px) for large containers to maintain a sophisticated balance.

---

## 7. Component Matrix Reference

| Component | Token | Value / Style |
| :--- | :--- | :--- |
| **Section Radius** | `lg` | 32px (2rem) |
| **Card Radius** | `DEFAULT` | 16px (1rem) |
| **Primary CTA** | `primary` | Gradient to `primary_container` |
| **Floating Nav** | `surface` | 85% Opacity + 24px Blur |
| **Ambient Shadow** | `on_surface` | 4-8% Opacity, 32px Blur |
| **Editorial Text** | `display-sm` | Manrope, 2.25rem |
| **Functional Text**| `body-md` | Inter, 0.875rem |