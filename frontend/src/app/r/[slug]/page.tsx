'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

// Extend window interface for runtime config
declare global {
  interface Window {
    __QRLINKR_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

export default function RedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // First resolve the params Promise
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return; // Wait for slug to be resolved

    const performRedirect = async () => {
      try {
        console.log(`Redirecting for slug: ${slug}`);

        // Get the API base URL from the runtime config
        let apiBaseUrl = 'http://localhost:3001'; // fallback

        // Check if the runtime config is available and wait for it if needed
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          if (
            typeof window !== 'undefined' &&
            window.__QRLINKR_CONFIG__?.apiBaseUrl
          ) {
            apiBaseUrl = window.__QRLINKR_CONFIG__.apiBaseUrl;
            console.log(`Found config, using API base URL: ${apiBaseUrl}`);
            break;
          }

          console.log(
            `Attempt ${
              attempts + 1
            }/${maxAttempts}: Config not available yet, waiting...`
          );
          // Wait 100ms before trying again
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.warn(
            'Config not loaded after max attempts, using fallback URL'
          );
        }

        const redirectUrl = `${apiBaseUrl}/r/${slug}`;
        console.log(`Performing redirect to: ${redirectUrl}`);

        // Directly redirect to the backend URL
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Error during redirect:', error);
        setError('Error during redirect. Please try again later.');
        setIsRedirecting(false);
      }
    };

    // Add a small delay to show the loading state, then redirect immediately
    const timer = setTimeout(performRedirect, 100);

    return () => clearTimeout(timer);
  }, [slug]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={3}
      >
        <Typography variant="h6" color="error" align="center" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          The QR code link you&apos;re trying to access might be invalid or
          deleted.
        </Typography>
        <Button component={Link} href="/" variant="contained">
          Return to Homepage
        </Button>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" mt={3} align="center">
        {isRedirecting ? 'Redirecting...' : 'Processing...'}
      </Typography>
      <Typography variant="body2" mt={4}>
        <Link href="/" style={{ textDecoration: 'underline' }}>
          Return to homepage
        </Link>
      </Typography>
    </Box>
  );
}
