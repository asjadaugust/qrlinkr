import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { build } from '../src/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';

// Load test environment variables FIRST
dotenv.config({ path: '.env.test' });

// Force the correct DATABASE_URL for tests
process.env.DATABASE_URL = 'postgresql://qrlinkr:qrlinkr123@localhost:5432/qrlinkr_test';

describe('QR Link API Integration Tests', () => {
  const app = build();
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    // Clean up test data
    await prisma.$connect();
    await prisma.analyticsEvent.deleteMany({});
    await prisma.qrLink.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });

    // Create test user matching what the API expects
    await prisma.user.create({
      data: {
        id: 'test_user_id',
        email: 'test@example.com',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.analyticsEvent.deleteMany({});
    await prisma.qrLink.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean QR links before each test
    await prisma.analyticsEvent.deleteMany({});
    await prisma.qrLink.deleteMany({});
  });

  it('should create a new QR link', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/qr/new',
      payload: {
        destination: 'https://example.com',
        custom_slug: 'test-' + nanoid(5),
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('slug');
    expect(body).toHaveProperty('originalUrl', 'https://example.com');
  });

  it('should handle duplicate slugs properly', async () => {
    const testSlug = 'test-duplicate-' + nanoid(5);

    // Create first link with the slug
    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/qr/new',
      payload: {
        destination: 'https://example.com',
        custom_slug: testSlug,
      },
    });

    expect(firstResponse.statusCode).toBe(200);

    // Try to create another with the same slug
    const duplicateResponse = await app.inject({
      method: 'POST',
      url: '/api/qr/new',
      payload: {
        destination: 'https://another-example.com',
        custom_slug: testSlug,
      },
    });

    expect(duplicateResponse.statusCode).toBe(409);
    expect(JSON.parse(duplicateResponse.body)).toHaveProperty(
      'message',
      'Custom slug already exists.'
    );
  });

  it('should redirect to the correct URL when accessing a valid short link', async () => {
    // Create a QR link first
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/qr/new',
      payload: {
        destination: 'https://example.org',
        custom_slug: 'test-redirect',
      },
    });

    expect(createResponse.statusCode).toBe(200);

    // Test the redirect
    const redirectResponse = await app.inject({
      method: 'GET',
      url: '/r/test-redirect',
    });

    expect(redirectResponse.statusCode).toBe(302);
    expect(redirectResponse.headers.location).toBe('https://example.org');
  });

  it('should return 404 for non-existent short links', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/r/non-existent-link',
    });

    expect(response.statusCode).toBe(404);
  });

  it('should track analytics when a QR code is scanned', async () => {
    // Create a QR link first
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/qr/new',
      payload: {
        destination: 'https://analytics-test.com',
        custom_slug: 'test-analytics',
      },
    });

    const link = JSON.parse(createResponse.body);

    // Access the link to trigger analytics
    await app.inject({
      method: 'GET',
      url: '/r/test-analytics',
      headers: {
        'user-agent': 'Test User Agent',
      },
    });

    // Fetch analytics for the link
    const analyticsResponse = await app.inject({
      method: 'GET',
      url: `/api/qr/${link.id}/analytics`,
    });

    expect(analyticsResponse.statusCode).toBe(200);
    const analytics = JSON.parse(analyticsResponse.body);

    expect(analytics).toHaveProperty('totalScans', 1);
    expect(analytics.events).toHaveLength(1);
    expect(analytics.events[0]).toHaveProperty('qrLinkId', link.id);
    expect(analytics.events[0]).toHaveProperty('userAgent', 'Test User Agent');
  });
});
