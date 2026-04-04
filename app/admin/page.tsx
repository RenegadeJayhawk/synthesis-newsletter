import { TriggerAgent } from '@/components/admin/TriggerAgent'
import { RunHistory } from '@/components/admin/RunHistory'
import { PageWrapper } from '@/components/layout/PageWrapper'

export const metadata = {
  title: 'Agent Admin Dashboard',
  description: 'Manage AI agent runs and newsletter generation',
}

export default function AdminPage() {
  return (
    <PageWrapper>
      <div className="py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Agent Dashboard</h1>
            <p className="text-muted-foreground">
              Manage AI newsletter generation and view execution history
            </p>
          </div>

          <div className="space-y-8">
            <TriggerAgent />
            <RunHistory />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
