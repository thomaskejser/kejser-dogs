# Dogs: A human companion's manual

A static website of short answers to common questions about dogs.
The front page lists every question by category; each question has its own URL at `/faq/<slug>`.

## Stack

- SvelteKit with `@sveltejs/adapter-static`; every page is prerendered to HTML in `build/`.
- Answers are Markdown files in `src/content/`, rendered at build time by `src/lib/server/markdown.ts` from the `kejser-web:svelte-static` skill.
- Styling comes from the global stylesheets in `src/lib/styles/` (see its README).

## Adding a question

- Create `src/content/faq/<slug>.md`.
  The file name is the URL slug and must be lowercase kebab-case.
- Start the file with front matter, then the question as the file's one `#` heading, then the answer in Markdown:

  ```markdown
  ---
  summary: No. Grapes and raisins can cause kidney failure in dogs.
  category: Nutrition and feeding
  references:
    - authors: Smith A. et al.
      year: 2020
      title: 'Grape and raisin toxicosis in dogs: a case series'
      journal: Journal of Examples
      doi: 10.1234/example.1
      openAccess: true
  ---

  # Can dogs eat grapes?

  The answer, in Markdown.
  ```

- The `#` heading is the question; a file with no `#` heading, or more than one, fails the build.
- `summary` and `references` are required, plus either `category` or `parent`; any other field fails the build.
- `parent` names the slug of another question, such as `which-substances-are-toxic-to-dogs`.
  The page takes its parent's category, appears under it in the breadcrumb, and is left off the front page.
  The parent must link to each of its children, and a parent cannot have a parent itself.
- Links between questions are relative `.md` paths, such as `[chocolate](is-chocolate-toxic.md)`, and `../pages/about.md` for a page; a link to a question that doesn't exist fails the build.
- The `summary` is shown in a **Short Answer** box at the top of the page.
- Every answer cites at least one peer-reviewed paper; the page shows them under **References**, linked through `https://doi.org/`.
- Each reference needs all six fields.
  `doi` is the bare DOI, not a URL.
  `openAccess` is `true` only when the paper is free to read at the publisher's page the DOI leads to.
- Quote a `title` that contains a colon.
- Check every new DOI resolves to the right paper before adding it.
- The answer body must not be empty.
- `category` is one of `Nutrition and feeding`, `Aging`, `Care`, `Breeds` or `Behavior`, defined in `src/lib/faq.ts`; the front page shows them in that order.

## Other pages

- Each file in `src/content/pages/` becomes a page at `/<slug>`, such as `/sources`.
- Its title is its one `#` heading, and its front matter has only `description`.
- Images live in `static/img/<collection>/<slug>/` and are linked by site path, such as `/img/pages/about/whisky.webp`.

## Commands

| Command           | Does                                           |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:5317/           |
| `npm run build`   | Prerender the site into `build/`               |
| `npm run preview` | Serve the built site at http://localhost:5318/ |
| `npm test`        | Unit tests                                     |
| `npm run check`   | Type check with `svelte-check`                 |
| `npm run lint`    | Prettier and ESLint                            |
