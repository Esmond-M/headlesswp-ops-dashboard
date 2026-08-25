# HeadlessWP Ops Dashboard

A portfolio-focused headless WordPress operations dashboard built with React, TypeScript, and Vite.

## Purpose
This app demonstrates practical headless CMS workflows:
- editorial queue management
- portfolio completeness scoring
- SEO/content audit checks

## Stack
- React + TypeScript + Vite
- React Router
- TanStack Query
- Zod
- Recharts

## Local Development
```bash
npm install
npm run dev
```

Default app URL:
- http://localhost:5173

## WordPress Local Setup
This app is designed for a local WordPress site first (e-headlesswp).

See full checklist:
- WORDPRESS_BACKEND_SETUP.md

## API Proxy
Vite proxies /wp-json to your local WordPress domain in development.

Current target in vite.config.ts:
- http://e-headlesswp.local

If your Local domain is different, update that target.

## Scripts
- npm run dev
- npm run lint
- npm run build
- npm run preview

## Roadmap
- Overview with live connectivity checks
- Editorial Queue page
- Portfolio Intelligence page
- SEO Audit page
