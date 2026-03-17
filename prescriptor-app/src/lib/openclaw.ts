/**
 * OpenClaw WhatsApp API Integration
 * OpenClaw is deployed locally — update OPENCLAW_API_URL in .env.local
 */

const OPENCLAW_URL = process.env.OPENCLAW_API_URL ?? 'http://localhost:3000'
const OPENCLAW_KEY = process.env.OPENCLAW_API_KEY ?? ''

export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Format a phone number for WhatsApp (international format, no +)
 * e.g. "+27831234567" → "27831234567@c.us"
 */
export function formatWhatsAppId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // If number starts with 0, assume South African and replace with 27
  const normalized = digits.startsWith('0') ? `27${digits.slice(1)}` : digits
  return `${normalized}@c.us`
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<SendMessageResult> {
  try {
    const chatId = formatWhatsAppId(phone)

    const response = await fetch(`${OPENCLAW_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OPENCLAW_KEY ? { Authorization: `Bearer ${OPENCLAW_KEY}` } : {}),
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `OpenClaw error ${response.status}: ${text}` }
    }

    const data = await response.json()
    return { success: true, messageId: data?.id ?? data?.messageId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error contacting OpenClaw',
    }
  }
}

export async function sendBulkWhatsApp(
  recipients: { phone: string; message: string }[]
): Promise<SendMessageResult[]> {
  return Promise.all(recipients.map(({ phone, message }) => sendWhatsAppMessage(phone, message)))
}
