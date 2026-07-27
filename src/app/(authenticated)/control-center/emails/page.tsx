'use client';

import { Box, Text } from '@mantine/core';
import AdminEmails from '@/components/AdminEmails';

export default function EmailsPage() {
  return (
    <>
      <Box mb="lg">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          Tempas Help Desk
        </Text>
        <Text
          fw={700}
          style={{ fontSize: 28, lineHeight: 1.15 }}
          mt={4}
        >
          Email Campaigns
        </Text>
      </Box>
      
      <AdminEmails />
    </>
  );
}
