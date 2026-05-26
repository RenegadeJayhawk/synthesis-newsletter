import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/badge'

const lastUpdated = 'May 25, 2026'

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-5">
            <Badge variant="outline">Privacy Policy</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How The Synthesis handles data</h1>
            <p className="text-lg text-muted-foreground">
              This policy describes what we collect, why we collect it, and how we protect reader and subscriber information.
            </p>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose max-w-4xl dark:prose-invert">
            <h2>1. Information We Collect</h2>
            <p>
              We may collect contact details you submit through forms, newsletter preferences, and technical usage data such as browser type, pages visited, and request timestamps.
            </p>

            <h2>2. How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Deliver newsletter and editorial updates</li>
              <li>Respond to support, feedback, and contact requests</li>
              <li>Improve site quality, performance, and security</li>
              <li>Investigate abuse and protect the service</li>
            </ul>

            <h2>3. Legal Basis and Consent</h2>
            <p>
              For subscription and contact forms, processing is based on consent or legitimate interest in responding to user inquiries and operating the service.
            </p>

            <h2>4. Data Retention</h2>
            <p>
              We retain data only as long as necessary for the purpose collected, legal obligations, and service integrity. You can request deletion of personal information by contacting us.
            </p>

            <h2>5. Data Sharing</h2>
            <p>
              We do not sell personal information. We may share data with infrastructure and analytics providers strictly to run and secure the service.
            </p>

            <h2>6. Security</h2>
            <p>
              We use reasonable technical and organizational controls to reduce unauthorized access, disclosure, or alteration of data.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may request access, correction, deletion, or restriction of processing. Contact us through the site contact page for any request.
            </p>

            <h2>8. Policy Updates</h2>
            <p>
              We may update this policy to reflect legal, operational, or product changes. Updates will be posted on this page with a revised date.
            </p>

            <h2>9. Contact</h2>
            <p>
              Questions about this policy can be submitted through the contact form at <Link href="/contact">/contact</Link>.
            </p>
          </article>
        </div>
      </section>
    </PageWrapper>
  )
}
