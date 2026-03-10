/**
 * Telegram Notification Library
 *
 * Sends notifications to Telegram chats via the Bot API.
 * Non-critical — failures are logged but never block the caller.
 */

import { httpClient } from '@libs/http.js';
import { logger } from '@libs/logger.js';
import { env } from '@config/env.js';
import type { OrderResponse } from '@modules/orders/orders.types.js';
import type { InquiryResponse } from '@modules/inquiries/inquiries.types.js';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getChatIds(): string[] {
  const raw = env.TELEGRAM_CHAT_IDS ?? '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function isConfigured(): boolean {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'PLACEHOLDER_REPLACE_LATER') return false;

  const chatIds = getChatIds();
  return chatIds.length > 0;
}

/**
 * Send a text message to all configured Telegram chat IDs.
 * Silently skips if Telegram is not configured.
 * Errors are logged but never thrown.
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  if (!isConfigured()) {
    logger.debug('[Telegram] Not configured — skipping notification');
    return;
  }

  const token = env.TELEGRAM_BOT_TOKEN!;
  const chatIds = getChatIds();
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

  logger.info({ chatIds }, '[Telegram] Sending notification');

  for (const chatId of chatIds) {
    try {
      await httpClient.post(url, { chat_id: chatId, text, parse_mode: 'HTML' });
      logger.info({ chatId }, '[Telegram] Message sent successfully');
    } catch (error: unknown) {
      logger.warn(
        { chatId, err: error },
        '[Telegram] Failed to send message — notification skipped',
      );
    }
  }
}

function formatTimestamp(): string {
  return new Date().toLocaleString('ru-RU', {
    timeZone: 'Asia/Tbilisi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Format an order into a Telegram notification message (HTML).
 */
export function formatOrderMessage(order: OrderResponse): string {
  const itemLines = order.items
    .map((i) => `• ${escapeHtml(i.productName)} × ${i.quantity} — ${i.unitPrice * i.quantity} ₾`)
    .join('\n');

  const now = formatTimestamp();

  const orderUrl = env.CLIENT_URL ? `${env.CLIENT_URL}/admin/orders/${order.id}` : null;
  const header = orderUrl
    ? `🛒 New Order — <a href="${orderUrl}">TechBrain.ge</a>`
    : '🛒 New Order — TechBrain.ge';

  const lines = [
    header,
    '',
    `👤 Name: ${escapeHtml(order.customerName)}`,
    `📞 Phone: ${escapeHtml(order.customerPhone)}`,
    `🌐 Language: ${order.locale}`,
    '',
    '📦 Order items:',
    itemLines,
    '',
    `💰 Total: ${order.total} ₾`,
    '',
    `🕐 ${now}`,
  ];

  return lines.join('\n');
}

/**
 * Format an inquiry into a Telegram notification message.
 */
export function formatInquiryMessage(inquiry: InquiryResponse): string {
  const now = formatTimestamp();

  return [
    '📩 New Inquiry — TechBrain.ge',
    '',
    `👤 Name: ${escapeHtml(inquiry.name)}`,
    `📞 Phone: ${escapeHtml(inquiry.phone)}`,
    `💬 Message: ${escapeHtml(inquiry.message)}`,
    `🌐 Language: ${inquiry.locale}`,
    '',
    `🕐 ${now}`,
  ].join('\n');
}
