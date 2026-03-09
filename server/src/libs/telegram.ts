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
      await httpClient.post(url, { chat_id: chatId, text });
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

/**
 * Format an order into a Telegram notification message.
 */
export function formatOrderMessage(order: OrderResponse): string {
  const itemLines = order.items
    .map((i) => `• ${i.productName} × ${i.quantity} — ${i.unitPrice * i.quantity} ₾`)
    .join('\n');

  const now = formatTimestamp();

  return [
    '🛒 New Order — TechBrain.ge',
    '',
    `👤 Name: ${order.customerName}`,
    `📞 Phone: ${order.customerPhone}`,
    `🌐 Language: ${order.locale}`,
    '',
    '📦 Order items:',
    itemLines,
    '',
    `💰 Total: ${order.total} ₾`,
    '',
    `🕐 ${now}`,
  ].join('\n');
}

/**
 * Format an inquiry into a Telegram notification message.
 */
export function formatInquiryMessage(inquiry: InquiryResponse): string {
  const now = formatTimestamp();

  return [
    '📩 New Inquiry — TechBrain.ge',
    '',
    `👤 Name: ${inquiry.name}`,
    `📞 Phone: ${inquiry.phone}`,
    `💬 Message: ${inquiry.message}`,
    `🌐 Language: ${inquiry.locale}`,
    '',
    `🕐 ${now}`,
  ].join('\n');
}
