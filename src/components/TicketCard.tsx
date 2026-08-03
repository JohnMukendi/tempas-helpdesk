'use client';

import { Box, Text, Badge, Group } from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';
import type { Ticket } from '@/types/ticket';
import classes from './TicketCard.module.css';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  open: '#22c55e',
  'in-progress': '#f59e0b',
  closed: '#94a3b8',
};

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const dateStr = ticket.createdAt instanceof Date
    ? ticket.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Box className={`${classes.card} glass-card`} onClick={onClick} tabIndex={0} role="button">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb={8}>
        <Text fw={600} size="sm" lineClamp={1} style={{ flex: 1 }}>
          {ticket.title}
        </Text>
        <Badge
          size="xs"
          variant="light"
          styles={{
            root: {
              background: `${statusColors[ticket.status]}18`,
              color: statusColors[ticket.status],
              border: `1px solid ${statusColors[ticket.status]}30`,
              textTransform: 'capitalize',
            },
          }}
        >
          {ticket.status}
        </Badge>
      </Group>

      {/* Description excerpt */}
      <Text size="xs" c="dimmed" lineClamp={2} mb={10} lh={1.5}>
        {ticket.description}
      </Text>

      {/* Footer */}
      <Group justify="space-between">
        <Group gap={6}>
          <Badge
            size="xs"
            variant="outline"
            styles={{
              root: {
                color: priorityColors[ticket.priority],
                borderColor: `${priorityColors[ticket.priority]}40`,
                textTransform: 'capitalize',
              },
            }}
          >
            {ticket.priority}
          </Badge>
        </Group>
        <Group gap={10}>
          <Group gap={4}>
            <IconUser size={12} style={{ opacity: 0.5 }} />
            <Text size="xs" c="dimmed">
              {ticket.submittedBy}
            </Text>
          </Group>
          <Group gap={4}>
            <IconClock size={12} style={{ opacity: 0.5 }} />
            <Text size="xs" c="dimmed">
              {dateStr}
            </Text>
          </Group>
        </Group>
      </Group>
    </Box>
  );
}
