# Cinematic Portfolio

A high-performance personal portfolio built with Next.js 16, GSAP, Three.js, and CSS Modules. Designed to be forked and used as your own.

**Live:** [vaibhav-create.vercel.app](https://vaibhav-create.vercel.app) &nbsp;|&nbsp; **GitHub:** [VaibhavKhushalani/cinematic-portfolio](https://github.com/VaibhavKhushalani/cinematic-portfolio)

If this helped you, consider leaving a ⭐ on GitHub.

## Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 16.2 (App Router, React Compiler)        |
| Animations | GSAP 3 + Three.js                                |
| Styling    | CSS Modules + Tailwind v4 (tokens only)          |
| Icons      | react-icons                                      |
| Fonts      | Geist, Baloo 2, Dancing Script (via next/font)   |

## Getting Started

```bash
git clone https://github.com/VaibhavKhushalani/cinematic-portfolio.git
cd cinematic-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm start
```

## Making It Yours

All personal information lives in `data/profile.json`. Open that file and update the following:

| Field            | What it controls                                    |
| ---------------- | --------------------------------------------------- |
| `name`           | Your full name, shown across all sections           |
| `email`          | Contact email used in footer and CTA buttons        |
| `tagline`        | One-line professional tagline shown in the hero     |
| `description`    | Short description shown in footer and meta tags     |
| `roles`          | Your role title and detailed specializations        |
| `location`       | Country and availability (e.g. India, Worldwide)    |
| `bio`            | Long-form bio shown in the About section            |
| `stats`          | Key numbers: years of experience, projects, etc.    |
| `skills`         | Skills shown in the scrolling marquee               |
| `experience`     | Work history with company, role, bullets, and stack |
| `projects`       | Project cards with title, description, and links    |
| `publications`   | Blog posts or articles you have written             |
| `socials`        | Social profile links (GitHub, LinkedIn, etc.)       |

Website copy that is not personal data (section taglines, CTA text, footer phrases) lives in `data/content.json`. You can leave these as-is or update them to match your tone.

To update colors, open `app/globals.css` and edit the tokens under `:root`. The main ones are `--accent`, `--hero-start`, `--hero-mid`, `--hero-end`, and `--text-primary`.

Update your site URL in `lib/siteConfig.js` before deploying.

## Assets

Replace the files in `public/assets/` with your own:

| File                   | Used in                   | Description                            |
| ---------------------- | ------------------------- | -------------------------------------- |
| `about-me.mp4`         | Video Intro               | Full-screen intro video (ambient + main)|
| `hero.png`             | Hero Section              | Your portrait photo                    |
| `about.webp`           | About Section, OG Image   | Secondary photo used in about and SEO  |
| `work-experience.webp` | Work Experience           | Background image for experience section|
| `footer.png`           | Footer Section            | Image that transitions into the footer |
| `footer-mobile.webp`   | Footer Section (mobile)   | Static background image for mobile     |
| `footer-video.mp4`     | Footer Section (desktop)  | Looping background video for footer    |
| `project-*.png`        | Projects Section          | One image per project in profile.json  |

## Deployment

Connect the repository to [Vercel](https://vercel.com) and it deploys automatically with zero configuration.

Alternatively:

```bash
npm i -g vercel
vercel
```

## License

MIT. Free to fork, adapt, and use as your own portfolio.

## Author

**Vaibhav Khushalani** — Full Stack Engineer & AI Builder

[GitHub](https://github.com/VaibhavKhushalani) &nbsp;|&nbsp; [LinkedIn](https://www.linkedin.com/in/vaibhav-khushalani-760217136) &nbsp;|&nbsp; [Medium](https://medium.com/@vaibhavkhushalani) &nbsp;|&nbsp; [Instagram](https://www.instagram.com/vaibhav.create) &nbsp;|&nbsp; [YouTube](https://www.youtube.com/@vaibhav.create)
