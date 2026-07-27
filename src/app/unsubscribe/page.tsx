'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Center, Loader, Alert } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to unsubscribe');
      }

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Invalid Link" color="red">
        No email address found in the URL. Please check your link.
      </Alert>
    );
  }

  if (status === 'success') {
    return (
      <Paper p="xl" radius="md" withBorder ta="center" shadow="sm">
        <Center mb="md">
          <IconCheck size={48} color="teal" />
        </Center>
        <Title order={3} mb="sm">You have been unsubscribed</Title>
        <Text c="dimmed">
          We've successfully removed <strong>{email}</strong> from our mailing list. You will no longer receive these emails.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="xl" radius="md" withBorder ta="center" shadow="sm">
      <Title order={3} mb="sm">Confirm Unsubscribe</Title>
      <Text c="dimmed" mb="xl">
        Are you sure you want to stop receiving email updates for <strong>{email}</strong>?
      </Text>

      {status === 'error' && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" ta="left">
          Something went wrong while processing your request. Please try again.
        </Alert>
      )}

      <Button
        color="red"
        size="md"
        fullWidth
        loading={isLoading}
        onClick={handleUnsubscribe}
      >
        Yes, unsubscribe me
      </Button>
    </Paper>
  );
}

export default function UnsubscribePage() {
  return (
    <Container size={400} my={100}>
      <Center mb="xl">
        <img src="https://www.tempas.io/icon-512.png" width="64" alt="Tempas Logo" />
      </Center>
      <Suspense fallback={
        <Center py="xl">
          <Loader color="warmGold" />
        </Center>
      }>
        <UnsubscribeContent />
      </Suspense>
    </Container>
  );
}
