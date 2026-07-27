'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Text,
  Group,
  Stack,
  Select,
  TextInput,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconSearch,
  IconBug,
  IconAlertTriangle,
} from '@tabler/icons-react';
import TicketCard from '@/components/TicketCard';
import TicketDetailModal from '@/components/TicketDetailModal';
import { useTickets } from '@/hooks/useTickets';
import type { Ticket } from '@/types/ticket';

export default function BugsPage() {
  const { bugReports, loading: ticketsLoading, error: ticketsError } = useTickets();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpened(true);
  };

  // Apply filters
  const applyFilters = (list: Ticket[]) => {
    let filtered = list;
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter) {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.submittedBy.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const filteredBugs = applyFilters(bugReports);

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
          Bug Reports
        </Text>
      </Box>

      {/* Filters  */}
      <Group gap="sm" mb="lg">
        <TextInput
          placeholder="Search bugs…"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
          radius="sm"
        />
        <Select
          placeholder="Status"
          data={[
            { value: 'open', label: 'Open' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'closed', label: 'Closed' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          radius="sm"
          style={{ width: 150 }}
        />
        <Select
          placeholder="Priority"
          data={[
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
          value={priorityFilter}
          onChange={setPriorityFilter}
          clearable
          radius="sm"
          style={{ width: 150 }}
        />
      </Group>

      {/* Loading / Error */}
      {ticketsLoading && (
        <Center py={60}>
          <Loader color="warmGold" size="lg" />
        </Center>
      )}

      {ticketsError && (
        <Center py={60}>
          <Group gap="sm">
            <IconAlertTriangle size={20} color="#ef4444" />
            <Text c="red" size="sm">
              Failed to load bugs: {ticketsError}
            </Text>
          </Group>
        </Center>
      )}

      {!ticketsLoading && !ticketsError && (
        <Box>
          <Group gap="sm" mb="md">
            <IconBug size={18} color="#ef4444" />
            <Text fw={600} size="sm">
              Bug Reports
            </Text>
            <Badge
              size="sm"
              variant="light"
              color="red"
              circle
            >
              {filteredBugs.length}
            </Badge>
          </Group>
          <Stack gap="sm">
            {filteredBugs.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No bug reports found
              </Text>
            ) : (
              filteredBugs.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => openTicket(ticket)}
                />
              ))
            )}
          </Stack>
        </Box>
      )}

      {/* Ticket detail modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </>
  );
}
