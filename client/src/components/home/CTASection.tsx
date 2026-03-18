'use client';

import { Phone } from '@phosphor-icons/react';
import { formatPhone, getWhatsAppUrl } from '@/lib/utils/format';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { useLocale } from '@/lib/i18n';

export function CTASection(): React.ReactElement {
  const { contact } = usePublicSiteSettings();
  const { t } = useLocale();
  const phone = contact.whatsapp || contact.phone;

  return (
    <section className="cta-bg py-14 lg:py-20" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center max-w-4xl">

        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm mb-6">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-online opacity-50 motion-safe:animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-online" />
          </span>
          <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">{t('cta.badge')}</span>
        </div>

        <h2 id="cta-heading" className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {t('cta.heading')}
        </h2>

        <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('cta.description')}
        </p>

        {phone && (
          <a
            href={getWhatsAppUrl(phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-4 px-10 py-5 rounded-xl bg-white hover:bg-white/95 text-primary font-bold text-xl transition-all duration-300 motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
            aria-label={`WhatsApp — ${phone}`}
          >
            <Phone size={28} weight="fill" aria-hidden="true" />
            <span className="font-noto tabular-nums tracking-wide">{formatPhone(phone)}</span>
          </a>
        )}

        <p className="mt-4 text-sm text-white/40">{t('cta.callNow')}</p>

      </div>
    </section>
  );
}
