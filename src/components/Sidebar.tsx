'use client';

import {
  Box,
  Text,
  UnstyledButton,
  Stack,
  Divider,
  ActionIcon,
  useMantineColorScheme,
  Group,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconBulb,
  IconBug,
  IconSun,
  IconMoon,
  IconHelpCircle,
} from '@tabler/icons-react';
import classes from './Sidebar.module.css';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <UnstyledButton className={`${classes.navItem} ${active ? classes.navItemActive : ''}`} onClick={onClick}>
      <Group gap="sm">
        {icon}
        <Text size="sm" fw={active ? 600 : 400}>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Box className={`${classes.sidebar} glass`}>
      {/* Logo / Brand */}
      <Box className={classes.brand}>
        <Group gap="xs">
          <IconHelpCircle size={28} color="#D4A017" />
          <Box>
            <Text fw={700} size="lg" lh={1}>
              Tempas
            </Text>
            <Text size="xs" c="dimmed" lh={1} mt={2}>
              Help Desk
            </Text>
          </Box>
        </Group>
      </Box>

      <Divider my="sm" opacity={0.1} />

      {/* Navigation */}
      <Stack gap={4} style={{ flex: 1 }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} px="sm">
          Navigation
        </Text>
        <NavItem
          icon={<IconLayoutDashboard size={18} />}
          label="Dashboard"
          active={activeTab === 'all'}
          onClick={() => onTabChange('all')}
        />
        <NavItem
          icon={<IconBulb size={18} />}
          label="Feature Requests"
          active={activeTab === 'features'}
          onClick={() => onTabChange('features')}
        />
        <NavItem
          icon={<IconBug size={18} />}
          label="Bug Reports"
          active={activeTab === 'bugs'}
          onClick={() => onTabChange('bugs')}
        />
      </Stack>

      <Divider mb="sm" opacity={0.1} />

      {/* Footer */}
      <Group justify="space-between" px="sm" pb="sm">
        <Text size="xs" c="dimmed">
          {colorScheme === 'dark' ? 'Dark' : 'Light'} mode
        </Text>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => toggleColorScheme()}
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? (
            <IconSun size={18} color="#D4A017" />
          ) : (
            <IconMoon size={18} />
          )}
        </ActionIcon>
      </Group>
    </Box>
  );
}
