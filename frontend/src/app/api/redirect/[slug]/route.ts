import { NextRequest, NextResponse } from 'next/server';

interface QrLink {
  id: string;
  originalUrl: string;
  fallbackUrl: string | null;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Get the backend URL
    const backendUrl =
      process.env.NODE_ENV === 'production'
        ? 'http://backend:3001'
        : 'http://localhost:3001';

    console.log(`Fetching redirect for slug: ${slug} from ${backendUrl}`);

    // Fetch the QR link data from backend
    const response = await fetch(`${backendUrl}/api/qr/links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch links from backend:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch link data' },
        { status: 500 }
      );
    }

    const links: QrLink[] = await response.json();
    const qrLink = links.find((link: QrLink) => link.slug === slug);

    if (!qrLink) {
      return NextResponse.json({ error: 'QR link not found' }, { status: 404 });
    }

    // Log analytics by calling the backend redirect endpoint
    try {
      await fetch(`${backendUrl}/r/${slug}`, {
        method: 'GET',
        headers: {
          'User-Agent': request.headers.get('user-agent') || 'QRLinkr-Frontend',
          'X-Forwarded-For':
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown',
        },
        redirect: 'manual', // Don't follow redirects
      });
    } catch (error) {
      console.error('Failed to log analytics:', error);
      // Continue with redirect even if analytics fails
    }

    // Return the destination URL
    return NextResponse.json({
      destination: qrLink.originalUrl,
      slug: qrLink.slug,
    });
  } catch (error) {
    console.error('Error in redirect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
