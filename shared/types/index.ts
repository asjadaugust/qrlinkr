import {
  User as PrismaUser,
  QrLink as PrismaQrLink,
  AnalyticsEvent as PrismaAnalyticsEvent,
} from '@prisma/client';

export type User = PrismaUser;
export type QrLink = PrismaQrLink;
export type AnalyticsEvent = PrismaAnalyticsEvent;
