# WordPress Backend Setup (e-headlesswp)

Use this checklist while building the dashboard.

## 1) Local Site
- Create Local app site named e-headlesswp.
- Confirm site URL works in browser, for example: http://e-headless-wp.local.

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
Check in browser:
- /wp-json
- /wp-json/wp/v2/posts
- /wp-json/wp/v2/project_item

## 8) Featured Media Support
- Add featured images to some posts and projects.
- This enables media completeness checks in dashboard scoring.

## 9) User Roles (Optional for Later)
- Create an Editor test user to mimic editorial workflow.

## 10) If API Endpoint Fails
- Recheck show_in_rest for CPT and taxonomies.
- Re-save permalinks.
- Confirm local domain in vite.config.ts proxy target.
