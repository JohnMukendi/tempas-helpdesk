'use client';

import { Box, Center, Loader } from '@mantine/core';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/context/AuthContext';
import classes from './layout.module.css';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader color="warmGold" size="xl" type="bars" />
      </Center>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  return (
    <>
      <Sidebar />
      <Box className={classes.main}>
        {children}
      </Box>
    </>
  );
}
