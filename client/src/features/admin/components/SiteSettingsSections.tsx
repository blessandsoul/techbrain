'use client';

import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { SiteSettingsData } from '../types/site-settings.types';

export interface SectionProps {
  settings: SiteSettingsData;
  update: <K extends keyof SiteSettingsData>(section: K, data: Partial<SiteSettingsData[K]>) => void;
}

const labelClass = 'text-xs text-muted-foreground';
const sectionTitleClass = 'text-xs font-medium text-foreground uppercase tracking-wider';

export function ContactSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>კონტაქტი <InfoTooltip text="საკონტაქტო ინფორმაცია — გამოჩნდება საიტის ქვედა ნაწილში და საკონტაქტო გვერდზე" /></span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div>
          <Label className={labelClass}>ტელეფონი <InfoTooltip text="ძირითადი ტელეფონის ნომერი" /></Label>
          <Input value={settings.contact.phone} onChange={(e) => update('contact', { phone: e.target.value })} placeholder="597470518" />
        </div>
        <div>
          <Label className={labelClass}>WhatsApp <InfoTooltip text="WhatsApp ნომერი — თუ ტელეფონის ნომრისგან განსხვავებულია" /></Label>
          <Input value={settings.contact.whatsapp} onChange={(e) => update('contact', { whatsapp: e.target.value })} placeholder="ტელეფონის იდენტური" />
        </div>
        <div>
          <Label className={labelClass}>ელ.ფოსტა <InfoTooltip text="ელ.ფოსტა — გამოჩნდება საიტზე კლიენტებისთვის" /></Label>
          <Input type="email" value={settings.contact.email} onChange={(e) => update('contact', { email: e.target.value })} placeholder="info@techbrain.ge" />
        </div>
      </div>
    </div>
  );
}

export function BusinessSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>ბიზნესი <InfoTooltip text="კომპანიის ინფორმაცია — გამოიყენება SEO-სთვის და Google Maps-ზე" /></span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div className="col-span-3">
          <Label className={labelClass}>კომპანიის სახელი <InfoTooltip text="კომპანიის ოფიციალური სახელი" /></Label>
          <Input value={settings.business.companyName} onChange={(e) => update('business', { companyName: e.target.value })} />
        </div>
        <div>
          <Label className={labelClass}>ქალაქი <InfoTooltip text="ქალაქი სადაც მდებარეობს ოფისი" /></Label>
          <Input value={settings.business.address.city} onChange={(e) => update('business', { address: { ...settings.business.address, city: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>რეგიონი <InfoTooltip text="რეგიონი / მხარე" /></Label>
          <Input value={settings.business.address.region} onChange={(e) => update('business', { address: { ...settings.business.address, region: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>ქვეყნის კოდი <InfoTooltip text="ქვეყნის ISO კოდი, მაგ: GE (საქართველო)" /></Label>
          <Input value={settings.business.address.country} onChange={(e) => update('business', { address: { ...settings.business.address, country: e.target.value } })} placeholder="GE" />
        </div>
        <div>
          <Label className={labelClass}>განედი <InfoTooltip text="განედი — Google Maps-ის კოორდინატები ოფისის ადგილმდებარეობისთვის" /></Label>
          <Input type="number" step="0.0001" value={settings.business.geo.latitude} onChange={(e) => update('business', { geo: { ...settings.business.geo, latitude: Number(e.target.value) } })} />
        </div>
        <div>
          <Label className={labelClass}>გრძედი <InfoTooltip text="გრძედი — Google Maps-ის კოორდინატები ოფისის ადგილმდებარეობისთვის" /></Label>
          <Input type="number" step="0.0001" value={settings.business.geo.longitude} onChange={(e) => update('business', { geo: { ...settings.business.geo, longitude: Number(e.target.value) } })} />
        </div>
      </div>
    </div>
  );
}

export function HoursSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>სამუშაო საათები <InfoTooltip text="სამუშაო საათები — გამოჩნდება საიტზე და Google-ის ბიზნეს პროფილში" /></span>
      <div className="grid grid-cols-4 gap-3 mt-2">
        <div>
          <Label className={labelClass}>სამუშაო დღეები — გახსნა <InfoTooltip text="სამუშაო დღეების (ორშ-შაბ) გახსნის დრო" /></Label>
          <Input type="time" value={settings.hours.weekdays.open} onChange={(e) => update('hours', { weekdays: { ...settings.hours.weekdays, open: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>სამუშაო დღეები — დახურვა <InfoTooltip text="სამუშაო დღეების (ორშ-შაბ) დახურვის დრო" /></Label>
          <Input type="time" value={settings.hours.weekdays.close} onChange={(e) => update('hours', { weekdays: { ...settings.hours.weekdays, close: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>კვირა — გახსნა <InfoTooltip text="კვირის გახსნის დრო" /></Label>
          <Input type="time" value={settings.hours.sunday.open} onChange={(e) => update('hours', { sunday: { ...settings.hours.sunday, open: e.target.value } })} />
        </div>
        <div>
          <Label className={labelClass}>კვირა — დახურვა <InfoTooltip text="კვირის დახურვის დრო" /></Label>
          <Input type="time" value={settings.hours.sunday.close} onChange={(e) => update('hours', { sunday: { ...settings.hours.sunday, close: e.target.value } })} />
        </div>
      </div>
    </div>
  );
}

export function StatsSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>სტატისტიკა <InfoTooltip text="სტატისტიკის რიცხვები — გამოჩნდება მთავარ გვერდზე 'რატომ ჩვენ' სექციაში" /></span>
      <div className="grid grid-cols-4 gap-3 mt-2">
        <div>
          <Label className={labelClass}>დამონტაჟებული კამერები <InfoTooltip text="დამონტაჟებული კამერების საერთო რაოდენობა. მაგ: 500+" /></Label>
          <Input value={settings.stats.camerasInstalled} onChange={(e) => update('stats', { camerasInstalled: e.target.value })} placeholder="500+" />
        </div>
        <div>
          <Label className={labelClass}>პროექტები <InfoTooltip text="დასრულებული პროექტების რაოდენობა. მაგ: 120+" /></Label>
          <Input value={settings.stats.projectsCompleted} onChange={(e) => update('stats', { projectsCompleted: e.target.value })} placeholder="120+" />
        </div>
        <div>
          <Label className={labelClass}>გამოცდილება (წ.) <InfoTooltip text="გამოცდილების წლები. მაგ: 5+" /></Label>
          <Input value={settings.stats.yearsExperience} onChange={(e) => update('stats', { yearsExperience: e.target.value })} placeholder="5+" />
        </div>
        <div>
          <Label className={labelClass}>გარანტია (წ.) <InfoTooltip text="სტანდარტული გარანტიის ვადა წლებში" /></Label>
          <Input value={settings.stats.warrantyYears} onChange={(e) => update('stats', { warrantyYears: e.target.value })} placeholder="2" />
        </div>
      </div>
    </div>
  );
}

export function AnnouncementSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={sectionTitleClass}>განცხადების ბანერი <InfoTooltip text="ბანერი საიტის ზედა ნაწილში — აქციები, სიახლეები და სხვა შეტყობინებები" /></span>
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="announcement-enabled"
            checked={settings.announcement.enabled}
            onCheckedChange={(checked) => update('announcement', { enabled: checked === true })}
          />
          <Label htmlFor="announcement-enabled" className="text-xs text-muted-foreground cursor-pointer">ჩართული <InfoTooltip text="ჩართვისას ბანერი გამოჩნდება ყველა გვერდის ზედა ნაწილში" /></Label>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className={labelClass}>ტექსტი KA</Label>
          <Input value={settings.announcement.textKa} onChange={(e) => update('announcement', { textKa: e.target.value })} placeholder="ქართულად" />
        </div>
        <div>
          <Label className={labelClass}>ტექსტი RU</Label>
          <Input value={settings.announcement.textRu} onChange={(e) => update('announcement', { textRu: e.target.value })} placeholder="По-русски" />
        </div>
        <div>
          <Label className={labelClass}>ტექსტი EN</Label>
          <Input value={settings.announcement.textEn} onChange={(e) => update('announcement', { textEn: e.target.value })} placeholder="In English" />
        </div>
      </div>
    </div>
  );
}

export function SocialSection({ settings, update }: SectionProps): React.ReactElement {
  return (
    <div className="p-4">
      <span className={sectionTitleClass}>სოციალური ბმულები <InfoTooltip text="სოციალური ქსელების ბმულები — გამოჩნდება საიტის ქვედა ნაწილში" /></span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div>
          <Label className={labelClass}>Facebook <InfoTooltip text="Facebook გვერდის სრული URL" /></Label>
          <Input value={settings.social.facebook} onChange={(e) => update('social', { facebook: e.target.value })} placeholder="https://facebook.com/..." />
        </div>
        <div>
          <Label className={labelClass}>Instagram <InfoTooltip text="Instagram პროფილის სრული URL" /></Label>
          <Input value={settings.social.instagram} onChange={(e) => update('social', { instagram: e.target.value })} placeholder="https://instagram.com/..." />
        </div>
        <div>
          <Label className={labelClass}>TikTok <InfoTooltip text="TikTok პროფილის სრული URL" /></Label>
          <Input value={settings.social.tiktok} onChange={(e) => update('social', { tiktok: e.target.value })} placeholder="https://tiktok.com/@..." />
        </div>
      </div>
    </div>
  );
}
