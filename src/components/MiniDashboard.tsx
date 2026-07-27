'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Avatar,
  Badge,
} from '@mantine/core';
import { supabase } from '@/lib/supabase';
import { IconUsers, IconActivity } from '@tabler/icons-react';
import StatCard from '@/components/StatCard';

export default function MiniDashboard() {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    setLoading(true);
    // Based on user feedback: "There is a presense table"
    // Assuming standard fields like user_id, updated_at or similar
    const { data, error } = await supabase
      .from('presense')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(20);

    if (!error && data) {
      setActiveUsers(data);
    }
    setLoading(false);
  };

  return (
    <Stack gap="xl">
      <Group grow align="flex-start">
        <StatCard
          icon={<IconActivity size={22} />}
          label="Active Users (Now)"
          value={activeUsers.length || 0}
          gradient="linear-gradient(135deg, #10b981, #059669)"
        />
        <StatCard
          icon={<IconUsers size={22} />}
          label="Total Registered"
          value="--" // In a real app, query auth.users or profiles table
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
      </Group>

      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Text fw={600}>Recent Activity (Presense Table)</Text>
          <Badge variant="light" color="warmGold">
            Live
          </Badge>
        </Group>

        {loading ? (
          <Center py="xl">
            <Loader color="warmGold" />
          </Center>
        ) : activeUsers.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No active users found.
          </Text>
        ) : (
          <Stack gap="sm">
            {activeUsers.map((presence, idx) => (
              <Paper key={presence.id || idx} p="sm" radius="md" bg="dark.6">
                <Group justify="space-between">
                  <Group>
                    <Avatar color="warmGold" radius="xl">
                      {(presence.email || presence.user_id || '?').substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {presence.email || presence.user_id || 'Unknown User'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Last active: {presence.updated_at ? new Date(presence.updated_at).toLocaleString() : 'Just now'}
                      </Text>
                    </Box>
                  </Group>
                  <Badge color="green" variant="dot">Online</Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
