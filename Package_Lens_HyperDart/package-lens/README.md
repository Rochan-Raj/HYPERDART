# Package Lens — hyperDart Package Info

A developer-focused npm explorer: package details, comparisons of two or three packages, and transparent alternatives discovery. Generated from create-hyper-dart 1.0.12, React (JavaScript + Vite). Official withHD export, sandbox, Vite configuration, publish registry and validator are preserved.

## Run in VS Code on Windows
1. Install Node.js 22 LTS (22.12 or newer in that line) and VS Code. Restart VS Code after installing Node.
2. Extract this ZIP. Open the **package-lens folder containing package.json** using File → Open Folder.
3. Open Terminal → New Terminal and run:

```powershell
node --version
npm --version
npm ci
npm start
```

Open the localhost URL printed by Vite. This is the official hyperDart sandbox, not a standalone replacement app. If PowerShell blocks npm.ps1, select **Command Prompt** as your VS Code terminal, or use `npm.cmd` instead of `npm`. Do not run commands from src.

No VS Code extension is required: JavaScript, JSX and debugging support are built in. Recommended: **Prettier - Code formatter** (`esbenp.prettier-vscode`). ESLint is optional only if you later configure it; this project has no lint script. Live Server, Python extensions and React snippet extensions are unnecessary.

## Sandbox queries
Default searchData.json contains npm express with real NPM_PACKAGES entities. tests/samples.json contains six alternative input arrays; copy one whole inner array into searchData.json and reload the sandbox to test comparisons, alternatives, scoped and unknown packages. These are query inputs only; all displayed package data is fetched from npm. Use the sandbox's normal render controls for sidebar/mainline and themes. Confirm queries activate in the hosted platform after publishing; local input fixtures do not prove server-side entity recognition.

## Commands
```powershell
npm test
npm run build
npm run validate
```
Validation intentionally fails until your REAL GitHub repository and YouTube demo URLs are filled in hyperdart.config.js. Never remove the validator or use --ignore-scripts.

## Architecture and files
- src/frontend/index.jsx: original withHD export and platform integration.
- NewComponent.jsx: lifecycle, stale-result guard, details cards, comparison and alternatives. Calls componentLoaded once after the initial request settles and renders.
- query.js: object/array normalization, trusted package entity extraction, intent and name validation.
- api.js: 12-second request timeout, HTTP errors, five-minute successful-response cache, metadata normalization and candidate ranking.
- styles.css: scoped responsive styling, horizontal comparison overflow, focus states, light/dark colors.
- searchData.json: local sandbox input only.
- hyperdart.config.js: official trigger patterns, existing interface, empty submission link fields.
- tests/core.test.js: deterministic unit tests with explicitly mocked HTTP; never used by runtime UI.

## Sources
Latest metadata: https://registry.npmjs.org/{encodedPackage}/latest
Full metadata and release timestamps: https://registry.npmjs.org/{encodedPackage}
Weekly downloads: https://api.npmjs.org/downloads/point/last-week/{encodedPackage}
Discovery: https://registry.npmjs.org/-/v1/search?text={encodedQuery}&size=25
Official framework docs: https://hyperdart.com/docs/docs/intro/

## Design decisions
No backend, secrets, database or LLM required. Independent requests use Promise.allSettled; a missing downloads count does not discard metadata. Each comparison package can fail independently. Input changes invalidate prior UI writes, though old network requests may finish and populate cache. Errors are not cached.

Alternatives use up to five original keywords (description fallback). Score = 2 × shared-keyword count + npm popularity signal + searchScore/(1+searchScore). Remove duplicates and original; enrich only the top five. This is a transparent heuristic, not a benchmark. Plugins and related tools may appear; users must verify replacement suitability.

TypeScript is reported only when types/typings is declared. ESM is reported only for type=module. Absence is 'Not verified', not 'unsupported'. Repository links accept HTTP(S) only. No invented license, release date, compatibility, ranking winner or statistics. Download comparisons require matching periods.

## Manual acceptance checklist
- Default express details; react latest version; request deprecation message.
- Two and three package comparisons, including one unknown name.
- Moment alternatives and Compare with original action.
- @angular/core URL encoding and data display.
- Browser network offline: useful error, then Retry after reconnecting.
- Rapid query changes: previous response must not overwrite current query.
- 320px, 400px and desktop widths: cards readable, table scrolls.
- Light/dark sandbox themes and keyboard-only links/buttons.
- Inspect browser console and platform componentLoaded behavior.

## Limitations
Public APIs may rate-limit or block browser requests. Full metadata records can be large. No automatic retries, background refresh, security audit, bundle-size analysis or version-to-version comparison. Search relies on framework package entities (provided collection covers top 10,000 packages); unknown/unresolved names get guidance. Local fixture inputs can test scoped packages, but platform recognition remains a hosted check. Theme support recognizes palette.mode or mode and falls back to system preference; confirm actual sandbox theme behavior. No lint configuration was supplied. No authentication is included.

## Publication checklist
1. Create a public GitHub repository and push source plus package-lock.json. Do not commit node_modules, dist, .env or .npmrc.
2. Record and upload the 2–3 minute demo to YouTube.
3. Set existing github and demovideo fields to real URLs, repo root and YouTube watch/share URL.
4. Create the package in Partner Portal → My packages → Create package. Ensure package name agrees with package.json. Use the token command supplied by the portal; never share/commit token.
5. Run npm test, npm run build, npm run validate. Resolve every validation error.
6. Run plain npm publish. Existing publishConfig targets https://dev-registry.hyperdart.com and prepublishOnly runs the original validator.
7. Verify published details, comparison and alternatives queries in hyperDart.

## AI disclosure
OpenAI Codex generated the implementation, tests and documentation using the official starter. Review and understand the code, then describe your own changes accurately in your submission. Do not claim personally authored code you did not write.
