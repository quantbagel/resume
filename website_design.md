
<high_level_design>
# Brand & Art Direction Overview

This is a minimalist personal portfolio website with a brutalist-inspired, text-centric design aesthetic. The visual style is extremely clean and typography-focused, with almost no decorative elements. The design emphasizes readability and content hierarchy through careful use of spacing, line breaks, and subtle typographic treatments. A unique feature is a subtle fluid/liquid animation effect in the background, adding a touch of interactivity without overwhelming the content.

The overall aesthetic is modern, understated, and professional—designed to let the content speak for itself. The design uses a monochromatic color scheme with excellent text contrast, inline logos/icons integrated seamlessly into text lines, and a hierarchical information architecture using bullet points (↳ and ◆ symbols) to organize content in a scannable format.

# Color Palette

| Token | HEX / RGB | Usage | Notes |
|-------|-----------|-------|-------|
| Background | #FFFFFF | Page background | Pure white for maximum brightness |
| Text Primary | #171717 / rgb(23, 23, 23) | Body text, headings | Near-black for optimal readability |
| Text Secondary | #404040 / rgb(64, 64, 64) | Secondary text, muted content | Medium gray |
| Text Tertiary | #737373 / rgb(115, 115, 115) | Tertiary information | Light gray |
| Border | #E5E5E5 / rgb(229, 229, 229) | Horizontal dividers | Very light gray |
| Link Hover | Inherits text color | Link states | No color change, uses underline |
| Accent (Inline) | Inherits context | Icons, logos inline | No specific accent color |

# Typography Scale

**Font Family:**
- Primary: System font stack (likely -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
- Monospace: Not used
- Display: Same as primary

**Font Sizes:**
- Small/Mobile: 14px (0.875rem)
- Base/Desktop: 15.2px (0.95rem)
- Line Height: tight (1.25 / leading-tight in Tailwind)

**Font Weights:**
- Extra Light: font-weight 200 (used for headings/names)
- Normal: font-weight 400 (body text)
- Bold: font-weight 700 (for emphasized numbers/text marked with "font-bold")

**Text Treatments:**
- Underline: 1px solid with 3px offset (underline-offset-[3px])
- Italic: Custom "slight-italic" class for subtle emphasis
- Letter Spacing: Default (no custom tracking)
- Text Transform: None

# Spacing & Layout Grid

**Container:**
- Max Width: 640px (max-w-screen-sm)
- Horizontal Padding: 16px on mobile (px-4), 0px on desktop (sm:px-0)
- Centered: mx-auto

**Vertical Spacing:**
- Top Padding: 64px mobile (pt-16), 96px desktop (sm:pt-24)
- Bottom Padding: 64px mobile (pb-16), 96px desktop (sm:pb-24)
- Section Spacing: 12px (my-3, space-y-2)
- Line Spacing: 8px between lines (space-y-2)

**Content Indentation:**
- First Level: 16px (ml-4)
- Second Level: 32px (ml-8)

**Element Spacing:**
- Gap between inline elements: 4px (gap-1), 8px (gap-2), 12px (gap-3)
- Icon-to-text spacing: 4px (gap-1)

# Visual Effects & Treatments

**Background Animation:**
- Fluid canvas animation effect (subtle, non-intrusive)
- Fixed position overlay with pointer-events-none
- Full viewport coverage

**Borders:**
- Horizontal Dividers: 1px solid, color #E5E5E5 (dark mode: #404040)
- Border Radius: None (sharp corners throughout)

**Shadows:**
- No box shadows used
- Design relies on flat, brutalist aesthetic

**Hover Effects:**
- Custom "hover-underline-nudge" class creates subtle underline animation
- Navigation items have staggered animation delays (nav-bounce, nav-bounce-delayed-1, nav-bounce-delayed-2)
- No background color changes on hover

**Transitions:**
- Subtle, fast transitions for underlines
- Likely duration: 150-200ms
- Easing: ease-in-out or ease

**Images:**
- Inline logos: 18px × 18px
- Position: relative top offset -1px for vertical alignment
- Object-fit: contain
- Display: inline-flex for proper alignment with text

# Component Styles

**Header/Navigation:**
- Layout: Flexbox, space-between alignment
- Elements: Name (left), Navigation links (right)
- Links separated by vertical bars (|) using neutral-400 color
- Font: Extra light (200 weight)
- Size: 14px mobile, 15.2px desktop

**Section Headers:**
- Prefix: ◆ (diamond symbol)
- Weight: Normal
- No special styling beyond standard text

**Bullet Points:**
- Primary: ↳ (return symbol)
- Creates visual hierarchy
- Nested indentation for sub-points

**Inline Logo/Icon Treatment:**
- Wrapper: inline-flex with align-middle
- Icon: 18×18px image with -1px top offset
- Text: relative positioning with -1px top offset
- Gap: 4px between icon and text

**Links:**
- Underline: Custom class "hover-underline-nudge"
- Color: Inherits parent color
- No visited state styling
- External links same as internal

**Dividers:**
- Full-width horizontal lines
- 1px solid border
- Margin: 12px top and bottom (my-3)

**Footer:**
- Layout: Flexbox, space-between, flex-wrap
- Left: Contact label and social links
- Right: Theme toggle button
- Social links with icons (14×14px)

**Theme Toggle:**
- Icon + text label
- Same hover treatment as links
- Position: Bottom right of footer

# Site Sections

1. **Background Canvas**
   - Fixed position fluid animation canvas
   - Full viewport coverage
   - Pointer-events disabled

2. **Main Container**
   - Centered, max-width 640px
   - Responsive padding

3. **Header/Hero Section**
   - Name with underline treatment
   - Navigation links (Projects, About me, Photos)
   - Role: Founder at Clice with inline logo
   - Education: CS at UWaterloo with inline logo

4. **Section Divider** (horizontal line)

5. **"What Makes Me Different" Section**
   - Diamond header
   - Bulleted achievements list
   - Multiple levels of indentation
   - Inline logos/icons for companies and platforms
   - Bold emphasis on key numbers/metrics

6. **Section Divider** (horizontal line)

7. **"Building" Section**
   - Current projects
   - Company details with backing information
   - Nested bullet structure showing relationships

8. **Section Divider** (horizontal line)

9. **"Please Reach Out" Section**
   - Call-to-action
   - Target audience list

10. **Section Divider** (horizontal line)

11. **Footer/Contact Section**
    - Contact methods with icons (Email, GitHub, Twitter, LinkedIn)
    - Theme toggle button
    - Flexible layout for responsive design
</high_level_design>

<theme>
light
</theme>

<sections>
<clone_section>
    <file_path>src/components/sections/fluid-canvas-background.tsx</file_path>
    <design_instructions>
Clone the fixed full-screen fluid canvas background animation that covers the entire viewport. Create a canvas element with id="fluid" positioned fixed at top-0 left-0 with pointer-events-none, w-screen and h-screen classes. The canvas should render an interactive fluid/particle animation effect that responds subtly to page interactions while remaining in the background layer beneath all content.
    </design_instructions>
    <assets>[]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/header-navigation.tsx</file_path>
    <design_instructions>
Clone the minimalist header navigation section with left-aligned name and right-aligned menu links. Layout: flex container with items-center and justify-between, containing "◆ Lance Yan" on the left with underline underline-offset-[3px] font-extralight styling. Right side contains navigation links "Projects", "About me", and "Photos" separated by vertical bars ("|") with text-neutral-400 dark:text-neutral-600 color. Each link has hover-underline-nudge class and staggered nav-bounce animations (nav-bounce, nav-bounce-delayed-1, nav-bounce-delayed-2). Text sizing: text-sm sm:text-[0.95rem] with leading-tight. All navigation items have font-extralight weight.
    </design_instructions>
    <assets>[]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/intro-section.tsx</file_path>
    <design_instructions>
Clone the introductory section displaying role and education with inline logo icons. Contains two lines with "↳" prefix: "Founder" with Clice logo (18px) and company name, "CS" with UWaterloo logo (18px) and linked institution name. Each logo-text pair uses inline-flex items-center align-middle gap-1 with relative -top-[1px] positioning for pixel-perfect vertical alignment. Logos are 18x18px images with object-contain. Links have hover-underline-nudge class. Text styling: text-sm sm:text-[0.95rem] leading-tight space-y-2. Place after header with appropriate vertical spacing.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_1.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/achievements-section.tsx</file_path>
    <design_instructions>
Clone the comprehensive "What makes me different" achievements section with hierarchical bullet structure using "◆" and "↳" symbols. Section header: "◆ What makes me different:" followed by multiple achievement items, each prefixed with "↳". Nested sub-items use additional indentation (ml-4, ml-8 classes). Bold text uses font-bold slight-italic classes for emphasis on numbers/metrics (40K+, 2.5M+, 48h, 1K+, 4M+, 12h, etc). Inline logo-text combinations throughout using 18x18px images with inline-flex items-center align-middle gap-1 structure and relative -top-[1px] positioning. Links have hover-underline-nudge class. Text: text-sm sm:text-[0.95rem] leading-tight space-y-2, with some items having leading-[1.4] for better spacing. Include all company/organization logos inline with text references.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_12.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_1.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_9.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_10.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_13.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_6.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_14.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_15.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_16.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_17.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_4.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_18.png"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/building-section.tsx</file_path>
    <design_instructions>
Clone the "Building" section showcasing current projects with nested hierarchy. Section header: "◆ Building:" followed by main project "Clice. AI agents for the lending industry." with logo. Contains nested backing information with ml-4 and ml-8 indentation levels showing investors and program participation. Second project about ratemycompany.ca with nested call-to-action. Text styling: text-sm sm:text-[0.95rem] leading-tight space-y-2. All logos are 18x18px inline images with proper vertical alignment using inline-flex items-center align-middle gap-1 and relative -top-[1px]. Links have hover-underline-nudge class.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_1.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_14.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_7.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_8.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_2.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_12.png"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/call-to-action-section.tsx</file_path>
    <design_instructions>
Clone the brief call-to-action section inviting specific audiences to reach out. Section header: "◆ Please reach out if you're" followed by two simple bullet points: "A fellow founder." and "Someone who is curious about me or what I'm doing." Text styling: text-sm sm:text-[0.95rem] leading-tight space-y-2. Each line prefixed with "↳". Clean, minimal design with consistent spacing matching other sections.
    </design_instructions>
    <assets>[]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/footer-contact.tsx</file_path>
    <design_instructions>
Clone the footer section with contact links and theme toggle. Layout: flex items-center justify-between flex-wrap with pb-16 sm:pb-24 padding. Left side contains "◆ Contact:" label followed by social links (Email with mail icon, GitHub with github icon, Twitter with X logo image, LinkedIn with LinkedIn logo image) in flex items-center gap-3 layout. Icons are 14x14px for Lucide icons, 18x18px for logo images. All links styled as inline-flex items-center gap-1 with text-neutral-700 dark:text-neutral-300 color and hover-underline-nudge class. Right side has theme toggle button with moon icon (14x14px) and "Dark mode" text, styled as inline-flex items-center gap-1 with hover-underline-nudge and whitespace-nowrap. Text sizing: text-sm sm:text-[0.95rem].
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_4.png", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_18.png"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/divider.tsx</file_path>
    <design_instructions>
Create a reusable horizontal divider component used between major sections. Styling: my-3 margin, border-t border with border-neutral-200 dark:border-neutral-700 colors. This component appears multiple times throughout the page to separate content sections (after intro, after achievements, after building, after CTA, before footer).
    </design_instructions>
    <assets>[]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/layout/main-container.tsx</file_path>
    <design_instructions>
Create the main page container layout wrapper that centers content and provides consistent spacing. Structure: main element with relative positioning, containing inner div with relative z-10 positioning, mx-auto centering, max-w-screen-sm constraint, and px-4 sm:px-0 responsive horizontal padding. Include pt-16 sm:pt-24 top padding for initial content spacing. This container wraps all main content sections and ensures proper width constraints and spacing throughout the page.
    </design_instructions>
    <assets>[]</assets>
  </clone_section>
</sections>
