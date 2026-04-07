# Design System Document

## 1. Overview & Creative North Star: "The Digital Larder"

This design system is built to transform the digital grocery experience from a utilitarian task into a curated, editorial journey. We move away from the "grid-of-boxes" commodity feel and toward a high-end, boutique aesthetic that reflects the quality of gourmet produce.

**Creative North Star: The Digital Larder**
The system is inspired by high-end culinary magazines and modern architectural pantries. It relies on **Organic Editorial** layouts—characterized by generous whitespace, intentional asymmetry, and a "layered" depth that mimics fine paper and glass. We do not use lines to define space; we use light, tone, and proximity. Every element must feel intentional, as if placed by a curator rather than a developer.

---

## 2. Colors: Harvest & Atmosphere

Our palette bridges the gap between the earthiness of fresh produce and the cleanliness of a modern kitchen.

### Palette Strategy
- **Primary (`#9a4600`) & Primary Container (`#e8792b`):** Represents sun-ripened citrus and warmth. Use these for high-energy CTAs and brand moments.
- **Secondary (`#226d00`):** Inspired by leafy greens and herbs. Used for "Freshness" indicators, success states, and healthy categories.
- **Surface & Background (`#f8f9ff`):** A crisp, cool white that provides a premium "gallery" backdrop for high-quality food photography.

### Signature Rules
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. To separate the "Produce" section from the "Bakery" section, use a shift from `surface` to `surface-container-low`.
- **The "Glass & Gradient" Rule:** To elevate floating navigation or hero overlays, use Glassmorphism. Apply `surface` at 70% opacity with a `24px` backdrop-blur. 
- **Signature Textures:** For Hero sections, use a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle to add "soul" and depth to the brand's warmth.

---

## 3. Typography: Authoritative & Approachable

We utilize a dual-typeface system to balance the "Gourmet Authority" with "Modern Accessibility."

- **Display & Headlines (Be Vietnam Pro):** This is our "Editorial Voice." It is sophisticated and carries a slight geometric weight that feels premium. Use `display-lg` for hero statements with tight letter-spacing (-0.02em) to create a high-fashion look.
- **Body & Labels (Inter):** Our "Functional Voice." Inter provides unparalleled readability for product descriptions, weights, and prices.

**Hierarchy as Identity:**
Large, bold headlines in `headline-lg` should often overlap slightly with image containers or sit asymmetrically to break the "template" feel. Use `label-md` in all-caps with increased letter-spacing for category tags to mimic luxury packaging labels.

---

## 4. Elevation & Depth: Tonal Layering

We reject the traditional drop-shadow. Instead, we define hierarchy through the physical stacking of tones.

- **The Layering Principle:** 
    - Base Level: `surface`
    - Section Level: `surface-container-low`
    - Card/Interaction Level: `surface-container-lowest` (pure white)
    - Placing a white card (`lowest`) on a slightly blue-grey background (`low`) creates a "Soft Lift" that feels natural and premium.
- **Ambient Shadows:** Only use shadows for "Actionable Overlays" (e.g., Modals). Shadows must be `on-surface` color at 6% opacity, with a `blur: 40px` and `y: 12px`. It should feel like a soft glow, not a dark edge.
- **The "Ghost Border" Fallback:** For input fields or cards on identical backgrounds, use a "Ghost Border": `outline-variant` at 15% opacity. It should be felt, not seen.
- **Glassmorphism:** Use for persistent headers. It allows the vibrant colors of food photography to bleed through as users scroll, keeping the UI integrated with the content.

---

## 5. Components

### Buttons
- **Primary:** High-gloss gradients from `primary` to `primary_container`. Border-radius set to `full` for an approachable, organic feel.
- **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
- **Tertiary:** Text-only with a `primary` color weight. Use for low-priority actions like "View All."

### Cards & Product Tiles
- **The Card Rule:** Forbid divider lines. Use `xl` (1.5rem) roundedness.
- **Layout:** High-quality photography takes up the top 70% of the card. Text is nested in the bottom 30% using `surface-container-lowest`. 
- **Interaction:** On hover, the card should scale slightly (1.02x) and the "Add to Cart" button (a simple `primary` circle with a `+` icon) should fade in.

### Input Fields
- **Styling:** Use `surface-container-low` with a `Ghost Border`. When focused, the border transitions to `primary` with a 2px thickness, and the background shifts to `surface-container-lowest`.
- **Labels:** Use `label-md` sitting just above the field, never placeholder text alone.

### Chips
- **Filter Chips:** Use `surface-container-high` for inactive and `secondary_container` for active states. This reinforces the "Fresh/Green" grocery theme.

---

## 6. Do's and Don'ts

### Do
- **Do** use intentional asymmetry. A product image might bleed off the right edge of the screen to suggest a "limitless" selection.
- **Do** use high-contrast typography scales. A `display-lg` headline next to a `body-sm` caption creates an editorial, high-end feel.
- **Do** prioritize "white space" as a functional element. It represents the cleanliness of a gourmet kitchen.

### Don't
- **Don't** use 1px black or grey dividers. Separate content using the Spacing Scale (minimum 32px between sections) or background tone shifts.
- **Don't** use "default" system shadows. They look muddy and cheap.
- **Don't** clutter the screen with icons. Use icons sparingly (only for utility like "Cart" or "Account") and ensure they use a consistent stroke weight matching the `Inter` body text.
- **Don't** use harsh square corners. Our brand is organic; always use a minimum of `md` (0.75rem) roundedness.

---
*Note to Junior Designers: This system is about restraint. Let the photography of the produce be the hero, and let the UI be the elegant, invisible shelf that holds it.*