

## Language Toggle: English / Swahili

### Approach

Create a lightweight i18n (internationalization) system using React Context, similar to the existing `ThemeProvider` pattern. A `LanguageProvider` will wrap the app and expose a `useLanguage` hook. A toggle button will sit in the Navbar next to the theme toggle.

### What will be built

1. **Translation file** (`src/lib/translations.ts`) -- A dictionary object mapping keys to English and Swahili strings for all static UI text across pages (Navbar links, hero section, features, stats, footer, section headers, About page, etc.).

2. **Language Context & Hook** (`src/hooks/useLanguage.tsx`) -- A `LanguageProvider` (wrapping the app in `App.tsx`) with:
   - State: `"en" | "sw"`, persisted to `localStorage`
   - `t(key)` function to retrieve translated string
   - `toggleLanguage()` to switch between EN/SW

3. **Language Toggle Component** (`src/components/LanguageToggle.tsx`) -- A small button showing "EN" or "SW" (or a flag icon) placed in the Navbar beside the theme toggle.

4. **Updated components** -- Replace hardcoded English strings with `t("key")` calls in:
   - `Navbar.tsx` (nav link names)
   - `Index.tsx` (hero text, features, stats, CTA)
   - `Footer.tsx` (section headers, tagline)
   - `About.tsx` (profile text, mission, section titles)
   - `SectionHeader.tsx` (pass translated props from parents)
   - Other page headers (Courses, Tools, Videos, News, Contact)

### Technical details

- Pattern mirrors `useTheme` -- context + provider + hook
- Storage key: `cyberninja-language`
- Translation keys structured as `"nav.home"`, `"hero.title"`, `"features.securityTools"`, etc.
- Components call `const { t } = useLanguage()` and render `t("key")` instead of literal strings
- Dynamic content from the database (course titles, news, etc.) stays as-is (English only) -- only static UI strings are translated

