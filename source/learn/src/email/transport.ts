/**
 * Email transports. `capture` writes an RFC 5322 preview file and never sends;
 * `smtp` sends through nodemailer and is selected only when live sending is
 * explicitly authorized in configuration.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import nodemailer from 'nodemailer'

/** One rendered message. */
export interface EmailMessage {
  readonly from: string
  readonly to: string
  readonly subject: string
  readonly text: string
  readonly html: string
  /** Stable Message-ID derived from the job, so duplicate deliveries are detectable. */
  readonly messageId: string
  readonly headers: Readonly<Record<string, string>>
}

/** Delivery facts returned by a transport. */
export interface EmailReceipt {
  readonly messageId: string
  readonly previewPath?: string
}

/** One email transport. */
export interface EmailTransport {
  readonly kind: 'capture' | 'smtp'
  /**
   * Deliver or capture one message.
   * @param message - rendered message.
   * @returns delivery facts; throws on failure.
   */
  send(message: EmailMessage): Promise<EmailReceipt>
}

function header(value: string): string {
  return value.replace(/[\r\n]+/g, ' ')
}

/** Development transport: writes `<id>.eml` and `<id>.html` and sends nothing. */
export class CaptureTransport implements EmailTransport {
  readonly kind = 'capture'
  constructor(private readonly directory: string) {}

  async send(message: EmailMessage): Promise<EmailReceipt> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const name = message.messageId.replace(/[^A-Za-z0-9._-]/g, '_')
    const boundary = `dsh-learn-${name}`
    const eml = [
      `From: ${header(message.from)}`,
      `To: ${header(message.to)}`,
      `Subject: ${header(message.subject)}`,
      `Message-ID: ${message.messageId}`,
      ...Object.entries(message.headers).map(([key, value]) => `${key}: ${header(value)}`),
      'X-DSH-Learn-Transport: capture (not sent)',
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      message.text,
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      message.html,
      `--${boundary}--`,
      '',
    ].join('\r\n')
    const path = join(this.directory, `${name}.eml`)
    await writeFile(path, eml, { mode: 0o600 })
    await writeFile(join(this.directory, `${name}.html`), message.html, { mode: 0o600 })
    return { messageId: message.messageId, previewPath: path }
  }
}

/** SMTP options resolved at send time. */
export interface SmtpOptions {
  readonly host: string
  readonly port: number
  readonly secure: boolean
  readonly user: string
  /** Resolves the password from the credentials service for each send. */
  readonly password: () => Promise<string | undefined>
}

/** Live SMTP transport through nodemailer. */
export class SmtpTransport implements EmailTransport {
  readonly kind = 'smtp'
  constructor(private readonly options: SmtpOptions) {}

  async send(message: EmailMessage): Promise<EmailReceipt> {
    const password = await this.options.password()
    const transporter = nodemailer.createTransport({
      host: this.options.host,
      port: this.options.port,
      secure: this.options.secure,
      requireTLS: !this.options.secure,
      ...this.options.user === '' ? {} : { auth: { user: this.options.user, pass: password ?? '' } },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    })
    try {
      const info = await transporter.sendMail({
        from: message.from, to: message.to, subject: message.subject, text: message.text, html: message.html,
        messageId: message.messageId, headers: { ...message.headers },
      }) as { messageId?: string }
      return { messageId: info.messageId ?? message.messageId }
    } finally {
      transporter.close()
    }
  }
}
