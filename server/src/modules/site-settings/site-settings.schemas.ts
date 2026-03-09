/**
 * Site Settings Module — Zod Schemas
 */

import { z } from 'zod';

const timeFormat = /^\d{2}:\d{2}$/;

const StatsSchema = z.object({
  camerasInstalled: z.string().max(20).optional(),
  projectsCompleted: z.string().max(20).optional(),
  yearsExperience: z.string().max(20).optional(),
  warrantyYears: z.string().max(20).optional(),
}).optional();

const ContactSchema = z.object({
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  email: z.union([z.literal(''), z.string().email()]).optional(),
}).optional();

const BusinessSchema = z.object({
  companyName: z.string().max(100).optional(),
  address: z.object({
    city: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
    country: z.string().max(5).optional(),
  }).optional(),
  geo: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
}).optional();

const HoursSchema = z.object({
  weekdays: z.object({
    open: z.string().regex(timeFormat, 'Must be in HH:mm format').optional(),
    close: z.string().regex(timeFormat, 'Must be in HH:mm format').optional(),
  }).optional(),
  sunday: z.object({
    open: z.string().regex(timeFormat, 'Must be in HH:mm format').optional(),
    close: z.string().regex(timeFormat, 'Must be in HH:mm format').optional(),
  }).optional(),
}).optional();

const SocialSchema = z.object({
  facebook: z.union([z.literal(''), z.string().url()]).optional(),
  instagram: z.union([z.literal(''), z.string().url()]).optional(),
  tiktok: z.union([z.literal(''), z.string().url()]).optional(),
}).optional();

const AnnouncementSchema = z.object({
  enabled: z.boolean().optional(),
  textKa: z.string().max(500).optional(),
  textRu: z.string().max(500).optional(),
  textEn: z.string().max(500).optional(),
}).optional();

export const UpdateSiteSettingsSchema = z.object({
  stats: StatsSchema,
  contact: ContactSchema,
  business: BusinessSchema,
  hours: HoursSchema,
  social: SocialSchema,
  announcement: AnnouncementSchema,
});

export type UpdateSiteSettingsInput = z.infer<typeof UpdateSiteSettingsSchema>;
