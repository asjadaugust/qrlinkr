'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import Link from 'next/link';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link
            href="/"
            passHref
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            QRLinkr
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/dashboard" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
