import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './globals.css';
import { tempasTheme } from '@/theme/theme';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Tempas Help Desk',
  description: 'Manage feature requests and bug reports for Tempas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={tempasTheme} defaultColorScheme="dark">
          <AuthProvider>
            {children}
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
