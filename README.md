# TechUp Academy

<p align="center">
  <img src="public/og-image.png" alt="TechUp Academy — Master tech skills. Build your future." width="100%" />
</p>

**TechUp Academy** is a Nigerian ed-tech marketing site for free bootcamps, scholarships, and career-ready digital skills training. It helps beginners and career switchers learn practical tech through mentorship, real projects, and community.

> Empowering Nigeria’s tech talent with skills that matter in the global digital economy.

---

## Features

- **Free Bootcamp** — enrollment-focused landing page with cohort CTA and program roadmap
- **Scholarships** — eligibility, selection process, and application messaging
- **Courses catalog** — featured programs (web, UI/UX, data analytics) plus coming-soon tracks
- **About** — vision/mission, founder story, instructors, and **TiNLab** innovation hub
- **Contact** — ways to reach the team for enrollment and partnerships
- **Motion** — GSAP-powered reveals, page transitions, and scroll animations
- **SEO-ready** — metadata, sitemap, robots, Open Graph / Twitter cards, and JSON-LD

---

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — hero, value props, journey paths, featured courses, FAQ |
| `/bootcamp` | Free bootcamp overview, audience, roadmap, FAQ / CTA |
| `/scholarship` | Scholarship program, eligibility, selection process |
| `/courses` | Course catalog, learning outcomes, expanding horizons |
| `/about` | Story, team, experts, TiNLab, FAQ |
| `/contact` | Contact channels and outreach |

---

## Tech stack

- **[Next.js 16](https://nextjs.org/)** (App Router)
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Tailwind CSS 4](https://tailwindcss.com/)**
- **[GSAP](https://gsap.com/)** (`@gsap/react`) for animation
- **Montserrat** via `next/font`

---

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm (or yarn / pnpm / bun)

### Install

```bash
git clone https://github.com/Bee-code-tech/techup.git
cd techup
npm install
```

### Environment

Copy the example env file and set your public site URL (used for canonical URLs, sitemap, Open Graph, and JSON-LD):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SITE_URL=https://techupacademy.com
```

For local previews, you can use `http://localhost:3000`.

### Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project structure

```text
app/                  # App Router pages, layout, sitemap, robots, manifest
components/
  layout/             # Header, footer, container, section shell
  motion/             # Page transitions, reveal / stagger helpers
  sections/           # Page sections (home, bootcamp, scholarship, …)
  seo/                # JSON-LD helpers
  ui/                 # Buttons, badges, fields, headings, cards
lib/                  # Site copy, SEO helpers, GSAP setup
public/               # Images, favicon, og-image.png, reference designs
```

Shared content (nav, courses, FAQs, experts, page SEO) lives in `lib/site.ts`.

---

## Design & brand

- **Primary navy:** `#00206F`
- **Accent orange:** `#FB7801`
- **Accent blue (TiNLab):** `#0133A0`
- **Typography:** Montserrat

Reference mocks live under `public/reference/` for visual alignment during development.

---

## SEO & sharing

- Per-page titles, descriptions, and canonical URLs (`lib/seo.ts` + `lib/site.ts`)
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`
- Web app manifest: `/manifest.webmanifest`
- Social preview image: [`public/og-image.png`](public/og-image.png) (1200×630) for Open Graph and Twitter / X
- Structured data: EducationalOrganization, FAQPage, and Course schemas where relevant

Set `NEXT_PUBLIC_SITE_URL` to your production domain so absolute social and sitemap URLs resolve correctly.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Contact

- **Email:** [hello@techupacademy.com](mailto:hello@techupacademy.com)
- **Repository:** [Bee-code-tech/techup](https://github.com/Bee-code-tech/techup)

---

## License

Private project — all rights reserved unless otherwise stated.
