'use client';

import { Container } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import QR Code Generator to avoid SSR issues
const QrCodeGenerator = dynamic(() => import('@/components/QrCodeGenerator'), {
  ssr: false,
});

export default function Home() {
  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <QrCodeGenerator />
    </Container>
  );
}
