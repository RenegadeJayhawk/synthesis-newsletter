import { BookOpenText, BrainCircuit, Newspaper, Users } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/badge'

const pillars = [
  {
    title: 'Applied analysis',
    description:
      'We translate fast-moving AI releases into operational implications for teams building products, shipping models, and setting policy.',
    icon: BrainCircuit,
  },
  {
    title: 'Curated reporting',
    description:
      'Every issue focuses on the developments that materially change product strategy, research direction, or infrastructure choices.',
    icon: Newspaper,
  },
  {
    title: 'Readable format',
    description:
      'The editorial design prioritizes signal over noise with concise summaries, source context, and clear takeaways.',
    icon: BookOpenText,
  },
  {
    title: 'Operator audience',
    description:
      'The Synthesis is written for engineers, technical leaders, founders, and researchers who need to act on what they read.',
    icon: Users,
  },
]

export default function AboutPage() {
  return (
    <PageWrapper>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <Badge variant="outline">About The Synthesis</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              An AI publication built for people who have to make real decisions.
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              The Synthesis exists to help technical teams and industry observers keep pace with AI without getting buried in launch-cycle noise. We focus on what changed, why it matters, and what to watch next.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border bg-background p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Mission</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Separate durable signal from the daily flood.</h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  AI coverage tends to swing between hype and raw research dumps. The Synthesis sits in the middle: opinionated enough to tell readers what matters, rigorous enough to show the evidence behind it.
                </p>
                <p>
                  We publish article-driven analysis and weekly newsletters designed to help readers understand model shifts, infrastructure changes, regulation, and practical deployment risks.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-blue-100">Editorial approach</p>
              <div className="mt-6 space-y-5 text-blue-50">
                <p>We prioritize developments that affect strategy, adoption, governance, and execution.</p>
                <p>We avoid generic recap content and emphasize context, tradeoffs, and second-order effects.</p>
                <p>We write for readers who care about outcomes, not just announcements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">What readers can expect</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">A publication model built around clarity and utility.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon

              return (
                <div key={pillar.title} className="rounded-3xl border bg-background p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{pillar.title}</h3>
                  <p className="mt-3 text-muted-foreground">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}