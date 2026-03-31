# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Vercel app with one static frontend and one serverless API route.

- `index.html`: single-page UI entry point.
- `script.js`: browser logic that calls `/api/news` and renders links.
- `api/news.js`: Vercel serverless function that fetches and parses the RSS feed.
- `.vercel/`: local Vercel linkage metadata. Treat it as environment-specific; do not expand it with app logic.

Keep new frontend assets at the repository root unless a larger feature justifies creating folders such as `styles/` or `assets/`.

## Build, Test, and Development Commands
There is no package-based build pipeline in this repo today. Use Vercel for local development because the app depends on the `/api/news` route.

- `vercel dev`: runs the static page and `api/news.js` locally.
- `vercel deploy`: deploys the current state to Vercel.
- `git status`: confirm only intended files are included before committing.

If you only need to inspect static HTML changes, opening `index.html` directly is acceptable, but API behavior will not work without Vercel.

## Coding Style & Naming Conventions
Use plain JavaScript and keep the code simple.

- Use 2-space indentation in HTML and JavaScript.
- Prefer `const` by default; use `let` only when reassignment is required.
- Use descriptive camelCase names such as `loadNews`, `rssUrl`, and `newsList`.
- Keep API handlers small and focused on one responsibility.

Match the existing style in [`script.js`](C:\Users\kisar\Documents\git\rss-news-app\script.js) and [`api/news.js`](C:\Users\kisar\Documents\git\rss-news-app\api\news.js) when editing.

## Testing Guidelines
There is no automated test suite yet. Validate changes manually with `vercel dev`.

- Confirm `/api/news` returns JSON in the browser or devtools network tab.
- Confirm the page renders article titles and links.
- Re-test after changing RSS parsing logic, feed URLs, or DOM updates.

## Commit & Pull Request Guidelines
Recent commits use short, direct messages, including Japanese summaries such as `url変更`. Continue using concise, action-oriented commit subjects.

- Keep commit titles short and specific to one change.
- In pull requests, include a brief description, note the feed or UI behavior changed, and attach a screenshot if `index.html` output changed.
- Link related issues when applicable and mention any manual verification performed.
