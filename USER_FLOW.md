# Holiday AI - Complete User Flow

## 🏠 Homepage (`/home-new`)

### User Actions & Outcomes:

#### Scenario 1: Complete Search (Destination + Dates filled)
```
User fills: "Tokyo" + "March 1, 2026" + "March 7, 2026"
Clicks: "SEARCH NOW"
→ Goes directly to /results with default preferences
→ Uses: comfort style, culture & food interests
```

#### Scenario 2: Partial Search (Only some fields filled)
```
User fills: "Tokyo" only
OR: Dates only
OR: Any combination without all 3 required fields
Clicks: "CONTINUE PLANNING"
→ Goes to /plan with pre-filled data
→ Starts at appropriate step based on what's filled
```

#### Scenario 3: Empty Search
```
User clicks: "CONTINUE PLANNING" (without filling anything)
→ Goes to /plan (fresh start)
→ Begins at Step 1: Destination & Dates
```

#### Scenario 4: AI-Guided Planning Link
```
User clicks: "Or start with AI-guided planning"
→ Goes to /plan (fresh start)
→ Full guided experience
```

---

## 🎯 Planning Flow (`/plan`)

### Step 1: Destination & Dates
**Pre-filled if coming from homepage**
- Departure country (default: Malaysia)
- Destination (optional for AI)
- Check-in date
- Check-out date

**Validation**: Must have both dates to proceed

**Next**: Goes to Step 2 (Budget)

---

### Step 2: Budget & Travelers
**Pre-filled**: Guest counts from homepage (if provided)
- Budget slider: RM 1,000 - RM 50,000
- Adults counter (min: 1)
- Children counter (min: 0)

**Features**:
- Back button → Returns to Step 1 (editable)
- Large numbers for easy reading
- +/- buttons for counters

**Next**: Goes to Step 3 (Preferences)

---

### Step 3: Preferences
- **Travel Style**: Budget / Comfort / Luxury
- **Interests** (multi-select, min 1 required):
  - Food & Cuisine 🍽️
  - Culture & History 📸
  - Beach & Relaxation 🌊
  - Adventure ⛰️
  - Shopping ❤️
  - Nature & Wildlife 🌿

**Validation**: Must select at least 1 interest

**Next**: Goes to Step 4 (AI or Manual)

---

### Step 4: Choose Path
Two options presented side-by-side:

#### Option A: AI Suggestion (Recommended)
- **When to use**: User wants personalized recommendations
- **Requirements**: None (destination not required)
- **Action**: AI analyzes all preferences and suggests 3 destinations
- **Data sent**:
  - Dates, budget, travelers, style, interests
  - destination = "AI-SUGGEST"
- **Goes to**: Loading → Results page

#### Option B: Manual Search
- **When to use**: User knows exact destination
- **Requirements**: Destination must be filled in Step 1
- **State**: Disabled if no destination provided
  - Shows: "Please enter a destination in Step 1"
- **Action**: Searches for specified destination
- **Goes to**: Results page

---

### Step 5: Loading (AI path only)
- Animated spinner
- Shows: "AI is crafting your perfect itinerary..."
- Displays: Interests count, budget amount
- Duration: ~2 seconds
- **Goes to**: Results page

---

## 📊 Results Page (`/results`)

Displays:
- AI-generated packages (3 tiers: Budget/Standard/Luxury)
- OR Manual search results
- Data source indicators showing:
  - 🤖 AI Generated (OpenAI)
  - ✈️ Amadeus API (real data)
  - ⚠️ Sample Data (fallback)

---

## 🔄 Complete Flow Matrix

| Starting Point | User Input | Destination | Button Text | Goes To | Notes |
|---------------|------------|-------------|-------------|---------|-------|
| `/home-new` | Nothing | - | "CONTINUE PLANNING" | `/plan` Step 1 | Fresh guided flow |
| `/home-new` | Destination only | Filled | "CONTINUE PLANNING" | `/plan` Step 1 | Pre-filled destination |
| `/home-new` | Dates only | Empty | "CONTINUE PLANNING" | `/plan` Step 2 | Pre-filled dates |
| `/home-new` | All fields | Filled | "SEARCH NOW" | `/results` | Direct search (default prefs) |
| `/home-new` | AI link click | - | - | `/plan` Step 1 | Fresh guided flow |
| `/plan` Step 1 | Complete | Any | "Continue" | `/plan` Step 2 | - |
| `/plan` Step 2 | Complete | Any | "Continue" | `/plan` Step 3 | - |
| `/plan` Step 3 | Complete | Any | "Continue" | `/plan` Step 4 | - |
| `/plan` Step 4 | AI choice | Empty/Any | "AI Suggestion" | Loading → `/results` | AI generates destinations |
| `/plan` Step 4 | Manual choice | Filled | "Manual Search" | `/results` | Uses entered destination |
| `/plan` Step 4 | Manual choice | Empty | Disabled | - | Prompts to fill destination |

---

## ✅ Key Features

### Smart Pre-filling
- Homepage data carries to planning flow
- URL parameters preserve user input
- Skips to appropriate step based on data completeness

### Always Editable
- Back buttons on every step
- Can return and modify previous choices
- Progress dots show current position

### Flexible Paths
- **Fast Path**: Fill homepage → Direct to results
- **Guided Path**: Step-by-step preferences → AI/Manual choice
- **Hybrid Path**: Partial homepage → Complete in planning flow

### Clear Expectations
- Button text changes based on data completeness
- Helper text explains what happens next
- Disabled states with clear reasons

### Error Prevention
- Required field validation
- Can't proceed without minimum data
- Visual feedback on selections
- Clear prompts for missing information

---

## 🎨 Design Principles

1. **Progressive Disclosure**: Only show what's needed at each step
2. **Clear Calls-to-Action**: Button text describes the action
3. **Visual Feedback**: Selected items clearly highlighted
4. **Responsive Design**: Works on mobile, tablet, desktop
5. **Smooth Transitions**: Framer Motion animations between steps
6. **Accessibility**: Proper labels, keyboard navigation, screen reader support

---

## 🚀 Technical Implementation

### Routes
- `/home-new` - Agoda-style homepage
- `/plan` - Multi-step planning experience
- `/results` - Search results with package cards

### State Management
- Local component state for form data
- URL parameters for data persistence
- Query params for cross-page communication

### Navigation
- Next.js App Router
- `useRouter` for programmatic navigation
- `useSearchParams` for reading URL data

### Validation
- Client-side form validation
- Disabled states for incomplete data
- Visual indicators for required fields
