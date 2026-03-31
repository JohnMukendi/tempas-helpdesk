'use client';

import { Box, Text, Group } from '@mantine/core';
import classes from './StatCard.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}

export default function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <Box className={`${classes.card} glass-card`}>
      <div className={classes.iconWrap} style={{ background: gradient }}>
        {icon}
      </div>
      <Box>
        <Text className={classes.value}>{value}</Text>
        <Text className={classes.label}>{label}</Text>
      </Box>
    </Box>
  );
}
