


# The Synthesis - AI Newsletter Website

This is the repository for "The Synthesis," a high-end AI newsletter website built with Next.js 15. The project focuses on delivering a premium digital magazine experience with a sophisticated design, rich media, and advanced animations.

## Features

- **Modern Tech Stack:** Built with Next.js 15, TypeScript, and Tailwind CSS.
- **Advanced Animations:** Smooth page transitions and interactive elements using Framer Motion.
- **Generative Art:** Dynamic 3D background animations with React Three Fiber.
- **Content-Focused Design:** A clean, professional layout that prioritizes readability and user experience.
- **Responsive Design:** Fully responsive and optimized for all screen sizes, from mobile to desktop.
- **SEO Optimized:** Comprehensive SEO and metadata for better search engine visibility.
- **Production-Ready:** Optimized for performance with a production-ready build.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- **Deployment:** Static export, deployable on any static hosting provider.

## Project Structure

```
/synthesis-newsletter
├── app/                      # Next.js App Router
│   ├── [slug]/page.tsx       # Dynamic article page
│   ├── archive/page.tsx      # Archive page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/               # Reusable components
│   ├── article/              # Article-related components
│   ├── generative/           # Generative art components
│   ├── layout/               # Layout components (Header, Footer)
│   └── ui/                   # UI components (buttons, etc.)
├── lib/                      # Library files
│   ├── analytics.ts          # Analytics and performance tracking
│   ├── data.ts               # Mock data for articles
│   └── metadata.ts           # SEO and metadata configuration
├── animations/               # Framer Motion animation variants
├── public/                   # Static assets (images, fonts)
├── next.config.js            # Next.js configuration
└── README.md                 # This file
```

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd synthesis-newsletter
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will create a static export in the `out` directory, which can be deployed to any static hosting service.

## Deployment

The website is deployed as a static site. You can use any static hosting provider like Vercel, Netlify, or GitHub Pages.

## License

This project is licensed under the MIT License.

