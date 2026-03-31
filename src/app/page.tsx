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
  IconBulb,
  IconTicket,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import TicketCard from '@/components/TicketCard';
import TicketDetailModal from '@/components/TicketDetailModal';
import LoginModal from '@/components/LoginModal';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/context/AuthContext';
import type { Ticket } from '@/types/ticket';
import classes from './page.module.css';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { tickets, featureRequests, bugReports, loading: ticketsLoading, error: ticketsError } = useTickets();
  
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  if (authLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader color="warmGold" size="xl" type="bars" />
      </Center>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpened(true);
  };

  // Pick the right list based on active tab
  let displayFeatures = featureRequests;
  let displayBugs = bugReports;

  if (activeTab === 'features') {
    displayBugs = [];
  } else if (activeTab === 'bugs') {
    displayFeatures = [];
  }

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

  const filteredFeatures = applyFilters(displayFeatures);
  const filteredBugs = applyFilters(displayBugs);

  // Stats
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const closedCount = tickets.filter((t) => t.status === 'closed').length;

  return (
    <>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <Box className={classes.main}>
        {/* Header */}
        <Box mb="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Tempas Help Desk
          </Text>
          <Text
            fw={700}
            style={{ fontSize: 28, lineHeight: 1.15 }}
            mt={4}
          >
            {activeTab === 'features'
              ? 'Feature Requests'
              : activeTab === 'bugs'
                ? 'Bug Reports'
                : 'Dashboard'}
          </Text>
        </Box>

        {/* Stat cards */}
        <div className={classes.statsGrid}>
          <StatCard
            icon={<IconTicket size={22} />}
            label="Total Tickets"
            value={tickets.length}
            gradient="linear-gradient(135deg, #D4A017, #b8900e)"
          />
          <StatCard
            icon={<IconBulb size={22} />}
            label="Features"
            value={featureRequests.length}
            gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)"
          />
          <StatCard
            icon={<IconBug size={22} />}
            label="Bugs"
            value={bugReports.length}
            gradient="linear-gradient(135deg, #ef4444, #dc2626)"
          />
          <StatCard
            icon={<IconCircleCheck size={22} />}
            label="Closed"
            value={closedCount}
            gradient="linear-gradient(135deg, #22c55e, #16a34a)"
          />
        </div>

        {/* Filters  */}
        <Group gap="sm" mb="lg" className={classes.filterBar}>
          <TextInput
            placeholder="Search tickets…"
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
                Failed to load tickets: {ticketsError}
              </Text>
            </Group>
          </Center>
        )}

        {/* Ticket columns */}
        {!ticketsLoading && !ticketsError && (
          <div className={classes.columns}>
            {/* Features column */}
            {(activeTab === 'all' || activeTab === 'features') && (
              <Box className={classes.column}>
                <Group gap="sm" mb="md">
                  <IconBulb size={18} color="#D4A017" />
                  <Text fw={600} size="sm">
                    Feature Requests
                  </Text>
                  <Badge
                    size="sm"
                    variant="light"
                    color="warmGold"
                    circle
                  >
                    {filteredFeatures.length}
                  </Badge>
                </Group>
                <Stack gap="sm">
                  {filteredFeatures.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      No feature requests found
                    </Text>
                  ) : (
                    filteredFeatures.map((ticket) => (
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

            {/* Bugs column */}
            {(activeTab === 'all' || activeTab === 'bugs') && (
              <Box className={classes.column}>
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
          </div>
        )}
      </Box>

      {/* Ticket detail modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </>
  );
}
