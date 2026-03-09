export interface SiteSettingsStats {
  camerasInstalled: string;
  projectsCompleted: string;
  yearsExperience: string;
  warrantyYears: string;
}

export interface SiteSettingsContact {
  phone: string;
  whatsapp: string;
  email: string;
}

export interface SiteSettingsBusiness {
  companyName: string;
  address: {
    city: string;
    region: string;
    country: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
}

export interface SiteSettingsHours {
  weekdays: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface SiteSettingsSocial {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface SiteSettingsAnnouncement {
  enabled: boolean;
  textKa: string;
  textRu: string;
  textEn: string;
}

export interface SiteSettingsData {
  stats: SiteSettingsStats;
  contact: SiteSettingsContact;
  business: SiteSettingsBusiness;
  hours: SiteSettingsHours;
  social: SiteSettingsSocial;
  announcement: SiteSettingsAnnouncement;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  stats: {
    camerasInstalled: '500+',
    projectsCompleted: '120+',
    yearsExperience: '5+',
    warrantyYears: '2',
  },
  contact: {
    phone: '',
    whatsapp: '',
    email: '',
  },
  business: {
    companyName: '',
    address: { city: '', region: '', country: '' },
    geo: { latitude: 0, longitude: 0 },
  },
  hours: {
    weekdays: { open: '09:00', close: '18:00' },
    sunday: { open: '10:00', close: '16:00' },
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
  },
  announcement: {
    enabled: false,
    textKa: '',
    textRu: '',
    textEn: '',
  },
};
