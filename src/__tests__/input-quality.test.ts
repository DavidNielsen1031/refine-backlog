import { assessInputQuality } from '@/lib/input-quality'

describe('assessInputQuality', () => {
  // ----------------------------------------------------------------
  // Cases that SHOULD be speculative (score < 30)
  // ----------------------------------------------------------------

  test('"asd" → isSpeculative=true, score < 20', () => {
    const result = assessInputQuality('asd')
    expect(result.isSpeculative).toBe(true)
    expect(result.score).toBeLessThan(20)
    // "asd" is gibberish (known keyboard sequence) — should flag as spam
    expect(result.flags).toContain('possible_spam')
  })

  test('empty string → isSpeculative=true', () => {
    const result = assessInputQuality('')
    expect(result.isSpeculative).toBe(true)
    expect(result.score).toBe(0)
  })

  test('keyboard mash "qwerty asdf zxcv" → isSpeculative=true', () => {
    const result = assessInputQuality('qwerty asdf zxcv')
    expect(result.isSpeculative).toBe(true)
    // All three are known keyboard row sequences → gibberish
    expect(result.flags).toContain('possible_spam')
  })

  test('Hindi spam "Jab chahe tab..." → isSpeculative=true', () => {
    // Transliterated Hindi in Latin script — no software vocabulary or technical context
    const input = 'Jab chahe tab karo yeh kaam aur phir dekho kya hota hai'
    const result = assessInputQuality(input)
    // Medium-length text with zero tech/software signals → capped as speculative
    expect(result.isSpeculative).toBe(true)
  })

  test('Dominant non-Latin (Devanagari) script → isSpeculative=true', () => {
    const input = 'यह एक परीक्षण है जो हिंदी में लिखा गया है और इसका कोई तकनीकी संदर्भ नहीं है'
    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(true)
    expect(result.flags).toContain('possible_spam')
  })

  test('Empty GitHub issue template → isSpeculative=true', () => {
    const input = `## Describe the bug

<!-- A clear and concise description of what the bug is. -->

## Steps to Reproduce

<!-- Steps to reproduce the behavior -->

## Expected behavior

<!-- A clear and concise description of what you expected to happen. -->

## Screenshots

<!-- If applicable, add screenshots to help explain your problem. -->

## Desktop

<!-- Please complete the following information -->

## Additional context

<!-- Add any other context about the problem here. -->`

    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(true)
    expect(result.flags).toContain('template_only')
  })

  test('Pure template boilerplate with all comments and no user text → isSpeculative=true', () => {
    const input = `<!--
  Thanks for submitting a bug report!
  Please fill in the details below.
-->

## Bug description

<!--
  Describe the bug here.
-->

## Steps to reproduce

<!--
  1. Go to ...
  2. Click on ...
-->

## Expected vs actual behavior

<!--
  Expected: ...
  Actual: ...
-->`
    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(true)
    expect(result.flags).toContain('template_only')
  })

  // ----------------------------------------------------------------
  // Cases that should NOT be speculative
  // ----------------------------------------------------------------

  test('"Add dark mode" → NOT speculative (short but clear intent)', () => {
    const result = assessInputQuality('Add dark mode')
    expect(result.isSpeculative).toBe(false)
  })

  test('"Fix the login bug on the dashboard page when users click submit" → NOT speculative', () => {
    const result = assessInputQuality(
      'Fix the login bug on the dashboard page when users click submit'
    )
    expect(result.isSpeculative).toBe(false)
  })

  test('Well-written bug report → NOT speculative, high score', () => {
    const input = `## Bug: User session expires silently on dashboard

When a logged-in user leaves the dashboard open for more than 30 minutes without interacting, 
their session token expires. When they then try to click any button, instead of being redirected 
to the login page with a clear message, the action fails silently — no error, no redirect.

Steps to reproduce:
1. Log in as any user
2. Navigate to /dashboard
3. Wait 35 minutes without clicking anything
4. Click "Save Settings"
5. Nothing happens — request fails with 401 in the network tab, but no UI feedback

Expected: User sees "Your session has expired, please log in again" and is redirected.
Actual: Silent failure. User must manually refresh the page to discover their session is gone.

Stack: Next.js 14, NextAuth.js, React 18. Affects all browsers.
Error in logs: \`JWT token expired at 2024-01-15T10:35:22Z\``

    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(false)
    expect(result.score).toBeGreaterThan(60)
  })

  test('Template with filled content → NOT speculative', () => {
    const input = `## Describe the bug

<!-- A clear and concise description of what the bug is. -->

When I click the "Export to CSV" button on the reports page, the download starts but the file 
is empty (0 bytes). This happens consistently with any date range. I have tried on Chrome 120 
and Firefox 121 — same result.

## Steps to Reproduce

<!-- Steps to reproduce the behavior -->

1. Navigate to /reports
2. Select any date range (e.g. last 30 days)
3. Click "Export to CSV"
4. File downloads but is empty

## Expected behavior

<!-- A clear and concise description of what you expected to happen. -->

The CSV file should contain all report rows matching the selected date range.

## Environment

- OS: macOS 14.2
- Browser: Chrome 120
- App version: 2.4.1`

    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(false)
    expect(result.flags).not.toContain('template_only')
  })

  test('Spec with technical context → no_technical_context flag absent', () => {
    const input = `Fix the API endpoint /api/users returning 500 when the database connection times out.
The error appears in the logs as: TypeError: Cannot read properties of null (reading 'id').
Stack trace points to src/lib/db.ts line 42. Need to add proper error handling and return 
a 503 with a user-friendly message instead of letting the exception bubble up.`

    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(false)
    expect(result.flags).not.toContain('no_technical_context')
  })

  test('Short clear spec with no technical context still not speculative', () => {
    const result = assessInputQuality('Add dark mode toggle to the settings page')
    expect(result.isSpeculative).toBe(false)
  })

  // ----------------------------------------------------------------
  // Score range tests
  // ----------------------------------------------------------------

  test('Long well-written spec scores high (> 70)', () => {
    const input = `## Feature: Implement OAuth2 login with Google

Users need to be able to sign in with their Google account to reduce friction during onboarding.
Currently 40% of users abandon the signup form — SSO would remove the password requirement.

### Problem
The current email/password registration has a 40% drop-off rate. Google OAuth would allow 
one-click login and reduce friction significantly.

### Acceptance Criteria
- User clicks "Sign in with Google" and is redirected to Google's OAuth consent screen
- After consent, user is returned to /dashboard with a valid session token (JWT)
- New users have an account auto-created with their Google profile data
- Existing users with the same email are linked to their Google account automatically
- Error states (denied consent, network failure) show a clear error message

### Technical notes
- Use next-auth with Google provider
- Store OAuth tokens in httpOnly cookies
- Session expiry: 30 days
- API route: /api/auth/[...nextauth]
- Environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

### Verification
- Run \`npm test\` — all auth tests pass
- curl /api/auth/session returns 200 with user object after login
- Open /login, click Google button, complete OAuth flow, verify redirect to /dashboard`

    const result = assessInputQuality(input)
    expect(result.isSpeculative).toBe(false)
    expect(result.score).toBeGreaterThan(70)
  })

  test('Score increases with content quality', () => {
    const low = assessInputQuality('asd')
    const medium = assessInputQuality('Fix the login page')
    const high = assessInputQuality('Fix the login bug where users get 401 errors when clicking submit on /login page. Stack trace: TypeError at auth.ts:42')

    expect(low.score).toBeLessThan(medium.score)
    expect(medium.score).toBeLessThanOrEqual(high.score)
  })

  // ----------------------------------------------------------------
  // Flag tests
  // ----------------------------------------------------------------

  test('Flags "too_short" for very short content (< 5 meaningful words)', () => {
    const result = assessInputQuality('asd')
    expect(result.flags).toContain('too_short')
  })

  test('Does NOT flag "too_short" for clear one-liner with 3+ words', () => {
    const result = assessInputQuality('Add dark mode')
    expect(result.flags).not.toContain('too_short')
  })

  test('Flags "possible_spam" for keyboard-row sequences', () => {
    const result = assessInputQuality('zxcvbn qwerty')
    expect(result.isSpeculative).toBe(true)
    expect(result.flags).toContain('possible_spam')
  })

  test('Does NOT flag "possible_spam" for English technical content', () => {
    const result = assessInputQuality(
      'Fix the null pointer exception in the user authentication middleware'
    )
    expect(result.flags).not.toContain('possible_spam')
  })
})
