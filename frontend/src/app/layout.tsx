import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import Navbar from '@/components/Navbar'; // Import the Navbar

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QRLinkr | Dynamic QR Redirection',
  description:
    'Create, manage, and track dynamic QR codes with persistent short URLs.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeRegistry>
          <Navbar /> {/* Add the Navbar here */}
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
