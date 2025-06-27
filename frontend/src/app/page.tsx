'use client';

import { Container } from '@mui/material';
import QrCodeGenerator from '@/components/QrCodeGenerator';

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
