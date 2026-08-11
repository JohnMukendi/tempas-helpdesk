'use client';

import { Box, Text, Tabs } from '@mantine/core';
import AdminEmails from '@/components/AdminEmails';
import AutomatedEmails from '@/components/AutomatedEmails';
import { IconMail, IconRobot } from '@tabler/icons-react';

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
          Emails Config
        </Text>
      </Box>
      
      <Tabs defaultValue="campaigns" variant="pills" radius="xl" color="warmGold">
        <Tabs.List mb="md">
          <Tabs.Tab value="campaigns" leftSection={<IconMail size={16} />}>
            Campaigns
          </Tabs.Tab>
          <Tabs.Tab value="automated" leftSection={<IconRobot size={16} />}>
            Automated Emails
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="campaigns">
          <AdminEmails />
        </Tabs.Panel>
        
        <Tabs.Panel value="automated">
          <AutomatedEmails />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
