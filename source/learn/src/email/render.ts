/** Reminder email rendering. Messages never contain learner code, solutions, or hidden tests. */
import type { LearnLocale, Localized } from '../types.ts'

/** Rendered body parts. */
export interface RenderedEmail {
  readonly subject: string
  readonly text: string
  readonly html: string
}

function escape(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function page(title: string, paragraphs: readonly string[], link: { href: string; label: string } | undefined,
  footer: readonly string[]): string {
  return [
    '<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#262626;max-width:560px;margin:24px auto;line-height:1.55">',
    `<h2 style="font-size:18px;margin:0 0 12px">${escape(title)}</h2>`,
    ...paragraphs.map(item => `<p style="margin:0 0 12px">${escape(item)}</p>`),
    link === undefined ? '' : `<p><a href="${escape(link.href)}" style="display:inline-block;background:#262626;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none">${escape(link.label)}</a></p>`,
    '<hr style="border:0;border-top:1px solid #e5e5e5;margin:20px 0">',
    ...footer.map(item => `<p style="font-size:12px;color:#8c8c8c;margin:0 0 6px">${escape(item)}</p>`),
    '</body></html>',
  ].join('')
}

/** One due topic line in a digest. */
export interface DigestTopic {
  readonly title: Localized
  readonly count: number
}

/**
 * Daily due-review digest.
 * @param locale - learner locale.
 * @param localDate - learner-local date of the digest.
 * @param due - due count within today's limit.
 * @param minutes - estimated minutes.
 * @param topics - due topics.
 * @param links - deep link and unsubscribe link, when a base URL is known.
 * @returns rendered message.
 */
export function renderDigest(locale: LearnLocale, localDate: string, due: number, minutes: number, topics: readonly DigestTopic[],
  links: { review?: string; unsubscribe?: string }): RenderedEmail {
  const zh = locale === 'zh'
  const subject = zh ? `今日有 ${String(due)} 个概念复习（${localDate}）` : `${String(due)} concept review${due === 1 ? '' : 's'} due today (${localDate})`
  const intro = zh ? `今天有 ${String(due)} 个复习待完成，预计约 ${String(minutes)} 分钟。每个复习都是一道新的变体题，用来检验你能否迁移学过的思路。` : `You have ${String(due)} review${due === 1 ? '' : 's'} today, about ${String(minutes)} minutes. Each review is a new variant that checks whether the idea transfers.`
  const lines = topics.map(topic => `• ${topic.title[locale]}: ${String(topic.count)}`)
  const footer = [
    zh ? '你收到这封邮件是因为在 DSH Learn 中开启了复习提醒。可以在 Learn 设置里暂停或关闭。' : 'You receive this because review reminders are enabled in DSH Learn. Pause or turn them off in Learn settings.',
    ...links.unsubscribe === undefined ? [] : [zh ? `退订：${links.unsubscribe}` : `Unsubscribe: ${links.unsubscribe}`],
  ]
  const link = links.review === undefined ? undefined : { href: links.review, label: zh ? '开始复习' : 'Start reviewing' }
  return {
    subject,
    text: [intro, '', ...lines, '', ...link === undefined ? [] : [`${link.label}: ${link.href}`, ''], ...footer].join('\n'),
    html: page(subject, [intro, ...lines], link, footer),
  }
}

/**
 * Address verification message.
 * @param locale - learner locale.
 * @param code - six-digit code.
 * @param ttlMinutes - code lifetime.
 * @param verifyUrl - one-click link, when a base URL is known.
 * @returns rendered message.
 */
export function renderVerification(locale: LearnLocale, code: string, ttlMinutes: number, verifyUrl: string | undefined): RenderedEmail {
  const zh = locale === 'zh'
  const subject = zh ? 'DSH Learn 邮箱验证码' : 'Your DSH Learn verification code'
  const body = zh ? `你的验证码是 ${code}，${String(ttlMinutes)} 分钟内有效。在 Learn 设置中输入它即可绑定此邮箱用于复习提醒。` : `Your verification code is ${code}. It expires in ${String(ttlMinutes)} minutes. Enter it in Learn settings to use this address for review reminders.`
  const ignore = zh ? '如果不是你本人操作，请忽略这封邮件。' : 'If you did not request this, ignore this email.'
  const link = verifyUrl === undefined ? undefined : { href: verifyUrl, label: zh ? '一键验证' : 'Verify address' }
  return {
    subject,
    text: [body, ...link === undefined ? [] : ['', `${link.label}: ${link.href}`], '', ignore].join('\n'),
    html: page(subject, [body], link, [ignore]),
  }
}

/**
 * User-triggered test message.
 * @param locale - learner locale.
 * @param transport - transport label shown in the message.
 * @returns rendered message.
 */
export function renderTest(locale: LearnLocale, transport: string): RenderedEmail {
  const zh = locale === 'zh'
  const subject = zh ? 'DSH Learn 测试邮件' : 'DSH Learn test email'
  const body = zh ? `这是一封测试邮件，说明提醒通道（${transport}）工作正常。` : `This test email confirms the reminder channel (${transport}) works.`
  return { subject, text: body, html: page(subject, [body], undefined, []) }
}
