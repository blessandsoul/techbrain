'use client';

import { Phone, MapPin, Clock, EnvelopeSimple } from '@phosphor-icons/react';

import { formatPhone, getWhatsAppUrl } from '@/lib/utils/format';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { useLocale } from '@/lib/i18n';

const socialIconClass = 'w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200';

export function ContactInfo(): React.ReactElement {
  const { t } = useLocale();
  const { contact, business, hours, social } = usePublicSiteSettings();
  const phone = contact.whatsapp || contact.phone;
  const location = [business.address.city, business.address.region].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      {/* Contact info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">{t('contact.info')}</h3>

        {phone && (
          <a
            href={getWhatsAppUrl(phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone size={18} weight="fill" className="text-primary shrink-0" />
            <span>{formatPhone(phone)}</span>
          </a>
        )}

        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <EnvelopeSimple size={18} weight="fill" className="text-primary shrink-0" />
            <span>{contact.email}</span>
          </a>
        )}

        {location && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin size={18} weight="fill" className="text-primary shrink-0" />
            <span>{location}</span>
          </div>
        )}

        {/* Social links */}
        {(social.facebook || social.instagram || social.tiktok) && (
          <div className="pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialIconClass}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialIconClass}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={socialIconClass}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.76 1.5V6.8a4.83 4.83 0 0 1-1-.11z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Business hours */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Clock size={18} weight="fill" className="text-primary" />
          {t('contact.hours')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('contact.weekdays')}</span>
            <span className="text-foreground font-medium">{hours.weekdays.open} — {hours.weekdays.close}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('contact.sunday')}</span>
            <span className="text-foreground font-medium">{hours.sunday.open} — {hours.sunday.close}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
