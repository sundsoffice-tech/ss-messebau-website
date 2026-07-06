# Deep Linking Implementation

This implementation provides comprehensive deep linking with URL anchors for direct section access across the website.

## Features

✅ **Direct Section Access**: Navigate directly to any section on any page using URL patterns like `#/leistungen#messebau`
✅ **Smooth Scrolling**: Automatically scrolls to sections with proper header offset
✅ **Section Tracking**: Updates URL as user scrolls through sections (optional)
✅ **Cross-Page Navigation**: Navigate to sections on different pages seamlessly
✅ **Focus Management**: Sets focus on target sections for accessibility
✅ **Retry Logic**: Handles async page loads with intelligent retry mechanism

## URL Pattern

```
#/[page]#[section]

Examples:
- #/leistungen#messebau - Navigate to Messebau section on Leistungen page
- #/kontakt#ki-chat - Navigate to KI Chat section on Kontakt page
- #/#services - Navigate to Services section on Home page
- #/branchen#food - Navigate to Food section on Branchen page
```

## Available Sections

### HomePage (`/`)
- `hero` - Hero section
- `services` - Main services overview
- `advantages` - Why S&S Messebau
- `references` - Project references
- `testimonials` - Customer testimonials
- `cta` - Call to action section

### LeistungenPage (`/leistungen`)
- `messebau` - Messebau details
- `eventbau` - Eventbau & Bühnen details
- `ladenbau` - Ladenbau & Showrooms details
- `boeden-ausstattung` - Böden & Ausstattung details

### BranchenPage (`/branchen`)
- `food` - Food & Feinkost sector
- `versicherungen` - Versicherungen sector
- `industrie` - Industrie & Technik sector

### KontaktPage (`/kontakt`)
- `kontakt-hero` - Page header
- `kontakt-form` - Contact form
- `kontakt-info` - Contact information
- `ki-chat` - KI Chat interface

## Usage

### In React Components

```tsx
import { useDeepLinking } from '@/hooks/use-deep-linking'

function MyPage() {
  const { navigateToSectionOnPage, scrollToSection } = useDeepLinking('/current-page')
  
  // Navigate to a section on another page
  const goToMessebau = () => {
    navigateToSectionOnPage('/leistungen', 'messebau')
  }
  
  // Navigate to a section on the current page
  const goToLocalSection = () => {
    scrollToSection('my-section-id')
  }
  
  return (
    <button onClick={goToMessebau}>View Messebau Details</button>
  )
}
```

### Section Observer (Optional)

Track sections as user scrolls and update URL:

```tsx
import { useSectionObserver } from '@/hooks/use-deep-linking'

function MyPage() {
  useSectionObserver([
    'section-1',
    'section-2',
    'section-3'
  ])
  
  return (
    <>
      <section id="section-1">...</section>
      <section id="section-2">...</section>
      <section id="section-3">...</section>
    </>
  )
}
```

### Direct Navigation (Without React)

```typescript
import { navigateToPageAndSection, navigateToSection } from '@/lib/deep-linking'

// Navigate to section on another page
navigateToPageAndSection('/leistungen', 'messebau')

// Navigate to section on current page
navigateToSection('my-section-id')
```

### Creating Deep Links

```typescript
import { createDeepLink } from '@/lib/deep-linking'

const link = createDeepLink('/leistungen', 'messebau')
// Returns: "#/leistungen#messebau"

// Use in HTML
<a href={createDeepLink('/kontakt', 'ki-chat')}>Chat with AI</a>
```

## Adding Deep Linking to New Pages

1. **Add section IDs to your page elements:**

```tsx
<section id="my-section" className="py-16">
  {/* content */}
</section>
```

2. **Use the deep linking hook:**

```tsx
import { useDeepLinking, useSectionObserver } from '@/hooks/use-deep-linking'

export function MyPage() {
  const { scrollToSection } = useDeepLinking('/my-page')
  
  // Optional: Track sections
  useSectionObserver(['my-section', 'another-section'])
  
  return <div>...</div>
}
```

3. **Add scroll margin for fixed headers:**

```css
.scroll-mt-20 {
  scroll-margin-top: 5rem; /* 80px - adjust for your header height */
}
```

Or use Tailwind class directly:

```tsx
<section id="my-section" className="py-16 scroll-mt-20">
```

## Best Practices

1. **ID Naming**: Use kebab-case for section IDs (e.g., `messebau`, `kontakt-info`)
2. **Header Offset**: Default is 80px, adjust if your header height differs
3. **Accessibility**: Section IDs are used for focus management - ensure they're on semantic elements
4. **Performance**: The section observer uses IntersectionObserver - it's performant by default
5. **Deep Link Structure**: Always follow the pattern `#/page#section` for consistency

## Configuration

### Adjust Header Offset

```typescript
// Default is 80px
navigateToSection('my-section', 100) // Use 100px offset
```

### Adjust Retry Logic

In `deep-linking.ts`, modify the `maxRetries` parameter:

```typescript
navigateToPageAndSection('/page', 'section', 20) // Try 20 times instead of 10
```

## Browser Support

- ✅ Chrome/Edge (Modern)
- ✅ Firefox (Modern)
- ✅ Safari (Modern)
- ✅ Mobile Browsers

Requires IntersectionObserver support (available in all modern browsers).

## Examples

### Service Cards on Homepage

```tsx
const services = [
  { id: 'messebau', title: 'Messebau' },
  { id: 'eventbau', title: 'Eventbau' }
]

{services.map(service => (
  <Card onClick={() => navigateToSectionOnPage('/leistungen', service.id)}>
    <h3>{service.title}</h3>
  </Card>
))}
```

### Navigation Menu

```tsx
const navItems = [
  { label: 'Messebau', sectionId: 'messebau' },
  { label: 'Eventbau', sectionId: 'eventbau' }
]

{navItems.map(item => (
  <a href={createDeepLink('/leistungen', item.sectionId)}>
    {item.label}
  </a>
))}
```

### Share Links

Users can share direct links to specific sections:

```
https://yoursite.com#/leistungen#messebau
```

This will load the Leistungen page and automatically scroll to the Messebau section.
