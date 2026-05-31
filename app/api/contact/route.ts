import { NextResponse } from 'next/server'
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity'

type ContactPayload = {
  name?: string
  email?: string
  topic?: string
  message?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'contact-submit',
    limit: 8,
    windowMs: 60_000,
  })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const requestId = createRequestId()

  try {
    const payload = (await request.json()) as ContactPayload

    const name = payload.name?.trim() || ''
    const email = payload.email?.trim() || ''
    const topic = payload.topic?.trim() || ''
    const message = payload.message?.trim() || ''

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 })
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 })
    }

    if (!message || message.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Please provide a message with at least 20 characters.' },
        { status: 400 }
      )
    }

    console.log('[Contact] Submission received', {
      requestId,
      hasName: Boolean(name),
      emailDomain: email.includes('@') ? email.split('@')[1] : 'unknown',
      topic,
      messageLength: message.length,
      receivedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Thanks for reaching out. The editorial team will review your note and reply if needed.',
    })
  } catch (error) {
    console.error(`[${requestId}] [Contact] Failed to process submission`, error)

    return NextResponse.json(
      {
        success: false,
        error: 'We could not process your message. Please try again.',
        requestId,
      },
      { status: 500 }
    )
  }
}