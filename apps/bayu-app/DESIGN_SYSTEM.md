# Bayu Design System

> Sabah's Official AI Travel Companion — rooted in the land, sea, and sky of North Borneo.

---

## Brand Identity

**Name:** Bayu (Malay: "breeze" / "wind")
**Tagline:** Discover Sabah
**Positioning:** AI-powered tourism digital transformation for Sabah
**Personality:** Welcoming, adventurous, trustworthy, modern, nature-connected

### Brand Voice
- Friendly but professional — like a knowledgeable local friend
- Confident but not corporate — approachable, warm
- Multilingual-aware — Malay, English, Mandarin, Korean primary markets

---

## Color System

### Design Rationale

Colors are derived from **Sabah's official state and tourism branding**:
- **Sabah State Flag:** Blue `#0484D6`, Dark Blue `#002B7F`, Light Blue `#77CCFF`, Red `#F5362F`, White
- **Sabah Parks:** French Blue `#096DBB`, Cerulean `#2EAFE8`, Yellow `#FDEF08`

The palette reflects Sabah's identity — ocean blues, rainforest greens, sunset golds — while maintaining a modern app aesthetic.

### Primary Palette

| Token | Hex | Preview | Role |
|-------|-----|---------|------|
| `primary` | `#096DBB` | 🟦 | Main brand color — Sabah ocean blue (from Sabah Parks) |
| `primaryLight` | `#2EAFE8` | 🟦 | Interactive elements, highlights — cerulean sky |
| `primaryDark` | `#002B7F` | 🟦 | Headers, emphasis — Sabah flag dark blue |
| `secondary` | `#059669` | 🟩 | Nature elements, success — Borneo rainforest green |
| `secondaryLight` | `#10B981` | 🟩 | Light green accents, tags |
| `accent` | `#F7B731` | 🟨 | Highlights, CTAs, premium — Sabah sunset gold |
| `accentRed` | `#F5362F` | 🟥 | Urgency, alerts, badges — Sabah flag red |

### Nature Tokens

Semantic color tokens inspired by Sabah's natural landmarks:

| Token | Hex | Reference |
|-------|-----|-----------|
| `ocean` | `#096DBB` | South China Sea deep waters |
| `sky` | `#2EAFE8` | Sabah clear tropical sky |
| `reef` | `#77CCFF` | Sipadan/Mabul shallow reef water |
| `jungle` | `#059669` | Kinabalu & Danum Valley rainforest |
| `sunset` | `#F7B731` | KK waterfront golden hour |
| `earth` | `#8B6914` | Mount Kinabalu granite & trail |
| `coral` | `#F5362F` | Sipadan reef life, Rafflesia |
| `sand` | `#F5E6CC` | Borneo beach sand |

### Tier Colors (Packages)

| Tier | Hex | Label |
|------|-----|-------|
| Budget | `#10B981` | Backpacker — fresh, accessible |
| Comfort | `#2EAFE8` | Explorer — cerulean, balanced |
| Luxury | `#F7B731` | Premium — sunset gold, exclusive |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FFFFFF` | App background |
| `surface` | `#F0F7FB` | Cards, panels (slight blue tint) |
| `surfaceSecondary` | `#E8F1F8` | Secondary surfaces |
| `border` | `#D1E3EF` | Borders (blue-tinted) |
| `borderLight` | `#E8F1F8` | Subtle dividers |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text` | `#0A1628` | Primary text — deep navy |
| `textSecondary` | `#4A6178` | Secondary, captions |
| `textTertiary` | `#8FA3B8` | Placeholders, disabled |
| `textInverse` | `#FFFFFF` | Text on dark/colored bg |

### Status

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#059669` | Confirmed, complete |
| `warning` | `#F7B731` | Pending, attention |
| `error` | `#F5362F` | Error, cancelled |
| `info` | `#2EAFE8` | Informational |

### Gradients

| Name | Value | Usage |
|------|-------|-------|
| `oceanDepth` | `#002B7F → #096DBB` | Hero headers, splash |
| `sabahSky` | `#096DBB → #2EAFE8` | App bar, feature cards |
| `sunsetGlow` | `#F7B731 → #F5362F` | Premium CTAs, highlights |
| `jungleMist` | `#059669 → #10B981` | Nature/eco sections |
| `reefShimmer` | `#2EAFE8 → #77CCFF` | Island/diving content |

---

## Typography

### Font Families

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Heading | Poppins | 700 Bold | Page titles, hero text |
| Heading | Poppins | 600 SemiBold | Section headers, card titles |
| Body | Inter | 500 Medium | Emphasized body text, labels |
| Body | Inter | 400 Regular | Body copy, descriptions |
| Body | Inter | 600 SemiBold | Buttons, navigation |

### Type Scale

| Token | Size (px) | Line Height | Usage |
|-------|-----------|-------------|-------|
| `3xl` | 34 | 1.2 (tight) | Hero headlines |
| `2xl` | 28 | 1.2 (tight) | Page titles |
| `xl` | 24 | 1.2 (tight) | Section headers |
| `lg` | 20 | 1.5 (normal) | Card titles, subtitles |
| `md` | 17 | 1.5 (normal) | Large body, nav labels |
| `base` | 15 | 1.5 (normal) | Default body text |
| `sm` | 13 | 1.5 (normal) | Captions, metadata |
| `xs` | 11 | 1.7 (relaxed) | Badges, fine print |

---

## Spacing

### Scale

| Token | Value (px) | Usage |
|-------|------------|-------|
| `xs` | 4 | Tight gaps, inline spacing |
| `sm` | 8 | Icon-to-text, compact padding |
| `md` | 12 | Card internal padding |
| `base` | 16 | Standard padding, section gaps |
| `lg` | 20 | Card padding, group spacing |
| `xl` | 24 | Section padding |
| `2xl` | 32 | Major section breaks |
| `3xl` | 40 | Page-level spacing |
| `4xl` | 48 | Hero spacing |

### Border Radius

| Token | Value (px) | Usage |
|-------|------------|-------|
| `sm` | 6 | Chips, small badges |
| `md` | 10 | Buttons, inputs |
| `lg` | 14 | Cards, panels |
| `xl` | 20 | Feature cards, modals |
| `full` | 9999 | Avatars, circular buttons |

### Shadows

| Token | Offset | Opacity | Radius | Usage |
|-------|--------|---------|--------|-------|
| `sm` | 0, 1 | 0.05 | 2 | Subtle lift — chips, tags |
| `md` | 0, 2 | 0.10 | 4 | Cards, surfaces |
| `lg` | 0, 4 | 0.15 | 8 | Modals, floating elements |

---

## Iconography

### Style
- **Library:** @expo/vector-icons (Ionicons primary, MaterialCommunityIcons secondary)
- **Style:** Outlined for inactive, filled for active states
- **Stroke:** 1.5px–2px consistent weight
- **Sizes:** 16 (inline), 20 (list items), 24 (navigation), 32 (feature icons)
- **Color:** Follows text color tokens; primary blue for interactive

### Tab Bar Icons

| Tab | Icon (Ionicons) | Active Color |
|-----|-----------------|--------------|
| Home | `home-outline` / `home` | `#096DBB` |
| Explore | `compass-outline` / `compass` | `#096DBB` |
| iBayu (AI) | `sparkles-outline` / `sparkles` | `#FFFFFF` on `#096DBB` circle |
| Bookings | `briefcase-outline` / `briefcase` | `#096DBB` |
| Discover | `map-outline` / `map` | `#096DBB` |
| Profile | `person-outline` / `person` | `#096DBB` |

---

## Component Patterns

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `#096DBB` | White | — | Main actions |
| Secondary | White | `#096DBB` | `#096DBB` 1px | Secondary actions |
| Accent | `#F7B731` | `#0A1628` | — | Premium CTAs, highlights |
| Danger | `#F5362F` | White | — | Destructive actions |
| Ghost | Transparent | `#096DBB` | — | Tertiary, links |

### Cards

- Background: `surface` (`#F0F7FB`)
- Border: `border` (`#D1E3EF`) — 1px
- Border radius: `lg` (14px)
- Padding: `lg` (20px)
- Shadow: `md`
- **GlassCard variant:** `rgba(255,255,255,0.85)` with backdrop blur for overlays on images

### Tier Package Cards

| Tier | Accent stripe | Badge bg | Icon |
|------|--------------|----------|------|
| Budget | `#10B981` left border 3px | `#ECFDF5` | 🎒 backpack |
| Comfort | `#2EAFE8` left border 3px | `#E0F4FE` | 🧭 compass |
| Luxury | `#F7B731` left border 3px | `#FEF7E0` | ✨ sparkle |

### Input Fields

- Background: White
- Border: `#D1E3EF` — 1px, radius `md` (10px)
- Focus border: `#096DBB` — 2px
- Placeholder: `textTertiary` (`#8FA3B8`)
- Height: 48px
- Padding: horizontal `base` (16px)

---

## App Logo Concept

### Mark Description
Stylized **Mount Kinabalu silhouette** with **flowing wind/breeze curves** (representing "Bayu") that form a subtle **"B"** shape. The wind lines double as an AI/data flow motif.

### Logo Colors
- Mark: White on `oceanDepth` gradient (`#002B7F → #096DBB`)
- Alternate: `#096DBB` mark on white background
- App icon: Rounded square with gradient background, white mark

### Wordmark
- Font: Poppins Bold, tracked +4%
- Tagline: "Discover Sabah" in Inter Regular, `textSecondary`

---

## Dark Mode (Future)

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#FFFFFF` | `#0A1628` |
| `surface` | `#F0F7FB` | `#132137` |
| `surfaceSecondary` | `#E8F1F8` | `#1A2D47` |
| `border` | `#D1E3EF` | `#1E3A5F` |
| `text` | `#0A1628` | `#E8F1F8` |
| `textSecondary` | `#4A6178` | `#8FA3B8` |
| `primary` | `#096DBB` | `#2EAFE8` |

---

## References

- [Sabah State Flag Colors](https://www.flagcolorcodes.com/sabah) — Blue `#0484D6`, Dark Blue `#002B7F`, Red `#F5362F`, Light Blue `#77CCFF`
- [Sabah Parks Official Branding](https://www.sabahparks.org.my/about-us/branding) — French Blue `#096DBB`, Cerulean `#2EAFE8`, Yellow `#FDEF08`
- [Sabah Tourism Board — Feel Sabah, North Borneo](https://sabahtourism.com/)
