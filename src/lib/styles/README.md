# Styles

Global stylesheets for the site, imported once through `app.css` in the root layout.

- Each sheet owns one concern and wraps its rules in its own `@layer`; `app.css` declares the layer order.
- Only `tokens.css` holds raw values; the `--palette-*` tokens are used nowhere else.
- Colours use `light-dark()`, so the site follows the system theme; `data-theme` on `<html>` forces one.
- `.app` is the element SvelteKit mounts into and is laid out with `display: contents`, so landmarks sit directly in the page flow.
- FAQ cards make the whole card clickable with an `::after` overlay on the link, so the card stays a single link for assistive technology.
