import type { Metadata } from 'next'
import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service governing the use of The Synthesis website and newsletters.',
}

const lastUpdated = 'May 25, 2026'

export default function TermsPage() {
  return (
    <PageWrapper>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-5">
            <Badge variant="outline">Terms of Service</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms for using The Synthesis</h1>
            <p className="text-lg text-muted-foreground">
              These terms govern access to and use of this website, newsletter content, and related services.
            </p>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose max-w-4xl dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By using this site, you agree to these terms. If you do not agree, do not use the service.
            </p>

            <h2>2. Use of Content</h2>
            <p>
              Content is provided for informational purposes. You may read and share links to published articles, but you may not republish substantial portions without permission.
            </p>

            <h2>3. User Submissions</h2>
            <p>
              If you submit information through contact or subscription forms, you confirm you are authorized to provide it and that it does not violate applicable law.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to misuse the service, including attempts to:</p>
            <ul>
              <li>Disrupt, overload, or probe system security</li>
              <li>Scrape or mirror content in violation of law</li>
              <li>Use the service for unlawful or fraudulent activity</li>
            </ul>

            <h2>5. Availability and Changes</h2>
            <p>
              We may update, suspend, or discontinue parts of the service at any time. Features and content may change without notice.
            </p>

            <h2>6. Disclaimers</h2>
            <p>
              The service is provided on an as-is basis. We make no warranties regarding completeness, accuracy, or uninterrupted availability.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, The Synthesis is not liable for indirect, incidental, special, or consequential damages arising from use of the service.
            </p>

            <h2>8. Governing Law</h2>
            <p>
              These terms are governed by applicable local law based on the operating entity and jurisdiction.
            </p>

            <h2>9. Contact</h2>
            <p>
              For legal or policy inquiries, contact us via <Link href="/contact">/contact</Link>.
            </p>
          </article>
        </div>
      </section>
    </PageWrapper>
  )
}
