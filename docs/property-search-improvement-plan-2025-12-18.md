# Property Search & Detail UX/UI Improvement Plan
**Date:** 2025-12-18
**Author:** Gemini Agent (UX/UI Expert)

## 1. Executive Summary

Current analysis of the Property Search (`PropertyListView`) and Detail (`PropertyDetailMode`) modules reveals a functional but basic implementation. While the "Bento Grid" style for the list view is modern, the Detail view lacks the information density and visual hierarchy expected in high-quality real estate applications. Furthermore, the visual execution relies on generic styles and emojis, undermining the premium "architectural" feel defined in the design system. This plan outlines specific UX structural changes and a comprehensive **Visual Design Upgrade** to elevate the user experience.

## 2. Current State Analysis

### 2.1. Strengths
- **Architecture:** The split-pane layout (`PropertyExplorationLayout`) with a resizable divider is excellent for desktop users.
- **Card Design:** `PropertyCard.vue` effectively uses glassmorphism and provides clear affordability indicators.
- **Responsiveness:** The layout adapts well between desktop (split) and mobile (stacked).

### 2.2. Weaknesses
- **Detail View Layout:** `PropertyDetailMode.vue` is a simple vertical stack. It fails to utilize the available width effectively and forces excessive scrolling.
- **Visual Polish:** Usage of emojis (e.g., 🏠, 📍) instead of professional SVG icons looks amateurish.
- **Navigation:** The "Back" button in the detail view is intrusive and disconnects the user from the content.
- **Information Density:** Key data points (maintenance fees, move-in dates, detailed specs) are likely buried or missing visual emphasis.

## 3. Improvement Roadmap

### Phase 1: Immersive Detail View (Priority: High)
*Target File: `src/components/property/PropertyDetailMode.vue` & `src/components/property/detail/*`*

**Concept:** Transform the simple list into a structured "Dashboard" for the property.

1.  **Sticky Header & Navigation:**
    -   Replace the standalone "Back" button with a sticky header containing:
        -   Back Icon (Chevron Left)
        -   Property Title (fades in on scroll)
        -   Action Buttons (Share, Like)
    -   *Why:* Maximizes screen real estate and keeps key actions accessible.

2.  **Hero Gallery:**
    -   Implement a swipeable/carousel image gallery as the first element.
    -   Overlay "Virtual Tour" or "360" badges if applicable.

3.  **Structured Grid Layout (Desktop):**
    -   **Top Row:** Key Specs (Price, Area, Floor, Rooms) using icon-driven stats.
    -   **Middle Section:** Two-column layout.
        -   *Left (60%):* Description, Detailed Features, Facilities.
        -   *Right (40%):* Mini-Map (Static/Interactive), Agent Card, DSR/Loan Calculator summary.

4.  **Tabbed/Sectioned Content:**
    -   Instead of one long page, use anchor links or tabs for: `Overview`, `Location`, `Financials`, `Notes`.

### Phase 2: Enhanced List Experience (Priority: Medium)
*Target File: `src/components/property/PropertyListMode.vue`*

1.  **Quick Filter Chips:**
    -   Add a horizontal scroll area below the header for one-tap filters:
        -   "My Budget Fits" (Affordable)
        -   "Recently Viewed"
        -   "Top Rated"
    -   *Why:* Reduces friction for common tasks without opening the full filter modal.

2.  **Interactive States:**
    -   **Hover Sync:** Hovering a card should highlight the corresponding pin on the `PropertyMapPanel` (requires state sharing via Pinia).

3.  **Skeleton Loading:**
    -   Replace the spinner with a skeleton grid that matches the `PropertyCard` layout.
    -   *Why:* Reduces perceived latency.

### Phase 3: Visual Polish & Micro-interactions (Priority: Low)

1.  **Typography & Spacing:**
    -   Standardize margins using Tailwind-like utility classes (even if using custom CSS) to ensure rhythm.
    -   Increase contrast for "gray" text in Night Mode.

2.  **Animations:**
    -   Add `v-motion` or CSS transitions for the Detail View entering/leaving.
    -   "Like" button should have a particle burst effect.

## 4. Implementation Specifications

### 4.1. Refactored `PropertyDetailMode.vue` Structure

```html
<template>
  <div class="detail-container">
    <!-- Sticky Header -->
    <header class="detail-navbar" :class="{ scrolled: isScrolled }">
      <button class="icon-btn" @click="goBack">
        <!-- SVG Icon: Arrow Left -->
        <svg viewBox="0 0 24 24" class="w-6 h-6"><path d="..."/></svg>
      </button>
      <div class="nav-title" v-show="isScrolled">{{ property.title }}</div>
      <div class="nav-actions">
        <LikeButton :id="property.id" />
        <ShareButton />
      </div>
    </header>

    <!-- Content Scroll Area -->
    <main class="detail-body">
      <!-- Hero Image -->
      <section class="hero-section">
        <PropertyGallery :images="property.images" />
        <div class="hero-overlay-info">
          <span class="status-badge">{{ property.status }}</span>
        </div>
      </section>

      <!-- Main Info Card -->
      <section class="info-card">
        <div class="price-row">
          <span class="sale-price">{{ property.formattedPrice }}</span>
          <span class="price-trend" v-if="property.priceChange">
            {{ property.priceChange }}
          </span>
        </div>
        
        <div class="specs-grid">
            <SpecItem icon="ruler" label="Area" :value="property.area" />
            <SpecItem icon="bed" label="Rooms" :value="property.rooms" />
            <SpecItem icon="bath" label="Bath" :value="property.bath" />
            <SpecItem icon="building" label="Floor" :value="property.floor" />
        </div>
      </section>

      <!-- Modules -->
      <LocationPreview :coords="property.coords" />
      <FinancialSummary :price="property.price" />
    </main>
    
    <!-- Floating Action Button (Mobile) or Footer -->
    <footer class="detail-footer">
       <button class="btn-primary">Contact Agent</button>
    </footer>
  </div>
</template>
```

### 4.2. Action Items

1.  [ ] **Create `src/components/property/detail/DetailHeader.vue`**: Handle sticky navigation.
2.  [ ] **Create `src/components/property/detail/PropertySpecs.vue`**: Reusable grid for quick stats.
3.  [ ] **Update `PropertyDetailMode.vue`**: Apply the new structure.
4.  [ ] **Update `PropertyListMode.vue`**: Add Quick Filter Chips.

## 5. Visual Design Specifications

To achieve a "Premium Architectural" look consistent with `concept-2-showroom.css`:

### 5.1. Iconography
- **Rule:** **NO EMOJIS**. Replace all emojis (🏠, 📍, 🔍) with high-quality SVG icons.
- **Style:** Thin stroke (1.5px or 2px), rounded corners.
- **Source:** Use Heroicons (Outline) or Phosphor Icons.

### 5.2. Typography
- **Headings:** `Noto Sans KR` (Bold/700) for Korean, `Space Grotesk` (Medium/500) for numeric/English headers.
- **Numbers (Price, Area):** `Space Grotesk` allows for monospaced tabular figures, making data comparison easier.
- **Body:** `Noto Sans KR` (Regular/400) with `line-height: 1.6` for readability.

### 5.3. Color Palette & Gradients
- **Primary Background:** `var(--showroom-bg-day)` (#F9F8F6) - Warm Paper.
- **Accent:** `var(--brand-accent)` (#FF7F50) - Living Coral.
- **Glassmorphism:**
  - *Base:* `backdrop-filter: blur(12px) saturate(180%)`
  - *Border:* `1px solid rgba(255, 255, 255, 0.2)` (Day) / `rgba(255, 255, 255, 0.08)` (Night)
  - *Shadow:* `0 8px 32px rgba(0, 0, 0, 0.05)` (Soft, diffused)

### 5.4. Component Styling
- **Cards (`PropertyCard`):**
  - **Corner Radius:** `24px` (Super-ellipse feel).
  - **Hover:** Translate Y -4px, shadow intensity x1.5, subtle white glow.
  - **Image:** `aspect-ratio: 4/3` with a subtle inner shadow `inset 0 0 20px rgba(0,0,0,0.1)` to add depth.
- **Badges (Tags):**
  - **Style:** Soft Pill.
  - **Background:** `rgba(var(--brand-accent-rgb), 0.1)`.
  - **Text:** `var(--brand-accent)`.
  - **Border:** None.
- **Buttons:**
  - **Primary:** Gradient `linear-gradient(135deg, #FF7F50, #FF6B3D)`.
  - **Secondary:** Glass button with `border: 1px solid rgba(0,0,0,0.1)`.

## 6. Conclusion

By shifting from a linear list of data to a structured, hierarchical dashboard for each property, we can significantly increase user engagement and perceived value. The focus should be on "Visual Comfort" — letting the images breathe while keeping hard data (price, specs) instantly readable.