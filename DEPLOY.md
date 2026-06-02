# Deploy to Vercel

## Quick deploy

1. Push this folder to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Leave **Framework Preset** as **Other** (static site).
4. Click **Deploy**.

Your site will be live at `https://your-project.vercel.app`.

## After deploy

1. **Custom domain** (optional): Vercel → Project → Settings → Domains.
2. **Update URLs** when you have a final domain:
   - `site.config.json` → `url`
   - `sitemap.xml` → every `<loc>`
   - `robots.txt` → `Sitemap:` line
3. **Contact form**: First submission may require activating FormSubmit via the email sent to `shalomcee002@gmail.com`.  
   Optional: add `RESEND_API_KEY` in Vercel → Settings → Environment Variables for Resend instead of FormSubmit.

## Local preview (Vercel CLI)

```bash
npm i -g vercel
vercel dev
```

## Local preview (PHP contact only)

```bash
php -S localhost:8000
```

Use `data-contact-endpoint="contact-handler.php"` on the form for local PHP mail testing.

## Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel routing, HTTPS redirects, security headers |
| `.htaccess` | Apache hosts only (ignored on Vercel) |
| `robots.txt` | Search engine crawling rules |
| `sitemap.xml` | SEO page list |
| `api/contact.js` | Contact form on Vercel (FormSubmit / Resend) |
