# WordPress Backend Setup

Use this checklist when preparing the local or production WordPress backend. The required WordPress integration lives in the `em-client` theme.

## 1) Environments
- Create Local app site named e-headlesswp.
- Confirm site URL works in browser, for example: http://e-headless-wp.local.
- Production backend origin: https://ops.esmondmccain.com.
- Local dashboard requests use the Vite proxy.
- Production builds use `VITE_WP_ORIGIN` from `.env.production`.

## 2) Permalinks
- In WordPress admin, go to Settings -> Permalinks.
- Select Post name and save.

## 3) Core Content for Day 1
- Create at least 10 posts with varied publish dates.
- Include some posts with short titles and some with long titles.
- Leave excerpts empty on a few posts to test audit rules later.

## 4) Portfolio Content Type
Use a CPT plugin (or code) to create:
- CPT slug: project_item
- Public: true
- Show in REST API: true

## 5) Taxonomies for Portfolio
Create and expose both in REST:
- project_stack (React, WordPress, PHP, TypeScript)
- project_type (Client, Internal, Plugin)

## 6) Portfolio Seed Data
- Add 12 to 20 project items.
- Intentionally leave some items incomplete:
  - missing featured image
  - missing excerpt
  - no taxonomy terms

## 7) Verify API Endpoints
Check these endpoints in a browser or with a request tool:

Local:
- http://e-headless-wp.local/wp-json/wp/v2/posts
- http://e-headless-wp.local/wp-json/wp/v2/project_item

Production:
- https://ops.esmondmccain.com/wp-json/wp/v2/posts
- https://ops.esmondmccain.com/wp-json/wp/v2/project_item

The app uses the versioned `wp/v2` endpoints directly. A response from the bare `/wp-json` discovery route is not required as long as the endpoints above respond successfully.

## 8) Featured Media Support
- Add featured images to some posts and projects.
- This enables media completeness checks in dashboard scoring.

## 9) User Roles (Optional for Later)
- Create an Editor test user to mimic editorial workflow.

## 10) CORS
When the dashboard is served from the parent site, the remote backend must allow requests from that frontend origin. The `em-client` theme currently adds REST CORS headers for headless development. Confirm the response headers if the browser reports a cross-origin error.

## 11) If API Endpoint Fails
- Recheck show_in_rest for CPT and taxonomies.
- Re-save permalinks.
- Confirm `VITE_WP_ORIGIN` in the selected environment file.
- Confirm the production backend is reachable over HTTPS.
- Confirm the active backend theme is `em-client` and includes the Headless Operations integration.
