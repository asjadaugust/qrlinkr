'use client';

import { useState, useRef } from 'react';
import {
  Button,
  TextField,
  Container,
  Box,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  FormControlLabel,
  Switch,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColorizeIcon from '@mui/icons-material/Colorize';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../lib/api'; // Import the centralized API client
import { QRCodeOptions } from '../../../shared/types';

// Extend window interface for runtime config
declare global {
  interface Window {
    __QRLINKR_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

export default function QrCodeGenerator() {
  const [destination, setDestination] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const qrCodeWrapperRef = useRef<HTMLDivElement>(null);
  const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    includeMargin: true,
    level: 'M',
    size: 256,
  });

  // Get the backend URL for redirect links
  const getRedirectBaseUrl = () => {
    if (
      typeof window !== 'undefined' &&
      window.__QRLINKR_CONFIG__?.apiBaseUrl
    ) {
      return window.__QRLINKR_CONFIG__.apiBaseUrl;
    }
    // Fallback for development
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'http://localhost:3001';
  };

  // Helper function to normalize URL by adding https:// if missing
  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    
    // If it already has a protocol, return as is
    if (/^(https?:\/\/)/i.test(url)) {
      return url;
    }
    
    // Add https:// prefix if missing
    return `https://${url}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShortUrl('');

    try {
      // Normalize the destination URL by adding https:// if missing
      const normalizedDestination = normalizeUrl(destination);
      
      const body = {
        destination: normalizedDestination,
        ...(customSlug && { custom_slug: customSlug }),
      };

      // Use the new api client
      const res = await api.post('/api/qr/new', body);

      const data = res.data;
      const fullShortUrl = `${getRedirectBaseUrl()}/r/${data.slug}`;
      setShortUrl(fullShortUrl);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        const response = err.response as {
          status: number;
          data: { message: string };
        };
        if (response.status === 409) {
          setError(
            response.data.message ||
              'That custom slug is already taken. Please try another.'
          );
        } else {
          setError(response.data.message || 'Failed to generate QR code');
        }
      } else if (err instanceof Error) {
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
    if (canvas && shortUrl && typeof document !== 'undefined') {
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

  const handleQrOptionChange = (
    name: keyof QRCodeOptions,
    value: string | boolean | number
  ) => {
    setQrOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          QR Code Generator
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mt: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                placeholder="example.com or www.example.com"
                helperText="Enter your website domain (https:// will be added automatically)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">https://</InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                id="custom_slug"
                label="Custom Slug (optional)"
                name="custom_slug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                helperText={`Your QR code will redirect to: ${
                  window.location.host
                }/r/${customSlug || 'auto-generated-slug'}`}
              />

              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>QR Code Customization</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Foreground Color"
                        type="color"
                        value={qrOptions.fgColor}
                        onChange={(e) =>
                          handleQrOptionChange('fgColor', e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ColorizeIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Background Color"
                        type="color"
                        value={qrOptions.bgColor}
                        onChange={(e) =>
                          handleQrOptionChange('bgColor', e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ColorizeIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <FormControl fullWidth>
                      <InputLabel>Error Correction Level</InputLabel>
                      <Select
                        value={qrOptions.level}
                        label="Error Correction Level"
                        onChange={(e) =>
                          handleQrOptionChange('level', e.target.value)
                        }
                      >
                        <MenuItem value="L">Low (7% damage recovery)</MenuItem>
                        <MenuItem value="M">
                          Medium (15% damage recovery)
                        </MenuItem>
                        <MenuItem value="Q">
                          Quartile (25% damage recovery)
                        </MenuItem>
                        <MenuItem value="H">
                          High (30% damage recovery)
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={qrOptions.includeMargin}
                          onChange={(e) =>
                            handleQrOptionChange(
                              'includeMargin',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Include Margin"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Generate QR Code'
                )}
              </Button>
            </Box>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {shortUrl ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '300px',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Your QR Code:
                </Typography>
                <Box
                  onClick={handleOpenModal}
                  sx={{
                    cursor: 'pointer',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: qrOptions.bgColor,
                  }}
                >
                  <QRCodeCanvas
                    value={shortUrl}
                    size={qrOptions.size}
                    bgColor={qrOptions.bgColor}
                    fgColor={qrOptions.fgColor}
                    level={qrOptions.level}
                    includeMargin={qrOptions.includeMargin}
                  />
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Short URL:{' '}
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                    {shortUrl}
                  </a>
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleDownload}
                  sx={{ mt: 2 }}
                >
                  Download QR Code
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '300px',
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography
                  variant="body1"
                  align="center"
                  color="textSecondary"
                >
                  Your QR code preview will appear here after generation.
                </Typography>
                <Typography
                  variant="body2"
                  align="center"
                  color="textSecondary"
                  sx={{ mt: 2 }}
                >
                  Customize your QR code using the options on the left.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

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
            borderRadius: 2,
          }}
        >
          <Typography id="qr-code-modal-title" variant="h6" component="h2">
            Enlarged QR Code
          </Typography>
          <Box
            ref={qrCodeWrapperRef}
            sx={{
              bgcolor: qrOptions.bgColor,
              p: 3,
              borderRadius: 1,
            }}
          >
            <QRCodeCanvas
              value={shortUrl}
              size={400}
              bgColor={qrOptions.bgColor}
              fgColor={qrOptions.fgColor}
              level={qrOptions.level}
              includeMargin={qrOptions.includeMargin}
            />
          </Box>
          <Button variant="contained" onClick={handleDownload}>
            Download as PNG
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
