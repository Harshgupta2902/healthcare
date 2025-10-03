<website_design>
A single-page, warm and professional landing page for "HealthHere" that uses soft pastel whites and an aquatic-green gradient accent at low opacity (20–30%) to communicate calm, trust, and approachability. The page is vertically structured and responsive, with a fixed/sticky top header, a visually prominent hero section, a features/services block, a trust & testimonials strip, and a compact footer. page.tsx is responsible for the overall layout container, page-level spacing, and responsive breakpoints: it provides a centered max-width container on large screens, stacked full-width flow on small screens, and consistent vertical rhythm between the sections.

Layout order and relationship:
- Header (sticky at top): compact bar containing brand mark area, the HealthHere name on the left, and Sign In / Login + logo space on the right. The header lives above all other content and remains simple so it doesn't compete with the hero.
- Hero (first fold): large welcoming headline, supporting paragraph, primary CTA and secondary CTA, and an inline lead-capture form. The hero uses a rounded, soft card and an aquatic-green gradient background layer (20–30% opacity) blended with warm pastel whites. An illustration/visual placeholder sits to the right on wide screens and stacks under content on small screens.
- Services/How it works (below hero): horizontally arranged feature cards (tele-consultations, specialist network, secure records, personalized plans). Each card includes icon, short copy, and an action button. Booking flow lives inside this section as a modal/drawer owned by this component.
- Trust & Testimonials: logos/trust badges and a small testimonials carousel (3 items) to build credibility. This is visually lighter and kept compact to not distract from conversion CTAs.
- Footer: contact info, quick links, newsletter subscribe, legal links. Serves as the final anchor and small secondary conversion area.

Visual system notes for page.tsx:
- Use consistent container padding (px-6 / md:px-12) and a centered max-width (e.g., max-w-6xl) for desktop. Sections should be full-width but their inner content constrained by the container.
- Keep generous vertical spacing between sections (e.g., sections spaced 6–10 units); top header sits flush with the page edge but content below respects a warm gap.
- Use solid color fills, soft rounded corners, subtle drop shadows for cards, and clear accessible CTA contrast. Avoid decorative animated effects. Use straightforward flex/grid layouts for robustness.
- The five components below are independent and self-contained (they will be imported individually by page.tsx). Each component uses shadcn/ui building blocks and sonner for toasts where needed; none of the custom components import each other.
</website_design>

<components>
  <create_component>
    <file_path>src/components/Header.tsx</file_path>
    <design_instructions>
      Purpose: A self-contained top navigation bar that presents the HealthHere brand, a visible logo area (top-right), and user authentication entry points. It provides a responsive navigation affordance and an inline sign-in modal.

      Visual / layout:
      - Horizontal bar with subtle glass / pastel white background, soft drop shadow, rounded lower corners optional on large screens.
      - Left area: Brand wordmark "HealthHere" styled in a friendly blue (primary brand blue) using the chosen heading font (Nunito by default). The brand name should be prominent but not oversized.
      - Middle: optional small nav links (hidden on narrow screens) like "Services", "How it works", "Pricing" (anchor links) presented as low-contrast text.
      - Right area: placeholder square for logo/avatar (visible on all breakpoints) and two actions: "Sign in" (text link) and a primary "Get started" button (filled). On mobile, collapse into a hamburger icon that toggles a slide-over menu.

      Behavior & interactions:
      - Sign in / Login is handled inside this component: clicking "Sign in" opens an accessible modal (dialog) with email and password fields and social sign-in placeholders. The modal is implemented entirely inside the component (no external dependencies).
      - Form validation: client-side validation for email format and password non-empty; show inline error states and aria-live polite messages.
      - Loading & submit: show a loading indicator on the submit button while "authenticating" (simulated state). On success, close modal and trigger a success toast using sonner (shadcn's recommended toast solution).
      - Forgot password link opens a small within-modal view for entering an email to request a reset (keeps flow scoped in the header component).
      - Accessibility: modal traps focus, has keyboard close (Esc), and labeled controls.
      - Responsive: on small screens the header compresses, nav links collapse under the hamburger; the sign-in modal remains full-screen on narrow devices for readability.
      - States to include: default, mobile-collapsed, modal open, loading submit, and error states (invalid credentials simulated).

      Implementation notes for developers (non-code):
      - Use shadcn/ui dialog, button, input, and avatar primitives as the base.
      - Use sonner for success/failure toasts from sign-in actions.
      - Keep visual styling warm (soft rounded corners, pastel whites) and follow the brand typography tokens.
    </design_instructions>
  </create_component>

  <create_component>
    <file_path>src/components/Hero.tsx</file_path>
    <design_instructions>
      Purpose: The hero section drives first impressions and conversions: a welcoming headline, short explanatory copy, primary CTA to book a consultation, secondary CTA to learn more, and an inline lead-capture form (email). Visual emphasis comes from an aquatic-green gradient overlay at 20–30% opacity blended with warm pastel white cards and subtle shadows.

      Visual / layout:
      - Two-column layout on wide screens: left column for text content, CTAs, and inline form; right column for an illustration/visual placeholder (vector/photography card with rounded corners). On narrow screens content stacks vertically (text first, then illustration).
      - Background: a soft warm-white base with a horizontal/diagonal aquatic-green gradient overlay in the hero area. The aquatic gradient uses a low alpha (20–30%) and transitions from a pale aquamarine to a slightly deeper aqua to produce a calming wash behind the hero card.
      - Headline: large, friendly heading using the chosen heading font (Nunito). Include the brand name styled in the brand blue when mentioned in the headline (e.g., "Welcome to HealthHere").
      - Supporting text: clear, empathetic sentence or two that emphasize care, confidentiality, and simplicity.
      - CTAs: prominent primary "Book a free consultation" (filled, accessible contrast) and secondary "Learn how it works" (outline/ghost). Below/adjacent is an email capture inline form with placeholder and submit icon.
      - Microcopy under form: note about privacy and a small lock icon to reassure users about confidentiality.

      Behavior & interactions:
      - Inline email capture form is fully managed inside this component: input validation (email format), disabled state while submitting, inline errors, and success handling via sonner toasts. On success show a gentle confirmation state in the component (e.g., replace form with a thankful microcard & CTA to schedule).
      - Primary CTA opens a booking stub (if the user is signed in, simulate immediate progress) — for the landing page this can route to a booking flow or open a small informational modal (the modal/flow lives in ServicesSection if bookings are a full flow; here just show an explanatory overlay).
      - Hover & focus states: accessible focus rings, slight elevation on interactive cards and CTA buttons.
      - Responsive accessibility: text scales, stacked layout on mobile, the inline form becomes full-width.
      - States to include: default, form-loading, form-success, form-error, reduced-vision/high-contrast support.

      Visual details to implement:
      - Specify the aquatic gradient as a layered CSS gradient with rgba colors set to achieve the 20–30% visibility (e.g., rgba(46,196,182,0.22) to rgba(32,150,145,0.28)) and soft blur or overlay via linear-gradient.
      - Use card shaped containers with border radius ~12px, subtle shadow (e.g., 0 6px 18px rgba(20,30,40,0.06)).
      - Fonts: headings use chosen heading font (default: Nunito), body copy use chosen body font (default: Source Sans Pro). Provide CSS class tokens for easy override.

      Implementation notes for developers (non-code):
      - Use shadcn/ui components for inputs, buttons, and cards.
      - Use sonner for toasts on capture success/error.
      - Include a clear illustration placeholder (SVG or image) with alt text describing an empathetic consultation scene.
    </design_instructions>
  </create_component>

  <create_component>
    <file_path>src/components/ServicesSection.tsx</file_path>
    <design_instructions>
      Purpose: Present the core service offerings (consultations, specialists, personalized plans, secure records) and provide a scoped booking modal for quick scheduling/contact. This component consolidates feature discovery plus the initial booking flow so the interaction and data stay in one place.

      Visual / layout:
      - A grid of 3–4 feature cards arranged in 1–4 columns depending on breakpoint. Each card contains: small icon (outlined), heading, 1–2 line description, and a clear CTA (either "Learn more" or "Book").
      - Cards use warm pastel backgrounds, subtle borders, and consistent internal padding. Use simple iconography and accessible typography.
      - End of the section has a prominent "See all specialists" link and a small FAQ micro-area.

      Behavior & interactions:
      - Each card is interactive and has two actions: learn (expands an inline detail panel inside the same card area) or book (opens an accessible modal owned by this component).
      - Booking modal (scoped entirely inside ServicesSection):
        - Fields: Name, Email, Select service (dropdown), Preferred date/time input (date + optional time slot), optional short message.
        - Validation: required fields checked client-side; date must be in the future.
        - Loading/submit: show loading state on submit button; show inline success content inside modal after successful "booking" and trigger a sonner toast confirming the appointment.
        - Error handling: show field-level error messages and a top-level alert strip inside the modal if submission fails.
        - Accessibility: trap focus in modal, keyboard close, aria-live for success messages.
      - Learn-more expansion: clicking "Learn more" toggles a small accordion-type expansion for that card with a short list of benefits — this expansion is internal to the card component state.
      - Empty & loading states: include a skeleton version of the grid for async loading and an empty-state card if no services are available.

      Implementation notes for developers (non-code):
      - Use shadcn/ui card, dialog, select, input, and button primitives for the UI.
      - Use sonner toasts on booking success and error.
      - Keep data flows local to the component: the booking modal directly simulates/handles submission rather than requiring cross-component state.
    </design_instructions>
  </create_component>

  <create_component>
    <file_path>src/components/TrustAndTestimonials.tsx</file_path>
    <design_instructions>
      Purpose: A compact trust strip showcasing partner logos / accreditations and a short testimonial carousel to build credibility. This section is visually lighter and focuses on third-party trust and client voices.

      Visual / layout:
      - Top row: horizontally centered, muted partner/trust logos (monochrome or softened) with even spacing. Logos should be low-contrast to preserve the pastel vibe.
      - Bottom area: a testimonials area containing up to 3 highlight cards shown one at a time with left/right controls. Each testimonial card contains quote text, small avatar, name, role, and a 1–5 star visual rating (subtle).
      - Section background: very soft tinted band that contrasts slightly with the page background (no heavy colors).

      Behavior & interactions:
      - Carousel behavior is entirely internal: automatic gentle rotation (configurable) plus manual controls (prev/next). Auto-rotation pauses on hover/focus.
      - Accessible controls: each slide announced to screen readers (aria-live), and navigation buttons are labeled.
      - "Read more" interaction inside a testimonial expands a longer quote in place (accordion style) without leaving the section.
      - Loading & empty states: show skeleton cards for loading; if no testimonials available show a single neutral trust blurb instead.
      - No external data dependencies: the component simulates or accepts local props but manages its own display states and timing.

      Implementation notes for developers (non-code):
      - Use shadcn/ui primitives for buttons and cards.
      - Keep carousel state local and avoid prop drilling.
      - Ensure images/avatars have alt text; use CSS to ensure avatars are rounded and consistent.
    </design_instructions>
  </create_component>

  <create_component>
    <file_path>src/components/Footer.tsx</file_path>
    <design_instructions>
      Purpose: Site footer with concise contact information, useful links, newsletter sign-up, and legal links. It acts as the informational footer and secondary conversion area.

      Visual / layout:
      - Multi-column footer on desktop (3 columns): Contact & quick blurb, Quick links (Services, About, Help), Legal & social icons. On mobile stacks vertically.
      - Newsletter form: single-field email input + submit button, inline microcopy about privacy.
      - Visual styling uses soft pastel whites, small separators, and modest typographic scale.

      Behavior & interactions:
      - Newsletter sign-up handled in-component: email validation, loading state on submit, success confirmation inline plus sonner toast. If the email submission is invalid show inline error and accessible descriptions.
      - Social icons open external links in new tabs; include aria-labels.
      - Accessibility: keyboard focus, skip links handled at page-level; footer forms are accessible with labels and aria descriptions.
      - States: default, newsletter-loading, newsletter-success, and form-error.

      Implementation notes for developers (non-code):
      - Use shadcn/ui input/button components.
      - Use sonner for the newsletter success toast.
      - Keep links semantic and ensure legal links (privacy, terms) are included.
    </design_instructions>
  </create_component>
</components>