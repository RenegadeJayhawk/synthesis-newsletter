# The Synthesis - AI & GenAI Weekly Newsletter

A high-end AI newsletter website built with Next.js 15, featuring AI-powered newsletter generation tailored for Hyundai Capital America, Hyundai Motor Group, and Boston Dynamics.

## 🚀 Features

### Frontend
- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Advanced Animations**: Framer Motion, GSAP, React Three Fiber
- **Generative Art**: Dynamic 3D background animations
- **Responsive Design**: Fully optimized for all screen sizes
- **Dark Mode**: Theme switching with next-themes
- **SEO Optimized**: Comprehensive metadata and Open Graph tags

### Backend (NEW!)
- **AI Newsletter Generation**: Powered by Google Gemini 2.0 Flash
- **Serverless API Routes**: Vercel-compatible Next.js API routes
- **Structured Prompts**: Customizable newsletter generation templates
- **7-Day Lookback**: Automatic date range calculation
- **Database Ready**: Modular design for easy database integration

## 🏃 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/RenegadeJayhawk/synthesis-newsletter.git
cd synthesis-newsletter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

Visit [http://localhost:3000/newsletter](http://localhost:3000/newsletter) to generate AI newsletters.

## 🚀 Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variable: `OPENAI_API_KEY`
5. Click "Deploy"

**For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🔐 Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

## 🤖 Newsletter Generation

The AI generates comprehensive weekly newsletters covering:
- Major AI breakthroughs & research
- New applications & use cases
- Industry news & market trends
- Ethical considerations
- Open source developments
- Emerging trends
- Automotive finance, HCA, HMG, and Boston Dynamics focus

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Shadcn/ui
- **Animations**: Framer Motion, GSAP, React Three Fi- **AI Model**: Google Gemini 2.0 Flash **Deployment**: Vercel

## 📄 License

MIT License

---

**Built for Hyundai Capital America** | [Deployment Guide](./DEPLOYMENT_GUIDE.md)
