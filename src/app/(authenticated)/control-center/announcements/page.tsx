'use client';

import { Box, Text } from '@mantine/core';
import AdminAnnouncements from '@/components/AdminAnnouncements';

export default function AnnouncementsPage() {
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
          Announcements
        </Text>
      </Box>
      <AdminAnnouncements />
    </>
  );
}
