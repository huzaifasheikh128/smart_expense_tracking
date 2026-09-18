# Ledger — Daily Expense Tracker

A small, self-contained expense tracker. No backend, no build step — just three files (HTML, CSS, JS). Everything you record is saved in your own browser's local storage, so it stays private to your device.

## Features

- Add income or expense entries with a date, description, category, and amount
- Monthly view with a running balance, total in / total out
- A breakdown of spending by category
- Export any month's entries to CSV
- Editable currency symbol
- Works on mobile

## Running it locally

Since it's plain HTML/CSS/JS, you don't need to install anything. Just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Putting it on GitHub

```bash
git init
git add .
git commit -m "Initial commit: expense ledger"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Replace `<your-username>` and `<repo-name>` with your own. Create the empty repository on GitHub first (no README/license needed, since you already have one here).

## Deploying on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New → Project**.
3. Select the repository you just pushed.
4. Vercel will detect it as a static site — leave the build command and output directory blank (there's nothing to build).
5. Click **Deploy**.

That's it. Vercel gives you a live URL immediately, and every future push to `main` redeploys automatically.

## A note on data

Entries are stored with `localStorage`, scoped to the browser and domain you're using. That means:
- Data won't sync between your phone and your laptop.
- Clearing your browser's site data will erase your entries.
- Nothing is sent to any server — this is intentional, to keep it simple and private.

If you later want your data to follow you across devices, the natural next step is adding a small backend (like Supabase or a serverless API route) to store entries in a real database instead of `localStorage`. Happy to help with that when you're ready.
