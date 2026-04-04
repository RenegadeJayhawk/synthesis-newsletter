'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function TriggerAgent() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  async function handleTrigger() {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN || 'dev'}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger agent')
      }

      setMessage({
        type: 'success',
        text: `Newsletter generated successfully! ID: ${data.newsletterId}`,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Newsletter Generation</CardTitle>
        <CardDescription>
          Manually run the agent to generate a new newsletter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTrigger}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate Newsletter'}
        </Button>

        {message && (
          <div
            className={`p-4 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
