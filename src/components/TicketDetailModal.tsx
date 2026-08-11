'use client';

import {
  Modal,
  Text,
  Badge,
  Group,
  Stack,
  Divider,
  Box,
  Select,
  Loader,
} from '@mantine/core';
import {
  IconBug,
  IconBulb,
  IconClock,
  IconUser,
  IconFlag,
} from '@tabler/icons-react';
import type { Ticket } from '@/types/ticket';
import { useState, useEffect } from 'react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  opened: boolean;
  onClose: () => void;
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

export default function TicketDetailModal({
  ticket,
  opened,
  onClose,
}: TicketDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket?.status ?? 'open');

  // Sync local status when a different ticket is opened
  useEffect(() => {
    if (ticket) setCurrentStatus(ticket.status);
  }, [ticket?.id]);

  if (!ticket) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || currentStatus === newStatus) return;
    setIsUpdating(true);

    // Optimistically update the select immediately
    setCurrentStatus(newStatus as Ticket['status']);

    try {
      // Use the server-side API route (service role key bypasses RLS)
      const updateRes = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id, status: newStatus }),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(err.error || 'Failed to update ticket status');
      }

      // Derive a friendly first name from the email address
      const recipientEmail = ticket.submittedBy;
      const firstName = recipientEmail.split('@')[0]
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      // Build per-status email content
      const emailMap: Record<string, { subject: string; headline: string; body: string }> = {
        'in-progress': {
          subject: `Your bug report is being worked on 😉`,
          headline: `We're on it!`,
          body: `<p>Hey ${firstName},</p><p>Your bug report <strong>"${ticket.title}"</strong> is currently being worked on. We'll get back to you as soon as we solve it 😉</p><p>Thanks for your patience — the Tempas team has got you covered.</p>`,
        },
        closed: {
          subject: `Your bug report has been resolved ✅`,
          headline: `Issue Resolved`,
          body: `<p>Hey ${firstName},</p><p>Great news! Your bug report <strong>"${ticket.title}"</strong> has been resolved. Thanks for helping us make Tempas better — we truly appreciate it 🙌</p>`,
        },
        open: {
          subject: `Your bug report has been re-opened 🔄`,
          headline: `Ticket Re-opened`,
          body: `<p>Hey ${firstName},</p><p>Your bug report <strong>"${ticket.title}"</strong> has been re-opened for further investigation. We'll keep you updated on our progress.</p>`,
        },
      };

      const emailContent = emailMap[newStatus];
      if (emailContent) {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: emailContent.subject,
            headline: emailContent.headline,
            htmlBody: emailContent.body,
            ctaText: 'View on Tempas',
            ctaLink: process.env.NEXT_PUBLIC_APP_URL || 'https://tempas.io',
            recipients: [{ email: recipientEmail, name: firstName }],
            isRawHtml: false,
          }),
        });
        if (!res.ok) {
          console.error('Failed to send status notification email', await res.text());
        }
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      // Roll back the optimistic update on failure
      setCurrentStatus(ticket.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const dateStr =
    ticket.createdAt instanceof Date
      ? ticket.createdAt.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const timeStr =
    ticket.createdAt instanceof Date
      ? ticket.createdAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          {ticket.type === 'bug' ? (
            <IconBug size={20} color="#ef4444" />
          ) : (
            <IconBulb size={20} color="#D4A017" />
          )}
          <Text fw={600} size="lg">
            {ticket.title}
          </Text>
        </Group>
      }
      size="lg"
      centered
      overlayProps={{ backgroundOpacity: 0.4, blur: 8 }}
      styles={{
        content: {
          backdropFilter: 'blur(20px) saturate(180%)',
        },
      }}
    >
      <Stack gap="md">
        {/* Badges row */}
        <Group gap="sm">
          <Badge
            variant="light"
            size="md"
            styles={{
              root: {
                background:
                  ticket.type === 'bug'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(212, 160, 23, 0.1)',
                color: ticket.type === 'bug' ? '#ef4444' : '#D4A017',
                border: `1px solid ${ticket.type === 'bug' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(212, 160, 23, 0.2)'}`,
                textTransform: 'capitalize',
              },
            }}
          >
            {ticket.type === 'bug' ? 'Bug Report' : 'Feature Request'}
          </Badge>
          <Select
            size="xs"
            variant="filled"
            data={[
              { value: 'open', label: 'Open' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'closed', label: 'Closed' },
            ]}
            value={currentStatus}
            onChange={(value) => value && handleStatusChange(value)}
            disabled={isUpdating}
            rightSection={isUpdating ? <Loader size={14} /> : undefined}
            styles={{
              input: {
                backgroundColor: `${statusColors[currentStatus]}18`,
                color: statusColors[currentStatus],
                border: `1px solid ${statusColors[currentStatus]}30`,
                fontWeight: 600,
              }
            }}
          />
          <Badge
            size="md"
            variant="outline"
            leftSection={<IconFlag size={12} />}
            styles={{
              root: {
                color: priorityColors[ticket.priority],
                borderColor: `${priorityColors[ticket.priority]}40`,
                textTransform: 'capitalize',
              },
            }}
          >
            {ticket.priority} priority
          </Badge>
        </Group>

        <Divider opacity={0.1} />

        {/* Description */}
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
            Description
          </Text>
          <Text size="sm" lh={1.7} style={{ whiteSpace: 'pre-wrap' }}>
            {ticket.description}
          </Text>
        </Box>

        {ticket.screenshotUrl && (
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
              Attached Screenshot
            </Text>
            <Box style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={ticket.screenshotUrl} 
                alt="Ticket attachment" 
                style={{ width: '100%', display: 'block' }} 
              />
            </Box>
          </Box>
        )}

        <Divider opacity={0.1} />

        {/* Meta info */}
        <Group gap="xl">
          <Group gap={6}>
            <IconUser size={14} style={{ opacity: 0.5 }} />
            <Text size="sm" c="dimmed">
              Submitted by{' '}
              <Text component="span" fw={600} c="var(--mantine-color-text)">
                {ticket.submittedBy}
              </Text>
            </Text>
          </Group>
          <Group gap={6}>
            <IconClock size={14} style={{ opacity: 0.5 }} />
            <Text size="sm" c="dimmed">
              {dateStr} at {timeStr}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
