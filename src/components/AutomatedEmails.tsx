'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Title, Text, Switch, TextInput, Button, Group, Loader, Center, Alert } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import '@mantine/tiptap/styles.css';

export default function AutomatedEmails() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState<{ text: string, color: string } | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', 'ticket_closed')
        .single();
      
      if (!error && data) {
        setEnabled(data.is_enabled || false);
        setSubject(data.subject || '');
        editor?.commands.setContent(data.body || '');
      }
      setLoading(false);
    }
    if (editor) {
      loadSettings();
    }
  }, [editor]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const body = editor?.getHTML() || '';
    const { error } = await supabase
      .from('email_templates')
      .update({
        is_enabled: enabled,
        subject: subject,
        body: body,
        updated_at: new Date().toISOString()
      })
      .eq('name', 'ticket_closed');

    if (error) {
      setMessage({ text: 'Failed to save settings: ' + error.message, color: 'red' });
    } else {
      setMessage({ text: 'Automated email settings saved successfully.', color: 'green' });
    }
    setSaving(false);
  };

  const insertVariable = (variable: string) => {
    editor?.chain().focus().insertContent(variable).run();
  };

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <Box p="md" className="glass-card" style={{ borderRadius: 12 }}>
      <Stack gap="xl">
        <Box>
          <Title order={3} fw={600} mb="xs">Ticket Closed Email</Title>
          <Text size="sm" c="dimmed">
            This email is automatically sent to the user when their ticket status is changed to "Closed".
          </Text>
        </Box>

        {message && (
          <Alert icon={<IconInfoCircle size={16} />} color={message.color} withCloseButton onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Switch
          label="Enable Automated Email"
          checked={enabled}
          onChange={(event) => setEnabled(event.currentTarget.checked)}
          size="md"
        />

        {enabled && (
          <Stack gap="md" mt="md">
            <TextInput
              label="Subject Line"
              placeholder="Your ticket has been closed"
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
            />
            
            <Box>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={500}>Email Body</Text>
                <Group gap="xs">
                  <Button size="compact-xs" variant="light" onClick={() => insertVariable('{{ticket_title}}')}>
                    Insert {'{{ticket_title}}'}
                  </Button>
                  <Button size="compact-xs" variant="light" onClick={() => insertVariable('{{ticket_type}}')}>
                    Insert {'{{ticket_type}}'}
                  </Button>
                </Group>
              </Group>
              <RichTextEditor editor={editor} style={{ minHeight: 250 }}>
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
              </RichTextEditor>
            </Box>
          </Stack>
        )}

        <Group justify="flex-end" mt="xl">
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            loading={saving}
            onClick={handleSave}
            color="warmGold"
          >
            Save Settings
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
