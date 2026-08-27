# React App Page Deployment

This repository contains the source for the Content Operations dashboard. The production app is embedded as a public portfolio demonstration in a standalone React page in the `esmond-theme` WordPress parent site.

## Current deployment

```text
Frontend page: https://esmondmccain.com/content-operations/
WordPress page ID: 123457117
Remote API: https://ops.esmondmccain.com
Theme app directory: react-projects/headless-ops-app/
Theme template: page-123457117.php
```

The backend theme is `em-client`, deployed at `ops.esmondmccain.com`. The parent `esmond-theme` repository hosts the compiled React assets and page template. The backend remains private-oriented, while this frontend page is intentionally indexable as a portfolio project.

## Build

Run the checks and create a production build from this repository:

```bash
npm run check
npm run build
```

The production build reads `.env.production`:

```env
VITE_WP_ORIGIN=https://ops.esmondmccain.com
```

The output is generated in `dist/`. Do not edit generated files directly.

## Deploy into the parent theme

Copy the generated runtime files into:

```text
esmond-theme/react-projects/headless-ops-app/
```

Copy JavaScript and CSS files from `dist/assets/`. Copy public runtime files such as `favicon.svg` and `icons.svg` when they are present and referenced by the build. Keep hashed filenames unchanged.

Update `esmond-theme/page-123457117.php` so its asset references match the new files:

```php
<script type="module" crossorigin src="<?php echo get_stylesheet_directory_uri(); ?>/react-projects/headless-ops-app/assets/<javascript-file>"></script>
<link rel="stylesheet" crossorigin href="<?php echo get_stylesheet_directory_uri(); ?>/react-projects/headless-ops-app/assets/<stylesheet-file>">
```

Keep the page template as a minimal standalone HTML shell. Do not add `get_header()`, `get_footer()`, `wp_head()`, `wp_body_open()`, or `wp_footer()`. Those hooks load unrelated parent-theme/plugin markup and assets, including site navigation, SEO output, and the WordPress admin bar.

The standalone shell should still provide public-page metadata: a descriptive title, meta description, canonical URL, Open Graph/Twitter descriptions, and `SoftwareApplication` JSON-LD. Do not add `noindex` to this portfolio page. Privacy controls belong to the `em-client` backend, not this public demonstration.

## Local and remote testing

Use the local backend during normal development:

```bash
npm run dev
```

This proxies `/wp-json` to `http://e-headless-wp.local` by default. To test the remote backend from the local Vite server:

```bash
npm run dev -- --mode production
```

This keeps the frontend at `http://localhost:5173` while proxying WordPress requests to `https://ops.esmondmccain.com`.

After deploying the compiled files to the parent theme, test the WordPress page locally at:

```text
https://esmondmccain.local/?page_id=123457117
```

## Validation checklist

- `npm run check` passes.
- Every JavaScript and CSS path in `page-123457117.php` exists in the parent theme.
- `php -l page-123457117.php` passes in the parent theme.
- The page loads without the parent navigation or WordPress admin bar.
- Browser requests for the app JavaScript and CSS return successfully.
- The dashboard can retrieve `/wp-json/wp/v2/posts` and `/wp-json/wp/v2/project_item` from the selected backend.

Commit source, generated theme assets, and the page template separately when practical. Do not commit local environment files such as `.env.local`.