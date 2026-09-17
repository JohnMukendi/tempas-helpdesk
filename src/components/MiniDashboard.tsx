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
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconUsers, IconActivity, IconRefresh } from '@tabler/icons-react';
import StatCard from '@/components/StatCard';

function formatLastSeen(dateStr: string | null) {
  if (!dateStr) return 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MiniDashboard() {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [presenceRes, usersRes] = await Promise.all([
        fetch('/api/presence'),
        fetch('/api/users'),
      ]);

      if (presenceRes.ok) {
        const pData = await presenceRes.json();
        if (Array.isArray(pData.presence)) {
          setActiveUsers(pData.presence);
        }
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (Array.isArray(uData.users)) {
          setTotalUsers(uData.users.length);
        }
      }
    } catch (err) {
      console.error('Error loading MiniDashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const onlineNowCount = activeUsers.filter((u) => u.is_online).length;

  return (
    <Stack gap="xl">
      <Group grow align="flex-start">
        <StatCard
          icon={<IconActivity size={22} />}
          label="Active Users (Now)"
          value={onlineNowCount}
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
          <Group gap="xs">
            <Text fw={600}>Recent Activity (Presence)</Text>
            <Badge variant="light" color="warmGold">
              Live
            </Badge>
          </Group>
          <Tooltip label="Refresh">
            <ActionIcon
              variant="subtle"
              color="gray"
              loading={refreshing}
              onClick={() => loadData(true)}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
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
                      {(presence.user_name || presence.email || presence.user_id || '?')
                        .substring(0, 2)
                        .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {presence.user_name || presence.email || presence.user_id || 'Unknown User'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Last active: {formatLastSeen(presence.last_seen)}
                        {presence.last_seen && (
                          <Text component="span" c="dimmed" size="xs" ml={6}>
                            ({new Date(presence.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </Text>
                        )}
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
