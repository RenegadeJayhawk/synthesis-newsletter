'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AgentRun {
  id: string
  status: 'pending' | 'completed' | 'failed'
  input: Record<string, any>
  output: Record<string, any> | null
  error: string | null
  created_at: string
  completed_at: string | null
}

export function RunHistory() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null)

  useEffect(() => {
    fetchRuns()
  }, [])

  async function fetchRuns() {
    try {
      setLoading(true)
      const response = await fetch('/api/agent/runs')
      if (!response.ok) throw new Error('Failed to fetch runs')
      const data = await response.json()
      setRuns(data)
    } catch (error) {
      console.error('Error fetching runs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return <div className="text-center py-8">Loading run history...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
          <CardDescription>
            View all agent executions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No runs yet. Trigger your first run to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4 font-semibold">Date</th>
                    <th className="text-left py-2 px-4 font-semibold">Status</th>
                    <th className="text-left py-2 px-4 font-semibold">Output</th>
                    <th className="text-left py-2 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b hover:bg-accent/50">
                      <td className="py-2 px-4">
                        {formatDate(run.created_at)}
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={getStatusVariant(run.status)}>
                          {run.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-xs">
                        {run.status === 'completed' && run.output ? (
                          <span className="text-muted-foreground">
                            {run.output.articles_count} articles
                          </span>
                        ) : run.error ? (
                          <span className="text-red-600 dark:text-red-400">
                            Error
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRun(run)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRun && (
        <Card>
          <CardHeader>
            <CardTitle>Run Details</CardTitle>
            <Button
              variant="ghost"
              className="absolute right-6 top-6"
              onClick={() => setSelectedRun(null)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge variant={getStatusVariant(selectedRun.status)}>
                {selectedRun.status}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Created At</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedRun.created_at)}
              </p>
            </div>
            {selectedRun.completed_at && (
              <div>
                <h3 className="font-semibold mb-2">Completed At</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedRun.completed_at)}
                </p>
              </div>
            )}
            {selectedRun.output && (
              <div>
                <h3 className="font-semibold mb-2">Output</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedRun.output, null, 2)}
                </pre>
              </div>
            )}
            {selectedRun.error && (
              <div>
                <h3 className="font-semibold mb-2">Error</h3>
                <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-xs text-red-600 dark:text-red-400 overflow-auto max-h-48">
                  {selectedRun.error}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
