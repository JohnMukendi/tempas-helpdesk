'use client';

import { useEffect, useState } from 'react';
import { Modal, Text, Button, Box, TypographyStylesProvider, Image } from '@mantine/core';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AnnouncementsPopup() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (user) {
      checkAnnouncements();
    }
  }, [user]);

  const checkAnnouncements = async () => {
    // Fetch active announcements
    const { data: activeAnnouncements, error: activeError } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activeError || !activeAnnouncements || activeAnnouncements.length === 0) {
      return;
    }

    // Fetch seen announcements from local storage
    const seenAnnouncementsRaw = localStorage.getItem('seen_announcements') || '[]';
    let seenIds: Set<string>;
    try {
      seenIds = new Set(JSON.parse(seenAnnouncementsRaw));
    } catch {
      seenIds = new Set();
    }

    // Find the newest unseen announcement
    const unseen = activeAnnouncements.find((a) => !seenIds.has(a.id));

    if (unseen) {
      setAnnouncement(unseen);
      setOpened(true);
    }
  };

  const handleDismiss = () => {
    setOpened(false);
    if (announcement) {
      const seenAnnouncementsRaw = localStorage.getItem('seen_announcements') || '[]';
      try {
        const seenArr = JSON.parse(seenAnnouncementsRaw);
        seenArr.push(announcement.id);
        localStorage.setItem('seen_announcements', JSON.stringify(seenArr));
      } catch {
        localStorage.setItem('seen_announcements', JSON.stringify([announcement.id]));
      }
    }
  };

  if (!announcement) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleDismiss}
      title={<Text fw={700} size="lg">What's New!</Text>}
      centered
      size="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Box mb="xl">
        <Text fw={600} size="xl" mb="md" c="warmGold">
          {announcement.title}
        </Text>
        
        {announcement.gif_url && (
          <Box mb="md" style={{ borderRadius: 8, overflow: 'hidden' }}>
            <Image src={announcement.gif_url} alt="Feature preview" w="100%" />
          </Box>
        )}

        <TypographyStylesProvider>
          <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
        </TypographyStylesProvider>
      </Box>
      <Button fullWidth color="warmGold" onClick={handleDismiss}>
        Got it!
      </Button>
    </Modal>
  );
}
