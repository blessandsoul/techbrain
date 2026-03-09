'use client';

import { ContactForm } from '@/features/contact/components/ContactForm';
import { ContactInfo } from '@/features/contact/components/ContactInfo';
import { useLocale } from '@/lib/i18n';

export default function ContactPage(): React.ReactElement {
  const { t } = useLocale();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('contact.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('contact.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
