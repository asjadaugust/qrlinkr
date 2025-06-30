'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const toggleDrawer = (open: boolean) => {
    setMobileDrawerOpen(open);
  };

  const navItems = [
    { text: 'Create QR', href: '/', icon: <QrCodeIcon /> },
    { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  ];

  const renderMobileDrawer = () => (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <QrCodeIcon /> QRLinkr
              </Link>
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItemButton selected={isActive(item.href)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile && renderMobileDrawer()}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <QrCodeIcon />
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              QRLinkr
            </Link>
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  passHref
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    color="inherit"
                    variant={isActive(item.href) ? 'contained' : 'text'}
                    startIcon={item.icon}
                    sx={{ mx: 1 }}
                  >
                    {item.text}
                  </Button>
                </Link>
              ))}
            </Box>
          )}

          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              aria-haspopup="true"
              onClick={handleOpenUserMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>Settings</MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
