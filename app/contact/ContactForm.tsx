'use client'

import { FormEvent, useState } from 'react'
import { Mail, MessageSquareText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FormState = {
  name: string
  email: string
  topic: string
  message: string
}

type SubmissionState =
  | { status: 'idle'; message: string | null }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

const initialFormState: FormState = {
  name: '',
  email: '',
  topic: '',
  message: '',
}

function validateForm(form: FormState) {
  if (!form.name.trim()) {
    return 'Please enter your name.'
  }

  if (!form.email.trim()) {
    return 'Please enter your email address.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return 'Please enter a valid email address.'
  }

  if (!form.message.trim()) {
    return 'Please enter a message.'
  }

  if (form.message.trim().length < 20) {
    return 'Please provide a little more detail so we can help.'
  }

  return null
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle', message: null })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm(form)
    if (validationError) {
      setSubmission({ status: 'error', message: validationError })
      return
    }

    try {
      setSubmitting(true)
      setSubmission({ status: 'idle', message: null })

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = (await response.json()) as { success: boolean; message?: string; error?: string }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'We could not send your message. Please try again.')
      }

      setForm(initialFormState)
      setSubmission({
        status: 'success',
        message: data.message || 'Message received. We will follow up shortly.',
      })
    } catch (error) {
      setSubmission({
        status: 'error',
        message: error instanceof Error ? error.message : 'We could not send your message. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div className="space-y-6 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-sm">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-blue-100">Editorial contact</p>
          <h2 className="text-3xl font-semibold tracking-tight">Tell us what you are building, reading, or trying to understand.</h2>
        </div>
        <p className="text-blue-50">
          Use the form for editorial feedback, partnership inquiries, corrections, or requests for deeper coverage.
        </p>
        <div className="space-y-4 text-sm text-blue-50">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4" />
            <span>Response target: within two business days.</span>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-0.5 h-4 w-4" />
            <span>Best for story suggestions, newsletter feedback, and product questions.</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border bg-background p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="contact-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="contact-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label htmlFor="contact-topic" className="text-sm font-medium">
            Topic
          </label>
          <Input
            id="contact-topic"
            value={form.topic}
            onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
            placeholder="Story idea, partnership, correction, or question"
          />
        </div>

        <div className="mt-6 space-y-2">
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            placeholder="Share the context, what you need, and any timing details."
            className="min-h-40 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {submission.message ? (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              submission.status === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
            }`}
            role={submission.status === 'error' ? 'alert' : 'status'}
          >
            {submission.message}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">By submitting, you agree that we may reply to this inquiry by email.</p>
          <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {submitting ? 'Sending...' : 'Send message'}
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}