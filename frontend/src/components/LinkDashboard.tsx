'use client';

import { useEffect, useState } from 'react';
import { QrLink } from '../../../shared/types';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../lib/api'; // Import the centralized API client

export default function LinkDashboard() {
  const [links, setLinks] = useState<QrLink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<QrLink | null>(null);

  const fetchLinks = async () => {
    try {
      const response = await api.get<QrLink[]>('/api/qr/links');
      setLinks(response.data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
      // Optionally, set an error state to show a message to the user
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
    try {
      await api.delete(`/api/qr/${id}`);
      fetchLinks(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const startEditing = (link: QrLink) => {
    setEditingId(link.id);
    setEditText(link.originalUrl);
  };

  const handleOpenModal = (link: QrLink) => {
    setSelectedLink(link);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLink(null);
    setModalOpen(false);
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        My Links
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>QR Code</TableCell>
            <TableCell>Short URL</TableCell>
            <TableCell>Destination URL</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {links.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                <QRCodeCanvas
                  value={`${window.location.origin}/r/${link.slug}`}
                  size={64}
                />
              </TableCell>
              <TableCell>
                <a
                  href={`/r/${link.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${window.location.host}/r/${link.slug}`}
                </a>
              </TableCell>
              <TableCell>
                {editingId === link.id ? (
                  <TextField
                    variant="outlined"
                    size="small"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  link.originalUrl
                )}
              </TableCell>
              <TableCell>
                {editingId === link.id ? (
                  <IconButton onClick={() => handleUpdate(link.id)}>
                    <SaveIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => startEditing(link)}>
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton onClick={() => handleDelete(link.id)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModal(link)}>
                  <VisibilityIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
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
                {`${window.location.host}/r/${selectedLink.slug}`}
              </Typography>
              <QRCodeCanvas
                id="modal-qr-code"
                value={`${window.location.origin}/r/${selectedLink.slug}`}
                size={256}
              />
              <Button onClick={downloadQRCode} startIcon={<DownloadIcon />}>
                Download PNG
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
}
