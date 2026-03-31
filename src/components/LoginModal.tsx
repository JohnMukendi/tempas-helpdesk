'use client';

import { useState } from 'react';
import { Modal, Button, Text, Stack, Center, Alert, TextInput, PasswordInput } from '@mantine/core';
import { IconLock, IconAlertCircle, IconMail, IconKey } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginModal() {
  const { user, loading, login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Modal should be open if not logged in
  const opened = !user;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}} // No closing allowed.
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      size="md"
      overlayProps={{
        backgroundOpacity: 0.8,
        blur: 4,
      }}
      styles={{
        content: {
          padding: '2rem',
          borderRadius: '16px',
        }
      }}
    >
      <Stack gap="xl">
        <Center>
          <div style={{
            background: 'rgba(212, 160, 23, 0.1)',
            padding: '16px',
            borderRadius: '50%',
            color: '#D4A017'
          }}>
            <IconLock size={40} />
          </div>
        </Center>

        <Stack gap="xs" align="center">
          <Text fw={700} size="xl" ta="center">
            Help Desk Administration
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            Please sign in with your credentials to access the dashboard.
          </Text>
        </Stack>

        {error && (
          <Alert 
            variant="light" 
            color="red" 
            title="Authentication Failed"
            icon={<IconAlertCircle size={16} />}
            styles={{
              title: { fontWeight: 600 }
            }}
          >
            {error}
          </Alert>
        )}

        <Stack gap="sm">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="admin@tempas.com"
                required
                leftSection={<IconMail size={16} />}
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                radius="md"
              />
              <PasswordInput
                label="Password"
                placeholder="your-secure-password"
                required
                leftSection={<IconKey size={16} />}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                radius="md"
              />
              <Button
                type="submit"
                variant="filled"
                color="warmGold"
                fullWidth
                size="md"
                mt="md"
                loading={loading}
                radius="md"
              >
                Login
              </Button>
            </Stack>
          </form>
        </Stack>

        <Text size="xs" c="dimmed" ta="center">
          Secured by Private Access Control.
        </Text>
      </Stack>
    </Modal>
  );
}
