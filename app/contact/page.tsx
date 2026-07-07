import type { Metadata } from 'next'
import PageWrapper from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/badge'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Reach out to the team at The Synthesis. Send us inquiries, feedback, article suggestions, or newsletter subscription questions.',
}

interface ContactPageProps {
  searchParams: Promise<{
    topic?: string
    email?: string
  }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams

  return (
    <PageWrapper>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <Badge variant="outline">Contact</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Reach the editorial team behind The Synthesis.
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              We review reader feedback, partnership opportunities, corrections, and requests for coverage. Use the form below and include as much context as possible.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm initialTopic={params.topic} initialEmail={params.email} />
        </div>
      </section>
    </PageWrapper>
  )
}