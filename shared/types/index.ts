// By defining the types explicitly here, we make the `shared` package
// a self-contained source of truth for data structures, usable by both
// frontend and backend without build-order issues.

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QrLink {
  id: string;
  originalUrl: string;
  fallbackUrl: string | null;
  slug: string;
  shortUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsEvent {
  id: string;
  qrLinkId: string;
  ipAddress: string;
  userAgent: string | null;
  scannedAt: Date;
}

// API payload types
export interface CreateQrLinkPayload {
  destination: string;
  slug?: string;
}

export interface UpdateQrLinkPayload {
  originalUrl?: string;
  fallbackUrl?: string;
  slug?: string;
}
