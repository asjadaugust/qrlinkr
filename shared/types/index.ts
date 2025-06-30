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
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  // Analytics data
  analyticsEvents?: AnalyticsEvent[];
  _count?: {
    analyticsEvents: number;
  };
}

export interface AnalyticsEvent {
  id: string;
  qrLinkId: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

export interface AnalyticsSummary {
  totalScans: number;
  events: AnalyticsEvent[];
}

// API payload types
export interface CreateQrLinkPayload {
  destination: string;
  custom_slug?: string;
}

export interface UpdateQrLinkPayload {
  destination: string;
  fallbackUrl?: string;
}

// QR Code styling options
export interface QRCodeOptions {
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
  level?: 'L' | 'M' | 'Q' | 'H';
  size?: number;
}
