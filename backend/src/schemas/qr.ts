import { z } from 'zod';

// Schema for creating a new QR link
export const createQrLinkSchema = z.object({
  destination: z.string().url('Must be a valid URL'),
  custom_slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .optional(),
});

// Schema for updating an existing QR link
export const updateQrLinkSchema = z.object({
  destination: z.string().url('Must be a valid URL'),
  fallbackUrl: z.string().url('Must be a valid URL').optional(),
});

// Schema for params with ID
export const idParamSchema = z.object({
  id: z.string().min(1),
});

// Schema for slug param
export const slugParamSchema = z.object({
  slug: z.string().min(1),
});
