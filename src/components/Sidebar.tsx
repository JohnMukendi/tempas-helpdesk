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
  IconMail,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './Sidebar.module.css';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href: string;
}

function NavItem({ icon, label, active, href }: NavItemProps) {
  return (
    <UnstyledButton component={Link} href={href} className={`${classes.navItem} ${active ? classes.navItemActive : ''}`}>
      <Group gap="sm">
        {icon}
        <Text size="sm" fw={active ? 600 : 400}>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export default function Sidebar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const pathname = usePathname();

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
          href="/"
          active={pathname === '/'}
        />
        <NavItem
          icon={<IconBulb size={18} />}
          label="Feature Requests"
          href="/features"
          active={pathname === '/features'}
        />
        <NavItem
          icon={<IconBug size={18} />}
          label="Bug Reports"
          href="/bugs"
          active={pathname === '/bugs'}
        />

        <Divider my="sm" opacity={0.1} />
        
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} px="sm">
          Control Center
        </Text>
        <NavItem
          icon={<IconLayoutDashboard size={18} />}
          label="Mini Dashboard"
          href="/control-center/mini-dashboard"
          active={pathname === '/control-center/mini-dashboard'}
        />
        <NavItem
          icon={<IconBulb size={18} />}
          label="Announcements"
          href="/control-center/announcements"
          active={pathname === '/control-center/announcements'}
        />
        <NavItem
          icon={<IconMail size={18} />}
          label="Email Campaigns"
          href="/control-center/emails"
          active={pathname === '/control-center/emails'}
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
