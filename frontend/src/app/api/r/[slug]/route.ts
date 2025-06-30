import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Get the API base URL from environment
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

    console.log(`Fetching redirect for slug: ${slug} from ${apiBaseUrl}`);

    // Make a request to the backend to get the redirect URL
    const backendResponse = await fetch(`${apiBaseUrl}/r/${slug}`, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects automatically
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'QRLinkr-Frontend',
      },
    });

    if (backendResponse.status === 302) {
      const redirectUrl = backendResponse.headers.get('location');
      if (redirectUrl) {
        console.log(`Redirecting to: ${redirectUrl}`);
        return NextResponse.redirect(redirectUrl, 302);
      }
    }

    if (backendResponse.status === 404) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error('Error in redirect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
