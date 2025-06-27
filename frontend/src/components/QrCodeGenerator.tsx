'use client';

import { useState, useRef } from 'react';
import {
  Button,
  TextField,
  Container,
  Box,
  Typography,
  Modal,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrCodeGenerator() {
  const [destination, setDestination] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const qrCodeWrapperRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShortUrl('');

    try {
      const body = {
        destination,
        ...(customSlug && { custom_slug: customSlug }),
      };

      const res = await fetch('/api/qr/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409) {
          throw new Error(
            errorData.message ||
              'That custom slug is already taken. Please try another.'
          );
        }
        throw new Error(errorData.message || 'Failed to generate QR code');
      }

      const data = await res.json();
      const fullShortUrl = `${window.location.protocol}//${window.location.host}/r/${data.slug}`;
      setShortUrl(fullShortUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = qrCodeWrapperRef.current?.querySelector('canvas');
    if (canvas && shortUrl) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      const slug = shortUrl.substring(shortUrl.lastIndexOf('/') + 1);
      downloadLink.download = `qrlinkr-${slug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          QR Code Generator
        </Typography>
        <Box
          component="form"
          onSubmit={handleGenerate}
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="destination"
            label="Destination URL"
            name="destination"
            autoFocus
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="custom_slug"
            label="Custom Slug (optional)"
            name="custom_slug"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {shortUrl && (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Your QR Code:</Typography>
            <Box
              onClick={handleOpenModal}
              sx={{
                cursor: 'pointer',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <QRCodeCanvas value={shortUrl} size={256} />
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Short URL: {shortUrl}
            </Typography>
            <Modal
              open={modalOpen}
              onClose={handleCloseModal}
              aria-labelledby="qr-code-modal-title"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'auto',
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 1,
                }}
              >
                <Typography
                  id="qr-code-modal-title"
                  variant="h6"
                  component="h2"
                >
                  Enlarged QR Code
                </Typography>
                <Box ref={qrCodeWrapperRef}>
                  <QRCodeCanvas value={shortUrl} size={400} />
                </Box>
                <Button variant="contained" onClick={handleDownload}>
                  Download as PNG
                </Button>
              </Box>
            </Modal>
          </Box>
        )}
      </Box>
    </Container>
  );
}
