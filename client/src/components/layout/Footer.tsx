'use client';

import { Logo } from './Logo';
import { formatPhone } from '@/lib/utils/format';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { useLocale } from '@/lib/i18n';

const socialIconClass = 'w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer';

export const Footer = (): React.ReactElement => {
  const { contact, social, business } = usePublicSiteSettings();
  const { t } = useLocale();
  const phone = contact.whatsapp || contact.phone;
  const companyName = business.companyName || 'TechBrain';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-surface mt-auto">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo height={52} />
            </div>
            <div className="flex items-center gap-3">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={socialIconClass}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={socialIconClass}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              {social.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className={socialIconClass}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.76 1.5V6.8a4.83 4.83 0 0 1-1-.11z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="md:text-right">
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">{t('footer.contact')}</h3>
            {phone && (
              <a
                href={`https://wa.me/995${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors duration-200 cursor-pointer group md:flex-row-reverse"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <span className="font-bold text-lg tabular-nums group-hover:underline">{formatPhone(phone)}</span>
              </a>
            )}
          </div>

        </div>

        <div className="border-t border-border/60 pt-8 text-center">
          <p className="text-sm text-subtle">&copy; {year} {companyName}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};
