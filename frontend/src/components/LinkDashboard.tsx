'use client';

import { useEffect, useState } from 'react';
import { QrLink, AnalyticsSummary } from '../../../shared/types';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../lib/api'; // Import the centralized API client

export default function LinkDashboard() {
  const [links, setLinks] = useState<QrLink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<QrLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

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
      : window.location.origin;
  };
  const [analyticsSummary, setAnalyticsSummary] =
    useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await api.get<QrLink[]>('/api/qr/links');
      setLinks(response.data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
      // Optionally, set an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/api/qr/${id}`, { destination: editText });
      setEditingId(null);
      setEditText('');
      fetchLinks(); // Refresh the list
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this QR link? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      console.log(`Attempting to delete link with ID: ${id}`);

      // Make the delete request
      const response = await api.delete(`/api/qr/${id}`);

      console.log('Delete response:', response.status);

      if (response.status === 204 || response.status === 200) {
        console.log('Link deleted successfully');
        // Refresh the list immediately
        await fetchLinks();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error: unknown) {
      console.error('Failed to delete link:', error);

      let errorMessage = 'Failed to delete the link. Please try again later.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        errorMessage = `Error ${axiosError.response?.status}: ${
          axiosError.response?.data?.message || 'Unknown error'
        }`;
      } else if (error && typeof error === 'object' && 'request' in error) {
        errorMessage =
          'Network error: Could not reach the server. Please check your connection.';
      }

      window.alert(errorMessage);
    }
  };

  const startEditing = (link: QrLink) => {
    setEditingId(link.id);
    setEditText(link.originalUrl);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleOpenModal = (link: QrLink) => {
    setSelectedLink(link);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLink(null);
    setModalOpen(false);
  };

  const handleOpenAnalytics = async (link: QrLink) => {
    setSelectedLink(link);
    setAnalyticsLoading(true);
    setAnalyticsOpen(true);

    try {
      const response = await api.get<AnalyticsSummary>(
        `/api/qr/${link.id}/analytics`
      );
      setAnalyticsSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCloseAnalytics = () => {
    setAnalyticsOpen(false);
    setSelectedLink(null);
    setAnalyticsSummary(null);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById(
      'modal-qr-code'
    ) as HTMLCanvasElement;
    if (canvas && selectedLink) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${selectedLink.slug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        My QR Links
      </Typography>
      <Paper elevation={2} sx={{ mb: 4, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>QR Code</TableCell>
              <TableCell>Short URL</TableCell>
              <TableCell>Destination URL</TableCell>
              <TableCell>Scans</TableCell>
              <TableCell>Last Scanned</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No QR links found. Create your first QR code!
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <QRCodeCanvas
                      value={`${getRedirectBaseUrl()}/r/${link.slug}`}
                      size={64}
                    />
                  </TableCell>
                  <TableCell>
                    <a
                      href={`${getRedirectBaseUrl()}/r/${link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {`${getRedirectBaseUrl().replace(/^https?:\/\//, '')}/r/${
                        link.slug
                      }`}
                    </a>
                  </TableCell>
                  <TableCell>
                    {editingId === link.id ? (
                      <TextField
                        variant="outlined"
                        size="small"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        fullWidth
                      />
                    ) : (
                      <Tooltip title={link.originalUrl}>
                        <Typography noWrap sx={{ maxWidth: 250 }}>
                          {link.originalUrl}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={link._count?.analyticsEvents || 0}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {link.analyticsEvents && link.analyticsEvents.length > 0
                      ? formatDate(link.analyticsEvents[0].timestamp)
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {editingId === link.id ? (
                      <>
                        <IconButton
                          onClick={() => handleUpdate(link.id)}
                          color="primary"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={cancelEditing} color="error">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          onClick={() => startEditing(link)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(link.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenModal(link)}
                          color="default"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenAnalytics(link)}
                          color="success"
                        >
                          <AnalyticsIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* QR Code Preview Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {selectedLink && (
            <>
              <Typography variant="h6" component="h2">
                {`${getRedirectBaseUrl().replace(/^https?:\/\//, '')}/r/${
                  selectedLink.slug
                }`}
              </Typography>
              <QRCodeCanvas
                id="modal-qr-code"
                value={`${getRedirectBaseUrl()}/r/${selectedLink.slug}`}
                size={256}
              />
              <Button
                onClick={downloadQRCode}
                variant="contained"
                startIcon={<DownloadIcon />}
              >
                Download PNG
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* Analytics Dialog */}
      <Dialog
        open={analyticsOpen}
        onClose={handleCloseAnalytics}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Analytics for{' '}
          {selectedLink
            ? `${getRedirectBaseUrl().replace(/^https?:\/\//, '')}/r/${
                selectedLink.slug
              }`
            : ''}
        </DialogTitle>
        <DialogContent dividers>
          {analyticsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="row" gap={3} p={2}>
              <Box flexBasis="33%">
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Typography variant="h3" align="center" color="primary">
                      {analyticsSummary?.totalScans || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      color="textSecondary"
                    >
                      Total Scans
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box flexBasis="67%">
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Scans
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {analyticsSummary?.events &&
                    analyticsSummary.events.length > 0 ? (
                      <List>
                        {analyticsSummary.events.slice(0, 10).map((event) => (
                          <ListItem key={event.id} divider>
                            <ListItemText
                              primary={formatDate(event.timestamp)}
                              secondary={`IP: ${
                                event.ipAddress || 'Unknown'
                              } | User Agent: ${
                                event.userAgent?.substring(0, 50) || 'Unknown'
                              }`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography align="center" color="textSecondary">
                        No scan data available yet.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnalytics} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
