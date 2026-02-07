This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment (Vercel)

This app is deployed on [Vercel](https://vercel.com). To deploy or update:

1. **Connect the repo**  
   In the [Vercel dashboard](https://vercel.com/new), import the GitHub repo. Set the **Framework Preset** to **Next.js**.

2. **Root directory**  
   If the repo root contains multiple folders, set **Root Directory** to `jessica-frontend`.

3. **Environment variables**  
   In the project **Settings → Environment Variables**, add:
   - `ZO_API_KEY` — Your Zo Computer API key
   - `ZO_API_URL` — `https://api.zo.computer/zo/ask`  
   Enable for Production (and Preview if you want). Save and **Redeploy** so new variables take effect.

4. **Redeploy**  
   After changing env vars or root directory: **Deployments** → ⋮ on the latest deployment → **Redeploy**.

The chat API route (`/api/chat`) uses these variables server-side; they are not exposed to the client.
