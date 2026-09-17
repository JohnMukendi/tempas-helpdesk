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
  Box,
} from '@mantine/core';
import { supabase } from '@/lib/supabase';
import { IconUsers, IconActivity } from '@tabler/icons-react';
import StatCard from '@/components/StatCard';

export default function MiniDashboard() {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
    fetchTotalUsers();
  }, []);

  const fetchActiveUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('presence')
      .select('*')
      .order('last_seen', { ascending: false, nullsFirst: false })
      .limit(20);

    if (!error && data) {
      setActiveUsers(data);
    } else if (error) {
      console.error('Error fetching presence:', error);
    }
    setLoading(false);
  };

  const fetchTotalUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          setTotalUsers(data.users.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch total registered users:', err);
    }
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
          value={totalUsers}
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
      </Group>

      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Text fw={600}>Recent Activity (Presence Table)</Text>
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
              <Paper key={presence.id || presence.user_id || idx} p="sm" radius="md" bg="dark.6">
                <Group justify="space-between">
                  <Group>
                    <Avatar src={presence.user_profile} color="warmGold" radius="xl">
                      {(presence.user_name || presence.email || presence.user_id || '?').substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {presence.user_name || presence.email || presence.user_id || 'Unknown User'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Last active: {presence.last_seen ? new Date(presence.last_seen).toLocaleString() : 'Just now'}
                      </Text>
                    </Box>
                  </Group>
                  <Badge color={presence.is_online ? 'green' : 'gray'} variant="dot">
                    {presence.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
